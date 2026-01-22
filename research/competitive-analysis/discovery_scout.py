#!/usr/bin/env python3
"""
DigitalPool.com Tournament Discovery Scout
This scout will explore the available tournament creation options after login.
"""

import time
import random
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

class TournamentDiscoveryScout:
    def __init__(self):
        self.setup_logging()
        self.setup_driver()
        
        # Credentials
        self.email = "jehed90102@oremal.com"
        self.password = "Marine!8"
        
        self.base_url = "https://digitalpool.com"
        self.login_url = f"{self.base_url}/login"

    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def setup_driver(self):
        """Setup headless Chrome driver"""
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)

    def human_delay(self):
        time.sleep(random.uniform(1, 3))

    def login(self):
        """Login to DigitalPool.com"""
        try:
            self.driver.get(self.login_url)
            self.human_delay()
            
            # Find and fill email
            email_field = self.driver.find_element(By.ID, "email")
            email_field.clear()
            email_field.send_keys(self.email)
            
            # Find and fill password
            password_field = self.driver.find_element(By.ID, "password")
            password_field.clear()
            password_field.send_keys(self.password)
            
            # Submit form
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()
            
            self.human_delay()
            
            # Check if login was successful by checking for dashboard content
            page_text = self.driver.page_source.lower()
            if 'dashboard' in page_text or 'tournament' in page_text or self.driver.current_url != self.login_url:
                self.logger.info("Login successful!")
                return True
            else:
                self.logger.error("Login failed")
                return False
                
        except Exception as e:
            self.logger.error(f"Login error: {e}")
            return False

    def explore_tournament_creation(self):
        """Explore tournament creation process"""
        findings = {}
        
        try:
            # First, try to find tournament builder or creation page
            tournament_creation_urls = [
                f"{self.base_url}/tournament-builder",
                f"{self.base_url}/tournament-builder/new",
                f"{self.base_url}/tournaments/create",
                f"{self.base_url}/tournaments/new",
                f"{self.base_url}/dashboard"
            ]
            
            for url in tournament_creation_urls:
                try:
                    self.logger.info(f"Exploring: {url}")
                    self.driver.get(url)
                    self.human_delay()
                    
                    current_title = self.driver.title
                    current_url = self.driver.current_url
                    
                    # Look for tournament-related elements
                    tournament_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'tournament') or contains(text(), 'Tournament')]")
                    create_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'create') or contains(text(), 'Create') or contains(text(), 'new') or contains(text(), 'New')]")
                    
                    # Look for forms and inputs
                    forms = self.driver.find_elements(By.TAG_NAME, "form")
                    selects = self.driver.find_elements(By.TAG_NAME, "select")
                    
                    findings[url] = {
                        'title': current_title,
                        'actual_url': current_url,
                        'tournament_elements_count': len(tournament_elements),
                        'create_elements_count': len(create_elements),
                        'forms_count': len(forms),
                        'selects_count': len(selects),
                        'tournament_texts': [elem.text[:100] for elem in tournament_elements[:5]],
                        'create_texts': [elem.text[:100] for elem in create_elements[:5]]
                    }
                    
                    # If we find promising elements, look deeper
                    if len(tournament_elements) > 0 or len(create_elements) > 0:
                        self.logger.info(f"Found promising elements at {url}")
                        
                        # Look for "Chip Tournament" or similar
                        chip_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'chip') or contains(text(), 'Chip')]")
                        scotch_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'scotch') or contains(text(), 'Scotch')]")
                        doubles_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'doubles') or contains(text(), 'Doubles')]")
                        
                        findings[url]['chip_elements'] = [elem.text[:100] for elem in chip_elements[:3]]
                        findings[url]['scotch_elements'] = [elem.text[:100] for elem in scotch_elements[:3]]
                        findings[url]['doubles_elements'] = [elem.text[:100] for elem in doubles_elements[:3]]
                        
                        # Take a screenshot
                        screenshot_name = f"discovery_{url.split('/')[-1] or 'root'}.png"
                        self.driver.save_screenshot(screenshot_name)
                        findings[url]['screenshot'] = screenshot_name
                    
                except Exception as e:
                    self.logger.warning(f"Error exploring {url}: {e}")
                    findings[url] = {'error': str(e)}
            
            return findings
            
        except Exception as e:
            self.logger.error(f"Exploration error: {e}")
            return {}

    def find_new_tournament_builder_page(self):
        """Specifically look for the tournament builder new page"""
        try:
            # Try the generic new tournament builder page
            self.driver.get("https://digitalpool.com/tournament-builder/new/settings")
            self.human_delay()
            
            self.driver.save_screenshot("new_tournament_builder.png")
            
            # Look for tournament type dropdown
            selects = self.driver.find_elements(By.TAG_NAME, "select")
            tournament_type_info = {}
            
            for i, select in enumerate(selects):
                try:
                    select_element = Select(select)
                    options = [option.text for option in select_element.options]
                    tournament_type_info[f'select_{i}'] = {
                        'id': select.get_attribute('id'),
                        'name': select.get_attribute('name'),
                        'options': options
                    }
                    
                    # Check if this looks like a tournament type selector
                    if any('chip' in option.lower() for option in options):
                        tournament_type_info[f'select_{i}']['is_tournament_type'] = True
                        self.logger.info(f"Found tournament type selector with chip option!")
                        
                except Exception as e:
                    self.logger.warning(f"Error processing select {i}: {e}")
            
            return tournament_type_info
            
        except Exception as e:
            self.logger.error(f"Error finding tournament builder: {e}")
            return {}

    def run_discovery(self):
        """Run the full discovery process"""
        try:
            if not self.login():
                return None
            
            self.logger.info("Starting tournament creation discovery...")
            
            # General exploration
            general_findings = self.explore_tournament_creation()
            
            # Specific tournament builder exploration
            tournament_builder_info = self.find_new_tournament_builder_page()
            
            results = {
                'general_exploration': general_findings,
                'tournament_builder': tournament_builder_info
            }
            
            # Save results
            with open('discovery_results.json', 'w') as f:
                json.dump(results, f, indent=2)
            
            self.logger.info("Discovery complete! Results saved to discovery_results.json")
            return results
            
        except Exception as e:
            self.logger.error(f"Discovery failed: {e}")
            return None
        finally:
            self.driver.quit()

if __name__ == "__main__":
    scout = TournamentDiscoveryScout()
    scout.run_discovery()