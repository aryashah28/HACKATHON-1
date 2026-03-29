import requests

def convert(amount, base, target):
    data = requests.get(f"https://api.exchangerate-api.com/v4/latest/%7Bbase%7D").json()
    return amount * data["rates"].get(target, 1)