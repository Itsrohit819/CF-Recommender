import requests
import time
import json
from utils.config import Config

class CodeforcesAPI:
    def __init__(self):
        self.base_url = Config.CODEFORCES_API_BASE
        self.last_request_time = 0
        self.min_request_interval = 0.5  # 500ms between requests for safety
    
    def _make_request(self, endpoint, params=None):
        # Rate limiting
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url, params=params, timeout=15)
            self.last_request_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'OK':
                    return data['result']
                else:
                    print(f"API Error: {data.get('comment', 'Unknown error')}")
                    return None
            else:
                print(f"HTTP Error: {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            print("Request timeout")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return None
        except json.JSONDecodeError:
            print("Invalid JSON response")
            return None
    
    def get_user_info(self, handle):
        """Get user information"""
        return self._make_request('user.info', {'handles': handle})
    
    def get_user_submissions(self, handle, count=50):
        """Get user submissions"""
        return self._make_request('user.status', {'handle': handle, 'from': 1, 'count': count})
    
    def get_contest_list(self, gym=False):
        """Get list of contests"""
        return self._make_request('contest.list', {'gym': gym})
    
    def get_problemset(self, tags=None):
        """Get all problems from problemset"""
        params = {}
        if tags:
            params['tags'] = ';'.join(tags) if isinstance(tags, list) else tags
        return self._make_request('problemset.problems', params)
    
    def get_contest_standings(self, contest_id, handles=None, count=50):
        """Get contest standings"""
        params = {'contestId': contest_id, 'count': count}
        if handles:
            params['handles'] = ';'.join(handles) if isinstance(handles, list) else handles
        return self._make_request('contest.standings', params)
    
    def get_user_rating(self, handle):
        """Get user rating history"""
        return self._make_request('user.rating', {'handle': handle})

# Global instance
cf_api = CodeforcesAPI()
