# Open API Definitions

| Endpoint | Method | Security | Description |
|----------|--------|----------|-------------|
| `/api/v1/health` | GET | None | Liveness probe |
| `/api/v1/metrics` | GET | Admin | Prometheus metrics scrape |
| `/api/v1/invoke` | POST | JWT | Triggers main operational payload |
