import os
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, sum, avg, max, coalesce, lit, current_timestamp

def process_gold():
    # Initialize Spark Session with PostgreSQL JDBC driver
    spark = SparkSession.builder \
        .appName("SilverToGoldAggregation") \
        .master("local[*]") \
        .config("spark.jars.packages", "org.postgresql:postgresql:42.7.2") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    # PostgreSQL configuration
    db_url = "jdbc:postgresql://localhost:5433/data_platform"
    db_properties = {
        "user": "user",
        "password": "password",
        "driver": "org.postgresql.Driver"
    }

    print("Starting Gold Analytical Aggregation...")

    try:
        # 1. Read Silver tables from PostgreSQL
        print("Reading Silver tables from PostgreSQL...")
        df_transactions = spark.read.jdbc(url=db_url, table="silver_transactions", properties=db_properties)
        df_users = spark.read.jdbc(url=db_url, table="silver_users", properties=db_properties)

        # 2. Join Silver Transactions and Silver Users
        # Use a left join from transactions to users since users batch table has IDs 1-3
        # while transaction ids span 1-1000. Coalesce missing names to 'unknown user'.
        print("Performing Silver table join and metric aggregations...")
        df_joined = df_transactions.join(df_users, on="user_id", how="left")

        # 3. Aggregate metrics grouped by user_id
        # We coalesce the user_name to handle transaction user IDs that are not present in batch users list.
        df_gold = df_joined.groupBy("user_id") \
            .agg(
                coalesce(max(col("user_name")), lit("unknown user")).alias("user_name"),
                count("transaction_id").cast("integer").alias("total_transactions"),
                sum("amount").alias("total_amount_usd"),
                avg("amount").alias("avg_amount_usd"),
                max("timestamp").alias("last_active")
            )

        # Add Gold processing metadata
        df_gold = df_gold.withColumn("gold_processed_at", current_timestamp())

        # Select columns to match gold_users_summary schema exactly
        df_gold_final = df_gold.select(
            col("user_id"),
            col("user_name"),
            col("total_transactions"),
            col("total_amount_usd"),
            col("avg_amount_usd"),
            col("last_active"),
            col("gold_processed_at")
        )

        # 4. Write analytical summaries to PostgreSQL Gold table
        print("Writing Gold aggregations to PostgreSQL table 'gold_users_summary'...")
        df_gold_final.write.jdbc(
            url=db_url,
            table="gold_users_summary",
            mode="overwrite",
            properties=db_properties
        )

        print("Gold analytical aggregations successfully written to database.")

    except Exception as e:
        print(f"Error occurred during Gold aggregation process: {e}")

    finally:
        spark.stop()

if __name__ == "__main__":
    process_gold()
