# SMART HOSPITAL EMERGENCY MRI PRIORITIZATION SYSTEM
### Final Year / Major B.Tech Project in Computer Networks & Smart Healthcare Systems
**Primary Focus: OSI Reference Model — Layer 3 (Network Layer) & IP-Based DiffServ QoS**

---

## 📌 Executive Summary

High-resolution medical imaging (such as 3D MRI scans, 250 MB to 1 GB) placed on hospital LANs often competes with routine diagnostic traffic and backups. Under default First-In-First-Out (FIFO) best-effort networking, network congestion introduces heavy bufferbloat delays and packet drops, which can severely delay time-critical neuroimaging in emergency stroke or trauma cases.

This project implements an authorized, clinical workflow-driven Layer 3 Differentiated Services (DiffServ) Quality of Service (QoS) system adhering to **IETF RFC 2474, RFC 2475, RFC 2597, and RFC 3246**:
- **Emergency MRI (Stroke/Trauma):** Marked with **DSCP 46 (Expedited Forwarding — EF)** and scheduled into a **Strict Priority Low-Latency Queue (LLQ)**.
- **Urgent MRI (ICU):** Marked with **DSCP 34 (Assured Forwarding — AF41)** and scheduled into a **Class-Based Weighted Fair Queue (CBWFQ)** with 30% guaranteed bandwidth.
- **Routine MRI (Outpatient):** Marked with **DSCP 0 (Class Selector 0 / Best Effort — CS0)** with starvation protection (20% minimum bandwidth).

---

## ⚠️ Important Technical & Medical Clarifications

1. **IP Address $\neq$ Priority:**
   - **IP Address:** Identifies endpoints, devices, and physical VLAN boundaries.
   - **DSCP / IP Precedence:** Marks the desired service class inside the IPv4 Type of Service (ToS) octet.
   - **Router Queuing (LLQ/CBWFQ):** Enforces differentiated packet scheduling based on DSCP codepoints.
2. **Medical Safety Notice:**
   - The system is a **computer networks traffic prioritization engine**, not an automated MRI diagnosis system.
   - Emergency status originates from an authorized clinical user (emergency physician). Physical scanning scheduling remains governed by clinical workflow.

---

## 🏗️ System Architecture & VLAN Design

```text
[ Emergency Workstation: 192.168.10.10 ] (VLAN 10) --\
                                                        \
[ Routine Workstation:   192.168.20.10 ] (VLAN 20) ------ [ Cisco 2960 L2 Switch ] === (802.1Q Trunk) === [ Cisco 2911 / Linux L3 Router ] --- [ Core PACS Server: 192.168.30.10:104 ]
                                                        /                                                    (Strict LLQ + CBWFQ)
[ Hospital Admin Desk:   192.168.40.10 ] (VLAN 40) --/
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ (Tested on Node v22)

### 1. Launch Backend Service (FastAPI + SQLite + QoS Gateway)
Open a terminal in the project root:
```bash
# Install Python requirements
python -m pip install -r backend/requirements.txt

# Start backend server
python backend/run_backend.py
```
- **Backend API & Swagger UI:** `http://127.0.0.1:8000/docs`
- **Database:** SQLite auto-seeded with sample patients, devices, and historical benchmarks.

### 2. Launch Frontend Web Dashboard (React + Vite + Tailwind CSS)
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
- **Frontend Dashboard:** `http://localhost:3000`

---

## 🧪 Step-by-Step Examiner Demonstration Script

1. **Executive Overview (`http://localhost:3000`):**
   - View active emergency flows, average transfer times, and L3 QoS gateway status (`192.168.10.1`).
2. **Patient Admission & Triage:**
   - Navigate to **"Patient Registration"** and admit a new emergency stroke patient (e.g. Robert Thorne).
3. **Emergency MRI Order & Live QoS Tagging:**
   - Navigate to **"New MRI Order"**.
   - Select the patient, choose **"EMERGENCY"**, and observe the live preview panel dynamically display `DSCP EF (46)`, Binary `101110`, IP Precedence `5`, and `Strict Priority LLQ`.
4. **Queue Scheduling & Live Study Transmission:**
   - Navigate to **"MRI Priority Queue"**.
   - Adjust the **Simulated Link Congestion slider to 85%**.
   - Click **"Transmit Study"** with **QoS ENABLED** $\rightarrow$ Transfer finishes in ~4.8s with ~9ms latency and 0% loss.
   - Toggle to **FIFO ONLY** $\rightarrow$ Notice transfer time surges to ~68s with high latency and packet drops!
5. **Interactive OSI 7-Layer Packet Dissector:**
   - Open **"OSI Packet Dissector"** to inspect the complete 7-layer breakdown, highlighting the IPv4 DS Field (DSCP + ECN bits in binary and hex).
6. **Cybersecurity & Spoofing Defense:**
   - Navigate to **"Cybersecurity & Audit"**.
   - Click **"Inject Rogue DSCP 46 Packet"** $\rightarrow$ Watch the edge trust boundary intercept the rogue packet, log a high-severity alert, and force-remark it to `DSCP 0 (Best Effort)`.
7. **Empirical Benchmarks & CSV Export:**
   - Open **"FIFO vs QoS Benchmark"** to review the measured performance curves and download the raw CSV dataset.

---

## 📁 Repository Directory Structure

```text
hosp-manage/
├── backend/
│   ├── app/
│   │   ├── config.py              # Configuration & DSCP definitions
│   │   ├── database.py            # SQLAlchemy SQLite connection
│   │   ├── models.py              # User, Patient, MRIRequest, NetworkDevice, QoSEvent, NetworkMetric, AuditLog
│   │   ├── schemas.py             # Pydantic validation models
│   │   ├── auth.py                # JWT authentication & Role-Based Access Control
│   │   ├── qos_engine.py          # Layer 3 DiffServ classification & security engine
│   │   ├── traffic_simulator.py   # Queuing delay, latency & socket emission simulator
│   │   ├── seed_data.py           # Automated database seeder
│   │   ├── main.py                # FastAPI app entrypoint
│   │   └── routers/               # auth, patients, mri, network, analytics, audit, simulation
│   ├── tests/                     # Unit test suites (test_auth, test_mri_qos, test_security)
│   ├── run_backend.py             # Backend server runner
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Sidebar, NotificationBanner, OsiPacketModal
│   │   ├── context/               # AuthContext with 1-click role switcher
│   │   ├── pages/                 # Dashboard, PatientRegistration, MRIRequest, MRIQueue,
│   │   │                          # NetworkMonitoring, QoSDashboard, OsiInspector,
│   │   │                          # NetworkTopology, CyberSecurityLogs, Reports, Login
│   │   ├── services/              # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── network_simulation/
│   ├── cisco_configs/             # Cisco 2960 Switch & Cisco 2911 Router MQC QoS configs
│   ├── linux_qos/                 # Linux tc (prio / htb), iptables DSCP marking scripts
│   ├── traffic_generator/         # Python socket IP_TOS sender, iperf3 runners, benchmark CSV
│   └── pcap_generator/            # Scapy PCAP generator & Wireshark capture files
├── docs/
│   ├── PROJECT_REPORT.md          # Complete B.Tech Major Project Thesis / Report
│   ├── ARCHITECTURE_DIAGRAMS.md   # UML & Mermaid Architecture Diagrams
│   ├── ALGORITHMS.md              # 6 Formal Algorithms in LaTeX/Pseudocode
│   └── VIVA_QUESTIONS_AND_ANSWERS.md # 25+ Viva Voce Examiner Questions & Answers
└── README.md
```

---

## 📜 Standards & Citations
- **IETF RFC 2474:** Definition of the Differentiated Services Field (DS Field)
- **IETF RFC 2475:** An Architecture for Differentiated Services
- **IETF RFC 3246:** An Expedited Forwarding PHB (EF - DSCP 46)
- **IETF RFC 2597:** Assured Forwarding PHB Group (AF - DSCP 34)
- **DICOM PS3.8:** Digital Imaging and Communications in Medicine - Network Protocols
