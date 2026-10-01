# System Architecture & UML Diagrams

## Project: Smart Hospital Emergency MRI Prioritization System
### Built on OSI Reference Model Layer 3 (Network Layer) & IP-Based DiffServ QoS

---

### Diagram 1: Overall System Architecture

```mermaid
flowchart TD
    subgraph Clinical_Workflow["Clinical & Diagnostic Workflow"]
        Physician["Authorized Emergency Physician / Radiologist"]
        Triage["Patient Registration & Clinical Triage"]
        OrderApp["MRI Ordering Module"]
    end

    subgraph Edge_Classification["Layer 3 Edge Classification (DiffServ Boundary)"]
        TrustCheck{"Is Device & Role Authorized?"}
        MarkEF["Mark DSCP 46 (EF)<br/>ToS: 0xB8 | Binary: 101110"]
        MarkAF["Mark DSCP 34 (AF41)<br/>ToS: 0x88 | Binary: 100010"]
        MarkCS0["Mark DSCP 0 (CS0)<br/>ToS: 0x00 | Binary: 000000"]
        SpoofAlert["Security Alert: Force-Remark to DSCP 0"]
    end

    subgraph Core_Router["Cisco 2911 / Linux tc Core QoS Gateway"]
        EgressSched["MQC / tc Queue Scheduler"]
        Q0["Queue 0: Strict Priority LLQ (50% Dedicated)"]
        Q1["Queue 1: CBWFQ Assured Bandwidth (30% Guaranteed)"]
        Q2["Queue 2: WFQ Best Effort (20% Starvation Protection)"]
    end

    subgraph Storage_Archive["Medical Imaging Archive"]
        PACSServer["Central PACS Server (192.168.30.10:104)"]
        RadWorkstation["Radiologist High-Res Viewing Display"]
    end

    Physician --> Triage --> OrderApp
    OrderApp --> TrustCheck
    TrustCheck -- "Emergency (Authorized)" --> MarkEF
    TrustCheck -- "Urgent ICU" --> MarkAF
    TrustCheck -- "Routine Outpatient" --> MarkCS0
    TrustCheck -- "Untrusted / Rogue Assertion" --> SpoofAlert --> MarkCS0

    MarkEF --> Q0 --> EgressSched
    MarkAF --> Q1 --> EgressSched
    MarkCS0 --> Q2 --> EgressSched

    EgressSched --> PACSServer --> RadWorkstation
```

---

### Diagram 2: Hospital VLAN Topology & Inter-VLAN Network Segmentation

```mermaid
graph TD
    subgraph VLAN10["VLAN 10: Emergency & Trauma (192.168.10.0/24)"]
        EM_WS["Emergency Console<br/>192.168.10.10"]
        ICU_WS["ICU Clinical Node<br/>192.168.10.15"]
    end

    subgraph VLAN20["VLAN 20: Routine Radiology (192.168.20.0/24)"]
        RAD_WS["Routine Scanner<br/>192.168.20.10"]
        OUT_WS["Outpatient Console<br/>192.168.20.12"]
    end

    subgraph VLAN30["VLAN 30: PACS & MRI Core (192.168.30.0/24)"]
        PACS["Core PACS Archive<br/>192.168.30.10:104"]
        MRI_3T["Siemens 3.0T MRI<br/>192.168.30.20"]
        RAD_DIAG["Radiologist Display<br/>192.168.30.30"]
    end

    subgraph VLAN40["VLAN 40: Hospital Administration (192.168.40.0/24)"]
        ADMIN_WS["Billing Desk<br/>192.168.40.10"]
    end

    L2_SW["Cisco Catalyst 2960 Layer 2 Switch<br/>(802.1Q Trunk Port Gi0/1)"]
    L3_RTR["Cisco 2911 / Linux L3 QoS Router<br/>Gateways: 192.168.10.1 / 20.1 / 30.1 / 40.1"]

    EM_WS -->|Fa0/1| L2_SW
    ICU_WS -->|Fa0/2| L2_SW
    RAD_WS -->|Fa0/5| L2_SW
    OUT_WS -->|Fa0/6| L2_SW
    ADMIN_WS -->|Fa0/20| L2_SW

    L2_SW ===|802.1Q Trunk Link| L3_RTR
    L3_RTR ===|Dedicated Storage Uplink| PACS
    L3_RTR ===|Gigabit Fiber| MRI_3T
    L3_RTR ===|Gigabit Fiber| RAD_DIAG
```

---

### Diagram 3: OSI 7-Layer Reference Model Protocol Encapsulation

```mermaid
classDiagram
    class Layer7_Application {
        Protocol: DICOM (Digital Imaging & Communications in Medicine)
        Commands: C-STORE-RQ, C-ECHO-RQ
        Payload: 3D High-Resolution Brain MRI Dataset (350 MB)
    }

    class Layer6_Presentation {
        Transfer Syntax: 1.2.840.10008.1.2.1 (Explicit VR Little Endian)
        Character Set: ISO-IR 100
    }

    class Layer5_Session {
        DICOM Upper Layer Association Control
        Calling AET: EMERGENCY_WS_01
        Called AET: HOSPITAL_PACS_01
    }

    class Layer4_Transport {
        Protocol: TCP (Transmission Control Protocol)
        Source Port: 54820 (Ephemeral)
        Destination Port: 104 (Official Registered DICOM Port)
    }

    class Layer3_Network {
        Protocol: IPv4 (Internet Protocol v4)
        DS Field: 0xB8 (DSCP EF = 46, Binary 101110, ECN = 00)
        Source IP: 192.168.10.10 (Emergency Subnet)
        Destination IP: 192.168.30.10 (PACS Server)
        Scheduling: Strict Priority Low-Latency Queueing (LLQ)
    }

    class Layer2_DataLink {
        Protocol: IEEE 802.3 Ethernet II + IEEE 802.1Q VLAN Tagging
        VLAN ID: 10 (Emergency Clinical)
        802.1p CoS: 5 (Voice / Emergency Critical)
    }

    class Layer1_Physical {
        Standard: 1000BASE-T Gigabit Ethernet (IEEE 802.3ab)
        Medium: Category 6 Shielded Twisted Pair (STP)
        Signaling: 4D-PAM5 Full-Duplex 1.0 Gbps
    }

    Layer7_Application --|> Layer6_Presentation
    Layer6_Presentation --|> Layer5_Session
    Layer5_Session --|> Layer4_Transport
    Layer4_Transport --|> Layer3_Network
    Layer3_Network --|> Layer2_DataLink
    Layer2_DataLink --|> Layer1_Physical
```

---

### Diagram 4: End-to-End Emergency DICOM Data Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Emergency Physician (Dr. Sharma)
    participant Client as Emergency Workstation (192.168.10.10)
    participant Backend as Hospital QoS Engine (API)
    participant Router as Cisco 2911 / Linux Core Router
    participant PACS as Central PACS Server (192.168.30.10:104)
    actor Radiologist as Diagnostic Radiologist (Dr. Patel)

    Doctor->>Client: 1. Order Emergency MRI (Patient C - Acute Stroke)
    Client->>Backend: 2. POST /mri/request (Urgency="EMERGENCY")
    Backend->>Backend: 3. Verify Role & Subnet Trust Boundary
    Backend->>Backend: 4. Assign DSCP 46 (EF), LLQ Queue 0
    Backend-->>Client: 5. Order Confirmed with QoS Headers
    Client->>Router: 6. Transmit DICOM Stream with IP DS Field = 0xB8 (DSCP 46)
    Note over Router: Router inspects DSCP 46<br/>Dispatches to Strict Priority LLQ<br/>Bypasses background congestion
    Router->>PACS: 7. Forward DICOM C-STORE packets (Latency ~8ms, 0% Loss)
    PACS->>PACS: 8. Store 350 MB Study in High-Speed Volume
    PACS->>Radiologist: 9. Alert Radiologist Display Workstation
    Radiologist->>Doctor: 10. Rapid Stroke Thrombolysis Report Issued
```

---

### Diagram 5: Router Queuing & Starvation Prevention Model

```mermaid
flowchart LR
    IngressPackets["Ingress Packet Stream<br/>(Emergency + Urgent + Routine)"] --> Parser["IPv4 DS Field Parser<br/>(Extracts Bits 0-5)"]
    
    Parser -- "DSCP 46 (EF)" --> Q0["Queue 0: Strict Priority LLQ<br/>Max 50 Mbps Wire Speed"]
    Parser -- "DSCP 34 (AF41)" --> Q1["Queue 1: CBWFQ Assured Queue<br/>Min 30% Bandwidth Guaranteed"]
    Parser -- "DSCP 0 (CS0)" --> Q2["Queue 2: Best Effort WFQ<br/>Min 20% Starvation Protected"]
    
    Q0 --> Mux["Hardware Egress Scheduler"]
    Q1 --> Mux
    Q2 --> Mux
    
    Mux --> Bottleneck["100 Mbps Backbone Bottleneck Interface"]
```
