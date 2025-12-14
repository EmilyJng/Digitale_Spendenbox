-- Tabelle Users (Für das Login)
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle Campaigns (Spendenaktionen)
CREATE TABLE IF NOT EXISTS Campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    goal_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0.0,
    -- Bankkonto-Informationen sollten sicher behandelt werden.
    -- Hier speichern wir eine generische "Ziel-ID" (z.B. Stripe Account ID)
    target_payment_id TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Tabelle Donations (Einzelne Spenden)
CREATE TABLE IF NOT EXISTS Donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    donor_name TEXT, 
    -- Speichern des letzten Spenders in der Campaign-Tabelle ist besser für Performance
    -- Das Payment Intent ID von Stripe kann hier zur Verfolgung gespeichert werden
    payment_intent_id TEXT UNIQUE NOT NULL,
    payment_status TEXT NOT NULL, -- z.B. 'succeeded', 'pending', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES Campaigns(id)
);

-- Index für schnellen Zugriff auf aktive Kampagnen (Landing Page)
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON Campaigns (is_active);

-- Index für Spenden nach Kampagne (Übersicht)
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON Donations (campaign_id);