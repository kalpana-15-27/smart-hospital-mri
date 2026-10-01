# Linux QoS & Traffic Control (tc) Lab Guide

This directory contains standalone Linux scripts for demonstrating Layer 3 DiffServ QoS on a Linux gateway, VM, or Mininet/GNS3 environment.

> [!CAUTION]
> **LAB ENVIRONMENT ONLY**: These scripts modify kernel traffic control (`tc`) and packet filtering (`iptables`). Execute only in isolated testbeds or virtual machines with administrative permissions (`sudo`).

---

## 1. File Summary

| Script | Purpose | Mechanism |
| :--- | :--- | :--- |
| `setup_tc_prio.sh` | Implements Strict Priority Queueing | Linux `prio` qdisc with 3 priority bands + `u32` DSCP matching filters. |
| `setup_tc_htb.sh` | Implements Class-Based Bandwidth Reservations | Linux `htb` (Hierarchical Token Bucket) with guaranteed minimum rates. |
| `iptables_dscp_rules.sh` | Layer 3 Traffic Marking & Anti-Spoofing | `iptables -t mangle` setting DSCP EF, AF41, CS0 and resetting untrusted packets. |
| `cleanup_qos.sh` | Restores default networking | Deletes custom qdiscs and flushes mangle chains. |

---

## 2. Step-by-Step Lab Execution

1. **Make scripts executable:**
   ```bash
   chmod +x *.sh
   ```

2. **Apply Traffic Control Priority Queuing:**
   ```bash
   sudo ./setup_tc_prio.sh
   ```

3. **Apply Ingress / Egress DSCP Marking:**
   ```bash
   sudo ./iptables_dscp_rules.sh
   ```

4. **Verify Active Queues & Dropped Packets:**
   ```bash
   sudo tc -s qdisc show dev eth0
   ```

5. **Clean up after testing:**
   ```bash
   sudo ./cleanup_qos.sh
   ```
