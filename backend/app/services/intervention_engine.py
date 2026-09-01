def recommend_interventions(patient, risk_level, risk_prob, top_reasons=None):
    """
    Rule-based intervention engine with nurse-friendly recommendations.
    Recommendations are tied to specific risk factors, compound risks, and patient demographics.
    """
    recommendations = []
    top_reasons = top_reasons or []
    top_features = {r.get("feature", "") for r in top_reasons}

    # Compound Rule: High distance + multiple past missed appointments
    if patient.distance_km >= 20 and patient.missed_appointments >= 2:
        recommendations.append({
            "action": "Issue hospital transport voucher & initiate pre-trip planning assistance",
            "reason": f"Compound risk: {patient.missed_appointments} missed visits combined with {patient.distance_km:.0f} km distance barrier",
            "priority": "critical",
            "category": "transport",
            "icon": "map"
        })

    # Rule 1: Previous missed appointments
    if patient.missed_appointments >= 3:
        recommendations.append({
            "action": "Call patient 48 hours before appointment to confirm attendance",
            "reason": f"{patient.missed_appointments} previous missed appointments — high historical drop-out risk",
            "priority": "high",
            "category": "outreach",
            "icon": "phone"
        })
    elif patient.missed_appointments >= 1 and "missed_appointments" in top_features:
        recommendations.append({
            "action": "Send personalized SMS & voice reminder — patient has missed appointments before",
            "reason": f"{patient.missed_appointments} previous missed appointment(s)",
            "priority": "medium",
            "category": "reminder",
            "icon": "bell"
        })

    # Rule 2: Distance barrier
    if patient.distance_km >= 25 and not any(r["category"] == "transport" for r in recommendations):
        recommendations.append({
            "action": "Offer transportation support or telehealth conversion where clinically appropriate",
            "reason": f"Patient lives {patient.distance_km:.0f} km from hospital — travel distance is a primary barrier",
            "priority": "high",
            "category": "transport",
            "icon": "map"
        })
    elif patient.distance_km >= 15 and "distance_km" in top_features and not any(r["category"] == "transport" for r in recommendations):
        recommendations.append({
            "action": "Confirm patient has reliable transport to the clinic location",
            "reason": f"Moderate distance ({patient.distance_km:.0f} km) may affect attendance",
            "priority": "medium",
            "category": "transport",
            "icon": "map"
        })

    # Rule 3: Senior Patient / Caregiver Support
    if patient.age >= 65 and (patient.appointment_frequency_days <= 21 or patient.missed_appointments >= 1):
        recommendations.append({
            "action": "Include primary caregiver / emergency contact in appointment reminders and instructions",
            "reason": f"Senior patient (age {patient.age}) with frequent visits — caregiver involvement improves attendance",
            "priority": "high" if patient.missed_appointments >= 2 else "medium",
            "category": "support",
            "icon": "heart"
        })

    # Rule 4: Appointment frequency burden
    if patient.appointment_frequency_days <= 14:
        recommendations.append({
            "action": "Review scheduling burden — consider consolidating visits or offering same-day lab work",
            "reason": f"Frequent appointments every {patient.appointment_frequency_days} days create visit fatigue",
            "priority": "medium",
            "category": "scheduling",
            "icon": "calendar"
        })

    # Rule 5: Long treatment duration & fatigue
    if patient.treatment_duration_months >= 12 and ("treatment_duration_months" in top_features or patient.missed_appointments >= 2):
        recommendations.append({
            "action": "Conduct care team check-in regarding long-term treatment fatigue and motivation",
            "reason": f"{patient.treatment_duration_months} months on active treatment plan",
            "priority": "high" if patient.missed_appointments >= 2 else "medium",
            "category": "support",
            "icon": "heart"
        })

    # Rule 6: Critical / high overall risk escalation
    if (risk_prob >= 0.8 or risk_level == "CRITICAL") and not any(r["priority"] == "critical" for r in recommendations):
        recommendations.append({
            "action": "Escalate to care coordinator for same-day proactive phone outreach",
            "reason": f"Critical risk score ({risk_prob:.0%}) — immediate care coordination required",
            "priority": "critical",
            "category": "escalation",
            "icon": "alert"
        })
    elif (risk_prob >= 0.6 or risk_level == "HIGH") and not any(r["priority"] in ["critical", "high"] for r in recommendations):
        recommendations.append({
            "action": "Schedule proactive phone call within 24 hours",
            "reason": f"High risk score ({risk_prob:.0%})",
            "priority": "high",
            "category": "outreach",
            "icon": "phone"
        })

    # Default for medium risk
    if not recommendations and risk_prob >= 0.3:
        recommendations.append({
            "action": "Send automated multi-channel SMS and email appointment reminders at 72h and 24h",
            "reason": f"Moderate risk ({risk_prob:.0%}) — automated multi-channel reminder recommended",
            "priority": "low",
            "category": "reminder",
            "icon": "bell"
        })

    if not recommendations:
        recommendations.append({
            "action": "No special intervention required — continue standard care pathway",
            "reason": "Low risk profile",
            "priority": "none",
            "category": "none",
            "icon": "check"
        })

    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "none": 4}
    recommendations.sort(key=lambda r: priority_order.get(r["priority"], 5))

    return recommendations
