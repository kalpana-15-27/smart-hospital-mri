from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import NetworkDevice, QoSEvent, NetworkMetric
from ..schemas import NetworkDeviceResponse, QoSEventResponse, NetworkMetricResponse
from ..traffic_simulator import NetworkSimulator

router = APIRouter(prefix="/network", tags=["Network Topology & QoS Monitoring"])

@router.get("/devices", response_model=List[NetworkDeviceResponse])
def get_network_devices(db: Session = Depends(get_db)):
    return db.query(NetworkDevice).all()

@router.get("/qos-events", response_model=List[QoSEventResponse])
def get_qos_events(limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    return db.query(QoSEvent).order_by(QoSEvent.id.desc()).limit(limit).all()

@router.get("/metrics", response_model=List[NetworkMetricResponse])
def get_network_metrics(limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    return db.query(NetworkMetric).order_by(NetworkMetric.id.desc()).limit(limit).all()

@router.post("/probe")
def send_live_probe(dest_ip: str = "127.0.0.1", port: int = 10400, dscp_value: int = 46):
    success = NetworkSimulator.emit_socket_probe(dest_ip=dest_ip, port=port, dscp_value=dscp_value)
    return {
        "status": "PROBE_EMITTED" if success else "FALLBACK_PROBE",
        "dest_ip": dest_ip,
        "port": port,
        "dscp_value": dscp_value,
        "tos_byte_hex": hex((dscp_value << 2) & 0xFC)
    }
