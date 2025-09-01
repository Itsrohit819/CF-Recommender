from flask import Blueprint, request, jsonify
from services.codeforces_api import cf_api
from services.database import get_db_connection
import json

problems_bp = Blueprint('problems', __name__)

@problems_bp.route('/fetch-latest', methods=['POST'])
def fetch_latest_problems():
    """Fetch latest problems from Codeforces"""
    try:
        # Get recent contests
        contests = cf_api.get_contest_list()
        if not contests:
            return jsonify({'error': 'Failed to fetch contests'}), 500
        
        # Get recent contests (last 10)
        recent_contests = [c for c in contests if c.get('phase') == 'FINISHED'][:10]
        
        conn = get_db_connection()
        new_problems = 0
        
        for contest in recent_contests:
            contest_id = contest['id']
            
            # Skip gym contests
            if contest_id > 100000:
                continue
            
            # Check if we already have problems from this contest
            existing = conn.execute(
                'SELECT COUNT(*) as count FROM problems WHERE contest_id = ?',
                (contest_id,)
            ).fetchone()
            
            if existing['count'] > 0:
                continue  # Skip if already have problems from this contest
            
            print(f"Fetching problems from contest {contest_id}...")
            
            # This is a simplified approach - in reality, you'd need to scrape
            # or use contest-specific API calls
            
        conn.close()
        
        return jsonify({
            'message': f'Checked {len(recent_contests)} recent contests',
            'new_problems': new_problems
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@problems_bp.route('/search')
def search_problems():
    """Advanced problem search with multiple filters"""
    # Get query parameters
    rating_min = request.args.get('rating_min', type=int)
    rating_max = request.args.get('rating_max', type=int)
    tags = request.args.get('tags', '').split(',') if request.args.get('tags') else []
    contest_id = request.args.get('contest_id', type=int)
    solved_min = request.args.get('solved_min', type=int)
    solved_max = request.args.get('solved_max', type=int)
    limit = min(request.args.get('limit', 20, type=int), 100)  # Max 100
    offset = request.args.get('offset', 0, type=int)
    
    conn = get_db_connection()
    
    # Build dynamic query
    query = 'SELECT * FROM problems WHERE rating IS NOT NULL'
    params = []
    
    if rating_min:
        query += ' AND rating >= ?'
        params.append(rating_min)
    
    if rating_max:
        query += ' AND rating <= ?'
        params.append(rating_max)
    
    if contest_id:
        query += ' AND contest_id = ?'
        params.append(contest_id)
    
    if solved_min:
        query += ' AND solved_count >= ?'
        params.append(solved_min)
    
    if solved_max:
        query += ' AND solved_count <= ?'
        params.append(solved_max)
    
    # Handle tags
    for tag in tags:
        if tag.strip():
            query += ' AND tags LIKE ?'
            params.append(f'%"{tag.strip()}"%')
    
    # Add ordering and pagination
    query += ' ORDER BY solved_count DESC LIMIT ? OFFSET ?'
    params.extend([limit, offset])
    
    problems = conn.execute(query, params).fetchall()
    
    # Get total count for pagination
    count_query = query.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0]
    total_count = conn.execute(count_query, params[:-2]).fetchone()[0]
    
    conn.close()
    
    # Format results
    result = []
    for problem in problems:
        problem_dict = dict(problem)
        problem_dict['tags'] = json.loads(problem_dict['tags']) if problem_dict['tags'] else []
        problem_dict['url'] = f"https://codeforces.com/contest/{problem_dict['contest_id']}/problem/{problem_dict['index']}"
        result.append(problem_dict)
    
    return jsonify({
        'problems': result,
        'pagination': {
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'has_more': offset + limit < total_count
        },
        'filters_applied': {
            'rating_range': [rating_min, rating_max],
            'tags': [tag for tag in tags if tag.strip()],
            'contest_id': contest_id,
            'solved_range': [solved_min, solved_max]
        }
    })

@problems_bp.route('/trending')
def get_trending_problems():
    """Get trending problems (most solved recently)"""
    limit = min(request.args.get('limit', 10, type=int), 50)
    rating_min = request.args.get('rating_min', 1000, type=int)
    rating_max = request.args.get('rating_max', 2500, type=int)
    
    conn = get_db_connection()
    
    problems = conn.execute('''
        SELECT * FROM problems
        WHERE rating BETWEEN ? AND ?
        AND solved_count > 100
        ORDER BY solved_count DESC
        LIMIT ?
    ''', (rating_min, rating_max, limit)).fetchall()
    
    conn.close()
    
    result = []
    for problem in problems:
        problem_dict = dict(problem)
        problem_dict['tags'] = json.loads(problem_dict['tags']) if problem_dict['tags'] else []
        problem_dict['url'] = f"https://codeforces.com/contest/{problem_dict['contest_id']}/problem/{problem_dict['index']}"
        result.append(problem_dict)
    
    return jsonify({
        'problems': result,
        'criteria': 'Most solved problems',
        'rating_range': [rating_min, rating_max]
    })

@problems_bp.route('/tags')
def get_available_tags():
    """Get all available problem tags with counts"""
    conn = get_db_connection()
    
    # Get all tags
    problems = conn.execute('SELECT tags FROM problems WHERE tags IS NOT NULL').fetchall()
    conn.close()
    
    tag_counts = {}
    for problem in problems:
        tags = json.loads(problem['tags']) if problem['tags'] else []
        for tag in tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    # Sort by frequency
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
    
    return jsonify({
        'tags': [{'name': tag, 'count': count} for tag, count in sorted_tags],
        'total_unique_tags': len(sorted_tags)
    })
