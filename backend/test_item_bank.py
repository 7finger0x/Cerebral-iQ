import os
import sys
import numpy as np
from catsim import selection, estimation, item_bank
# Add current directory to path
sys.path.append(os.getcwd())

from models.item_bank import ITEM_BANK, load_bank, get_bank_matrix

print(f"Loading bank...")
load_bank()
bank_matrix = get_bank_matrix()
bank = item_bank.ItemBank(bank_matrix)

selector = selection.MaxInfoSelector()
next_idx = selector.select(item_bank=bank, est_theta=0.0, administered_items=[0])
print(f"Selector Result with ItemBank object: {next_idx}")
