from services.database import get_db_connection
import json
from datetime import datetime

class Recommendation:
    def __init__(self, id=None, user_id=None, problem_id=None, score=None, reason=None, created_at=None):
        self.id = id
        self.user_id = user_id
        self.problem_id = problem_id
        self.score = score
        self.reason = reason
        self.created_at = created_at

    @staticmethod
    def create(user_id, problem_id, score, reason):
        """Create a new recommendation"""
        conn = get_db_connection()
        cursor = conn.execute('''
            INSERT INTO recommendations (user_id, problem_id, score, reason)
            VALUES (?, ?, ?, ?)
        ''', (user_id, problem_id, score, reason))
        
        recommendation_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return recommendation_id

    @staticmethod
    def get_by_user(user_id, limit=10):
        """Get recommendations for a user"""
        conn = get_db_connection()
        recommendations = conn.execute('''
            SELECT r.*, p.contest_id, p.index, p.name, p.rating, p.tags
            FROM recommendations r
            JOIN problems p ON r.problem_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
            LIMIT ?
        ''', (user_id, limit)).fetchall()
        conn.close()
        
        result = []
        for rec in recommendations:
            rec_dict = dict(rec)
            rec_dict['tags'] = json.loads(rec_dict['tags']) if rec_dict['tags'] else []
            rec_dict['url'] = f"https://codeforces.com/contest/{rec_dict['contest_id']}/problem/{rec_dict['index']}"
            result.append(rec_dict)
        
        return result

    @staticmethod
    def get_daily_recommendations(user_id, date=None):
        """Get daily recommendations for a user"""
        if date is None:
            date = datetime.now().date()
        
        conn = get_db_connection()
        recommendations = conn.execute('''
            SELECT r.*, p.contest_id, p.index, p.name, p.rating, p.tags
            FROM recommendations r
            JOIN problems p ON r.problem_id = p.id
            WHERE r.user_id = ? AND DATE(r.created_at) = ?
            ORDER BY r.score DESC
        ''', (user_id, date)).fetchall()
        conn.close()
        
        result = []
        for rec in recommendations:
            rec_dict = dict(rec)
            rec_dict['tags'] = json.loads(rec_dict['tags']) if rec_dict['tags'] else []
            rec_dict['url'] = f"https://codeforces.com/contest/{rec_dict['contest_id']}/problem/{rec_dict['index']}"
            result.append(rec_dict)
        
        return result

    @staticmethod
    def delete_old_recommendations(days=30):
        """Delete recommendations older than specified days"""
        conn = get_db_connection()
        conn.execute('''
            DELETE FROM recommendations 
            WHERE created_at < datetime('now', '-{} days')
        '''.format(days))
        conn.commit()
        conn.close()

    @staticmethod
    def get_recommendation_stats(user_id):
        """Get recommendation statistics for a user"""
        conn = get_db_connection()
        
        stats = conn.execute('''
            SELECT 
                COUNT(*) as total_recommendations,
                COUNT(DISTINCT DATE(created_at)) as days_active,
                AVG(score) as avg_score,
                MAX(created_at) as last_recommendation
            FROM recommendations
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        conn.close()
        
        return dict(stats) if stats else {}

    def to_dict(self):
        """Convert recommendation to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'problem_id': self.problem_id,
            'score': self.score,
            'reason': self.reason,
            'created_at': self.created_at
        }
