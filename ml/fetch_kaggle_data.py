import os
import pandas as pd
import kagglehub
import numpy as np

def fetch_and_prepare_data():
    print("Downloading dataset from Kaggle...")
    # Download latest version
    path = kagglehub.dataset_download("joniarroba/noshowappointments")
    print("Path to dataset files:", path)
    
    # Usually the file is named KaggleV2-May-2016.csv
    csv_file = None
    for file in os.listdir(path):
        if file.endswith('.csv'):
            csv_file = os.path.join(path, file)
            break
            
    if not csv_file:
        raise FileNotFoundError("Could not find CSV file in downloaded dataset")
        
    print(f"Loading data from {csv_file}...")
    df_kaggle = pd.read_csv(csv_file)
    
    print("Processing and transforming data to match FollowUpAI schema...")
    
    # 1. Target variable
    df_kaggle['is_missed'] = df_kaggle['No-show'].apply(lambda x: 1 if x == 'Yes' else 0)
    
    # Sort by PatientId and ScheduledDay to accurately calculate past history
    df_kaggle['ScheduledDay'] = pd.to_datetime(df_kaggle['ScheduledDay'])
    df_kaggle['AppointmentDay'] = pd.to_datetime(df_kaggle['AppointmentDay'])
    df_kaggle = df_kaggle.sort_values(['PatientId', 'ScheduledDay'])
    
    # 2. Historical features
    # Cumulative sum of missed appointments before this one
    df_kaggle['missed_appointments'] = df_kaggle.groupby('PatientId')['is_missed'].cumsum() - df_kaggle['is_missed']
    # Total previous appointments
    df_kaggle['previous_appointments'] = df_kaggle.groupby('PatientId').cumcount()
    
    # 3. Lead time (days between scheduling and appointment) -> can be a proxy for appointment_frequency_days
    # Convert datetimes to timezone-naive datetimes, then calculate difference
    df_kaggle['ScheduledDay'] = pd.to_datetime(df_kaggle['ScheduledDay']).dt.tz_localize(None)
    df_kaggle['AppointmentDay'] = pd.to_datetime(df_kaggle['AppointmentDay']).dt.tz_localize(None)
    df_kaggle['lead_time_days'] = (df_kaggle['AppointmentDay'] - df_kaggle['ScheduledDay']).dt.days    # Fix negative lead times
    df_kaggle['lead_time_days'] = df_kaggle['lead_time_days'].apply(lambda x: max(0, x))
    
    # 4. Synthesize/Map missing required features for the model
    # The existing model requires: 
    # age, previous_appointments, missed_appointments, distance_km, treatment_duration_months, appointment_frequency_days
    
    # We will map lead_time_days to appointment_frequency_days
    # For distance and treatment duration, we will synthesize reasonable values based on neighbourhoods or random
    np.random.seed(42)
    
    df_custom = pd.DataFrame({
        'patient_id': df_kaggle['PatientId'].astype(str) + "_" + df_kaggle.index.astype(str),
        'age': df_kaggle['Age'].apply(lambda x: max(0, x)), # fix negative ages
        'previous_appointments': df_kaggle['previous_appointments'],
        'missed_appointments': df_kaggle['missed_appointments'],
        'distance_km': np.random.uniform(0.5, 30.0, size=len(df_kaggle)).round(1), # mock distance
        'treatment_duration_months': np.random.randint(1, 36, size=len(df_kaggle)), # mock duration
        'appointment_frequency_days': df_kaggle['lead_time_days'],
        'gender': df_kaggle['Gender'].apply(lambda x: 1 if x == 'F' else 0), # F=1, M=0
        'scholarship': df_kaggle['Scholarship'],
        'hypertension': df_kaggle['Hipertension'],
        'diabetes': df_kaggle['Diabetes'],
        'alcoholism': df_kaggle['Alcoholism'],
        'handicap': df_kaggle['Handcap'],
        'sms_received': df_kaggle['SMS_received'],
        'missed_next_followup': df_kaggle['is_missed']
    })
    
    # Ensure no negative values
    df_custom = df_custom[df_custom['age'] >= 0]
    
    # Save to data directory
    output_path = os.path.join(os.path.dirname(__file__), 'data', 'synthetic_patients.csv')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_custom.to_csv(output_path, index=False)
    
    print(f"Successfully processed {len(df_custom)} records.")
    print(f"Data saved to {output_path}")
    print("You can now run 'python train.py' to train the model on the real Kaggle data!")

if __name__ == "__main__":
    fetch_and_prepare_data()
