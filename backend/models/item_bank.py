import os
import numpy as np
import httpx
from catsim.item_bank import ItemBank
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

ITEM_BANK = []

def load_bank():
    """Fetches all items from Supabase items table via direct PostgREST API."""
    global ITEM_BANK
    try:
        url = f"{supabase_url}/rest/v1/items?select=*"
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        with httpx.Client() as client:
            response = client.get(url, headers=headers)
            response.raise_for_status()
            ITEM_BANK = response.json()
            print(f"[CiQ.Bank] Successfully loaded {len(ITEM_BANK)} items.")
    except Exception as e:
        print(f"[Error] Failed to load bank: {e}")
        ITEM_BANK = []

def get_bank():
    if not ITEM_BANK:
        load_bank()
    matrix = []
    for item in ITEM_BANK:
        matrix.append([float(item['a']), float(item['b']), float(item['c']), float(item.get('d', 1.0))])
    return ItemBank(np.matrix(matrix))

# Initial load
load_bank()
