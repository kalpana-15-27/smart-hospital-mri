from datetime import datetime, timezone
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, PlainSerializer

# Strict UTC ISO 8601 Serializer (e.g., 2026-10-02T21:30:00Z)
def format_utc_iso(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    # Ensure timezone awareness (SQLite stores naive UTC datetimes)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

StrictUtcDateTime = Annotated[
    datetime,
    PlainSerializer(format_utc_iso, return_type=str)
]

OptionalStrictUtcDateTime = Annotated[
    Optional[datetime],
    PlainSerializer(format_utc_iso, return_type=Optional[str])
]

# ----------------- User & Authentication Schemas -----------------
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="dr_watson")
    full_name: str = Field(..., example="Dr. John Watson, MD")
    role: str = Field(default="DOCTOR", example="DOCTOR")
    department: str = Field(default="Emergency Medicine & Trauma", example="Emergency Medicine & Trauma")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="TempDocPass2026!")

class AdminCreateDoctorRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="dr_watson")
    password: str = Field(..., min_length=6, description="Temporary password hashed using bcrypt", example="TempDoctor2026!")
    full_name: str = Field(default="Dr. New Physician, MD", example="Dr. John Watson, MD")
    department: str = Field(default="Emergency Medicine & Trauma", example="Emergency Medicine & Trauma")

class UserResponse(UserBase):
    id: int
    is_active: bool
    requires_password_change: bool
    created_at: StrictUtcDateTime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str = Field(..., example="dr_sharma")
    password: str = Field(..., example="password123")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    requires_password_change: bool = False
    user: UserResponse

class ChangePasswordRequest(BaseModel):
    username: Optional[str] = Field(None, example="dr_watson")
    old_password: str = Field(..., min_length=1, example="TempDoctor2026!")
    new_password: str = Field(..., min_length=6, example="SecurePermanentDocPass2026!")

class ChangePasswordResponse(BaseModel):
    status: str = "success"
    message: str
    access_token: str
    token_type: str = "bearer"
    requires_password_change: bool = False
    user: UserResponse

# ----------------- Patient Schemas -----------------
class PatientBase(BaseModel):
    name: str = Field(..., example="Eleanor Vance")
    age: int = Field(..., ge=0, le=130, example=45)
    gender: str = Field(..., example="Female")
    department: str = Field(..., example="Emergency Neurology")
    doctor_name: Optional[str] = Field(None, example="Dr. Sarah Sharma, MD")
    triage_level: str = Field(default="Standard", example="Emergency")
    vitals_summary: Optional[str] = Field(None, example="BP: 145/95, HR: 110, SpO2: 96%")

class PatientCreate(PatientBase):
    patient_id: Optional[str] = None  # Auto-generated if not provided

class PatientResponse(PatientBase):
    id: int
    patient_id: str
    admission_time: StrictUtcDateTime

    class Config:
        from_attributes = True

# ----------------- MRI Request Schemas -----------------
class MRIRequestCreate(BaseModel):
    patient_id: int
    mri_type: str = Field(..., example="Emergency Brain Trauma & Angiography")
    clinical_reason: str = Field(..., example="Acute Ischemic Stroke suspicion with neurological deficits within 2h window")
    urgency: str = Field(..., example="EMERGENCY")  # EMERGENCY, URGENT, NORMAL
    source_ip: Optional[str] = Field(None, example="192.168.10.10")
    image_size_mb: Optional[float] = Field(default=350.0, example=350.0)

class MRIRequestResponse(BaseModel):
    id: int
    request_id: str
    patient_id: int
    mri_type: str
    clinical_reason: str
    urgency: str
    
    # Layer 3 / QoS Parameters
    source_ip: str
    dest_ip: str
    dscp_value: int
    dscp_name: str
    dscp_binary: str
    ip_precedence: int
    queue_assigned: str
    
    # Execution & Metric parameters
    image_size_mb: float
    status: str
    estimated_transfer_sec: float
    actual_transfer_sec: float
    latency_ms: float
    packet_loss_pct: float
    throughput_mbps: float
    
    created_by_user_id: int
    created_at: StrictUtcDateTime
    processed_at: OptionalStrictUtcDateTime = None
    patient: Optional[PatientResponse] = None

    class Config:
        from_attributes = True

class TransmitStudyRequest(BaseModel):
    background_traffic_mbps: float = Field(default=50.0, ge=0.0, le=100.0)
    enable_qos: bool = Field(default=True)

# ----------------- Network & Device Schemas -----------------
class NetworkDeviceResponse(BaseModel):
    id: int
    device_name: str
    ip_address: str
    mac_address: str
    vlan_id: int
    vlan_name: str
    device_type: str
    is_trusted: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True

class QoSEventResponse(BaseModel):
    id: int
    timestamp: StrictUtcDateTime
    request_id: Optional[str] = None
    event_type: str
    source_ip: str
    dest_ip: str
    dscp_marked: int
    queue_assigned: str
    action_taken: str
    is_spoofed_attempt: bool
    details: Optional[str] = None

    class Config:
        from_attributes = True

class NetworkMetricResponse(BaseModel):
    id: int
    timestamp: StrictUtcDateTime
    scenario: str
    background_traffic_mbps: float
    latency_ms: float
    jitter_ms: float
    throughput_mbps: float
    packet_loss_pct: float
    emergency_wait_sec: float
    normal_wait_sec: float
    queue_depth: int

    class Config:
        from_attributes = True

# ----------------- Audit Log Schemas -----------------
class AuditLogResponse(BaseModel):
    id: int
    timestamp: StrictUtcDateTime
    user_id: Optional[int] = None
    username: str
    action: str
    ip_address: str
    details: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

# ----------------- Dashboard & Analytics Schemas -----------------
class DashboardStats(BaseModel):
    total_patients: int
    total_mri_requests: int
    active_emergency_count: int
    active_urgent_count: int
    active_normal_count: int
    avg_emergency_transfer_sec: float
    avg_normal_transfer_sec: float
    current_latency_ms: float
    current_throughput_mbps: float
    qos_engine_status: str
    router_gateway: str

# ----------------- Clinical Access Request Schemas -----------------
class AccessRequestCreate(BaseModel):
    full_name: str
    department: str
    email: str
    staff_id: str

class AccessRequestResponse(BaseModel):
    id: int
    full_name: str
    department: str
    email: str
    staff_id: str
    status: str
    created_at: StrictUtcDateTime
    reviewed_at: OptionalStrictUtcDateTime = None
    reviewed_by: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class AccessRequestAction(BaseModel):
    action: str  # "APPROVE" or "REJECT"
    notes: Optional[str] = None
