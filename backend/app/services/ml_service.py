import os
import sys

# Add ml folder to sys path to import explanation engine if needed
# Or just copy the logic here, but importing is better.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml')))
from explain import ExplanationEngine

import json

# Singleton instances
_engine = None
_metrics = None
_fairness = None

def get_explanation_engine():
    global _engine
    if _engine is None:
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'model.joblib'))
        _engine = ExplanationEngine(model_path)
    return _engine

def get_model_metrics():
    global _metrics
    if _metrics is None:
        metrics_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'metrics.json'))
        with open(metrics_path, 'r') as f:
            _metrics = json.load(f)
    return _metrics

def get_fairness_metrics():
    global _fairness
    if _fairness is None:
        fairness_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'fairness_metrics.json'))
        with open(fairness_path, 'r') as f:
            _fairness = json.load(f)
    return _fairness
