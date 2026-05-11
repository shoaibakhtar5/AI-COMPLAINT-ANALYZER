# Sentra AI Backend

FastAPI + PostgreSQL backend for the Sentra AI complaint intelligence platform.

## Setup

1. Create a PostgreSQL database:

```bash
createdb sentra_ai
```

2. Create environment config:

```bash
cp .env.example .env
```

3. Install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Run migrations:

```bash
alembic upgrade head
```

5. Start API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger docs are available at `http://127.0.0.1:8000/docs`.

If `SEED_DEMO_DATA=true`, the API creates a demo workspace:

- Email: `admin@sentra.ai`
- Password: `Admin123`
- Company Secret Key: `NEXUS-SECURE-2026`

Set the frontend root `.env` value to:

```bash
VITE_API_URL=http://127.0.0.1:8000/api
```

## AI Model Files

Place the trained complaint model at `app/ai/model.pkl` and the vectorizer at `app/ai/vectorizer.pkl`, or override paths with `AI_MODEL_PATH` and `AI_VECTORIZER_PATH`.
