# Project Technical Documentation: AI-Powered Autonomous Data Platform

This document provides a comprehensive, phase-by-phase technical breakdown of the implementation, technologies selected, commands executed, issues encountered, and the strategies applied to resolve them.

---

## 📂 Project Architecture & Medallion Pipeline Flow

```text
                  ┌──────────────────────┐
                  │    Next.js Frontend  │ (Next.js 16 + React 19 + Tailwind v4)
                  │   Ports: 3000 (Dev)  │
                  └──────────┬───────────┘
                             │ (Future REST / WebSocket)
                             ▼
                  ┌──────────────────────┐
                  │     FastAPI Backend  │ (FastAPI + LangGraph + SQLAlchemy)
                  │      Port: 8000      │
                  └──────────┬───────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │ (Orchestration)     │ (Ingestion / SQL)   │ (Vector Embeddings)
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Airflow 3   │      │ PySpark Engine│      │ pgvector DB  │
│ Port: 8080   │      │ Batch/Stream │      │ Port: 5433   │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │     Medallion Architecture Sinks     │
          │                                      │
          │ Raw CSV ──► Bronze Parquet           │
          │ Kafka   ──► Bronze Parquet (Stream)  │
          │                                      │
          │ Bronze  ──► Silver (PostgreSQL)      │
          │         └──► Quarantine (DLQ Parquet)│
          │                                      │
          │ Silver  ──► Gold Summary (PostgreSQL)│
          └──────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Choices (Why & How)

| Technology | Role | Rationale (Why) | Integration Method (How) |
| :--- | :--- | :--- | :--- |
| **Docker Compose** | Infrastructure Management | Allows localized, reproducible, single-command setup of system services. | Orchestrates isolated containers for PostgreSQL, Zookeeper, and Kafka. |
| **PostgreSQL (pgvector)** | Analytical / Embeddings Store | Combines traditional structured analytical storing capabilities with vector search support (essential for future RAG / metadata features). | Hosted on port `5433`. Custom tables mapped for Silver and Gold tiers. |
| **Apache Kafka** | Real-time Streaming Bus | High-throughput, industry-standard tool for streaming data ingestion. | Configured via confluent cp-kafka image. Feeds transaction events from a mock generator. |
| **PySpark (Structured Streaming & Batch)** | Medallion Ingestion & ETL | Scalable memory-based computations capable of handling both micro-batch streaming streams and batch operations. | Executed locally with custom packages dynamically injected (`postgresql` and `spark-sql-kafka`). |
| **Apache Airflow 3** | Workflow Orchestration | Standard enterprise pipeline scheduler. Built-in dependency tracking and UI visualization. | Configured to run in local workspace with SQLite metadata storage and python-venv executors. |
| **FastAPI** | Backend Engine | Light-weight, asynchronous Python framework for REST APIs and websockets. | Exposes APIs to interface with database, scheduler logs, and future AI agents. |
| **Next.js** | Interactive UI | Component-driven react-based UI framework for building complex, interactive interfaces. | Prepared for building live lineage views and AI chat dialogs. |

---

## 🚀 Phase-by-Phase Implementation Details

### Phase 1: Infrastructure and Mock Feeds
* **Task**: Create local containers for database and streaming queues; feed live transactions mock data.
* **Details**: 
  - Defined services in `docker-compose.yml` exposing PostgreSQL on `5433` (preventing conflicts with local port `5432` Postgres instances) and Kafka on `9092`.
  - Created a Python script `dummy_producer.py` which pushes random generated transaction records (IDs, randomized users, currency, timestamps) to Kafka topic `transactions` every 2 seconds.

### Phase 2: Medallion Layer Ingestion (Bronze & Silver)
* **Task**: Read batch and streaming data to Raw and Bronze folders, clean and transform to Silver level.
* **Details**:
  - `batch_ingestion.py` scans files in `data/raw` and appends them with ingestion metadata (`ingested_at`) to Parquet-formatted `data/bronze/batch_data`.
  - `stream_ingestion.py` reads a continuous stream from Kafka, casts string payloads, schema parses JSON fields, and saves to Parquet-formatted `data/bronze/stream_data`.
  - `silver_transformation.py` processes streams (deduplication, column standardization, field cleanup) and validates data quality. Valid data goes to PostgreSQL; corrupted records are logged elsewhere.

### Phase 3: Data Quality, Dead-Letter Queue (DLQ), and Idempotence
* **Task**: Ensure no duplicates enter PostgreSQL, route broken files into a quarantine area, and prevent database overwrite schema destruction.
* **Details**:
  - Implemented strong schemas and strict checks on transaction value boundaries (e.g., amount > 0, valid user IDs).
  - Setup a Parquet Dead-Letter Queue (DLQ) path (`data/quarantine/`) to store rejected records along with annotated validation error reasons (`Missing transaction_id`, `Invalid amount`, etc.).
  - Handled database insertion conflicts via a custom Anti-Join matching method before inserting streams.
  - Configured batch overwrites with `"truncate": "true"` to prevent dropping PostgreSQL table structures (which preserves indexes/constraints).

### Phase 4: Apache Airflow 3 Orchestration
* **Task**: Chain and schedule the batch ingestion, transformation, and aggregation scripts.
* **Details**:
  - Created sequential Airflow DAG tasks (`medallion_pipeline_dag.py`) representing tasks using `BashOperator` to execute scripts in the virtual environment.
  - Handled Airflow 3 syntax changes (such as database migrations and launch parameters) and packaged the setup in `start_airflow.sh`.

---

## 📝 Commands Reference

### 1. Infrastructure (Docker)
```bash
# Spin up PostgreSQL with pgvector, ZooKeeper, Kafka, and FastAPI
docker-compose up -d

# Down services and remove volumes
docker-compose down -v
```

### 2. Database Schema Setup
```bash
# Initialize PostgreSQL tables for Silver and Gold
python data-engineering/db_setup.py
```

### 3. Running Data Streaming
```bash
# In Terminal A: Run Mock Transaction Generator
python data-engineering/kafka_producer/dummy_producer.py

# In Terminal B: Run PySpark Streaming (Bronze Ingestion)
python data-engineering/spark/stream_ingestion.py
```

### 4. Running ETL Pipeline (Manual Runs)
```bash
# Run batch ingestion (Raw -> Bronze)
python data-engineering/spark/batch_ingestion.py

# Run silver transformations (Bronze -> Silver / DLQ)
python data-engineering/spark/silver_transformation.py

# Run gold analytical aggregations (Silver -> Gold)
python data-engineering/spark/gold_aggregation.py
```

### 5. Orchestration (Airflow 3)
```bash
# Set environment context to current workspace
export AIRFLOW_HOME="$(pwd)/data-engineering/airflow"

# Initialize Airflow 3 SQLite metadata database
airflow db migrate

# Terminal 1: Run Airflow 3 API and Web UI (Port 8080)
airflow api-server -p 8080

# Terminal 2: Run Airflow Scheduler daemon
airflow scheduler
```

---

## 💥 Issues Faced & Solutions Applied

### 1. macOS Fork Safety Crash
* **Symptoms**: PySpark scripts crashed immediately with:
  `objc[24354]: +[__NSCFConstantString initialize] may have been in progress in another thread when fork() was called. We cannot safely call it or any other Objective-C class method in the forked process.`
* **Cause**: macOS restricts spawning Python subprocesses that inherit active Objective-C runtimes.
* **Resolution**: Injected `os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"` at the very top of Spark script entries.

### 2. Driver Binding Failures on macOS Hostnames
* **Symptoms**: PySpark was slow to start, failed to establish communication channels, or hung resolving system hostnames.
* **Cause**: Local hostname lookup fails or returns unresolved values on macOS DNS settings.
* **Resolution**: Injected `os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"` to force driver bindings to loopback interfaces.

### 3. Kafka Ingestion ClassNotFoundException
* **Symptoms**: Spark Streaming job failed with:
  `java.lang.ClassNotFoundException: Failed to find data source: kafka.`
* **Cause**: Spark does not bundle external database or stream connectors by default.
* **Resolution**: Configured SparkSession package loader options:
  ```python
  .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1")
  ```

### 4. PostgreSQL JDBC Connection Failures
* **Symptoms**: Spark failed with:
  `java.lang.ClassNotFoundException: org.postgresql.Driver`
* **Cause**: Missing JDBC drivers when invoking PostgreSQL writes.
* **Resolution**: Included the PostgreSQL JDBC package configuration:
  ```python
  .config("spark.jars.packages", "org.postgresql:postgresql:42.7.2")
  ```

### 5. Unique Key Constraint Failures in Silver DB Write
* **Symptoms**: Re-running `silver_transformation.py` on stream data threw primary key violation exceptions in PostgreSQL (`silver_transactions_pkey`).
* **Cause**: Repeated stream transactions collided with historical primary keys in Postgres.
* **Resolution**: Modified the spark write logic to perform a `left_anti` join before saving:
  ```python
  df_existing = spark.read.jdbc(..., table="silver_transactions", ...)
  df_stream_final = df_stream_final.join(df_existing, on="transaction_id", how="left_anti")
  ```
  Only records with new, unique transaction IDs are selected for database insertion.

### 6. Destructive Overwrites (Dropping Constraints) in Spark JDBC
* **Symptoms**: Overwriting the `silver_users` batch data deleted primary key definitions, column configurations, and downstream foreign key relation constraints.
* **Cause**: Spark's default `.write.mode("overwrite").jdbc(...)` runs a `DROP TABLE` followed by a `CREATE TABLE` command.
* **Resolution**: Added the JDBC `"truncate": "true"` option. This empties table records using SQL `TRUNCATE` while preserving database schemas and foreign constraints intact.
  ```python
  db_write_properties = {**db_properties, "truncate": "true"}
  df_batch_final.write.jdbc(..., mode="overwrite", properties=db_write_properties)
  ```

### 7. Airflow 3 CLI Commands Migration
* **Symptoms**: Setup scripts failed on `airflow db init` and `airflow webserver`.
* **Cause**: Airflow 3 has updated commands for starting services and initiating databases.
* **Resolution**: Migrated commands to:
  - `airflow db migrate` (replaces `airflow db init`)
  - `airflow api-server` (replaces `airflow webserver`)

---

## 📈 Summary of Implemented Sinks and Schema Layout

### 📁 DLQ Directory Structure
Invalid records are captured in raw Parquet formats inside:
- `data-engineering/data/quarantine/transactions/`
- `data-engineering/data/quarantine/users/`

### 🗄️ PostgreSQL Database Schemas

#### 1. `silver_transactions` (Ingests validated streams)
* `transaction_id` VARCHAR(100) (Primary Key)
* `user_id` INT
* `amount` DOUBLE PRECISION
* `currency` VARCHAR(10)
* `timestamp` TIMESTAMP
* `silver_processed_at` TIMESTAMP

#### 2. `silver_users` (Ingests validated batch customer list)
* `user_id` INT (Primary Key)
* `user_name` VARCHAR(100)
* `silver_processed_at` TIMESTAMP

#### 3. `gold_users_summary` (Aggregated analytical profiles)
* `user_id` INT (Primary Key)
* `user_name` VARCHAR(100) (Coalesced to `'unknown user'` if batch customer record is absent)
* `total_transactions` INT
* `total_amount_usd` DOUBLE PRECISION
* `avg_amount_usd` DOUBLE PRECISION
* `last_active` TIMESTAMP
* `gold_processed_at` TIMESTAMP
