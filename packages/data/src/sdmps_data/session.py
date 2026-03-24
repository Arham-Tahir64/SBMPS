from __future__ import annotations

from contextlib import contextmanager
from functools import lru_cache
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from sdmps_data.models import Base


def _connect_args(database_url: str) -> dict[str, bool]:
    if database_url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


@lru_cache
def get_engine(database_url: str) -> Engine:
    return create_engine(database_url, future=True, connect_args=_connect_args(database_url))


def create_session_factory(database_url: str) -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(database_url), autoflush=False, autocommit=False, expire_on_commit=False)


def init_database(database_url: str) -> None:
    Base.metadata.create_all(bind=get_engine(database_url))


@contextmanager
def session_scope(database_url: str) -> Iterator[Session]:
    session = create_session_factory(database_url)()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
