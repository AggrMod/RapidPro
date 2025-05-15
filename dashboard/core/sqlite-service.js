/**
 * SQLite Database Service
 * Handles database initialization, operations, and synchronization for the unified dashboard
 */

// Import required libraries
// In a real implementation, we would use these libraries:
// import SQLite from 'capacitor-sqlite';
// import { Capacitor } from '@capacitor/core';
// import { NetworkStatus } from '@capacitor/network';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.pendingSyncCount = 0;
    this.networkStatus = 'unknown';
    this.listeners = [];
  }

  /**
   * Initialize the database
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('Initializing SQLite database...');

      // In a real implementation, this would use Capacitor SQLite plugin
      // const sqlite = new SQLite();
      // this.db = await sqlite.createConnection('unified_dashboard_db');
      // await this.db.open();

      // For demo purposes, simulate db connection
      this.db = { 
        execute: async (sql, params) => { 
          console.log(`Executing SQL: ${sql.substring(0, 50)}...`);
          return { changes: { changes: 1 } };
        },
        query: async (sql, params) => {
          console.log(`Querying SQL: ${sql.substring(0, 50)}...`);
          return { values: [] };
        },
        run: async (sql, params) => {
          console.log(`Running SQL: ${sql.substring(0, 50)}...`);
          return { changes: 1 };
        },
        executeSet: async (statements) => {
          console.log(`Executing ${statements.length} statements`);
          return { changes: { changes: statements.length } };
        }
      };

      // Load schema and create tables if needed
      await this.createSchema();

      // Set up network listeners for sync
      this.setupNetworkListeners();

      // Initialize sync status
      await this.checkPendingSyncCount();

      this.isInitialized = true;
      console.log('Database initialized successfully');
      
      // Initial sync if online
      if (await this.isOnline()) {
        this.sync();
      }

      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  /**
   * Create database schema
   */
  async createSchema() {
    try {
      console.log('Creating/updating database schema...');

      // In a real implementation, we would load SQL from a file
      // const schemaSQL = await fetch('/sqlite-data-structure.sql').then(res => res.text());
      
      // For demo purposes, use a simplified schema
      const schemaSQL = `
        -- This is a simplified version of the schema for demo purposes
        -- Core tables
        CREATE TABLE IF NOT EXISTS providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            service_vertical TEXT NOT NULL,
            provider_tier TEXT NOT NULL,
            business_context TEXT NOT NULL,
            rating REAL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_sync TEXT NOT NULL,
            sync_status TEXT DEFAULT 'synced'
        );

        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT UNIQUE,
            name TEXT NOT NULL,
            business_name TEXT,
            address TEXT,
            service_vertical TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_sync TEXT NOT NULL,
            sync_status TEXT DEFAULT 'synced'
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT UNIQUE,
            provider_id INTEGER NOT NULL,
            customer_id INTEGER NOT NULL,
            service_type TEXT NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_sync TEXT NOT NULL,
            sync_status TEXT DEFAULT 'synced',
            is_offline_created INTEGER DEFAULT 0,
            FOREIGN KEY (provider_id) REFERENCES providers(id),
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        );

        -- Sync management
        CREATE TABLE IF NOT EXISTS sync_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sync_start TEXT NOT NULL,
            sync_end TEXT,
            status TEXT NOT NULL,
            tables_synced TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pending_sync_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            record_id INTEGER NOT NULL,
            operation TEXT NOT NULL,
            data TEXT,
            created_at TEXT NOT NULL
        );
      `;

      // Split schema into individual statements and execute
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)
        .map(stmt => ({ statement: stmt, values: [] }));

      if (statements.length > 0) {
        // Execute all schema statements in a transaction
        await this.db.executeSet({ statements });
      }

      console.log('Schema created/updated successfully');
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  }

  /**
   * Set up network status listeners
   */
  setupNetworkListeners() {
    console.log('Setting up network listeners...');

    // In a real implementation with Capacitor
    // NetworkStatus.addListener('networkStatusChange', (status) => {
    //   this.networkStatus = status.connected ? 'online' : 'offline';
    //   this.notifyListeners('networkStatusChange', this.networkStatus);
    //   
    //   // If we just came online and have pending syncs, start sync
    //   if (status.connected && this.pendingSyncCount > 0) {
    //     this.sync();
    //   }
    // });
    // 
    // NetworkStatus.getStatus().then(status => {
    //   this.networkStatus = status.connected ? 'online' : 'offline';
    // });

    // For demo purposes, simulate always online
    this.networkStatus = 'online';
  }

  /**
   * Check if device is online
   * @returns {Promise<boolean>} Whether device is online
   */
  async isOnline() {
    // In a real implementation with Capacitor
    // const status = await NetworkStatus.getStatus();
    // return status.connected;
    
    // For demo purposes, simulate always online
    return this.networkStatus === 'online';
  }

  /**
   * Get count of pending sync items
   * @returns {Promise<number>} Count of pending sync items
   */
  async checkPendingSyncCount() {
    try {
      const result = await this.db.query(`
        SELECT COUNT(*) as count FROM pending_sync_items
      `);
      
      this.pendingSyncCount = result.values[0]?.count || 0;
      this.notifyListeners('syncStatusChange', {
        pendingCount: this.pendingSyncCount,
        lastSync: this.lastSyncTime,
        inProgress: this.syncInProgress
      });
      
      return this.pendingSyncCount;
    } catch (error) {
      console.error('Error checking pending sync count:', error);
      return 0;
    }
  }

  /**
   * Add a record to the database
   * @param {string} table Table name
   * @param {Object} data Record data
   * @param {boolean} offlineCreated Whether record was created offline
   * @returns {Promise<number>} ID of the new record
   */
  async addRecord(table, data, offlineCreated = false) {
    try {
      // Add timestamps
      const now = new Date().toISOString();
      const record = {
        ...data,
        created_at: now,
        updated_at: now,
        last_sync: offlineCreated ? null : now,
        sync_status: offlineCreated ? 'pending' : 'synced'
      };

      // Add offline created flag if applicable and table supports it
      if (offlineCreated && table === 'jobs') {
        record.is_offline_created = 1;
      }

      // Build SQL statement
      const keys = Object.keys(record);
      const values = Object.values(record);
      const placeholders = keys.map(() => '?').join(', ');
      
      const sql = `
        INSERT INTO ${table} (${keys.join(', ')})
        VALUES (${placeholders})
      `;
      
      // Execute insert
      const result = await this.db.run(sql, values);
      const id = result.changes.lastId;

      // Add to sync queue if created offline
      if (offlineCreated) {
        await this.addToSyncQueue(table, id, 'insert', record);
        await this.checkPendingSyncCount();
      }

      return id;
    } catch (error) {
      console.error(`Error adding record to ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update a record in the database
   * @param {string} table Table name
   * @param {number} id Record ID
   * @param {Object} data Record data
   * @param {boolean} offlineUpdate Whether update was made offline
   * @returns {Promise<boolean>} Whether update was successful
   */
  async updateRecord(table, id, data, offlineUpdate = false) {
    try {
      // Add timestamps
      const now = new Date().toISOString();
      const record = {
        ...data,
        updated_at: now,
        sync_status: offlineUpdate ? 'pending' : 'synced'
      };

      // Build SQL statement
      const setStatements = Object.keys(record).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(record), id];
      
      const sql = `
        UPDATE ${table}
        SET ${setStatements}
        WHERE id = ?
      `;
      
      // Execute update
      await this.db.run(sql, values);

      // Add to sync queue if updated offline
      if (offlineUpdate) {
        await this.addToSyncQueue(table, id, 'update', record);
        await this.checkPendingSyncCount();
      }

      return true;
    } catch (error) {
      console.error(`Error updating record in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record from the database
   * @param {string} table Table name
   * @param {number} id Record ID
   * @param {boolean} offlineDelete Whether delete was made offline
   * @returns {Promise<boolean>} Whether delete was successful
   */
  async deleteRecord(table, id, offlineDelete = false) {
    try {
      // If offline delete, mark for deletion instead of actually deleting
      if (offlineDelete) {
        await this.updateRecord(table, id, { sync_status: 'delete' }, true);
        await this.addToSyncQueue(table, id, 'delete');
        await this.checkPendingSyncCount();
        return true;
      }
      
      // Otherwise, actually delete the record
      const sql = `DELETE FROM ${table} WHERE id = ?`;
      await this.db.run(sql, [id]);
      
      return true;
    } catch (error) {
      console.error(`Error deleting record from ${table}:`, error);
      throw error;
    }
  }

  /**
   * Query records from the database
   * @param {string} sql SQL query
   * @param {Array} params Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(sql, params = []) {
    try {
      const result = await this.db.query(sql, params);
      return result.values || [];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * Find records in a table
   * @param {string} table Table name
   * @param {Object} conditions Query conditions
   * @param {Object} options Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Query results
   */
  async findRecords(table, conditions = {}, options = {}) {
    try {
      let whereClause = '';
      let params = [];
      
      // Build where clause from conditions
      if (Object.keys(conditions).length > 0) {
        const whereStatements = Object.keys(conditions).map(key => `${key} = ?`);
        whereClause = `WHERE ${whereStatements.join(' AND ')}`;
        params = Object.values(conditions);
      }
      
      // Add order by if specified
      let orderClause = '';
      if (options.orderBy) {
        orderClause = `ORDER BY ${options.orderBy}`;
      }
      
      // Add limit and offset if specified
      let limitClause = '';
      if (options.limit) {
        limitClause = `LIMIT ${options.limit}`;
        
        if (options.offset) {
          limitClause += ` OFFSET ${options.offset}`;
        }
      }
      
      // Build full query
      const sql = `
        SELECT * FROM ${table}
        ${whereClause}
        ${orderClause}
        ${limitClause}
      `;
      
      // Execute query
      return await this.query(sql, params);
    } catch (error) {
      console.error(`Error finding records in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Add a record to the sync queue
   * @param {string} table Table name
   * @param {number} id Record ID
   * @param {string} operation Operation type (insert, update, delete)
   * @param {Object} data Record data
   * @returns {Promise<boolean>} Whether add was successful
   */
  async addToSyncQueue(table, id, operation, data = null) {
    try {
      const now = new Date().toISOString();
      const serializedData = data ? JSON.stringify(data) : null;
      
      const sql = `
        INSERT INTO pending_sync_items (table_name, record_id, operation, data, created_at)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await this.db.run(sql, [table, id, operation, serializedData, now]);
      
      return true;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  /**
   * Synchronize database with server
   * @returns {Promise<boolean>} Whether sync was successful
   */
  async sync() {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return false;
    }
    
    if (!(await this.isOnline())) {
      console.log('Cannot sync while offline');
      return false;
    }
    
    try {
      this.syncInProgress = true;
      this.notifyListeners('syncStatusChange', {
        pendingCount: this.pendingSyncCount,
        lastSync: this.lastSyncTime,
        inProgress: true
      });
      
      console.log('Starting database sync...');
      
      // Start sync log
      const syncStart = new Date().toISOString();
      await this.db.run(`
        INSERT INTO sync_log (sync_start, status, created_at)
        VALUES (?, 'in_progress', ?)
      `, [syncStart, syncStart]);

      // Get pending sync items
      const pendingItems = await this.query(`
        SELECT * FROM pending_sync_items
        ORDER BY created_at ASC
      `);
      
      // Process each item (in a real implementation, we would batch these and handle conflicts)
      const syncedTables = new Set();
      let itemsSent = 0;
      
      for (const item of pendingItems) {
        try {
          // In a real implementation, we would send to server
          // await this.sendToServer(item);
          
          // For demo purposes, simulate successful sync
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Mark the original record as synced
          if (item.operation !== 'delete') {
            await this.db.run(`
              UPDATE ${item.table_name}
              SET sync_status = 'synced', last_sync = ?
              WHERE id = ?
            `, [new Date().toISOString(), item.record_id]);
          } else {
            // For deletes, actually delete the record now
            await this.db.run(`
              DELETE FROM ${item.table_name}
              WHERE id = ? AND sync_status = 'delete'
            `, [item.record_id]);
          }
          
          // Remove from pending queue
          await this.db.run(`
            DELETE FROM pending_sync_items
            WHERE id = ?
          `, [item.id]);
          
          syncedTables.add(item.table_name);
          itemsSent++;
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }
      
      // Download updates from server
      // In a real implementation, we would get updates from server
      // const serverUpdates = await this.getUpdatesFromServer(this.lastSyncTime);
      
      // For demo purposes, simulate server updates
      const itemsReceived = 0;
      
      // Complete sync log
      const syncEnd = new Date().toISOString();
      await this.db.run(`
        UPDATE sync_log
        SET sync_end = ?, status = 'completed', tables_synced = ?
        WHERE sync_start = ?
      `, [syncEnd, Array.from(syncedTables).join(','), syncStart]);
      
      // Update status
      this.lastSyncTime = syncEnd;
      await this.checkPendingSyncCount();
      
      console.log(`Sync completed. Sent: ${itemsSent}, Received: ${itemsReceived}`);
      
      return true;
    } catch (error) {
      console.error('Error during sync:', error);
      
      // Log sync failure
      await this.db.run(`
        UPDATE sync_log
        SET status = 'failed', error_message = ?
        WHERE status = 'in_progress'
      `, [error.message]);
      
      return false;
    } finally {
      this.syncInProgress = false;
      this.notifyListeners('syncStatusChange', {
        pendingCount: this.pendingSyncCount,
        lastSync: this.lastSyncTime,
        inProgress: false
      });
    }
  }

  /**
   * Add a listener for database events
   * @param {string} event Event name
   * @param {Function} callback Callback function
   */
  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove a listener for database events
   * @param {string} event Event name
   * @param {Function} callback Callback function
   */
  removeListener(event, callback) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Notify listeners of an event
   * @param {string} event Event name
   * @param {any} data Event data
   */
  notifyListeners(event, data) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Get service providers
   * @param {Object} options Query options
   * @returns {Promise<Array>} Service providers
   */
  async getProviders(options = {}) {
    return this.findRecords('providers', {}, options);
  }

  /**
   * Get customers
   * @param {Object} options Query options
   * @returns {Promise<Array>} Customers
   */
  async getCustomers(options = {}) {
    return this.findRecords('customers', {}, options);
  }

  /**
   * Get today's jobs
   * @param {number} providerId Provider ID
   * @returns {Promise<Array>} Today's jobs
   */
  async getTodayJobs(providerId) {
    const today = new Date().toISOString().split('T')[0];
    
    return this.query(`
      SELECT j.*, c.name as customer_name, c.business_name as customer_business, c.address as customer_address
      FROM jobs j
      JOIN customers c ON j.customer_id = c.id
      WHERE j.provider_id = ? AND j.date = ?
      ORDER BY j.start_time
    `, [providerId, today]);
  }

  /**
   * Get upcoming jobs
   * @param {number} providerId Provider ID
   * @param {number} limit Number of jobs to get
   * @returns {Promise<Array>} Upcoming jobs
   */
  async getUpcomingJobs(providerId, limit = 5) {
    const today = new Date().toISOString().split('T')[0];
    
    return this.query(`
      SELECT j.*, c.name as customer_name, c.business_name as customer_business
      FROM jobs j
      JOIN customers c ON j.customer_id = c.id
      WHERE j.provider_id = ? AND j.date >= ? AND j.status != 'completed' AND j.status != 'cancelled'
      ORDER BY j.date, j.start_time
      LIMIT ?
    `, [providerId, today, limit]);
  }

  /**
   * Get performance metrics
   * @param {number} providerId Provider ID
   * @param {string} period Period type (daily, weekly, monthly)
   * @param {number} limit Number of periods to get
   * @returns {Promise<Array>} Performance metrics
   */
  async getPerformanceMetrics(providerId, period = 'daily', limit = 30) {
    return this.query(`
      SELECT *
      FROM performance_metrics
      WHERE provider_id = ? AND period = ?
      ORDER BY date DESC
      LIMIT ?
    `, [providerId, period, limit]);
  }

  /**
   * Get team performance (for team leaders)
   * @param {number} teamLeaderId Team leader ID
   * @returns {Promise<Array>} Team performance data
   */
  async getTeamPerformance(teamLeaderId) {
    return this.query(`
      SELECT 
        p.id,
        p.first_name || ' ' || p.last_name AS name,
        p.rating,
        p.rating_count,
        p.completed_jobs,
        (
          SELECT COUNT(*) 
          FROM jobs 
          WHERE provider_id = p.id AND status = 'completed' AND date >= date('now', '-7 days')
        ) AS recent_jobs
      FROM providers p
      WHERE p.team_leader_id = ?
      ORDER BY p.rating DESC
    `, [teamLeaderId]);
  }

  /**
   * Get alerts
   * @param {number} providerId Provider ID
   * @param {number} limit Number of alerts to get
   * @returns {Promise<Array>} Alerts
   */
  async getAlerts(providerId, limit = 10) {
    return this.query(`
      SELECT *
      FROM alerts
      WHERE provider_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [providerId, limit]);
  }

  /**
   * Get growth opportunities
   * @param {string} serviceVertical Service vertical
   * @param {string} providerTier Provider tier
   * @param {number} limit Number of opportunities to get
   * @returns {Promise<Array>} Growth opportunities
   */
  async getGrowthOpportunities(serviceVertical, providerTier, limit = 5) {
    return this.query(`
      SELECT *
      FROM growth_opportunities
      WHERE service_vertical = ? AND provider_tier = ? AND is_completed = 0
      ORDER BY created_at DESC
      LIMIT ?
    `, [serviceVertical, providerTier, limit]);
  }

  /**
   * Get bridge building relationships
   * @param {number} providerId Provider ID
   * @returns {Promise<Array>} Bridge building relationships
   */
  async getBridgeBuildingRelationships(providerId) {
    return this.query(`
      SELECT r.*, 
        (
          SELECT COUNT(*) 
          FROM bridge_building_interactions 
          WHERE relationship_id = r.id
        ) AS interaction_count,
        (
          SELECT MAX(date) 
          FROM bridge_building_interactions 
          WHERE relationship_id = r.id
        ) AS last_interaction_date
      FROM bridge_building_relationships r
      WHERE r.provider_id = ?
      ORDER BY 
        CASE r.status
          WHEN 'follow_up' THEN 1
          WHEN 'initial_contact' THEN 2
          WHEN 'proposal' THEN 3
          WHEN 'converted' THEN 4
          WHEN 'declined' THEN 5
        END,
        r.next_action_date
    `, [providerId]);
  }
}

// Create and export singleton instance
const databaseService = new DatabaseService();

// Export the service
if (typeof module !== 'undefined' && module.exports) {
  module.exports = databaseService;
} else {
  window.databaseService = databaseService;
}