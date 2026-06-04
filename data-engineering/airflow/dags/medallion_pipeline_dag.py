import os
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

# Default arguments for the DAG
default_args = {
    'owner': 'data_engineer',
    'depends_on_past': False,
    'start_date': datetime(2026, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Define the DAG
dag = DAG(
    'medallion_pipeline',
    default_args=default_args,
    description='Master pipeline that runs the full sequential Medallion architecture ingestion and aggregation layers',
    schedule=timedelta(days=1), # Run daily
    catchup=False
)

# Resolve paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VENV_PYTHON = os.path.join(BASE_DIR, "venv", "bin", "python")

BATCH_INGEST_SCRIPT = os.path.join(BASE_DIR, "spark", "batch_ingestion.py")
SILVER_TRANSFORM_SCRIPT = os.path.join(BASE_DIR, "spark", "silver_transformation.py")
GOLD_AGGREGATION_SCRIPT = os.path.join(BASE_DIR, "spark", "gold_aggregation.py")

# Task 1: Batch Ingest to Bronze
run_batch_ingestion = BashOperator(
    task_id='run_batch_ingestion',
    bash_command=f'"{VENV_PYTHON}" "{BATCH_INGEST_SCRIPT}"',
    dag=dag,
)

# Task 2: Transform to Silver & Validate (PostgreSQL and DLQ sinks)
run_silver_transformation = BashOperator(
    task_id='run_silver_transformation',
    bash_command=f'"{VENV_PYTHON}" "{SILVER_TRANSFORM_SCRIPT}"',
    dag=dag,
)

# Task 3: Aggregate to Gold (Analytical Serving layer)
run_gold_aggregation = BashOperator(
    task_id='run_gold_aggregation',
    bash_command=f'"{VENV_PYTHON}" "{GOLD_AGGREGATION_SCRIPT}"',
    dag=dag,
)

# Sequentially orchestrate the pipeline
run_batch_ingestion >> run_silver_transformation >> run_gold_aggregation
