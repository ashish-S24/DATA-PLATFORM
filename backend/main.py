import os
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Data AI Platform API")

# Configure CORS to allow Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5433/data_platform")

@app.get("/")
def read_root():
    return {"message": "Welcome to Data AI Platform API"}

@app.get("/api/stats")
def get_stats():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Count silver_users
        cursor.execute("SELECT COUNT(*) FROM silver_users;")
        silver_users_count = cursor.fetchone()[0]
        
        # Count silver_transactions
        cursor.execute("SELECT COUNT(*) FROM silver_transactions;")
        silver_transactions_count = cursor.fetchone()[0]
        
        # Count gold_users_summary
        cursor.execute("SELECT COUNT(*) FROM gold_users_summary;")
        gold_users_summary_count = cursor.fetchone()[0]
        
        # Calculate totals from transactions
        cursor.execute("SELECT SUM(amount) FROM silver_transactions;")
        total_amount = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT AVG(amount) FROM silver_transactions;")
        avg_amount = cursor.fetchone()[0] or 0.0
        
        # Fetch top users by transaction volume
        cursor.execute("""
            SELECT user_id, user_name, total_transactions, total_amount_usd, avg_amount_usd 
            FROM gold_users_summary 
            ORDER BY total_amount_usd DESC 
            LIMIT 5;
        """)
        top_users = []
        for row in cursor.fetchall():
            top_users.append({
                "user_id": row[0],
                "user_name": row[1],
                "total_transactions": row[2],
                "total_amount_usd": round(row[3], 2),
                "avg_amount_usd": round(row[4], 2)
            })
            
        cursor.close()
        conn.close()
        
        return {
            "silver_users_count": silver_users_count,
            "silver_transactions_count": silver_transactions_count,
            "gold_users_summary_count": gold_users_summary_count,
            "total_amount_usd": round(total_amount, 2),
            "avg_amount_usd": round(avg_amount, 2),
            "top_users": top_users,
            "status": "active"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "database_error",
            "silver_users_count": 0,
            "silver_transactions_count": 0,
            "gold_users_summary_count": 0,
            "total_amount_usd": 0,
            "avg_amount_usd": 0,
            "top_users": []
        }

