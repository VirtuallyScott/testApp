import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is not set")

    logger.info("Waiting for database to be ready...")
    engine = create_engine(db_url)
    
    max_retries = 60
    retry_interval = 5

    for i in range(max_retries):
        try:
            # Try to connect to the database
            with engine.connect() as connection:
                connection.execute("SELECT 1")
            logger.info("Database is ready!")
            return True
        except OperationalError as e:
            if i < max_retries - 1:
                logger.info(f"Database not ready yet (attempt {i + 1}/{max_retries}). Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error("Max retries reached. Database is not available.")
                raise

if __name__ == "__main__":
    wait_for_db()
