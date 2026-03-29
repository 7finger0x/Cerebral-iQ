import numpy as np
from catsim import selection, estimation
from models.item_bank import get_bank, ITEM_BANK

# Initialize the engine components
selector = selection.MaxInfoSelector()
estimator = estimation.NumericalSearchEstimator()

def select_next_item(theta: float, answered_indices: list) -> int:
    """
    Selects the next optimal item using Maximum Fisher Information (MFI).
    
    :param theta: Current latent trait estimate.
    :param answered_indices: Indices of items already answered in the bank.
    :return: Index of the next item to present.
    """
    bank = get_bank()
    
    try:
        next_idx = selector.select(
            item_bank=bank, 
            est_theta=float(theta), 
            administered_items=answered_indices
        )
        return int(next_idx) if next_idx is not None else -1
    except Exception as e:
        # Fallback if selection fails (e.g. end of bank)
        return -1

def update_theta(responses: list, item_indices: list) -> float:
    """
    Updates the examinee's trait estimate (theta) based on responses.
    
    :param responses: Binary responses [0, 1, ...]
    :param item_indices: Indices of the items in the bank.
    :return: Updated theta estimate.
    """
    bank = get_bank()
    try:
        new_theta = estimator.estimate(
            item_bank=bank,
            administered_items=item_indices,
            response_vector=[bool(r) for r in responses]
        )
        return float(new_theta)
    except Exception as e:
        # Initial estimate if estimation fails (e.g. no variance in responses)
        return 0.0
