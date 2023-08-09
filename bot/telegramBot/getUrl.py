from selenium import webdriver
import json

url = "https://www.evain.ovh/"

def get_info(driver):
    element = driver.find_element_by_id("headerH1")
    return element.text

driver = webdriver.Firefox()

driver.get(url)

info = get_info(driver)

with open("output.json", "w") as f:
    json.dump({"info": info}, f)

driver.quit()