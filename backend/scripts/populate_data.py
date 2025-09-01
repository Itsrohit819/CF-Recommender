import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.codeforces_api import cf_api
from services.database import get_db_connection
import json
import time

def populate_problems():
    """Fetch problems from Codeforces and populate database"""
    print("Fetching problems from Codeforces API...")
    
    # Get problemset
    problemset = cf_api.get_problemset()
    if not problemset:
        print("Failed to fetch problemset")
        return False
    
    problems = problemset.get('problems', [])
    problem_stats = problemset.get('problemStatistics', [])
    
    print(f"Found {len(problems)} problems")
    
    # Create stats mapping
    stats_map = {}
    for stat in problem_stats:
        key = f"{stat['contestId']}-{stat['index']}"
        stats_map[key] = stat['solvedCount']
    
    conn = get_db_connection()
    inserted_count = 0
    skipped_count = 0
    
    for i, problem in enumerate(problems):
        try:
            # Skip problems without rating
            if 'rating' not in problem:
                skipped_count += 1
                continue
            
            # Skip gym problems
            if problem['contestId'] > 100000:
                skipped_count += 1
                continue
            
            problem_key = f"{problem['contestId']}-{problem['index']}"
            solved_count = stats_map.get(problem_key, 0)
            
            # Generate unique ID
            problem_id = problem['contestId'] * 100 + ord(problem['index'][0]) - ord('A')
            if len(problem['index']) > 1:
                problem_id += int(problem['index'][1:]) if problem['index'][1:].isdigit() else 0
            
            conn.execute('''
                INSERT OR REPLACE INTO problems 
                (id, contest_id, `index`, name, type, rating, tags, solved_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                problem_id,
                problem['contestId'],
                problem['index'],
                problem['name'],
                problem.get('type', 'PROGRAMMING'),
                problem['rating'],
                json.dumps(problem.get('tags', [])),
                solved_count
            ))
            inserted_count += 1
            
            # Progress indicator
            if (i + 1) % 100 == 0:
                print(f"Processed {i + 1}/{len(problems)} problems...")
                conn.commit()  # Commit in batches
                
        except Exception as e:
            print(f"Error inserting problem {problem.get('name', 'Unknown')}: {str(e)}")
            continue
    
    conn.commit()
    conn.close()
    
    print(f"Successfully inserted {inserted_count} problems")
    print(f"Skipped {skipped_count} problems (no rating or gym)")
    return True

def populate_sample_users():
    """Add some sample users for testing"""
    sample_handles = ['tourist', 'Benq', 'jiangly', 'Um_nik', 'Radewoosh']
    
    conn = get_db_connection()
    added_count = 0
    
    for handle in sample_handles:
        try:
            print(f"Fetching user info for {handle}...")
            user_info = cf_api.get_user_info(handle)
            
            if user_info:
                user_data = user_info[0]
                conn.execute('''
                    INSERT OR REPLACE INTO users (cf_handle, rating, max_rating)
                    VALUES (?, ?, ?)
                ''', (
                    handle,
                    user_data.get('rating', 0),
                    user_data.get('maxRating', 0)
                ))
                added_count += 1
                print(f"Added {handle} (Rating: {user_data.get('rating', 0)})")
            
            time.sleep(0.5)  # Rate limiting
            
        except Exception as e:
            print(f"Error adding user {handle}: {str(e)}")
            continue
    
    conn.commit()
    conn.close()
    
    print(f"Added {added_count} sample users")

if __name__ == "__main__":
    print("Starting data population...")
    
    # Populate problems
    if populate_problems():
        print("Problems populated successfully!")
    else:
        print("Failed to populate problems")
        sys.exit(1)
    
    # Populate sample users
    populate_sample_users()
    
    print("Data population completed!")
