from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import models
from database import engine, get_db
import json
import os

app = FastAPI(title="CS2 Sandbox API")

# Setup database (in a real app, do this with Alembic)
models.Base.metadata.create_all(bind=engine)

@app.get("/api/maps")
def get_maps(timeRange: str = "1y", dataType: str = "historical", db: Session = Depends(get_db)):
    maps = db.query(models.MapModel).all()
    result = []
    for m in maps:
        # Calculate dynamic average CT/T winrate based on all teams in the selected time range
        stats = db.query(models.TeamMapStat).filter(
            models.TeamMapStat.map_id == m.id,
            models.TeamMapStat.time_range == timeRange,
            models.TeamMapStat.data_type == dataType,
            models.TeamMapStat.matches > 0
        ).all()
        
        if stats:
            avg_ct = sum(s.ct_win_rate for s in stats) / len(stats)
            avg_t = sum(s.t_win_rate for s in stats) / len(stats)
            total = avg_ct + avg_t
            dyn_ct = (avg_ct / total) * 100 if total > 0 else 50.0
            dyn_t = (avg_t / total) * 100 if total > 0 else 50.0
        else:
            dyn_ct = m.winrate_ct
            dyn_t = m.winrate_t

        result.append({
            "id": m.id, "code": m.code, "name": m.name, 
            "winrateCT": round(dyn_ct, 1), "winrateT": round(dyn_t, 1), 
            "sniperWeight": m.sniper_weight, "utilityWeight": m.utility_weight, 
            "isDefault": m.is_default, "description": m.description
        })
    return result

@app.get("/api/teams")
def get_teams(timeRange: str = "1y", dataType: str = "historical", db: Session = Depends(get_db)):
    teams = db.query(models.TeamModel).all()
    result = []
    for t in teams:
        map_pool = {}
        # Filter map stats based on query params
        for stat in t.map_stats:
            if stat.time_range == timeRange and stat.data_type == dataType:
                map_pool[stat.map_id] = {
                    "matches": stat.matches, "wins": stat.wins, "winRate": stat.win_rate,
                    "ctWinRate": stat.ct_win_rate, "tWinRate": stat.t_win_rate,
                    "pistolWinRateCT": stat.pistol_win_rate_ct, "pistolWinRateT": stat.pistol_win_rate_t
                }
        
        players = []
        for p in t.players:
            players.append({
                "nickname": p.nickname,
                "realName": p.real_name,
                "role": p.role,
                "rating": p.rating,
                "impact": p.impact,
                "kast": p.kast
            })
        
        result.append({
            "id": t.id,
            "name": t.name,
            "logo": t.logo,
            "rank": t.rank,
            "formIndex": t.form_index,
            "preferredFirstBan": t.preferred_first_ban,
            "preferredFirstPick": t.preferred_first_pick,
            "tactics": json.loads(t.tactics) if t.tactics else {},
            "coachStyle": json.loads(t.coach_style) if t.coach_style else {},
            "mapPool": map_pool,
            "players": players
        })
    return result

@app.get("/api/h2h")
def get_h2h(timeRange: str = "1y", dataType: str = "historical", db: Session = Depends(get_db)):
    records = db.query(models.H2HRecord).filter(
        models.H2HRecord.time_range == timeRange,
        models.H2HRecord.data_type == dataType
    ).all()
    h2h_dict = {}
    
    for r in records:
        if r.team_a_id not in h2h_dict:
            h2h_dict[r.team_a_id] = {}
        if r.team_b_id not in h2h_dict[r.team_a_id]:
            h2h_dict[r.team_a_id][r.team_b_id] = {}
            
        h2h_dict[r.team_a_id][r.team_b_id][r.map_id] = [r.wins_a, r.wins_b]
        
    return h2h_dict

@app.post("/api/update_data")
def trigger_update(db: Session = Depends(get_db)):
    import scraper
    try:
        scraper.fetch_and_update_data(db)
        return {"status": "success", "message": "Data scraped and seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount Frontend static files
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
