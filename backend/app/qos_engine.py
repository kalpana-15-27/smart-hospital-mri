"""
Hospital QoS & Traffic Classification Engine
---------------------------------------------
Implements OSI Layer 3 Differentiated Services (DiffServ) Architecture based on:
- RFC 2474 (Definition of Differentiated Services Field)
- RFC 2475 (An Architecture for Differentiated Services)
- RFC 2597 (Assured Forwarding PHB Group)
- RFC 3246 (An Expedited Forwarding PHB)

IMPORTANT CONCEPTUAL CLARITY:
- IP addresses identify endpoints and trusted network zones.
- IP addresses DO NOT generate QoS priority by themselves.
- DSCP (Differentiated Services Code Point) in the IPv4 header (bits 0-5 of DS Field)
  identifies the Per-Hop Behavior (PHB).
- The Layer 3 Router/Switch inspects the DSCP marking and dispatches packets to hardware queues.
"""

from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from .models import NetworkDevice, QoSEvent, AuditLog

class QoSEngine:
    
    # Standard DSCP definitions
    DSCP_PROFILES = {
        "EMERGENCY": {
            "dscp_name": "EF",
            "dscp_value": 46,
            "dscp_binary": "101110",
            "ip_precedence": 5,
            "ip_precedence_name": "Critical",
            "queue_assigned": "Strict Priority Queue (LLQ)",
            "tos_byte_hex": "0xB8",  # (46 << 2) = 184 = 0xB8
            "priority_level": "HIGH",
            "description": "Expedited Forwarding per RFC 3246. Scheduled in Low Latency Queue."
        },
        "URGENT": {
            "dscp_name": "AF41",
            "dscp_value": 34,
            "dscp_binary": "100010",
            "ip_precedence": 4,
            "ip_precedence_name": "Flash Override",
            "queue_assigned": "Assured Bandwidth Queue (CBWFQ)",
            "tos_byte_hex": "0x88",  # (34 << 2) = 136 = 0x88
            "priority_level": "MEDIUM",
            "description": "Assured Forwarding Class 4 Low Drop per RFC 2597."
        },
        "NORMAL": {
            "dscp_name": "CS0",
            "dscp_value": 0,
            "dscp_binary": "000000",
            "ip_precedence": 0,
            "ip_precedence_name": "Routine / Best Effort",
            "queue_assigned": "Best Effort Queue (WFQ)",
            "tos_byte_hex": "0x00",
            "priority_level": "NORMAL",
            "description": "Class Selector 0 Best Effort per RFC 2474."
        }
    }

    # Hospital Network Segmentation & Trust Table
    SUBNET_VLAN_MAP = {
        "192.168.10": {"vlan_id": 10, "vlan_name": "VLAN 10 - Emergency & Trauma", "is_trusted": True},
        "192.168.20": {"vlan_id": 20, "vlan_name": "VLAN 20 - Routine Radiology", "is_trusted": True},
        "192.168.30": {"vlan_id": 30, "vlan_name": "VLAN 30 - PACS & MRI Core", "is_trusted": True},
        "192.168.40": {"vlan_id": 40, "vlan_name": "VLAN 40 - Admin & Billing", "is_trusted": False},
        "192.168.99": {"vlan_id": 99, "vlan_name": "VLAN 99 - Guest / Untrusted", "is_trusted": False},
    }

    @classmethod
    def resolve_source_ip(cls, urgency: str, provided_ip: str = None) -> str:
        """Determines default IP based on clinical workflow context if not provided."""
        if provided_ip:
            return provided_ip
        if urgency == "EMERGENCY":
            return "192.168.10.10"  # Emergency Trauma Workstation
        elif urgency == "URGENT":
            return "192.168.10.15"  # ICU Clinical Terminal
        else:
            return "192.168.20.10"  # Routine Outpatient Imaging Console

    @classmethod
    def classify_and_mark(
        cls, 
        urgency: str, 
        source_ip: str, 
        user_role: str, 
        db: Session, 
        request_id: str = None
    ) -> Dict[str, Any]:
        """
        Implements DiffServ Traffic Conditioning, Edge Classification, and Security Validation.
        
        Security Rule:
        Untrusted devices or unauthorized roles attempting emergency priority are flagged
        as potential DSCP Spoofing anomalies, logged, and demoted to Best Effort (CS0).
        """
        urgency_key = urgency.upper() if urgency else "NORMAL"
        if urgency_key not in cls.DSCP_PROFILES:
            urgency_key = "NORMAL"

        profile = cls.DSCP_PROFILES[urgency_key].copy()
        
        # Check source subnet trust boundary
        subnet_prefix = ".".join(source_ip.split(".")[:3])
        vlan_info = cls.SUBNET_VLAN_MAP.get(subnet_prefix, {"vlan_id": 99, "vlan_name": "Unknown/External", "is_trusted": False})
        
        # Check explicit device registry in DB
        device_in_db = db.query(NetworkDevice).filter(NetworkDevice.ip_address == source_ip).first()
        is_trusted_source = device_in_db.is_trusted if device_in_db else vlan_info["is_trusted"]
        
        is_spoofed_attempt = False
        action_note = "Marked DSCP according to authorized clinical workflow."

        # Cybersecurity check: Role authorization and Network trust boundary
        if urgency_key in ["EMERGENCY", "URGENT"]:
            # Only DOCTOR, ADMIN, or emergency VLAN devices can legitimately emit high-priority DSCP
            if not is_trusted_source or user_role not in ["DOCTOR", "ADMIN", "RADIOLOGIST", "NETWORK_ADMIN"]:
                is_spoofed_attempt = True
                action_note = f"ALERT: Unauthorized emergency priority requested from untrusted IP ({source_ip}) or unprivileged role ({user_role}). Remarked to DSCP 0 (Best Effort)."
                profile = cls.DSCP_PROFILES["NORMAL"].copy()
                profile["queue_assigned"] = "Best Effort Queue (Demoted - Spoof Detected)"

        # Log QoS Classification Event in Database
        qos_event = QoSEvent(
            request_id=request_id,
            event_type="CLASSIFICATION_AND_MARKING",
            source_ip=source_ip,
            dest_ip="192.168.30.10",
            dscp_marked=profile["dscp_value"],
            queue_assigned=profile["queue_assigned"],
            action_taken=action_note,
            is_spoofed_attempt=is_spoofed_attempt,
            details=f"VLAN: {vlan_info['vlan_id']} ({vlan_info['vlan_name']}), UserRole: {user_role}, Binary: {profile['dscp_binary']}, IP Prec: {profile['ip_precedence']}"
        )
        db.add(qos_event)
        
        if is_spoofed_attempt:
            audit = AuditLog(
                username=user_role,
                action="DSCP_SPOOF_BLOCKED",
                ip_address=source_ip,
                details=f"Blocked attempt to assert DSCP EF/AF41 from untrusted device/role. Remarked to CS0.",
                status="ALERT"
            )
            db.add(audit)
            
        db.commit()

        return {
            "urgency": urgency_key,
            "source_ip": source_ip,
            "dest_ip": "192.168.30.10",
            "vlan_id": vlan_info["vlan_id"],
            "vlan_name": vlan_info["vlan_name"],
            "is_trusted_source": is_trusted_source,
            "is_spoofed_attempt": is_spoofed_attempt,
            **profile
        }
