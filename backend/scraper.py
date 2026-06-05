import time
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# This is a skeleton scraper. In a real-world scenario, you would use requests/BeautifulSoup 
# or Playwright to scrape HLTV.org or consume a reliable CS2 API.
# For now, this script seeds the SQLite database with the initial hardcoded data,
# effectively allowing the frontend to pull dynamically via the API.

import random

def fetch_and_update_data(db: Session):
    logger.info("Starting data update process (Scraping/Seeding)...")
    
    # 1. Clear existing data to replace with fresh pull
    logger.info("Clearing old records...")
    db.query(models.H2HRecord).delete()
    db.query(models.TeamMapStat).delete()
    db.query(models.PlayerModel).delete()
    db.query(models.TeamModel).delete()
    db.query(models.MapModel).delete()
    db.commit()

    # 2. Insert Maps
    logger.info("Updating maps...")
    maps_data = [
        {"id": "Ancient", "code": "AN", "name": "远古遗迹 (Ancient)", "winrate_ct": 50.8, "winrate_t": 49.2, "sniper_weight": 7, "utility_weight": 7, "is_default": True, "description": "中路控制权争夺激烈，防守回防迅速。"},
        {"id": "Dust2", "code": "D2", "name": "炙热沙城2 (Dust2)", "winrate_ct": 49.1, "winrate_t": 50.9, "sniper_weight": 9, "utility_weight": 5, "is_default": True, "description": "经典长枪对拼图，狙击手发挥空间极大。"},
        {"id": "Inferno", "code": "INF", "name": "炼狱小镇 (Inferno)", "winrate_ct": 49.0, "winrate_t": 51.0, "sniper_weight": 5, "utility_weight": 9, "is_default": True, "description": "战术博弈核心，香蕉道控制至关重要。"},
        {"id": "Mirage", "code": "MIR", "name": "荒漠迷城 (Mirage)", "winrate_ct": 54.2, "winrate_t": 45.8, "sniper_weight": 8, "utility_weight": 7, "is_default": True, "description": "最均衡的竞技地图，CT方包点防守交叉火力强。"},
        {"id": "Nuke", "code": "NUK", "name": "核子危机 (Nuke)", "winrate_ct": 55.2, "winrate_t": 44.8, "sniper_weight": 7, "utility_weight": 8, "is_default": True, "description": "立体双层结构，极度考验信息交换与速转。"},
        {"id": "Anubis", "code": "ANU", "name": "阿努比斯 (Anubis)", "winrate_ct": 43.3, "winrate_t": 56.7, "sniper_weight": 6, "utility_weight": 8, "is_default": True, "description": "运河区复杂，T方进攻选择极多，属于强进攻图。"},
        {"id": "Overpass", "code": "OVP", "name": "死亡游乐园 (Overpass)", "winrate_ct": 56.4, "winrate_t": 43.6, "sniper_weight": 8, "utility_weight": 7, "is_default": True, "description": "包点落差大，CT防守前推拿信息打法多变。"},
        {"id": "Vertigo", "code": "VER", "name": "殒命大厦 (Vertigo)", "winrate_ct": 48.5, "winrate_t": 51.5, "sniper_weight": 6, "utility_weight": 8, "is_default": False, "description": "梯次垂直进攻，A坡常年交火，B区偏向包点爆发。"},
        {"id": "Train", "code": "TRN", "name": "列车停放站 (Train)", "winrate_ct": 53.8, "winrate_t": 46.2, "sniper_weight": 9, "utility_weight": 7, "is_default": False, "description": "高架轨道林立，极度考验狙击手控线与烟雾掩护。"}
    ]
    for m in maps_data:
        db.add(models.MapModel(**m))

    # 3. Insert Teams
    logger.info("Updating teams...")
    teams_data = [
        {
            "id": "NAVI", "name": "Natus Vincere (NAVI)", "logo": "🦞", "rank": 1, "form_index": 9.2, 
            "preferred_first_ban": "Vertigo", "preferred_first_pick": "Nuke",
            "tactics": json.dumps({"T": {"default": 9.0, "rush": 6.5, "split": 8.5}, "CT": {"default": 8.5, "push": 6.0, "stack": 9.0}}),
            "coach_style": json.dumps({"aggression": 0.35, "predictive": 0.80, "trapIndex": 0.40, "description": "战术分析大师，擅长慢节奏控图默认，防守协同极高。"})
        },
        {
            "id": "FaZe", "name": "FaZe Clan", "logo": "⚡", "rank": 3, "form_index": 8.8, 
            "preferred_first_ban": "Anubis", "preferred_first_pick": "Nuke",
            "tactics": json.dumps({"T": {"default": 8.5, "rush": 8.0, "split": 9.0}, "CT": {"default": 8.0, "push": 9.0, "stack": 7.5}}),
            "coach_style": json.dumps({"aggression": 0.75, "predictive": 0.65, "trapIndex": 0.70, "description": "大局观和临场变阵大师，喜欢出奇制胜，战术灵活度极高。"})
        },
        {
            "id": "Spirit", "name": "Team Spirit", "logo": "🐉", "rank": 2, "form_index": 9.5, 
            "preferred_first_ban": "Inferno", "preferred_first_pick": "Anubis",
            "tactics": json.dumps({"T": {"default": 8.0, "rush": 9.5, "split": 8.0}, "CT": {"default": 8.5, "push": 8.0, "stack": 8.0}}),
            "coach_style": json.dumps({"aggression": 0.60, "predictive": 0.70, "trapIndex": 0.50, "description": "进攻火力极其凶猛，拥有绝对的核心爆破手，节奏快。"})
        },
        {
            "id": "G2", "name": "G2 Esports", "logo": "👑", "rank": 4, "form_index": 8.7, 
            "preferred_first_ban": "Anubis", "preferred_first_pick": "Dust2",
            "tactics": json.dumps({"T": {"default": 7.5, "rush": 8.5, "split": 8.5}, "CT": {"default": 7.5, "push": 8.5, "stack": 8.0}}),
            "coach_style": json.dumps({"aggression": 0.55, "predictive": 0.50, "trapIndex": 0.60, "description": "拥有世界顶尖的对枪好手和明星狙击手，极其擅长点位突破与个人残局。"})
        },
        {
            "id": "Vitality", "name": "Team Vitality", "logo": "🐝", "rank": 5, "form_index": 8.6, 
            "preferred_first_ban": "Ancient", "preferred_first_pick": "Mirage",
            "tactics": json.dumps({"T": {"default": 9.0, "rush": 7.0, "split": 8.0}, "CT": {"default": 8.5, "push": 7.0, "stack": 8.5}}),
            "coach_style": json.dumps({"aggression": 0.30, "predictive": 0.75, "trapIndex": 0.45, "description": "围绕超级明星狙击手的防守反击打法，道具配合与残局收割能力属顶尖级别。"})
        },
        {
            "id": "MOUZ", "name": "MOUZ", "logo": "🐭", "rank": 6, "form_index": 8.5, 
            "preferred_first_ban": "Anubis", "preferred_first_pick": "Mirage",
            "tactics": json.dumps({"T": {"default": 8.0, "rush": 8.0, "split": 8.5}, "CT": {"default": 8.5, "push": 8.0, "stack": 8.0}}),
            "coach_style": json.dumps({"aggression": 0.50, "predictive": 0.60, "trapIndex": 0.55, "description": "青年禁卫军，极高的协同配合度，选手的补枪效率与双人夹击极其高效。"})
        },
        {
            "id": "Astralis", "name": "Astralis", "logo": "⭐", "rank": 7, "form_index": 8.0, 
            "preferred_first_ban": "Anubis", "preferred_first_pick": "Overpass",
            "tactics": json.dumps({"T": {"default": 8.5, "rush": 6.5, "split": 8.0}, "CT": {"default": 9.0, "push": 6.5, "stack": 8.0}}),
            "coach_style": json.dumps({"aggression": 0.40, "predictive": 0.85, "trapIndex": 0.65, "description": "老牌豪门战术风格，极度尊崇纪律性与公事公办的战术回防，道具投掷教科书。"})
        }
    ]
    for t in teams_data:
        db.add(models.TeamModel(**t))
    
    db.commit() # commit teams to generate relationships

    # 3.5 Insert Players
    logger.info("Updating players...")
    players_data = [
        # NAVI
        {"team_id": "NAVI", "nickname": "Aleksib", "real_name": "Aleksi Virolainen", "role": "IGL", "rating": 0.95, "impact": 0.90, "kast": 70.5},
        {"team_id": "NAVI", "nickname": "b1t", "real_name": "Valeriy Vakhovskiy", "role": "Rifler", "rating": 1.15, "impact": 1.10, "kast": 73.2},
        {"team_id": "NAVI", "nickname": "jL", "real_name": "Justinas Lekavicius", "role": "Entry", "rating": 1.22, "impact": 1.25, "kast": 74.0},
        {"team_id": "NAVI", "nickname": "w0nderful", "real_name": "Ihor Zhdanov", "role": "AWPer", "rating": 1.18, "impact": 1.15, "kast": 75.1},
        {"team_id": "NAVI", "nickname": "iM", "real_name": "Mihai Ivan", "role": "Entry", "rating": 1.05, "impact": 1.08, "kast": 68.5},
        # FaZe
        {"team_id": "FaZe", "nickname": "karrigan", "real_name": "Finn Andersen", "role": "IGL", "rating": 0.88, "impact": 0.85, "kast": 65.0},
        {"team_id": "FaZe", "nickname": "broky", "real_name": "Helvijs Saukants", "role": "AWPer", "rating": 1.16, "impact": 1.12, "kast": 74.2},
        {"team_id": "FaZe", "nickname": "ropz", "real_name": "Robin Kool", "role": "Lurker", "rating": 1.12, "impact": 1.05, "kast": 76.5},
        {"team_id": "FaZe", "nickname": "rain", "real_name": "Håvard Nygaard", "role": "Entry", "rating": 1.08, "impact": 1.15, "kast": 69.8},
        {"team_id": "FaZe", "nickname": "frozen", "real_name": "David Čerňanský", "role": "Rifler", "rating": 1.14, "impact": 1.10, "kast": 75.0},
        # Spirit
        {"team_id": "Spirit", "nickname": "chopper", "real_name": "Leonid Vishnyakov", "role": "IGL", "rating": 0.92, "impact": 0.88, "kast": 69.0},
        {"team_id": "Spirit", "nickname": "donk", "real_name": "Danil Kryshkovets", "role": "Entry", "rating": 1.35, "impact": 1.45, "kast": 76.0},
        {"team_id": "Spirit", "nickname": "sh1ro", "real_name": "Dmitry Sokolov", "role": "AWPer", "rating": 1.25, "impact": 1.18, "kast": 78.5},
        {"team_id": "Spirit", "nickname": "magixx", "real_name": "Boris Vorobiev", "role": "Anchor", "rating": 1.02, "impact": 0.95, "kast": 72.0},
        {"team_id": "Spirit", "nickname": "zont1x", "real_name": "Myroslav Plakhotia", "role": "Rifler", "rating": 1.05, "impact": 1.00, "kast": 73.5},
        # G2
        {"team_id": "G2", "nickname": "HooXi", "real_name": "Rasmus Nielsen", "role": "IGL", "rating": 0.85, "impact": 0.82, "kast": 64.5},
        {"team_id": "G2", "nickname": "m0NESY", "real_name": "Ilya Osipov", "role": "AWPer", "rating": 1.28, "impact": 1.30, "kast": 75.5},
        {"team_id": "G2", "nickname": "NiKo", "real_name": "Nikola Kovač", "role": "Entry", "rating": 1.20, "impact": 1.25, "kast": 72.5},
        {"team_id": "G2", "nickname": "huNter-", "real_name": "Nemanja Kovač", "role": "Rifler", "rating": 1.05, "impact": 1.05, "kast": 71.0},
        {"team_id": "G2", "nickname": "nexa", "real_name": "Nemanja Isaković", "role": "Anchor", "rating": 0.98, "impact": 0.90, "kast": 73.0},
        # Vitality
        {"team_id": "Vitality", "nickname": "apEX", "real_name": "Dan Madesclaire", "role": "IGL", "rating": 0.96, "impact": 1.02, "kast": 68.5},
        {"team_id": "Vitality", "nickname": "ZywOo", "real_name": "Mathieu Herbaut", "role": "AWPer", "rating": 1.32, "impact": 1.35, "kast": 77.0},
        {"team_id": "Vitality", "nickname": "Spinx", "real_name": "Lotan Giladi", "role": "Lurker", "rating": 1.18, "impact": 1.15, "kast": 74.5},
        {"team_id": "Vitality", "nickname": "flameZ", "real_name": "Shahar Shushan", "role": "Entry", "rating": 1.10, "impact": 1.12, "kast": 70.5},
        {"team_id": "Vitality", "nickname": "mezii", "real_name": "William Merriman", "role": "Anchor", "rating": 1.02, "impact": 0.95, "kast": 73.5},
    ]
    for p in players_data:
        db.add(models.PlayerModel(**p))

    # 4. Insert Team Map Stats with variations for time ranges and data types
    logger.info("Updating team map statistics...")
    base_stats = {
        "NAVI": {
            "Ancient": [24, 16, 66.7, 58.3, 52.1, 62.5, 54.2],
            "Dust2": [15, 8, 53.3, 48.0, 58.7, 50.0, 53.3],
            "Inferno": [18, 10, 55.6, 51.2, 60.0, 55.6, 44.4],
            "Mirage": [30, 22, 73.3, 65.5, 59.0, 70.0, 60.0],
            "Nuke": [28, 21, 75.0, 70.1, 62.3, 64.3, 67.9],
            "Anubis": [22, 13, 59.1, 45.8, 68.2, 45.5, 72.7],
            "Overpass": [14, 9, 64.3, 61.2, 50.0, 57.1, 50.0],
            "Vertigo": [5, 1, 20.0, 35.0, 25.0, 40.0, 20.0],
            "Train": [8, 5, 62.5, 58.0, 54.0, 62.5, 50.0]
        },
        "FaZe": {
            "Ancient": [20, 11, 55.0, 50.0, 52.5, 55.0, 50.0],
            "Dust2": [22, 14, 63.6, 54.0, 62.1, 59.1, 63.6],
            "Inferno": [25, 16, 64.0, 56.8, 58.2, 60.0, 56.0],
            "Mirage": [28, 19, 67.9, 60.2, 56.3, 64.3, 53.6],
            "Nuke": [26, 18, 69.2, 62.5, 58.0, 57.7, 61.5],
            "Anubis": [10, 3, 30.0, 38.0, 40.0, 40.0, 30.0],
            "Overpass": [18, 12, 66.7, 63.9, 52.2, 61.1, 55.6],
            "Vertigo": [8, 4, 50.0, 48.0, 50.0, 50.0, 50.0],
            "Train": [12, 8, 66.7, 60.0, 58.0, 58.3, 58.3]
        },
        "Spirit": {
            "Ancient": [16, 11, 68.8, 60.0, 55.0, 68.8, 56.3],
            "Dust2": [18, 13, 72.2, 56.2, 69.4, 61.1, 72.2],
            "Inferno": [6, 1, 16.7, 30.0, 25.0, 33.3, 33.3],
            "Mirage": [26, 18, 69.2, 62.0, 60.2, 57.7, 65.4],
            "Nuke": [20, 13, 65.0, 59.0, 55.0, 60.0, 55.0],
            "Anubis": [25, 20, 80.0, 52.0, 75.0, 56.0, 80.0],
            "Overpass": [12, 7, 58.3, 55.0, 46.0, 50.0, 58.3],
            "Vertigo": [10, 6, 60.0, 52.0, 58.0, 60.0, 50.0],
            "Train": [6, 4, 66.7, 55.0, 60.0, 66.7, 50.0]
        },
        "G2": {
            "Ancient": [18, 10, 55.6, 51.5, 48.0, 50.0, 55.6],
            "Dust2": [24, 18, 75.0, 62.0, 68.0, 62.5, 66.7],
            "Inferno": [22, 15, 68.2, 58.0, 62.0, 63.6, 54.5],
            "Mirage": [24, 14, 58.3, 55.0, 52.0, 58.3, 50.0],
            "Nuke": [22, 13, 59.1, 57.0, 50.0, 54.5, 50.0],
            "Anubis": [8, 2, 25.0, 30.0, 35.0, 37.5, 37.5],
            "Overpass": [15, 9, 60.0, 58.0, 50.0, 60.0, 46.7],
            "Vertigo": [6, 3, 50.0, 45.0, 50.0, 50.0, 50.0],
            "Train": [10, 7, 70.0, 65.0, 58.0, 60.0, 70.0]
        },
        "Vitality": {
            "Ancient": [8, 2, 25.0, 38.0, 32.0, 37.5, 25.0],
            "Dust2": [16, 10, 62.5, 52.0, 58.0, 56.3, 50.0],
            "Inferno": [20, 12, 60.0, 54.0, 55.0, 55.0, 60.0],
            "Mirage": [26, 19, 73.1, 64.0, 61.5, 69.2, 57.7],
            "Nuke": [22, 14, 63.6, 60.0, 52.0, 59.1, 54.5],
            "Anubis": [20, 15, 75.0, 48.0, 72.0, 55.0, 75.0],
            "Overpass": [12, 7, 58.3, 58.0, 45.0, 50.0, 50.0],
            "Vertigo": [12, 8, 66.7, 55.0, 60.0, 58.3, 58.3],
            "Train": [8, 5, 62.5, 58.0, 52.0, 50.0, 62.5]
        },
        "MOUZ": {
            "Ancient": [22, 15, 68.2, 60.5, 55.0, 63.6, 59.1],
            "Dust2": [12, 6, 50.0, 46.0, 50.0, 50.0, 41.7],
            "Inferno": [14, 8, 57.1, 53.0, 51.0, 57.1, 50.0],
            "Mirage": [25, 18, 72.0, 64.0, 58.0, 68.0, 60.0],
            "Nuke": [18, 10, 55.6, 55.0, 48.0, 50.0, 55.6],
            "Anubis": [10, 3, 30.0, 35.0, 40.0, 40.0, 30.0],
            "Overpass": [16, 10, 62.5, 60.0, 49.0, 56.3, 50.0],
            "Vertigo": [14, 10, 71.4, 60.0, 62.0, 64.3, 57.1],
            "Train": [6, 3, 50.0, 48.0, 45.0, 50.0, 50.0]
        },
        "Astralis": {
            "Ancient": [14, 7, 50.0, 48.0, 45.0, 50.0, 50.0],
            "Dust2": [12, 5, 41.7, 42.0, 45.0, 41.7, 50.0],
            "Inferno": [20, 13, 65.0, 58.0, 54.0, 60.0, 55.0],
            "Mirage": [22, 12, 54.5, 52.0, 48.0, 50.0, 45.5],
            "Nuke": [16, 9, 56.3, 55.0, 47.0, 56.3, 50.0],
            "Anubis": [10, 2, 20.0, 30.0, 32.0, 40.0, 20.0],
            "Overpass": [24, 17, 70.8, 66.7, 58.3, 62.5, 62.5],
            "Vertigo": [8, 4, 50.0, 48.0, 50.0, 50.0, 50.0],
            "Train": [10, 6, 60.0, 55.0, 50.0, 60.0, 50.0]
        }
    }

    time_ranges = ["3m", "6m", "1y", "all"]
    data_types = ["historical", "realtime"]

    for tr in time_ranges:
        for dt in data_types:
            # Seed to make data deterministic but variable
            random.seed(f"{tr}_{dt}")
            for t_id, m_dict in base_stats.items():
                for m_id, row in m_dict.items():
                    # Generate some random fluctuations based on time_range
                    multiplier = 1.0
                    if tr == "3m": multiplier = 0.3
                    elif tr == "6m": multiplier = 0.6
                    elif tr == "1y": multiplier = 1.0
                    elif tr == "all": multiplier = 1.5

                    matches = max(1, int(row[0] * multiplier + random.randint(-2, 3)))
                    
                    # Win rate fluctuates +/- 8%
                    wr_fluctuation = random.uniform(-8.0, 8.0)
                    if dt == "realtime":
                        wr_fluctuation += random.uniform(-5.0, 5.0) # Realtime adds more noise

                    win_rate = max(10.0, min(90.0, row[2] + wr_fluctuation))
                    wins = int(matches * (win_rate / 100))

                    db.add(models.TeamMapStat(
                        team_id=t_id, map_id=m_id,
                        time_range=tr, data_type=dt,
                        matches=matches, wins=wins, win_rate=win_rate,
                        ct_win_rate=max(10.0, min(90.0, row[3] + wr_fluctuation/2)), 
                        t_win_rate=max(10.0, min(90.0, row[4] + wr_fluctuation/2)),
                        pistol_win_rate_ct=row[5], pistol_win_rate_t=row[6]
                    ))
    
    # 5. Insert H2H Records
    logger.info("Updating Head-to-Head records...")
    base_h2h = {
        "NAVI": {
            "FaZe": {"Ancient": [3, 2], "Dust2": [1, 2], "Inferno": [2, 1], "Mirage": [5, 3], "Nuke": [4, 2], "Anubis": [3, 1], "Overpass": [2, 1], "Vertigo": [0, 1], "Train": [1, 1]},
            "Spirit": {"Ancient": [1, 2], "Dust2": [0, 3], "Inferno": [1, 0], "Mirage": [3, 4], "Nuke": [2, 2], "Anubis": [1, 4], "Overpass": [1, 1], "Vertigo": [0, 0], "Train": [0, 1]},
            "G2": {"Ancient": [3, 1], "Dust2": [1, 2], "Inferno": [3, 2], "Mirage": [4, 2], "Nuke": [3, 1], "Anubis": [2, 0], "Overpass": [1, 1], "Vertigo": [1, 0], "Train": [2, 0]},
            "Vitality": {"Ancient": [1, 1], "Dust2": [2, 1], "Inferno": [2, 2], "Mirage": [3, 3], "Nuke": [4, 1], "Anubis": [2, 3], "Overpass": [1, 0], "Vertigo": [0, 1], "Train": [1, 0]}
        },
        "FaZe": {
            "Spirit": {"Ancient": [1, 1], "Dust2": [1, 2], "Inferno": [1, 0], "Mirage": [2, 3], "Nuke": [1, 2], "Anubis": [0, 2], "Overpass": [1, 0], "Vertigo": [0, 1], "Train": [1, 1]},
            "G2": {"Ancient": [2, 2], "Dust2": [2, 3], "Inferno": [3, 2], "Mirage": [3, 2], "Nuke": [2, 3], "Anubis": [1, 0], "Overpass": [2, 1], "Vertigo": [1, 0], "Train": [1, 2]},
            "Vitality": {"Ancient": [2, 0], "Dust2": [1, 2], "Inferno": [2, 3], "Mirage": [3, 4], "Nuke": [2, 2], "Anubis": [1, 3], "Overpass": [2, 1], "Vertigo": [1, 1], "Train": [1, 1]}
        }
    }

    for tr in time_ranges:
        for dt in data_types:
            random.seed(f"{tr}_{dt}_h2h")
            for tA, opps in base_h2h.items():
                for tB, maps in opps.items():
                    for m_id, result in maps.items():
                        multiplier = 1.0
                        if tr == "3m": multiplier = 0.2
                        elif tr == "6m": multiplier = 0.5
                        elif tr == "all": multiplier = 1.2
                        
                        wins_a = max(0, int(result[0] * multiplier) + random.randint(0, 1))
                        wins_b = max(0, int(result[1] * multiplier) + random.randint(0, 1))

                        db.add(models.H2HRecord(
                            team_a_id=tA,
                            team_b_id=tB,
                            map_id=m_id,
                            time_range=tr,
                            data_type=dt,
                            wins_a=wins_a,
                            wins_b=wins_b
                        ))

    db.commit()
    logger.info("Data update complete!")

if __name__ == "__main__":
    # Drop all tables first to ensure schema updates (like adding new columns) are applied
    models.Base.metadata.drop_all(bind=engine)
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        fetch_and_update_data(db)
    finally:
        db.close()
