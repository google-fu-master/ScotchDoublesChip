#!/usr/bin/env python3
"""
DigitalPool.com Scout - Analyzes tournament builder functionality
for Scotch Doubles Chip tournaments to understand data structures and features.
"""

import time
import random
import json
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.options import Options
import logging

@dataclass
class FormField:
    name: str
    type: str
    value: Optional[str] = None
    options: Optional[List[str]] = None
    required: bool = False
    placeholder: Optional[str] = None

@dataclass
class PageAnalysis:
    url: str
    title: str
    form_fields: List[FormField]
    buttons: List[str]
    navigation_elements: List[str]
    data_structures: Dict[str, Any]

class DigitalPoolScout:
    def __init__(self):
        self.setup_logging()
        self.setup_driver()
        self.session_data = {}
        
        # Human-like behavior settings
        self.min_delay = 1.0
        self.max_delay = 3.0
        self.mouse_move_delay = 0.1
        
        # Target URLs
        self.base_url = "https://digitalpool.com"
        self.login_url = f"{self.base_url}/login"
        self.tournament_urls = [
            "https://digitalpool.com/tournament-builder/scotch-chipper/edit/settings",
            "https://digitalpool.com/tournament-builder/scotch-chipper/edit/players", 
            "https://digitalpool.com/tournament-builder/scotch-chipper/edit/tables",
            "https://digitalpool.com/tournament-builder/scotch-chipper/edit/preview",
            "https://digitalpool.com/tournament-builder/scotch-chipper/edit/review"
        ]
        self.venue_url = "https://digitalpool.com/venues/chip-place-bellows"
        
        # Credentials
        self.email = "jehed90102@oremal.com"
        self.password = "Marine!8"

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('scout_log.txt'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def setup_driver(self):
        """Setup Chrome driver with human-like options"""
        chrome_options = Options()
        
        # Headless mode for containers/remote environments
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        
        # Make browser appear more human-like
        chrome_options.add_argument("--no-first-run")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")
        
        # Set a realistic user agent
        chrome_options.add_argument(
            "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        # Window size
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            # Try Chrome first, fallback to Chromium
            try:
                self.driver = webdriver.Chrome(options=chrome_options)
                self.logger.info("Chrome driver initialized successfully")
            except:
                # Fallback to Chromium
                chrome_options.binary_location = "/usr/bin/chromium-browser"
                self.driver = webdriver.Chrome(options=chrome_options)
                self.logger.info("Chromium driver initialized successfully")
            
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.wait = WebDriverWait(self.driver, 10)
        except Exception as e:
            self.logger.error(f"Failed to initialize Chrome/Chromium driver: {e}")
            raise

    def human_like_delay(self, min_extra=0, max_extra=1):
        """Add random delay to simulate human behavior"""
        delay = random.uniform(self.min_delay + min_extra, self.max_delay + max_extra)
        time.sleep(delay)

    def simulate_mouse_movement(self, element=None):
        """Simulate natural mouse movement"""
        actions = ActionChains(self.driver)
        
        if element:
            # Move to element with slight randomness
            offset_x = random.randint(-5, 5)
            offset_y = random.randint(-5, 5)
            actions.move_to_element_with_offset(element, offset_x, offset_y)
        else:
            # Random mouse movement
            x = random.randint(100, 800)
            y = random.randint(100, 600)
            actions.move_by_offset(x, y)
        
        actions.perform()
        time.sleep(self.mouse_move_delay)

    def safe_click(self, element):
        """Click element with human-like behavior"""
        try:
            self.simulate_mouse_movement(element)
            self.human_like_delay(0.2, 0.5)
            element.click()
            self.human_like_delay()
            return True
        except Exception as e:
            self.logger.warning(f"Click failed: {e}")
            return False

    def safe_send_keys(self, element, text):
        """Type text with human-like timing"""
        try:
            element.clear()
            for char in text:
                element.send_keys(char)
                time.sleep(random.uniform(0.05, 0.15))
            self.human_like_delay()
            return True
        except Exception as e:
            self.logger.warning(f"Send keys failed: {e}")
            return False

    def login(self):
        """Login to DigitalPool.com"""
        self.logger.info("Starting login process")
        
        try:
            self.driver.get(self.login_url)
            self.human_like_delay(2, 4)  # Wait for page load
            
            # Debug: Log current page title and URL
            self.logger.info(f"Current URL: {self.driver.current_url}")
            self.logger.info(f"Page title: {self.driver.title}")
            
            # Take a screenshot for debugging
            try:
                self.driver.save_screenshot('login_page.png')
                self.logger.info("Screenshot saved as login_page.png")
            except:
                pass
            
            # Wait a bit more for any JavaScript to load
            self.human_like_delay(3, 5)
            
            # Debug: Check if we can find the form elements
            try:
                email_elements = self.driver.find_elements(By.ID, "email")
                if not email_elements:
                    # Try alternative selectors
                    email_elements = self.driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
                    if not email_elements:
                        email_elements = self.driver.find_elements(By.NAME, "email")
                    if not email_elements:
                        email_elements = self.driver.find_elements(By.CSS_SELECTOR, "input[name*='mail']")
                
                self.logger.info(f"Found {len(email_elements)} email field(s)")
                
                if not email_elements:
                    # Save page source for debugging
                    with open('login_page_source.html', 'w') as f:
                        f.write(self.driver.page_source)
                    self.logger.error("No email field found. Page source saved to login_page_source.html")
                    return False
                
                email_field = email_elements[0]
                self.logger.info(f"Email field tag: {email_field.tag_name}, id: {email_field.get_attribute('id')}, name: {email_field.get_attribute('name')}")
                
                # Clear field and enter email slowly
                email_field.clear()
                self.human_like_delay(0.5, 1)
                
                if not self.safe_send_keys(email_field, self.email):
                    raise Exception("Failed to enter email")
                self.logger.info("Email entered successfully")
            
            except Exception as e:
                self.logger.error(f"Email field error: {e}")
                return False
            
            # Find and fill password field
            try:
                password_elements = self.driver.find_elements(By.ID, "password")
                if not password_elements:
                    password_elements = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
                    if not password_elements:
                        password_elements = self.driver.find_elements(By.NAME, "password")
                    if not password_elements:
                        password_elements = self.driver.find_elements(By.CSS_SELECTOR, "input[name*='pass']")
                
                self.logger.info(f"Found {len(password_elements)} password field(s)")
                
                if not password_elements:
                    self.logger.error("No password field found")
                    return False
                
                password_field = password_elements[0]
                self.logger.info(f"Password field tag: {password_field.tag_name}, id: {password_field.get_attribute('id')}, name: {password_field.get_attribute('name')}")
                
                # Clear field and enter password slowly
                password_field.clear()
                self.human_like_delay(0.5, 1)
                
                if not self.safe_send_keys(password_field, self.password):
                    raise Exception("Failed to enter password")
                self.logger.info("Password entered successfully")
            
            except Exception as e:
                self.logger.error(f"Password field error: {e}")
                return False
            
            # Take a screenshot before submitting
            try:
                self.driver.save_screenshot('before_login.png')
                self.logger.info("Screenshot saved as before_login.png")
            except:
                pass
            
            # Find and click login button
            try:
                login_buttons = self.driver.find_elements(By.XPATH, "//button[@type='submit']")
                if not login_buttons:
                    login_buttons = self.driver.find_elements(By.CSS_SELECTOR, "input[type='submit']")
                    if not login_buttons:
                        login_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Sign In')]")
                    if not login_buttons:
                        login_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")  # Try any button
                
                self.logger.info(f"Found {len(login_buttons)} login button(s)")
                
                if not login_buttons:
                    self.logger.error("No login button found")
                    return False
                
                login_button = login_buttons[0]
                self.logger.info(f"Login button text: '{login_button.text}', tag: {login_button.tag_name}")
                
                # Try clicking with JavaScript as backup
                try:
                    if not self.safe_click(login_button):
                        self.logger.info("Regular click failed, trying JavaScript click")
                        self.driver.execute_script("arguments[0].click();", login_button)
                        self.human_like_delay()
                except Exception as click_error:
                    self.logger.error(f"Both click methods failed: {click_error}")
                    return False
                
                self.logger.info("Login button clicked successfully")
            
            except Exception as e:
                self.logger.error(f"Login button error: {e}")
                return False
            
            # Wait for successful login or error message
            original_url = self.driver.current_url
            self.human_like_delay(5, 8)  # Wait longer for login to process
            
            current_url = self.driver.current_url
            self.logger.info(f"URL after login attempt: {current_url}")
            
            # Take a screenshot after login attempt
            try:
                self.driver.save_screenshot('after_login.png')
                self.logger.info("Screenshot saved as after_login.png")
            except:
                pass
            
            if current_url != original_url:
                self.logger.info("Login successful - URL changed")
                return True
            else:
                # Check for error messages
                error_selectors = [
                    ".alert", ".error", "[class*='error']", ".alert-danger", 
                    ".message-error", "#error", ".form-error", "[role='alert']"
                ]
                
                error_found = False
                for selector in error_selectors:
                    error_elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if error_elements:
                        for elem in error_elements:
                            if elem.text.strip():
                                self.logger.error(f"Login error message: {elem.text}")
                                error_found = True
                                break
                        if error_found:
                            break
                
                if not error_found:
                    # Check if we might be on a dashboard or account page anyway
                    page_text = self.driver.page_source.lower()
                    if any(word in page_text for word in ['dashboard', 'account', 'profile', 'logout']):
                        self.logger.info("Login appears successful - found dashboard indicators")
                        return True
                    else:
                        self.logger.error("Login failed - URL didn't change and no error message found")
                        # Save the full page source
                        with open('login_failed_page.html', 'w') as f:
                            f.write(self.driver.page_source)
                        self.logger.info("Failed login page source saved to login_failed_page.html")
                
                return False
            
        except Exception as e:
            self.logger.error(f"Login failed: {e}")
            # Save page source for debugging
            try:
                with open('login_error_page.html', 'w') as f:
                    f.write(self.driver.page_source)
                self.logger.info("Error page source saved to login_error_page.html")
            except:
                pass
            return False

    def extract_form_fields(self, soup=None):
        """Extract all form fields from current page"""
        if soup is None:
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
        
        fields = []
        
        # Extract input fields
        for input_elem in soup.find_all('input'):
            field = FormField(
                name=input_elem.get('name', input_elem.get('id', 'unnamed')),
                type=input_elem.get('type', 'text'),
                value=input_elem.get('value'),
                required=input_elem.has_attr('required'),
                placeholder=input_elem.get('placeholder')
            )
            fields.append(field)
        
        # Extract select fields
        for select_elem in soup.find_all('select'):
            options = [opt.text.strip() for opt in select_elem.find_all('option')]
            field = FormField(
                name=select_elem.get('name', select_elem.get('id', 'unnamed')),
                type='select',
                options=options,
                required=select_elem.has_attr('required')
            )
            fields.append(field)
        
        # Extract textarea fields
        for textarea_elem in soup.find_all('textarea'):
            field = FormField(
                name=textarea_elem.get('name', textarea_elem.get('id', 'unnamed')),
                type='textarea',
                value=textarea_elem.text.strip(),
                required=textarea_elem.has_attr('required'),
                placeholder=textarea_elem.get('placeholder')
            )
            fields.append(field)
        
        return fields

    def extract_buttons_and_navigation(self, soup):
        """Extract buttons and navigation elements"""
        buttons = []
        navigation = []
        
        # Extract buttons
        for button in soup.find_all(['button', 'input']):
            if button.name == 'input' and button.get('type') in ['submit', 'button']:
                buttons.append(button.get('value', 'Submit'))
            elif button.name == 'button':
                buttons.append(button.text.strip())
        
        # Extract navigation links
        for link in soup.find_all('a'):
            href = link.get('href', '')
            text = link.text.strip()
            if text and ('tournament' in href.lower() or 'edit' in href.lower()):
                navigation.append(f"{text} -> {href}")
        
        return buttons, navigation

    def extract_data_structures(self, soup):
        """Extract potential data structures and patterns"""
        data_structures = {}
        
        # Look for JSON data in script tags
        for script in soup.find_all('script'):
            script_text = script.string
            if script_text and ('tournament' in script_text.lower() or 'player' in script_text.lower()):
                # Try to find JSON-like structures
                try:
                    # This is a simplified extraction - in practice, you'd need more sophisticated parsing
                    if '{' in script_text and '}' in script_text:
                        data_structures['script_data'] = script_text[:500]  # First 500 chars
                except:
                    pass
        
        # Extract table structures
        tables = []
        for table in soup.find_all('table'):
            headers = [th.text.strip() for th in table.find_all('th')]
            if headers:
                tables.append({'headers': headers})
        if tables:
            data_structures['tables'] = tables
        
        # Extract form structure patterns
        forms = []
        for form in soup.find_all('form'):
            form_data = {
                'action': form.get('action', ''),
                'method': form.get('method', 'GET'),
                'field_count': len(form.find_all(['input', 'select', 'textarea']))
            }
            forms.append(form_data)
        if forms:
            data_structures['forms'] = forms
        
        return data_structures

    def analyze_page(self, url):
        """Analyze a single page and extract relevant information"""
        self.logger.info(f"Analyzing page: {url}")
        
        try:
            self.driver.get(url)
            self.human_like_delay(3, 6)  # Wait for page to fully load
            
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            # Extract page information
            title = self.driver.title
            form_fields = self.extract_form_fields(soup)
            buttons, navigation = self.extract_buttons_and_navigation(soup)
            data_structures = self.extract_data_structures(soup)
            
            analysis = PageAnalysis(
                url=url,
                title=title,
                form_fields=form_fields,
                buttons=buttons,
                navigation_elements=navigation,
                data_structures=data_structures
            )
            
            self.logger.info(f"Page analysis complete for {url}")
            return analysis
            
        except Exception as e:
            self.logger.error(f"Failed to analyze page {url}: {e}")
            return None

    def scout_tournament_builder(self):
        """Scout all tournament builder pages"""
        results = {}
        
        if not self.login():
            self.logger.error("Failed to login, aborting scout mission")
            return None
        
        # Analyze each tournament page
        for url in self.tournament_urls:
            self.human_like_delay(2, 4)  # Delay between pages
            analysis = self.analyze_page(url)
            if analysis:
                page_name = url.split('/')[-1]
                results[page_name] = analysis
        
        # Analyze venue page
        self.human_like_delay(2, 4)
        venue_analysis = self.analyze_page(self.venue_url)
        if venue_analysis:
            results['venue'] = venue_analysis
        
        return results

    def generate_report(self, results):
        """Generate a comprehensive report of findings"""
        if not results:
            return "Scout mission failed - no data collected"
        
        report = []
        report.append("=" * 80)
        report.append("DIGITALPOOL.COM TOURNAMENT BUILDER SCOUT REPORT")
        report.append("=" * 80)
        report.append("")
        
        for page_name, analysis in results.items():
            report.append(f"\n{'=' * 40}")
            report.append(f"PAGE: {page_name.upper()}")
            report.append(f"URL: {analysis.url}")
            report.append(f"TITLE: {analysis.title}")
            report.append(f"{'=' * 40}")
            
            # Form fields section
            if analysis.form_fields:
                report.append(f"\nFORM FIELDS ({len(analysis.form_fields)}):")
                report.append("-" * 30)
                for field in analysis.form_fields:
                    required_str = " (REQUIRED)" if field.required else ""
                    report.append(f"  • {field.name} [{field.type}]{required_str}")
                    if field.placeholder:
                        report.append(f"    Placeholder: {field.placeholder}")
                    if field.options:
                        report.append(f"    Options: {', '.join(field.options[:5])}{'...' if len(field.options) > 5 else ''}")
                    if field.value:
                        report.append(f"    Default: {field.value}")
            
            # Buttons section
            if analysis.buttons:
                report.append(f"\nBUTTONS ({len(analysis.buttons)}):")
                report.append("-" * 20)
                for button in analysis.buttons:
                    report.append(f"  • {button}")
            
            # Navigation section
            if analysis.navigation_elements:
                report.append(f"\nNAVIGATION ELEMENTS ({len(analysis.navigation_elements)}):")
                report.append("-" * 35)
                for nav in analysis.navigation_elements[:10]:  # Limit to first 10
                    report.append(f"  • {nav}")
            
            # Data structures section
            if analysis.data_structures:
                report.append(f"\nDATA STRUCTURES:")
                report.append("-" * 25)
                for key, value in analysis.data_structures.items():
                    report.append(f"  • {key}: {str(value)[:100]}{'...' if len(str(value)) > 100 else ''}")
        
        report.append("\n" + "=" * 80)
        report.append("END OF SCOUT REPORT")
        report.append("=" * 80)
        
        return "\n".join(report)

    def save_results(self, results, report):
        """Save results to files"""
        # Save raw data as JSON
        json_data = {}
        for page_name, analysis in results.items():
            json_data[page_name] = asdict(analysis)
        
        with open('scout_results.json', 'w') as f:
            json.dump(json_data, f, indent=2, default=str)
        
        # Save human-readable report
        with open('scout_report.txt', 'w') as f:
            f.write(report)
        
        self.logger.info("Results saved to scout_results.json and scout_report.txt")

    def run_scout_mission(self):
        """Execute the complete scout mission"""
        try:
            self.logger.info("Starting DigitalPool.com scout mission")
            
            results = self.scout_tournament_builder()
            
            if results:
                report = self.generate_report(results)
                self.save_results(results, report)
                print("\n" + report)
                return True
            else:
                self.logger.error("Scout mission failed")
                return False
                
        except Exception as e:
            self.logger.error(f"Scout mission error: {e}")
            return False
        finally:
            if hasattr(self, 'driver'):
                self.driver.quit()

if __name__ == "__main__":
    scout = DigitalPoolScout()
    success = scout.run_scout_mission()
    if success:
        print("\n✅ Scout mission completed successfully!")
        print("📄 Check scout_report.txt for detailed findings")
        print("📊 Check scout_results.json for raw data")
    else:
        print("\n❌ Scout mission failed - check scout_log.txt for details")