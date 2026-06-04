#!/bin/bash
set -e

echo "Setting up Airflow UI locally..."

# Set AIRFLOW_HOME to the data-engineering/airflow folder to preserve pre-existing configurations
export AIRFLOW_HOME="$(pwd)/data-engineering/airflow"

# Initialize the database (SQLite by default for local development)
echo "Running database migrations..."
airflow db migrate

echo "========================================================="
echo "Airflow Setup Complete."
echo "To start the UI and scheduler, run the following in separate terminals:"
echo "Terminal 1: export AIRFLOW_HOME=$(pwd)/data-engineering/airflow && airflow api-server -p 8080"
echo "Terminal 2: export AIRFLOW_HOME=$(pwd)/data-engineering/airflow && airflow scheduler"
echo "========================================================="
