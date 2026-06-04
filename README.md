# AI-Powered Autonomous Data Platform

This project is an enterprise-grade AI Data Platform combining modern data engineering and AI, as outlined in `setup.txt`.

## Project Structure

- `frontend/`: Next.js frontend application with TypeScript, React, and Tailwind CSS.
- `backend/`: FastAPI backend service with AI agent capabilities using LangGraph and LangChain.
- `data-engineering/`: Data engineering workflows including Airflow DAGs and Spark jobs.
- `ai-agents/`: Standalone AI agents and workflows.
- `docker-compose.yml`: Infrastructure services including PostgreSQL with pgvector for vector search and Kafka for event streaming.

## Getting Started

### Infrastructure

To start the required infrastructure (PostgreSQL, Kafka), run:
```bash
docker-compose up -d
```

### Backend

To set up and run the FastAPI backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

To set up and run the Next.js frontend:
```bash
cd frontend
npm install
npm run dev
```
