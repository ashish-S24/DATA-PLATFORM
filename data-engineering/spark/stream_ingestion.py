import os
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, current_timestamp
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType

def process_stream():
    # Initialize Spark Session with Kafka package to prevent missing class errors upfront
    # Using Scala 2.12 and Spark 3.5.1 versions as compatible defaults
    spark = SparkSession.builder \
        .appName("StreamIngestionToBronze") \
        .master("local[*]") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    # Define paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    bronze_path = os.path.join(base_dir, "data", "bronze", "stream_data")
    checkpoint_path = os.path.join(base_dir, "data", "checkpoints", "stream_data")

    print("Starting Spark Structured Streaming from Kafka...")

    # Read from Kafka
    kafka_df = spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:9092") \
        .option("subscribe", "transactions") \
        .option("startingOffsets", "earliest") \
        .load()

    # Cast key/value to string
    kafka_json_df = kafka_df.selectExpr("CAST(value AS STRING) as json_payload")

    # Define schema matching our dummy producer
    schema = StructType([
        StructField("transaction_id", StringType(), True),
        StructField("user_id", IntegerType(), True),
        StructField("amount", DoubleType(), True),
        StructField("currency", StringType(), True),
        StructField("timestamp", StringType(), True)
    ])

    # Parse JSON
    parsed_df = kafka_json_df.select(from_json(col("json_payload"), schema).alias("data")).select("data.*")

    # Add ingestion metadata
    bronze_df = parsed_df.withColumn("ingested_at", current_timestamp())

    # Write stream to Bronze layer as Parquet
    query = bronze_df.writeStream \
        .format("parquet") \
        .option("path", bronze_path) \
        .option("checkpointLocation", checkpoint_path) \
        .outputMode("append") \
        .start()

    print(f"Streaming to Bronze layer at: {bronze_path}")
    query.awaitTermination()

if __name__ == "__main__":
    process_stream()
