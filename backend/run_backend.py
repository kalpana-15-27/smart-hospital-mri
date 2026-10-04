import uvicorn
import os
import sys
import time
import subprocess

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def ensure_port_available(port=8000):
    """Automatically frees port if a previous server instance is still bound."""
    current_pid = os.getpid()
    try:
        output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True, text=True, stderr=subprocess.DEVNULL)
        for line in output.strip().splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pid = int(parts[-1])
                if pid != current_pid and pid > 0:
                    print(f"[*] Port {port} is held by previous process (PID {pid}). Releasing port...")
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    time.sleep(1)
    except Exception:
        pass

if __name__ == "__main__":
    ensure_port_available(8000)
    print("================================================================================")
    print("  SMART HOSPITAL EMERGENCY MRI PRIORITIZATION SYSTEM - BACKEND SERVICE")
    print("  OSI Layer 3 IP-Based DiffServ (RFC 2474 / RFC 3246) QoS Gateway")
    print("  Swagger UI available at: http://127.0.0.1:8000/docs")
    print("================================================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
