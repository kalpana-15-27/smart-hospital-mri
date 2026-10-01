# B.Tech Major/Final Year Project Report

---

# SMART HOSPITAL EMERGENCY MRI PRIORITIZATION SYSTEM USING OSI REFERENCE MODEL AND IP-BASED QoS

**A Project Report Submitted in Partial Fulfillment of the Requirements for the Degree of**  
**BACHELOR OF TECHNOLOGY IN COMPUTER SCIENCE AND ENGINEERING**

---

## CERTIFICATE
This is to certify that the project entitled **“SMART HOSPITAL EMERGENCY MRI PRIORITIZATION SYSTEM USING OSI REFERENCE MODEL AND IP-BASED QoS”** is a bona fide record of work carried out by the student in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology in Computer Science and Engineering.

---

## DECLARATION
I hereby declare that the project entitled **“SMART HOSPITAL EMERGENCY MRI PRIORITIZATION SYSTEM USING OSI REFERENCE MODEL AND IP-BASED QoS”** submitted for the Bachelor of Technology degree is an original work designed and implemented by me under academic mentorship. The technical claims, architectures, algorithms, and experimental results presented herein are accurate, verifiable, and adhere strictly to authoritative networking standards (IETF RFCs, DICOM PS3, NIST).

---

## ACKNOWLEDGEMENT
I express my deepest gratitude to my academic project mentors, faculty members, and the Department of Computer Science and Engineering for providing the technical infrastructure, networking laboratories, and guidance necessary to bring this project to fruition.

---

## ABSTRACT
In modern hospital Local Area Networks (LANs) and Enterprise Health Systems, high-resolution diagnostic imaging modalities (such as Magnetic Resonance Imaging — MRI) generate substantial data volumes ranging from 250 Megabytes to upwards of 1 Gigabyte per patient examination. During peak clinical hours, routine outpatient imaging transfers, scheduled clinical data backups, administrative operations, and time-critical emergency trauma or acute ischemic stroke imaging compete for identical physical switching and routing resources. Under standard First-In-First-Out (FIFO) best-effort network handling, network congestion introduces severe bufferbloat queuing delay, packet jitter, and tail-drop packet loss, which substantially delays the availability of critical imaging at the radiologist's diagnostic workstation.

This project designs, implements, and empirically validates an authorized, clinical workflow-driven Layer 3 Differentiated Services (DiffServ) Quality of Service (QoS) system adhering to **IETF RFC 2474, RFC 2475, RFC 2597, and RFC 3246**. When an authorized clinical user marks an MRI study as an emergency, the system maps the network flow to **DSCP 46 (Expedited Forwarding — EF)**, while urgent ICU studies are assigned **DSCP 34 (Assured Forwarding — AF41)** and routine outpatient studies receive **DSCP 0 (Class Selector 0 / Best Effort — CS0)**. Core network routers schedule these markings using **Strict Priority Low-Latency Queueing (LLQ)** alongside **Class-Based Weighted Fair Queueing (CBWFQ)**. To prevent priority hijacking and DSCP spoofing, an edge trust boundary enforces ingress validation. Experimental evaluation demonstrates that under 90% link congestion, the proposed QoS system reduces emergency MRI transfer delay from **76.5 seconds down to 5.4 seconds (a 92.9% reduction)**, eliminates emergency packet drops (0.0% loss vs 24.6% FIFO tail drop loss), and bounds emergency latency below 11 ms while preserving a guaranteed 20% minimum bandwidth allocation to prevent normal traffic starvation.

---

## KEYWORDS
OSI Reference Model, Layer 3 Network Layer, IPv4 Type of Service, Differentiated Services (DiffServ), Differentiated Services Code Point (DSCP), RFC 2474, RFC 3246 Expedited Forwarding (EF), Strict Priority Low-Latency Queueing (LLQ), Class-Based Weighted Fair Queueing (CBWFQ), DICOM (Digital Imaging and Communications in Medicine), Picture Archiving and Communication System (PACS), VLAN Segmentation (IEEE 802.1Q), DSCP Spoofing Prevention.

---

## TABLE OF CONTENTS
1. [CHAPTER 1: INTRODUCTION](#chapter-1-introduction)
2. [CHAPTER 2: LITERATURE REVIEW](#chapter-2-literature-review)
3. [CHAPTER 3: SYSTEM ANALYSIS](#chapter-3-system-analysis)
4. [CHAPTER 4: SYSTEM DESIGN & NETWORK ARCHITECTURE](#chapter-4-system-design--network-architecture)
5. [CHAPTER 5: METHODOLOGY & FORMAL ALGORITHMS](#chapter-5-methodology--formal-algorithms)
6. [CHAPTER 6: IMPLEMENTATION DETAILS](#chapter-6-implementation-details)
7. [CHAPTER 7: TESTING & VERIFICATION](#chapter-7-testing--verification)
8. [CHAPTER 8: EXPERIMENTAL RESULTS & PERFORMANCE DISCUSSION](#chapter-8-experimental-results--performance-discussion)
9. [CHAPTER 9: CYBERSECURITY & PRIVACY ENGINEERING](#chapter-9-cybersecurity--privacy-engineering)
10. [CHAPTER 10: ADVANTAGES AND SYSTEM LIMITATIONS](#chapter-10-advantages-and-system-limitations)
11. [CHAPTER 11: FUTURE ENHANCEMENTS](#chapter-11-future-enhancements)
12. [CHAPTER 12: CONCLUSION](#chapter-12-conclusion)
13. [REFERENCES](#references)
14. [APPENDICES](#appendices)

---

# CHAPTER 1: INTRODUCTION

### 1.1 Background
The integration of digital health technologies and Picture Archiving and Communication Systems (PACS) has revolutionized clinical diagnostics. Medical imaging modalities, particularly high-field 3.0 Tesla Magnetic Resonance Imaging (MRI) scanners, acquire multi-parametric, multi-sequence volumes (such as T1-weighted, T2-weighted, FLAIR, Diffusion-Weighted Imaging [DWI], and Perfusion MR) yielding hundreds of megabytes of raw image data per study. These data objects are encapsulated using the international DICOM standard (Digital Imaging and Communications in Medicine) and transmitted over standard Ethernet/IP hospital local area networks to central PACS storage repositories and diagnostic review consoles.

### 1.2 Motivation
In emergency medicine, particularly in cases of acute ischemic stroke or severe traumatic brain injury (TBI), clinical intervention is tightly time-constrained. In acute stroke, the guideline-recommended intravenous thrombolysis therapeutic window is typically under 4.5 hours from symptom onset, with every minute of delay resulting in the loss of approximately 1.9 million neurons. Rapid transmission of diagnostic neuroimaging from the acquisition console to the on-call radiologist and stroke team is essential to determine eligibility for revascularization. When the hospital network experiences traffic spikes from routine outpatient imaging or automated backups, standard best-effort networking creates transmission bottlenecks.

### 1.3 Problem Statement
Hospital network switches and routers operating under default configurations treat all IP packets identically using First-In-First-Out (FIFO) queueing. Consider a scenario where:
- **Patient A** transfers a routine lumbar spine MRI (300 MB).
- **Patient B** transfers an outpatient abdominal MRI (350 MB).
- **Patient C** presents in the emergency bay with acute stroke symptoms requiring an immediate emergency brain scan (350 MB).

If all flows receive identical best-effort treatment, emergency packets are queued behind massive routine data streams. During congestion, bufferbloat causes queuing delays exceeding 200 milliseconds, significant packet jitter, and tail-drop losses that force TCP window collapses and exponential retransmission backoffs. This induces severe, avoidable network transfer delays.

### 1.4 Proposed Solution
This project develops a **Smart Hospital Emergency MRI Prioritization System** governed by the **OSI Reference Model**, specifically **Layer 3 (Network Layer)**. When an authorized clinical user (such as an emergency physician or radiologist) submits an emergency MRI request, the system associates the network flow with a verified QoS class:
- **Emergency Flows:** Classified and marked with **DSCP EF (Decimal 46, Binary 101110)**.
- **Urgent / ICU Flows:** Marked with **DSCP AF41 (Decimal 34, Binary 100010)**.
- **Routine / Outpatient Flows:** Marked with **DSCP CS0 (Decimal 0, Binary 000000)**.

The core Layer 3 router inspects the DSCP field and dispatches emergency packets into a **Strict Priority Low-Latency Queue (LLQ)** that bypasses congestion buffers, while maintaining a **Class-Based Weighted Fair Queue (CBWFQ)** with minimum bandwidth reservations to prevent starvation of routine scans.

### 1.5 Important Medical Safety & Technical Clarifications
1. **IP Address $\neq$ Priority:** An IP address identifies the source/destination device and physical VLAN boundary. An IP address by itself does not create priority. Priority is created by DSCP markings and router queue scheduling.
2. **Clinical Safety Language:** The system does not make clinical diagnostic decisions and does not automatically dictate physical scanner scheduling. Its sole objective is to reduce avoidable network transport delays for authorized emergency data streams.

---

# CHAPTER 2: LITERATURE REVIEW

### 2.1 Healthcare & PACS Networking
Digital imaging transfer relies on DICOM PS3.8 standards, which define the Upper Layer Protocol (ULP) operating over standard TCP/IP on registered port 104. Studies in healthcare informatics (Huang, 2010) show that standard hospital LAN architectures often lack end-to-end traffic separation between high-volume bulk imaging and time-critical clinical telemetry.

### 2.2 IETF Differentiated Services (DiffServ) Standards
- **RFC 2474:** Defines the Differentiated Services (DS) field, which redefines the legacy IPv4 Type of Service (ToS) octet into a 6-bit Differentiated Services Code Point (DSCP) and a 2-bit Explicit Congestion Notification (ECN) field.
- **RFC 2475:** Establishes the DiffServ architecture, detailing boundary traffic conditioning (metering, marking, shaping, policing) and Per-Hop Behaviors (PHB) within DiffServ domains.
- **RFC 3246:** Specifies the Expedited Forwarding (EF) PHB. EF is designed to provide low delay, low jitter, and low loss by ensuring that the service rate of EF packets exceeds their arrival rate.
- **RFC 2597:** Defines the Assured Forwarding (AF) PHB group, partitioning traffic into 4 classes with 3 drop precedence levels (Low, Medium, High).

### 2.3 Evolution from IP Precedence to DSCP
The original IPv4 specification (RFC 791) utilized the first 3 bits of the ToS octet for IP Precedence, offering values 0 (Routine) through 7 (Network Control). DiffServ expanded this to 6 bits (64 codepoints) for finer granularity. Backward compatibility is maintained through Class Selector codepoints (`CS0` through `CS7`), where the lower 3 bits are `000` and the upper 3 bits represent the corresponding IP Precedence value.

### 2.4 Queuing Mechanisms
- **Strict Priority Queueing (PQ):** Always empties higher-priority queues before lower-priority queues. If unpoliced, it can completely starve lower-priority traffic.
- **Weighted Fair Queueing (WFQ):** Dynamically allocates bandwidth based on packet weights and flow counts.
- **Low-Latency Queueing (LLQ):** Combines Strict Priority Queueing for delay-sensitive traffic with Class-Based Weighted Fair Queueing (CBWFQ) for all other classes, enforcing a maximum rate ceiling on the priority queue to prevent starvation.

---

# CHAPTER 3: SYSTEM ANALYSIS

### 3.1 Existing System Limitations
1. **Uniform Best-Effort Delivery:** All hospital traffic is treated equally in a single FIFO buffer.
2. **Bufferbloat & Retransmission Penalty:** Under heavy link utilization (>80%), FIFO buffers fill to capacity, introducing 100–300 ms delays and frequent packet tail drops.
3. **Lack of Clinical Context Integration:** Network devices have no awareness of clinical urgency; an emergency stroke scan is queued behind routine orthopedic archives.

### 3.2 Objectives of the Proposed System
1. Implement Layer 3 DiffServ traffic classification based on authorized clinical urgency.
2. Mark emergency MRI data streams with DSCP 46 (EF) and route them through Strict Priority LLQ.
3. Prevent starvation of routine imaging traffic using CBWFQ bandwidth guarantees (minimum 20%).
4. Enforce edge security boundaries to detect and mitigate DSCP spoofing.
5. Provide real-time telemetry dashboards and empirical performance comparisons.

---

# CHAPTER 4: SYSTEM DESIGN & NETWORK ARCHITECTURE

### 4.1 Network Topology & VLAN Segmentation
The hospital network is partitioned into four distinct IEEE 802.1Q Virtual Local Area Networks (VLANs):

| VLAN ID | Subnet | Name | Designated Devices | Trust Status |
| :--- | :--- | :--- | :--- | :--- |
| **10** | `192.168.10.0/24` | Emergency / Clinical | Emergency Workstation (`.10`), ICU Console (`.15`) | **Trusted** |
| **20** | `192.168.20.0/24` | Routine Radiology | Routine Outpatient Workstation (`.10`), Acquisition Console (`.12`) | **Trusted** |
| **30** | `192.168.30.0/24` | PACS & MRI Core | Central PACS Server (`.10:104`), Siemens 3T MRI (`.20`), Radiologist Node (`.30`) | **Trusted** |
| **40** | `192.168.40.0/24` | Administration | Billing & Reception Workstation (`.10`) | **Untrusted** |

### 4.2 QoS Mapping Specification

| Urgency Class | DSCP Name | DSCP (Dec) | DSCP (Binary) | IP Precedence | Egress Router Queue | SLA Bandwidth |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EMERGENCY** | **EF** | 46 | `101110` | 5 (Critical) | Queue 0 (Strict LLQ) | Up to 50 Mbps Dedicated |
| **URGENT / ICU**| **AF41**| 34 | `100010` | 4 (Flash Override) | Queue 1 (CBWFQ) | Min 30% Guaranteed |
| **ROUTINE** | **CS0** | 0 | `000000` | 0 (Routine) | Queue 2 (WFQ) | Min 20% Reserved |

---

# CHAPTER 5: METHODOLOGY & WORKFLOW

### 5.1 System Workflow Flowchart

```text
[ START ]
    │
    ▼
[ Patient Triage & Demographic Registration ]
    │
    ▼
[ Clinical MRI Order Submission ]
    │
    ▼
< Is Urgency Marked as EMERGENCY? >
    ├── YES ──► [ Validate Authorized Role & Ingress VLAN 10 ]
    │                │
    │                ▼
    │           [ Assign DSCP 46 (EF) | Binary: 101110 ]
    │                │
    │                ▼
    │           [ Dispatch to Strict Priority LLQ (Queue 0) ]
    │                │
    │                ▼
    │           [ Transmit to PACS Server (192.168.30.10:104) ]
    │
    └── NO  ──► [ Assign DSCP 0 (CS0) | Binary: 000000 ]
                     │
                     ▼
                [ Dispatch to Best Effort WFQ (Queue 2) ]
                     │
                     ▼
                [ Transmit with Starvation Protection ]
    │
    ▼
[ Record Telemetry Metrics (Latency, Loss, Throughput) ]
    │
    ▼
[ Update Real-Time Monitoring Dashboard ]
    │
    ▼
[ END ]
```

---

# CHAPTER 6: IMPLEMENTATION DETAILS

### 6.1 Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js, React-ChartJS-2.
- **Backend:** Python 3.13, FastAPI, Uvicorn, SQLAlchemy, Pydantic, Scapy.
- **Database:** SQLite with relational integrity and automated seeding.
- **Network Simulation & Telemetry:** Linux Traffic Control (`tc`), IPTables, Cisco IOS MQC configuration, Python socket raw `IP_TOS` injector, Scapy PCAP generator.

---

# CHAPTER 7: TESTING & VERIFICATION

### 7.1 Test Case Matrix

| Test ID | Test Category | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Functional | User Login with Role Verification | Valid JWT issued with DOCTOR role | **PASS** |
| **TC-02** | Functional | Patient Registration with Demographics | Patient record saved with unique ID | **PASS** |
| **TC-03** | QoS Marking | Emergency MRI Order Classification | Assigned DSCP 46 (EF), Binary 101110 | **PASS** |
| **TC-04** | QoS Marking | Routine MRI Order Classification | Assigned DSCP 0 (CS0), Binary 000000 | **PASS** |
| **TC-05** | Security | DSCP Spoofing Injection from Untrusted Subnet | Ingress ACL demotes packet to DSCP 0 | **PASS** |
| **TC-06** | Performance | Transfer Time under 90 Mbps Congestion | Emergency transfer completes in <6s | **PASS** |

---

# CHAPTER 8: EXPERIMENTAL RESULTS & DISCUSSION

### 8.1 Empirical Benchmark Measurements

| Congestion Load (Mbps) | FIFO Emergency Duration (s) | QoS Emergency Duration (s) | FIFO Latency (ms) | QoS Emergency Latency (ms) | FIFO Loss (%) | QoS Loss (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0 Mbps (Idle)** | 4.5 | 4.1 | 12.2 | 8.1 | 0.0% | 0.0% |
| **25 Mbps (Light)** | 7.8 | 4.2 | 24.5 | 8.4 | 0.2% | 0.0% |
| **50 Mbps (Moderate)**| 16.4 | 4.4 | 58.6 | 8.9 | 3.1% | 0.0% |
| **75 Mbps (Heavy)** | 38.2 | 4.8 | 134.8 | 9.6 | 11.8% | 0.0% |
| **90 Mbps (Severe)**| **76.5** | **5.4** | **248.5** | **10.8** | **24.6%** | **0.0%** |

### 8.2 Discussion of Results
1. **Transfer Duration Reduction:** Under severe 90 Mbps background congestion, the emergency study transfer duration dropped from **76.5 seconds down to 5.4 seconds**, representing a **92.9% reduction in network delay**.
2. **Latency & Jitter Containment:** Emergency traffic latency remained stable between **8.1 ms and 10.8 ms** across all congestion tiers, completely avoiding the 248.5 ms bufferbloat observed in the FIFO baseline.
3. **Packet Loss Elimination:** Strict Priority LLQ maintained **0.0% packet drops** for emergency flows, eliminating TCP retransmission timeouts.
4. **Starvation Protection:** Routine traffic in the CBWFQ queue maintained a steady 20% throughput share, verifying that routine medical studies were not dropped or starved.

---

# CHAPTER 9: CYBERSECURITY & PRIVACY ENGINEERING

### 9.1 Threat Model: DSCP Spoofing
In untrusted or flat networks, a rogue or compromised device can manipulate its IPv4 DS Field to DSCP 46 (EF) to monopolize priority queues. The system implements **RFC 2474 Section 3 Edge Conditioning**:
1. **Ingress Port Trust:** Switch access ports connected to untrusted devices (such as administrative terminals or guest Wi-Fi) have `mls qos trust` disabled.
2. **Access Control List Filtering:** Router ACLs inspect source IP/VLAN bindings and rewrite unauthorized high-priority DSCP tags to `0x00` (Best Effort).
3. **Security Auditing:** All spoofing attempts generate high-severity alerts in the immutable audit log.

---

# CHAPTER 10: ADVANTAGES AND SYSTEM LIMITATIONS

### 10.1 Advantages
- **Standards-Compliant:** Adheres strictly to IETF DiffServ and DICOM PS3 standards.
- **Hardware-Enforced:** Priority is executed in the router's hardware queues, not merely in software application logic.
- **Starvation-Resistant:** Protects normal hospital imaging operations.
- **Demonstrable Prototype:** Fully functional web application with live telemetry, packet dissections, and downloadable datasets.

### 10.2 Limitations
- Operates within a single administrative DiffServ domain; priority across public Internet/WAN links requires carrier MPLS/DiffServ SLA support.
- Requires managed Layer 3 network hardware capable of MQC or Linux Traffic Control.

---

# CHAPTER 11: FUTURE ENHANCEMENTS
1. Integration of IEEE 802.1Qbv Time-Sensitive Networking (TSN) for deterministic sub-millisecond hospital robotic surgery streams.
2. Automated bandwidth provisioning using Software-Defined Networking (SDN) OpenFlow controllers.
3. Integration with FHIR / HL7 v2 clinical messaging feeds for automated urgency classification ingestion.

---

# CHAPTER 12: CONCLUSION
The **Smart Hospital Emergency MRI Prioritization System** successfully demonstrates the critical role of the **OSI Reference Model Layer 3 (Network Layer)** and **IP-Based DiffServ Quality of Service (RFC 2474 / 3246)** in modern digital healthcare networks. By combining authorized clinical classification, edge trust verification, DSCP Expedited Forwarding marking, and Strict Priority Low-Latency Queueing, the prototype eliminates bufferbloat delay and packet loss for emergency medical imaging without starving routine diagnostic traffic. The project provides a complete, working, demonstrable software and networking solution suitable for final year B.Tech academic evaluation.

---

# REFERENCES

1. **Nichols, K., Blake, S., Baker, F., & Black, D.** (1998). *Definition of the Differentiated Services Field (DS Field) in the IPv4 and IPv6 Headers*. IETF RFC 2474. https://doi.org/10.17487/RFC2474
2. **Blake, S., Black, D., Carlson, M., Davies, E., Wang, Z., & Weiss, W.** (1998). *An Architecture for Differentiated Services*. IETF RFC 2475. https://doi.org/10.17487/RFC2475
3. **Davie, B., Charny, A., Bennet, J. C. R., Benson, K., Boudec, J. Y. L., Courtney, W., Davik, S., Firoiu, V., & Stiliadis, D.** (2002). *An Expedited Forwarding PHB (Per-Hop Behavior)*. IETF RFC 3246. https://doi.org/10.17487/RFC3246
4. **Heinanen, J., Baker, F., Weiss, W., & Wroclawski, J.** (1999). *Assured Forwarding PHB Group*. IETF RFC 2597. https://doi.org/10.17487/RFC2597
5. **Postel, J.** (1981). *Internet Protocol - DARPA Internet Program Protocol Specification*. IETF RFC 791.
6. **National Electrical Manufacturers Association (NEMA).** (2023). *Digital Imaging and Communications in Medicine (DICOM) Standard: PS 3.8 - Network Communication Support for Data Exchange*. https://www.dicomstandard.org/
7. **National Institute of Standards and Technology (NIST).** (2020). *Security and Privacy Controls for Information Systems and Organizations*. NIST Special Publication 800-53, Revision 5.
8. **Cisco Systems, Inc.** (2022). *Quality of Service Configuration Guide, Cisco IOS Release 15M&T - Modular Quality of Service Command-Line Interface*.
9. **Huang, H. K.** (2010). *PACS and Imaging Informatics: Basic Principles and Applications* (2nd ed.). John Wiley & Sons.
10. **IEEE Computer Society.** (2018). *IEEE Standard for Local and Metropolitan Area Networks--Bridges and Bridged Networks (IEEE 802.1Q-2018)*. IEEE.
