from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import NetworkMetric, QoSEvent, AuditLog
from ..traffic_simulator import NetworkSimulator

router = APIRouter(prefix="/simulation", tags=["Network Simulation & Threat Testing"])

@router.post("/run-congestion-suite")
def run_congestion_test_suite(db: Session = Depends(get_db)):
    """
    Executes an end-to-end multi-rate congestion stress test
    across link loads 10%, 40%, 70%, 90% measuring latency, jitter, loss, and transfer times.
    """
    loads = [10.0, 40.0, 70.0, 90.0]
    results = []

    for bg_traffic in loads:
        # 1. Run FIFO scenario
        fifo_res = NetworkSimulator.calculate_transfer_metrics(
            image_size_mb=300.0,
            dscp_value=0,
            background_traffic_mbps=bg_traffic,
            enable_qos=False
        )
        # 2. Run QoS Emergency scenario
        qos_em_res = NetworkSimulator.calculate_transfer_metrics(
            image_size_mb=300.0,
            dscp_value=46,
            background_traffic_mbps=bg_traffic,
            enable_qos=True
        )
        # 3. Run QoS Routine scenario
        qos_norm_res = NetworkSimulator.calculate_transfer_metrics(
            image_size_mb=300.0,
            dscp_value=0,
            background_traffic_mbps=bg_traffic,
            enable_qos=True
        )

        record_fifo = NetworkMetric(
            scenario="FIFO_BEST_EFFORT",
            background_traffic_mbps=bg_traffic,
            latency_ms=fifo_res["latency_ms"],
            jitter_ms=fifo_res["jitter_ms"],
            throughput_mbps=fifo_res["throughput_mbps"],
            packet_loss_pct=fifo_res["packet_loss_pct"],
            emergency_wait_sec=fifo_res["transfer_time_sec"],
            normal_wait_sec=fifo_res["transfer_time_sec"],
            queue_depth=int(bg_traffic * 0.9)
        )
        record_qos = NetworkMetric(
            scenario="QOS_PRIORITY",
            background_traffic_mbps=bg_traffic,
            latency_ms=qos_em_res["latency_ms"],
            jitter_ms=qos_em_res["jitter_ms"],
            throughput_mbps=qos_em_res["throughput_mbps"],
            packet_loss_pct=qos_em_res["packet_loss_pct"],
            emergency_wait_sec=qos_em_res["transfer_time_sec"],
            normal_wait_sec=qos_norm_res["transfer_time_sec"],
            queue_depth=int(bg_traffic * 0.2)
        )
        db.add(record_fifo)
        db.add(record_qos)

        results.append({
            "load_mbps": bg_traffic,
            "fifo": fifo_res,
            "qos_emergency": qos_em_res,
            "qos_normal": qos_norm_res
        })

    db.commit()
    return {"message": "Multi-rate congestion benchmark completed", "results": results}

@router.post("/dscpspoof-test")
def simulate_dscp_spoof_attack(source_ip: str = "192.168.99.88", attempted_dscp: int = 46, db: Session = Depends(get_db)):
    """
    Simulates a rogue host attempting to inject DSCP 46 (EF) traffic
    from an untrusted guest VLAN 99 subnet.
    """
    event = QoSEvent(
        request_id="ATTACK-SIM-001",
        event_type="SPOOF_DETECTION_TRIGGERED",
        source_ip=source_ip,
        dest_ip="192.168.30.10",
        dscp_marked=0,  # Demoted to CS0
        queue_assigned="Best Effort Queue (Demoted from Unauthorized LLQ)",
        action_taken=f"SECURITY ALERT: Dropped attempted DSCP {attempted_dscp} marking from untrusted source {source_ip}. Force-remarked to DSCP 0 per RFC 2474 Edge Trust Policy.",
        is_spoofed_attempt=True,
        details="Layer 3 Ingress Access Control List (ACL) enforced trust boundary. Host lacks clinical role signature."
    )
    db.add(event)

    audit = AuditLog(
        username="SIMULATED_ATTACKER",
        action="DSCP_SPOOF_BLOCKED",
        ip_address=source_ip,
        details=f"Blocked rogue packet injection: Attempted DSCP {attempted_dscp} (EF) on untrusted port.",
        status="ALERT"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "MITIGATED",
        "action": "DSCP Remarked to 0 (Best Effort)",
        "source_ip": source_ip,
        "attempted_dscp": attempted_dscp,
        "enforced_dscp": 0,
        "security_policy": "RFC 2474 Section 3 Edge Conditioning & 802.1X Trust Boundary"
    }
