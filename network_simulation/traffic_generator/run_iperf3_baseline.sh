#!/bin/bash
# ==============================================================================
# IPERF3 BASELINE TEST (Without QoS / FIFO Queue)
# Project: Smart Hospital Emergency MRI Prioritization System
# ==============================================================================

PACS_IP="192.168.30.10"

echo "[+] Step 1: Starting Background Traffic Congestion (75 Mbps load)..."
iperf3 -c ${PACS_IP} -u -b 75M -t 30 -S 0x00 &
BG_PID=$!

sleep 2

echo "[+] Step 2: Sending Routine Imaging Flow (25 Mbps)..."
iperf3 -c ${PACS_IP} -u -b 25M -t 20 -S 0x00 &

echo "[+] Step 3: Sending Simulated Emergency MRI Flow without QoS Priority (DSCP 0)..."
iperf3 -c ${PACS_IP} -u -b 20M -t 15 -S 0x00 --logfile baseline_results.log

wait ${BG_PID}
echo "[+] Baseline Test Completed. Review baseline_results.log for jitter, latency, and packet loss."
