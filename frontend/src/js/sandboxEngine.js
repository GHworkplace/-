import { TEAMS, MAPS } from './teamsData.js';

// Initialize a new match sandbox session for a map
export function initSandboxSession(teamAId, teamBId, mapId, startSideA) {
  const teamA = TEAMS.find(t => t.id === teamAId);
  const teamB = TEAMS.find(t => t.id === teamBId);
  
  return {
    mapId,
    teamA: {
      id: teamAId,
      name: teamA.name,
      logo: teamA.logo,
      cash: 800, // starting pistol round cash
      lossStreak: 0,
      side: startSideA, // 'CT' or 'T'
      score: 0,
      morale: 0, // range [-5, 5]
      tactic: 'default', // selected tactic
      buyType: 'pistol' // eco, force, buy, awp, pistol
    },
    teamB: {
      id: teamBId,
      name: teamB.name,
      logo: teamB.logo,
      cash: 800,
      lossStreak: 0,
      side: startSideA === 'CT' ? 'T' : 'CT',
      score: 0,
      morale: 0,
      tactic: 'default',
      buyType: 'pistol'
    },
    currentRound: 1,
    roundsHistory: [], // logs of all rounds played
    status: 'active', // 'active', 'ended'
    winnerId: null
  };
}

// Map Tactic Labels to English keys and Chinese descriptions
export const TACTICS = {
  T: [
    { id: 'default', name: '慢节奏控图 (Slow Default)', desc: '控制地图要道，默认架枪，后期抱团爆弹。较克制 Passive Retake。' },
    { id: 'rush', name: '快攻爆发 (Fast Rush)', desc: '第一时速直接拉包点，依靠枪法和第一身位突破。较克制 Aggressive Push。' },
    { id: 'split', name: '夹击包点 (Mid Split)', desc: '多路协同夹击，控制中路后分兵推进。较克制 Default Setup。' }
  ],
  CT: [
    { id: 'default', name: '常规防守 (Default Setup)', desc: '标准的交叉火力防守，拿常规信息。较克制 Slow Default。' },
    { id: 'push', name: '前推拿信息 (Aggressive Push)', desc: '开局道具配合前突前压，获取信息或拿首杀。较克制 Slow Default。' },
    { id: 'retake', name: '主动放包点回防 (Passive Retake)', desc: '包点后撤架枪，丢包点后集结五人打回防。较克制 Fast Rush。' }
  ]
};

// Calculate optimal playstyle tactic and economy buy for the upcoming round
export function getOptimalStrategy(session) {
  const tA = session.teamA;
  const tB = session.teamB;
  
  // Predict opponent's buy type based on their money
  const getPredictedBuy = (team) => {
    if (session.currentRound === 1 || session.currentRound === 13) return 'pistol';
    if (team.cash < 2000) return 'eco';
    if (team.cash >= 2000 && team.cash < 4200) return 'force';
    return 'buy';
  };

  const aPredBuy = getPredictedBuy(tA);
  const bPredBuy = getPredictedBuy(tB);

  const strategies = {};

  // For both A and B, determine their best buy stance and tactic
  [tA, tB].forEach(team => {
    const opp = team === tA ? tB : tA;
    const oppPredBuy = team === tA ? bPredBuy : aPredBuy;
    const isT = team.side === 'T';
    
    // 1. Buy Strategy
    let recommendedBuy = 'buy';
    let buyReason = '';
    if (session.currentRound === 1 || session.currentRound === 13) {
      recommendedBuy = 'pistol';
      buyReason = '手枪局，全员起 800$ 基础装备。';
    } else if (team.cash < 2000) {
      recommendedBuy = 'eco';
      buyReason = '经济崩溃，建议纯 ECO 攒钱，为下一局长枪局做准备。';
    } else if (team.cash >= 2000 && team.cash < 4200) {
      // If opponent is on ECO, we can force or buy lighter
      // If we are close to losing (score match point), we must FORCE
      const scoreDiff = opp.score - team.score;
      if (opp.score >= 11 || scoreDiff >= 3) {
        recommendedBuy = 'force';
        buyReason = '分差较大或对手即将拿到赛点，必须强行起枪（Force Buy）拼死一搏。';
      } else {
        recommendedBuy = 'eco';
        buyReason = '保存实力，建议 ECO 存钱以保证下局拥有 5000$+ 的完全长枪局经济。';
      }
    } else if (team.cash >= 6000) {
      recommendedBuy = 'awp';
      buyReason = '经济极度富余，建议起狙击枪 (AWP) 建立远程威慑。';
    } else {
      recommendedBuy = 'buy';
      buyReason = '经济充足，建议长枪全弹买齐。';
    }

    // 2. Tactic Recommendation based on side and opponent's likely stance
    let recommendedTactic = 'default';
    let tacticReason = '';
    
    if (isT) {
      // We are T
      if (oppPredBuy === 'eco') {
        recommendedTactic = 'split';
        tacticReason = '对手经济局，起夹击包点 (Split) 稳扎稳打，防止被对手双沙鹰或强推近角翻盘。';
      } else if (oppPredBuy === 'force') {
        recommendedTactic = 'default';
        tacticReason = '对手强买局，采用慢节奏控图 (Slow Default) 逼迫对方交道具，抓其前突时机。';
      } else {
        // Opponent is full buy, default is retake or default setup
        // Let's recommend based on our team stats
        recommendedTactic = 'default';
        tacticReason = '常规长枪局，控图默认架枪，伺机爆弹突点。';
      }
    } else {
      // We are CT
      if (oppPredBuy === 'eco') {
        recommendedTactic = 'retake';
        tacticReason = '对手经济局，建议包点后撤防守回防 (Passive Retake)，利用长枪射程优势拉开距离。';
      } else if (oppPredBuy === 'force') {
        recommendedTactic = 'default';
        tacticReason = '常规交叉火力防守，封好包点入口，不给对手抱团突进的机会。';
      } else {
        recommendedTactic = 'push';
        tacticReason = '利用前突拿信息 (Aggressive Push) 打乱对手默认控图节奏，争取首杀优势。';
      }
    }

    strategies[team.id] = {
      buy: recommendedBuy,
      buyReason,
      tactic: recommendedTactic,
      tacticReason
    };
  });

  return strategies;
}

// Auto-determine buy types based on cash and strategy recommendation
function updateBuyType(team, recommendedBuy) {
  const cash = team.cash;
  if (recommendedBuy === 'pistol') return 'pistol';
  if (recommendedBuy === 'eco') return 'eco';
  if (recommendedBuy === 'force') return 'force';
  if (recommendedBuy === 'awp' && cash >= 6000) return 'awp';
  if (cash >= 4200) return 'buy';
  if (cash >= 2500) return 'force';
  return 'eco';
}

// Deduce a single round based on team selections
export function simulateRound(session, tacticsOverride = null) {
  if (session.status === 'ended') return session;

  const rNum = session.currentRound;
  const tA = session.teamA;
  const tB = session.teamB;
  const map = MAPS.find(m => m.id === session.mapId);

  // 1. Determine tactical strategies (allow user override, otherwise use recommended optimal)
  const recommendations = getOptimalStrategy(session);
  
  const tacticA = (tacticsOverride && tacticsOverride.teamA?.tactic) || recommendations[tA.id].tactic;
  const tacticB = (tacticsOverride && tacticsOverride.teamB?.tactic) || recommendations[tB.id].tactic;
  tA.tactic = tacticA;
  tB.tactic = tacticB;

  const buyA = (tacticsOverride && tacticsOverride.teamA?.buy) || recommendations[tA.id].buy;
  const buyB = (tacticsOverride && tacticsOverride.teamB?.buy) || recommendations[tB.id].buy;
  tA.buyType = updateBuyType(tA, buyA);
  tB.buyType = updateBuyType(tB, buyB);

  // 2. Subtract equipment costs from economy
  const spendCash = (team) => {
    let cost = 0;
    if (team.buyType === 'eco') cost = 1000;
    else if (team.buyType === 'force') cost = 2200;
    else if (team.buyType === 'buy') cost = 4200;
    else if (team.buyType === 'awp') cost = 6000;
    else if (team.buyType === 'pistol') cost = 0; // standard pistol loadout is free
    
    team.cash = Math.max(0, team.cash - cost);
  };
  spendCash(tA);
  spendCash(tB);

  // 3. Probability Calculation
  const statsA = TEAMS.find(t => t.id === tA.id).mapPool[session.mapId];
  const statsB = TEAMS.find(t => t.id === tB.id).mapPool[session.mapId];

  // Base win rates:
  const baseRateA = tA.side === 'CT' ? statsA.ctWinRate : statsA.tWinRate;
  const baseRateB = tB.side === 'CT' ? statsB.ctWinRate : statsB.tWinRate;
  
  let winProbA = baseRateA / (baseRateA + baseRateB || 1) * 100;
  
  // Global map side bias
  const mapSideFactor = tA.side === 'CT' ? map.winrateCT - 50 : map.winrateT - 50;
  winProbA += mapSideFactor * 0.5;

  // Pistol round overrides
  const isPistol = rNum === 1 || rNum === 13 || rNum === 25; // 25 is OT start
  if (isPistol) {
    const pistolRateA = tA.side === 'CT' ? statsA.pistolWinRateCT : statsA.pistolWinRateT;
    const pistolRateB = tB.side === 'CT' ? statsB.pistolWinRateCT : statsB.pistolWinRateT;
    winProbA = pistolRateA / (pistolRateA + pistolRateB || 1) * 100;
  }

  // Weapon purchase modifiers
  const getBuyWeight = (buy) => {
    if (buy === 'eco') return 1;
    if (buy === 'force') return 3;
    if (buy === 'buy') return 5;
    if (buy === 'awp') return 6;
    if (buy === 'pistol') return 2;
    return 3;
  };
  const buyWeightA = getBuyWeight(tA.buyType);
  const buyWeightB = getBuyWeight(tB.buyType);
  
  if (!isPistol) {
    // If one team has a major weapon advantage
    const weaponDiff = buyWeightA - buyWeightB;
    winProbA += weaponDiff * 12; // E.g., Full Buy (5) vs Eco (1) adds +48% win probability for A
  }

  // Tactic Counters Modifiers
  // T Tactics: default, rush, split
  // CT Tactics: default, push, retake
  const tTeam = tA.side === 'T' ? tA : tB;
  const ctTeam = tA.side === 'CT' ? tA : tB;

  let tacticAdvantage = 0; // from T's perspective
  if (tTeam.tactic === 'rush' && ctTeam.tactic === 'push') tacticAdvantage = 12;  // rush counters pushing CTs
  else if (tTeam.tactic === 'rush' && ctTeam.tactic === 'retake') tacticAdvantage = -10; // passive retake holds rush easily
  else if (tTeam.tactic === 'default' && ctTeam.tactic === 'retake') tacticAdvantage = 10; // slow default punishes passive retake
  else if (tTeam.tactic === 'default' && ctTeam.tactic === 'push') tacticAdvantage = -10; // aggressive CT push catches defaults
  else if (tTeam.tactic === 'split' && ctTeam.tactic === 'default') tacticAdvantage = 8;
  
  winProbA += tA.side === 'T' ? tacticAdvantage : -tacticAdvantage;

  // Morale/Confidence factor
  winProbA += (tA.morale - tB.morale) * 1.5;

  // Boundary check
  winProbA = Math.max(5, Math.min(95, winProbA));

  // 4. Roll the dice to determine winner
  const roll = Math.random() * 100;
  const isWinnerA = roll <= winProbA;
  const winner = isWinnerA ? tA : tB;
  const loser = isWinnerA ? tB : tA;

  // 5. Update round stats, score, loss streaks
  winner.score += 1;
  winner.lossStreak = 0;
  winner.morale = Math.min(5, winner.morale + 1);
  
  loser.lossStreak += 1;
  loser.morale = Math.max(-5, loser.morale - 1);

  // 6. Economy Reward payouts
  // Win payout: +3250 base
  winner.cash = Math.min(16000, winner.cash + 3250);

  // Loss payout (loss bonus streak):
  // 1 loss: 1400, 2 losses: 1900, 3 losses: 2400, 4 losses: 2900, 5+ losses: 3400
  const getLossPayout = (streak) => {
    if (streak <= 1) return 1400;
    if (streak === 2) return 1900;
    if (streak === 3) return 2400;
    if (streak === 4) return 2900;
    return 3400;
  };
  loser.cash = Math.min(16000, loser.cash + getLossPayout(loser.lossStreak));

  // 7. Generate commentary text narrative
  const generateNarrative = (winnerTeam, loserTeam, isPistolRound, tId) => {
    const wName = winnerTeam.id;
    const lName = loserTeam.id;
    const side = winnerTeam.side;
    
    // Choose tactical verbs based on tactic selected
    const tactic = winnerTeam.tactic;
    
    const pistolLogs = [
      `${wName} 在手枪局中打出精彩的A包点突袭，稳稳拿下首回合！`,
      `${wName} 作为防守方，利用精妙的双人抱团点射成功遏制了对手的手枪局强攻。`,
      `手枪局开启！${wName} 核心选手点射双杀，帮助队伍占领包点并拆毁炸弹。`
    ];

    const ecoWins = [
      `爆冷！${wName} 在全员沙鹰/微冲的经济局（Eco）中打出惊天前推翻盘！`,
      `${wName} 依靠精准的强手枪配合，成功在经济局缴获了对手两把长枪，完成翻盘！`
    ];

    const defaultLogs = [
      `${wName} 依靠完美的枪法和长枪火力，稳健地控图并收下本回合。`,
      `${wName} 在默认战术对决中取得了地图中段控制权，稳扎稳打拿下回合。`,
      `残局博弈！${wName} 凭借更丰富的纪律经验，成功拿下关键局。`
    ];

    const rushLogs = [
      `${wName} 展开了令人猝不及防的闪电式B区快攻，防守方来不及组织防线，回合瞬间结束！`,
      `${wName} 直接抱团提速，突破手大显身手打出双杀，拿下回合。`
    ];

    const pushLogs = [
      `${wName} 在防守端开局直接前压，出其不意地打掉了对方默认控图的单兵，滚雪球拿下。`,
      `${wName} 封烟反推，突破手双杀前推掌握局势。`
    ];

    const retakeLogs = [
      `${wName} 采用经典的放包点回防策略，集结五名队员道具同步覆盖，干净利落地完成了回防拆弹！`
    ];

    if (isPistolRound) {
      return pistolLogs[Math.floor(Math.random() * pistolLogs.length)];
    }
    if (winnerTeam.buyType === 'eco' && loserTeam.buyType !== 'eco') {
      return ecoWins[Math.floor(Math.random() * ecoWins.length)];
    }
    if (tactic === 'rush') {
      return rushLogs[Math.floor(Math.random() * rushLogs.length)];
    }
    if (tactic === 'push') {
      return pushLogs[Math.floor(Math.random() * pushLogs.length)];
    }
    if (tactic === 'retake') {
      return retakeLogs[Math.floor(Math.random() * retakeLogs.length)];
    }
    return defaultLogs[Math.floor(Math.random() * defaultLogs.length)];
  };

  const narrativeLog = generateNarrative(winner, loser, isPistol, winner.id);

  // 8. Record in history
  const roundRecord = {
    roundNum: rNum,
    winnerId: winner.id,
    scoreA: tA.score,
    scoreB: tB.score,
    probA: Math.round(winProbA),
    probB: Math.round(100 - winProbA),
    buyTypeA: tA.buyType,
    buyTypeB: tB.buyType,
    cashA: tA.cash,
    cashB: tB.cash,
    tacticA: tA.tactic,
    tacticB: tB.tactic,
    narrative: narrativeLog
  };
  session.roundsHistory.push(roundRecord);

  // 9. End round swaps and Game End logic
  // Swap sides at round 12 (MR12)
  if (rNum === 12) {
    const sideA = tA.side;
    tA.side = tB.side;
    tB.side = sideA;
    // Reset cash to 800 for the second half pistol
    tA.cash = 800;
    tB.cash = 800;
    tA.lossStreak = 0;
    tB.lossStreak = 0;
    session.roundsHistory.push({ type: 'system', narrative: '=== 下半场开始，双方阵营互换，手枪局重置 ===' });
  }

  // End of normal game check (first to 13 wins, unless 12-12)
  const hasWinner = (tA.score >= 13 && tA.score - tB.score >= 2) || (tB.score >= 13 && tB.score - tA.score >= 2);
  const isTie = tA.score === 12 && tB.score === 12;

  if (hasWinner) {
    session.status = 'ended';
    session.winnerId = tA.score > tB.score ? tA.id : tB.id;
    session.roundsHistory.push({ type: 'system', narrative: `🏆 比赛结束！最终比分: ${tA.name} ${tA.score} - ${tB.score} ${tB.name}。胜利者为 ${tA.score > tB.score ? tA.name : tB.name}。` });
  } else if (isTie) {
    // Overtime start (OT MR3)
    session.roundsHistory.push({ type: 'system', narrative: '=== 比分 12-12！进入加时赛 (Overtime MR3)，双方重置经济 10000$ ===' });
    tA.cash = 10000;
    tB.cash = 10000;
    tA.lossStreak = 0;
    tB.lossStreak = 0;
  }

  // For Overtime MR3 swap check (every 3 rounds in OT)
  if (rNum > 24) {
    const otRounds = rNum - 24;
    if (otRounds % 3 === 0 && !hasWinner) {
      const sideA = tA.side;
      tA.side = tB.side;
      tB.side = sideA;
      tA.cash = 10000;
      tB.cash = 10000;
      tA.lossStreak = 0;
      tB.lossStreak = 0;
      session.roundsHistory.push({ type: 'system', narrative: '=== 加时赛半场结束，阵营互换，经济重置 10000$ ===' });
    }

    // Overtime end conditions (e.g. first to reach 16, 19 etc.)
    // OT is played until a team wins by 2.
    const otHalf = Math.floor((otRounds - 1) / 6);
    const targetScore = 13 + (otHalf + 1) * 3; // 16, 19, etc.
    const hasOTWinner = (tA.score >= targetScore && tA.score - tB.score >= 2) || (tB.score >= targetScore && tB.score - tA.score >= 2);
    
    if (hasOTWinner) {
      session.status = 'ended';
      session.winnerId = tA.score > tB.score ? tA.id : tB.id;
      session.roundsHistory.push({ type: 'system', narrative: `🏆 加时赛结束！最终比分: ${tA.name} ${tA.score} - ${tB.score} ${tB.name}。` });
    }
  }

  session.currentRound += 1;
  return session;
}

// Simulate an entire map in one click
export function simulateEntireMap(session) {
  let safety = 0;
  while (session.status === 'active' && safety < 100) {
    simulateRound(session);
    safety++;
  }
  return session;
}
