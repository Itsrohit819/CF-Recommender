from services.database import get_db_connection
import json

class Problem:
    def __init__(self, id=None, contest_id=None, index=None, name=None, type=None, rating=None, tags=None, solved_count=None):
        self.id = id
        self.contest_id = contest_id
        self.index = index
        self.name = name
        self.type = type
        self.rating = rating
        self.tags = tags if isinstance(tags, list) else (json.loads(tags) if tags else [])
        self.solved_count = solved_count

    @staticmethod
    def create(contest_id, index, name, type, rating, tags, solved_count=0):
        """Create a new problem"""
        problem_id = contest_id * 100 + ord(index[0]) - ord('A')
        if len(index) > 1 and index[1:].isdigit():
            problem_id += int(index[1:])
        
        conn = get_db_connection()
        conn.execute('''
            INSERT OR REPLACE INTO problems 
            (id, contest_id, `index`, name, type, rating, tags, solved_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            problem_id,
            contest_id,
            index,
            name,
            type,
            rating,
            json.dumps(tags) if isinstance(tags, list) else tags,
            solved_count
        ))
        conn.commit()
        conn.close()
        
        return problem_id

    @staticmethod
    def get_by_id(problem_id):
        """Get problem by ID"""
        conn = get_db_connection()
        problem = conn.execute(
            'SELECT * FROM problems WHERE id = ?', (problem_id,)
        ).fetchone()
        conn.close()
        
        if problem:
            return Problem(
                id=problem['id'],
                contest_id=problem['contest_id'],
                index=problem['index'],
                name=problem['name'],
                type=problem['type'],
                rating=problem['rating'],
                tags=problem['tags'],
                solved_count=problem['solved_count']
            )
        return None

    @staticmethod
    def search(rating_min=None, rating_max=None, tags=None, limit=20, offset=0):
        """Search problems with filters"""
        conn = get_db_connection()
        
        query = 'SELECT * FROM problems WHERE rating IS NOT NULL'
        params = []
        
        if rating_min:
            query += ' AND rating >= ?'
            params.append(rating_min)
        
        if rating_max:
            query += ' AND rating <= ?'
            params.append(rating_max)
        
        if tags:
            for tag in tags:
                if tag.strip():
                    query += ' AND tags LIKE ?'
                    params.append(f'%"{tag.strip()}"%')
        
        query += ' ORDER BY solved_count DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        problems = conn.execute(query, params).fetchall()
        conn.close()
        
        return [Problem(
            id=p['id'],
            contest_id=p['contest_id'],
            index=p['index'],
            name=p['name'],
            type=p['type'],
            rating=p['rating'],
            tags=p['tags'],
            solved_count=p['solved_count']
        ) for p in problems]

    def to_dict(self):
        """Convert problem to dictionary"""
        return {
            'id': self.id,
            'contest_id': self.contest_id,
            'index': self.index,
            'name': self.name,
            'type': self.type,
            'rating': self.rating,
            'tags': self.tags,
            'solved_count': self.solved_count,
            'url': f"https://codeforces.com/contest/{self.contest_id}/problem/{self.index}"
        }
