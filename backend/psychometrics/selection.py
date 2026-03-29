import numpy as np
from catsim import selection, estimation
from models.item_bank import get_bank_matrix, ITEM_BANK

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
    bank = get_bank_matrix()
    
    # Exclude already answered items
    try:
        next_idx = selector.select(
            items=bank, 
            est_theta=theta, 
            answered=answered_indices
        )
        return int(next_idx)
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
    bank = get_bank_matrix()
    
    # Convert list of indices to a numpy slice/subset if needed or handle manually
    subset_bank = bank[item_indices]
    
    try:
        new_theta = estimator.estimate(
            items=subset_bank, 
            responses=np.array(responses)
        )
        return float(new_theta)
    except Exception:
        # Initial estimate if estimation fails (e.g. no variance in responses)
        return 0.0
