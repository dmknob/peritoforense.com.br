/**
 * migrate-cities-1m.js
 * Redefine o conjunto de cidades publicadas para:
 *   - Cidades com mais de 1 milhão de habitantes (IBGE 2022)
 *   - Inclui os 6 sedes de TRF (todas já têm 1M+)
 *
 * Execute: node scripts/migrate-cities-1m.js
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../peritoforense.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Cidades com 1M+ habitantes (IBGE 2022) + 6 sedes de TRF
// Todas as sedes de TRF já estão no conjunto 1M+
const CITIES_1M = new Set([
    3550308, // São Paulo / SP        — 12,3M  (TRF-3)
    3304557, // Rio de Janeiro / RJ   — 6,7M   (TRF-2)
    5300108, // Brasília / DF         — 3,1M   (TRF-1)
    2927408, // Salvador / BA         — 2,9M
    2304400, // Fortaleza / CE        — 2,7M
    3106200, // Belo Horizonte / MG   — 2,5M   (TRF-6)
    1302603, // Manaus / AM           — 2,2M
    4106902, // Curitiba / PR         — 1,9M
    2611606, // Recife / PE           — 1,6M   (TRF-5)
    5208707, // Goiânia / GO          — 1,5M
    1501402, // Belém / PA            — 1,5M
    4314902, // Porto Alegre / RS     — 1,4M   (TRF-4)
    3518800, // Guarulhos / SP        — 1,4M
    3509502, // Campinas / SP         — 1,2M
    2111300, // São Luís / MA         — 1,1M
    2704302, // Maceió / AL           — 1,0M
]);

const migrate = db.transaction(() => {
    // 1. Desativa todas as cidades
    const { changes: desativadas } = db.prepare(
        'UPDATE cities SET is_published = 0 WHERE is_published = 1'
    ).run();

    // 2. Ativa apenas as 1M+
    let ativadas = 0;
    for (const id of CITIES_1M) {
        const r = db.prepare(
            'UPDATE cities SET is_published = 1 WHERE id = ?'
        ).run(id);
        if (r.changes === 0) console.warn(`  ⚠️  ID não encontrado no banco: ${id}`);
        else ativadas++;
    }

    // 3. Garante que os listings existem para todas as cidades ativas
    const specs = db.prepare('SELECT id FROM specialties').all();
    const activeCities = db.prepare('SELECT id FROM cities WHERE is_published = 1').all();
    const insertListing = db.prepare(`
        INSERT OR IGNORE INTO listings (city_id, specialty_id, is_active)
        VALUES (?, ?, 0)
    `);
    let novosListings = 0;
    for (const c of activeCities)
        for (const sp of specs) {
            const r = insertListing.run(c.id, sp.id);
            novosListings += r.changes;
        }

    return { desativadas, ativadas, novosListings };
});

const result = migrate();
db.close();

console.log(`\n✅ Migração concluída:`);
console.log(`   ${result.desativadas} cidades desativadas`);
console.log(`   ${result.ativadas} cidades ativadas (1M+)`);
console.log(`   ${result.novosListings} novos listings criados`);
console.log(`   Total: ${result.ativadas} cidades × 10 especialidades = ${result.ativadas * 10} listings ativos`);
