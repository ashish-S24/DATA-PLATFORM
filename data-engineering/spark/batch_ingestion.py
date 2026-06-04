import os
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

from pyspark.sql import SparkSession
from pyspark.sql.functions import current_timestamp

def process_batch():
    # Initialize Spark Session
    spark = SparkSession.builder \
        .appName("BatchIngestionToBronze") \
        .master("local[*]") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    # Define paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_path = os.path.join(base_dir, "data", "raw")
    bronze_path = os.path.join(base_dir, "data", "bronze", "batch_data")

    # Ensure raw directory exists and has files, otherwise create a dummy one for testing to prevent upfront errors
    if not os.path.exists(raw_path):
        os.makedirs(raw_path)
    
    dummy_file = os.path.join(raw_path, "dummy.csv")
    if not os.path.exists(dummy_file):
        with open(dummy_file, "w") as f:
            f.write("id,name,amount\n1,Alice,100\n2,Bob,200\n3,Charlie,300")
            
    print(f"Reading batch data from: {raw_path}")

    # Read CSV
    df = spark.read \
        .option("header", "true") \
        .option("inferSchema", "true") \
        .csv(raw_path)

    # Add ingestion metadata
    df_bronze = df.withColumn("ingested_at", current_timestamp())

    # Write to Bronze layer as Parquet
    print(f"Writing to Bronze layer at: {bronze_path}")
    df_bronze.write \
        .mode("append") \
        .parquet(bronze_path)

    print("Batch ingestion to Bronze completed successfully.")
    spark.stop()

if __name__ == "__main__":
    process_batch()
