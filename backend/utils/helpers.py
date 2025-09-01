import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

def validate_cf_handle(handle: str) -> bool:
    """
    Validate Codeforces handle format
    Rules: 3-24 characters, letters, digits, underscore, hyphen
    """
    if not handle or len(handle) < 3 or len(handle) > 24:
        return False
    
    # CF handles can contain letters, digits, underscore, hyphen
    pattern = r'^[a-zA-Z0-9_-]+$'
    return bool(re.match(pattern, handle))

def get_rating_color(rating: int) -> str:
    """Get color code based on Codeforces rating"""
    if rating < 1200:
        return '#808080'  # Gray - Newbie
    elif rating < 1400:
        return '#008000'  # Green - Pupil
    elif rating < 1600:
        return '#03A89E'  # Cyan - Specialist
    elif rating < 1900:
        return '#0000FF'  # Blue - Expert
    elif rating < 2100:
        return '#AA00AA'  # Purple - Candidate Master
    elif rating < 2400:
        return '#FF8C00'  # Orange - Master
    else:
        return '#FF0000'  # Red - Grandmaster

def get_rating_title(rating: int) -> str:
    """Get title based on Codeforces rating"""
    if rating < 1200:
        return 'Newbie'
    elif rating < 1400:
        return 'Pupil'
    elif rating < 1600:
        return 'Specialist'
    elif rating < 1900:
        return 'Expert'
    elif rating < 2100:
        return 'Candidate Master'
    elif rating < 2400:
        return 'Master'
    elif rating < 2600:
        return 'International Master'
    elif rating < 3000:
        return 'Grandmaster'
    else:
        return 'Legendary Grandmaster'

def calculate_difficulty_range(user_rating: int) -> tuple:
    """Calculate recommended problem difficulty range for user"""
    min_rating = max(800, user_rating - 200)
    max_rating = user_rating + 300
    return min_rating, max_rating

def format_time_ago(timestamp: datetime) -> str:
    """Format timestamp to human readable 'time ago' format"""
    now = datetime.now()
    diff = now - timestamp
    
    if diff.days > 0:
        if diff.days == 1:
            return "1 day ago"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 30:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        else:
            months = diff.days // 30
            return f"{months} month{'s' if months > 1 else ''} ago"
    
    hours = diff.seconds // 3600
    if hours > 0:
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    
    minutes = diff.seconds // 60
    if minutes > 0:
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    
    return "Just now"

def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """Safely load JSON string with fallback"""
    try:
        return json.loads(json_str) if json_str else default
    except (json.JSONDecodeError, TypeError):
        return default

def safe_json_dumps(obj: Any, default: str = "[]") -> str:
    """Safely dump object to JSON string with fallback"""
    try:
        return json.dumps(obj) if obj is not None else default
    except (TypeError, ValueError):
        return default

def calculate_accuracy(solved: int, attempted: int) -> float:
    """Calculate accuracy percentage"""
    return (solved / attempted * 100) if attempted > 0 else 0.0

def get_problem_difficulty_label(rating: int) -> str:
    """Get difficulty label for problem rating"""
    if rating < 1000:
        return "Easy"
    elif rating < 1400:
        return "Medium"
    elif rating < 1800:
        return "Hard"
    else:
        return "Very Hard"

def normalize_tag_name(tag: str) -> str:
    """Normalize tag name for consistency"""
    # Replace common variations
    tag_mapping = {
        'dp': 'dynamic programming',
        'dfs and similar': 'dfs',
        'bfs': 'breadth-first search',
        'dsu': 'disjoint set union',
        'number theory': 'math',
        'constructive algorithms': 'constructive',
        'graph matchings': 'graphs'
    }
    
    return tag_mapping.get(tag.lower(), tag.lower())

def group_problems_by_rating(problems: List[Dict]) -> Dict[str, List[Dict]]:
    """Group problems by rating ranges"""
    groups = {
        '800-999': [],
        '1000-1199': [],
        '1200-1399': [],
        '1400-1599': [],
        '1600-1799': [],
        '1800-1999': [],
        '2000+': []
    }
    
    for problem in problems:
        rating = problem.get('rating', 0)
        if rating < 1000:
            groups['800-999'].append(problem)
        elif rating < 1200:
            groups['1000-1199'].append(problem)
        elif rating < 1400:
            groups['1200-1399'].append(problem)
        elif rating < 1600:
            groups['1400-1599'].append(problem)
        elif rating < 1800:
            groups['1600-1799'].append(problem)
        elif rating < 2000:
            groups['1800-1999'].append(problem)
        else:
            groups['2000+'].append(problem)
    
    return groups

def calculate_progress_score(current_rating: int, max_rating: int, problems_solved: int) -> float:
    """Calculate overall progress score (0-100)"""
    # Rating progress (40% weight)
    rating_score = min(100, (current_rating / 2400) * 100) * 0.4
    
    # Max rating achievement (30% weight)
    max_rating_score = min(100, (max_rating / 2400) * 100) * 0.3
    
    # Problems solved (30% weight)
    problems_score = min(100, (problems_solved / 500) * 100) * 0.3
    
    return rating_score + max_rating_score + problems_score

def get_recommendation_reason(problem_rating: int, user_rating: int, problem_tags: List[str], weak_tags: List[str]) -> str:
    """Generate recommendation reason"""
    reasons = []
    
    # Rating-based reason
    rating_diff = abs(problem_rating - user_rating)
    if rating_diff <= 100:
        reasons.append("Perfect difficulty match")
    elif rating_diff <= 200:
        reasons.append("Good practice level")
    else:
        reasons.append("Challenging problem")
    
    # Tag-based reason
    matching_weak_tags = [tag for tag in problem_tags if tag in weak_tags]
    if matching_weak_tags:
        reasons.append(f"Improves {matching_weak_tags[0]} skills")
    
    return "; ".join(reasons[:2])  # Return top 2 reasons

def paginate_results(items: List[Any], page: int = 1, per_page: int = 20) -> Dict:
    """Paginate a list of items"""
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'items': items[start:end],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'has_prev': page > 1,
            'has_next': end < total
        }
    }

def filter_recent_submissions(submissions: List[Dict], days: int = 30) -> List[Dict]:
    """Filter submissions from last N days"""
    cutoff_time = datetime.now() - timedelta(days=days)
    
    recent = []
    for submission in submissions:
        submission_time = datetime.fromtimestamp(
            submission.get('creationTimeSeconds', 0)
        )
        if submission_time >= cutoff_time:
            recent.append(submission)
    
    return recent

def calculate_streak(submissions: List[Dict]) -> int:
    """Calculate current solving streak in days"""
    if not submissions:
        return 0
    
    # Sort by date (newest first)
    sorted_submissions = sorted(
        submissions,
        key=lambda x: x.get('creationTimeSeconds', 0),
        reverse=True
    )
    
    # Get unique solving dates
    solving_dates = set()
    for submission in sorted_submissions:
        if submission.get('verdict') == 'OK':
            date = datetime.fromtimestamp(
                submission.get('creationTimeSeconds', 0)
            ).date()
            solving_dates.add(date)
    
    if not solving_dates:
        return 0
    
    # Calculate streak
    sorted_dates = sorted(solving_dates, reverse=True)
    streak = 0
    current_date = datetime.now().date()
    
    for date in sorted_dates:
        if (current_date - date).days == streak:
            streak += 1
        else:
            break
    
    return streak

def generate_problem_id(contest_id: int, index: str) -> int:
    """Generate unique problem ID from contest ID and index"""
    base_id = contest_id * 100
    
    # Add index offset
    if index:
        base_id += ord(index[0].upper()) - ord('A')
        
        # Handle numbered indices like A1, A2
        if len(index) > 1 and index[1:].isdigit():
            base_id += int(index[1:])
    
    return base_id

def format_large_number(num: int) -> str:
    """Format large numbers with K, M suffixes"""
    if num >= 1000000:
        return f"{num / 1000000:.1f}M"
    elif num >= 1000:
        return f"{num / 1000:.1f}K"
    else:
        return str(num)

def is_contest_time(contest_start: int, contest_duration: int) -> bool:
    """Check if contest is currently running"""
    now = datetime.now().timestamp()
    contest_end = contest_start + contest_duration
    return contest_start <= now <= contest_end

def get_next_rating_milestone(current_rating: int) -> tuple:
    """Get next rating milestone and points needed"""
    milestones = [1200, 1400, 1600, 1900, 2100, 2400, 2600, 3000]
    
    for milestone in milestones:
        if current_rating < milestone:
            return milestone, milestone - current_rating
    
    return None, 0  # Already at highest level
