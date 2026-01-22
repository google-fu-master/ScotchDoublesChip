#!/usr/bin/env python3
"""
FargoRate API Research
Research the correct FargoRate website for API endpoints and integration methods
"""

import requests
import json
import time
from bs4 import BeautifulSoup
import re

def research_fargorate():
    """Research FargoRate website structure and API"""
    results = {
        'base_url': 'https://fargorate.com',
        'findings': {},
        'potential_apis': [],
        'search_functionality': {}
    }
    
    print("🔍 Researching FargoRate.com...")
    
    try:
        # Test main page
        response = requests.get('https://fargorate.com', timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            results['findings']['main_page'] = {
                'status': 200,
                'title': soup.title.string if soup.title else None,
                'has_search': bool(soup.find('input', {'type': 'search'})),
                'forms_count': len(soup.find_all('form'))
            }
            
            # Look for API references in scripts
            scripts = soup.find_all('script')
            api_mentions = []
            
            for script in scripts:
                if script.string:
                    script_content = script.string
                    # Look for API endpoints
                    api_patterns = [
                        r'/api/[a-zA-Z0-9/]+',
                        r'api\.[a-zA-Z0-9.-]+',
                        r'https?://[a-zA-Z0-9.-]*api[a-zA-Z0-9.-]*',
                        r'fetch\([\'"][^\'"]*[\'"]',
                        r'axios\.[a-z]+\([\'"][^\'"]*[\'"]'
                    ]
                    
                    for pattern in api_patterns:
                        matches = re.findall(pattern, script_content)
                        if matches:
                            api_mentions.extend(matches)
            
            results['potential_apis'] = list(set(api_mentions))[:20]  # First 20 unique mentions
            
            # Look for search functionality
            search_forms = soup.find_all('form')
            for form in search_forms:
                action = form.get('action', '')
                inputs = form.find_all('input')
                if any(inp.get('name', '').lower() in ['search', 'query', 'player', 'name'] for inp in inputs):
                    results['search_functionality']['form'] = {
                        'action': action,
                        'method': form.get('method', 'GET'),
                        'inputs': [{'name': inp.get('name'), 'type': inp.get('type')} for inp in inputs]
                    }
                    break
                    
        print("✅ Main page analyzed")
        
        # Test common API endpoints
        api_endpoints_to_test = [
            '/api',
            '/api/players',
            '/api/search',
            '/player/search',
            '/players',
            '/search'
        ]
        
        for endpoint in api_endpoints_to_test:
            try:
                url = f"https://fargorate.com{endpoint}"
                response = requests.get(url, timeout=5, headers={
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                    'Accept': 'application/json, text/plain, */*'
                })
                
                results['findings'][f'endpoint_{endpoint}'] = {
                    'status': response.status_code,
                    'content_type': response.headers.get('content-type', ''),
                    'content_length': len(response.content),
                    'is_json': 'application/json' in response.headers.get('content-type', ''),
                    'response_preview': str(response.content[:200]) if response.status_code == 200 else None
                }
                
                print(f"   Tested {endpoint}: {response.status_code}")
                
            except Exception as e:
                results['findings'][f'endpoint_{endpoint}'] = {'error': str(e)}
                
            time.sleep(1)  # Be respectful with rate limiting
        
        print("✅ API endpoints tested")
        
        # Look for player profile pages structure
        # Try a common name to see URL structure
        test_searches = ['smith', 'john', 'mike']
        for name in test_searches:
            try:
                search_url = f"https://fargorate.com/search?q={name}"
                response = requests.get(search_url, timeout=5, headers={
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
                })
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for player links or profile patterns
                    links = soup.find_all('a', href=True)
                    player_links = []
                    
                    for link in links[:20]:  # First 20 links
                        href = link.get('href')
                        if any(keyword in href.lower() for keyword in ['player', 'profile', 'rating']):
                            player_links.append({
                                'href': href,
                                'text': link.text.strip()[:100]
                            })
                    
                    if player_links:
                        results['search_functionality'][f'search_results_{name}'] = {
                            'status': response.status_code,
                            'player_links': player_links[:5]  # First 5 player links
                        }
                        break
                        
            except Exception as e:
                continue
                
            time.sleep(1)
        
        print("✅ Search functionality analyzed")
        
    except Exception as e:
        results['error'] = str(e)
    
    return results

if __name__ == "__main__":
    research_results = research_fargorate()
    
    # Save results
    with open('fargorate_research.json', 'w') as f:
        json.dump(research_results, f, indent=2)
    
    print("\n📊 Research complete!")
    print("📄 Results saved to fargorate_research.json")
    
    # Print summary
    print("\n🎯 KEY FINDINGS:")
    
    if 'main_page' in research_results['findings']:
        main_page = research_results['findings']['main_page']
        print(f"   ✅ Main page accessible (Status: {main_page['status']})")
        print(f"   📝 Title: {main_page.get('title', 'Unknown')}")
        print(f"   🔍 Has search: {main_page.get('has_search', False)}")
    
    if research_results['potential_apis']:
        print(f"   🔗 Found {len(research_results['potential_apis'])} potential API references")
        for api in research_results['potential_apis'][:5]:
            print(f"      - {api}")
    
    if research_results['search_functionality']:
        print(f"   🎯 Search functionality analysis:")
        for key, value in research_results['search_functionality'].items():
            if isinstance(value, dict) and 'status' in value:
                print(f"      - {key}: Status {value['status']}")
    
    print("\n💡 Next steps:")
    print("   1. Analyze the JSON results for specific API endpoints")
    print("   2. Test player search functionality")
    print("   3. Understand rating data structure")
    print("   4. Design integration strategy")