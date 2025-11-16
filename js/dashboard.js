// Dashboard and KPI Logic

async function loadKPIs(retryCount = 0) {
  try {
    const result = await functions.httpsCallable('getKPIs')();

    if (result.data.success) {
      const kpis = result.data.kpis;

      document.getElementById('kpi-completed').textContent = kpis.totalCompleted || 0;
      document.getElementById('kpi-pending').textContent = kpis.totalPending || 0;
      document.getElementById('kpi-efficacy').textContent = (kpis.avgEfficacyScore || 0).toFixed(1);
    }
  } catch (error) {
    console.error('Error loading KPIs:', error);

    // Retry up to 2 times on internal errors
    if (retryCount < 2 && error.code === 'internal') {
      console.log(`Retrying KPI load (attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadKPIs(retryCount + 1);
    }
  }
}

// Reload KPIs periodically
setInterval(() => {
  if (currentUser) {
    loadKPIs();
  }
}, 30000); // Every 30 seconds

// ========================================
// STATS DRAWER TOGGLE
// ========================================

const statsToggleBtn = document.getElementById('stats-toggle-btn');
const kpiGrid = document.getElementById('kpi-grid');

if (statsToggleBtn && kpiGrid) {
  statsToggleBtn.addEventListener('click', () => {
    const isExpanded = statsToggleBtn.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      // Collapse
      statsToggleBtn.setAttribute('aria-expanded', 'false');
      kpiGrid.classList.remove('expanded');
      kpiGrid.classList.add('collapsed');
    } else {
      // Expand
      statsToggleBtn.setAttribute('aria-expanded', 'true');
      kpiGrid.classList.remove('collapsed');
      kpiGrid.classList.add('expanded');
    }
  });
}

// ========================================
// HERO MISSION CARD FUNCTIONALITY
// ========================================

// Update hero card to show current mission status
function updateHeroCard(mission) {
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroStatus = document.getElementById('hero-status');
  const heroDetails = document.getElementById('hero-details');
  const heroActionBtn = document.getElementById('hero-action-btn');
  const heroAddress = document.getElementById('hero-address');
  const heroDistance = document.getElementById('hero-distance');
  const heroPriority = document.getElementById('hero-priority');

  if (mission) {
    // Mission active
    heroTitle.textContent = mission.name || 'Active Mission';
    heroSubtitle.textContent = 'Navigate to location and complete your objective';

    // Update status indicator
    const statusIndicator = heroStatus.querySelector('.status-indicator');
    const statusText = heroStatus.querySelector('.status-text');
    statusIndicator.style.background = 'var(--secondary-color)';
    statusIndicator.style.boxShadow = '0 0 15px var(--secondary-color)';
    statusText.textContent = 'MISSION IN PROGRESS';
    statusText.style.color = 'var(--secondary-color)';

    // Show mission details
    heroDetails.classList.remove('hidden');
    heroAddress.textContent = mission.address || '-';
    heroDistance.textContent = mission.distanceMiles ? `${mission.distanceMiles} mi away` : '-';
    heroPriority.textContent = mission.type || 'Commercial Kitchen';

    // Update action button
    heroActionBtn.innerHTML = '<span class="btn-icon">📍</span> VIEW ON MAP';
    heroActionBtn.onclick = () => {
      if (typeof highlightMission === 'function') {
        highlightMission(mission);
      }
      // Scroll to map
      document.querySelector('.map-container')?.scrollIntoView({ behavior: 'smooth' });
    };

  } else {
    // No active mission
    heroTitle.textContent = 'No Active Mission';
    heroSubtitle.textContent = 'Clock in to receive your next tactical assignment';

    // Update status indicator
    const statusIndicator = heroStatus.querySelector('.status-indicator');
    const statusText = heroStatus.querySelector('.status-text');
    statusIndicator.style.background = 'var(--success-color)';
    statusIndicator.style.boxShadow = '0 0 15px var(--success-color)';
    statusText.textContent = 'READY FOR DEPLOYMENT';
    statusText.style.color = 'var(--success-color)';

    // Hide mission details
    heroDetails.classList.add('hidden');

    // Reset action button
    heroActionBtn.innerHTML = '<span class="btn-icon">⚡</span> CLOCK IN & GET MISSION';
    heroActionBtn.onclick = () => {
      document.getElementById('clock-in-btn')?.click();
    };
  }
}

// Initialize hero card on page load
document.addEventListener('DOMContentLoaded', () => {
  updateHeroCard(null);
});
