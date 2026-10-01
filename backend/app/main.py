import uvicorn
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .seed_data import init_seed_db
from .routers import auth, patients, mri, network, analytics, audit, simulation

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
## Smart Hospital Emergency MRI Prioritization System
### Built on OSI Reference Model Layer 3 (Network Layer) & IP-Based DiffServ QoS

This system implements an authorized, clinical workflow-driven traffic prioritization engine for medical imaging (DICOM/PACS).
- **Layer 3 Marking:** DSCP EF (46) for Emergency, DSCP AF41 (34) for Urgent, DSCP CS0 (0) for Routine/Best Effort.
- **Router Queuing:** Strict Priority Low-Latency Queueing (LLQ) + Class-Based Weighted Fair Queueing (CBWFQ).
- **Security Boundary:** RFC 2474 Edge Traffic Conditioning preventing DSCP spoofing and untrusted priority assertions.
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(mri.router, prefix=settings.API_V1_STR)
app.include_router(network.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    init_seed_db()

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs_url": "/docs",
        "primary_osi_layer": "Layer 3 (Network Layer - IPv4 DiffServ DSCP)",
        "qos_standard": "RFC 2474, RFC 2475, RFC 2597, RFC 3246",
        "active_gateway": "192.168.10.1 (Cisco 2911 / Linux tc Gateway)"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
