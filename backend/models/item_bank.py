import os
import numpy as np
import httpx
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("[Error] Supabase env vars missing for backend.")

ITEM_BANK = []

def load_bank():
    """Fetches all items from Supabase items table via direct PostgREST API."""
    global ITEM_BANK
    try:
        # Construct PostgREST URL
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
            print(f"[CiQ.Bank] Successfully loaded {len(ITEM_BANK)} items from Supabase vault via httpx.")
    except Exception as e:
        print(f"[Error] Failed to load bank: {e}")
        ITEM_BANK = []

def get_bank_matrix():
    """Returns bank in a format suitable for catsim (numpy matrix [a, b, c, d])"""
    if not ITEM_BANK:
        load_bank()
    
    matrix = []
    for item in ITEM_BANK:
        # catsim expects columns: [a, b, c, d] where d is often 1.0 (IRT 3PL format)
        matrix.append([item['a'], item['b'], item['c'], item.get('d', 1.0)])
    
    return np.matrix(matrix)

# Initial load
load_bank()
