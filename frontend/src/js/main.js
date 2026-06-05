import { renderDashboard } from './components/dashboard.js';
import { renderBPSimulator } from './components/bpSimulator.js';
import { renderMatchSandbox } from './components/matchSandbox.js';
import { fetchInitialData } from './teamsData.js';
import { runDemo } from './demoRunner.js';

// Global state
let state = {
  activeTab: 'dashboard', // 'dashboard', 'simulator', 'sandbox'
  selectedTeamA: 'NAVI',
  selectedTeamB: 'FaZe',
  includeOptionalMaps: false,
  bpFormat: 'BO3',
  bpSession: null,
  
  // Data filters
  timeRange: '1y',
  dataType: 'historical',
  isDataLoading: false,

  // Dashboard state variables
  radarDataSource: 'teamA',
  dashboardLeftTab: 'radar',
  dashboardSelectedMap: 'Ancient',

  // What-if states
  whatIfActive: false,
  whatIfBranchPoint: -1,
  whatIfSession: null,

  // Sandbox states
  sandboxMapsToSimulate: [], // Array of { mapId, startSideA }
  sandboxCurrentMapIndex: 0,
  sandboxSession: null
};

// State change dispatcher
async function onStateChange(nextStateChanges) {
  const needsRefetch = ('timeRange' in nextStateChanges || 'dataType' in nextStateChanges);
  state = { ...state, ...nextStateChanges };
  
  if (needsRefetch) {
    state.isDataLoading = true;
    renderApp(); // Render loading state
    await fetchInitialData(state.timeRange, state.dataType);
    state.isDataLoading = false;
  }
  
  renderApp();
}

// Global render router
function renderApp() {
  const container = document.getElementById('app-mount-point');
  if (!container) return;

  // Active tab styling
  const tabDashboard = document.getElementById('tab-btn-dashboard');
  const tabSimulator = document.getElementById('tab-btn-simulator');
  const tabSandbox = document.getElementById('tab-btn-sandbox');

  if (tabDashboard && tabSimulator && tabSandbox) {
    tabDashboard.classList.toggle('active', state.activeTab === 'dashboard');
    tabSimulator.classList.toggle('active', state.activeTab === 'simulator');
    tabSandbox.classList.toggle('active', state.activeTab === 'sandbox');
  }

  // Render tab content
  if (state.activeTab === 'dashboard') {
    renderDashboard(container, state, onStateChange);
  } else if (state.activeTab === 'simulator') {
    renderBPSimulator(container, state, onStateChange);
  } else if (state.activeTab === 'sandbox') {
    renderMatchSandbox(container, state, onStateChange);
  }
}

// Bind Navigation tabs
document.addEventListener('DOMContentLoaded', async () => {
  const tabDashboard = document.getElementById('tab-btn-dashboard');
  const tabSimulator = document.getElementById('tab-btn-simulator');
  const tabSandbox = document.getElementById('tab-btn-sandbox');

  if (tabDashboard) {
    tabDashboard.addEventListener('click', () => {
      if (state.isDataLoaded) onStateChange({ activeTab: 'dashboard' });
    });
  }

  if (tabSimulator) {
    tabSimulator.addEventListener('click', () => {
      if (state.isDataLoaded) onStateChange({ activeTab: 'simulator' });
    });
  }

  if (tabSandbox) {
    tabSandbox.addEventListener('click', () => {
      if (state.isDataLoaded) onStateChange({ activeTab: 'sandbox' });
    });
  }

  // Display initial loading state
  const container = document.getElementById('app-mount-point');
  if (container) {
    container.innerHTML = `
      <div class="app-loading-screen">
        <div class="spinner"></div>
        <p>Connecting to tactical backend... Loading historical data...</p>
      </div>
    `;
  }

  // Fetch initial data
  await fetchInitialData(state.timeRange, state.dataType);
  state.isDataLoaded = true;

  // Initial render
  renderApp();

  // Create floating trigger button for auto demo
  const demoBtn = document.createElement('button');
  demoBtn.id = 'trigger-auto-demo-btn';
  demoBtn.innerHTML = '⚡ 演示自动推演 (Auto Demo)';
  demoBtn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    background: rgba(255, 204, 0, 0.1);
    border: 1px solid var(--color-gold);
    color: var(--color-gold);
    box-shadow: 0 0 10px var(--color-gold-glow);
    font-family: var(--font-tactical);
    font-weight: 700;
    font-size: 0.85rem;
    padding: 0.6rem 1.2rem;
    border-radius: 30px;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
  `;
  
  demoBtn.addEventListener('mouseenter', () => {
    demoBtn.style.background = 'rgba(255, 204, 0, 0.2)';
    demoBtn.style.boxShadow = '0 0 20px var(--color-gold-glow)';
  });
  
  demoBtn.addEventListener('mouseleave', () => {
    demoBtn.style.background = 'rgba(255, 204, 0, 0.1)';
    demoBtn.style.boxShadow = '0 0 10px var(--color-gold-glow)';
  });

  demoBtn.addEventListener('click', () => {
    runDemo(onStateChange);
  });
  
  document.body.appendChild(demoBtn);
});
