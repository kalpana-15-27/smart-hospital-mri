# Smart Hospital Emergency MRI Prioritization System

A B.Tech MINI project exploring how computer networks can support time-sensitive MRI transfers in a hospital environment.

The project focuses on the **OSI Network Layer (Layer 3)** and **Differentiated Services (DiffServ) Quality of Service (QoS)**. It demonstrates how MRI traffic can be classified and handled differently based on the urgency assigned by authorized clinical staff.

## About the Project

Hospitals transfer large medical images across their networks while other traffic, such as routine diagnostic transfers and backups, is also using the same infrastructure. When the network becomes congested, important transfers may experience longer delays or packet loss.

This project explores a network-level approach to that problem. It uses DSCP markings and queueing policies to give emergency MRI traffic higher priority than urgent and routine transfers. The application also provides a dashboard for viewing MRI requests, network activity, simulated transfer results, and security events.

The QoS design follows the principles described in **IETF RFC 2474, RFC 2475, RFC 2597, and RFC 3246**.

### Traffic classes

| MRI request type | DSCP value | Intended handling |
|---|---|---|
| Emergency — stroke or trauma | DSCP 46 (EF) | Strict-priority, low-latency queue (LLQ) |
| Urgent — ICU | DSCP 34 (AF41) | Class-Based Weighted Fair Queueing (CBWFQ), with a 30% bandwidth allocation |
| Routine — outpatient | DSCP 0 (CS0 / Best Effort) | Best-effort queue, with a 20% minimum bandwidth allocation to help prevent starvation |

These values describe the project's intended QoS policy. Actual results depend on the network configuration and the environment in which the system is run.

## A Few Important Details

- **An IP address does not determine priority by itself.** It identifies a device or endpoint. DSCP marks the intended traffic class, and the router or other network device applies the relevant queueing policy.
- **This is a networking project, not a medical diagnosis tool.** It does not interpret MRI images or diagnose patients.
- **Emergency status is assigned by an authorized clinical user.** The application demonstrates network traffic prioritization; clinical decisions and physical MRI scheduling remain part of the hospital's workflow.
- **Demonstration results are environment-dependent.** Values shown by the simulator should not be treated as guaranteed performance on a real hospital network.

## Network Layout

The proposed setup separates workstations into VLANs and sends their traffic through a Layer 2 switch to a Layer 3 router. The router applies the configured QoS policy before traffic reaches the Picture Archiving and Communication System (PACS) server.

```text
[Emergency Workstation: 192.168.10.10] (VLAN 10) --\
                                                      \
[Routine Workstation:   192.168.20.10] (VLAN 20) ------ [Cisco 2960 L2 Switch]
                                                        === 802.1Q trunk ===
[Hospital Admin Desk:   192.168.40.10] (VLAN 40) --/                         |
                                                                            v
                                                [Cisco 2911 / Linux L3 Router]
                                                     (LLQ + CBWFQ)
                                                            |
                                                            v
                                             [Core PACS Server: 192.168.30.10:104]
```

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Python, FastAPI
- **Database:** SQLite with SQLAlchemy
- **Authentication:** JWT-based authentication and role-based access control
- **Networking:** IPv4 DSCP, DiffServ, VLANs, LLQ and CBWFQ
- **Network experiments:** Linux traffic control (`tc`), iptables, Python socket traffic generation, iperf3, Scapy and Wireshark

## Main Features

The project brings together the following parts of the workflow:

- **MRI request management:** Register sample patients and create MRI requests with an assigned urgency level.
- **QoS classification:** Map each request category to the project's configured DSCP value and queueing policy.
- **Network monitoring:** View network status, active flows, and transfer-related metrics through the dashboard.
- **Traffic simulation:** Compare the behaviour shown by QoS-enabled and FIFO-only transfer modes under simulated congestion.
- **Packet inspection:** Examine OSI-layer information and the IPv4 DS field using the packet dissector view.
- **Security event logging:** Demonstrate how packets carrying an untrusted priority marking can be detected and remarked at the network boundary.
- **Benchmark export:** Review the available comparison results and export benchmark data as CSV.

These features are intended to make the networking concepts easier to explore through a single application.

## Testing and Validation

A `backend/tests/` directory is included for authentication, MRI QoS, and security-related tests. To run the tests, first install the backend dependencies, then use the test runner configured by the project. For a standard pytest setup, the command is:

```bash
python -m pytest backend/tests/
```

If pytest is not included in `backend/requirements.txt`, install it in your development environment before running this command.

For a project demonstration, it is useful to record the test conditions alongside the results, including the congestion setting, transfer mode, file size, number of runs, average transfer time, latency, and packet loss. This makes the comparison easier to reproduce and explain during evaluation.

## Getting Started

### Requirements

- Python 3.10 or later
- Node.js 18 or later
- npm

The project has been tested with Python 3.13 and Node.js 22. Other versions may also work, but have not necessarily been tested.

### 1. Start the backend

From the project root, install the Python dependencies and start the backend:

```bash
python -m pip install -r backend/requirements.txt
python backend/run_backend.py
```

The FastAPI documentation should then be available at:

- API and Swagger UI: `http://127.0.0.1:8000/docs`

The project uses SQLite. On startup, the application is expected to seed sample patients, network devices, and historical benchmark data.

### 2. Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite in the terminal. The project is configured to use `http://localhost:3000` for the dashboard.

If the dashboard does not open at that address, check the Vite configuration and use the URL shown in the terminal.

## Exploring the Application

The following walkthrough can be used to demonstrate the main features.

1. **Dashboard:** Open the dashboard and review the active emergency flows, transfer-time summaries, and Layer 3 QoS gateway status.
2. **Patient registration:** Go to **Patient Registration** and add a sample patient for the demonstration.
3. **Create an MRI request:** Open **New MRI Order**, select the patient, and choose **Emergency**. The QoS preview should show DSCP EF (46), binary `101110`, IP Precedence 5, and the Strict Priority LLQ policy.
4. **Compare queueing behaviour:** Open **MRI Priority Queue** and set simulated link congestion to 85%. Run a transfer with QoS enabled, then compare it with FIFO-only mode. The simulator is designed to illustrate how congestion can affect transfer time, latency, and packet loss.
5. **Inspect packet fields:** Use **OSI Packet Dissector** to review the seven OSI layers and inspect the IPv4 DS field, including DSCP and ECN bits in binary and hexadecimal.
6. **Test the security check:** In **Cybersecurity & Audit**, use **Inject Rogue DSCP 46 Packet** to demonstrate how an untrusted packet is detected, logged, and remarked as DSCP 0 (Best Effort).
7. **Review benchmark results:** Open **FIFO vs QoS Benchmark** to compare the displayed results and export the available CSV data.

The transfer times and packet-loss figures displayed in the demonstration are simulated or environment-specific. They should be reported as measured results only when supported by a reproducible test run.

## Project Structure

```text
hosp-manage/
├── backend/
│   ├── app/
│   │   ├── config.py              # Application settings and DSCP definitions
│   │   ├── database.py            # SQLAlchemy and SQLite setup
│   │   ├── models.py              # Database models
│   │   ├── schemas.py             # Pydantic request and response schemas
│   │   ├── auth.py                # JWT authentication and role-based access
│   │   ├── qos_engine.py          # Layer 3 traffic classification and security
│   │   ├── traffic_simulator.py   # Transfer and queueing simulation
│   │   ├── seed_data.py           # Sample data setup
│   │   ├── main.py                # FastAPI application entry point
│   │   └── routers/               # Authentication, patients, MRI, network,
│   │                              # analytics, audit and simulation endpoints
│   ├── tests/                     # Authentication, MRI QoS and security tests
│   ├── run_backend.py             # Backend launcher
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/            # Shared UI components
│   │   ├── context/               # Authentication context and role switcher
│   │   ├── pages/                 # Dashboard, patient, MRI, network and report views
│   │   ├── services/               # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── network_simulation/
│   ├── cisco_configs/             # Cisco switch and router QoS configurations
│   ├── linux_qos/                 # Linux traffic-control and DSCP scripts
│   ├── traffic_generator/          # Socket sender, iperf3 runners and benchmark CSV
│   └── pcap_generator/             # Scapy packet generation and Wireshark captures
├── docs/
│   ├── PROJECT_REPORT.md           # Major project report
│   ├── ARCHITECTURE_DIAGRAMS.md    # Architecture diagrams
│   ├── ALGORITHMS.md               # Algorithms and pseudocode
│   └── VIVA_QUESTIONS_AND_ANSWERS.md # Viva preparation questions and answers
└── README.md
```

## Limitations and Possible Future Improvements

This version is designed for an academic prototype and controlled demonstrations. A few areas that could be explored further are:

- **Real network integration:** Validate the policies on an isolated test network or supported network hardware before considering any operational use.
- **More detailed benchmarking:** Run repeated trials with different file sizes and congestion levels, then report averages and variability rather than relying on a single run.
- **Stronger access controls:** Review authentication, authorization, audit logging, and secret management before using anything beyond sample data.
- **Operational monitoring:** Add clearer health checks and alerts for unavailable devices, failed transfers, and configuration mismatches.
- **Clinical workflow integration:** Any future integration with hospital systems would require appropriate approval, privacy safeguards, and validation with qualified staff.

These are possible next steps, not claims that the current version already implements them.

## Standards and References

- **IETF RFC 2474:** Definition of the Differentiated Services Field (DS Field)
- **IETF RFC 2475:** An Architecture for Differentiated Services
- **IETF RFC 2597:** Assured Forwarding PHB Group
- **IETF RFC 3246:** An Expedited Forwarding PHB
- **DICOM PS3.8:** Digital Imaging and Communications in Medicine — Network Communication Support

---

This project is intended for academic learning and controlled network demonstrations. It should not be deployed in a clinical environment without appropriate networking validation, security review, and hospital approval.
