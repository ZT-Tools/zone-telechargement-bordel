import requests
from bs4 import BeautifulSoup

def get_title():
    response = requests.get('https://t.me/ZT_officiel')
    html_content = response.text

    soup = BeautifulSoup(html_content, 'html.parser')

    title_element = soup.find('div', class_='tgme_page_title')
    title = title_element.text
    print("title: ",title)

    return title

def get_url():
    title = get_title().strip()
    url = f'https://www.{title.lower()}'
    return url


if __name__ == '__main__':
    url = get_url()
    print(url)
