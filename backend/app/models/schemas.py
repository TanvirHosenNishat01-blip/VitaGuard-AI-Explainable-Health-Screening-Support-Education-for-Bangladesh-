from typing import Optional, List, Union, Dict, Any
from pydantic import BaseModel, Field


# ==========================================
# DIABETES SCHEMAS
# ==========================================
class PatientInputSchema(BaseModel):
    """
    Validates incoming body parameters for Diabetes assessment.
    """
    Pregnancies: int = Field(..., ge=0, le=17, description="Number of pregnancies recorded in the public table")
    Glucose: float = Field(..., ge=44, le=199, description="Plasma glucose concentration (mg/dl)")
    BloodPressure: float = Field(..., ge=24, le=122, description="Diastolic blood pressure (mm Hg)")
    SkinThickness: float = Field(..., ge=7, le=99, description="Triceps skin fold thickness (mm)")
    Insulin: float = Field(..., ge=14, le=846, description="2-Hour serum insulin (mu U/ml)")
    BMI: float = Field(..., ge=18.2, le=67.1, description="Body mass index (kg/m^2)")
    DiabetesPedigreeFunction: float = Field(..., ge=0.078, le=2.42, description="Diabetes pedigree function score")
    Age: int = Field(..., ge=21, le=81, description="Age in years")


class PredictionResponseSchema(BaseModel):
    """
    API response schema for diabetes prediction.
    """
    prediction: int
    risk_probability_percentage: float
    risk_level: str
    record_id: Optional[int] = None
    user_id: Optional[int] = None


# ==========================================
# CARDIOVASCULAR SCHEMAS
# ==========================================
class CardioInputSchema(BaseModel):
    """
    Validates incoming body parameters for Cardiovascular assessment.
    Accepts float/int values seamlessly.
    """
    age: float = Field(..., ge=29, le=77, description="Age in years")
    sex: float = Field(..., ge=0, le=1, description="Sex (1 = male, 0 = female)")
    cp: float = Field(..., ge=0, le=3, description="Chest pain type (0-3)")
    trestbps: float = Field(..., ge=94, le=200, description="Resting blood pressure (mm Hg)")
    chol: float = Field(..., ge=126, le=564, description="Serum cholesterol (mg/dl)")
    fbs: float = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)")
    restecg: float = Field(..., ge=0, le=2, description="Resting electrocardiographic results (0-2)")
    thalach: float = Field(..., ge=71, le=202, description="Maximum heart rate achieved")
    exang: float = Field(..., ge=0, le=1, description="Exercise induced angina (1 = yes, 0 = no)")
    oldpeak: float = Field(..., ge=0, le=6.2, description="ST depression induced by exercise relative to rest")
    slope: float = Field(..., ge=0, le=2, description="Slope of the peak exercise ST segment (0-2)")
    ca: float = Field(..., ge=0, le=3, description="Major vessels colored by fluoroscopy (0-3)")
    thal: float = Field(..., ge=0, le=2, description="Thalassemia code in this table (0-2)")


class CardioPredictionResponseSchema(BaseModel):
    """
    API response schema for cardiovascular prediction.
    """
    prediction: int
    risk_level: str
    risk_probability_percentage: float
    record_id: Optional[int] = None
    user_id: Optional[int] = None


# ==========================================
# AUTH SCHEMAS
# ==========================================
class RegisterSchema(BaseModel):
    username: str = Field(..., min_length=5, max_length=32, description="Lowercase username with a letter and a number")
    password: str = Field(..., min_length=12, max_length=128, description="Account password")
    full_name: str = Field(..., min_length=1, max_length=120, description="Full legal name")
    role: str = Field(default="patient", description="User role (e.g., patient, doctor)")


class LoginSchema(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    totp_code: Optional[str] = None


class AuthResponseSchema(BaseModel):
    token: str
    role: str
    user: str


# ==========================================
# DASHBOARD & RECORD SCHEMAS
# ==========================================
class MeasurementSchema(BaseModel):
    id: Union[int, str]
    type: str
    date: Optional[str] = None
    status: str
    risk_level: Optional[str] = None
    risk_probability_percentage: Optional[float] = None


class PatientDashboardSchema(BaseModel):
    user: Dict[str, Any]
    measurements: List[MeasurementSchema]


class DoctorRecordSchema(BaseModel):
    id: Union[int, str]
    type: str
    date: Optional[str] = None
    username: Optional[str] = None
    risk_level: Optional[str] = None
    risk_probability_percentage: Optional[float] = None