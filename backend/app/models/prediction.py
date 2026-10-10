from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin


class Prediction(Base, TimestampMixin):
    __tablename__ = "predictions"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    disease_type = Column(String(100), nullable=False, index=True)
    probability = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    badge_color = Column(String(50), default="celadon", nullable=False)
    model_name = Column(String(100), nullable=False)
    accuracy_metric = Column(String(50), default="90%", nullable=False)
    
    # Semi-structured JSON payloads (PostgreSQL JSONB / SQLite JSON compatible)
    input_features = Column(JSON, nullable=False)
    shap_attributions = Column(JSON, nullable=False)
    clinical_advice = Column(Text, nullable=False)

    user = relationship("User", back_populates="predictions")
