// Dashboard and KPI Logic

async function loadKPIs(retryCount = 0) {
  try {
    const result = await functions.httpsCallable('getKPIs')();

    if (result.data.success) {
      const kpis = result.data.kpis;

      document.getElementById('kpi-completed').textContent = kpis.totalCompleted || 0;
      document.getElementById('kpi-pending').textContent = kpis.totalPending || 0;
      document.getElementById('kpi-efficacy').textContent = (kpis.avgEfficacyScore || 0).toFixed(1);
      document.getElementById('kpi-total').textContent = kpis.totalInteractions || 0;
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
