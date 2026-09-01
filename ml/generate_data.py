import os
import numpy as np
import pandas as pd

def generate_synthetic_data(n_samples=3500, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Generate basic independent features
    age = np.random.normal(loc=55, scale=18, size=n_samples)
    age = np.clip(age, 18, 95).astype(int)
    
    treatment_duration_months = np.random.exponential(scale=12, size=n_samples)
    treatment_duration_months = np.clip(treatment_duration_months, 0, 120).astype(int)
    
    distance_km = np.random.lognormal(mean=2.5, sigma=1.0, size=n_samples)
    distance_km = np.clip(distance_km, 0, 150).astype(int)
    
    appointment_frequency_days = np.random.choice([7, 14, 30, 60, 90, 180], size=n_samples, p=[0.1, 0.2, 0.4, 0.2, 0.05, 0.05])
    
    # 2. Generate previous appointments
    previous_appointments = np.random.poisson(lam=5, size=n_samples)
    
    # 3. Generate missed appointments (dependent on previous_appointments and some underlying risk)
    # Higher distance and longer treatment duration increases base chance of having missed appointments
    base_miss_prob = 0.1 + (distance_km / 150) * 0.15 + (treatment_duration_months / 120) * 0.1
    missed_appointments = np.random.binomial(n=previous_appointments, p=base_miss_prob)
    
    # Ensure constraint
    missed_appointments = np.clip(missed_appointments, 0, previous_appointments)
    
    # 4. Calculate a latent risk score for the target variable
    # We want these features to realistically correlate with missing the next appointment
    
    # Normalize features roughly to 0-1 range for the linear combination
    norm_missed_ratio = np.where(previous_appointments > 0, missed_appointments / previous_appointments, 0)
    norm_distance = distance_km / 150
    norm_duration = treatment_duration_months / 120
    norm_frequency = 1 - (appointment_frequency_days / 180) # higher frequency -> higher risk
    norm_age = (95 - age) / 77 # slightly higher risk for younger patients in this synthetic scenario
    
    latent_risk = (
        3.5 * norm_missed_ratio +
        2.0 * norm_distance +
        1.0 * norm_duration +
        1.5 * norm_frequency +
        0.5 * norm_age +
        np.random.normal(loc=0, scale=0.8, size=n_samples) # Add realistic noise
    )
    
    # Convert latent risk to probability using sigmoid
    probability = 1 / (1 + np.exp(-(latent_risk - 2.5))) # center around a reasonable threshold
    
    # Generate binary target based on probability
    missed_next_followup = np.random.binomial(n=1, p=probability)
    
    # Create DataFrame
    df = pd.DataFrame({
        'patient_id': [f"P{i:05d}" for i in range(1, n_samples + 1)],
        'age': age,
        'previous_appointments': previous_appointments,
        'missed_appointments': missed_appointments,
        'distance_km': distance_km,
        'treatment_duration_months': treatment_duration_months,
        'appointment_frequency_days': appointment_frequency_days,
        'missed_next_followup': missed_next_followup
    })
    
    return df

if __name__ == "__main__":
    print("Generating synthetic patient data...")
    df = generate_synthetic_data(n_samples=3500)
    
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    output_path = os.path.join('data', 'synthetic_patients.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated with {len(df)} records at {output_path}")
    print(df['missed_next_followup'].value_counts(normalize=True))
    print(df.head())
