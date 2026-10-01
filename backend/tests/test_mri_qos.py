import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.qos_engine import QoSEngine
from app.models import User, NetworkDevice
from app.seed_data import init_seed_db

def test_qos_dscp_classification():
    Base.metadata.create_all(bind=engine)
    init_seed_db()
    db = SessionLocal()
    try:
        # 1. Emergency classification test
        em_res = QoSEngine.classify_and_mark(
            urgency="EMERGENCY",
            source_ip="192.168.10.10",
            user_role="DOCTOR",
            db=db,
            request_id="TEST-EM-01"
        )
        assert em_res["dscp_value"] == 46
        assert em_res["dscp_name"] == "EF"
        assert em_res["dscp_binary"] == "101110"
        assert em_res["ip_precedence"] == 5
        assert "Strict Priority" in em_res["queue_assigned"]
        assert em_res["is_spoofed_attempt"] is False

        # 2. Urgent classification test
        urg_res = QoSEngine.classify_and_mark(
            urgency="URGENT",
            source_ip="192.168.10.15",
            user_role="DOCTOR",
            db=db,
            request_id="TEST-URG-01"
        )
        assert urg_res["dscp_value"] == 34
        assert urg_res["dscp_name"] == "AF41"
        assert urg_res["dscp_binary"] == "100010"
        assert urg_res["ip_precedence"] == 4
        assert "Assured" in urg_res["queue_assigned"]

        # 3. Normal classification test
        norm_res = QoSEngine.classify_and_mark(
            urgency="NORMAL",
            source_ip="192.168.20.10",
            user_role="DOCTOR",
            db=db,
            request_id="TEST-NORM-01"
        )
        assert norm_res["dscp_value"] == 0
        assert norm_res["dscp_name"] == "CS0"
        assert norm_res["dscp_binary"] == "000000"
        assert norm_res["ip_precedence"] == 0
        assert "Best Effort" in norm_res["queue_assigned"]

    finally:
        db.close()

if __name__ == "__main__":
    test_qos_dscp_classification()
    print("ALL MRI QoS CLASSIFICATION TESTS PASSED.")
