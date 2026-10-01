#!/bin/bash
# ==============================================================================
# LINUX TRAFFIC CONTROL (tc) - STRICT PRIORITY QUEUING (prio) SETUP
# Project: Smart Hospital Emergency MRI Prioritization System
# LAB ONLY - Execute with sudo / root privileges in a Linux testbed
# ==============================================================================

# Network Interface Configuration (Adjust according to testbed, e.g. eth0, ens33)
IFACE="eth0"

echo "[+] Initializing Linux QoS Strict Priority Queuing on interface: ${IFACE}"

# 1. Clear existing qdiscs on the interface
sudo tc qdisc del dev ${IFACE} root 2>/dev/null || true

# 2. Attach a 3-band PRIO queueing discipline (qdisc)
# Band 0 = Highest Priority (Emergency EF)
# Band 1 = Medium Priority (Urgent AF41)
# Band 2 = Normal / Best Effort (Routine CS0)
sudo tc qdisc add dev ${IFACE} root handle 1: prio bands 3 priomap 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2

# 3. Add u32 classification filters matching DSCP in the IPv4 header
# IPv4 ToS octet is located at byte offset 1 in the IP header (0x01)
# DSCP EF (46)  -> 46 << 2 = 184 (0xB8)
# DSCP AF41 (34)-> 34 << 2 = 136 (0x88)
# DSCP CS0 (0)  -> 0  << 2 = 0   (0x00)

echo "[+] Attaching DSCP u32 classification filters..."

# Filter 1: Map DSCP EF (0xB8 ToS) to Band 0 (1:1 - Highest Priority)
sudo tc filter add dev ${IFACE} parent 1: protocol ip prio 1 u32 \
    match ip dsfield 0xb8 0xfc \
    flowid 1:1

# Filter 2: Map DSCP AF41 (0x88 ToS) to Band 1 (1:2 - Medium Priority)
sudo tc filter add dev ${IFACE} parent 1: protocol ip prio 2 u32 \
    match ip dsfield 0x88 0xfc \
    flowid 1:2

# Filter 3: Map DSCP CS0 / Best Effort (0x00 ToS) to Band 2 (1:3 - Standard Queue)
sudo tc filter add dev ${IFACE} parent 1: protocol ip prio 3 u32 \
    match ip dsfield 0x00 0xfc \
    flowid 1:3

echo "[+] Linux tc Priority Queuing successfully configured!"
echo "[*] Displaying current queue configuration:"
sudo tc -s qdisc show dev ${IFACE}
