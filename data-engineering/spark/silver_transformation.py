import os
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

# pyrefly: ignore [missing-import]
from pyspark.sql import SparkSession
# pyrefly: ignore [missing-import]
from pyspark.sql.functions import col, to_timestamp, lower, trim, current_timestamp, when, lit

def process_silver():
    # Initialize Spark Session with PostgreSQL JDBC driver
    spark = SparkSession.builder \
        .appName("BronzeToSilverTransformation") \
        .master("local[*]") \
        .config("spark.jars.packages", "org.postgresql:postgresql:42.7.2") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    # Define paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    bronze_batch_path = os.path.join(base_dir, "data", "bronze", "batch_data")
    bronze_stream_path = os.path.join(base_dir, "data", "bronze", "stream_data")
    
    quarantine_tx_path = os.path.join(base_dir, "data", "quarantine", "transactions")
    quarantine_users_path = os.path.join(base_dir, "data", "quarantine", "users")

    # PostgreSQL configuration
    db_url = "jdbc:postgresql://localhost:5433/data_platform"
    db_properties = {
        "user": "user",
        "password": "password",
        "driver": "org.postgresql.Driver"
    }

    print("Starting Silver Transformation and DB Ingestion...")

    # 1. Process Stream Data (Transactions)
    if os.path.exists(bronze_stream_path):
        print(f"Reading streaming Bronze data from: {bronze_stream_path}")
        df_stream = spark.read.parquet(bronze_stream_path)

        # Transformation Rules:
        # a) Deduplication inside current micro-batch
        df_stream = df_stream.dropDuplicates(["transaction_id"])

        # b) Handle Nulls
        df_stream = df_stream.na.fill({"amount": 0.0, "currency": "unknown"})

        # c) Standardize formatting
        df_stream = df_stream.withColumn("currency", lower(trim(col("currency")))) \
                             .withColumn("parsed_timestamp", to_timestamp(col("timestamp")))

        # Add silver metadata
        df_stream = df_stream.withColumn("silver_processed_at", current_timestamp())

        # Define Ingestion Data Quality Rules (DLQ Criteria)
        valid_cond = (
            col("transaction_id").isNotNull() & 
            col("user_id").isNotNull() & 
            (col("user_id") > 0) & 
            col("amount").isNotNull() & 
            (col("amount") > 0.0)
        )

        df_stream_valid = df_stream.filter(valid_cond)
        df_stream_invalid = df_stream.filter(~valid_cond)

        valid_count = df_stream_valid.count()
        invalid_count = df_stream_invalid.count()
        print(f"Transactions Validated - Clean: {valid_count}, Quarantined: {invalid_count}")

        # Write clean records to PostgreSQL
        if valid_count > 0:
            df_stream_final = df_stream_valid.select(
                col("transaction_id"),
                col("user_id"),
                col("amount"),
                col("currency"),
                col("parsed_timestamp").alias("timestamp"),
                col("silver_processed_at")
            )
            
            # Anti-join against existing PostgreSQL keys to prevent PRIMARY KEY constraint violation
            print("Fetching existing transaction IDs from PostgreSQL to prevent duplicates...")
            try:
                df_existing = spark.read.jdbc(
                    url=db_url,
                    table="silver_transactions",
                    properties=db_properties
                ).select("transaction_id")
                
                # Filter out transactions that already exist in target DB table
                df_stream_final = df_stream_final.join(df_existing, on="transaction_id", how="left_anti")
                print(f"Transactions after anti-join (new inserts only): {df_stream_final.count()}")
            except Exception as db_err:
                # If table doesn't exist yet, we can skip anti-join (handled by setup script)
                print(f"Skipping key check, writing directly: {db_err}")

            if df_stream_final.count() > 0:
                print(f"Writing transformed streaming data to PostgreSQL table 'silver_transactions'...")
                df_stream_final.write.jdbc(
                    url=db_url,
                    table="silver_transactions",
                    mode="append",
                    properties=db_properties
                )
            else:
                print("All validated transactions are already present in PostgreSQL database.")

        # Write dirty records to local Quarantine / DLQ folder
        if invalid_count > 0:
            print(f"Quarantining {invalid_count} transactions to DLQ storage at: {quarantine_tx_path}")
            df_stream_invalid_annotated = df_stream_invalid.withColumn(
                "quarantine_reason",
                when(col("transaction_id").isNull(), "Missing transaction_id")
                .when(col("user_id").isNull() | (col("user_id") <= 0), "Invalid or missing user_id")
                .when(col("amount").isNull() | (col("amount") <= 0.0), "Invalid or missing amount")
                .otherwise("Unknown constraint violation")
            ).withColumn("quarantined_at", current_timestamp())

            df_stream_invalid_annotated.write.mode("append").parquet(quarantine_tx_path)

    # 2. Process Batch Data (Users/Customers)
    if os.path.exists(bronze_batch_path):
        print(f"Reading batch Bronze data from: {bronze_batch_path}")
        df_batch = spark.read.parquet(bronze_batch_path)

        # Transformation Rules:
        # a) Schema enforcement / standardization
        df_batch = df_batch.withColumnRenamed("id", "user_id") \
                           .withColumnRenamed("name", "user_name") \
                           .withColumn("user_name", lower(trim(col("user_name"))))

        df_batch = df_batch.withColumn("silver_processed_at", current_timestamp())

        # Define User Data Quality Rules
        user_valid_cond = (
            col("user_id").isNotNull() &
            (col("user_id") > 0) &
            col("user_name").isNotNull() &
            (trim(col("user_name")) != "")
        )

        df_batch_valid = df_batch.filter(user_valid_cond)
        df_batch_invalid = df_batch.filter(~user_valid_cond)

        # Deduplicate users globally within the batch before saving
        df_batch_valid = df_batch_valid.dropDuplicates(["user_id"])

        valid_users_count = df_batch_valid.count()
        invalid_users_count = df_batch_invalid.count()
        print(f"Batch Users Validated - Clean: {valid_users_count}, Quarantined: {invalid_users_count}")

        # Write clean users to PostgreSQL
        if valid_users_count > 0:
            df_batch_final = df_batch_valid.select(
                col("user_id"),
                col("user_name"),
                col("silver_processed_at")
            )
            print(f"Writing transformed batch users data to PostgreSQL table 'silver_users' (with truncate preserve)...")
            
            # Combine properties and add truncate option to preserve relational key constraints
            db_write_properties = {**db_properties, "truncate": "true"}
            df_batch_final.write.jdbc(
                url=db_url,
                table="silver_users",
                mode="overwrite",
                properties=db_write_properties
            )

        # Write dirty users to local Quarantine folder
        if invalid_users_count > 0:
            print(f"Quarantining {invalid_users_count} users to DLQ storage at: {quarantine_users_path}")
            df_batch_invalid_annotated = df_batch_invalid.withColumn(
                "quarantine_reason",
                when(col("user_id").isNull() | (col("user_id") <= 0), "Invalid or missing user_id")
                .when(col("user_name").isNull() | (trim(col("user_name")) == ""), "Invalid or missing user_name")
                .otherwise("Unknown constraint violation")
            ).withColumn("quarantined_at", current_timestamp())

            df_batch_invalid_annotated.write.mode("append").parquet(quarantine_users_path)

    print("Silver transformations and DB/DLQ sinks completed successfully.")
    spark.stop()

if __name__ == "__main__":
    process_silver()
