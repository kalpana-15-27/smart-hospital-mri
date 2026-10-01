import uvicorn
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("================================================================================")
    print("  SMART HOSPITAL EMERGENCY MRI PRIORITIZATION SYSTEM - BACKEND SERVICE")
    print("  OSI Layer 3 IP-Based DiffServ (RFC 2474 / RFC 3246) QoS Gateway")
    print("  Swagger UI available at: http://127.0.0.1:8000/docs")
    print("================================================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
