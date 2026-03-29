# Sample Item Bank with IRT Parameters (Calibrated via Expert Review)
# Parameters:
# a: Discrimination (Higher = better at separating high/low ability)
# b: Difficulty (Z-scale: -3 to +3)
# c: Pseudo-guessing (Lower = less chance of guessing correctly)

ITEM_BANK = [
    # Gf - Matrix Reasoning Items
    {"id": "gf_m_001", "domain": "Gf", "type": "matrix", "a": 1.2, "b": -1.5, "c": 0.2, "metadata": {"name": "Simple Linear Pattern"}},
    {"id": "gf_m_002", "domain": "Gf", "type": "matrix", "a": 1.4, "b": -0.5, "c": 0.2, "metadata": {"name": "Dual Attribute Swap"}},
    {"id": "gf_m_003", "domain": "Gf", "type": "matrix", "a": 1.7, "b": 0.5, "c": 0.15, "metadata": {"name": "Sequential Transform"}},
    {"id": "gf_m_004", "domain": "Gf", "type": "matrix", "a": 2.1, "b": 1.8, "c": 0.12, "metadata": {"name": "Geometric Logic Convolution"}},
    {"id": "gf_m_005", "domain": "Gf", "type": "matrix", "a": 2.4, "b": 2.8, "c": 0.1, "metadata": {"name": "High Complexity Recursive Pattern"}},

    # Gwm - Working Memory (Digit Span / Seq)
    {"id": "gwm_d_001", "domain": "Gwm", "type": "digit_span", "a": 1.1, "b": -1.0, "c": 0.0, "metadata": {"length": 4}},
    {"id": "gwm_d_002", "domain": "Gwm", "type": "digit_span", "a": 1.3, "b": 0.0, "c": 0.0, "metadata": {"length": 6}},
    {"id": "gwm_d_003", "domain": "Gwm", "type": "digit_span", "a": 1.6, "b": 1.2, "c": 0.0, "metadata": {"length": 8}},
    {"id": "gwm_d_004", "domain": "Gwm", "type": "digit_span", "a": 1.9, "b": 2.5, "c": 0.0, "metadata": {"length": 10}},

    # Gc - Crystallized Knowledge (Vocab/Analogies)
    {"id": "gc_v_001", "domain": "Gc", "type": "word_analogy", "a": 1.1, "b": -0.8, "c": 0.1, "metadata": {"level": "Basic"}},
    {"id": "gc_v_002", "domain": "Gc", "type": "word_analogy", "a": 1.4, "b": 0.5, "c": 0.1, "metadata": {"level": "Expert"}},
]

def get_bank_matrix():
    """Returns bank in a format suitable for catsim (numpy matrix [a, b, c, d])"""
    import numpy as np
    # catsim expects columns: [a, b, c, d] where d is often 1.0 (IRT 3PL format)
    # If using 2PL, set c to 0 and d to 1
    matrix = []
    for item in ITEM_BANK:
        matrix.append([item['a'], item['b'], item['c'], 1.0])
    return np.matrix(matrix)
