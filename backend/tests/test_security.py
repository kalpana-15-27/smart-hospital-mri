import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.qos_engine import QoSEngine
from app.seed_data import init_seed_db

def test_untrusted_dscp_spoofing_mitigation():
    Base.metadata.create_all(bind=engine)
    init_seed_db()
    db = SessionLocal()
    try:
        # Rogue host in untrusted VLAN attempting to request EMERGENCY priority
        attack_res = QoSEngine.classify_and_mark(
            urgency="EMERGENCY",
            source_ip="192.168.99.88",  # Untrusted guest subnet
            user_role="GUEST_USER",      # Unauthorized role
            db=db,
            request_id="ATTACK-TEST-01"
        )
        
        # Security Assertion: System MUST detect anomaly and reset DSCP to 0 (Best Effort)
        assert attack_res["is_spoofed_attempt"] is True
        assert attack_res["dscp_value"] == 0
        assert attack_res["dscp_name"] == "CS0"
        assert "Spoof Detected" in attack_res["queue_assigned"] or "Best Effort" in attack_res["queue_assigned"]

    finally:
        db.close()

if __name__ == "__main__":
    test_untrusted_dscp_spoofing_mitigation()
    print("ALL SECURITY & SPOOFING MITIGATION TESTS PASSED.")
