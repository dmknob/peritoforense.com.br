/**
 * scripts/add-is-hidden.js
 * Adiciona a coluna is_hidden na tabela listings e configura o primeiro cliente.
 *
 * Execute: node scripts/add-is-hidden.js
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../peritoforense.db');

async function main() {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    console.log('🔄 Verificando esquema do banco...');

    try {
        // Verifica se a coluna is_hidden já existe
        const tableInfo = db.prepare("PRAGMA table_info(listings)").all();
        const hasIsHidden = tableInfo.some(col => col.name === 'is_hidden');

        if (!hasIsHidden) {
            console.log('➕ Adicionando coluna is_hidden na tabela listings...');
            db.exec(`ALTER TABLE listings ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0;`);
            console.log('✅ Coluna is_hidden adicionada com sucesso.');
        } else {
            console.log('ℹ️ A coluna is_hidden já existe.');
        }

        // Recuperar IDs das cidades e especialidades do cliente
        const curitiba = db.prepare(`SELECT id FROM cities WHERE slug = 'curitiba'`).get();

        const specsToHide = ['documentoscopia', 'grafotecnia'];
        const specs = specsToHide.map(slug => {
            const spec = db.prepare(`SELECT id FROM specialties WHERE slug = ?`).get(slug);
            if (!spec) console.error(`Especialidade não encontrada: ${slug}`);
            return spec;
        });

        if (curitiba && specs.every(s => s != null)) {
            console.log('📝 Configurando perfis de Documentoscopia e Grafotecnia em Curitiba como rascunho (is_hidden = 1, is_active = 1)...');

            const updateListing = db.prepare(`
                UPDATE listings 
                SET is_active = 1, is_hidden = 1, partner_name = 'Cliente Teste (Rascunho)'
                WHERE city_id = ? AND specialty_id = ?
            `);

            const updateTransaction = db.transaction(() => {
                for (const spec of specs) {
                    updateListing.run(curitiba.id, spec.id);
                }
            });

            updateTransaction();
            console.log('✅ Listings atualizados com sucesso.');
        } else {
            console.error('❌ Não foi possível encontrar Curitiba ou as especialidades no banco de dados.');
        }

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    } finally {
        db.close();
    }
}

main();
