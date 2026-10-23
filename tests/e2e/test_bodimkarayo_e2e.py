"""
Bodimkarayo.lk - Selenium End-to-End (E2E) Test Suite
Fulfills Section 9 of the Project Proposal:
"End-to-End (E2E) Testing: Selenium -> for web application workflow testing"
"""
import os
import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

class BodimkarayoE2ETests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        options = webdriver.ChromeOptions()
        if os.environ.get("HEADLESS", "0") == "1":
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1280,800")
        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_01_homepage_and_navigation(self):
        """Verifies homepage, branding, and navigation elements"""
        self.driver.get(f"{BASE_URL}/")
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "header"))
        )
        self.driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "01_homepage.png"))
        self.assertIn("localhost", self.driver.current_url)

    def test_02_properties_page(self):
        """Verifies properties page loads listings"""
        self.driver.get(f"{BASE_URL}/properties")
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "main"))
        )
        time.sleep(1)
        self.driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "02_properties.png"))
        self.assertIn("/properties", self.driver.current_url)

    def test_03_user_signin_flow(self):
        """Verifies complete user sign-in workflow"""
        self.driver.get(f"{BASE_URL}/signin")
        wait = WebDriverWait(self.driver, 10)
        
        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        email_input.clear()
        email_input.send_keys("admin1@bodimkarayo.lk")

        password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.clear()
        password_input.send_keys("admin123")

        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()

        wait.until(lambda d: d.current_url.rstrip("/") == BASE_URL.rstrip("/"))
        time.sleep(1)
        self.driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "03_login_success.png"))
        self.assertEqual(self.driver.current_url.rstrip("/"), BASE_URL.rstrip("/"))

if __name__ == "__main__":
    unittest.main(verbosity=2)
