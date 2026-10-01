# Wireshark Inspection & PCAP Analysis Guide

This directory contains synthetic and recorded network packet captures (`.pcap`) representing hospital DICOM MRI traffic under various DSCP markings.

---

## 1. How to Inspect in Wireshark

1. Open `hospital_mri_qos_capture.pcap` in **Wireshark**.
2. Expand the **Internet Protocol Version 4** layer in the packet details pane.
3. Locate the **Differentiated Services Field (DS Field)**:

```text
Internet Protocol Version 4, Src: 192.168.10.10, Dst: 192.168.30.10
    0100 .... = Version: 4
    .... 0101 = Header Length: 20 bytes (5)
    Differentiated Services Field: 0xb8 (DSCP: CS5, EF PHB: Expedited Forwarding; ECN: Not-ECT)
        1011 10.. = Differentiated Services Codepoint: Expedited Forwarding (46)
        .... ..00 = Explicit Congestion Notification: Not ECN-Capable Transport (0)
    Total Length: 1500
    Identification: 0x1a2b (6699)
    Flags: 0x4000, Don't fragment
    Time to Live: 64
    Protocol: TCP (6)
    Header Checksum: 0x4a5b
```

---

## 2. Useful Wireshark Display Filters

| Filter Query | Purpose |
| :--- | :--- |
| `ip.dsfield.dscp == 46` | Shows only **Emergency (EF)** prioritized traffic. |
| `ip.dsfield.dscp == 34` | Shows only **Urgent (AF41)** ICU traffic. |
| `ip.dsfield.dscp == 0` | Shows only **Routine (CS0 / Best Effort)** traffic. |
| `tcp.port == 104` | Filters all DICOM C-STORE image transfer sessions. |
| `ip.src == 192.168.10.10 && ip.dst == 192.168.30.10` | Isolates the Emergency Workstation to PACS stream. |
