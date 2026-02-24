/**
 * setup-database.js
 * Cria todas as tabelas do banco de dados peritoforense.
 * Execute: node scripts/setup-database.js
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../peritoforense.db');

// Remove DB anterior em dev para re-criação limpa
if (process.env.NODE_ENV !== 'production' && fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('🗑️  Banco anterior removido (ambiente de dev).');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
-- ─────────────────────────────────────────────
--  STATES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS states (
    id         INTEGER PRIMARY KEY,   -- ID IBGE (ex: 35 para SP)
    uf         TEXT    NOT NULL UNIQUE, -- Sigla (ex: SP)
    name       TEXT    NOT NULL        -- Nome (ex: São Paulo)
);

-- ─────────────────────────────────────────────
--  CITIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
    id           INTEGER PRIMARY KEY,  -- ID IBGE (ex: 3550308)
    state_id     INTEGER NOT NULL REFERENCES states(id),
    name         TEXT    NOT NULL,
    slug         TEXT    NOT NULL,
    is_published INTEGER NOT NULL DEFAULT 0,  -- 0 = inativa, 1 = publicada no portal
    UNIQUE(state_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cities_slug         ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_is_published ON cities(is_published);
CREATE INDEX IF NOT EXISTS idx_cities_state_id     ON cities(state_id);

-- ─────────────────────────────────────────────
--  SPECIALTIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS specialties (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    slug        TEXT    NOT NULL UNIQUE,
    h1_term     TEXT    NOT NULL,        -- Termo SEO otimizado para H1
    description TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
--  LISTINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id         INTEGER NOT NULL REFERENCES cities(id),
    specialty_id    INTEGER NOT NULL REFERENCES specialties(id),
    is_active       INTEGER NOT NULL DEFAULT 0,   -- 0 = vácuo de poder, 1 = parceiro ativo
    -- Campos do parceiro (preenchidos quando is_active = 1)
    partner_name    TEXT,
    partner_bio     TEXT,
    partner_photo   TEXT,   -- URL relativa ou absoluta
    partner_whatsapp TEXT,
    partner_crea    TEXT,   -- Registro profissional
    seo_intro_html  TEXT,   -- Parágrafo SEO gerado por IA + Leandro
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(city_id, specialty_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_city_id      ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_specialty_id ON listings(specialty_id);
CREATE INDEX IF NOT EXISTS idx_listings_is_active    ON listings(is_active);

-- ─────────────────────────────────────────────
--  CTA EVENTS (reservado para v1.1)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cta_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id   INTEGER REFERENCES listings(id),
    cta_type     TEXT    NOT NULL, -- 'contratar_perito' | 'vaga_perito'
    city_slug    TEXT,
    specialty_slug TEXT,
    user_agent   TEXT,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
`);

db.close();
console.log(`✅ Banco de dados criado em: ${DB_PATH}`);
