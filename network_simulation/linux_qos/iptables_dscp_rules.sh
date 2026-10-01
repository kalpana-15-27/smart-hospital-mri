#!/bin/bash
# ==============================================================================
# LINUX IPTABLES / NFTABLES DSCP MARKING & ANTI-SPOOFING RULES
# Project: Smart Hospital Emergency MRI Prioritization System
# LAB ONLY - Demonstrates Layer 3 Edge Packet Conditioning
# ==============================================================================

echo "[+] Applying IPTables Mangle Table DSCP Classification Rules..."

# Flush existing PREROUTING and POSTROUTING mangle chains
sudo iptables -t mangle -F PREROUTING 2>/dev/null || true
sudo iptables -t mangle -F POSTROUTING 2>/dev/null || true

# ------------------------------------------------------------------------------
# 1. ANTI-SPOOFING TRUST BOUNDARY ENFORCEMENT
# ------------------------------------------------------------------------------
# If traffic comes from untrusted guest/admin subnets attempting DSCP EF (46) or AF41 (34),
# reset the marking to CS0 (0 - Best Effort)
sudo iptables -t mangle -A PREROUTING -s 192.168.40.0/24 -m dscp --dscp 46 -j DSCP --set-dscp 0
sudo iptables -t mangle -A PREROUTING -s 192.168.40.0/24 -m dscp --dscp 34 -j DSCP --set-dscp 0
sudo iptables -t mangle -A PREROUTING -s 192.168.99.0/24 -m dscp --dscp 46 -j DSCP --set-dscp 0
sudo iptables -t mangle -A PREROUTING -s 192.168.99.0/24 -m dscp --dscp 34 -j DSCP --set-dscp 0

# ------------------------------------------------------------------------------
# 2. AUTHORIZED CLINICAL EDGE MARKING
# ------------------------------------------------------------------------------
# Mark DICOM C-STORE (TCP Port 104) originating from Emergency Workstation (192.168.10.10) with DSCP EF (46)
sudo iptables -t mangle -A POSTROUTING -s 192.168.10.10 -p tcp --dport 104 -j DSCP --set-dscp-class EF

# Mark DICOM traffic from ICU Node (192.168.10.15) with DSCP AF41 (34)
sudo iptables -t mangle -A POSTROUTING -s 192.168.10.15 -p tcp --dport 104 -j DSCP --set-dscp-class AF41

# Mark DICOM traffic from Routine Workstation (192.168.20.10) with DSCP CS0 (0)
sudo iptables -t mangle -A POSTROUTING -s 192.168.20.10 -p tcp --dport 104 -j DSCP --set-dscp-class CS0

echo "[+] IPTables DSCP rules successfully installed!"
sudo iptables -t mangle -L -v -n
