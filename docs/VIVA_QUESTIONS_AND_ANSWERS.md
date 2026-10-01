# Comprehensive Viva Voce Examination Guide

## Project: Smart Hospital Emergency MRI Prioritization System
### B.Tech Computer Science and Engineering

---

### Category 1: Computer Networks & OSI Model Concepts

#### Q1: What is the primary OSI layer addressed in this project, and why?
**Answer:** The primary focus is **OSI Layer 3 (Network Layer)**. We utilize the IPv4 Differentiated Services (DiffServ) architecture (RFC 2474), specifically the 6-bit Differentiated Services Code Point (DSCP) located inside the IPv4 Type of Service (ToS) octet, to classify, mark, and prioritize time-critical hospital medical imaging data across router queues.

#### Q2: Does an IP address itself create network priority?
**Answer:** **No.** An IP address identifies source and destination endpoints and network subnet boundaries. Priority is created by **DSCP/IP Precedence markings in the packet header** together with **router hardware queue scheduling algorithms** (such as LLQ and CBWFQ). The IP address serves as an input to edge classification to verify trust, but the packet priority itself is carried by the DSCP codepoint.

#### Q3: What is the difference between legacy IP Precedence and modern DSCP?
**Answer:**
- **IP Precedence (RFC 791):** Used only the first 3 bits of the ToS octet, offering only 8 priority levels (0 to 7).
- **DSCP (RFC 2474):** Uses the first 6 bits of the ToS octet (redefined as the DS Field), offering 64 distinct codepoints ($2^6 = 64$) with granular Per-Hop Behaviors (PHB).
- Backward compatibility is maintained via Class Selector (CS) codepoints (`xxx000`), where the upper 3 bits match legacy IP Precedence.

#### Q4: What are the remaining 2 bits in the 8-bit DS Field used for?
**Answer:** The lower 2 bits (bits 6 and 7) are reserved for **Explicit Congestion Notification (ECN)** per RFC 3168. Values include `00` (Not-ECT), `01` (ECT(1)), `10` (ECT(0)), and `11` (CE - Congestion Experienced).

---

### Category 2: DiffServ QoS & Queuing Algorithms

#### Q5: Explain the DSCP values chosen for this hospital prototype.
**Answer:**
1. **Emergency MRI (DSCP 46 / EF - Expedited Forwarding):** Binary `101110`, ToS Byte `0xB8`. Defined in RFC 3246 for low-delay, low-jitter, low-loss traffic. Mapped to Strict Priority Low-Latency Queueing (LLQ).
2. **Urgent ICU MRI (DSCP 34 / AF41 - Assured Forwarding 41):** Binary `100010`, ToS Byte `0x88`. Defined in RFC 2597 (Class 4, Low Drop Precedence). Mapped to Class-Based Weighted Fair Queueing (CBWFQ) with 30% guaranteed bandwidth.
3. **Routine MRI (DSCP 0 / CS0 - Best Effort):** Binary `000000`, ToS Byte `0x00`. Defined in RFC 2474 for standard traffic. Mapped to Weighted Fair Queueing (WFQ) with 20% reserved bandwidth to prevent starvation.

#### Q6: How does the system prevent starvation of normal (routine) hospital traffic?
**Answer:** Through **Class-Based Weighted Fair Queueing (CBWFQ)**. While Emergency traffic has strict priority via LLQ up to a configured threshold (e.g., 50 Mbps on a 100 Mbps link), the remaining bandwidth is mathematically partitioned with dedicated reservations for normal traffic (minimum 20%), guaranteeing routine scans continue to make progress even during heavy emergency bursts.

#### Q7: What is the difference between FIFO and Priority Queuing under network congestion?
**Answer:**
- In **FIFO (First-In-First-Out)**, all packets enter a single shared buffer. When the link is congested, bufferbloat causes queuing delay (e.g. 200+ ms) and tail-drop packet loss (15-25%), severely delaying emergency scans.
- In **Priority Queuing (LLQ)**, emergency packets enter a dedicated priority buffer that is always emptied first before standard buffers, maintaining low latency (<10 ms) and 0% loss.

---

### Category 3: Healthcare Protocols (DICOM & PACS)

#### Q8: What is DICOM, and what network port does it use?
**Answer:** DICOM (Digital Imaging and Communications in Medicine) is the global standard for medical image data exchange (NEMA / ISO 12052). It operates over TCP/IP using the official registered **TCP Port 104** (with 11112 and 10400 commonly used in testing).

#### Q9: What is DIMSE C-STORE?
**Answer:** DIMSE (DICOM Message Service Element) C-STORE is the composite service command used to push medical imaging studies (e.g. MRI slices) from an acquisition scanner (Service Class User - SCU) to an archive server (Picture Archiving and Communication System - PACS / Service Class Provider - SCP).

#### Q10: Does this system modify the DICOM image data or diagnose patients?
**Answer:** **No.** The system operates purely at the network layer on packet headers (DSCP/IP metadata). It does not alter DICOM image pixels or make autonomous diagnostic decisions. Physical patient scanning and diagnosis remain governed strictly by authorized clinical workflows.

---

### Category 4: Cybersecurity & Trust Boundaries

#### Q11: What is DSCP Spoofing, and how is it mitigated in this project?
**Answer:** DSCP Spoofing occurs when an unauthorized host or malware arbitrarily sets its packet headers to DSCP 46 (EF) to steal priority bandwidth. We mitigate this using **RFC 2474 Edge Traffic Conditioning**: ingress switch access ports and router ACLs verify source VLANs, MAC/IP bindings, and authenticated clinical user roles. Any untrusted packet claiming high-priority DSCP is force-remarked to DSCP 0 (Best Effort) at the network perimeter.

#### Q12: How does the system ensure HIPAA compliance and auditability?
**Answer:** All login attempts, patient registrations, imaging orders, and priority classifications are recorded in an immutable database audit log (`audit_logs` table) with timestamps, usernames, roles, and IP addresses. No real Protected Health Information (PHI) is used; all demonstration data is synthetic.
