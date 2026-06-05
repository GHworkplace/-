import { getH2H, TEAMS } from './teamsData.js';

// Get active steps based on BO format
// Team A represents the higher seed (chooses sides first or goes first)
export function getBPSteps(format) {
  if (format === 'BO1') {
    return [
      { stepNum: 1, actor: 'A', type: 'ban', label: 'Team A 禁用第一张图' },
      { stepNum: 2, actor: 'A', type: 'ban', label: 'Team A 禁用第二张图' },
      { stepNum: 3, actor: 'B', type: 'ban', label: 'Team B 禁用第一张图' },
      { stepNum: 4, actor: 'B', type: 'ban', label: 'Team B 禁用第二张图' },
      { stepNum: 5, actor: 'B', type: 'ban', label: 'Team B 禁用第三张图' },
      { stepNum: 6, actor: 'A', type: 'ban', label: 'Team A 禁用第三张图' },
      { stepNum: 7, actor: 'B', type: 'side', label: 'Team B 选择起始阵营' } // Remaining map side selection
    ];
  } else if (format === 'BO3') {
    return [
      { stepNum: 1, actor: 'A', type: 'ban', label: 'Team A 禁用第一张图' },
      { stepNum: 2, actor: 'B', type: 'ban', label: 'Team B 禁用第一张图' },
      { stepNum: 3, actor: 'A', type: 'pick', label: 'Team A 选择图一' },
      { stepNum: 4, actor: 'B', type: 'side', label: 'Team B 选择图一起始阵营' },
      { stepNum: 5, actor: 'B', type: 'pick', label: 'Team B 选择图二' },
      { stepNum: 6, actor: 'A', type: 'side', label: 'Team A 选择图二起始阵营' },
      { stepNum: 7, actor: 'B', type: 'ban', label: 'Team B 禁用第二张图' },
      { stepNum: 8, actor: 'A', type: 'ban', label: 'Team A 禁用第二张图' },
      { stepNum: 9, actor: 'B', type: 'side', label: 'Team B 选择决胜图起始阵营' } // Decider side selection
    ];
  } else { // BO5
    return [
      { stepNum: 1, actor: 'A', type: 'ban', label: 'Team A 禁用第一张图' },
      { stepNum: 2, actor: 'B', type: 'ban', label: 'Team B 禁用第一张图' },
      { stepNum: 3, actor: 'A', type: 'pick', label: 'Team A 选择图一' },
      { stepNum: 4, actor: 'B', type: 'side', label: 'Team B 选择图一起始阵营' },
      { stepNum: 5, actor: 'B', type: 'pick', label: 'Team B 选择图二' },
      { stepNum: 6, actor: 'A', type: 'side', label: 'Team A 选择图二起始阵营' },
      { stepNum: 7, actor: 'A', type: 'pick', label: 'Team A 选择图三' },
      { stepNum: 8, actor: 'B', type: 'side', label: 'Team B 选择图三起始阵营' },
      { stepNum: 9, actor: 'B', type: 'pick', label: 'Team B 选择图四' },
      { stepNum: 10, actor: 'A', type: 'side', label: 'Team A 选择图四起始阵营' },
      { stepNum: 11, actor: 'B', type: 'side', label: 'Team B 选择决胜图起始阵营' } // Decider (Map 5) side selection
    ];
  }
}

// Generate tactical recommendations and strategy scores for each map
export function calculateRecommendations(teamAId, teamBId, currentStep, bannedMaps, pickedMaps, activeMapPool) {
  const teamA = TEAMS.find(t => t.id === teamAId);
  const teamB = TEAMS.find(t => t.id === teamBId);
  if (!teamA || !teamB) return [];

  const actorId = currentStep.actor === 'A' ? teamAId : teamBId;
  const opponentId = currentStep.actor === 'A' ? teamBId : teamAId;
  const actor = currentStep.actor === 'A' ? teamA : teamB;
  const opponent = currentStep.actor === 'A' ? teamB : teamA;

  const availableMaps = activeMapPool.filter(m => !bannedMaps.has(m.id) && !pickedMaps.some(p => p.mapId === m.id));

  if (currentStep.type === 'ban') {
    // Recommendation score for banning a map
    // We want to ban maps where the opponent is extremely strong OR where we are extremely weak.
    return availableMaps.map(map => {
      const actorStats = actor.mapPool[map.id];
      const oppStats = opponent.mapPool[map.id];
      const h2h = getH2H(actorId, opponentId, map.id); // [actorWins, oppWins]
      const h2hWinRate = h2h[0] + h2h[1] > 0 ? (h2h[0] / (h2h[0] + h2h[1])) * 100 : 50;

      // Factors:
      // 1. Opponent winrate on this map (high opponent winrate -> higher ban priority)
      // 2. Actor winrate on this map (low actor winrate -> higher ban priority)
      // 3. H2H performance (low actor h2h winrate -> higher ban priority)
      // 4. Coach style: aggression factor (higher aggression -> bans opponent's absolute best map even if actor is good at it, conservative -> bans actor's absolute worst map first)
      const oppWinWeight = oppStats.winRate;
      const actorWeaknessWeight = 100 - actorStats.winRate;
      const h2hWeight = 100 - h2hWinRate;

      const agg = actor.coachStyle.aggression;
      const score = (oppWinWeight * agg * 1.2) + (actorWeaknessWeight * (1 - agg) * 1.2) + (h2hWeight * 0.2);

      // Construct reasons
      const reasons = [];
      if (oppStats.winRate > 65) reasons.push(`对手在该图极强 (胜率 ${oppStats.winRate}%)`);
      if (actorStats.winRate < 45) reasons.push(`我方在该图薄弱 (胜率 ${actorStats.winRate}%)`);
      if (h2hWinRate < 40 && h2h[0] + h2h[1] > 0) reasons.push(`历史交手处于劣势 (${h2h[0]}胜 ${h2h[1]}负)`);

      if (reasons.length === 0) {
        reasons.push('数据较为平衡，常规禁用备选');
      }

      return {
        mapId: map.id,
        score: Math.round(score),
        reasons: reasons.slice(0, 3)
      };
    }).sort((a, b) => b.score - a.score);

  } else if (currentStep.type === 'pick') {
    // Recommendation score for picking a map
    // We want to pick maps where we have the maximum advantage over the opponent.
    return availableMaps.map(map => {
      const actorStats = actor.mapPool[map.id];
      const oppStats = opponent.mapPool[map.id];
      const h2h = getH2H(actorId, opponentId, map.id);
      const h2hWinRate = h2h[0] + h2h[1] > 0 ? (h2h[0] / (h2h[0] + h2h[1])) * 100 : 50;

      // Factors:
      // 1. Actor winrate
      // 2. Opponent winrate (winrate differential)
      // 3. H2H performance
      // 4. Team form index
      const winDiff = actorStats.winRate - oppStats.winRate;
      const formBonus = actor.formIndex - opponent.formIndex;
      const score = (actorStats.winRate * 0.5) + (winDiff * 0.3) + ((h2hWinRate - 50) * 0.2) + (formBonus * 2);

      const reasons = [];
      if (actorStats.winRate > 70) reasons.push(`我方王牌地图 (胜率 ${actorStats.winRate}%)`);
      if (winDiff > 15) reasons.push(`胜率优势巨大 (我方 ${actorStats.winRate}% vs 对手 ${oppStats.winRate}%)`);
      if (h2hWinRate > 60 && h2h[0] + h2h[1] > 0) reasons.push(`历史交手克制对手 (${h2h[0]}胜 ${h2h[1]}负)`);

      if (reasons.length === 0) {
        reasons.push(`常规选图 (胜率 ${actorStats.winRate}%)`);
      }

      return {
        mapId: map.id,
        score: Math.round(score),
        reasons: reasons.slice(0, 3)
      };
    }).sort((a, b) => b.score - a.score);

  } else if (currentStep.type === 'side') {
    // Recommendation for choosing starting side (CT or T) on a specific map
    // We need to know which map this side selection is for.
    let targetMapId = '';
    if (currentStep.stepNum === 7 && currentStep.actor === 'B' && currentStep.label.includes('BO1')) {
      const rem = activeMapPool.filter(m => !bannedMaps.has(m.id));
      if (rem.length > 0) targetMapId = rem[0].id;
    } else if (currentStep.stepNum === 4) {
      targetMapId = pickedMaps[0]?.mapId;
    } else if (currentStep.stepNum === 6) {
      targetMapId = pickedMaps[1]?.mapId;
    } else if (currentStep.stepNum === 9 || currentStep.stepNum === 11) {
      const rem = activeMapPool.filter(m => !bannedMaps.has(m.id) && !pickedMaps.some(p => p.mapId === m.id));
      if (rem.length > 0) targetMapId = rem[0].id;
    } else if (currentStep.stepNum === 8) {
      targetMapId = pickedMaps[2]?.mapId;
    } else if (currentStep.stepNum === 10) {
      targetMapId = pickedMaps[3]?.mapId;
    }

    // Fallback if not mapped correctly
    if (!targetMapId) {
      const rem = activeMapPool.filter(m => !bannedMaps.has(m.id) && !pickedMaps.some(p => p.mapId === m.id));
      if (rem.length > 0) targetMapId = rem[0].id;
    }

    if (!targetMapId) return [];

    const mapDetail = activeMapPool.find(m => m.id === targetMapId);
    const actorStats = actor.mapPool[targetMapId];
    if (!mapDetail || !actorStats) return [];

    // Calculate score for CT side
    const globalCT = mapDetail.winrateCT;
    const teamCT = actorStats.ctWinRate;
    const ctScore = (globalCT * 0.3) + (teamCT * 0.7);

    // Calculate score for T side
    const globalT = mapDetail.winrateT;
    const teamT = actorStats.tWinRate;
    const tScore = (globalT * 0.3) + (teamT * 0.7);

    const ctReasons = [];
    if (globalCT > 53) ctReasons.push(`地图偏向防守方 (全局 CT 胜率 ${globalCT}%)`);
    if (teamCT > 60) ctReasons.push(`我方防守拿手 (防守胜率 ${teamCT}%)`);
    if (ctReasons.length === 0) ctReasons.push('常规防守起手');

    const tReasons = [];
    if (globalT > 53) tReasons.push(`地图偏向进攻方 (全局 T 胜率 ${globalT}%)`);
    if (teamT > 60) tReasons.push(`我方进攻拿手 (进攻胜率 ${teamT}%)`);
    if (tReasons.length === 0) tReasons.push('常规进攻起手');

    return [
      {
        side: 'CT',
        score: Math.round(ctScore),
        reasons: ctReasons
      },
      {
        side: 'T',
        score: Math.round(tScore),
        reasons: tReasons
      }
    ].sort((a, b) => b.score - a.score);
  }

  return [];
}

// Predict final win rate of the match based on the BP outcome
export function predictMatchOutcome(teamAId, teamBId, pickedMaps, deciderMap, format) {
  const teamA = TEAMS.find(t => t.id === teamAId);
  const teamB = TEAMS.find(t => t.id === teamBId);
  if (!teamA || !teamB) return { teamAProb: 50, teamBProb: 50, mapProbabilities: [] };

  const gameMaps = [...pickedMaps];
  if (format !== 'BO5' || pickedMaps.length < 5) {
    if (deciderMap) {
      gameMaps.push({ mapId: deciderMap, picker: 'decider', sideA: null, sideB: 'CT' });
    }
  }

  const mapProbabilities = gameMaps.map(m => {
    const statsA = teamA.mapPool[m.mapId];
    const statsB = teamB.mapPool[m.mapId];
    const h2h = getH2H(teamAId, teamBId, m.mapId);
    const h2hWinRate = h2h[0] + h2h[1] > 0 ? (h2h[0] / (h2h[0] + h2h[1])) * 100 : 50;

    const winrateFactor = statsA.winRate / (statsA.winRate + statsB.winRate || 1) * 100;
    const formFactor = 50 + (teamA.formIndex - teamB.formIndex) * 5;
    
    let probA = (winrateFactor * 0.5) + (h2hWinRate * 0.3) + (formFactor * 0.2);
    
    if (m.picker === 'A') probA += 3;
    if (m.picker === 'B') probA -= 3;

    probA = Math.max(10, Math.min(90, probA));

    return {
      mapId: m.mapId,
      probA: Math.round(probA),
      probB: Math.round(100 - probA)
    };
  });

  let seriesProbA = 50;
  if (format === 'BO1') {
    seriesProbA = mapProbabilities[0]?.probA || 50;
  } else if (format === 'BO3') {
    const p1 = (mapProbabilities[0]?.probA || 50) / 100;
    const p2 = (mapProbabilities[1]?.probA || 50) / 100;
    const p3 = (mapProbabilities[2]?.probA || 50) / 100;

    const win20 = p1 * p2;
    const win21 = p1 * (1 - p2) * p3 + (1 - p1) * p2 * p3;
    seriesProbA = (win20 + win21) * 100;
  } else if (format === 'BO5') {
    const averageMapProb = mapProbabilities.reduce((acc, curr) => acc + curr.probA, 0) / (mapProbabilities.length || 1);
    seriesProbA = averageMapProb;
  }

  seriesProbA = Math.round(seriesProbA);

  return {
    teamAProb: seriesProbA,
    teamBProb: 100 - seriesProbA,
    mapProbabilities
  };
}
