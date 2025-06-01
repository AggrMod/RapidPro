-- SQLite database schema for Unified Dashboard
-- This schema supports both Memphis Cleaning and Rapid Pro Maintenance applications
-- with common tables for core functionality and service-specific extensions

-- =====================
-- Core Tables
-- =====================

-- Users/Providers table
CREATE TABLE providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,         -- External auth user ID
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    profile_image TEXT,                   -- URL to profile image
    service_vertical TEXT NOT NULL,       -- 'cleaning_services', 'kitchen_maintenance', 'lawn_care'
    provider_tier TEXT NOT NULL,          -- 'certified_technician', 'elite_technician', 'territory_leader'
    business_context TEXT NOT NULL,       -- 'solo', 'team_member', 'team_leader'
    team_leader_id INTEGER,               -- Reference to team leader (if team_member)
    status TEXT NOT NULL,                 -- 'active', 'pending', 'suspended'
    rating REAL DEFAULT 0,                -- Average rating (0-5)
    rating_count INTEGER DEFAULT 0,       -- Number of ratings
    completed_jobs INTEGER DEFAULT 0,     -- Total completed jobs
    background_check_date TEXT,           -- ISO date string
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string for tracking sync status
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (team_leader_id) REFERENCES providers(id)
);

CREATE INDEX idx_providers_service_vertical ON providers(service_vertical);
CREATE INDEX idx_providers_provider_tier ON providers(provider_tier);
CREATE INDEX idx_providers_team_leader_id ON providers(team_leader_id);

-- Customers/Clients table
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    name TEXT NOT NULL,
    business_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    service_vertical TEXT NOT NULL,       -- 'cleaning_services', 'kitchen_maintenance', 'lawn_care'
    status TEXT NOT NULL,                 -- 'active', 'inactive'
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced'     -- 'synced', 'pending', 'error'
);

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_external_id ON customers(external_id);
CREATE INDEX idx_customers_service_vertical ON customers(service_vertical);

-- Jobs/Appointments table
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    provider_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    service_type TEXT NOT NULL,           -- 'regular_cleaning', 'pm_service', 'bridge_building'
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,                   -- ISO date string
    start_time TEXT NOT NULL,             -- ISO time string
    end_time TEXT,                        -- ISO time string (may be null if not ended)
    status TEXT NOT NULL,                 -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    is_offline_created INTEGER DEFAULT 0, -- Boolean flag for jobs created offline
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_jobs_provider_id ON jobs(provider_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_date ON jobs(date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_sync_status ON jobs(sync_status);

-- Performance Metrics table
CREATE TABLE performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    date TEXT NOT NULL,                   -- ISO date string (YYYY-MM-DD)
    period TEXT NOT NULL,                 -- 'daily', 'weekly', 'monthly'
    jobs_completed INTEGER DEFAULT 0,
    on_time_rate REAL DEFAULT 0,          -- Percentage
    customer_satisfaction REAL DEFAULT 0, -- Rating 0-5
    earnings REAL DEFAULT 0,
    revenue REAL DEFAULT 0,               -- For team leaders
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    UNIQUE(provider_id, date, period)
);

CREATE INDEX idx_metrics_provider_id ON performance_metrics(provider_id);
CREATE INDEX idx_metrics_date ON performance_metrics(date);

-- Alerts and Notifications
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    provider_id INTEGER NOT NULL,
    type TEXT NOT NULL,                   -- 'job_request', 'team', 'feedback', 'equipment', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,            -- Boolean
    is_actionable INTEGER DEFAULT 0,      -- Boolean
    action_type TEXT,                     -- 'view_job', 'view_customer', etc.
    action_id TEXT,                       -- ID related to the action
    created_at TEXT NOT NULL,             -- ISO date string
    expires_at TEXT,                      -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE INDEX idx_alerts_provider_id ON alerts(provider_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- Growth Opportunities
CREATE TABLE growth_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,                   -- 'training', 'promotion', 'expansion', 'certification'
    service_vertical TEXT NOT NULL,       -- 'cleaning_services', 'kitchen_maintenance', 'lawn_care'
    provider_tier TEXT NOT NULL,          -- 'certified_technician', 'elite_technician', 'territory_leader'
    url TEXT,                             -- URL for more information
    expiration_date TEXT,                 -- ISO date string
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    is_completed INTEGER DEFAULT 0        -- Boolean flag for completed opportunities
);

CREATE INDEX idx_opportunities_type ON growth_opportunities(type);
CREATE INDEX idx_opportunities_service_vertical ON growth_opportunities(service_vertical);
CREATE INDEX idx_opportunities_provider_tier ON growth_opportunities(provider_tier);

-- =====================
-- Service Vertical Specific Tables
-- =====================

-- Kitchen Maintenance Equipment
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    customer_id INTEGER NOT NULL,
    type TEXT NOT NULL,                   -- 'walk_in_cooler', 'reach_in_freezer', etc.
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    installation_date TEXT,               -- ISO date string
    last_service_date TEXT,               -- ISO date string
    next_service_date TEXT,               -- ISO date string
    status TEXT NOT NULL,                 -- 'operational', 'needs_attention', 'critical'
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_equipment_customer_id ON equipment(customer_id);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_status ON equipment(status);

-- Parts Inventory (Kitchen Maintenance)
CREATE TABLE parts_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    provider_id INTEGER NOT NULL,
    part_name TEXT NOT NULL,
    part_number TEXT,
    equipment_type TEXT,                  -- Related equipment type
    quantity INTEGER DEFAULT 0,
    reorder_threshold INTEGER DEFAULT 1,
    last_order_date TEXT,                 -- ISO date string
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE INDEX idx_parts_provider_id ON parts_inventory(provider_id);
CREATE INDEX idx_parts_part_name ON parts_inventory(part_name);

-- Cleaning Checklists (Cleaning Services)
CREATE TABLE cleaning_checklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    name TEXT NOT NULL,
    service_type TEXT NOT NULL,           -- 'standard_home', 'deep_cleaning', 'office', etc.
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced'     -- 'synced', 'pending', 'error'
);

CREATE INDEX idx_checklists_service_type ON cleaning_checklists(service_type);

-- Checklist Items
CREATE TABLE checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checklist_id INTEGER NOT NULL,
    task TEXT NOT NULL,
    category TEXT,                        -- 'kitchen', 'bathroom', 'common_areas', etc.
    required INTEGER DEFAULT 1,           -- Boolean
    sequence INTEGER NOT NULL,            -- Order in the checklist
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (checklist_id) REFERENCES cleaning_checklists(id)
);

CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);

-- Cleaning Supplies Inventory
CREATE TABLE cleaning_supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    provider_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT,                        -- 'cleaner', 'tool', 'paper_product', etc.
    quantity INTEGER DEFAULT 0,
    reorder_threshold INTEGER DEFAULT 1,
    last_order_date TEXT,                 -- ISO date string
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE INDEX idx_supplies_provider_id ON cleaning_supplies(provider_id);
CREATE INDEX idx_supplies_name ON cleaning_supplies(name);

-- Property Maps (Lawn Care)
CREATE TABLE property_maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    customer_id INTEGER NOT NULL,
    property_size TEXT,                   -- '0.25 acre', '1 acre', etc.
    map_image_url TEXT,                   -- URL to property map image
    has_zones INTEGER DEFAULT 0,          -- Boolean
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_property_maps_customer_id ON property_maps(customer_id);

-- Property Zones (Lawn Care)
CREATE TABLE property_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_map_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    zone_type TEXT NOT NULL,              -- 'grass', 'garden', 'trees', 'shrubs', etc.
    size TEXT,                            -- Size of the zone
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (property_map_id) REFERENCES property_maps(id)
);

CREATE INDEX idx_property_zones_property_map_id ON property_zones(property_map_id);

-- Weather Alerts (Lawn Care)
CREATE TABLE weather_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,                   -- 'rain', 'heat', 'frost', etc.
    message TEXT NOT NULL,
    start_date TEXT NOT NULL,             -- ISO date string
    end_date TEXT NOT NULL,               -- ISO date string
    affected_jobs INTEGER DEFAULT 0,      -- Count of affected jobs
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced'     -- 'synced', 'pending', 'error'
);

CREATE INDEX idx_weather_alerts_start_date ON weather_alerts(start_date);
CREATE INDEX idx_weather_alerts_type ON weather_alerts(type);

-- =====================
-- Sync Management Tables
-- =====================

-- Sync Log table
CREATE TABLE sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_start TEXT NOT NULL,             -- ISO date string
    sync_end TEXT,                        -- ISO date string (null if not completed)
    status TEXT NOT NULL,                 -- 'in_progress', 'completed', 'failed'
    tables_synced TEXT,                   -- Comma-separated list of synced tables
    error_message TEXT,
    items_sent INTEGER DEFAULT 0,
    items_received INTEGER DEFAULT 0,
    network_type TEXT,                    -- 'wifi', 'cellular', 'none'
    created_at TEXT NOT NULL              -- ISO date string
);

CREATE INDEX idx_sync_log_sync_start ON sync_log(sync_start);
CREATE INDEX idx_sync_log_status ON sync_log(status);

-- Pending Sync Items
CREATE TABLE pending_sync_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,             -- Name of the table to sync
    record_id INTEGER NOT NULL,           -- ID of the record in the table
    operation TEXT NOT NULL,              -- 'insert', 'update', 'delete'
    data TEXT,                            -- JSON serialized data (for insert/update)
    attempt_count INTEGER DEFAULT 0,      -- Number of sync attempts
    last_attempt TEXT,                    -- ISO date string
    created_at TEXT NOT NULL,             -- ISO date string
    priority INTEGER DEFAULT 1            -- Higher number = higher priority
);

CREATE INDEX idx_pending_sync_table_record ON pending_sync_items(table_name, record_id);
CREATE INDEX idx_pending_sync_priority ON pending_sync_items(priority);

-- =====================
-- Bridge Building Specific Tables
-- =====================

-- Bridge Building Relationships
CREATE TABLE bridge_building_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,              -- ID from server
    provider_id INTEGER NOT NULL,
    prospect_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    contact_name TEXT,
    contact_title TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    status TEXT NOT NULL,                 -- 'initial_contact', 'follow_up', 'proposal', 'converted', 'declined'
    interest_level INTEGER,               -- 1-5 scale
    notes TEXT,
    next_action TEXT,
    next_action_date TEXT,                -- ISO date string
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE INDEX idx_bridge_provider_id ON bridge_building_relationships(provider_id);
CREATE INDEX idx_bridge_status ON bridge_building_relationships(status);
CREATE INDEX idx_bridge_next_action_date ON bridge_building_relationships(next_action_date);

-- Bridge Building Interactions
CREATE TABLE bridge_building_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    relationship_id INTEGER NOT NULL,
    interaction_type TEXT NOT NULL,       -- 'visit', 'call', 'email', 'text', 'proposal'
    date TEXT NOT NULL,                   -- ISO date string
    notes TEXT,
    outcome TEXT,
    follow_up_required INTEGER DEFAULT 0, -- Boolean
    follow_up_date TEXT,                  -- ISO date string
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (relationship_id) REFERENCES bridge_building_relationships(id)
);

CREATE INDEX idx_interactions_relationship_id ON bridge_building_interactions(relationship_id);
CREATE INDEX idx_interactions_date ON bridge_building_interactions(date);

-- Prospect Equipment Notes (Kitchen Maintenance)
CREATE TABLE prospect_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    relationship_id INTEGER NOT NULL,
    equipment_type TEXT NOT NULL,
    brand TEXT,
    condition TEXT,                       -- 'good', 'fair', 'poor', 'unknown'
    age TEXT,                             -- Approximate age
    maintenance_approach TEXT,            -- How they currently maintain it
    pain_points TEXT,                     -- Issues they're having
    photo_url TEXT,                       -- URL to photo if taken
    notes TEXT,
    created_at TEXT NOT NULL,             -- ISO date string
    updated_at TEXT NOT NULL,             -- ISO date string
    last_sync TEXT NOT NULL,              -- ISO date string
    sync_status TEXT DEFAULT 'synced',    -- 'synced', 'pending', 'error'
    FOREIGN KEY (relationship_id) REFERENCES bridge_building_relationships(id)
);

CREATE INDEX idx_prospect_equipment_relationship_id ON prospect_equipment(relationship_id);

-- =====================
-- Utility Views
-- =====================

-- Today's jobs view
CREATE VIEW view_todays_jobs AS
SELECT 
    j.id, 
    j.external_id,
    j.title,
    j.service_type,
    j.date,
    j.start_time,
    j.end_time,
    j.status,
    c.name AS customer_name,
    c.business_name AS customer_business,
    c.address AS customer_address,
    c.city AS customer_city,
    c.state AS customer_state,
    c.zip_code AS customer_zip
FROM 
    jobs j
JOIN 
    customers c ON j.customer_id = c.id
WHERE 
    j.date = date('now')
ORDER BY 
    j.start_time;

-- Provider performance summary view
CREATE VIEW view_provider_performance AS
SELECT 
    p.id,
    p.first_name || ' ' || p.last_name AS provider_name,
    p.provider_tier,
    p.service_vertical,
    p.rating,
    p.rating_count,
    p.completed_jobs,
    (SELECT COUNT(*) FROM jobs WHERE provider_id = p.id AND status = 'completed' AND date >= date('now', '-7 days')) AS jobs_last_week,
    (SELECT AVG(on_time_rate) FROM performance_metrics WHERE provider_id = p.id AND date >= date('now', '-30 days') AND period = 'daily') AS avg_on_time_rate,
    (SELECT AVG(customer_satisfaction) FROM performance_metrics WHERE provider_id = p.id AND date >= date('now', '-30 days')) AS avg_satisfaction,
    (SELECT SUM(earnings) FROM performance_metrics WHERE provider_id = p.id AND date >= date('now', '-30 days')) AS earnings_30_days
FROM 
    providers p;

-- Offline created records view
CREATE VIEW view_offline_records AS
SELECT 
    'jobs' AS table_name,
    id,
    external_id,
    created_at,
    sync_status
FROM 
    jobs
WHERE 
    is_offline_created = 1
UNION ALL
SELECT 
    'alerts' AS table_name,
    id,
    external_id,
    created_at,
    sync_status
FROM 
    alerts
WHERE 
    sync_status = 'pending'
UNION ALL
SELECT 
    'bridge_building_relationships' AS table_name,
    id,
    external_id,
    created_at,
    sync_status
FROM 
    bridge_building_relationships
WHERE 
    sync_status = 'pending'
ORDER BY 
    created_at DESC;

-- Bridge building prospects needing follow-up
CREATE VIEW view_bridge_building_followups AS
SELECT 
    r.id,
    r.prospect_name,
    r.business_name,
    r.status,
    r.interest_level,
    r.next_action,
    r.next_action_date,
    p.first_name || ' ' || p.last_name AS provider_name,
    (SELECT COUNT(*) FROM bridge_building_interactions WHERE relationship_id = r.id) AS interaction_count,
    (SELECT MAX(date) FROM bridge_building_interactions WHERE relationship_id = r.id) AS last_interaction_date
FROM 
    bridge_building_relationships r
JOIN 
    providers p ON r.provider_id = p.id
WHERE 
    r.status != 'declined' AND r.status != 'converted'
ORDER BY 
    r.next_action_date;