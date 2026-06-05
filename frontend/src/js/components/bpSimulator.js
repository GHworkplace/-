import { MAPS, TEAMS } from '../teamsData.js';
import { getBPSteps, calculateRecommendations, predictMatchOutcome } from '../bpEngine.js';

export function renderBPSimulator(container, state, onStateChange) {
  const teamA = TEAMS.find(t => t.id === state.selectedTeamA) || TEAMS[0];
  const teamB = TEAMS.find(t => t.id === state.selectedTeamB) || TEAMS[1];

  const activeMaps = MAPS.filter(m => m.isDefault || state.includeOptionalMaps);
  
  // Initialize BP state if not already done, or if teams changed
  if (!state.bpSession || state.bpSession.teamAId !== teamA.id || state.bpSession.teamBId !== teamB.id || state.bpSession.format !== state.bpFormat || state.bpSession.totalMapsCount !== activeMaps.length) {
    initBPSession(state, teamA.id, teamB.id, activeMaps, onStateChange);
    return;
  }

  const session = state.bpSession;
  const currentStep = session.steps[session.currentStepIndex];
  const isCompleted = session.currentStepIndex >= session.steps.length;

  // Calculate prediction win rates based on current BP state
  const prediction = predictMatchOutcome(teamA.id, teamB.id, session.pickedMaps, session.deciderMap, session.format);

  // Calculate current AI recommendation
  let recommendations = [];
  if (!isCompleted) {
    recommendations = calculateRecommendations(teamA.id, teamB.id, currentStep, session.bannedMaps, session.pickedMaps, activeMaps);
  }

  let html = `
    <!-- Top Header Settings Row -->
    <div class="bp-settings-row glass-card">
      <div class="setting-item">
        <label>赛制模式 (Format):</label>
        <select id="bp-format-select" class="tactical-select width-small">
          <option value="BO1" ${session.format === 'BO1' ? 'selected' : ''}>BO1 (一局定胜负)</option>
          <option value="BO3" ${session.format === 'BO3' ? 'selected' : ''}>BO3 (三局二胜)</option>
          <option value="BO5" ${session.format === 'BO5' ? 'selected' : ''}>BO5 (五局三胜)</option>
        </select>
      </div>

      <div class="setting-item-right">
        <button id="bp-reset-btn" class="tactical-btn secondary">🔄 重置 BP 流程</button>
      </div>
    </div>

    <!-- Matchup Probability Overview -->
    <div class="bp-matchup-row">
      <!-- Team A Card -->
      <div class="bp-team-card team-a ${!isCompleted && currentStep.actor === 'A' ? 'active-turn' : ''}">
        <span class="team-logo-xl">${teamA.logo}</span>
        <div class="team-details">
          <h2 class="team-name-xl">${teamA.name}</h2>
          <div class="team-badge">HLTV #${teamA.rank} | 状态: ${teamA.formIndex}</div>
          <div class="coach-bubble">教练风格: ${teamA.coachStyle.description.slice(0, 20)}...</div>
        </div>
      </div>

      <!-- Center Win Prob Board (Dynamic SVG circular arc / glow) -->
      <div class="bp-winrate-board glass-card">
        <div class="winrate-title">对局系列赛胜率预测</div>
        <div class="winrate-figures">
          <span class="winrate-val score-a-color">${prediction.teamAProb}%</span>
          <span class="winrate-vs">VS</span>
          <span class="winrate-val score-b-color">${prediction.teamBProb}%</span>
        </div>
        <div class="winrate-bar-container">
          <div class="winrate-bar-fill ct" style="width: ${prediction.teamAProb}%"></div>
          <div class="winrate-bar-fill t" style="width: ${prediction.teamBProb}%"></div>
        </div>
        <div class="winrate-footer-decider">
          ${session.deciderMap ? `决胜图: <strong class="glow-text text-green">${session.deciderMap}</strong>` : '决胜图: 待定'}
        </div>
      </div>

      <!-- Team B Card -->
      <div class="bp-team-card team-b ${!isCompleted && currentStep.actor === 'B' ? 'active-turn' : ''}">
        <span class="team-logo-xl">${teamB.logo}</span>
        <div class="team-details">
          <h2 class="team-name-xl">${teamB.name}</h2>
          <div class="team-badge">HLTV #${teamB.rank} | 状态: ${teamB.formIndex}</div>
          <div class="coach-bubble">教练风格: ${teamB.coachStyle.description.slice(0, 20)}...</div>
        </div>
      </div>
    </div>

    <!-- What-if Comparison Notification if in What-if mode -->
    ${state.whatIfActive ? renderWhatIfComparisonPanel(state, activeMaps) : ''}

    <!-- Main BP workspace layout -->
    <div class="bp-workspace-grid">
      <!-- Left Column: Timeline & Map wall -->
      <div class="bp-left-column">
        <!-- BP Map Cards Grid -->
        <div class="glass-card panel">
          <h3 class="panel-title">🗺️ 选择地图池 (点击执行 ${!isCompleted ? currentStep.type === 'ban' ? '禁用 BAN' : '选择 PICK' : '查看'})</h3>
          <div class="bp-maps-grid">
            ${activeMaps.map(map => renderMapCard(map, session, teamA, teamB, isCompleted, currentStep)).join('')}
          </div>
        </div>

        <!-- Timeline -->
        <div class="glass-card panel margin-top">
          <h3 class="panel-title">🕒 BP 流程时间线 (点击过去步骤可开启 What-if 备选推演)</h3>
          <div class="bp-timeline">
            ${session.steps.map((step, idx) => renderTimelineStep(step, idx, session)).join('')}
          </div>
        </div>
      </div>

      <!-- Right Column: AI Strategy Recommendations & Sidebar -->
      <div class="bp-right-column">
        <div class="glass-card panel fill-height">
          <h3 class="panel-title glow-text text-green">💡 AI 最优 Pick/Ban 策略推荐</h3>
          
          ${isCompleted ? `
            <div class="bp-completed-placeholder">
              <span class="completed-trophy">🏆</span>
              <h4>BP 阶段已圆满结束！</h4>
              <p>地图池选取和阵营对抗均已敲定。</p>
              <div class="action-box">
                <button id="bp-import-sandbox-btn" class="tactical-btn primary">🎮 导入战术沙盘推演</button>
              </div>
            </div>
          ` : `
            <div class="recommendation-step-info">
              当前回合: <strong class="glow-text">${currentStep.label}</strong>
              <div class="actor-badge ${currentStep.actor === 'A' ? 'a' : 'b'}">
                执行方: ${currentStep.actor === 'A' ? teamA.name : teamB.name} (${currentStep.type === 'ban' ? 'BAN 禁图' : 'PICK 选图'})
              </div>
            </div>

            <div class="recommendations-list">
              ${recommendations.map((rec, idx) => renderRecommendationItem(rec, idx, currentStep, activeMaps)).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Bind Events
  bindSimulatorEvents(container, state, onStateChange, activeMaps, teamA, teamB, recommendations, isCompleted, currentStep);
}

// Initialize a new BP session
function initBPSession(state, teamAId, teamBId, activeMaps, onStateChange) {
  const steps = getBPSteps(state.bpFormat || 'BO3');
  const session = {
    format: state.bpFormat || 'BO3',
    teamAId,
    teamBId,
    totalMapsCount: activeMaps.length,
    steps,
    currentStepIndex: 0,
    bannedMaps: new Set(),
    pickedMaps: [], // Array of { mapId, picker, sideA, sideB }
    deciderMap: null,
    history: [] // State history logs
  };
  
  onStateChange({
    bpSession: session,
    whatIfActive: false,
    whatIfBranchPoint: -1,
    whatIfSession: null
  });
}

// Renders individual map card with their statuses
function renderMapCard(map, session, teamA, teamB, isCompleted, currentStep) {
  const isBanned = session.bannedMaps.has(map.id);
  const pickedIndex = session.pickedMaps.findIndex(p => p.mapId === map.id);
  const isPicked = pickedIndex !== -1;
  const isDecider = session.deciderMap === map.id;
  
  let statusClass = 'available';
  let badgeText = '';
  
  if (isBanned) {
    statusClass = 'banned';
    // Find who banned it
    const hist = session.history.find(h => h.type === 'ban' && h.mapId === map.id);
    badgeText = hist ? `Banned by ${hist.actor === 'A' ? 'A' : 'B'}` : 'Banned';
  } else if (isPicked) {
    statusClass = 'picked';
    const pick = session.pickedMaps[pickedIndex];
    badgeText = `Pick Map ${pickedIndex + 1} (${pick.picker === 'A' ? 'A' : 'B'})`;
  } else if (isDecider) {
    statusClass = 'decider';
    badgeText = 'Decider (决胜图)';
  }

  const statsA = teamA.mapPool[map.id];
  const statsB = teamB.mapPool[map.id];

  // Disable actions if completed or map is already taken
  const isDisabled = isCompleted || isBanned || isPicked || isDecider || currentStep.type === 'side';

  return `
    <div class="bp-map-card ${statusClass} ${isDisabled ? 'disabled' : ''}" data-map-id="${map.id}">
      <div class="card-bg-mask"></div>
      <div class="map-card-header">
        <span class="map-card-code">${map.code}</span>
        <span class="map-card-name">${map.name}</span>
      </div>
      <div class="map-card-badge">${badgeText}</div>
      
      <!-- Compare Win Rates inside map card -->
      <div class="map-card-stats">
        <div class="stat-row">
          <span class="lbl">${teamA.logo} A胜率</span>
          <span class="val bold">${statsA ? statsA.winRate : 0}%</span>
        </div>
        <div class="stat-row">
          <span class="lbl">${teamB.logo} B胜率</span>
          <span class="val bold">${statsB ? statsB.winRate : 0}%</span>
        </div>
        <div class="map-side-balance">
          CT ${map.winrateCT}% / T ${map.winrateT}%
        </div>
      </div>
    </div>
  `;
}

// Renders step in the timeline
function renderTimelineStep(step, idx, session) {
  const isActive = idx === session.currentStepIndex;
  const isPast = idx < session.currentStepIndex;
  
  let stepText = step.label;
  let statusClass = 'upcoming';

  if (isActive) {
    statusClass = 'active';
  } else if (isPast) {
    statusClass = 'past';
    const hist = session.history[idx];
    if (hist) {
      if (hist.type === 'ban') {
        stepText = `${hist.actor === 'A' ? 'Team A' : 'Team B'} <strong class="text-red">Banned</strong> ${hist.mapId}`;
      } else if (hist.type === 'pick') {
        stepText = `${hist.actor === 'A' ? 'Team A' : 'Team B'} <strong class="text-blue">Picked</strong> ${hist.mapId}`;
      } else if (hist.type === 'side') {
        const sideA = hist.side;
        const sideB = sideA === 'CT' ? 'T' : 'CT';
        stepText = `${hist.actor === 'A' ? 'Team A' : 'Team B'} 选边: ${hist.actor === 'A' ? 'A方' : 'B方'}为 ${sideA}`;
      }
    }
  }

  return `
    <div class="timeline-step ${statusClass}" data-step-idx="${idx}">
      <span class="timeline-dot"></span>
      <span class="timeline-text">${stepText}</span>
    </div>
  `;
}

// Renders AI Strategy Recommendation List Item
function renderRecommendationItem(rec, idx, currentStep, activeMaps) {
  const isRecommend = idx === 0;
  
  if (currentStep.type === 'side') {
    // Recommendation for Side selection
    return `
      <div class="rec-item ${isRecommend ? 'best-choice' : ''}" data-side="${rec.side}">
        <div class="rec-header">
          <span class="rec-rank-badge">${idx + 1}</span>
          <span class="rec-title">选择 ${rec.side === 'CT' ? '🛡️ 防守方 (CT)' : '⚔️ 进攻方 (T)'}</span>
          <span class="rec-score-badge">推荐指数: ${rec.score}%</span>
        </div>
        <ul class="rec-reasons">
          ${rec.reasons.map(r => `<li>• ${r}</li>`).join('')}
        </ul>
        <button class="tactical-btn apply-rec-btn primary" data-idx="${idx}">采纳推荐</button>
      </div>
    `;
  }

  const map = activeMaps.find(m => m.id === rec.mapId);

  return `
    <div class="rec-item ${isRecommend ? 'best-choice' : ''}" data-map-id="${rec.mapId}">
      <div class="rec-header">
        <span class="rec-rank-badge">${idx + 1}</span>
        <span class="rec-title">${currentStep.type === 'ban' ? '🚫 建议禁用' : '✅ 建议选择'} ${map.name}</span>
        <span class="rec-score-badge">推荐指数: ${rec.score}%</span>
      </div>
      <ul class="rec-reasons">
        ${rec.reasons.map(r => `<li>• ${r}</li>`).join('')}
      </ul>
      <button class="tactical-btn apply-rec-btn primary" data-idx="${idx}">采纳推荐</button>
    </div>
  `;
}

// Renders the comparative panel when What-if is active
function renderWhatIfComparisonPanel(state, activeMaps) {
  const session = state.bpSession;
  const whatIf = state.whatIfSession;
  const teamA = TEAMS.find(t => t.id === session.teamAId);
  const teamB = TEAMS.find(t => t.id === session.teamBId);

  const origPrediction = predictMatchOutcome(teamA.id, teamB.id, session.pickedMaps, session.deciderMap, session.format);
  const altPrediction = predictMatchOutcome(teamA.id, teamB.id, whatIf.pickedMaps, whatIf.deciderMap, whatIf.format);

  const origMaps = session.pickedMaps.map(m => m.mapId).concat(session.deciderMap ? [session.deciderMap] : []);
  const altMaps = whatIf.pickedMaps.map(m => m.mapId).concat(whatIf.deciderMap ? [whatIf.deciderMap] : []);

  return `
    <div class="whatif-comparison-panel glass-card">
      <div class="whatif-header glow-text text-orange">💡 WHAT-IF 模拟决策对比</div>
      <div class="whatif-comparison-grid">
        <!-- Original Path Column -->
        <div class="whatif-col orig">
          <h4 class="whatif-col-title">📍 原始决策路径 (最终胜率)</h4>
          <div class="comparison-winrate-box">
            <span>${teamA.logo} ${origPrediction.teamAProb}%</span>
            <span>:</span>
            <span>${origPrediction.teamBProb}% ${teamB.logo}</span>
          </div>
          <div class="comparison-maps-list">
            地图池: ${origMaps.map(mId => `<span class="map-tag">${mId}</span>`).join(' ')}
          </div>
        </div>

        <!-- Alternate Path Column -->
        <div class="whatif-col alt">
          <h4 class="whatif-col-title">🧪 备选分支决策 (最终胜率)</h4>
          <div class="comparison-winrate-box">
            <span class="text-green">${teamA.logo} ${altPrediction.teamAProb}%</span>
            <span>:</span>
            <span class="text-green">${altPrediction.teamBProb}% ${teamB.logo}</span>
          </div>
          <div class="comparison-maps-list">
            地图池: ${altMaps.map(mId => `<span class="map-tag alternate-glow">${mId}</span>`).join(' ')}
          </div>
        </div>
      </div>

      <!-- Analysis description -->
      <div class="whatif-analysis-text">
        <strong>差异分析：</strong>
        相比原始决策，若在第 <strong>${state.whatIfBranchPoint + 1}</strong> 步换选，${teamA.name} 的总胜率变化了 
        <strong class="${altPrediction.teamAProb >= origPrediction.teamAProb ? 'text-green' : 'text-red'}">
          ${(altPrediction.teamAProb - origPrediction.teamAProb).toFixed(1)}%
        </strong>。
        ${altPrediction.teamAProb >= origPrediction.teamAProb 
          ? '备选决策能有效扩充我方的地图池优势，规避对手的强项图。' 
          : '这会导致决胜图滑向对手的拿手地图，减少我方的胜率空间。'}
      </div>

      <div class="whatif-actions">
        <button id="whatif-apply-btn" class="tactical-btn primary glow-btn-green">✔️ 应用此 What-if 分支</button>
        <button id="whatif-cancel-btn" class="tactical-btn secondary">❌ 退出 What-if 推演</button>
      </div>
    </div>
  `;
}

// Binds simulator element event listeners
function bindSimulatorEvents(container, state, onStateChange, activeMaps, teamA, teamB, recommendations, isCompleted, currentStep) {
  // Format selector change
  const formatSelect = container.querySelector('#bp-format-select');
  if (formatSelect) {
    formatSelect.addEventListener('change', (e) => {
      onStateChange({ bpFormat: e.target.value });
    });
  }

  // Reset button
  container.querySelector('#bp-reset-btn').addEventListener('click', () => {
    initBPSession(state, teamA.id, teamB.id, activeMaps, onStateChange);
  });

  // Adopt Recommendation
  const adoptRecBtns = container.querySelectorAll('.apply-rec-btn');
  adoptRecBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      const rec = recommendations[idx];
      if (currentStep.type === 'side') {
        applyBPAction(state, { type: 'side', side: rec.side }, activeMaps, onStateChange);
      } else {
        applyBPAction(state, { type: currentStep.type, mapId: rec.mapId }, activeMaps, onStateChange);
      }
    });
  });

  // Clicking map card to Ban/Pick directly
  const mapCards = container.querySelectorAll('.bp-map-card:not(.disabled)');
  mapCards.forEach(card => {
    card.addEventListener('click', () => {
      const mapId = card.getAttribute('data-map-id');
      if (currentStep && currentStep.type !== 'side') {
        applyBPAction(state, { type: currentStep.type, mapId }, activeMaps, onStateChange);
      }
    });
  });

  // Clicking past timeline step for What-if trigger
  const timelineSteps = container.querySelectorAll('.timeline-step.past');
  timelineSteps.forEach(step => {
    step.addEventListener('click', () => {
      const stepIdx = parseInt(step.getAttribute('data-step-idx'));
      triggerWhatIfMode(state, stepIdx, activeMaps, onStateChange);
    });
  });

  // What-if Actions
  const applyBranchBtn = container.querySelector('#whatif-apply-btn');
  if (applyBranchBtn) {
    applyBranchBtn.addEventListener('click', () => {
      // Overwrite current BP session with the What-if session
      onStateChange({
        bpSession: JSON.parse(JSON.stringify(state.whatIfSession)),
        whatIfActive: false,
        whatIfBranchPoint: -1,
        whatIfSession: null
      });
    });
  }

  const cancelBranchBtn = container.querySelector('#whatif-cancel-btn');
  if (cancelBranchBtn) {
    cancelBranchBtn.addEventListener('click', () => {
      // Exit what-if mode
      onStateChange({
        whatIfActive: false,
        whatIfBranchPoint: -1,
        whatIfSession: null
      });
    });
  }

  // Import to Sandbox
  const importBtn = container.querySelector('#bp-import-sandbox-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      // Collect maps and start sides to load into sandbox tab
      const session = state.bpSession;
      const finalMaps = session.pickedMaps.map(m => ({
        mapId: m.mapId,
        startSideA: m.picker === 'A' ? (m.sideB === 'CT' ? 'T' : 'CT') : m.sideA || 'CT' // Determine teamA start side
      }));

      if (session.deciderMap) {
        // Find decider side selection step. Decider map sides are chosen by B.
        // Let's check step selection side
        const sideHist = session.history.find(h => h.type === 'side' && h.stepNum === session.steps.length);
        const sideB = sideHist ? sideHist.side : 'CT'; // default side chosen by B
        finalMaps.push({
          mapId: session.deciderMap,
          startSideA: sideB === 'CT' ? 'T' : 'CT' // Team A's side is opposite of B's
        });
      }

      onStateChange({
        activeTab: 'sandbox',
        sandboxMapsToSimulate: finalMaps,
        sandboxCurrentMapIndex: 0,
        sandboxSession: null // trigger reset in sandbox tab
      });
    });
  }
}

// Apply Ban/Pick/Side action to current BP session (or What-if session)
function applyBPAction(state, action, activeMaps, onStateChange) {
  // If in What-if mode, apply action to the What-if session, else apply to the normal session
  const session = state.whatIfActive ? state.whatIfSession : state.bpSession;
  const currentStep = session.steps[session.currentStepIndex];

  // Deep clone session to modify
  const nextSession = JSON.parse(JSON.stringify(session));
  // Re-link bannedMaps Set (JSON parse/stringify drops Set)
  nextSession.bannedMaps = new Set(session.bannedMaps);

  // Apply action
  if (action.type === 'ban') {
    nextSession.bannedMaps.add(action.mapId);
    nextSession.history.push({
      type: 'ban',
      actor: currentStep.actor,
      mapId: action.mapId,
      stepNum: currentStep.stepNum
    });
  } else if (action.type === 'pick') {
    nextSession.pickedMaps.push({
      mapId: action.mapId,
      picker: currentStep.actor,
      sideA: null,
      sideB: null
    });
    nextSession.history.push({
      type: 'pick',
      actor: currentStep.actor,
      mapId: action.mapId,
      stepNum: currentStep.stepNum
    });
  } else if (action.type === 'side') {
    const lastPick = nextSession.pickedMaps[nextSession.pickedMaps.length - 1];
    
    // side selection step
    // In BO3:
    // Step 4: B chooses side for Map 1.
    // Step 6: A chooses side for Map 2.
    // Step 9: B chooses side for decider.
    if (currentStep.stepNum === 4) {
      nextSession.pickedMaps[0].sideB = action.side;
      nextSession.pickedMaps[0].sideA = action.side === 'CT' ? 'T' : 'CT';
    } else if (currentStep.stepNum === 6) {
      nextSession.pickedMaps[1].sideA = action.side;
      nextSession.pickedMaps[1].sideB = action.side === 'CT' ? 'T' : 'CT';
    } else if (currentStep.stepNum === 8 && nextSession.format === 'BO5') {
      nextSession.pickedMaps[2].sideB = action.side;
      nextSession.pickedMaps[2].sideA = action.side === 'CT' ? 'T' : 'CT';
    } else if (currentStep.stepNum === 10 && nextSession.format === 'BO5') {
      nextSession.pickedMaps[3].sideA = action.side;
      nextSession.pickedMaps[3].sideB = action.side === 'CT' ? 'T' : 'CT';
    }

    nextSession.history.push({
      type: 'side',
      actor: currentStep.actor,
      side: action.side,
      stepNum: currentStep.stepNum
    });
  }

  // Increment current step index
  nextSession.currentStepIndex += 1;

  // Auto-fill decider map if we reach the final stage
  const isBansAndPicksComplete = nextSession.pickedMaps.length + nextSession.bannedMaps.size === activeMaps.length - 1;
  const isDeciderNeeded = (nextSession.format === 'BO1' && nextSession.currentStepIndex === 6) ||
                          (nextSession.format === 'BO3' && nextSession.currentStepIndex === 8) ||
                          (nextSession.format === 'BO5' && nextSession.currentStepIndex === 10);
                          
  if (isBansAndPicksComplete && isDeciderNeeded) {
    const remaining = activeMaps.filter(m => !nextSession.bannedMaps.has(m.id) && !nextSession.pickedMaps.some(p => p.mapId === m.id));
    if (remaining.length === 1) {
      nextSession.deciderMap = remaining[0].id;
    }
  }

  if (state.whatIfActive) {
    // We are in what-if mode. Auto-simulate all subsequent steps for the what-if session!
    autoSimulateBPSession(nextSession, activeMaps);
    onStateChange({ whatIfSession: nextSession });
  } else {
    // Normal BP mode
    onStateChange({ bpSession: nextSession });
  }
}

// Auto-simulate the remaining steps of a BP session based on AI recommendations (for What-if evaluations)
function autoSimulateBPSession(session, activeMaps) {
  let safety = 0;
  while (session.currentStepIndex < session.steps.length && safety < 50) {
    const currentStep = session.steps[session.currentStepIndex];
    const recs = calculateRecommendations(session.teamAId, session.teamBId, currentStep, session.bannedMaps, session.pickedMaps, activeMaps);
    
    if (recs.length === 0) break;

    const bestRec = recs[0];
    if (currentStep.type === 'side') {
      const lastPick = session.pickedMaps[session.pickedMaps.length - 1];
      if (currentStep.stepNum === 4) {
        session.pickedMaps[0].sideB = bestRec.side;
        session.pickedMaps[0].sideA = bestRec.side === 'CT' ? 'T' : 'CT';
      } else if (currentStep.stepNum === 6) {
        session.pickedMaps[1].sideA = bestRec.side;
        session.pickedMaps[1].sideB = bestRec.side === 'CT' ? 'T' : 'CT';
      } else if (currentStep.stepNum === 8 && session.format === 'BO5') {
        session.pickedMaps[2].sideB = bestRec.side;
        session.pickedMaps[2].sideA = bestRec.side === 'CT' ? 'T' : 'CT';
      } else if (currentStep.stepNum === 10 && session.format === 'BO5') {
        session.pickedMaps[3].sideA = bestRec.side;
        session.pickedMaps[3].sideB = bestRec.side === 'CT' ? 'T' : 'CT';
      }
      
      session.history.push({
        type: 'side',
        actor: currentStep.actor,
        side: bestRec.side,
        stepNum: currentStep.stepNum
      });
    } else if (currentStep.type === 'ban') {
      session.bannedMaps.add(bestRec.mapId);
      session.history.push({
        type: 'ban',
        actor: currentStep.actor,
        mapId: bestRec.mapId,
        stepNum: currentStep.stepNum
      });
    } else if (currentStep.type === 'pick') {
      session.pickedMaps.push({
        mapId: bestRec.mapId,
        picker: currentStep.actor,
        sideA: null,
        sideB: null
      });
      session.history.push({
        type: 'pick',
        actor: currentStep.actor,
        mapId: bestRec.mapId,
        stepNum: currentStep.stepNum
      });
    }

    session.currentStepIndex += 1;
    safety++;
  }

  // Set decider map at the end of auto-sim if needed
  const isBansAndPicksComplete = session.pickedMaps.length + session.bannedMaps.size === activeMaps.length - 1;
  if (isBansAndPicksComplete) {
    const remaining = activeMaps.filter(m => !session.bannedMaps.has(m.id) && !session.pickedMaps.some(p => p.mapId === m.id));
    if (remaining.length === 1) {
      session.deciderMap = remaining[0].id;
    }
  }
}

// Trigger What-if branching mode from a past step index
function triggerWhatIfMode(state, stepIdx, activeMaps, onStateChange) {
  const session = state.bpSession;
  
  // Clone current session up to the selected step
  const whatIfSession = {
    format: session.format,
    teamAId: session.teamAId,
    teamBId: session.teamBId,
    totalMapsCount: session.totalMapsCount,
    steps: session.steps,
    currentStepIndex: stepIdx,
    bannedMaps: new Set(),
    pickedMaps: [],
    deciderMap: null,
    history: []
  };

  // Rebuild the history up to stepIdx
  for (let i = 0; i < stepIdx; i++) {
    const hist = session.history[i];
    const step = session.steps[i];
    
    if (hist.type === 'ban') {
      whatIfSession.bannedMaps.add(hist.mapId);
      whatIfSession.history.push(JSON.parse(JSON.stringify(hist)));
    } else if (hist.type === 'pick') {
      whatIfSession.pickedMaps.push({
        mapId: hist.mapId,
        picker: hist.actor,
        sideA: null,
        sideB: null
      });
      whatIfSession.history.push(JSON.parse(JSON.stringify(hist)));
    } else if (hist.type === 'side') {
      const lastPick = whatIfSession.pickedMaps[whatIfSession.pickedMaps.length - 1];
      if (step.stepNum === 4) {
        whatIfSession.pickedMaps[0].sideB = hist.side;
        whatIfSession.pickedMaps[0].sideA = hist.side === 'CT' ? 'T' : 'CT';
      } else if (step.stepNum === 6) {
        whatIfSession.pickedMaps[1].sideA = hist.side;
        whatIfSession.pickedMaps[1].sideB = hist.side === 'CT' ? 'T' : 'CT';
      } else if (step.stepNum === 8 && whatIfSession.format === 'BO5') {
        whatIfSession.pickedMaps[2].sideB = hist.side;
        whatIfSession.pickedMaps[2].sideA = hist.side === 'CT' ? 'T' : 'CT';
      } else if (step.stepNum === 10 && whatIfSession.format === 'BO5') {
        whatIfSession.pickedMaps[3].sideA = hist.side;
        whatIfSession.pickedMaps[3].sideB = hist.side === 'CT' ? 'T' : 'CT';
      }
      whatIfSession.history.push(JSON.parse(JSON.stringify(hist)));
    }
  }

  onStateChange({
    whatIfActive: true,
    whatIfBranchPoint: stepIdx,
    whatIfSession
  });
}
