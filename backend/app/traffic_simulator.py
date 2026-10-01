"""
Network Traffic & Congestion Simulator
---------------------------------------
Simulates DICOM C-STORE packet transmission across Layer 3 Router queues under varying
background traffic congestion conditions (0 Mbps to 100 Mbps bottleneck).

Supports:
1. FIFO / Best-Effort Baseline (Tail-drop, severe buffer delay under congestion)
2. DiffServ QoS Priority Queuing (Strict Priority LLQ for EF + CBWFQ for Routine)
3. Direct socket IP_TOS emission for live packet capturing in Wireshark
"""

import time
import math
import random
import socket
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from .models import MRIRequest, NetworkMetric, QoSEvent

class NetworkSimulator:
    
    # 100 Mbps simulated hospital backbone bottleneck link
    LINK_CAPACITY_MBPS = 100.0
    
    @classmethod
    def calculate_transfer_metrics(
        cls, 
        image_size_mb: float, 
        dscp_value: int, 
        background_traffic_mbps: float, 
        enable_qos: bool
    ) -> Dict[str, float]:
        """
        Calculates realistic queuing, latency, packet loss, and transmission duration
        based on queuing theory (M/M/1 and Priority Queue models).
        """
        # Constrain background traffic
        bg_traffic = max(0.0, min(95.0, background_traffic_mbps))
        available_bw_raw = max(5.0, cls.LINK_CAPACITY_MBPS - bg_traffic)
        
        # Link utilization rho
        rho = bg_traffic / cls.LINK_CAPACITY_MBPS
        
        if not enable_qos:
            # --- FIFO SCENARIO (No differentiated queuing) ---
            # All packets share the same congested FIFO buffer
            # Queuing delay increases non-linearly with link utilization
            buffer_delay_factor = (rho / (1.0 - min(rho, 0.95))) * 15.0
            base_latency = 12.0 + buffer_delay_factor
            
            # Tail drops occur when utilization exceeds 75%
            if rho > 0.75:
                packet_loss_pct = ((rho - 0.75) / 0.25) * 22.0 + random.uniform(0.5, 2.0)
            else:
                packet_loss_pct = random.uniform(0.0, 0.5)
                
            jitter_ms = base_latency * random.uniform(0.2, 0.45)
            
            # Throughput shared equally among active flows
            effective_bw = max(3.0, available_bw_raw * random.uniform(0.7, 0.9))
            
            # High packet loss causes TCP retransmissions and exponential backoff
            retransmission_penalty = 1.0 + (packet_loss_pct / 100.0) * 4.5
            transfer_time_sec = (image_size_mb * 8.0 / effective_bw) * retransmission_penalty
            
            latency_ms = base_latency + random.uniform(-2.0, 4.0)

        else:
            # --- DIFFSERV QoS SCENARIO (LLQ + CBWFQ) ---
            if dscp_value == 46:  # EMERGENCY (EF - Expedited Forwarding)
                # LLQ Strict Priority bypasses normal queue buffers
                # Dedicated priority bandwidth up to 50 Mbps
                latency_ms = random.uniform(7.5, 14.5)  # Ultra low latency
                jitter_ms = random.uniform(0.5, 2.5)
                packet_loss_pct = 0.0  # Zero drops for priority queue
                effective_bw = min(85.0, cls.LINK_CAPACITY_MBPS * 0.85)
                transfer_time_sec = (image_size_mb * 8.0) / effective_bw
                
            elif dscp_value == 34:  # URGENT (AF41 - Assured Forwarding)
                # Class-Based Weighted Fair Queue with 30% guaranteed bandwidth
                latency_ms = random.uniform(18.0, 32.0)
                jitter_ms = random.uniform(3.0, 6.5)
                packet_loss_pct = random.uniform(0.0, 1.2) if rho > 0.85 else 0.0
                effective_bw = max(18.0, available_bw_raw * 0.6)
                retransmission_penalty = 1.0 + (packet_loss_pct / 100.0) * 2.0
                transfer_time_sec = (image_size_mb * 8.0 / effective_bw) * retransmission_penalty

            else:  # NORMAL (CS0 - Best Effort)
                # Standard Fair Queue with starvation prevention (min 15-20% reserved)
                latency_ms = 45.0 + (rho * 55.0) + random.uniform(0.0, 10.0)
                jitter_ms = random.uniform(8.0, 20.0)
                packet_loss_pct = ((rho - 0.7) / 0.3) * 14.0 if rho > 0.7 else 0.0
                packet_loss_pct = max(0.0, packet_loss_pct + random.uniform(0.1, 1.0))
                effective_bw = max(8.0, available_bw_raw * 0.4)
                retransmission_penalty = 1.0 + (packet_loss_pct / 100.0) * 3.0
                transfer_time_sec = (image_size_mb * 8.0 / effective_bw) * retransmission_penalty

        return {
            "latency_ms": round(latency_ms, 2),
            "jitter_ms": round(jitter_ms, 2),
            "throughput_mbps": round(effective_bw, 2),
            "packet_loss_pct": round(packet_loss_pct, 2),
            "transfer_time_sec": round(transfer_time_sec, 2),
        }

    @classmethod
    def emit_socket_probe(cls, dest_ip: str, port: int, dscp_value: int) -> bool:
        """
        Emits an actual UDP socket probe with real IP_TOS DSCP bit settings
        for live packet inspection in Wireshark.
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            tos_byte = (dscp_value << 2) & 0xFC  # 6-bit DSCP into top 6 bits of ToS
            sock.setsockopt(socket.IPPROTO_IP, socket.IP_TOS, tos_byte)
            payload = f"DICOM_PRIORITY_PROBE:DSCP={dscp_value}:TIMESTAMP={datetime.utcnow().isoformat()}".encode('utf-8')
            sock.sendto(payload, (dest_ip if dest_ip != "192.168.30.10" else "127.0.0.1", port))
            sock.close()
            return True
        except Exception:
            # Fallback for systems/permissions where raw IP_TOS is restricted
            return False

    @classmethod
    def execute_study_transfer(
        cls, 
        mri_request: MRIRequest, 
        background_traffic_mbps: float, 
        enable_qos: bool, 
        db: Session
    ) -> Dict[str, Any]:
        """
        Executes and records a realistic MRI DICOM study network transmission.
        Updates the request status and stores network telemetry in DB.
        """
        mri_request.status = "TRANSMITTING"
        db.commit()

        # Emit live socket probe on port 104 (DICOM standard) or loopback
        cls.emit_socket_probe("127.0.0.1", 10400, mri_request.dscp_value)

        # Calculate metrics
        metrics = cls.calculate_transfer_metrics(
            image_size_mb=mri_request.image_size_mb or 250.0,
            dscp_value=mri_request.dscp_value if enable_qos else 0,
            background_traffic_mbps=background_traffic_mbps,
            enable_qos=enable_qos
        )

        # Update MRI record
        mri_request.latency_ms = metrics["latency_ms"]
        mri_request.packet_loss_pct = metrics["packet_loss_pct"]
        mri_request.throughput_mbps = metrics["throughput_mbps"]
        mri_request.actual_transfer_sec = metrics["transfer_time_sec"]
        mri_request.estimated_transfer_sec = round(mri_request.image_size_mb * 8.0 / 100.0, 2)
        mri_request.status = "COMPLETED"
        mri_request.processed_at = datetime.utcnow()

        # Record system telemetry for graphing
        scenario_label = "QOS_PRIORITY" if enable_qos else "FIFO_BEST_EFFORT"
        
        # Calculate comparative wait times
        em_wait = metrics["transfer_time_sec"] if mri_request.urgency == "EMERGENCY" else (metrics["transfer_time_sec"] * 0.4 if enable_qos else metrics["transfer_time_sec"])
        norm_wait = metrics["transfer_time_sec"] if mri_request.urgency == "NORMAL" else (metrics["transfer_time_sec"] * 2.5 if enable_qos else metrics["transfer_time_sec"])

        metric_record = NetworkMetric(
            scenario=scenario_label,
            background_traffic_mbps=background_traffic_mbps,
            latency_ms=metrics["latency_ms"],
            jitter_ms=metrics["jitter_ms"],
            throughput_mbps=metrics["throughput_mbps"],
            packet_loss_pct=metrics["packet_loss_pct"],
            emergency_wait_sec=round(em_wait, 2),
            normal_wait_sec=round(norm_wait, 2),
            queue_depth=int(background_traffic_mbps * 0.8)
        )
        db.add(metric_record)

        # Log forwarded event
        forward_event = QoSEvent(
            request_id=mri_request.request_id,
            event_type="STUDY_TRANSMITTED",
            source_ip=mri_request.source_ip,
            dest_ip=mri_request.dest_ip,
            dscp_marked=mri_request.dscp_value,
            queue_assigned=mri_request.queue_assigned,
            action_taken=f"Transmitted {mri_request.image_size_mb} MB DICOM study in {metrics['transfer_time_sec']}s (Latency: {metrics['latency_ms']}ms, Loss: {metrics['packet_loss_pct']}%)",
            is_spoofed_attempt=False,
            details=f"Scenario: {scenario_label}, Link Utilization: {background_traffic_mbps}%, Throughput: {metrics['throughput_mbps']} Mbps"
        )
        db.add(forward_event)
        
        db.commit()
        db.refresh(mri_request)
        
        return {
            "status": "COMPLETED",
            "mri_request": mri_request,
            "metrics": metrics,
            "scenario": scenario_label
        }
