#!/usr/bin/env python3
"""
Synthetic DICOM & QoS Packet Capture (.pcap) Generator
Project: Smart Hospital Emergency MRI Prioritization System
Uses Scapy to generate standard .pcap files with exact IPv4 DS Field markings (DSCP EF/AF41/CS0).
"""

import os
import sys
from scapy.all import wrpcap, Ether, IP, TCP, Raw

def generate_hospital_pcap(output_file="hospital_mri_qos_capture.pcap"):
    output_path = os.path.join(os.path.dirname(__file__), output_file)
    print(f"[+] Generating standard Wireshark capture file: {output_path}...")

    packets = []

    # 1. Emergency Flow: Emergency Trauma Bay (192.168.10.10) -> PACS (192.168.30.10:104)
    # DSCP EF (46) -> ToS byte: 0xB8 (184)
    tos_ef = (46 << 2) & 0xFC
    for seq in range(1, 25):
        pkt = (
            Ether(src="00:50:56:a1:10:01", dst="00:1a:a2:fe:99:01") /
            IP(src="192.168.10.10", dst="192.168.30.10", tos=tos_ef, ttl=64) /
            TCP(sport=54820, dport=104, seq=1000 + (seq * 1460), flags="PA") /
            Raw(load=f"DICOM_C_STORE_RQ:EMERGENCY_TRAUMA_BRAIN_STUDY:CHUNK={seq}:DSCP=46_EF".encode('utf-8'))
        )
        packets.append(pkt)

    # 2. Urgent Flow: ICU Bedside Node (192.168.10.15) -> PACS (192.168.30.10:104)
    # DSCP AF41 (34) -> ToS byte: 0x88 (136)
    tos_af41 = (34 << 2) & 0xFC
    for seq in range(1, 15):
        pkt = (
            Ether(src="00:50:56:a1:10:05", dst="00:1a:a2:fe:99:01") /
            IP(src="192.168.10.15", dst="192.168.30.10", tos=tos_af41, ttl=64) /
            TCP(sport=54830, dport=104, seq=5000 + (seq * 1460), flags="PA") /
            Raw(load=f"DICOM_C_STORE_RQ:ICU_CARDIAC_STUDY:CHUNK={seq}:DSCP=34_AF41".encode('utf-8'))
        )
        packets.append(pkt)

    # 3. Routine Flow: Outpatient Radiology Console (192.168.20.10) -> PACS (192.168.30.10:104)
    # DSCP CS0 (0) -> ToS byte: 0x00 (0)
    tos_cs0 = 0x00
    for seq in range(1, 20):
        pkt = (
            Ether(src="00:50:56:b2:20:01", dst="00:1a:a2:fe:99:01") /
            IP(src="192.168.20.10", dst="192.168.30.10", tos=tos_cs0, ttl=64) /
            TCP(sport=54840, dport=104, seq=9000 + (seq * 1460), flags="PA") /
            Raw(load=f"DICOM_C_STORE_RQ:ROUTINE_LUMBAR_SPINE:CHUNK={seq}:DSCP=0_CS0".encode('utf-8'))
        )
        packets.append(pkt)

    wrpcap(output_path, packets)
    print(f"[+] Successfully exported {len(packets)} synthetic packets to: {output_path}")
    print("[*] Ready for Wireshark inspection with filter: `ip.dsfield.dscp == 46` or `tcp.port == 104`")

if __name__ == "__main__":
    generate_hospital_pcap()
