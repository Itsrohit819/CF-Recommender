from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.config import Config
from routes.users import users_bp
from routes.problems import problems_bp
from routes.recommendations import recommendations_bp
from services.database import init_db

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Register blueprints
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(problems_bp, url_prefix='/api/problems')
app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')

@app.route('/')
def home():
    return jsonify({
        "message": "CF Recommender API",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
