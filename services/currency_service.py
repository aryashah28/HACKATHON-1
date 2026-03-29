import requests

def convert_currency(amount, base_currency, target_currency):
    """Convert amount from one currency to another using exchangerate-api"""
    try:
        response = requests.get(
            f"https://api.exchangerate-api.com/v4/latest/{base_currency}",
            timeout=5
        )
        data = response.json()
        
        if "rates" in data:
            rate = data["rates"].get(target_currency, 1)
            return amount * rate
        else:
            # Fallback if API fails
            return amount
    except Exception as e:
        print(f"Currency conversion error: {e}")
        return amount

def get_exchange_rate(base_currency, target_currency):
    """Get exchange rate between two currencies"""
    try:
        response = requests.get(
            f"https://api.exchangerate-api.com/v4/latest/{base_currency}",
            timeout=5
        )
        data = response.json()
        return data["rates"].get(target_currency, 1)
    except:
        return 1