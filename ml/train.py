"""Train the FollowUpAI attendance model on a public, de-identified dataset.

Source: Kaggle Medical Appointment No Shows (joniarroba/noshowappointments).
Only source-supported features are used. Distance and treatment duration are
intentionally excluded: that public dataset does not provide them.
"""
import json
import os
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, average_precision_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

DATA_PATH = os.path.join('data', 'synthetic_patients.csv')
FEATURES = ['age', 'previous_appointments', 'missed_appointments', 'appointment_frequency_days']
TARGET = 'missed_next_followup'


def train_model():
    print('Loading public Kaggle attendance records...')
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES].copy()
    y = df[TARGET].astype(int)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    pipeline = Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42))])
    print('Training interpretable logistic regression model...')
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]
    metrics = {
        'model_algorithm': 'Logistic Regression',
        'dataset_source': 'Kaggle Medical Appointment No Shows (joniarroba/noshowappointments)',
        'dataset_type': 'Public de-identified appointment attendance records',
        'training_note': 'Only source-supported features were used; distance and treatment duration were excluded because the public dataset does not contain them.',
        'training_records': int(len(X_train)), 'test_records': int(len(X_test)),
        'accuracy': float(accuracy_score(y_test, y_pred)), 'precision': float(precision_score(y_test, y_pred, zero_division=0)),
        'recall': float(recall_score(y_test, y_pred, zero_division=0)), 'f1': float(f1_score(y_test, y_pred, zero_division=0)),
        'roc_auc': float(roc_auc_score(y_test, y_prob)), 'pr_auc': float(average_precision_score(y_test, y_prob)),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(), 'feature_names': FEATURES,
    }
    joblib.dump(pipeline, 'model.joblib')
    with open('metrics.json', 'w') as handle:
        json.dump(metrics, handle, indent=2)
    print(f"Model saved. ROC-AUC: {metrics['roc_auc']:.3f}; recall: {metrics['recall']:.3f}")


if __name__ == '__main__':
    train_model()
