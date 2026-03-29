import inspect
from catsim import selection, estimation
import numpy as np

selector = selection.MaxInfoSelector()
estimator = estimation.NumericalSearchEstimator()

print("Selector.select signagture:")
print(inspect.signature(selector.select))

print("\nEstimator.estimate signature:")
print(inspect.signature(estimator.estimate))
