import psycopg2

def setup_database():
    conn_params = {
        "host": "localhost",
        "port": 5433,
        "database": "data_platform",
        "user": "user",
        "password": "password"
    }
    
    print("Connecting to PostgreSQL database...")
    try:
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        print("Connected successfully.")
        
        # Drop existing tables to start clean for Phase 2
        print("Dropping existing tables if any...")
        cursor.execute("DROP TABLE IF EXISTS gold_users_summary CASCADE;")
        cursor.execute("DROP TABLE IF EXISTS silver_transactions CASCADE;")
        cursor.execute("DROP TABLE IF EXISTS silver_users CASCADE;")
        
        # Create silver_transactions
        print("Creating table silver_transactions...")
        cursor.execute("""
            CREATE TABLE silver_transactions (
                transaction_id VARCHAR(100) PRIMARY KEY,
                user_id INT,
                amount DOUBLE PRECISION,
                currency VARCHAR(10),
                timestamp TIMESTAMP,
                silver_processed_at TIMESTAMP
            );
        """)
        
        # Create silver_users
        print("Creating table silver_users...")
        cursor.execute("""
            CREATE TABLE silver_users (
                user_id INT PRIMARY KEY,
                user_name VARCHAR(100),
                silver_processed_at TIMESTAMP
            );
        """)
        
        # Create gold_users_summary
        print("Creating table gold_users_summary...")
        cursor.execute("""
            CREATE TABLE gold_users_summary (
                user_id INT PRIMARY KEY,
                user_name VARCHAR(100),
                total_transactions INT,
                total_amount_usd DOUBLE PRECISION,
                avg_amount_usd DOUBLE PRECISION,
                last_active TIMESTAMP,
                gold_processed_at TIMESTAMP
            );
        """)
        
        conn.commit()
        print("Database schema initialized successfully.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error occurred during database initialization: {e}")

if __name__ == "__main__":
    setup_database()
