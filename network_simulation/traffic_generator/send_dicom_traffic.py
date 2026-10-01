#!/usr/bin/env python3
"""
Python Socket Traffic Generator with Layer 3 IP_TOS DSCP Tagging
Project: Smart Hospital Emergency MRI Prioritization System
"""

import sys
import time
import socket
import argparse

def send_traffic(dest_ip: str, port: int, dscp_val: int, packet_count: int, delay_ms: float):
    print(f"================================================================================")
    print(f"  HOSPITAL DICOM TRAFFIC EMITTER (Layer 3 IPv4 DS Field Tagging)")
    print(f"  Target: {dest_ip}:{port}")
    print(f"  DSCP Codepoint: {dscp_val} (ToS Byte: {hex((dscp_val << 2) & 0xFC)})")
    print(f"  Packets: {packet_count} | Interval: {delay_ms} ms")
    print(f"================================================================================")

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    # Calculate 8-bit ToS byte by shifting 6-bit DSCP into bits 2-7
    tos_byte = (dscp_val << 2) & 0xFC
    try:
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_TOS, tos_byte)
        print(f"[+] Successfully configured IP_TOS socket option to {hex(tos_byte)}.")
    except Exception as e:
        print(f"[!] Warning: Unable to set raw IP_TOS ({e}). Running in fallback mode.")

    sent_bytes = 0
    start_time = time.time()

    for i in range(1, packet_count + 1):
        timestamp = time.time()
        payload = f"DICOM_STUDY_CHUNK:SEQ={i}:DSCP={dscp_val}:TIMESTAMP={timestamp}".encode('utf-8')
        sock.sendto(payload, (dest_ip, port))
        sent_bytes += len(payload)
        if i % 25 == 0 or i == packet_count:
            print(f"[*] Dispatched packet {i}/{packet_count} with DSCP {dscp_val} ({sent_bytes} bytes total)...")
        time.sleep(delay_ms / 1000.0)

    elapsed = time.time() - start_time
    sock.close()
    print(f"[+] Transmission complete! Sent {packet_count} packets ({sent_bytes} bytes) in {elapsed:.3f} seconds.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send DICOM packets with IP DSCP tags.")
    parser.add_argument("--dest", default="127.0.0.1", help="Destination IP address (Default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=10400, help="Destination UDP port (Default: 10400)")
    parser.add_argument("--dscp", type=int, default=46, choices=[0, 34, 46], help="DSCP value: 46 (EF/Emergency), 34 (AF41/Urgent), 0 (CS0/Routine)")
    parser.add_argument("--count", type=int, default=100, help="Number of packets to send (Default: 100)")
    parser.add_argument("--delay", type=float, default=10.0, help="Inter-packet delay in ms (Default: 10)")

    args = parser.parse_args()
    send_traffic(args.dest, args.port, args.dscp, args.count, args.delay)
