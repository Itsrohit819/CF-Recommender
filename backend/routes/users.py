from flask import Blueprint, request, jsonify
from services.codeforces_api import cf_api
from services.database import get_db_connection

users_bp = Blueprint('users', __name__)

@users_bp.route('/<cf_handle>/recent-activity')
def recent_activity(cf_handle):
    from services.codeforces_api import cf_api
    submissions = cf_api.get_user_submissions(cf_handle, count=20) or []
    activity = []
    for sub in submissions:
        if 'problem' in sub and 'creationTimeSeconds' in sub:
            verdict = sub.get('verdict', 'UNKNOWN')
            problem = sub['problem']
            activity.append({
                'time': sub['creationTimeSeconds'],
                'problem': f"{problem.get('contestId', '')}{problem.get('index', '')} - {problem.get('name', '')}",
                'url': f"https://codeforces.com/contest/{problem.get('contestId')}/problem/{problem.get('index')}",
                'verdict': verdict
            })
    return jsonify({'activity': activity})


@users_bp.route('/add', methods=['POST'])
def add_user():
    data = request.get_json()
    cf_handle = data.get('cf_handle')
    
    if not cf_handle:
        return jsonify({'error': 'CF handle is required'}), 400
    
    # Verify user exists on Codeforces
    user_info = cf_api.get_user_info(cf_handle)
    if not user_info:
        return jsonify({'error': 'Invalid Codeforces handle'}), 400
    
    user_data = user_info[0]
    
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT OR REPLACE INTO users (cf_handle, rating, max_rating)
            VALUES (?, ?, ?)
        ''', (cf_handle, user_data.get('rating', 0), user_data.get('maxRating', 0)))
        conn.commit()
        
        return jsonify({
            'message': 'User added successfully',
            'user': {
                'cf_handle': cf_handle,
                'rating': user_data.get('rating', 0),
                'max_rating': user_data.get('maxRating', 0)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@users_bp.route('/<cf_handle>')
def get_user(cf_handle):
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE cf_handle = ?', (cf_handle,)
    ).fetchone()
    conn.close()
    
    if user:
        return jsonify(dict(user))
    else:
        return jsonify({'error': 'User not found'}), 404
