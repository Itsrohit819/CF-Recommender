from services.database import get_db_connection
from services.codeforces_api import cf_api
from datetime import datetime

class User:
    def __init__(self, id=None, cf_handle=None, rating=None, max_rating=None, created_at=None, last_updated=None):
        self.id = id
        self.cf_handle = cf_handle
        self.rating = rating
        self.max_rating = max_rating
        self.created_at = created_at
        self.last_updated = last_updated

    @staticmethod
    def create(cf_handle):
        """Create a new user by fetching data from Codeforces"""
        # Verify user exists on Codeforces
        user_info = cf_api.get_user_info(cf_handle)
        if not user_info:
            return None
        
        user_data = user_info[0]
        
        conn = get_db_connection()
        cursor = conn.execute('''
            INSERT OR REPLACE INTO users (cf_handle, rating, max_rating, last_updated)
            VALUES (?, ?, ?, ?)
        ''', (
            cf_handle,
            user_data.get('rating', 0),
            user_data.get('maxRating', 0),
            datetime.now()
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return User.get_by_handle(cf_handle)

    @staticmethod
    def get_by_handle(cf_handle):
        """Get user by Codeforces handle"""
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE cf_handle = ?', (cf_handle,)
        ).fetchone()
        conn.close()
        
        if user:
            return User(
                id=user['id'],
                cf_handle=user['cf_handle'],
                rating=user['rating'],
                max_rating=user['max_rating'],
                created_at=user['created_at'],
                last_updated=user['last_updated']
            )
        return None

    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE id = ?', (user_id,)
        ).fetchone()
        conn.close()
        
        if user:
            return User(
                id=user['id'],
                cf_handle=user['cf_handle'],
                rating=user['rating'],
                max_rating=user['max_rating'],
                created_at=user['created_at'],
                last_updated=user['last_updated']
            )
        return None

    @staticmethod
    def get_all():
        """Get all users"""
        conn = get_db_connection()
        users = conn.execute('SELECT * FROM users ORDER BY rating DESC').fetchall()
        conn.close()
        
        return [User(
            id=user['id'],
            cf_handle=user['cf_handle'],
            rating=user['rating'],
            max_rating=user['max_rating'],
            created_at=user['created_at'],
            last_updated=user['last_updated']
        ) for user in users]

    def update_rating(self):
        """Update user rating from Codeforces"""
        user_info = cf_api.get_user_info(self.cf_handle)
        if user_info:
            user_data = user_info[0]
            self.rating = user_data.get('rating', self.rating)
            self.max_rating = user_data.get('maxRating', self.max_rating)
            self.last_updated = datetime.now()
            
            conn = get_db_connection()
            conn.execute('''
                UPDATE users 
                SET rating = ?, max_rating = ?, last_updated = ?
                WHERE id = ?
            ''', (self.rating, self.max_rating, self.last_updated, self.id))
            conn.commit()
            conn.close()
            
            return True
        return False

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'cf_handle': self.cf_handle,
            'rating': self.rating,
            'max_rating': self.max_rating,
            'created_at': self.created_at,
            'last_updated': self.last_updated
        }
