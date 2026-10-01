import os

class Settings:
    PROJECT_NAME: str = "Smart Hospital Emergency MRI Prioritization System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hospital-super-secret-key-emergency-qos-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for lab demo ease
    DATABASE_URL: str = "sqlite:///./hospital_mri_qos.db"
    
    # Network Configuration Defaults
    VLAN_EMERGENCY_ID: int = 10
    VLAN_EMERGENCY_SUBNET: str = "192.168.10.0/24"
    VLAN_ROUTINE_ID: int = 20
    VLAN_ROUTINE_SUBNET: str = "192.168.20.0/24"
    VLAN_PACS_ID: int = 30
    VLAN_PACS_SUBNET: str = "192.168.30.0/24"
    VLAN_ADMIN_ID: int = 40
    VLAN_ADMIN_SUBNET: str = "192.168.40.0/24"

    # DSCP Reference Definitions (RFC 2474, RFC 2597, RFC 3246)
    DSCP_EF: int = 46      # Expedited Forwarding (Binary 101110) - Emergency Priority
    DSCP_AF41: int = 34    # Assured Forwarding 41 (Binary 100010) - Urgent / ICU
    DSCP_CS0: int = 0      # Class Selector 0 / Best Effort (Binary 000000) - Normal

settings = Settings()
