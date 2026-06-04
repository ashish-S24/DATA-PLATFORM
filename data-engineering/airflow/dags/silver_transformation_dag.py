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
    'silver_transformation_pipeline',
    default_args=default_args,
    description='A DAG to trigger the Spark Silver transformation layer',
    schedule=timedelta(days=1), # Run daily
    catchup=False
)

# Resolve the path to the spark script robustly
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SPARK_SCRIPT_PATH = os.path.join(BASE_DIR, "spark", "silver_transformation.py")
VENV_PYTHON = os.path.join(BASE_DIR, "venv", "bin", "python")

run_spark_silver = BashOperator(
    task_id='run_spark_silver_transformation',
    bash_command=f'"{VENV_PYTHON}" "{SPARK_SCRIPT_PATH}"',
    dag=dag,
)

run_spark_silver
