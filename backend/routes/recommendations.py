from flask import Blueprint, request, jsonify
from services.codeforces_api import cf_api
from services.database import get_db_connection
from services.ml_service import get_recommendations, analyze_user_performance, recommendation_engine
import json
from datetime import datetime, timedelta

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/analyze/<cf_handle>')
def analyze_user(cf_handle):
    """Analyze user's performance and weaknesses"""
    try:
        # Get user submissions from Codeforces
        submissions = cf_api.get_user_submissions(cf_handle, count=100)
        
        if not submissions:
            return jsonify({'error': 'Could not fetch user submissions'}), 500
        
        analysis = analyze_user_performance(submissions)
        
        return jsonify({
            'cf_handle': cf_handle,
            'analysis': analysis,
            'total_submissions': len(submissions)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@recommendations_bp.route('/ml/<cf_handle>')
def get_ml_recommendations(cf_handle):
    """Get ML-based recommendations"""
    method = request.args.get('method', 'hybrid')  # hybrid, collaborative, content
    count = min(request.args.get('count', 5, type=int), 10)
    
    try:
        recommendations = get_recommendations(cf_handle, count, method)
        
        if not recommendations:
            return jsonify({'error': 'Could not generate recommendations'}), 500
        
        return jsonify({
            'recommendations': recommendations,
            'method': method,
            'generated_at': datetime.now().isoformat(),
            'cf_handle': cf_handle
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recommendations_bp.route('/build-model', methods=['POST'])
def build_recommendation_model():
    """Build/rebuild the recommendation model"""
    try:
        # Build user-item matrix
        matrix = recommendation_engine.build_user_item_matrix()
        
        if matrix is not None:
            users_count = len(matrix.index)
            items_count = len(matrix.columns)
            sparsity = (matrix == 0).sum().sum() / (users_count * items_count)
            
            return jsonify({
                'message': 'Model built successfully',
                'users_count': users_count,
                'items_count': items_count,
                'sparsity': f"{sparsity:.2%}",
                'matrix_shape': list(matrix.shape)
            })
        else:
            return jsonify({'error': 'Failed to build model'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recommendations_bp.route('/similar-users/<cf_handle>')
def get_similar_users(cf_handle):
    """Get users similar to the given user"""
    try:
        if recommendation_engine.user_item_matrix is None:
            recommendation_engine.build_user_item_matrix()
        
        similarities = recommendation_engine.compute_user_similarity(cf_handle)
        
        # Get top 10 similar users
        similar_users = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Get user details
        conn = get_db_connection()
        detailed_users = []
        
        for user_handle, similarity in similar_users:
            user_info = conn.execute(
                'SELECT cf_handle, rating, max_rating FROM users WHERE cf_handle = ?',
                (user_handle,)
            ).fetchone()
            
            if user_info:
                detailed_users.append({
                    'cf_handle': user_info['cf_handle'],
                    'rating': user_info['rating'],
                    'max_rating': user_info['max_rating'],
                    'similarity': similarity
                })
        
        conn.close()
        
        return jsonify({
            'similar_users': detailed_users,
            'target_user': cf_handle
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recommendations_bp.route('/explain/<cf_handle>/<int:problem_id>')
def explain_recommendation(cf_handle, problem_id):
    """Explain why a problem was recommended"""
    try:
        conn = get_db_connection()
        
        # Get problem details
        problem = conn.execute(
            'SELECT * FROM problems WHERE id = ?', (problem_id,)
        ).fetchone()
        
        if not problem:
            return jsonify({'error': 'Problem not found'}), 404
        
        # Get user info
        user = conn.execute(
            'SELECT * FROM users WHERE cf_handle = ?', (cf_handle,)
        ).fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_rating = user['rating'] or 1200
        problem_rating = problem['rating']
        problem_tags = json.loads(problem['tags']) if problem['tags'] else []
        
        # Analyze user performance
        submissions = cf_api.get_user_submissions(cf_handle, count=100)
        analysis = analyze_user_performance(submissions) if submissions else {}
        
        # Generate explanation
        explanations = []
        
        # Rating-based explanation
        rating_diff = abs(problem_rating - user_rating)
        if rating_diff <= 100:
            explanations.append(f"Perfect difficulty match (±{rating_diff} from your rating)")
        elif rating_diff <= 200:
            explanations.append(f"Good difficulty level ({rating_diff} points from your rating)")
        else:
            explanations.append(f"Challenging problem ({rating_diff} points from your rating)")
        
        # Tag-based explanation
        weak_tags = analysis.get('weak_tags', [])
        strong_tags = analysis.get('strong_tags', [])
        
        weak_matches = [tag for tag in problem_tags if tag in weak_tags]
        strong_matches = [tag for tag in problem_tags if tag in strong_tags]
        
        if weak_matches:
            explanations.append(f"Helps improve weak areas: {', '.join(weak_matches)}")
        
        if strong_matches:
            explanations.append(f"Builds on your strengths: {', '.join(strong_matches)}")
        
        # Popularity explanation
        if problem['solved_count'] > 1000:
            explanations.append("Popular and well-tested problem")
        elif problem['solved_count'] < 100:
            explanations.append("Less common problem for variety")
        
        conn.close()
        
        return jsonify({
            'problem': {
                'id': problem['id'],
                'name': problem['name'],
                'contest_id': problem['contest_id'],
                'index': problem['index'],
                'rating': problem['rating'],
                'tags': problem_tags,
                'solved_count': problem['solved_count']
            },
            'user': {
                'cf_handle': cf_handle,
                'rating': user_rating
            },
            'explanations': explanations,
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
