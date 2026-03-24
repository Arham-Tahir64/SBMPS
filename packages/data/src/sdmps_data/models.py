from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class SpaceObject(Base):
    __tablename__ = "space_objects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    norad_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True)
    object_class: Mapped[str] = mapped_column(String(64), nullable=False)
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    operator_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    tle_snapshots: Mapped[list["TleSnapshot"]] = relationship(
        back_populates="space_object", cascade="all, delete-orphan"
    )
    current_state: Mapped["CurrentState | None"] = relationship(
        back_populates="space_object", cascade="all, delete-orphan", uselist=False
    )


class TleSnapshot(Base):
    __tablename__ = "tle_snapshots"
    __table_args__ = (
        UniqueConstraint("object_id", "source", "epoch", name="uq_tle_snapshots_object_source_epoch"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    object_id: Mapped[str] = mapped_column(ForeignKey("space_objects.id", ondelete="CASCADE"), nullable=False)
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    line0: Mapped[str] = mapped_column(String(255), nullable=False)
    line1: Mapped[str] = mapped_column(String(255), nullable=False)
    line2: Mapped[str] = mapped_column(String(255), nullable=False)
    epoch: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    space_object: Mapped[SpaceObject] = relationship(back_populates="tle_snapshots")


class FeedStatus(Base):
    __tablename__ = "feed_statuses"

    source: Mapped[str] = mapped_column(String(64), primary_key=True)
    last_ingested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    stale_threshold_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    is_stale: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    object_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    message: Mapped[str | None] = mapped_column(String(512), nullable=True)


class CurrentState(Base):
    __tablename__ = "current_states"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    object_id: Mapped[str] = mapped_column(
        ForeignKey("space_objects.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    epoch: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    propagated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    position_x_km: Mapped[float] = mapped_column(Float, nullable=False)
    position_y_km: Mapped[float] = mapped_column(Float, nullable=False)
    position_z_km: Mapped[float] = mapped_column(Float, nullable=False)
    velocity_x_km_s: Mapped[float] = mapped_column(Float, nullable=False)
    velocity_y_km_s: Mapped[float] = mapped_column(Float, nullable=False)
    velocity_z_km_s: Mapped[float] = mapped_column(Float, nullable=False)

    space_object: Mapped[SpaceObject] = relationship(back_populates="current_state")
