import json
import random
from collections import defaultdict, Counter
from datetime import datetime, timedelta
from services.database import get_db_connection
from services.codeforces_api import cf_api
import math



def analyze_user_performance(submissions):
    """Analyze user's submission history to identify strengths and weaknesses"""
    if not submissions:
        return {}
    
    # Initialize counters
    tag_stats = defaultdict(lambda: {'solved': 0, 'attempted': 0, 'accuracy': 0})
    rating_stats = defaultdict(lambda: {'solved': 0, 'attempted': 0})
    recent_performance = []
    
    # Analyze submissions
    for submission in submissions:
        if 'problem' not in submission:
            continue
            
        problem = submission['problem']
        verdict = submission.get('verdict', 'WRONG_ANSWER')
        tags = problem.get('tags', [])
        rating = problem.get('rating', 0)
        
        # Track by tags
        for tag in tags:
            tag_stats[tag]['attempted'] += 1
            if verdict == 'OK':
                tag_stats[tag]['solved'] += 1
        
        # Track by rating
        if rating > 0:
            rating_range = f"{(rating // 100) * 100}-{(rating // 100) * 100 + 99}"
            rating_stats[rating_range]['attempted'] += 1
            if verdict == 'OK':
                rating_stats[rating_range]['solved'] += 1
        
        # Recent performance (last 30 days)
        submission_time = datetime.fromtimestamp(submission.get('creationTimeSeconds', 0))
        if submission_time > datetime.now() - timedelta(days=30):
            recent_performance.append({
                'verdict': verdict,
                'rating': rating,
                'tags': tags
            })
    
    # Calculate accuracies
    for tag in tag_stats:
        if tag_stats[tag]['attempted'] > 0:
            tag_stats[tag]['accuracy'] = tag_stats[tag]['solved'] / tag_stats[tag]['attempted']
    
    for rating_range in rating_stats:
        if rating_stats[rating_range]['attempted'] > 0:
            rating_stats[rating_range]['accuracy'] = rating_stats[rating_range]['solved'] / rating_stats[rating_range]['attempted']
    
    # Identify weak areas (tags with low accuracy and sufficient attempts)
    weak_tags = []
    strong_tags = []
    
    for tag, stats in tag_stats.items():
        if stats['attempted'] >= 3:  # Minimum attempts to be considered
            if stats['accuracy'] < 0.4:  # Less than 40% accuracy
                weak_tags.append({
                    'tag': tag,
                    'accuracy': stats['accuracy'],
                    'attempted': stats['attempted'],
                    'solved': stats['solved']
                })
            elif stats['accuracy'] > 0.7:  # More than 70% accuracy
                strong_tags.append({
                    'tag': tag,
                    'accuracy': stats['accuracy'],
                    'attempted': stats['attempted'],
                    'solved': stats['solved']
                })
    
    # Sort by accuracy
    weak_tags.sort(key=lambda x: x['accuracy'])
    strong_tags.sort(key=lambda x: x['accuracy'], reverse=True)
    
    # Recent performance analysis
    recent_solved = sum(1 for sub in recent_performance if sub['verdict'] == 'OK')
    recent_total = len(recent_performance)
    recent_accuracy = recent_solved / recent_total if recent_total > 0 else 0
    
    return {
        'tag_stats': dict(tag_stats),
        'rating_stats': dict(rating_stats),
        'weak_tags': [tag['tag'] for tag in weak_tags[:5]],
        'strong_tags': [tag['tag'] for tag in strong_tags[:5]],
        'weak_tags_detailed': weak_tags[:5],
        'strong_tags_detailed': strong_tags[:5],
        'recent_performance': {
            'total_submissions': recent_total,
            'solved': recent_solved,
            'accuracy': recent_accuracy
        },
        'total_submissions': len(submissions),
        'unique_problems_attempted': len(set(sub['problem']['name'] for sub in submissions if 'problem' in sub))
    }

def get_user_solved_problems(cf_handle):
    """Get list of problems solved by user"""
    submissions = cf_api.get_user_submissions(cf_handle, count=200)
    if not submissions:
        return set()
    
    solved_problems = set()
    for submission in submissions:
        if submission.get('verdict') == 'OK' and 'problem' in submission:
            problem = submission['problem']
            problem_key = f"{problem['contestId']}-{problem['index']}"
            solved_problems.add(problem_key)
    
    return solved_problems

def get_recommendations(cf_handle, count=5, method='simple'):
    """Generate problem recommendations for a user"""
    try:
        conn = get_db_connection()
        
        # Check if user exists
        user = conn.execute(
            'SELECT * FROM users WHERE cf_handle = ?', (cf_handle,)
        ).fetchone()
        
        if not user:
            conn.close()
            return None
        
        user_rating = user['rating'] or 1200
        
        # Get user's solved problems
        solved_problems = get_user_solved_problems(cf_handle)
        
        # Get candidate problems (rating range: user_rating ± 300)
        rating_min = max(800, user_rating - 300)
        rating_max = user_rating + 400
        
        problems = conn.execute('''
            SELECT * FROM problems
            WHERE rating BETWEEN ? AND ?
            ORDER BY RANDOM()
            LIMIT 50
        ''', (rating_min, rating_max)).fetchall()
        
        conn.close()
        
        if not problems:
            return None
        
        # Filter out solved problems and score
        recommendations = []
        for problem in problems:
            problem_dict = dict(problem)
            problem_key = f"{problem_dict['contest_id']}-{problem_dict['index']}"
            
            # Skip if already solved
            if problem_key in solved_problems:
                continue
            
            # Simple scoring based on rating difference
            rating_diff = abs(problem_dict['rating'] - user_rating)
            if rating_diff <= 100:
                score = 1.0
                reason = "Perfect difficulty match"
            elif rating_diff <= 200:
                score = 0.8
                reason = "Good difficulty match"
            else:
                score = 0.5
                reason = "Challenging problem"
            
            problem_dict['tags'] = json.loads(problem_dict['tags']) if problem_dict['tags'] else []
            problem_dict['url'] = f"https://codeforces.com/contest/{problem_dict['contest_id']}/problem/{problem_dict['index']}"
            problem_dict['score'] = score
            problem_dict['reason'] = reason
            problem_dict['problem_id'] = problem_dict['id']
            recommendations.append(problem_dict)
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:count]
        
    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        return None

# Simple recommendation engine class
class CFRecommendationEngine:
    def __init__(self):
        self.user_item_matrix = None
    
    def get_collaborative_recommendations(self, cf_handle, count=5):
        """Simple collaborative filtering fallback"""
        return []
    
    def build_user_item_matrix(self):
        """Build user-item matrix (simplified)"""
        return None

# Global recommendation engine instance
recommendation_engine = CFRecommendationEngine()
