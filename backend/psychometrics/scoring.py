import numpy as np
from scipy.stats import norm

def calculate_deviation_iq(raw_score: float, norm_mean: float = 100, norm_sd: float = 15) -> dict:
    """
    Calculates Deviation IQ based on normative data.
    Formula: IQ = 100 + 15 * ((X - M) / SD)
    
    Returns a dictionary with IQ, Z-score, and Percentile.
    """
    if norm_sd <= 0:
        raise ValueError("Standard deviation must be positive.")
        
    z_score = (raw_score - norm_mean) / norm_sd
    iq_score = 100 + (15 * z_score)
    
    # Calculate Percentile (Normal CDF)
    percentile = norm.cdf(z_score) * 100
    
    return {
        "iq": round(iq_score, 2),
        "z_score": round(z_score, 4),
        "percentile": round(percentile, 1),
        "classification": get_clinical_classification(iq_score)
    }

def get_clinical_classification(iq: float) -> str:
    """Standardized Clinical Classifications for IQ scores (WAIS-IV / Stanford-Binet V)"""
    if iq >= 130: return "Very Superior (Gifted)"
    if iq >= 120: return "Superior"
    if iq >= 110: return "High Average"
    if iq >= 90: return "Average"
    if iq >= 80: return "Low Average"
    if iq >= 70: return "Borderline"
    return "Extremely Low"

def estimate_theta_from_responses(responses, item_params):
    """
    Simple IRT-based theta estimation (expected a posteriori or MLE).
    Placeholder for catsim integration.
    """
    # ... logic handled by catsim library ...
    pass
