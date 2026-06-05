import { TEAMS } from './teamsData.js';

export async function runDemo(onStateChange) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Create a overlay visual notification to show step-by-step description
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100000;
    background: rgba(7, 9, 13, 0.9);
    border: 1px solid var(--color-green);
    box-shadow: 0 0 20px var(--color-green-glow);
    color: var(--color-green);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-family: var(--font-tactical);
    font-weight: 700;
    font-size: 0.9rem;
    pointer-events: none;
    transition: all 0.3s ease;
    text-align: center;
    backdrop-filter: blur(8px);
  `;
  document.body.appendChild(overlay);

  const updateMessage = (text) => {
    overlay.innerHTML = `🤖 自动演示中 (Demo Mode): ${text}`;
  };

  updateMessage('准备开始自动演示，请开始录屏...');
  await delay(2000);

  // 1. Switch Left Panel to Blueprint View
  updateMessage('切换左侧面板到“地图战术平面图”...');
  onStateChange({ dashboardLeftTab: 'blueprint' });
  await delay(1800);

  // 2. Select Dust2 map blueprint
  updateMessage('选择“炙热沙城2 (Dust2)”平面图...');
  onStateChange({ dashboardSelectedMap: 'Dust2' });
  await delay(1800);

  // 3. Select Ancient map blueprint
  updateMessage('选择“远古遗迹 (Ancient)”平面图...');
  onStateChange({ dashboardSelectedMap: 'Ancient' });
  await delay(1800);

  // 4. Switch Left Panel back to Radar Chart
  updateMessage('切换回“阵营胜率平衡雷达图”...');
  onStateChange({ dashboardLeftTab: 'radar' });
  await delay(1500);

  // 5. Change Selected Team A to Spirit to see radar update
  updateMessage('将 战队 A 切换为 Spirit，观察雷达胜率发生偏转及自适应重绘...');
  onStateChange({ selectedTeamA: 'Spirit' });
  await delay(2200);

  // 6. Navigate to Veto Simulator Tab
  updateMessage('前往“智能 BP 模拟器”标签页...');
  onStateChange({ activeTab: 'simulator' });
  await delay(1800);

  // 7. Complete the Veto process automatically
  updateMessage('开始模拟智能 Veto (Ban/Pick) 博弈选择...');
  let stepCount = 1;
  while (true) {
    const adoptBtn = document.querySelector('.apply-rec-btn');
    const importBtn = document.querySelector('#bp-import-sandbox-btn');
    
    if (adoptBtn && !importBtn) {
      updateMessage(`智能博弈推演：正在采纳第 ${stepCount} 步的最优 Veto 推荐...`);
      adoptBtn.click();
      stepCount++;
      await delay(1500);
    } else {
      break;
    }
  }
  await delay(1000);

  // 8. Import into Match Sandbox
  updateMessage('Veto 完成！点击“导入战术沙盘推演”把所选地图载入沙盘...');
  const importBtn = document.querySelector('#bp-import-sandbox-btn');
  if (importBtn) {
    importBtn.click();
    await delay(2200);
  }

  // 9. Match Sandbox: Apply optimal tactic
  updateMessage('推演沙盘载入成功！点击“一键应用最优战术”...');
  const applyOptBtn = document.querySelector('#sandbox-apply-opt-btn');
  if (applyOptBtn) {
    applyOptBtn.click();
    await delay(1800);
  }

  // 10. Simulate Round 1, 2, 3
  for (let r = 1; r <= 3; r++) {
    updateMessage(`推演模拟：执行单回合推演 (Round ${r})...`);
    const simRoundBtn = document.querySelector('#sandbox-sim-round-btn');
    if (simRoundBtn) {
      simRoundBtn.click();
      await delay(1800);
      
      // Auto scroll sandbox feed
      const feed = document.getElementById('sandbox-commentary-feed');
      if (feed) feed.scrollTop = feed.scrollHeight;
    }
  }

  // 11. Run Quick Map Simulation
  updateMessage('推演模拟：一键完成当前地图后续所有回合的概率推演...');
  const simMapBtn = document.querySelector('#sandbox-sim-map-btn');
  if (simMapBtn) {
    simMapBtn.click();
    await delay(2200);
  }

  // Done!
  overlay.style.borderColor = 'var(--color-gold)';
  overlay.style.boxShadow = '0 0 20px var(--color-gold-glow)';
  overlay.style.color = 'var(--color-gold)';
  updateMessage('🎉 全流程演示顺利结束！您可以关闭录屏软件。');
  
  await delay(4000);
  overlay.remove();
}
