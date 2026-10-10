from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin


class MedicalReport(Base, TimestampMixin):
    __tablename__ = "medical_reports"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    lab_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_type = Column(String(50), default="PDF Document", nullable=False)
    parsing_status = Column(String(50), default="completed", nullable=False)
    target_model = Column(String(50), default="diabetes", nullable=False)
    
    # Structured OCR extracted biomarker array with confidence ratings
    extracted_data = Column(JSON, nullable=False)

    user = relationship("User", back_populates="reports")
