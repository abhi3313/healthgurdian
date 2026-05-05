export const ROLES = {
  PATIENT: 'patient',
  DOCTOR:  'doctor',
  ADMIN:   'admin',
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export const RECORD_TYPES = [
  'Lab Report',
  'Prescription',
  'X-Ray',
  'MRI Scan',
  'CT Scan',
  'Blood Test',
  'ECG',
  'Ultrasound',
  'Vaccination',
  'General Checkup',
  'Other',
]

export const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Orthopedic',
  'Dermatologist',
  'Pediatrician',
  'Gynecologist',
  'Oncologist',
  'Psychiatrist',
  'Radiologist',
]

export const APPOINTMENT_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
}

export const USER_STATUS = {
  ACTIVE:    'active',
  INACTIVE:  'inactive',
  SUSPENDED: 'suspended',
}

export const VITAL_RANGES = {
  heartRate:    { min: 60,  max: 100,  unit: 'bpm' },
  bloodPressure:{ min: 90,  max: 140,  unit: 'mmHg' },
  temperature:  { min: 97,  max: 99,   unit: '°F' },
  oxygen:       { min: 95,  max: 100,  unit: '%' },
  glucose:      { min: 70,  max: 100,  unit: 'mg/dL' },
}
