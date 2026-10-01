# Formal System Algorithms

## Project: Smart Hospital Emergency MRI Prioritization System
### Primary Focus: OSI Layer 3 (Network Layer) & IP-Based DiffServ QoS

---

### Algorithm 1: Patient Triage and Admission Registration
**Input:** Patient Name $N$, Age $A$, Gender $G$, Department $D$, Physician $Dr$, Triage Status $T$, Vitals $V$.  
**Output:** Persistent Patient Record $P_{rec}$ with Unique Identifier $ID_{pat}$.

```text
1: Procedure REGISTER_PATIENT(N, A, G, D, Dr, T, V):
2:     Generate unique identifier ID_pat ← FORMAT("PAT-2026-%03d", COUNT(Patients) + 1)
3:     Validate A ∈ [0, 130] and N ≠ NULL
4:     Create Patient Instance P_rec ← (ID_pat, N, A, G, D, Dr, T, V, CURRENT_TIMESTAMP())
5:     DB.Insert(P_rec)
6:     LOG_AUDIT(Action ← "PATIENT_REGISTERED", Target ← ID_pat, Status ← "SUCCESS")
7:     Return P_rec
8: End Procedure
```

---

### Algorithm 2: Clinical MRI Request Edge Classification
**Input:** Patient ID $ID_{pat}$, Modality $M$, Indication $I$, Urgency $U \in \{\text{EMERGENCY}, \text{URGENT}, \text{NORMAL}\}$, Workstation Source IP $IP_{src}$, User Role $R_{user}$.  
**Output:** Verified QoS Profile $Q_{profile}$ and Scheduled Study Order $O_{mri}$.

```text
1: Procedure CLASSIFY_MRI_ORDER(ID_pat, M, I, U, IP_{src}, R_{user}):
2:     Verify patient exists: P ← DB.Query(Patient, ID_pat)
3:     If P == NULL Then Return ERROR("Patient Record Not Found")
4:     
5:     // Edge Trust Boundary Verification
6:     SubnetPrefix ← EXTRACT_SUBNET(IP_{src})
7:     IsTrustedDevice ← CHECK_DEVICE_REGISTRY(IP_{src})
8:     
9:     If U == "EMERGENCY" Then:
10:        If IsTrustedDevice == TRUE and R_{user} ∈ {"DOCTOR", "ADMIN", "RADIOLOGIST"} Then:
11:            DSCP_Value ← 46          // EF: Expedited Forwarding (RFC 3246)
12:            DSCP_Name  ← "EF"
13:            DSCP_Bits  ← "101110"
14:            IP_Prec    ← 5
15:            Queue_Name ← "Strict Priority Queue (LLQ)"
16:            IsSpoofed  ← FALSE
17:        Else:
18:            // Untrusted priority assertion detected - mitigate
19:            DSCP_Value ← 0           // Force demotion to Best Effort
20:            DSCP_Name  ← "CS0"
21:            DSCP_Bits  ← "000000"
22:            IP_Prec    ← 0
23:            Queue_Name ← "Best Effort Queue (Demoted - Untrusted)"
24:            IsSpoofed  ← TRUE
25:            LOG_AUDIT(Action ← "DSCP_SPOOF_BLOCKED", IP ← IP_{src}, Status ← "ALERT")
26:        End If
27:    Else If U == "URGENT" Then:
28:        DSCP_Value ← 34              // AF41: Assured Forwarding Class 4 Low Drop (RFC 2597)
29:        DSCP_Name  ← "AF41"
30:        DSCP_Bits  ← "100010"
31:        IP_Prec    ← 4
32:        Queue_Name ← "Assured Bandwidth Queue (CBWFQ)"
33:        IsSpoofed  ← FALSE
34:    Else:
35:        DSCP_Value ← 0               // CS0: Class Selector 0 Best Effort (RFC 2474)
36:        DSCP_Name  ← "CS0"
37:        DSCP_Bits  ← "000000"
38:        IP_Prec    ← 0
39:        Queue_Name ← "Best Effort Queue (WFQ)"
40:        IsSpoofed  ← FALSE
41:    End If
42:
43:    ReqID ← FORMAT("MRI-REQ-2026-%03d", COUNT(MRIRequests) + 1)
44:    O_{mri} ← (ReqID, ID_{pat}, M, I, U, IP_{src}, "192.168.30.10", DSCP_Value, DSCP_Name, DSCP_Bits, IP_Prec, Queue_Name, Status ← "QUEUED")
45:    DB.Insert(O_{mri})
46:    Return O_{mri}
47: End Procedure
```

---

### Algorithm 3: Layer 3 IPv4 DS Field Packet Header Encoding
**Input:** Raw IPv4 Packet Buffer $P_{raw}$, DSCP Value $D \in [0, 63]$.  
**Output:** Recomputed IPv4 Packet Buffer $P_{tagged}$ with Validated Checksum.

```text
1: Procedure ENCODE_DS_FIELD(P_{raw}, D):
2:     // In IPv4 header, Type of Service (DS Field) is Byte 1
3:     ToS_Byte ← (D << 2) & 0xFC        // Bits 0-5: DSCP, Bits 6-7: 00 (Not-ECT)
4:     P_{raw}[1] ← ToS_Byte
5:     
6:     // Reset header checksum field at Bytes 10-11
7:     P_{raw}[10] ← 0x00
8:     P_{raw}[11] ← 0x00
9:     
10:    // Recompute 16-bit One's Complement IPv4 Checksum over header (20 bytes)
11:    ChecksumSum ← 0
12:    For i from 0 to 18 step 2 Do:
13:        Word16 ← (P_{raw}[i] << 8) + P_{raw}[i + 1]
14:        ChecksumSum ← ChecksumSum + Word16
15:    End For
16:    
17:    While ChecksumSum > 0xFFFF Do:
18:        ChecksumSum ← (ChecksumSum & 0xFFFF) + (ChecksumSum >> 16)
19:    End While
20:    
21:    FinalChecksum ← NOT(ChecksumSum) & 0xFFFF
22:    P_{raw}[10] ← (FinalChecksum >> 8) & 0xFF
23:    P_{raw}[11] ← FinalChecksum & 0xFF
24:    
25:    Return P_{raw}
26: End Procedure
```

---

### Algorithm 4: Router Hardware Queue Dispatch & LLQ/CBWFQ Scheduling
**Input:** Ingress Packet Queue $Q_{in}$, Egress Interface Bandwidth $C = 100\text{ Mbps}$, Low-Latency Reservation $B_{LLQ} = 50\text{ Mbps}$, Assured Reservation $B_{CBWFQ} = 30\text{ Mbps}$, Best Effort $B_{BE} = 20\text{ Mbps}$.  
**Output:** Transmitted Packet Stream $S_{tx}$.

```text
1: Procedure ROUTER_EGRESS_SCHEDULER(Q_{in}):
2:     Initialize Queue_0 (Strict LLQ), Queue_1 (CBWFQ), Queue_2 (WFQ)
3:     
4:     For each packet P in Q_{in} Do:
5:         DSCP_val ← (P.IP_Header.DS_Field >> 2) & 0x3F
6:         
7:         If DSCP_val == 46 Then:
8:             ENQUEUE(Queue_0, P)
9:         Else If DSCP_val == 34 Then:
10:            ENQUEUE(Queue_1, P)
11:        Else:
12:            ENQUEUE(Queue_2, P)
13:        End If
14:    End For
15:    
16:    // Egress Scheduling Loop
17:    While TRUE Do:
18:        // 1. Strict Priority servicing for LLQ
19:        While NOT IS_EMPTY(Queue_0) and RATE(Queue_0) <= B_{LLQ} Do:
20:            P_{out} ← DEQUEUE(Queue_0)
21:            TRANSMIT_TO_WIRE(P_{out})
22:        End While
23:        
24:        // 2. Weighted Fair Servicing for remaining classes (Starvation Prevention)
25:        If NOT IS_EMPTY(Queue_1) Then:
26:            P_{out} ← DEQUEUE(Queue_1)
27:            TRANSMIT_TO_WIRE(P_{out})
28:        End If
29:        
30:        If NOT IS_EMPTY(Queue_2) Then:
31:            P_{out} ← DEQUEUE(Queue_2)
32:            TRANSMIT_TO_WIRE(P_{out})
33:        End If
34:    End While
35: End Procedure
```

---

### Algorithm 5: Real-Time Network Congestion & Telemetry Calculation
**Input:** Study Volume $V_{MB}$, DSCP Value $D$, Link Background Traffic $L_{bg}\text{ (Mbps)}$, QoS State $Flag_{QoS}$.  
**Output:** Metric Tuple $\langle \text{Latency } L_{ms}, \text{Loss } Loss_{\%}, \text{Throughput } T_{mbps}, \text{Duration } T_{sec} \rangle$.

```text
1: Procedure CALCULATE_NETWORK_METRICS(V_{MB}, D, L_{bg}, Flag_{QoS}):
2:     \rho \leftarrow \min(L_{bg} / 100.0, 0.95)
3:     AvailableBW \leftarrow \max(5.0, 100.0 - L_{bg})
4:     
5:     If Flag_{QoS} == FALSE Then:
6:         // FIFO Baseline under Bufferbloat
7:         L_{ms} \leftarrow 12.0 + (\rho / (1.0 - \rho)) \times 15.0
8:         If \rho > 0.75 Then
9:             Loss_{\%} \leftarrow ((\rho - 0.75) / 0.25) \times 22.0
10:        Else
11:            Loss_{\%} \leftarrow 0.0
12:        End If
13:        T_{mbps} \leftarrow \max(3.0, AvailableBW \times 0.75)
14:        Penalty \leftarrow 1.0 + (Loss_{\%} / 100.0) \times 4.5
15:        T_{sec} \leftarrow (V_{MB} \times 8.0 / T_{mbps}) \times Penalty
16:        
17:    Else:
18:        // DiffServ QoS Active
19:        If D == 46 Then:               // Emergency EF (LLQ)
20:            L_{ms} \leftarrow RANDOM_RANGE(7.5, 11.5)
21:            Loss_{\%} \leftarrow 0.0
22:            T_{mbps} \leftarrow 85.0
23:            T_{sec} \leftarrow (V_{MB} \times 8.0) / T_{mbps}
24:        Else If D == 34 Then:          // Urgent AF41 (CBWFQ)
25:            L_{ms} \leftarrow RANDOM_RANGE(18.0, 32.0)
26:            Loss_{\%} \leftarrow (\rho > 0.85) ? 0.8 : 0.0
27:            T_{mbps} \leftarrow \max(18.0, AvailableBW \times 0.6)
28:            T_{sec} \leftarrow (V_{MB} \times 8.0) / T_{mbps}
29:        Else:                          // Normal CS0 (WFQ)
30:            L_{ms} \leftarrow 45.0 + (\rho \times 55.0)
31:            Loss_{\%} \leftarrow (\rho > 0.70) ? ((\rho - 0.7) / 0.3) \times 14.0 : 0.0
32:            T_{mbps} \leftarrow \max(8.0, AvailableBW \times 0.4)
33:            Penalty \leftarrow 1.0 + (Loss_{\%} / 100.0) \times 3.0
34:            T_{sec} \leftarrow (V_{MB} \times 8.0 / T_{mbps}) \times Penalty
35:        End If
36:    End If
37:    
38:    Return \langle L_{ms}, Loss_{\%}, T_{mbps}, T_{sec} \rangle
39: End Procedure
```

---

### Algorithm 6: RFC 2474 Edge DSCP Spoofing & Threat Detection
**Input:** Ingress Packet $P_{in}$, Ingress Physical Interface $IF_{in}$, Ingress VLAN $VLAN_{in}$.  
**Output:** Action Flag $\in \{\text{PERMIT\_UNMODIFIED}, \text{FORCE\_REMARK\_CS0}\}$.

```text
1: Procedure DETECT_DSCP_SPOOFING(P_{in}, IF_{in}, VLAN_{in}):
2:     D_{claimed} \leftarrow (P_{in}.IP\_Header.DS\_Field >> 2) & 0x3F
3:     SrcIP \leftarrow P_{in}.IP\_Header.Source\_IP
4:     
5:     // Check if high-priority DSCP is being asserted
6:     If D_{claimed} \in \{46, 34\} Then:
7:         // Rule 1: Verify physical VLAN boundary
8:         If VLAN_{in} \notin \{10, 30\} Then:
9:             LOG_SECURITY_ALERT("DSCP Spoofing Attempt: Untrusted VLAN " + VLAN_{in})
10:            P_{in}.IP\_Header.DS\_Field \leftarrow 0x00      // Reset to DSCP 0 (CS0)
11:            Return FORCE_REMARK_CS0
12:        End If
13:        
14:        // Rule 2: Verify Device Registration
15:        Dev \leftarrow DB.Query(NetworkDevice, IP == SrcIP)
16:        If Dev == NULL or Dev.IsTrusted == FALSE Then:
17:            LOG_SECURITY_ALERT("DSCP Spoofing Attempt: Untrusted Source IP " + SrcIP)
18:            P_{in}.IP\_Header.DS\_Field \leftarrow 0x00
19:            Return FORCE_REMARK_CS0
20:        End If
21:    End If
22:    
23:    Return PERMIT_UNMODIFIED
24: End Procedure
```
