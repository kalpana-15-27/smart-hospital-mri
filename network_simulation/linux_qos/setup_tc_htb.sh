#!/bin/bash
# ==============================================================================
# LINUX TRAFFIC CONTROL (tc) - HIERARCHICAL TOKEN BUCKET (HTB) SETUP
# Project: Smart Hospital Emergency MRI Prioritization System
# LAB ONLY - Starvation-Protected Class-Based Queuing (CBWFQ Equivalent)
# ==============================================================================

IFACE="eth0"
TOTAL_RATE="100mbit"

echo "[+] Setting up HTB Queuing Discipline with Bandwidth Guarantees on: ${IFACE}"

# Clear existing qdisc
sudo tc qdisc del dev ${IFACE} root 2>/dev/null || true

# 1. Root HTB qdisc
sudo tc qdisc add dev ${IFACE} root handle 1: htb default 30

# 2. Root Class (Total Link Capacity: 100 Mbps)
sudo tc class add dev ${IFACE} parent 1: classid 1:1 htb rate ${TOTAL_RATE} ceil ${TOTAL_RATE}

# 3. Class 1:10 - Emergency MRI Class (50 Mbps guaranteed, bursts to 90 Mbps)
sudo tc class add dev ${IFACE} parent 1:1 classid 1:10 htb rate 50mbit ceil 90mbit prio 0

# 4. Class 1:20 - Urgent ICU Class (30 Mbps guaranteed, bursts to 60 Mbps)
sudo tc class add dev ${IFACE} parent 1:1 classid 1:20 htb rate 30mbit ceil 60mbit prio 1

# 5. Class 1:30 - Routine Best Effort Class (20 Mbps guaranteed - Starvation Protected!)
sudo tc class add dev ${IFACE} parent 1:1 classid 1:30 htb rate 20mbit ceil 50mbit prio 2

# 6. Attach Stochastic Fairness Queueing (sfq) leaves to prevent single-flow domination
sudo tc qdisc add dev ${IFACE} parent 1:10 handle 10: sfq perturb 10
sudo tc qdisc add dev ${IFACE} parent 1:20 handle 20: sfq perturb 10
sudo tc qdisc add dev ${IFACE} parent 1:30 handle 30: sfq perturb 10

# 7. Classification Filters matching DSCP values
sudo tc filter add dev ${IFACE} parent 1: protocol ip prio 1 u32 match ip dsfield 0xb8 0xfc flowid 1:10
sudo tc filter add dev ${IFACE} parent 1: protocol ip prio 2 u32 match ip dsfield 0x88 0xfc flowid 1:20
sudo tc filter add dev ${IFACE} parent 1: protocol ip prio 3 u32 match ip dsfield 0x00 0xfc flowid 1:30

echo "[+] HTB Bandwidth Reservation Active."
sudo tc -s class show dev ${IFACE}
