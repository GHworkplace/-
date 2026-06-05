from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class MapModel(Base):
    __tablename__ = "maps"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    winrate_ct = Column(Float)
    winrate_t = Column(Float)
    sniper_weight = Column(Integer)
    utility_weight = Column(Integer)
    is_default = Column(Boolean, default=True)
    description = Column(String)

class TeamModel(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    logo = Column(String)
    rank = Column(Integer)
    form_index = Column(Float)
    preferred_first_ban = Column(String)
    preferred_first_pick = Column(String)
    
    # JSON strings for nested dict data
    tactics = Column(String) # JSON string
    coach_style = Column(String) # JSON string

    # Relationships
    map_stats = relationship("TeamMapStat", back_populates="team", cascade="all, delete-orphan")
    players = relationship("PlayerModel", back_populates="team", cascade="all, delete-orphan")

class PlayerModel(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String, ForeignKey("teams.id"))
    nickname = Column(String)
    real_name = Column(String)
    role = Column(String) # e.g. IGL, AWPer, Rifler, Entry
    rating = Column(Float)
    impact = Column(Float)
    kast = Column(Float) # Percentage

    team = relationship("TeamModel", back_populates="players")

class TeamMapStat(Base):
    __tablename__ = "team_map_stats"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String, ForeignKey("teams.id"))
    map_id = Column(String, ForeignKey("maps.id"))
    
    # New filter dimensions
    time_range = Column(String, default="1y", index=True) # "3m", "6m", "1y"
    data_type = Column(String, default="historical", index=True) # "historical", "realtime"
    
    matches = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)
    ct_win_rate = Column(Float, default=0.0)
    t_win_rate = Column(Float, default=0.0)
    pistol_win_rate_ct = Column(Float, default=0.0)
    pistol_win_rate_t = Column(Float, default=0.0)

    team = relationship("TeamModel", back_populates="map_stats")
    map = relationship("MapModel")

class H2HRecord(Base):
    __tablename__ = "h2h_records"

    id = Column(Integer, primary_key=True, index=True)
    team_a_id = Column(String, ForeignKey("teams.id"))
    team_b_id = Column(String, ForeignKey("teams.id"))
    map_id = Column(String, ForeignKey("maps.id"))
    
    # New filter dimensions
    time_range = Column(String, default="1y", index=True)
    data_type = Column(String, default="historical", index=True)
    
    wins_a = Column(Integer, default=0)
    wins_b = Column(Integer, default=0)
