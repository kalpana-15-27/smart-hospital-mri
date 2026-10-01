from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)  # ADMIN, DOCTOR, RADIOLOGIST, NETWORK_ADMIN
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mri_requests = relationship("MRIRequest", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(30), unique=True, index=True, nullable=False)  # e.g., PAT-2026-001
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    department = Column(String(100), nullable=False)
    doctor_name = Column(String(100), nullable=False)
    triage_level = Column(String(20), default="Standard")  # Emergency, Urgent, Standard
    vitals_summary = Column(String(255), nullable=True)
    admission_time = Column(DateTime, default=datetime.utcnow)

    mri_requests = relationship("MRIRequest", back_populates="patient")


class MRIRequest(Base):
    __tablename__ = "mri_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(40), unique=True, index=True, nullable=False)  # e.g., MRI-REQ-2026-001
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    mri_type = Column(String(100), nullable=False)  # Brain MRI, Spine MRI, Cardiac MRI, etc.
    clinical_reason = Column(Text, nullable=False)
    urgency = Column(String(20), nullable=False)  # EMERGENCY, URGENT, NORMAL
    
    # Layer 3 / QoS Metadata
    source_ip = Column(String(45), nullable=False)
    dest_ip = Column(String(45), default="192.168.30.10")  # PACS Server IP
    dscp_value = Column(Integer, nullable=False)  # 46, 34, 0
    dscp_name = Column(String(20), nullable=False)  # EF, AF41, CS0
    dscp_binary = Column(String(10), nullable=False)  # 101110, 100010, 000000
    ip_precedence = Column(Integer, nullable=False)  # 5, 4, 0
    queue_assigned = Column(String(30), nullable=False)  # Strict Priority Queue, Assured Queue, Best Effort Queue
    
    # Study & Transfer simulation metrics
    image_size_mb = Column(Float, default=250.0)  # Standard high-res MRI study volume in MB
    status = Column(String(30), default="QUEUED")  # QUEUED, TRANSMITTING, COMPLETED, FAILED
    estimated_transfer_sec = Column(Float, default=0.0)
    actual_transfer_sec = Column(Float, default=0.0)
    latency_ms = Column(Float, default=0.0)
    packet_loss_pct = Column(Float, default=0.0)
    throughput_mbps = Column(Float, default=0.0)
    
    # Metadata
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="mri_requests")
    creator = relationship("User", back_populates="mri_requests")


class NetworkDevice(Base):
    __tablename__ = "network_devices"

    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String(100), unique=True, nullable=False)
    ip_address = Column(String(45), unique=True, nullable=False)
    mac_address = Column(String(20), nullable=False)
    vlan_id = Column(Integer, nullable=False)
    vlan_name = Column(String(50), nullable=False)
    device_type = Column(String(50), nullable=False)  # Workstation, Server, Router, Switch
    is_trusted = Column(Boolean, default=True)
    description = Column(String(255), nullable=True)


class QoSEvent(Base):
    __tablename__ = "qos_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    request_id = Column(String(40), nullable=True)
    event_type = Column(String(50), nullable=False)  # CLASSIFICATION, MARKING, SPOOF_DETECTED, QUEUED, FORWARDED
    source_ip = Column(String(45), nullable=False)
    dest_ip = Column(String(45), nullable=False)
    dscp_marked = Column(Integer, nullable=False)
    queue_assigned = Column(String(50), nullable=False)
    action_taken = Column(String(100), nullable=False)
    is_spoofed_attempt = Column(Boolean, default=False)
    details = Column(Text, nullable=True)


class NetworkMetric(Base):
    __tablename__ = "network_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    scenario = Column(String(50), nullable=False)  # FIFO_BEST_EFFORT vs QOS_PRIORITY
    background_traffic_mbps = Column(Float, nullable=False)
    latency_ms = Column(Float, nullable=False)
    jitter_ms = Column(Float, nullable=False)
    throughput_mbps = Column(Float, nullable=False)
    packet_loss_pct = Column(Float, nullable=False)
    emergency_wait_sec = Column(Float, nullable=False)
    normal_wait_sec = Column(Float, nullable=False)
    queue_depth = Column(Integer, default=0)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(45), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, WARNING, ALERT, DENIED

    user = relationship("User", back_populates="audit_logs")
