import json
import time
import uuid
import random
from datetime import datetime
from kafka import KafkaProducer

def generate_transaction():
    return {
        "transaction_id": str(uuid.uuid4()),
        "user_id": random.randint(1, 1000),
        "amount": round(random.uniform(10.0, 500.0), 2),
        "currency": "USD",
        "timestamp": datetime.utcnow().isoformat()
    }

def run_producer():
    print("Initializing Kafka Producer...")
    try:
        # Connect to Kafka running in Docker
        producer = KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        print("Connected to Kafka. Sending data to topic 'transactions'...")
    except Exception as e:
        print(f"Error connecting to Kafka (Ensure Docker container is running): {e}")
        return

    try:
        while True:
            data = generate_transaction()
            producer.send('transactions', value=data)
            print(f"Sent: {data}")
            time.sleep(2)  # Send a message every 2 seconds
    except KeyboardInterrupt:
        print("Stopping Producer...")
    finally:
        producer.close()

if __name__ == "__main__":
    run_producer()
