#!/usr/bin/env python3
"""
Benchmark Data Plotter & Statistical Analysis
Project: Smart Hospital Emergency MRI Prioritization System
Reads actual experimental measurements from CSV and outputs summary statistics.
"""

import os
import csv

def analyze_benchmarks(csv_path="benchmark_results.csv"):
    if not os.path.exists(csv_path):
        # Fallback to local directory
        csv_path = os.path.join(os.path.dirname(__file__), "benchmark_results.csv")

    print("================================================================================")
    print("  SMART HOSPITAL MRI QoS EXPERIMENTAL BENCHMARK ANALYSIS")
    print("================================================================================")

    data = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append({k: float(v) for k, v in row.items()})

    print(f"\n[+] Loaded {len(data)} measurement points across progressive link utilization.\n")
    print(f"{'Load (Mbps)':<12} | {'FIFO Delay':<12} | {'QoS Delay':<12} | {'FIFO Latency':<14} | {'QoS Latency':<14} | {'FIFO Loss':<10} | {'QoS Loss':<10}")
    print("-" * 96)

    for d in data:
        print(f"{d['Congestion_Load_Mbps']:<12.0f} | {d['FIFO_Emergency_Transfer_Sec']:<10.1f} s | {d['QoS_Emergency_Transfer_Sec']:<10.1f} s | {d['FIFO_Latency_ms']:<11.1f} ms | {d['QoS_Emergency_Latency_ms']:<11.1f} ms | {d['FIFO_Loss_Pct']:<8.1f} % | {d['QoS_Emergency_Loss_Pct']:<8.1f} %")

    # Calculate Improvement at 90 Mbps Severe Congestion
    worst_case = data[-1]
    delay_saved_pct = ((worst_case['FIFO_Emergency_Transfer_Sec'] - worst_case['QoS_Emergency_Transfer_Sec']) / worst_case['FIFO_Emergency_Transfer_Sec']) * 100
    latency_saved_ms = worst_case['FIFO_Latency_ms'] - worst_case['QoS_Emergency_Latency_ms']

    print("-" * 96)
    print(f"\n[*] KEY EXPERIMENTAL FINDINGS UNDER SEVERE CONGESTION (90 Mbps Load):")
    print(f"  • Emergency MRI Study Transfer Delay Reduction: {delay_saved_pct:.1f}% ({worst_case['QoS_Emergency_Transfer_Sec']:.1f}s vs {worst_case['FIFO_Emergency_Transfer_Sec']:.1f}s)")
    print(f"  • Latency Bufferbloat Avoided: {latency_saved_ms:.1f} ms ({worst_case['QoS_Emergency_Latency_ms']:.1f} ms vs {worst_case['FIFO_Latency_ms']:.1f} ms)")
    print(f"  • Emergency Packet Drops in Priority LLQ: {worst_case['QoS_Emergency_Loss_Pct']:.1f}% (vs {worst_case['FIFO_Loss_Pct']:.1f}% FIFO Tail Drop Loss)")
    print("================================================================================\n")

if __name__ == "__main__":
    analyze_benchmarks()
