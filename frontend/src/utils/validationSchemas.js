// Validation utility functions for account credentials and patient health record inputs

export function getUsernameChecks(username) {
  const value = username || '';
  return {
    length: value.length >= 5 && value.length <= 32,
    startsWithLetter: /^[a-z]/.test(value),
    charset: /^[a-z0-9_]+$/.test(value),
    hasNumber: /\d/.test(value),
  };
}

export function getPasswordChecks(password, username, email) {
  const value = password || '';
  const name = (username || '').trim().toLowerCase();
  const local = (email || '').split('@')[0].trim().toLowerCase();
  const containsUsername = name.length >= 5 && value.toLowerCase().includes(name);
  const containsEmail = local.length >= 4 && value.toLowerCase().includes(local);
  return {
    length: value.length >= 12 && value.length <= 128,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*(),.?":{}|<>\-_]/.test(value),
    notUsername: value.length > 0 && !containsUsername && !containsEmail,
  };
}

export function isUsernameReady(username) {
  return Object.values(getUsernameChecks(username)).every(Boolean);
}

export function isPasswordReady(password, username, email) {
  return Object.values(getPasswordChecks(password, username, email)).every(Boolean);
}

/**
 * Validate diabetes input form data against required boundaries
 * @param {Object} data - Diabetes feature object
 * @returns {Object} Validation result { isValid, errors }
 */
export function validateDiabetesInput(data) {
  const errors = {};

  if (data.pregnancies < 0 || data.pregnancies > 20) {
    errors.pregnancies = 'Pregnancies must be between 0 and 20.';
  }
  if (data.glucose < 0 || data.glucose > 300) {
    errors.glucose = 'Glucose level must be between 0 and 300 mg/dL.';
  }
  if (data.blood_pressure < 0 || data.blood_pressure > 200) {
    errors.blood_pressure = 'Blood pressure must be between 0 and 200 mmHg.';
  }
  if (data.bmi < 0 || data.bmi > 70) {
    errors.bmi = 'BMI must be between 0 and 70 kg/m².';
  }
  if (data.age < 1 || data.age > 120) {
    errors.age = 'Age must be between 1 and 120 years.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate cardiovascular input form data
 * @param {Object} data - Cardio feature object
 * @returns {Object} Validation result { isValid, errors }
 */
export function validateCardioInput(data) {
  const errors = {};

  if (data.age < 1 || data.age > 120) {
    errors.age = 'Age must be between 1 and 120 years.';
  }
  if (data.sex !== 0 && data.sex !== 1) {
    errors.sex = 'Sex must be 0 (female) or 1 (male).';
  }
  if (data.trestbps < 50 || data.trestbps > 250) {
    errors.trestbps = 'Resting blood pressure must be between 50 and 250 mmHg.';
  }
  if (data.chol < 100 || data.chol > 600) {
    errors.chol = 'Cholesterol must be between 100 and 600 mg/dL.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}