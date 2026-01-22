#!/usr/bin/env python3
"""
DigitalPool.com Tournament Type Scout
Analyzes the tournament creation flow with focus on Chip Tournament type
"""

import time
import random
import json
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup
import logging

@dataclass 
class FormField:
    name: str
    type: str
    value: Optional[str] = None
    options: Optional[List[str]] = None
    required: bool = False
    placeholder: Optional[str] = None

class ChipTournamentScout:
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
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox") 
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 15)

    def login(self):
        try:
            self.driver.get(self.login_url)
            time.sleep(3)
            
            email_field = self.driver.find_element(By.ID, "email")
            email_field.clear()
            email_field.send_keys(self.email)
            
            password_field = self.driver.find_element(By.ID, "password")
            password_field.clear()
            password_field.send_keys(self.password)
            
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()
            time.sleep(5)
            
            return "dashboard" in self.driver.page_source.lower() or self.driver.current_url != self.login_url
        except Exception as e:
            self.logger.error(f"Login failed: {e}")
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
        
        # Extract select fields with options
        for select_elem in soup.find_all('select'):
            options = []
            for opt in select_elem.find_all('option'):
                option_text = opt.text.strip()
                option_value = opt.get('value', '')
                options.append(f"{option_text} (value: {option_value})")
            
            field = FormField(
                name=select_elem.get('name', select_elem.get('id', 'unnamed')),
                type='select',
                options=options,
                required=select_elem.has_attr('required'),
                value=select_elem.get('value')
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

    def analyze_tournament_type_page(self):
        """Analyze the tournament type selection page"""
        try:
            self.logger.info("Analyzing tournament type page...")
            self.driver.get("https://digitalpool.com/tournament-builder/new/type")
            time.sleep(5)
            
            self.driver.save_screenshot("tournament_type_page.png")
            
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            analysis = {
                'url': self.driver.current_url,
                'title': self.driver.title,
                'form_fields': self.extract_form_fields(soup),
                'page_content': {}
            }
            
            # Look for tournament type options
            tournament_types = []
            
            # Check for radio buttons or other tournament type selectors
            radio_buttons = soup.find_all('input', {'type': 'radio'})
            for radio in radio_buttons:
                label = soup.find('label', {'for': radio.get('id')})
                if label:
                    tournament_types.append({
                        'type': 'radio',
                        'name': radio.get('name'),
                        'value': radio.get('value'),
                        'label': label.text.strip(),
                        'id': radio.get('id')
                    })
            
            # Check for clickable tournament type cards/divs
            tournament_cards = soup.find_all(['div', 'button'], class_=lambda x: x and any(word in x.lower() for word in ['tournament', 'type', 'format']))
            for card in tournament_cards[:10]:  # Limit to first 10
                if card.text.strip():
                    tournament_types.append({
                        'type': 'card',
                        'text': card.text.strip()[:200],  # Limit text length
                        'class': card.get('class'),
                        'tag': card.name
                    })
            
            # Look specifically for "chip" mentions
            chip_mentions = []
            for element in soup.find_all(text=lambda text: text and 'chip' in text.lower()):
                parent = element.parent
                chip_mentions.append({
                    'text': element.strip()[:100],
                    'parent_tag': parent.name if parent else None,
                    'parent_class': parent.get('class') if parent else None
                })
            
            analysis['page_content']['tournament_types'] = tournament_types
            analysis['page_content']['chip_mentions'] = chip_mentions[:10]  # First 10 mentions
            
            # Check for any dropdowns specifically
            selects = self.driver.find_elements(By.TAG_NAME, "select")
            dropdown_info = []
            for select in selects:
                try:
                    select_obj = Select(select)
                    options = []
                    for option in select_obj.options:
                        options.append({
                            'text': option.text,
                            'value': option.get_attribute('value'),
                            'selected': option.is_selected()
                        })
                    
                    dropdown_info.append({
                        'id': select.get_attribute('id'),
                        'name': select.get_attribute('name'),
                        'class': select.get_attribute('class'),
                        'options': options
                    })
                except Exception as e:
                    self.logger.warning(f"Error processing dropdown: {e}")
            
            analysis['page_content']['dropdowns'] = dropdown_info
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing tournament type page: {e}")
            return None

    def create_chip_tournament_flow(self):
        """Try to create a new chip tournament and capture the settings"""
        try:
            self.logger.info("Starting chip tournament creation flow...")
            
            # Start at tournament type page
            self.driver.get("https://digitalpool.com/tournament-builder/new/type")
            time.sleep(5)
            
            # Look for chip tournament option
            chip_found = False
            
            # Try to find and click chip tournament option
            possible_selectors = [
                "//input[@type='radio' and contains(@value, 'chip')]",
                "//input[@type='radio' and contains(following-sibling::label, 'Chip')]",
                "//input[@type='radio' and contains(parent::label, 'Chip')]",
                "//*[contains(text(), 'Chip Tournament')]",
                "//*[contains(text(), 'chip')]//ancestor::*[self::button or self::div[@role='button'] or self::label]"
            ]
            
            for selector in possible_selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    if elements:
                        element = elements[0]
                        self.logger.info(f"Found potential chip option using selector: {selector}")
                        self.logger.info(f"Element text: {element.text}")
                        
                        # Try to click it
                        try:
                            element.click()
                            chip_found = True
                            self.logger.info("Successfully clicked chip tournament option")
                            break
                        except:
                            # Try JS click
                            self.driver.execute_script("arguments[0].click();", element)
                            chip_found = True
                            self.logger.info("Successfully clicked chip tournament option with JS")
                            break
                except Exception as e:
                    continue
            
            if not chip_found:
                self.logger.warning("Could not find chip tournament option, proceeding anyway...")
            
            time.sleep(3)
            self.driver.save_screenshot("after_chip_selection.png")
            
            # Try to proceed to next step
            next_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Next') or contains(text(), 'Continue') or contains(text(), 'Proceed')]")
            if next_buttons:
                next_buttons[0].click()
                time.sleep(3)
                self.logger.info("Proceeded to next step")
            
            # Now try to get to settings page
            self.driver.save_screenshot("tournament_settings_attempt.png")
            
            current_url = self.driver.current_url
            self.logger.info(f"Current URL after setup: {current_url}")
            
            # Analyze current page for settings fields
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            settings_analysis = {
                'url': current_url,
                'title': self.driver.title,
                'form_fields': self.extract_form_fields(soup)
            }
            
            return settings_analysis
            
        except Exception as e:
            self.logger.error(f"Error in tournament creation flow: {e}")
            return None

    def run_full_analysis(self):
        """Run complete analysis of chip tournament creation"""
        try:
            if not self.login():
                self.logger.error("Login failed")
                return None
            
            results = {}
            
            # Analyze tournament type selection
            type_analysis = self.analyze_tournament_type_page()
            if type_analysis:
                results['tournament_type_page'] = type_analysis
            
            # Try chip tournament creation flow
            creation_flow = self.create_chip_tournament_flow()
            if creation_flow:
                results['chip_tournament_settings'] = creation_flow
            
            # Save results
            with open('chip_tournament_analysis.json', 'w') as f:
                json.dump(results, f, indent=2, default=str)
            
            self.logger.info("Analysis complete! Results saved to chip_tournament_analysis.json")
            return results
            
        except Exception as e:
            self.logger.error(f"Analysis failed: {e}")
            return None
        finally:
            self.driver.quit()

if __name__ == "__main__":
    scout = ChipTournamentScout()
    scout.run_full_analysis()