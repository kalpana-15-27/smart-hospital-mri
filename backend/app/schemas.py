from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    username: str
    full_name: str
    role: str
    department: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ----------------- Patient Schemas -----------------
class PatientBase(BaseModel):
    name: str = Field(..., example="Eleanor Vance")
    age: int = Field(..., ge=0, le=130, example=45)
    gender: str = Field(..., example="Female")
    department: str = Field(..., example="Emergency Neurology")
    doctor_name: str = Field(..., example="Dr. Sarah Sharma")
    triage_level: str = Field(default="Standard", example="Emergency")
    vitals_summary: Optional[str] = Field(None, example="BP: 145/95, HR: 110, SpO2: 96%")

class PatientCreate(PatientBase):
    patient_id: Optional[str] = None  # Auto-generated if not provided

class PatientResponse(PatientBase):
    id: int
    patient_id: str
    admission_time: datetime

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
    created_at: datetime
    processed_at: Optional[datetime]
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
    description: Optional[str]

    class Config:
        from_attributes = True

class QoSEventResponse(BaseModel):
    id: int
    timestamp: datetime
    request_id: Optional[str]
    event_type: str
    source_ip: str
    dest_ip: str
    dscp_marked: int
    queue_assigned: str
    action_taken: str
    is_spoofed_attempt: bool
    details: Optional[str]

    class Config:
        from_attributes = True

class NetworkMetricResponse(BaseModel):
    id: int
    timestamp: datetime
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
    timestamp: datetime
    user_id: Optional[int]
    username: str
    action: str
    ip_address: str
    details: Optional[str]
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
