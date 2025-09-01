import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///cf_recommender.db'
    CODEFORCES_API_BASE = 'https://codeforces.com/api'
    DEBUG = True
