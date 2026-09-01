import json
import os
import joblib
import pandas as pd
from sklearn.metrics import recall_score, precision_score, confusion_matrix

FEATURES = ['age', 'previous_appointments', 'missed_appointments', 'appointment_frequency_days']


def evaluate_fairness():
    pipeline = joblib.load('model.joblib')
    df = pd.read_csv(os.path.join('data', 'synthetic_patients.csv'))
    y = df['missed_next_followup'].astype(int)
    y_pred = pipeline.predict(df[FEATURES])
    df['age_group'] = pd.cut(df['age'], bins=[17, 39, 59, 120], labels=['18-39', '40-59', '60+'])
    fairness_metrics = {}
    for group in ['18-39', '40-59', '60+']:
        mask = df['age_group'] == group
        y_true, predictions = y[mask], y_pred[mask]
        if not len(y_true):
            continue
        tn, fp, fn, tp = confusion_matrix(y_true, predictions, labels=[0, 1]).ravel()
        fairness_metrics[group] = {
            'recall': float(recall_score(y_true, predictions, zero_division=0)),
            'precision': float(precision_score(y_true, predictions, zero_division=0)),
            'fpr': float(fp / (fp + tn)) if fp + tn else 0.0,
            'sample_size': int(len(y_true)),
        }
    with open('fairness_metrics.json', 'w') as handle:
        json.dump(fairness_metrics, handle, indent=2)
    print('Fairness metrics saved.')


if __name__ == '__main__':
    evaluate_fairness()
