from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, Patient, MRIRequest, NetworkDevice, QoSEvent, NetworkMetric, AuditLog
from .auth import hash_password

def init_seed_db(db: Session = None):
    """Initializes the database schema and seeds initial demonstration data."""
    Base.metadata.create_all(bind=engine)
    
    close_after = False
    if db is None:
        db = SessionLocal()
        close_after = True

    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            return  # Already seeded

        # 1. Seed Users
        users = [
            User(
                username="dr_sharma",
                hashed_password=hash_password("sarah@15"),
                role="DOCTOR",
                full_name="Dr. Sarah Sharma, MD",
                department="Emergency Medicine & Trauma Center",
                requires_password_change=False,
                created_at=datetime.now(timezone.utc)
            ),
            User(
                username="dr_patel",
                hashed_password=hash_password("rajesh@15"),
                role="RADIOLOGIST",
                full_name="Dr. Rajesh Patel, MD, FRCR",
                department="Diagnostic Radiology & Neuroradiology",
                requires_password_change=False,
                created_at=datetime.now(timezone.utc)
            ),
            User(
                username="netadmin_kumar",
                hashed_password=hash_password("anand@15"),
                role="NETWORK_ADMIN",
                full_name="Anand Kumar, CCNP",
                department="Clinical IT & Healthcare Networks",
                requires_password_change=False,
                created_at=datetime.now(timezone.utc)
            ),
            User(
                username="admin1",
                hashed_password=hash_password("kalp1524"),
                role="ADMIN",
                full_name="Hospital Administrator",
                department="Hospital Operations & Governance",
                requires_password_change=False,
                created_at=datetime.now(timezone.utc)
            ),
            User(
                username="admin_dave",
                hashed_password=hash_password("dave@15"),
                role="ADMIN",
                full_name="Hospital Systems Administrator",
                department="Hospital Operations & Governance",
                requires_password_change=False,
                created_at=datetime.now(timezone.utc)
            ),
        ]
        db.add_all(users)
        db.commit()

        # Retrieve user IDs
        sharma = db.query(User).filter(User.username == "dr_sharma").first()
        patel = db.query(User).filter(User.username == "dr_patel").first()
        kumar = db.query(User).filter(User.username == "netadmin_kumar").first()

        # 2. Seed Network Devices (Hospital VLAN Topology)
        devices = [
            NetworkDevice(
                device_name="EMERGENCY-TRAUMA-WS-01",
                ip_address="192.168.10.10",
                mac_address="00:50:56:A1:10:01",
                vlan_id=10,
                vlan_name="VLAN 10 - Emergency / Clinical",
                device_type="Clinical Workstation",
                is_trusted=True,
                description="Emergency Department Resuscitation Bay Console"
            ),
            NetworkDevice(
                device_name="ICU-MONITOR-NODE-01",
                ip_address="192.168.10.15",
                mac_address="00:50:56:A1:10:05",
                vlan_id=10,
                vlan_name="VLAN 10 - Emergency / Clinical",
                device_type="ICU Monitoring Station",
                is_trusted=True,
                description="Intensive Care Unit Bedside Terminal"
            ),
            NetworkDevice(
                device_name="ROUTINE-RAD-CONSOLE-01",
                ip_address="192.168.20.10",
                mac_address="00:50:56:B2:20:01",
                vlan_id=20,
                vlan_name="VLAN 20 - Routine Imaging",
                device_type="Radiology Console",
                is_trusted=True,
                description="Outpatient Imaging Acquisition Terminal"
            ),
            NetworkDevice(
                device_name="CORE-PACS-SERVER-01",
                ip_address="192.168.30.10",
                mac_address="00:50:56:C3:30:01",
                vlan_id=30,
                vlan_name="VLAN 30 - MRI / PACS Core",
                device_type="PACS Server",
                is_trusted=True,
                description="Central Picture Archiving and Communication Server (TCP Port 104)"
            ),
            NetworkDevice(
                device_name="SIEMENS-3T-MAGNETOM",
                ip_address="192.168.30.20",
                mac_address="00:50:56:C3:30:05",
                vlan_id=30,
                vlan_name="VLAN 30 - MRI / PACS Core",
                device_type="MRI Modality Scanner",
                is_trusted=True,
                description="Siemens 3.0 Tesla Clinical MRI Scanner"
            ),
            NetworkDevice(
                device_name="RAD-DIAGNOSTIC-STATION-01",
                ip_address="192.168.30.30",
                mac_address="00:50:56:C3:30:10",
                vlan_id=30,
                vlan_name="VLAN 30 - MRI / PACS Core",
                device_type="Diagnostic Workstation",
                is_trusted=True,
                description="Radiologist High-Resolution Diagnostic Display Node"
            ),
            NetworkDevice(
                device_name="BILLING-DESK-WS-01",
                ip_address="192.168.40.10",
                mac_address="00:50:56:D4:40:01",
                vlan_id=40,
                vlan_name="VLAN 40 - Administration",
                device_type="Admin Terminal",
                is_trusted=False,
                description="Hospital Reception and Accounts Desk"
            ),
            NetworkDevice(
                device_name="ROGUE-UNAUTHORIZED-NODE",
                ip_address="192.168.99.88",
                mac_address="00:1A:2B:3C:4D:5E",
                vlan_id=99,
                vlan_name="VLAN 99 - Guest / Untrusted",
                device_type="Unauthorized Device",
                is_trusted=False,
                description="Unregistered Rogue Laptop attempting DSCP manipulation"
            )
        ]
        db.add_all(devices)
        db.commit()

        # 3. Seed Initial Patients
        patients = [
            Patient(
                patient_id="PAT-2026-001",
                name="Eleanor Vance (Patient A)",
                age=54,
                gender="Female",
                department="Orthopedics & Spine Care",
                doctor_name="Dr. Sarah Sharma, MD",
                triage_level="Standard",
                vitals_summary="BP: 120/80, HR: 72, SpO2: 99%"
            ),
            Patient(
                patient_id="PAT-2026-002",
                name="Michael Chang (Patient B)",
                age=62,
                gender="Male",
                department="Gastroenterology",
                doctor_name="Dr. Sarah Sharma, MD",
                triage_level="Standard",
                vitals_summary="BP: 128/84, HR: 76, SpO2: 98%"
            ),
            Patient(
                patient_id="PAT-2026-003",
                name="Robert Thorne (Patient C - Trauma)",
                age=38,
                gender="Male",
                department="Emergency & Trauma",
                doctor_name="Dr. Sarah Sharma, MD",
                triage_level="Emergency",
                vitals_summary="BP: 155/100, HR: 118, SpO2: 94%, GCS: 10"
            ),
            Patient(
                patient_id="PAT-2026-004",
                name="Sophia Martinez",
                age=47,
                gender="Female",
                department="Cardiology / ICU",
                doctor_name="Dr. Sarah Sharma, MD",
                triage_level="Urgent",
                vitals_summary="BP: 140/90, HR: 95, SpO2: 96%"
            )
        ]
        db.add_all(patients)
        db.commit()

        p1 = db.query(Patient).filter(Patient.patient_id == "PAT-2026-001").first()
        p2 = db.query(Patient).filter(Patient.patient_id == "PAT-2026-002").first()
        p3 = db.query(Patient).filter(Patient.patient_id == "PAT-2026-003").first()
        p4 = db.query(Patient).filter(Patient.patient_id == "PAT-2026-004").first()

        # 4. Seed Initial MRI Requests
        now = datetime.now(timezone.utc)
        mri_requests = [
            MRIRequest(
                request_id="MRI-REQ-2026-001",
                patient_id=p1.id,
                mri_type="Lumbar Spine MRI (T1/T2 Axial + Sagittal)",
                clinical_reason="Chronic lower back pain radiating to left leg for 6 months. Rule out disc herniation.",
                urgency="NORMAL",
                source_ip="192.168.20.10",
                dest_ip="192.168.30.10",
                dscp_value=0,
                dscp_name="CS0",
                dscp_binary="000000",
                ip_precedence=0,
                queue_assigned="Best Effort Queue (WFQ)",
                image_size_mb=240.0,
                status="COMPLETED",
                estimated_transfer_sec=19.2,
                actual_transfer_sec=32.4,
                latency_ms=78.5,
                packet_loss_pct=4.2,
                throughput_mbps=59.2,
                created_by_user_id=sharma.id,
                created_at=now - timedelta(minutes=45),
                processed_at=now - timedelta(minutes=40)
            ),
            MRIRequest(
                request_id="MRI-REQ-2026-002",
                patient_id=p2.id,
                mri_type="Abdominal Multi-Phase Contrast MRI",
                clinical_reason="Routine follow-up hepatic lesion surveillance. Non-acute.",
                urgency="NORMAL",
                source_ip="192.168.20.10",
                dest_ip="192.168.30.10",
                dscp_value=0,
                dscp_name="CS0",
                dscp_binary="000000",
                ip_precedence=0,
                queue_assigned="Best Effort Queue (WFQ)",
                image_size_mb=320.0,
                status="COMPLETED",
                estimated_transfer_sec=25.6,
                actual_transfer_sec=42.1,
                latency_ms=86.2,
                packet_loss_pct=5.1,
                throughput_mbps=60.8,
                created_by_user_id=sharma.id,
                created_at=now - timedelta(minutes=30),
                processed_at=now - timedelta(minutes=24)
            ),
            MRIRequest(
                request_id="MRI-REQ-2026-003",
                patient_id=p3.id,
                mri_type="Emergency Brain Stroke & Trauma Angiography",
                clinical_reason="CRITICAL: Sudden onset hemiparesis, dysphasia within 90 min window. Urgent thrombolysis decision required.",
                urgency="EMERGENCY",
                source_ip="192.168.10.10",
                dest_ip="192.168.30.10",
                dscp_value=46,
                dscp_name="EF",
                dscp_binary="101110",
                ip_precedence=5,
                queue_assigned="Strict Priority Queue (LLQ)",
                image_size_mb=380.0,
                status="COMPLETED",
                estimated_transfer_sec=30.4,
                actual_transfer_sec=5.8,
                latency_ms=9.4,
                packet_loss_pct=0.0,
                throughput_mbps=85.0,
                created_by_user_id=sharma.id,
                created_at=now - timedelta(minutes=15),
                processed_at=now - timedelta(minutes=14)
            ),
            MRIRequest(
                request_id="MRI-REQ-2026-004",
                patient_id=p4.id,
                mri_type="Cardiac Stress Perfusion MRI",
                clinical_reason="Post-op ICU cardiac monitoring, suspected acute myocarditis.",
                urgency="URGENT",
                source_ip="192.168.10.15",
                dest_ip="192.168.30.10",
                dscp_value=34,
                dscp_name="AF41",
                dscp_binary="100010",
                ip_precedence=4,
                queue_assigned="Assured Bandwidth Queue (CBWFQ)",
                image_size_mb=280.0,
                status="QUEUED",
                estimated_transfer_sec=22.4,
                actual_transfer_sec=0.0,
                latency_ms=0.0,
                packet_loss_pct=0.0,
                throughput_mbps=0.0,
                created_by_user_id=sharma.id,
                created_at=now - timedelta(minutes=5),
                processed_at=None
            )
        ]
        db.add_all(mri_requests)
        db.commit()

        # 5. Seed Historical Network Metrics (Empirical Comparison Dataset)
        metrics_data = [
            # Congestion Baseline: FIFO (No QoS) across varying traffic loads
            NetworkMetric(timestamp=now - timedelta(minutes=60), scenario="FIFO_BEST_EFFORT", background_traffic_mbps=0.0, latency_ms=12.2, jitter_ms=2.1, throughput_mbps=95.0, packet_loss_pct=0.0, emergency_wait_sec=4.5, normal_wait_sec=4.5, queue_depth=2),
            NetworkMetric(timestamp=now - timedelta(minutes=50), scenario="FIFO_BEST_EFFORT", background_traffic_mbps=30.0, latency_ms=28.4, jitter_ms=6.8, throughput_mbps=68.2, packet_loss_pct=0.4, emergency_wait_sec=9.2, normal_wait_sec=9.2, queue_depth=15),
            NetworkMetric(timestamp=now - timedelta(minutes=40), scenario="FIFO_BEST_EFFORT", background_traffic_mbps=60.0, latency_ms=84.1, jitter_ms=18.5, throughput_mbps=38.4, packet_loss_pct=5.8, emergency_wait_sec=26.5, normal_wait_sec=26.5, queue_depth=48),
            NetworkMetric(timestamp=now - timedelta(minutes=30), scenario="FIFO_BEST_EFFORT", background_traffic_mbps=85.0, latency_ms=186.7, jitter_ms=42.3, throughput_mbps=14.1, packet_loss_pct=18.4, emergency_wait_sec=68.2, normal_wait_sec=68.2, queue_depth=95),
            
            # Experimental QoS: DiffServ LLQ + CBWFQ under same traffic loads
            NetworkMetric(timestamp=now - timedelta(minutes=20), scenario="QOS_PRIORITY", background_traffic_mbps=0.0, latency_ms=8.1, jitter_ms=0.8, throughput_mbps=96.0, packet_loss_pct=0.0, emergency_wait_sec=4.1, normal_wait_sec=4.2, queue_depth=1),
            NetworkMetric(timestamp=now - timedelta(minutes=15), scenario="QOS_PRIORITY", background_traffic_mbps=30.0, latency_ms=8.6, jitter_ms=1.1, throughput_mbps=92.5, packet_loss_pct=0.0, emergency_wait_sec=4.3, normal_wait_sec=11.2, queue_depth=5),
            NetworkMetric(timestamp=now - timedelta(minutes=10), scenario="QOS_PRIORITY", background_traffic_mbps=60.0, latency_ms=9.2, jitter_ms=1.4, throughput_mbps=88.4, packet_loss_pct=0.0, emergency_wait_sec=4.7, normal_wait_sec=31.8, queue_depth=12),
            NetworkMetric(timestamp=now - timedelta(minutes=5), scenario="QOS_PRIORITY", background_traffic_mbps=85.0, latency_ms=10.4, jitter_ms=1.8, throughput_mbps=85.0, packet_loss_pct=0.0, emergency_wait_sec=5.2, normal_wait_sec=49.5, queue_depth=22),
        ]
        db.add_all(metrics_data)

        # 6. Seed Audit & Security Events
        audits = [
            AuditLog(timestamp=now - timedelta(minutes=55), user_id=sharma.id, username="dr_sharma", action="PATIENT_ADMISSION", ip_address="192.168.10.10", details="Admitted patient PAT-2026-003 to Emergency Trauma Bay.", status="SUCCESS"),
            AuditLog(timestamp=now - timedelta(minutes=50), user_id=sharma.id, username="dr_sharma", action="MRI_REQUEST_CREATED", ip_address="192.168.10.10", details="Created Emergency MRI Request MRI-REQ-2026-003 with DSCP EF (46).", status="SUCCESS"),
            AuditLog(timestamp=now - timedelta(minutes=25), user_id=None, username="UNAUTHORIZED_HOST", action="DSCP_SPOOF_BLOCKED", ip_address="192.168.99.88", details="Rogue host attempted to inject DSCP 46 from untrusted guest VLAN 99. Edge ACL demoted to CS0.", status="ALERT"),
            AuditLog(timestamp=now - timedelta(minutes=10), user_id=kumar.id, username="netadmin_kumar", action="QOS_POLICY_AUDIT", ip_address="192.168.10.1", details="Verified Cisco 2911 LLQ and CBWFQ queue health. Zero priority buffer drops observed.", status="SUCCESS"),
        ]
        db.add_all(audits)
        
        db.commit()
        print("Database seeded successfully with initial Smart Hospital QoS data.")

    finally:
        if close_after:
            db.close()

if __name__ == "__main__":
    init_seed_db()
