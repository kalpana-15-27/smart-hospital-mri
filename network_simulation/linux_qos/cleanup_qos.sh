#!/bin/bash
# ==============================================================================
# CLEANUP QOS & IPTABLES RULES
# Project: Smart Hospital Emergency MRI Prioritization System
# ==============================================================================

IFACE="eth0"

echo "[+] Removing tc queuing disciplines from: ${IFACE}"
sudo tc qdisc del dev ${IFACE} root 2>/dev/null || true

echo "[+] Flushing iptables mangle table..."
sudo iptables -t mangle -F 2>/dev/null || true

echo "[+] Interface reset to default Linux FIFO queue."
