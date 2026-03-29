import numpy as np
from scipy.stats import norm
from typing import Dict, List, Optional

def calculate_deviation_iq(raw_score: float, norm_mean: float = 100, norm_sd: float = 15) -> dict:
    """
    Calculates Deviation IQ based on normative data.
    Formula: IQ = 100 + 15 * ((X - M) / SD)
    """
    if norm_sd <= 0:
        raise ValueError("Standard deviation must be positive.")
        
    z_score = (raw_score - norm_mean) / norm_sd
    iq_score = 100 + (15 * z_score)
    percentile = norm.cdf(z_score) * 100
    
    return {
        "score": round(iq_score, 0),
        "z_score": round(z_score, 4),
        "percentile": round(percentile, 1),
        "classification": get_clinical_classification(iq_score)
    }

def get_clinical_classification(iq: float) -> str:
    """WAIS-5 Standardized Clinical Classifications"""
    if iq >= 130: return "Very Superior"
    if iq >= 120: return "Superior"
    if iq >= 110: return "High Average"
    if iq >= 90: return "Average"
    if iq >= 80: return "Low Average"
    if iq >= 70: return "Borderline"
    return "Extremely Low"

def calculate_wais_v_indices(subtest_scores: Dict[str, float]) -> Dict[str, dict]:
    """
    Calculates WAIS-5 Primary Index scores and global composites.
    Subtest scores are expected as Scaled Scores (M=10, SD=3).
    """
    
    # 1. Primary Indices (Factor Models)
    indices = {}
    
    # Verbal Comprehension Index (VCI)
    if "Similarities" in subtest_scores and "Vocabulary" in subtest_scores:
        sum_vci = subtest_scores["Similarities"] + subtest_scores["Vocabulary"]
        indices["VCI"] = calculate_deviation_iq(sum_vci, norm_mean=20, norm_sd=6)
        
    # Visual Spatial Index (VSI)
    if "Block Design" in subtest_scores and "Visual Puzzles" in subtest_scores:
        sum_vsi = subtest_scores["Block Design"] + subtest_scores["Visual Puzzles"]
        indices["VSI"] = calculate_deviation_iq(sum_vsi, norm_mean=20, norm_sd=6)
        
    # Fluid Reasoning Index (FRI)
    if "Matrix Reasoning" in subtest_scores and "Figure Weights" in subtest_scores:
        sum_fri = subtest_scores["Matrix Reasoning"] + subtest_scores["Figure Weights"]
        indices["FRI"] = calculate_deviation_iq(sum_fri, norm_mean=20, norm_sd=6)
        
    # Working Memory Index (WMI)
    if "Digit Sequencing" in subtest_scores and "Running Digits" in subtest_scores:
        sum_wmi = subtest_scores["Digit Sequencing"] + subtest_scores["Running Digits"]
        indices["WMI"] = calculate_deviation_iq(sum_wmi, norm_mean=20, norm_sd=6)
        
    # Processing Speed Index (PSI)
    if "Coding" in subtest_scores and "Symbol Search" in subtest_scores:
        sum_psi = subtest_scores["Coding"] + subtest_scores["Symbol Search"]
        indices["PSI"] = calculate_deviation_iq(sum_psi, norm_mean=20, norm_sd=6)
        
    # 2. Global Composites
    
    # Full Scale IQ (FSIQ) - Based on the Big 7
    fsiq_subtests = ["Similarities", "Vocabulary", "Block Design", "Matrix Reasoning", "Figure Weights", "Digit Sequencing", "Coding"]
    if all(s in subtest_scores for s in fsiq_subtests):
        sum_fsiq = sum(subtest_scores[s] for s in fsiq_subtests)
        indices["FSIQ"] = calculate_deviation_iq(sum_fsiq, norm_mean=70, norm_sd=21)
        
    # Nonverbal Index (NVI) - 6 subtests
    nvi_subtests = ["Block Design", "Visual Puzzles", "Matrix Reasoning", "Figure Weights", "Coding", "Symbol Search"]
    if all(s in subtest_scores for s in nvi_subtests):
        sum_nvi = sum(subtest_scores[s] for s in nvi_subtests)
        indices["NVI"] = calculate_deviation_iq(sum_nvi, norm_mean=60, norm_sd=18)
        
    return indices

def calculate_gs_metrics(responses: list, latencies: list, domains: list) -> dict:
    """Calculates granular Processing Speed (Gs) metrics for PSI analysis."""
    gs_indices = [i for i, d in enumerate(domains) if d == "Gs"]
    if not gs_indices:
        return {"gs_score": 0.0, "mrt": 0.0}
    
    gs_responses = [responses[i] for i in gs_indices]
    gs_latencies = [latencies[i] for i in gs_indices if latencies[i] > 0]
    
    if not gs_latencies:
        return {"gs_score": 0.0, "mrt": 0.0}
        
    accuracy = sum(gs_responses) / len(gs_responses)
    median_latency = float(np.median(gs_latencies))
    
    return {
        "mrt": round(median_latency, 2),
        "accuracy": round(accuracy * 100, 1)
    }
