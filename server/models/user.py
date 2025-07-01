from sqlalchemy import Column, Integer, String, Boolean, Date, TIMESTAMP, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class User(Base):
    __tablename__ = "users"
    
    user_idx = Column(Integer, primary_key=True)
    sha2_hash = Column(String, unique=True, nullable=False, comment="Firebase UID를 저장하는 필드")  # Firebase UID 저장
    age = Column(Integer)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    birth = Column(Date)
    is_adult = Column(Boolean, default=False)
    sec_password = Column(String, default="0000")
    nick_name = Column(String)
    
    # Relationships
    logs = relationship("UserLog", back_populates="user")
    vod_logs = relationship("VodLog", back_populates="user")
    my_list = relationship("MyList", back_populates="user")
    rec_list = relationship("RecList", back_populates="user")
    rec_adult_list = relationship("RecAdultList", back_populates="user")

class UserLog(Base):
    __tablename__ = "user_log"

    user_log_idx = Column(Integer, primary_key=True)
    user_idx = Column(Integer, ForeignKey("users.user_idx"), nullable=False)
    action_tms = Column(TIMESTAMP, nullable=False)
    action = Column(Integer, nullable=False)

    user = relationship("User", back_populates="logs")

class VodLog(Base):
    __tablename__ = "vod_log"

    log_idx = Column(Integer, primary_key=True)
    user_idx = Column(Integer, ForeignKey("users.user_idx"), nullable=False)
    asset_idx = Column(Integer, ForeignKey("assets.idx"), nullable=False)
    strt_dt = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    use_tms = Column(Integer, default=0, nullable=False)
    feedback = Column(Integer, default=0, nullable=False)
    
    user = relationship("User", back_populates="vod_logs")
    asset = relationship("Asset")

class MyList(Base):
    __tablename__ = "my_list"

    user_idx = Column(Integer, ForeignKey("users.user_idx"), primary_key=True)
    asset_idx = Column(Integer, ForeignKey("assets.idx"), primary_key=True)
    action = Column(Boolean, nullable=False)
    time_stamp = Column(TIMESTAMP, nullable=False)
    user = relationship("User", back_populates="my_list")

class RecList(Base):
    __tablename__ = "rec_list"

    user_idx = Column(Integer, ForeignKey("users.user_idx"), primary_key=True)
    asset_idx = Column(Integer, ForeignKey("assets.idx"), primary_key=True)
    rnk = Column(Integer, nullable=False)

    user = relationship("User", back_populates="rec_list")

class RecAdultList(Base):
    __tablename__ = "rec_adult_list"

    user_idx = Column(Integer, ForeignKey("users.user_idx"), primary_key=True)
    asset_idx = Column(Integer, ForeignKey("assets.idx"), primary_key=True)
    rnk = Column(Integer, nullable=False)

    user = relationship("User", back_populates="rec_adult_list")