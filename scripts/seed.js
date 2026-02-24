/**
 * seed.js
 * Popula o banco de dados:
 *  1. 27 estados do Brasil
 *  2. Todos os municípios IBGE (via API) com is_published = 0
 *  3. Ativa as 33 cidades do lançamento (is_published = 1)
 *  4. Insere as 10 especialidades
 *  5. Cria os listings (vácuo de poder) para cidades publicadas
 *
 * Execute: node scripts/seed.js
 */
require('dotenv').config();

const Database = require('better-sqlite3');
const path = require('path');
const https = require('https');

const DB_PATH = path.join(__dirname, '../peritoforense.db');

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // remove acentos
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// ─── Dados fixos ────────────────────────────────────────────────────────────

const STATES = [
    { id: 12, uf: 'AC', name: 'Acre' },
    { id: 27, uf: 'AL', name: 'Alagoas' },
    { id: 16, uf: 'AP', name: 'Amapá' },
    { id: 13, uf: 'AM', name: 'Amazonas' },
    { id: 29, uf: 'BA', name: 'Bahia' },
    { id: 23, uf: 'CE', name: 'Ceará' },
    { id: 53, uf: 'DF', name: 'Distrito Federal' },
    { id: 32, uf: 'ES', name: 'Espírito Santo' },
    { id: 52, uf: 'GO', name: 'Goiás' },
    { id: 21, uf: 'MA', name: 'Maranhão' },
    { id: 51, uf: 'MT', name: 'Mato Grosso' },
    { id: 50, uf: 'MS', name: 'Mato Grosso do Sul' },
    { id: 31, uf: 'MG', name: 'Minas Gerais' },
    { id: 15, uf: 'PA', name: 'Pará' },
    { id: 25, uf: 'PB', name: 'Paraíba' },
    { id: 41, uf: 'PR', name: 'Paraná' },
    { id: 26, uf: 'PE', name: 'Pernambuco' },
    { id: 22, uf: 'PI', name: 'Piauí' },
    { id: 33, uf: 'RJ', name: 'Rio de Janeiro' },
    { id: 24, uf: 'RN', name: 'Rio Grande do Norte' },
    { id: 43, uf: 'RS', name: 'Rio Grande do Sul' },
    { id: 11, uf: 'RO', name: 'Rondônia' },
    { id: 14, uf: 'RR', name: 'Roraima' },
    { id: 42, uf: 'SC', name: 'Santa Catarina' },
    { id: 35, uf: 'SP', name: 'São Paulo' },
    { id: 28, uf: 'SE', name: 'Sergipe' },
    { id: 17, uf: 'TO', name: 'Tocantins' },
];

// Cidades publicadas no portal: 1M+ habitantes + 6 sedes de TRF
// (todas as sedes de TRF já têm 1M+ — nenhuma adição extra necessária)
const LAUNCH_CITY_IDS = new Set([
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


const SPECIALTIES = [
    { name: 'Forense Digital', slug: 'forense-digital', h1_term: 'Perito em Forense Digital', description: 'Crimes cibernéticos, recuperação de dados e análise de dispositivos digitais.', sort_order: 1 },
    { name: 'Grafotecnia', slug: 'grafotecnia', h1_term: 'Perito em Grafotecnia', description: 'Veracidade de assinaturas e grafismos em documentos judiciais.', sort_order: 2 },
    { name: 'Documentoscopia', slug: 'documentoscopia', h1_term: 'Perito em Documentoscopia', description: 'Autenticidade de documentos físicos e digitais para fins periciais.', sort_order: 3 },
    { name: 'Engenharia Forense', slug: 'engenharia-forense', h1_term: 'Perito em Engenharia Forense', description: 'Perícia em obras, estruturas e acidentes de engenharia civil.', sort_order: 4 },
    { name: 'Avaliação de Imóveis', slug: 'avaliacao-de-imoveis', h1_term: 'Perito Avaliador de Imóveis', description: 'Determinação de valores para fins judiciais, inventários e partilhas.', sort_order: 5 },
    { name: 'Perícia Contábil', slug: 'pericia-contabil', h1_term: 'Perito Contábil', description: 'Auditoria em cálculos financeiros, tributários e societários judiciais.', sort_order: 6 },
    { name: 'Perícia Trabalhista', slug: 'pericia-trabalhista', h1_term: 'Perito Trabalhista', description: 'Avaliação de nexo causal, incapacidades e liquidação de verbas trabalhistas.', sort_order: 7 },
    { name: 'Acidentes de Trânsito', slug: 'acidentes-de-transito', h1_term: 'Perito em Acidentes de Trânsito', description: 'Reconstituição de colisões e análise de dinâmica veicular pericial.', sort_order: 8 },
    { name: 'Propriedade Intelectual', slug: 'propriedade-intelectual', h1_term: 'Perito em Propriedade Intelectual', description: 'Perícia em plágio de software, violação de patentes e marcas registradas.', sort_order: 9 },
    { name: 'Perícia Ambiental', slug: 'pericia-ambiental', h1_term: 'Perito Ambiental', description: 'Avaliação de danos ambientais e conformidade técnica em processos judiciais.', sort_order: 10 },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    // 1. States
    console.log('🌎 Inserindo estados...');
    const insertState = db.prepare(
        'INSERT OR IGNORE INTO states (id, uf, name) VALUES (?, ?, ?)'
    );
    const insertStatesAll = db.transaction(() => {
        for (const s of STATES) insertState.run(s.id, s.uf, s.name);
    });
    insertStatesAll();
    console.log(`   ✓ ${STATES.length} estados inseridos.`);

    // 2. Cities (IBGE)
    console.log('🏙️  Buscando municípios do IBGE...');
    const ibgeCities = await fetchJSON(
        'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome'
    );
    console.log(`   ✓ ${ibgeCities.length} municípios recebidos.`);

    const insertCity = db.prepare(`
        INSERT OR IGNORE INTO cities (id, state_id, name, slug, is_published)
        VALUES (?, ?, ?, ?, ?)
    `);
    const updatePublished = db.prepare(
        'UPDATE cities SET is_published = 1 WHERE id = ?'
    );

    let inserted = 0;
    let skipped = 0;
    const insertCitiesAll = db.transaction(() => {
        for (const c of ibgeCities) {
            // Tenta extrair stateId de microrregiao (principal) ou regiao-imediata (fallback)
            let stateId = null;
            try {
                stateId = c?.microrregiao?.mesorregiao?.UF?.id
                    ?? c?.['regiao-imediata']?.['regiao-intermediaria']?.UF?.id
                    ?? null;
            } catch (_) { }

            if (!stateId) { skipped++; continue; }

            const isPublished = LAUNCH_CITY_IDS.has(c.id) ? 1 : 0;
            insertCity.run(c.id, stateId, c.nome, slugify(c.nome), isPublished);
            inserted++;
        }
    });
    insertCitiesAll();
    console.log(`   ✓ ${inserted} cidades inseridas.`);
    console.log(`   ✓ ${LAUNCH_CITY_IDS.size} cidades ativadas (is_published=1).`);

    // 3. Specialties
    console.log('⚖️  Inserindo especialidades...');
    const insertSpecialty = db.prepare(`
        INSERT OR IGNORE INTO specialties (name, slug, h1_term, description, sort_order)
        VALUES (?, ?, ?, ?, ?)
    `);
    const insertSpecialtiesAll = db.transaction(() => {
        for (const s of SPECIALTIES)
            insertSpecialty.run(s.name, s.slug, s.h1_term, s.description, s.sort_order);
    });
    insertSpecialtiesAll();
    console.log(`   ✓ ${SPECIALTIES.length} especialidades inseridas.`);

    // 4. Listings (vácuo de poder) para cidades publicadas × especialidades
    console.log('📋 Criando listings (vácuo de poder)...');
    const publishedCities = db.prepare('SELECT id FROM cities WHERE is_published = 1').all();
    const allSpecialties = db.prepare('SELECT id FROM specialties').all();

    const insertListing = db.prepare(`
        INSERT OR IGNORE INTO listings (city_id, specialty_id, is_active)
        VALUES (?, ?, 0)
    `);
    const insertListingsAll = db.transaction(() => {
        for (const city of publishedCities)
            for (const spec of allSpecialties)
                insertListing.run(city.id, spec.id);
    });
    insertListingsAll();

    const totalListings = publishedCities.length * allSpecialties.length;
    console.log(`   ✓ ${totalListings} listings criados (${publishedCities.length} cidades × ${allSpecialties.length} especialidades).`);

    db.close();
    console.log('\n🚀 Seed concluído com sucesso!');
}

main().catch(err => {
    console.error('❌ Erro no seed:', err.message);
    process.exit(1);
});
