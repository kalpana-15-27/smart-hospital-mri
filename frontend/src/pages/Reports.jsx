import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  HelpCircle, 
  DollarSign, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Reports() {
  const [activeSection, setActiveSection] = useState('summary');

  const VIVA_QA = [
    {
      q: "Does an IP address itself create network priority in this system?",
      a: "No. IP addresses identify network endpoints, trusted devices, and VLAN subnets. DSCP (Differentiated Services Code Point) markings in the Layer 3 IPv4 DS Field (bits 0-5) instruct the router's queue scheduler (LLQ/CBWFQ) to grant prioritized forwarding."
    },
    {
      q: "What is the structure of the IPv4 Differentiated Services (DS) field under RFC 2474?",
      a: "The DS field is 8 bits (redefining the legacy ToS byte). The first 6 bits form the DSCP value (0-63), and the remaining 2 bits are used for Explicit Congestion Notification (ECN, RFC 3168)."
    },
    {
      q: "Why is DSCP 46 (EF - Expedited Forwarding) used for Emergency MRI traffic?",
      a: "RFC 3246 defines Expedited Forwarding as a Per-Hop Behavior (PHB) designed for low-delay, low-jitter, and low-loss services. When mapped to a Strict Priority Low-Latency Queue (LLQ), emergency imaging transfers bypass buffer congestion."
    },
    {
      q: "How does the system prevent starvation of normal (routine) hospital imaging traffic?",
      a: "Through Class-Based Weighted Fair Queueing (CBWFQ). While emergency traffic has strict priority up to a configured threshold (e.g. 50%), normal traffic in Class Selector 0 is allocated a guaranteed minimum bandwidth share (20-30%) so it is never starved."
    },
    {
      q: "How is DSCP Spoofing prevented across the hospital network?",
      a: "By enforcing RFC 2474 edge trust boundaries. Ingress access switches and routers do not trust arbitrary client markings; instead, they inspect source VLANs, MAC/IP bindings, and 802.1X clinical roles. Rogue markings are force-remarked to DSCP 0 (Best Effort)."
    },
    {
      q: "Does this system make automated clinical diagnostic or physical scanning decisions?",
      a: "No. The system is strictly a computer networks traffic prioritization engine. Emergency classification must originate from an authorized clinical workflow (e.g. emergency physician). Physical MRI scheduling and diagnosis remain strictly clinical decisions."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span>Academic Project Documentation & Viva Voce Reference</span>
          </h1>
          <p className="text-xs text-slate-400">
            B.Tech Final Year / Mini Project Reference Manual, RFC Standards, Viva Prep, and Cost Estimations.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSection('summary')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSection === 'summary' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Executive Summary & RFCs
        </button>
        <button
          onClick={() => setActiveSection('viva')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSection === 'viva' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Viva Voce Q&A (Examiner Prep)
        </button>
        <button
          onClick={() => setActiveSection('cost')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSection === 'cost' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cost Estimation & Deployment Tiers
        </button>
      </div>

      {/* Tab 1: Executive Summary */}
      {activeSection === 'summary' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                Project Title: Smart Hospital Emergency MRI Prioritization System Using OSI Reference Model and IP-Based QoS
              </h2>
              <div className="text-xs text-sky-400 font-mono mt-1">
                Primary OSI Focus: Layer 3 (Network Layer) • Standard: IETF DiffServ Architecture
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong className="text-white">Abstract:</strong> In modern hospital local area networks, high-resolution diagnostic imaging studies (such as 3D MRI scans, ranging from 250 MB to over 1 GB) place significant demands on available bandwidth. During periods of peak network congestion, routine imaging transfers, administrative data, and time-critical emergency trauma or acute stroke imaging compete for identical network buffers. Without Quality of Service (QoS), standard First-In-First-Out (FIFO) queueing subjects emergency packets to excessive queuing delay, jitter, and tail-drop packet loss.
              </p>
              <p>
                This project establishes an authorized, clinical workflow-integrated Layer 3 Differentiated Services (DiffServ) framework adhering to <strong className="text-white">RFC 2474, RFC 2475, RFC 2597, and RFC 3246</strong>. Emergency imaging requests generated from authorized clinical endpoints are tagged with <code className="text-rose-400 font-mono">DSCP EF (Decimal 46, Binary 101110)</code>, while urgent/ICU studies receive <code className="text-amber-400 font-mono">DSCP AF41 (Decimal 34, Binary 100010)</code> and routine imaging receives <code className="text-sky-400 font-mono">DSCP CS0 (Decimal 0, Binary 000000)</code>. Core Layer 3 routers apply Strict Priority Low-Latency Queueing (LLQ) alongside Class-Based Weighted Fair Queueing (CBWFQ), ensuring emergency data transfer completes over 90% faster under heavy link congestion while guaranteeing routine traffic is protected from starvation.
              </p>
            </div>

            {/* Standards Table */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">
                Authoritative RFC Standards & Specifications Reference
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Standard</th>
                      <th className="py-2 px-3">Title / Scope</th>
                      <th className="py-2 px-3">System Application</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-2 px-3 text-sky-400 font-bold">RFC 2474</td>
                      <td className="py-2 px-3 text-slate-300">Definition of the Differentiated Services Field (DS Field) in IPv4 and IPv6</td>
                      <td className="py-2 px-3 text-slate-400">Redefines ToS byte into 6-bit DSCP + 2-bit ECN.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-sky-400 font-bold">RFC 2475</td>
                      <td className="py-2 px-3 text-slate-300">An Architecture for Differentiated Services</td>
                      <td className="py-2 px-3 text-slate-400">Defines edge classification, traffic conditioning, and Per-Hop Behaviors (PHB).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-sky-400 font-bold">RFC 3246</td>
                      <td className="py-2 px-3 text-slate-300">An Expedited Forwarding PHB (EF)</td>
                      <td className="py-2 px-3 text-slate-400">Specifies DSCP 46 (101110) for strict low-latency priority queueing.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-sky-400 font-bold">RFC 2597</td>
                      <td className="py-2 px-3 text-slate-300">Assured Forwarding PHB Group</td>
                      <td className="py-2 px-3 text-slate-400">Specifies DSCP 34 (AF41) for urgent ICU guaranteed bandwidth classes.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-sky-400 font-bold">DICOM PS 3.8</td>
                      <td className="py-2 px-3 text-slate-300">Network Communication Support for Data Exchange (TCP/IP Port 104)</td>
                      <td className="py-2 px-3 text-slate-400">Specifies upper-layer DIMSE C-STORE medical imaging transfer.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Viva Q&A */}
      {activeSection === 'viva' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Project Viva Voce & External Examiner Comprehensive Q&A</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Master the technical nuances and defend the computer networking principles of your project.
            </p>

            <div className="space-y-3">
              {VIVA_QA.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-300 flex items-start space-x-2">
                    <span className="font-mono text-sky-400">Q{idx + 1}:</span>
                    <span>{item.q}</span>
                  </div>
                  <div className="text-xs text-slate-300 pl-6 leading-relaxed">
                    <strong className="text-emerald-400">Answer:</strong> {item.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cost Estimation */}
      {activeSection === 'cost' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Academic Prototype vs Enterprise Hospital Deployment Cost Estimation</span>
              </h2>
              <p className="text-xs text-slate-400">
                Transparent academic budget breakdown comparing student lab setup, medium clinic, and tertiary hospital.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Tier</th>
                    <th className="py-2.5 px-3">Hardware & Components</th>
                    <th className="py-2.5 px-3">Software & Licenses</th>
                    <th className="py-2.5 px-3">Estimated Budget (INR / USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-sky-400 font-mono">
                      1. Student Lab Prototype
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-xs">
                      1x Laptop/PC (8GB RAM), VirtualBox / GNS3 / Cisco Packet Tracer, Loopback/Ethernet adapters
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs font-mono">
                      Python 3.13, FastAPI, React, SQLite, Linux tc/iptables (100% Free Open-Source)
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400 font-mono">
                      ₹0 (Utilizes Existing College Lab Hardware)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-amber-400 font-mono">
                      2. Medium Clinic / Diagnostic Center
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-xs">
                      1x Managed L3 Switch (Cisco SG350 / MikroTik RB4011), 1x Dedicated PACS Storage Server (4TB RAID), 3x Clinical Workstations, Cat6 Cabling
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs font-mono">
                      dcm4chee / Orthanc PACS, Linux OS, SSL Certificates, Monitoring Suite
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-300 font-mono">
                      ₹2,50,000 – ₹4,50,000 ($3,000 – $5,500)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-purple-400 font-mono">
                      3. Tertiary Hospital / Multi-Speciality
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-xs">
                      Redundant Cisco Catalyst 9300 Core Switches, Cisco ISR 4451 L3 Routers, High-Availability Enterprise PACS Cluster (100TB SAN/NAS), 10Gbps Fiber Backbone
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs font-mono">
                      Cisco DNA Premier QoS Licenses, Enterprise PACS (GE/Siemens/Philips), 24/7 Cybersecurity SOC
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-300 font-mono">
                      ₹35,00,000 – ₹80,00,000 ($42,000 – $96,000)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
