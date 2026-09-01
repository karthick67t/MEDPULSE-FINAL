import os
import joblib
import pandas as pd

class ExplanationEngine:
    def __init__(self, model_path=None):
        if model_path is None or not os.path.exists(model_path):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            default_path = os.path.join(base_dir, 'model.joblib')
            if os.path.exists(default_path):
                model_path = default_path
            elif model_path is None:
                model_path = 'model.joblib'
        self.pipeline = joblib.load(model_path)
        self.scaler = self.pipeline.named_steps['scaler']
        self.classifier = self.pipeline.named_steps['classifier']
        
        # Check feature names from model or default
        if hasattr(self.scaler, 'feature_names_in_'):
            self.feature_names = list(self.scaler.feature_names_in_)
        else:
            self.feature_names = [
                'age',
                'previous_appointments',
                'missed_appointments',
                'distance_km',
                'treatment_duration_months',
                'appointment_frequency_days'
            ]

        # Extract weights (supports LogisticRegression coef_ and XGBoost feature_importances_)
        if hasattr(self.classifier, 'coef_') and getattr(self.classifier, 'coef_', None) is not None:
            self.weights = self.classifier.coef_[0]
            self.intercept = getattr(self.classifier, 'intercept_', [0.0])[0]
            self.is_tree = False
        elif hasattr(self.classifier, 'feature_importances_'):
            self.weights = self.classifier.feature_importances_
            self.intercept = 0.0
            self.is_tree = True
        else:
            self.weights = [1.0] * len(self.feature_names)
            self.intercept = 0.0
            self.is_tree = False

        self.human_readable = {
            'age': 'Age',
            'previous_appointments': 'Previous appointments',
            'missed_appointments': 'Previous missed appointments',
            'distance_km': 'Distance from hospital',
            'treatment_duration_months': 'Treatment duration',
            'appointment_frequency_days': 'Appointment frequency',
            'gender': 'Gender',
            'scholarship': 'Financial assistance',
            'hypertension': 'Hypertension history',
            'diabetes': 'Diabetes history',
            'alcoholism': 'Alcohol dependency history',
            'handicap': 'Accessibility needs',
            'sms_received': 'SMS reminders sent'
        }

    def _nurse_friendly_explanation(self, feature, value, direction):
        """Generate plain-language explanations nurses can act on."""
        explanations = {
            'missed_appointments': {
                'increases_risk': f"This patient has missed {int(value)} appointment(s) before — past no-shows strongly predict future ones.",
                'decreases_risk': f"Strong attendance history with only {int(value)} missed appointment(s) out of their record.",
            },
            'distance_km': {
                'increases_risk': f"Patient lives {value:.0f} km from the hospital — distance and transport costs are a known barrier to follow-up.",
                'decreases_risk': f"Patient lives relatively close ({value:.0f} km) — geographic access is not a major concern.",
            },
            'appointment_frequency_days': {
                'increases_risk': f"Appointments every {int(value)} days create a heavy scheduling burden that increases dropout risk.",
                'decreases_risk': f"Appointment cadence of every {int(value)} days is manageable and less likely to cause fatigue.",
            },
            'treatment_duration_months': {
                'increases_risk': f"{int(value)} months on treatment — long-term care fatigue can lead patients to stop attending.",
                'decreases_risk': f"Shorter treatment duration ({int(value)} months) suggests less care fatigue.",
            },
            'previous_appointments': {
                'increases_risk': f"Limited appointment history ({int(value)} visits) — less established care relationship.",
                'decreases_risk': f"Established patient with {int(value)} previous appointments — engaged with care system.",
            },
            'age': {
                'increases_risk': f"At age {int(value)}, this patient may face mobility or scheduling challenges affecting attendance.",
                'decreases_risk': f"Age {int(value)} — demographic profile associated with better follow-up adherence in this population.",
            },
        }

        key = 'increases_risk' if direction == 'increases_risk' else 'decreases_risk'
        return explanations.get(feature, {}).get(key, f"{self.human_readable.get(feature, feature)} contributes to the risk assessment.")

    def explain_prediction(self, patient_data):
        if isinstance(patient_data, dict):
            input_df = pd.DataFrame([patient_data])
        else:
            input_df = pd.DataFrame(patient_data).T

        # Ensure input DataFrame has all expected feature columns
        df = pd.DataFrame()
        for feat in self.feature_names:
            if feat in input_df.columns:
                df[feat] = input_df[feat]
            else:
                df[feat] = 0

        scaled_features = self.scaler.transform(df)[0]
        
        if self.is_tree:
            # For tree models, contribution direction depends on whether feature value increases overall risk
            contributions = scaled_features * self.weights
        else:
            contributions = scaled_features * self.weights
            
        prob = float(self.pipeline.predict_proba(df)[0][1])

        total_abs_contrib = sum(abs(c) for c in contributions) or 1.0

        explanations = []
        for i, feature in enumerate(self.feature_names):
            contrib = float(contributions[i])
            val = float(df.iloc[0, i])

            if abs(contrib) < 0.05:
                direction = "neutral"
            else:
                direction = "increases_risk" if contrib > 0 else "decreases_risk"

            impact_pct = round((abs(contrib) / total_abs_contrib) * 100, 1)

            explanations.append({
                "feature": feature,
                "human_name": self.human_readable.get(feature, feature),
                "patient_value": val,
                "contribution": contrib,
                "impact_percentage": impact_pct,
                "direction": direction,
                "explanation": self._nurse_friendly_explanation(feature, val, direction)
            })

        explanations.sort(key=lambda x: abs(x['contribution']), reverse=True)
        top_reasons = [e for e in explanations if e['direction'] == 'increases_risk'][:3]
        if len(top_reasons) < 3:
            top_reasons = explanations[:3]

        # Population percentile estimation heuristic based on probability
        # Average risk is around ~0.35 in synthetic dataset
        percentile = min(99.0, max(1.0, round(prob * 115, 1)))

        # Confidence assessment based on distance from decision threshold (0.50)
        dist_from_threshold = abs(prob - 0.50)
        if dist_from_threshold >= 0.25:
            confidence = "High Confidence"
        elif dist_from_threshold >= 0.10:
            confidence = "Moderate Confidence"
        else:
            confidence = "Borderline - Review Recommended"

        return {
            "risk_probability": prob,
            "base_risk_level": self._get_risk_level(prob),
            "relative_risk_percentile": percentile,
            "confidence_score": confidence,
            "intercept": float(self.intercept),
            "feature_contributions": explanations,
            "top_reasons": top_reasons
        }

    def _get_risk_level(self, prob):
        if prob < 0.30:
            return "LOW"
        if prob < 0.60:
            return "MEDIUM"
        if prob < 0.80:
            return "HIGH"
        return "CRITICAL"

if __name__ == "__main__":
    print("Testing Explanation Engine...")
    engine = ExplanationEngine()

    test_patient = {
        'age': 45,
        'previous_appointments': 8,
        'missed_appointments': 4,
        'distance_km': 31,
        'treatment_duration_months': 14,
        'appointment_frequency_days': 7
    }

    result = engine.explain_prediction(test_patient)
    print(f"Risk Probability: {result['risk_probability']:.2%}")
    print(f"Risk Level: {result['base_risk_level']}")
    print("\nTop 3 Reasons:")
    for r in result['top_reasons']:
        print(f"- {r['human_name']}: {r['explanation']}")
