# Cisco QoS Implementation Guide for Smart Hospital MRI Prioritization

## Topology Setup (Cisco Packet Tracer / GNS3 / EVE-NG)

```text
[ Emergency PC: 192.168.10.10 ] (VLAN 10) --\
                                              \
[ Routine PC:   192.168.20.10 ] (VLAN 20) ---- [ Cisco 2960 Switch ] === (802.1Q Trunk) === [ Cisco 2911 Router ] --- [ PACS Server: 192.168.30.10:104 ]
                                              /
[ Admin PC:     192.168.40.10 ] (VLAN 40) --/
```

---

## 1. Cisco MQC (Modular QoS CLI) Explanation

The Cisco implementation utilizes the **Modular QoS CLI (MQC)** three-tier architecture:

1. **Traffic Classification (`class-map`)**:
   - `class-map match-any EMERGENCY_TRAFFIC` matches `ip dscp ef` (Expedited Forwarding, DSCP 46).
   - `class-map match-any URGENT_TRAFFIC` matches `ip dscp af41` (Assured Forwarding 41, DSCP 34).
   - `class-map match-any ROUTINE_TRAFFIC` matches `ip dscp default` / `cs0` (Best Effort, DSCP 0).

2. **Traffic Policy Definition (`policy-map`)**:
   - `policy-map HOSPITAL_MRI_QOS_POLICY` binds queuing algorithms to defined classes.
   - `priority percent 50`: Configures **Low Latency Queuing (LLQ)** for Emergency traffic. This is a strict priority queue that is serviced first before any other queues.
   - `bandwidth percent 30`: Configures **Class-Based Weighted Fair Queueing (CBWFQ)** for Urgent traffic, allocating 30% guaranteed bandwidth.
   - `class class-default`: Configures standard fair queuing with 20% reserved bandwidth, preventing starvation of routine outpatient scans.

3. **Policy Attachment (`service-policy`)**:
   - `service-policy output HOSPITAL_MRI_QOS_POLICY` attaches the policy to the egress bottleneck interface toward the PACS storage network.

---

## 2. Verification Commands

Run the following commands in the Cisco CLI (Privileged EXEC mode `Router#`):

### A. Verify Applied QoS Statistics & Queuing Drops
```ios
Router# show policy-map interface GigabitEthernet0/1
```
*Output illustrates active packet counters in LLQ (Priority Queue) vs CBWFQ (Class-default), queue depth, and drop counts.*

### B. Verify Configured Class Maps
```ios
Router# show class-map
```

### C. Verify Active Inter-VLAN Interfaces
```ios
Router# show ip interface brief
```

### D. Verify Ingress Anti-Spoofing ACLs
```ios
Router# show access-lists ACL_BLOCK_DSCP_SPOOFING
```

---

> [!NOTE]
> *Lab Disclaimer:* Command syntax is structured for Cisco IOS 15.x / IOS-XE. Parameters such as queue depth and percentage bandwidth should be tuned according to the actual hospital line rate.
