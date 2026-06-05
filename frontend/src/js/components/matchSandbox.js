import { TEAMS, MAPS } from '../teamsData.js';
import { initSandboxSession, TACTICS, getOptimalStrategy, simulateRound, simulateEntireMap } from '../sandboxEngine.js';
import { getMapBlueprintSVG } from '../mapBlueprints.js';

export function renderMatchSandbox(container, state, onStateChange) {
  // If no maps were imported from the BP stage, show placeholder
  if (!state.sandboxMapsToSimulate || state.sandboxMapsToSimulate.length === 0) {
    container.innerHTML = `
      <div class="bp-completed-placeholder glass-card">
        <span class="completed-trophy">🎮</span>
        <h4>暂未导入推演地图</h4>
        <p>请先前往 <strong>BP模拟器</strong> 标签页完成 Ban/Pick 流程，并点击“导入战术沙盘推演”。</p>
      </div>
    `;
    return;
  }

  const mapsToSimulate = state.sandboxMapsToSimulate;
  const currentMapIdx = state.sandboxCurrentMapIndex || 0;
  const activeMapTarget = mapsToSimulate[currentMapIdx];

  // Initialize sandbox session for this map if not yet done
  if (!state.sandboxSession || state.sandboxSession.mapId !== activeMapTarget.mapId) {
    const session = initSandboxSession(state.selectedTeamA, state.selectedTeamB, activeMapTarget.mapId, activeMapTarget.startSideA);
    onStateChange({ sandboxSession: session });
    return;
  }

  const session = state.sandboxSession;
  const mapDetail = MAPS.find(m => m.id === session.mapId);
  const teamA = TEAMS.find(t => t.id === session.teamA.id);
  const teamB = TEAMS.find(t => t.id === session.teamB.id);

  // Get current round optimal strategy
  const recommendations = getOptimalStrategy(session);

  let html = `
    <!-- Top Map Selector Tabs -->
    <div class="sandbox-map-tabs glass-card">
      <div class="map-tabs-list">
        ${mapsToSimulate.map((m, idx) => {
          const map = MAPS.find(mp => mp.id === m.mapId);
          const isActive = idx === currentMapIdx;
          return `
            <button class="map-tab-btn ${isActive ? 'active' : ''}" data-map-idx="${idx}">
              🗺️ 图 ${idx + 1}: ${map ? map.name : m.mapId}
            </button>
          `;
        }).join('')}
      </div>
      <div class="sandbox-reset-col">
        <button id="sandbox-reset-map-btn" class="tactical-btn secondary">🔄 重置当前地图推演</button>
      </div>
    </div>

    <!-- Active Sandbox Dashboard -->
    <div class="sandbox-dashboard-grid">
      <!-- Team A Panel -->
      <div class="sandbox-team-panel team-a glass-card">
        <div class="team-panel-header">
          <span class="side-badge ${session.teamA.side.toLowerCase()}">${session.teamA.side}</span>
          <span class="team-logo-mini">${session.teamA.logo}</span>
          <h3 class="team-name-lg">${session.teamA.name}</h3>
        </div>
        <div class="sandbox-big-score score-a-color">${session.teamA.score}</div>
        
        <!-- Team Stats details -->
        <div class="sandbox-stats-list">
          <div class="stat-item">
            <span class="lbl">团队资金 (Cash)</span>
            <span class="val cash-glow">$${session.teamA.cash}</span>
          </div>
          <div class="stat-item">
            <span class="lbl">战意士气 (Morale)</span>
            <span class="val">${renderMoraleStars(session.teamA.morale)}</span>
          </div>
          <div class="stat-item">
            <span class="lbl">连败补偿奖励 (Loss Streak)</span>
            <span class="val">${session.teamA.lossStreak} 连败</span>
          </div>
          <div class="stat-item">
            <span class="lbl">本局装备 (Weapon Buy)</span>
            <span class="val capitalize bold buy-glow-${session.teamA.buyType}">${session.teamA.buyType}</span>
          </div>
        </div>

        <!-- Strategy Inputs for A -->
        ${session.status === 'active' ? renderTacticInputs(session.teamA, recommendations[session.teamA.id], 'a') : ''}
      </div>

      <!-- Center Simulator Status Board -->
      <div class="sandbox-center-panel glass-card">
        <!-- Map Layout Blueprint Visualizer -->
        <div class="sandbox-map-layout-container">
          ${getMapBlueprintSVG(session.mapId)}
        </div>
        
        <div class="round-counter">ROUND ${session.currentRound}</div>
        
        <!-- Live win probability indicator -->
        <div class="round-prob-header">本局理论获胜概率预测</div>
        <div class="round-prob-display">
          <span class="prob-num score-a-color" id="prob-a-val">--%</span>
          <span class="vers">:</span>
          <span class="prob-num score-b-color" id="prob-b-val">--%</span>
        </div>
        <div class="prob-bar-track">
          <div class="prob-bar-fill ct" id="prob-bar-fill-a" style="width: 50%"></div>
          <div class="prob-bar-fill t" id="prob-bar-fill-b" style="width: 50%"></div>
        </div>

        <!-- Optimal Strategy Tip (Glow Card) -->
        <div class="optimal-strategy-tip-card">
          <div class="tip-header">💡 最优局内策略推荐</div>
          <div class="tip-body" id="optimal-strategy-text">正在计算...</div>
        </div>

        <!-- Action Control Buttons -->
        <div class="sandbox-action-buttons">
          ${session.status === 'active' ? `
            <button id="sandbox-apply-opt-btn" class="tactical-btn success glow-btn-green">一键应用最优战术</button>
            <div class="simulation-actions-row">
              <button id="sandbox-sim-round-btn" class="tactical-btn primary">⚔️ 推演单回合 (Sim Round)</button>
              <button id="sandbox-sim-map-btn" class="tactical-btn secondary">⚡ 一键推演全图 (Quick Map)</button>
            </div>
          ` : `
            <div class="map-ended-placeholder">
              <h4 class="text-green font-xl">地图推演已结束!</h4>
              <p>胜者为: <strong class="glow-text">${session.winnerId === session.teamA.id ? session.teamA.name : session.teamB.name}</strong></p>
              ${currentMapIdx < mapsToSimulate.length - 1 ? `
                <button id="sandbox-next-map-btn" class="tactical-btn primary">➡️ 进入下一图推演</button>
              ` : `
                <div class="series-completed-text">🏆 全赛程模拟已全部推演完毕！</div>
              `}
            </div>
          `}
        </div>
      </div>

      <!-- Team B Panel -->
      <div class="sandbox-team-panel team-b glass-card">
        <div class="team-panel-header">
          <span class="side-badge ${session.teamB.side.toLowerCase()}">${session.teamB.side}</span>
          <span class="team-logo-mini">${session.teamB.logo}</span>
          <h3 class="team-name-lg">${session.teamB.name}</h3>
        </div>
        <div class="sandbox-big-score score-b-color">${session.teamB.score}</div>

        <!-- Team Stats details -->
        <div class="sandbox-stats-list">
          <div class="stat-item">
            <span class="lbl">团队资金 (Cash)</span>
            <span class="val cash-glow">$${session.teamB.cash}</span>
          </div>
          <div class="stat-item">
            <span class="lbl">战意士气 (Morale)</span>
            <span class="val">${renderMoraleStars(session.teamB.morale)}</span>
          </div>
          <div class="stat-item">
            <span class="lbl">连败补偿奖励 (Loss Streak)</span>
            <span class="val">${session.teamB.lossStreak} 连败</span>
          </div>
          <div class="stat-item">
            <span class="lbl">本局装备 (Weapon Buy)</span>
            <span class="val capitalize bold buy-glow-${session.teamB.buyType}">${session.teamB.buyType}</span>
          </div>
        </div>

        <!-- Strategy Inputs for B -->
        ${session.status === 'active' ? renderTacticInputs(session.teamB, recommendations[session.teamB.id], 'b') : ''}
      </div>
    </div>

    <!-- Bottom: Live Commentator Log & score graph -->
    <div class="sandbox-bottom-grid margin-top">
      <!-- Live Commentary -->
      <div class="glass-card panel fill-height flex-col min-height-300">
        <h3 class="panel-title">🎤 局内实时解说战报日志 (Commentary Feed)</h3>
        <div class="commentary-feed-container" id="sandbox-commentary-feed">
          ${renderCommentaryFeed(session.roundsHistory)}
        </div>
      </div>

      <!-- SVG Win Rate & Score Progression Graph -->
      <div class="glass-card panel fill-height min-height-300">
        <h3 class="panel-title">📈 比分与胜率波动曲线 (Score & Odds Graph)</h3>
        <div class="score-progression-graph">
          ${renderScoreGraphSVG(session.roundsHistory, session.teamA.id, session.teamB.id)}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Recalculate and update current round percentages dynamically
  updateRoundProbabilities(session, recommendations);

  // Bind Events
  bindSandboxEvents(container, state, onStateChange, mapsToSimulate, currentMapIdx, session, recommendations);
}

// Generate star rating display for morale indices
function renderMoraleStars(morale) {
  // Morale is -5 to 5. Map to 0-5 stars
  const starsCount = Math.round((morale + 5) / 2);
  let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < starsCount) stars += '★';
    else stars += '☆';
  }
  return `<span class="morale-stars">${stars}</span>`;
}

// Render tactical controls
function renderTacticInputs(teamState, rec, prefix) {
  const isT = teamState.side === 'T';
  const availableTactics = isT ? TACTICS.T : TACTICS.CT;
  
  return `
    <div class="tactic-inputs-box">
      <div class="input-item">
        <label>局内战术倾向 (Tactic)</label>
        <select id="sandbox-${prefix}-tactic-select" class="tactical-select">
          ${availableTactics.map(tac => `<option value="${tac.id}">${tac.name}</option>`).join('')}
        </select>
      </div>

      <div class="input-item margin-top-sm">
        <label>武器购买倾向 (Buy Stance)</label>
        <select id="sandbox-${prefix}-buy-select" class="tactical-select">
          <option value="auto" selected>自动建议 (${rec.buy.toUpperCase()})</option>
          <option value="eco">纯 ECO 攒钱 ($1000)</option>
          <option value="force">强买局 Force Buy ($2200)</option>
          <option value="buy">全弹买齐 Full Buy ($4200)</option>
          <option value="awp" ${teamState.cash < 6000 ? 'disabled' : ''}>大狙 AWP Buy ($6000)</option>
        </select>
      </div>
    </div>
  `;
}

// Render the commentator scroll feed
function renderCommentaryFeed(history) {
  if (history.length === 0) {
    return `<div class="feed-empty-placeholder">对局暂未开始，请选择战术倾向并点击上方“推演单回合”。</div>`;
  }

  return history.map(h => {
    if (h.type === 'system') {
      return `<div class="feed-item system-log">${h.narrative}</div>`;
    }
    
    const isWinnerA = h.winnerId === history[0]?.winnerId || h.winnerId === h.winnerId; // default classification
    const rowClass = h.winnerId === history[0]?.winnerId ? 'winner-a-row' : 'winner-b-row';
    const buyA = h.buyTypeA.toUpperCase();
    const buyB = h.buyTypeB.toUpperCase();

    return `
      <div class="feed-item ${rowClass}">
        <span class="feed-round-badge">R${h.roundNum}</span>
        <span class="feed-text">${h.narrative}</span>
        <div class="feed-meta">
          A: ${h.tacticA} (${buyA}) | B: ${h.tacticB} (${buyB}) — 赛前A胜率估计: ${h.probA}%
        </div>
      </div>
    `;
  }).join('');
}

// Renders SVG Line Graph representing odds progression
function renderScoreGraphSVG(history, teamAId, teamBId) {
  const width = 480;
  const height = 220;
  const pad = 25;

  const rounds = history.filter(h => h.roundNum !== undefined);
  if (rounds.length === 0) {
    return `
      <div class="graph-placeholder">
        <span>对决开始后将在此绘制胜率走向图</span>
      </div>
    `;
  }

  // Draw points
  const points = [];
  const scoreAPoints = [];
  const scoreBPoints = [];
  
  const totalRounds = Math.max(24, rounds.length);
  const dx = (width - 2 * pad) / (totalRounds - 1 || 1);

  rounds.forEach((r, i) => {
    const x = pad + i * dx;
    
    // Win rate line (Team A winning odds)
    // ProbA goes from 0 to 100. Map to height-pad to pad
    const y = height - pad - (r.probA / 100) * (height - 2 * pad);
    points.push(`${x},${y}`);

    // Score line A (Team A score)
    const yScoreA = height - pad - (r.scoreA / 16) * (height - 2 * pad); // assume max score OT is 16 for scale
    scoreAPoints.push(`${x},${yScoreA}`);
  });

  const winrateLine = `<polyline points="${points.join(' ')}" class="graph-line winrate-line" />`;
  const gridLine50 = `<line x1="${pad}" y1="${height/2}" x2="${width - pad}" y2="${height/2}" class="graph-grid-50" />`;

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
      <!-- Grid Border -->
      <rect x="${pad}" y="${pad}" width="${width - 2*pad}" height="${height - 2*pad}" class="graph-border" />
      <!-- Grid 50% line -->
      ${gridLine50}
      <!-- Winrate line -->
      ${winrateLine}
      <!-- Labels -->
      <text x="${pad - 5}" y="${pad + 4}" text-anchor="end" class="graph-label-text">A 胜率 100%</text>
      <text x="${pad - 5}" y="${height/2 + 4}" text-anchor="end" class="graph-label-text">50%</text>
      <text x="${pad - 5}" y="${height - pad + 4}" text-anchor="end" class="graph-label-text">0%</text>
      
      <text x="${width - pad}" y="${height - 5}" text-anchor="end" class="graph-label-text">回合数 →</text>
    </svg>
  `;
}

// Recalculates and updates probabilities display on center dashboard
function updateRoundProbabilities(session, recommendations) {
  const tA = session.teamA;
  const tB = session.teamB;
  const map = MAPS.find(m => m.id === session.mapId);
  const statsA = TEAMS.find(t => t.id === tA.id).mapPool[session.mapId];
  const statsB = TEAMS.find(t => t.id === tB.id).mapPool[session.mapId];

  // Base probabilities
  const baseRateA = tA.side === 'CT' ? statsA.ctWinRate : statsA.tWinRate;
  const baseRateB = tB.side === 'CT' ? statsB.ctWinRate : statsB.tWinRate;
  let probA = baseRateA / (baseRateA + baseRateB || 1) * 100;
  probA += (tA.side === 'CT' ? map.winrateCT - 50 : map.winrateT - 50) * 0.5;

  const isPistol = session.currentRound === 1 || session.currentRound === 13 || session.currentRound === 25;
  if (isPistol) {
    const pistolRateA = tA.side === 'CT' ? statsA.pistolWinRateCT : statsA.pistolWinRateT;
    const pistolRateB = tB.side === 'CT' ? statsB.pistolWinRateCT : statsB.pistolWinRateT;
    probA = pistolRateA / (pistolRateA + pistolRateB || 1) * 100;
  }

  // Adjust for weapon buys
  const buyWeightA = tA.buyType === 'eco' ? 1 : tA.buyType === 'force' ? 3 : tA.buyType === 'buy' ? 5 : tA.buyType === 'awp' ? 6 : 2;
  const buyWeightB = tB.buyType === 'eco' ? 1 : tB.buyType === 'force' ? 3 : tB.buyType === 'buy' ? 5 : tB.buyType === 'awp' ? 6 : 2;
  if (!isPistol) {
    probA += (buyWeightA - buyWeightB) * 12;
  }
  probA += (tA.morale - tB.morale) * 1.5;
  probA = Math.round(Math.max(5, Math.min(95, probA)));

  const probAEl = document.getElementById('prob-a-val');
  const probBEl = document.getElementById('prob-b-val');
  const barAEl = document.getElementById('prob-bar-fill-a');
  const barBEl = document.getElementById('prob-bar-fill-b');

  if (probAEl && probBEl && barAEl && barBEl) {
    probAEl.innerHTML = `${probA}%`;
    probBEl.innerHTML = `${100 - probA}%`;
    barAEl.style.width = `${probA}%`;
    barBEl.style.width = `${100 - probA}%`;
  }

  // Set strategy text tip
  const strategyTipEl = document.getElementById('optimal-strategy-text');
  if (strategyTipEl) {
    const recA = recommendations[tA.id];
    const recB = recommendations[tB.id];
    
    // Choose who needs strategy more (usually the poorer or trailing team, or A by default)
    const activeRec = tA.score >= tB.score ? recB : recA;
    const activeTeam = tA.score >= tB.score ? tB : tA;
    
    const teamLabel = activeTeam.id;
    const buyLabel = activeRec.buy.toUpperCase();
    const tacticLabel = activeRec.tacticReason;

    strategyTipEl.innerHTML = `
      对 <strong>${teamLabel}</strong> 的建议：<br>
      • <strong>装备方针</strong>: 建议使用 <strong class="glow-text text-green">${buyLabel}</strong> (${activeRec.buyReason})<br>
      • <strong>战术倾向</strong>: ${tacticLabel}
    `;
  }
}

// Binds all sandbox events
function bindSandboxEvents(container, state, onStateChange, mapsToSimulate, currentMapIdx, session, recommendations) {
  // Map tab switches
  const tabBtns = container.querySelectorAll('.map-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-map-idx'));
      onStateChange({
        sandboxCurrentMapIndex: idx,
        sandboxSession: null // reset session to load next map
      });
    });
  });

  // Reset current map button
  container.querySelector('#sandbox-reset-map-btn').addEventListener('click', () => {
    onStateChange({ sandboxSession: null }); // clears session triggers reload
  });

  // Apply optimal tactics buttons
  const applyOptBtn = container.querySelector('#sandbox-apply-opt-btn');
  if (applyOptBtn) {
    applyOptBtn.addEventListener('click', () => {
      // Find selector components
      const selectTacticA = container.querySelector('#sandbox-a-tactic-select');
      const selectTacticB = container.querySelector('#sandbox-b-tactic-select');
      const selectBuyA = container.querySelector('#sandbox-a-buy-select');
      const selectBuyB = container.querySelector('#sandbox-b-buy-select');

      const recA = recommendations[session.teamA.id];
      const recB = recommendations[session.teamB.id];

      if (selectTacticA && selectTacticB) {
        selectTacticA.value = recA.tactic;
        selectTacticB.value = recB.tactic;
      }
      if (selectBuyA && selectBuyB) {
        selectBuyA.value = 'auto'; // will pick recommended buy naturally
        selectBuyB.value = 'auto';
      }

      // Trigger probability recalc
      const override = {
        teamA: { tactic: recA.tactic, buy: recA.buy },
        teamB: { tactic: recB.tactic, buy: recB.buy }
      };
      updateRoundProbabilities(session, recommendations);
    });
  }

  // Simulate Single Round
  const simRoundBtn = container.querySelector('#sandbox-sim-round-btn');
  if (simRoundBtn) {
    simRoundBtn.addEventListener('click', () => {
      const selectTacticA = container.querySelector('#sandbox-a-tactic-select');
      const selectTacticB = container.querySelector('#sandbox-b-tactic-select');
      const selectBuyA = container.querySelector('#sandbox-a-buy-select');
      const selectBuyB = container.querySelector('#sandbox-b-buy-select');

      const buyValA = selectBuyA?.value === 'auto' ? recommendations[session.teamA.id].buy : selectBuyA?.value;
      const buyValB = selectBuyB?.value === 'auto' ? recommendations[session.teamB.id].buy : selectBuyB?.value;

      const override = {
        teamA: { tactic: selectTacticA?.value || 'default', buy: buyValA || 'buy' },
        teamB: { tactic: selectTacticB?.value || 'default', buy: buyValB || 'buy' }
      };

      const nextSession = simulateRound(session, override);
      onStateChange({ sandboxSession: nextSession });

      // Scroll commentary to bottom after simulation round
      setTimeout(() => {
        const feed = document.getElementById('sandbox-commentary-feed');
        if (feed) feed.scrollTop = feed.scrollHeight;
      }, 50);
    });
  }

  // Quick simulate entire map
  const simMapBtn = container.querySelector('#sandbox-sim-map-btn');
  if (simMapBtn) {
    simMapBtn.addEventListener('click', () => {
      const nextSession = simulateEntireMap(session);
      onStateChange({ sandboxSession: nextSession });
    });
  }

  // Next Map button
  const nextMapBtn = container.querySelector('#sandbox-next-map-btn');
  if (nextMapBtn) {
    nextMapBtn.addEventListener('click', () => {
      onStateChange({
        sandboxCurrentMapIndex: currentMapIdx + 1,
        sandboxSession: null
      });
    });
  }
}
