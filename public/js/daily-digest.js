// Daily Digest - AI-Generated Morning Briefing for Field Technicians
// Provides intelligent summary of today's priorities, opportunities, and insights

/**
 * Daily Digest System
 *
 * Generates a comprehensive morning briefing that includes:
 * - Today's scheduled jobs and missions
 * - High-priority follow-ups from door knocks
 * - AI-identified opportunities (clustering, routing efficiency)
 * - Performance insights from yesterday
 * - Weather and external factors
 *
 * This implements the human-centered AI pattern where AI provides
 * context and recommendations, but human makes final decisions.
 */

class DailyDigest {
  constructor() {
    this.db = window.db;
    this.currentUser = null;
    this.digestData = null;
  }

  /**
   * Initialize daily digest for current user
   */
  async initialize(user) {
    this.currentUser = user;

    // Check if digest already generated today
    const today = new Date().toISOString().split('T')[0];
    const existingDigest = await this.db.collection('dailyDigests')
      .where('userId', '==', user.uid)
      .where('date', '==', today)
      .limit(1)
      .get();

    if (!existingDigest.empty) {
      // Load existing digest
      this.digestData = existingDigest.docs[0].data();
      return this.digestData;
    }

    // Generate new digest
    return await this.generateDigest();
  }

  /**
   * Generate comprehensive daily digest
   */
  async generateDigest() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const userEmail = this.currentUser?.email || 'unknown';

    // Parallel data fetching for performance
    const [
      scheduledJobs,
      pendingLeads,
      recentInteractions,
      yesterdayStats,
      aiDecisions
    ] = await Promise.all([
      this.getScheduledJobs(userEmail, todayStart, todayEnd),
      this.getPendingLeads(),
      this.getRecentInteractions(userEmail),
      this.getYesterdayStats(userEmail),
      this.getRecentAIDecisions(userEmail)
    ]);

    // Generate AI insights
    const aiInsights = await this.generateAIInsights({
      scheduledJobs,
      pendingLeads,
      recentInteractions,
      yesterdayStats,
      aiDecisions
    });

    // Compile digest
    this.digestData = {
      userId: this.currentUser.uid,
      userEmail: userEmail,
      date: todayStart.toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),

      summary: {
        jobsScheduled: scheduledJobs.length,
        pendingLeads: pendingLeads.length,
        priorityActions: this.identifyPriorityActions(pendingLeads, scheduledJobs),
        estimatedRevenue: this.calculateEstimatedRevenue(scheduledJobs)
      },

      schedule: {
        jobs: scheduledJobs.map(job => ({
          id: job.id,
          time: job.scheduledFor,
          location: job.locationName,
          type: job.type,
          estimatedDuration: job.estimatedHours || 2,
          priority: job.priority || 'medium'
        })),
        gaps: this.identifyScheduleGaps(scheduledJobs),
        conflicts: this.identifyConflicts(scheduledJobs)
      },

      opportunities: {
        hotLeads: pendingLeads.filter(lead =>
          lead.status === 'interested' &&
          this.calculateLeadAge(lead) < 7
        ),
        routeOptimizations: await this.suggestRouteOptimizations(pendingLeads),
        doorKnockClusters: this.identifyDoorKnockClusters(pendingLeads)
      },

      insights: aiInsights,

      yesterdayRecap: {
        jobsCompleted: yesterdayStats.completed || 0,
        revenueGenerated: yesterdayStats.revenue || 0,
        doorKnocksLogged: yesterdayStats.doorKnocks || 0,
        conversions: yesterdayStats.conversions || 0
      },

      recommendations: this.generateRecommendations({
        scheduledJobs,
        pendingLeads,
        yesterdayStats,
        aiInsights
      })
    };

    // Save digest to Firestore
    await this.db.collection('dailyDigests').add(this.digestData);

    return this.digestData;
  }

  /**
   * Get scheduled jobs for today
   */
  async getScheduledJobs(userEmail, todayStart, todayEnd) {
    const snapshot = await this.db.collection('scheduledActions')
      .where('assignedTo', '==', userEmail)
      .where('scheduledFor', '>=', todayStart.toISOString())
      .where('scheduledFor', '<', todayEnd.toISOString())
      .orderBy('scheduledFor', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Get pending leads that need follow-up
   */
  async getPendingLeads() {
    const snapshot = await this.db.collection('locations')
      .where('status', 'in', ['interested', 'pending', 'callback'])
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Get recent interactions (last 7 days)
   */
  async getRecentInteractions(userEmail) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await this.db.collection('interactions')
      .where('userId', '==', userEmail)
      .where('timestamp', '>=', sevenDaysAgo.toISOString())
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Get yesterday's performance stats
   */
  async getYesterdayStats(userEmail) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

    // Get interactions from yesterday
    const interactions = await this.db.collection('interactions')
      .where('userId', '==', userEmail)
      .where('timestamp', '>=', yesterdayStart.toISOString())
      .where('timestamp', '<', yesterdayEnd.toISOString())
      .get();

    // Get door knocks from yesterday
    const doorKnocks = await this.db.collection('contactAttempts')
      .where('loggedBy', '==', userEmail)
      .where('attemptDate', '>=', yesterdayStart.toISOString())
      .where('attemptDate', '<', yesterdayEnd.toISOString())
      .get();

    return {
      completed: interactions.size,
      doorKnocks: doorKnocks.size,
      conversions: doorKnocks.docs.filter(doc =>
        doc.data().outcome === 'interested'
      ).length,
      revenue: 0 // TODO: Calculate from completed work orders
    };
  }

  /**
   * Get recent AI decisions for learning
   */
  async getRecentAIDecisions(userEmail) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await this.db.collection('aiDecisions')
      .where('decidedBy', '==', userEmail)
      .where('decidedAt', '>=', sevenDaysAgo.toISOString())
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Generate AI insights using Gemini
   */
  async generateAIInsights(data) {
    // Check if Gemini is available
    if (!window.geminiAnalyzeDecision) {
      return {
        available: false,
        message: 'AI insights unavailable - Gemini not connected'
      };
    }

    const prompt = `
Analyze this field technician's daily context and provide tactical insights:

TODAY'S SCHEDULE:
- Jobs scheduled: ${data.scheduledJobs.length}
- Pending leads: ${data.pendingLeads.length}
- Yesterday completed: ${data.yesterdayStats.completed}

SCHEDULE DETAILS:
${data.scheduledJobs.map(job =>
  `- ${new Date(job.scheduledFor).toLocaleTimeString()}: ${job.locationName} (${job.type})`
).join('\n')}

PENDING OPPORTUNITIES:
${data.pendingLeads.slice(0, 5).map(lead =>
  `- ${lead.name} (${lead.status}) - Last contact: ${lead.lastContact || 'Never'}`
).join('\n')}

Provide:
1. Top 3 priorities for today (specific actionable items)
2. Time management suggestion (schedule optimization)
3. Revenue opportunity (which leads to focus on)
4. Risk alert (any scheduling conflicts or issues)

Keep response under 150 words, tactical and actionable.
    `;

    try {
      const geminiResponse = await window.geminiAnalyzeDecision(prompt);

      return {
        available: true,
        raw: geminiResponse,
        priorities: this.extractPriorities(geminiResponse),
        timeManagement: this.extractTimeManagement(geminiResponse),
        revenueOpportunity: this.extractRevenueOpportunity(geminiResponse),
        riskAlert: this.extractRiskAlert(geminiResponse)
      };
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      return {
        available: false,
        message: 'AI analysis failed: ' + error.message
      };
    }
  }

  /**
   * Extract priorities from Gemini response
   */
  extractPriorities(response) {
    const lines = response.split('\n');
    const priorities = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^\d\./)) {
        priorities.push(lines[i].replace(/^\d\.\s*/, ''));
      }
    }

    return priorities.slice(0, 3);
  }

  /**
   * Extract time management from Gemini response
   */
  extractTimeManagement(response) {
    const match = response.match(/time\s+management:?\s*(.+?)(?:\n|$)/i);
    return match ? match[1] : 'Optimize schedule by grouping nearby locations';
  }

  /**
   * Extract revenue opportunity from Gemini response
   */
  extractRevenueOpportunity(response) {
    const match = response.match(/revenue\s+opportunity:?\s*(.+?)(?:\n|$)/i);
    return match ? match[1] : 'Focus on interested leads from this week';
  }

  /**
   * Extract risk alert from Gemini response
   */
  extractRiskAlert(response) {
    const match = response.match(/risk\s+alert:?\s*(.+?)(?:\n|$)/i);
    return match ? match[1] : null;
  }

  /**
   * Identify priority actions for today
   */
  identifyPriorityActions(leads, jobs) {
    const actions = [];

    // Critical: Callback scheduled for today
    const todayCallbacks = leads.filter(lead => {
      if (!lead.nextAttemptDate) return false;
      const callbackDate = new Date(lead.nextAttemptDate);
      const today = new Date();
      return callbackDate.toDateString() === today.toDateString();
    });

    if (todayCallbacks.length > 0) {
      actions.push({
        type: 'callback',
        priority: 'critical',
        count: todayCallbacks.length,
        message: `${todayCallbacks.length} callback(s) scheduled for today`
      });
    }

    // High: Hot leads (interested within 3 days)
    const hotLeads = leads.filter(lead => {
      if (lead.status !== 'interested') return false;
      const age = this.calculateLeadAge(lead);
      return age <= 3;
    });

    if (hotLeads.length > 0) {
      actions.push({
        type: 'hot_leads',
        priority: 'high',
        count: hotLeads.length,
        message: `${hotLeads.length} hot lead(s) need follow-up`
      });
    }

    // Medium: Schedule gaps that could fit door knocks
    const gaps = this.identifyScheduleGaps(jobs);
    if (gaps.length > 0) {
      actions.push({
        type: 'door_knock_opportunity',
        priority: 'medium',
        count: gaps.length,
        message: `${gaps.length} schedule gap(s) for door knocking`
      });
    }

    return actions;
  }

  /**
   * Calculate estimated revenue from scheduled jobs
   */
  calculateEstimatedRevenue(jobs) {
    // Rough estimates based on job type
    const rates = {
      'emergency-service': 300,
      'assessment': 150,
      'maintenance': 200,
      'repair': 250,
      'installation': 500
    };

    return jobs.reduce((total, job) => {
      const rate = rates[job.type] || 200;
      const hours = job.estimatedHours || 2;
      return total + (rate * hours);
    }, 0);
  }

  /**
   * Calculate how old a lead is (in days)
   */
  calculateLeadAge(lead) {
    const lastContact = lead.lastContact || lead.firstContact || lead.createdAt;
    if (!lastContact) return 999;

    const contactDate = new Date(lastContact);
    const now = new Date();
    const diffTime = Math.abs(now - contactDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Identify gaps in schedule for door knocking
   */
  identifyScheduleGaps(jobs) {
    if (jobs.length === 0) {
      return [{
        start: '8:00 AM',
        end: '5:00 PM',
        duration: 9,
        type: 'all_day'
      }];
    }

    const gaps = [];
    const sorted = jobs.sort((a, b) =>
      new Date(a.scheduledFor) - new Date(b.scheduledFor)
    );

    // Check morning gap (before first job)
    const firstJob = new Date(sorted[0].scheduledFor);
    const dayStart = new Date(firstJob);
    dayStart.setHours(8, 0, 0, 0);

    if (firstJob - dayStart > 60 * 60 * 1000) { // More than 1 hour
      gaps.push({
        start: dayStart.toLocaleTimeString(),
        end: firstJob.toLocaleTimeString(),
        duration: (firstJob - dayStart) / (1000 * 60 * 60),
        type: 'morning'
      });
    }

    // Check gaps between jobs
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = new Date(sorted[i].scheduledFor);
      currentEnd.setHours(currentEnd.getHours() + (sorted[i].estimatedHours || 2));

      const nextStart = new Date(sorted[i + 1].scheduledFor);

      const gapDuration = (nextStart - currentEnd) / (1000 * 60 * 60);

      if (gapDuration > 1) { // More than 1 hour gap
        gaps.push({
          start: currentEnd.toLocaleTimeString(),
          end: nextStart.toLocaleTimeString(),
          duration: gapDuration,
          type: 'between_jobs'
        });
      }
    }

    return gaps;
  }

  /**
   * Identify scheduling conflicts
   */
  identifyConflicts(jobs) {
    const conflicts = [];
    const sorted = jobs.sort((a, b) =>
      new Date(a.scheduledFor) - new Date(b.scheduledFor)
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = new Date(sorted[i].scheduledFor);
      currentEnd.setHours(currentEnd.getHours() + (sorted[i].estimatedHours || 2));

      const nextStart = new Date(sorted[i + 1].scheduledFor);

      if (currentEnd > nextStart) {
        conflicts.push({
          job1: sorted[i].locationName,
          job2: sorted[i + 1].locationName,
          overlap: (currentEnd - nextStart) / (1000 * 60), // minutes
          severity: 'high'
        });
      }
    }

    return conflicts;
  }

  /**
   * Suggest route optimizations
   */
  async suggestRouteOptimizations(leads) {
    // Group leads by proximity (simple clustering by address prefix)
    const clusters = {};

    leads.forEach(lead => {
      if (!lead.address) return;

      // Simple clustering by first part of address (street/area)
      const area = lead.address.split(',')[0] || 'unknown';

      if (!clusters[area]) {
        clusters[area] = [];
      }
      clusters[area].push(lead);
    });

    // Identify clusters with 3+ leads
    const opportunities = Object.entries(clusters)
      .filter(([area, leads]) => leads.length >= 3)
      .map(([area, leads]) => ({
        area: area,
        count: leads.length,
        leads: leads.map(l => ({ id: l.id, name: l.name, address: l.address })),
        suggestion: `Visit ${area} area - ${leads.length} leads clustered`
      }));

    return opportunities;
  }

  /**
   * Identify door knock clusters
   */
  identifyDoorKnockClusters(leads) {
    const pendingLeads = leads.filter(lead => lead.status === 'pending');

    // Group by address area
    const areas = {};
    pendingLeads.forEach(lead => {
      if (!lead.address) return;
      const area = lead.address.split(',')[0] || 'unknown';
      if (!areas[area]) areas[area] = 0;
      areas[area]++;
    });

    return Object.entries(areas)
      .filter(([area, count]) => count >= 2)
      .map(([area, count]) => ({
        area: area,
        count: count,
        priority: count >= 5 ? 'high' : 'medium'
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(data) {
    const recommendations = [];

    // Empty schedule → Door knock
    if (data.scheduledJobs.length === 0) {
      recommendations.push({
        type: 'door_knock',
        priority: 'high',
        message: 'No jobs scheduled - focus on door knocking today',
        action: 'Start door knock route in high-density commercial area'
      });
    }

    // Hot leads → Follow up
    const hotLeads = data.pendingLeads.filter(lead =>
      lead.status === 'interested' && this.calculateLeadAge(lead) <= 3
    );

    if (hotLeads.length > 0) {
      recommendations.push({
        type: 'follow_up',
        priority: 'critical',
        message: `${hotLeads.length} hot leads need immediate follow-up`,
        action: 'Call/visit interested leads before they cool down'
      });
    }

    // Good yesterday → Keep momentum
    if (data.yesterdayStats.completed >= 3) {
      recommendations.push({
        type: 'momentum',
        priority: 'low',
        message: 'Strong performance yesterday - maintain momentum',
        action: 'Target similar number of completions today'
      });
    }

    // AI insights available
    if (data.aiInsights?.available) {
      recommendations.push({
        type: 'ai_insight',
        priority: 'medium',
        message: 'AI Boss has tactical recommendations',
        action: 'Review AI insights below for optimizations'
      });
    }

    return recommendations;
  }

  /**
   * Display daily digest modal
   */
  async showDigestModal() {
    if (!this.digestData) {
      await this.initialize(window.currentUser);
    }

    const modal = document.createElement('div');
    modal.id = 'daily-digest-modal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal-content digest-modal-content">
        <div class="modal-header digest-header">
          <h2>☀️ Daily Digest - ${new Date().toLocaleDateString()}</h2>
          <button class="close-btn" onclick="closeDailyDigest()">×</button>
        </div>

        <div class="digest-body">
          ${this.renderDigestSummary()}
          ${this.renderSchedule()}
          ${this.renderOpportunities()}
          ${this.renderAIInsights()}
          ${this.renderYesterdayRecap()}
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeDailyDigest()">
            LET'S GO! 🚀
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  renderDigestSummary() {
    const { summary } = this.digestData;

    return `
      <div class="digest-section">
        <h3>📊 Today's Overview</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-value">${summary.jobsScheduled}</div>
            <div class="summary-label">Jobs Scheduled</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${summary.pendingLeads}</div>
            <div class="summary-label">Pending Leads</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">$${summary.estimatedRevenue}</div>
            <div class="summary-label">Est. Revenue</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${summary.priorityActions.length}</div>
            <div class="summary-label">Priority Actions</div>
          </div>
        </div>

        ${summary.priorityActions.length > 0 ? `
          <div class="priority-actions">
            <h4>🎯 Priority Actions</h4>
            ${summary.priorityActions.map(action => `
              <div class="priority-action ${action.priority}">
                <span class="action-icon">${action.priority === 'critical' ? '🚨' : action.priority === 'high' ? '⚡' : '📌'}</span>
                <span class="action-message">${action.message}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderSchedule() {
    const { schedule } = this.digestData;

    if (schedule.jobs.length === 0) {
      return `
        <div class="digest-section">
          <h3>📅 Today's Schedule</h3>
          <p class="empty-state">No jobs scheduled - Perfect day for door knocking!</p>
        </div>
      `;
    }

    return `
      <div class="digest-section">
        <h3>📅 Today's Schedule</h3>
        <div class="schedule-timeline">
          ${schedule.jobs.map(job => `
            <div class="schedule-item priority-${job.priority}">
              <div class="schedule-time">${new Date(job.time).toLocaleTimeString()}</div>
              <div class="schedule-details">
                <div class="schedule-location">${job.location}</div>
                <div class="schedule-type">${job.type} • ~${job.estimatedDuration}h</div>
              </div>
            </div>
          `).join('')}
        </div>

        ${schedule.gaps.length > 0 ? `
          <div class="schedule-gaps">
            <h4>⏰ Schedule Gaps (Door Knock Opportunities)</h4>
            ${schedule.gaps.map(gap => `
              <div class="gap-item">
                ${gap.start} - ${gap.end} (${gap.duration.toFixed(1)}h)
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${schedule.conflicts.length > 0 ? `
          <div class="schedule-conflicts">
            <h4>⚠️ Scheduling Conflicts</h4>
            ${schedule.conflicts.map(conflict => `
              <div class="conflict-item">
                ${conflict.job1} overlaps with ${conflict.job2} by ${conflict.overlap} minutes
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderOpportunities() {
    const { opportunities } = this.digestData;

    return `
      <div class="digest-section">
        <h3>💰 Revenue Opportunities</h3>

        ${opportunities.hotLeads.length > 0 ? `
          <div class="hot-leads">
            <h4>🔥 Hot Leads (Follow Up Now!)</h4>
            ${opportunities.hotLeads.slice(0, 5).map(lead => `
              <div class="hot-lead-item">
                <strong>${lead.name}</strong> - ${lead.address}
                <span class="lead-age">${this.calculateLeadAge(lead)}d ago</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${opportunities.doorKnockClusters.length > 0 ? `
          <div class="door-knock-clusters">
            <h4>📍 Door Knock Clusters</h4>
            ${opportunities.doorKnockClusters.slice(0, 3).map(cluster => `
              <div class="cluster-item priority-${cluster.priority}">
                ${cluster.area} - ${cluster.count} locations
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderAIInsights() {
    const { insights } = this.digestData;

    if (!insights.available) {
      return `
        <div class="digest-section">
          <h3>🤖 AI Boss Insights</h3>
          <p class="empty-state">${insights.message}</p>
        </div>
      `;
    }

    return `
      <div class="digest-section ai-insights">
        <h3>🤖 AI Boss Tactical Guidance</h3>

        ${insights.priorities.length > 0 ? `
          <div class="ai-priorities">
            <h4>Top Priorities:</h4>
            <ol>
              ${insights.priorities.map(p => `<li>${p}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        ${insights.timeManagement ? `
          <div class="ai-time-management">
            <strong>⏱️ Time Management:</strong> ${insights.timeManagement}
          </div>
        ` : ''}

        ${insights.revenueOpportunity ? `
          <div class="ai-revenue">
            <strong>💰 Revenue Opportunity:</strong> ${insights.revenueOpportunity}
          </div>
        ` : ''}

        ${insights.riskAlert ? `
          <div class="ai-risk-alert">
            <strong>⚠️ Risk Alert:</strong> ${insights.riskAlert}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderYesterdayRecap() {
    const { yesterdayRecap } = this.digestData;

    return `
      <div class="digest-section yesterday-recap">
        <h3>📈 Yesterday's Performance</h3>
        <div class="recap-grid">
          <div class="recap-item">
            <div class="recap-value">${yesterdayRecap.jobsCompleted}</div>
            <div class="recap-label">Jobs Completed</div>
          </div>
          <div class="recap-item">
            <div class="recap-value">${yesterdayRecap.doorKnocksLogged}</div>
            <div class="recap-label">Door Knocks</div>
          </div>
          <div class="recap-item">
            <div class="recap-value">${yesterdayRecap.conversions}</div>
            <div class="recap-label">Conversions</div>
          </div>
          <div class="recap-item">
            <div class="recap-value">${((yesterdayRecap.conversions / Math.max(yesterdayRecap.doorKnocksLogged, 1)) * 100).toFixed(0)}%</div>
            <div class="recap-label">Conversion Rate</div>
          </div>
        </div>
      </div>
    `;
  }
}

// Close digest modal
function closeDailyDigest() {
  const modal = document.getElementById('daily-digest-modal');
  if (modal) {
    modal.remove();
  }
}

// Initialize and show digest when user logs in
async function initializeDailyDigest(user) {
  const digest = new DailyDigest();
  await digest.initialize(user);

  // Check if user has seen digest today
  const today = new Date().toISOString().split('T')[0];
  const lastViewed = localStorage.getItem('lastDigestViewed');

  if (lastViewed !== today) {
    // Show digest automatically
    setTimeout(() => {
      digest.showDigestModal();
      localStorage.setItem('lastDigestViewed', today);
    }, 1000); // Delay 1s after login
  }

  return digest;
}

// Make globally available
window.DailyDigest = DailyDigest;
window.initializeDailyDigest = initializeDailyDigest;
window.closeDailyDigest = closeDailyDigest;
