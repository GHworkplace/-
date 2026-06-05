import { MAPS, TEAMS, getH2H } from '../teamsData.js';
import { getMapBlueprintSVG } from '../mapBlueprints.js';

export function renderDashboard(container, state, onStateChange) {
  // Filter maps based on state preferences (default active duty + toggled optional maps)
  const activeMaps = MAPS.filter(m => m.isDefault || state.includeOptionalMaps);
  
  // Find current selected teams
  const teamA = TEAMS.find(t => t.id === state.selectedTeamA) || TEAMS[0];
  const teamB = TEAMS.find(t => t.id === state.selectedTeamB) || TEAMS[1];

  let html = `
    <!-- Top Filter Bar -->
    <div class="dashboard-filters-bar glass-card margin-bottom flex-row">
      <div class="filter-group">
        <label>📅 时间范围 (Time Range):</label>
        <select id="filter-time-range" class="tactical-select">
          <option value="3m" ${state.timeRange === '3m' ? 'selected' : ''}>过去 3 个月</option>
          <option value="6m" ${state.timeRange === '6m' ? 'selected' : ''}>过去 6 个月</option>
          <option value="1y" ${state.timeRange === '1y' ? 'selected' : ''}>过去 1 年</option>
          <option value="all" ${state.timeRange === 'all' ? 'selected' : ''}>全部历史</option>
        </select>
      </div>
      <div class="filter-group">
        <label>📡 数据源 (Data Source):</label>
        <select id="filter-data-type" class="tactical-select">
          <option value="historical" ${state.dataType === 'historical' ? 'selected' : ''}>静态存档数据</option>
          <option value="realtime" ${state.dataType === 'realtime' ? 'selected' : ''}>实时同步数据</option>
        </select>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Left Panel: Global Map Balances & Radar Chart -->
      <div class="panel glass-card flex-col">
        <div class="panel-header-tabs flex-row margin-bottom-sm">
          <button id="radar-tab-btn" class="tactical-tab-btn ${state.dashboardLeftTab === 'radar' ? 'active' : ''}">🌐 阵营胜率平衡雷达图</button>
          <button id="blueprint-tab-btn" class="tactical-tab-btn ${state.dashboardLeftTab === 'blueprint' ? 'active' : ''}">🗺️ 地图战术平面图</button>
        </div>
        
        ${state.dashboardLeftTab === 'radar' ? `
          <div class="flex-row justify-between align-center margin-bottom-sm">
            <h2 class="panel-title" style="margin-bottom: 0;">🌐 阵营胜率平衡 (Active Duty)</h2>
            <select id="radar-data-source-select" class="tactical-select" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; height: auto; width: auto; max-width: 140px;">
              <option value="global" ${state.radarDataSource === 'global' ? 'selected' : ''}>全部战队均值</option>
              <option value="teamA" ${state.radarDataSource === 'teamA' ? 'selected' : ''}>战队 A (${teamA.name})</option>
              <option value="teamB" ${state.radarDataSource === 'teamB' ? 'selected' : ''}>战队 B (${teamB.name})</option>
            </select>
          </div>
          <div class="radar-chart-container">
            ${renderRadarChartSVG(activeMaps, teamA, teamB, state.radarDataSource)}
          </div>
          <div class="map-legend">
            <span class="legend-item"><span class="legend-color ct"></span>防守方 (CT 胜率)</span>
            <span class="legend-item"><span class="legend-color t"></span>进攻方 (T 胜率)</span>
          </div>
        ` : `
          <div class="flex-col fill-height">
            <div class="blueprint-selector-row flex-row align-center margin-bottom-sm">
              <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-right: 0.5rem;">🗺️ 选择地图:</label>
              <select id="blueprint-map-select" class="tactical-select" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; height: auto; width: auto; max-width: 150px;">
                ${activeMaps.map(m => `<option value="${m.id}" ${m.id === state.dashboardSelectedMap ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>
            <div class="sandbox-map-layout-container" style="margin-bottom: 0.75rem; align-self: center; width: 100%;">
              ${getMapBlueprintSVG(state.dashboardSelectedMap || activeMaps[0].id)}
            </div>
            <div class="blueprint-map-description" style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; padding: 0.5rem; background: rgba(255,255,255,0.01); border-radius: 4px; border: 1px solid var(--border-color);">
              <strong>地图说明：</strong>
              <span>${(activeMaps.find(m => m.id === state.dashboardSelectedMap) || activeMaps[0]).description}</span>
            </div>
          </div>
        `}
      </div>

      <!-- Right Panel: Team Search & H2H Comparison -->
      <div class="panel glass-card flex-col">
        <h2 class="panel-title">🤜🤛 战队历史交手与阵容实力 (H2H & Roster)</h2>
        <div class="team-selectors-row">
          <div class="selector-box">
            <label>战队 A (高种子)</label>
            <select id="dash-select-team-a" class="tactical-select">
              ${TEAMS.map(t => `<option value="${t.id}" ${t.id === teamA.id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="versus-divider">VS</div>
          <div class="selector-box">
            <label>战队 B (低种子)</label>
            <select id="dash-select-team-b" class="tactical-select">
              ${TEAMS.map(t => `<option value="${t.id}" ${t.id === teamB.id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="h2h-comparison-content">
          <div class="h2h-summary-row">
            <div class="team-summary-card team-a">
              <span class="team-logo-large">${teamA.logo}</span>
              <h3 class="team-name-large">${teamA.name}</h3>
              <div class="team-badge">HLTV #${teamA.rank}</div>
              <div class="team-form">近期状态: <strong class="glow-text">${teamA.formIndex}</strong> / 10</div>
              <div class="team-roster">
                <h4>首发阵容 (Roster)</h4>
                ${renderTeamPlayers(teamA)}
              </div>
            </div>
            
            <div class="h2h-stats-board">
              <div class="h2h-title">历史交战胜负</div>
              <div class="h2h-score-display" id="h2h-total-score">加载中...</div>
              <div class="h2h-details" id="h2h-map-details"></div>
            </div>

            <div class="team-summary-card team-b">
              <span class="team-logo-large">${teamB.logo}</span>
              <h3 class="team-name-large">${teamB.name}</h3>
              <div class="team-badge">HLTV #${teamB.rank}</div>
              <div class="team-form">近期状态: <strong class="glow-text">${teamB.formIndex}</strong> / 10</div>
              <div class="team-roster">
                <h4>首发阵容 (Roster)</h4>
                ${renderTeamPlayers(teamB)}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Toggle Optional Maps Checkbox -->
        <div class="checkbox-row margin-top">
          <label class="tactical-checkbox-label">
            <input type="checkbox" id="optional-maps-toggle" ${state.includeOptionalMaps ? 'checked' : ''}>
            <span>启用可选地图池 (殒命大厦 Vertigo / 列车停放站 Train)</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Bottom Matrix: Team Map Pool Heatmap -->
    <div class="heatmap-panel glass-card margin-top">
      <h2 class="panel-title">📊 战队地图胜率矩阵热力图 (Team Map Pool Matrix)</h2>
      <div class="heatmap-container">
        ${renderHeatmapTable(activeMaps)}
      </div>
      <div class="heatmap-legend">
        <span>胜率区间:</span>
        <span class="legend-box level-1">&lt; 45% (弱图)</span>
        <span class="legend-box level-2">45% - 55% (均衡)</span>
        <span class="legend-box level-3">55% - 65% (强图)</span>
        <span class="legend-box level-4">&gt; 65% (王牌图)</span>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Calculate and update H2H data dynamically on the UI
  updateH2HStats(teamA.id, teamB.id, activeMaps);

  // Bind change events
  container.querySelector('#filter-time-range').addEventListener('change', (e) => {
    onStateChange({ timeRange: e.target.value });
  });

  container.querySelector('#filter-data-type').addEventListener('change', (e) => {
    onStateChange({ dataType: e.target.value });
  });

  container.querySelector('#dash-select-team-a').addEventListener('change', (e) => {
    onStateChange({ selectedTeamA: e.target.value });
  });

  container.querySelector('#dash-select-team-b').addEventListener('change', (e) => {
    onStateChange({ selectedTeamB: e.target.value });
  });

  container.querySelector('#optional-maps-toggle').addEventListener('change', (e) => {
    onStateChange({ includeOptionalMaps: e.target.checked });
  });

  // Bind left tab switches
  const radarTabBtn = container.querySelector('#radar-tab-btn');
  const blueprintTabBtn = container.querySelector('#blueprint-tab-btn');
  
  if (radarTabBtn) {
    radarTabBtn.addEventListener('click', () => {
      onStateChange({ dashboardLeftTab: 'radar' });
    });
  }
  
  if (blueprintTabBtn) {
    blueprintTabBtn.addEventListener('click', () => {
      onStateChange({ dashboardLeftTab: 'blueprint' });
    });
  }

  // Bind radar data source select
  const radarSourceSelect = container.querySelector('#radar-data-source-select');
  if (radarSourceSelect) {
    radarSourceSelect.addEventListener('change', (e) => {
      onStateChange({ radarDataSource: e.target.value });
    });
  }

  // Bind blueprint map select
  const blueprintMapSelect = container.querySelector('#blueprint-map-select');
  if (blueprintMapSelect) {
    blueprintMapSelect.addEventListener('change', (e) => {
      onStateChange({ dashboardSelectedMap: e.target.value });
    });
  }
}

// Render Team Players list
function renderTeamPlayers(team) {
  if (!team.players || team.players.length === 0) {
    return '<div class="player-empty">暂无选手数据</div>';
  }
  return team.players.map(p => `
    <div class="player-row">
      <span class="player-role">[${p.role}]</span>
      <span class="player-name">${p.nickname}</span>
      <span class="player-rating tooltip" data-tooltip="Impact: ${p.impact} | KAST: ${p.kast}%">
        ${p.rating.toFixed(2)}
      </span>
    </div>
  `).join('');
}

// Generate SVG Radar Chart for Map Win Rates (CT vs T)
function renderRadarChartSVG(activeMaps, teamA, teamB, source) {
  const size = 320;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = activeMaps.length;
  
  // Concentric circle grids
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  let svgGrid = '';
  gridLevels.forEach(level => {
    const r = radius * level;
    let points = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    svgGrid += `<polygon points="${points.join(' ')}" class="radar-grid" />`;
    // Add winrate percentages on the top vertical axis
    const topY = center - r;
    svgGrid += `<text x="${center + 5}" y="${topY + 4}" class="radar-percentage-text">${level * 100}%</text>`;
  });

  // Calculate polygon points for CT and T winrates
  let ctPoints = [];
  let tPoints = [];
  let axesLines = '';
  let labels = '';

  activeMaps.forEach((map, i) => {
    const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
    
    // Grid axis lines
    const endX = center + radius * Math.cos(angle);
    const endY = center + radius * Math.sin(angle);
    axesLines += `<line x1="${center}" y1="${center}" x2="${endX}" y2="${endY}" class="radar-axis" />`;

    // Labels positioned outside the radar border
    const labelDistance = radius + 22;
    const labelX = center + labelDistance * Math.cos(angle);
    const labelY = center + labelDistance * Math.sin(angle);
    
    // Text alignment adjustments
    let textAnchor = 'middle';
    if (Math.abs(Math.cos(angle)) > 0.1) {
      textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
    }
    labels += `<text x="${labelX}" y="${labelY + 4}" text-anchor="${textAnchor}" class="radar-label">${map.code}</text>`;

    // Plots (Scale values to max 100%)
    let ctVal = map.winrateCT / 100;
    let tVal = map.winrateT / 100;

    if (source === 'teamA') {
      const stats = teamA.mapPool[map.id];
      if (stats && stats.matches > 0) {
        ctVal = stats.ctWinRate / 100;
        tVal = stats.tWinRate / 100;
      }
    } else if (source === 'teamB') {
      const stats = teamB.mapPool[map.id];
      if (stats && stats.matches > 0) {
        ctVal = stats.ctWinRate / 100;
        tVal = stats.tWinRate / 100;
      }
    }

    const ctX = center + radius * ctVal * Math.cos(angle);
    const ctY = center + radius * ctVal * Math.sin(angle);
    ctPoints.push(`${ctX},${ctY}`);

    const tX = center + radius * tVal * Math.cos(angle);
    const tY = center + radius * tVal * Math.sin(angle);
    tPoints.push(`${tX},${tY}`);
  });

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">
      <!-- Background Grids -->
      ${svgGrid}
      <!-- Axis Lines -->
      ${axesLines}
      <!-- CT Win Rate Shape (Blue) -->
      <polygon points="${ctPoints.join(' ')}" class="radar-poly ct" />
      <!-- T Win Rate Shape (Orange) -->
      <polygon points="${tPoints.join(' ')}" class="radar-poly t" />
      <!-- Labels -->
      ${labels}
      <circle cx="${center}" cy="${center}" r="3" class="radar-center-dot" />
    </svg>
  `;
}

// Generate the HTML table map matrix heatmap
function renderHeatmapTable(activeMaps) {
  let tableHeaders = `<th>战队</th>`;
  activeMaps.forEach(map => {
    tableHeaders += `<th>${map.id}<br><span class="map-subtitle">${map.code}</span></th>`;
  });

  let rows = '';
  TEAMS.forEach(team => {
    let rowCells = `
      <td class="heatmap-team-cell">
        <span class="team-logo-mini">${team.logo}</span>
        <div class="team-info-mini">
          <div class="team-name-mini">${team.name}</div>
          <div class="team-rank-mini">#${team.rank} (${team.coachStyle.description.slice(0, 10)}...)</div>
        </div>
      </td>
    `;

    activeMaps.forEach(map => {
      const stats = team.mapPool[map.id];
      let winRateHtml = '-';
      let cellClass = 'heatmap-cell level-0';
      let tooltip = '无比赛数据';

      if (stats && stats.matches > 0) {
        winRateHtml = `${stats.winRate}%`;
        tooltip = `${stats.matches}场比赛 | CT: ${stats.ctWinRate}% | T: ${stats.tWinRate}%`;
        
        // Define color levels based on winrate
        if (stats.winRate < 45) cellClass = 'heatmap-cell level-1';
        else if (stats.winRate < 55) cellClass = 'heatmap-cell level-2';
        else if (stats.winRate < 65) cellClass = 'heatmap-cell level-3';
        else cellClass = 'heatmap-cell level-4';
      }

      rowCells += `
        <td class="${cellClass}" data-tooltip="${tooltip}">
          <span class="cell-rate">${winRateHtml}</span>
          <span class="cell-matches">${stats ? stats.matches : 0} 场</span>
        </td>
      `;
    });

    rows += `<tr>${rowCells}</tr>`;
  });

  return `
    <table class="heatmap-table">
      <thead>
        <tr>${tableHeaders}</tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Dynamically compute and display head to head win scores
function updateH2HStats(teamAId, teamBId, activeMaps) {
  let totalAWins = 0;
  let totalBWins = 0;
  let mapDetailRows = '';

  activeMaps.forEach(map => {
    const statsA = TEAMS.find(t => t.id === teamAId).mapPool[map.id];
    const statsB = TEAMS.find(t => t.id === teamBId).mapPool[map.id];
    
    // Fetch H2H from static DB
    const h2h = getH2H(teamAId, teamBId, map.id);
    totalAWins += h2h[0];
    totalBWins += h2h[1];

    if (h2h[0] + h2h[1] > 0) {
      const aBarWidth = (h2h[0] / (h2h[0] + h2h[1])) * 100;
      mapDetailRows += `
        <div class="h2h-map-row">
          <div class="h2h-map-name">${map.name}</div>
          <div class="h2h-bar-container">
            <div class="h2h-bar-segment a" style="width: ${aBarWidth}%">${h2h[0]}</div>
            <div class="h2h-bar-segment b" style="width: ${100 - aBarWidth}%">${h2h[1]}</div>
          </div>
        </div>
      `;
    } else {
      mapDetailRows += `
        <div class="h2h-map-row empty">
          <div class="h2h-map-name">${map.name}</div>
          <div class="h2h-bar-container">
            <span class="no-record-label">无历史交手数据 (预测胜率 A: ${statsA.winRate}% vs B: ${statsB.winRate}%)</span>
          </div>
        </div>
      `;
    }
  });

  const totalScoreEl = document.getElementById('h2h-total-score');
  const detailsEl = document.getElementById('h2h-map-details');
  if (totalScoreEl && detailsEl) {
    totalScoreEl.innerHTML = `
      <span class="score-a-color">${totalAWins}</span>
      <span class="colon">:</span>
      <span class="score-b-color">${totalBWins}</span>
    `;
    detailsEl.innerHTML = mapDetailRows;
  }
}
