"""
Database Configuration
Async SQLAlchemy engine for SQLite/PostgreSQL
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import os

# Database URL - supports both SQLite (local) and PostgreSQL (production)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./counsellor.db")

# Convert postgres:// to postgresql+asyncpg:// for async support (Render/Railway compatibility)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Detect if using PostgreSQL for pgbouncer compatibility
is_postgres = "postgresql+asyncpg://" in DATABASE_URL

# Create async engine with pgbouncer-compatible settings
# Use NullPool to let pgbouncer handle connection pooling
if is_postgres:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        poolclass=NullPool,  # Disable SQLAlchemy pooling, let pgbouncer handle it
        connect_args={
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0,
        },
    )
else:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
    )

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Dependency to get DB session
async def get_db():
    """
    FastAPI dependency that yields a database session.
    Automatically closes after request completes.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
