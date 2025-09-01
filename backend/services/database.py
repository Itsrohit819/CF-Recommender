import sqlite3
import os
from utils.config import Config

def get_db_connection():
    conn = sqlite3.connect('cf_recommender.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cf_handle TEXT UNIQUE NOT NULL,
            rating INTEGER,
            max_rating INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Problems table - Fixed with backticks around 'index'
    conn.execute('''
        CREATE TABLE IF NOT EXISTS problems (
            id INTEGER PRIMARY KEY,
            contest_id INTEGER,
            `index` TEXT,
            name TEXT NOT NULL,
            type TEXT,
            rating INTEGER,
            tags TEXT,
            solved_count INTEGER DEFAULT 0
        )
    ''')
    
    # User submissions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            problem_id INTEGER,
            verdict TEXT,
            submission_time TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (problem_id) REFERENCES problems (id)
        )
    ''')
    
    # Recommendations table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            problem_id INTEGER,
            score REAL,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (problem_id) REFERENCES problems (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")
