/**
 * Script de Teste — Ativação de Parceiro
 * 
 * Uso:
 *   node scripts/ativar-parceiro-teste.js                    → Ativa o perito fictício padrão
 *   node scripts/ativar-parceiro-teste.js --desfazer         → Reverte (volta ao Vácuo de Poder)
 * 
 * Por padrão, cadastra em: São Paulo / SP / Forense Digital
 * Para mudar, altere as variáveis CIDADE_SLUG e ESPECIALIDADE_SLUG abaixo.
 */

const db = require('../src/models/db');

// ──────────────────────────────────────────
// Configure aqui a posição a testar:
const CIDADE_SLUG = 'sao-paulo';
const ESTADO_UF = 'SP';
const ESPECIALIDADE_SLUG = 'forense-digital';
// ──────────────────────────────────────────

const desfazer = process.argv.includes('--desfazer');

// Busca os IDs necessários
const city = db
    .prepare('SELECT c.id, c.name FROM cities c JOIN states s ON s.id = c.state_id WHERE c.slug = ? AND s.uf = ?')
    .get(CIDADE_SLUG, ESTADO_UF);

const specialty = db
    .prepare('SELECT id, name FROM specialties WHERE slug = ?')
    .get(ESPECIALIDADE_SLUG);

if (!city || !specialty) {
    console.error(`❌ Cidade ou especialidade não encontrada.`);
    console.error(`   Cidade slug: "${CIDADE_SLUG}" (${ESTADO_UF}) → ${city ? '✅' : '❌'}`);
    console.error(`   Especialidade slug: "${ESPECIALIDADE_SLUG}" → ${specialty ? '✅' : '❌'}`);
    process.exit(1);
}

if (desfazer) {
    // Reverte para Vácuo de Poder
    const stmt = db.prepare(`
    UPDATE listings SET
      is_active       = 0,
      partner_name    = NULL,
      partner_bio     = NULL,
      partner_photo   = NULL,
      partner_whatsapp = NULL,
      partner_crea    = NULL,
      updated_at      = datetime('now')
    WHERE city_id = ? AND specialty_id = ?
  `);
    const result = stmt.run(city.id, specialty.id);
    if (result.changes > 0) {
        console.log(`✅ Vaga revertida para "Vácuo de Poder".`);
        console.log(`   Página: /${ESTADO_UF.toLowerCase()}/${CIDADE_SLUG}/${ESPECIALIDADE_SLUG}`);
    } else {
        console.warn(`⚠️  Nenhum registro alterado. Verifique se a vaga existe no banco.`);
    }

} else {
    // Ativa parceiro fictício para teste
    const stmt = db.prepare(`
    UPDATE listings SET
      is_active        = 1,
      partner_name     = 'Dr. Carlos Mendes',
      partner_bio      = 'Especialista com 12 anos de atuação em varas cíveis e criminais do TJSP, auxiliando escritórios de advocacia em provas digitais, recuperação de dados e análise de dispositivos eletrônicos. Atua como assistente técnico em processos de todas as naturezas.',
      partner_photo    = NULL,
      partner_whatsapp = '5511999990000',
      partner_crea     = 'CREA-SP 12345-D/SP',
      updated_at       = datetime('now')
    WHERE city_id = ? AND specialty_id = ?
  `);
    const result = stmt.run(city.id, specialty.id);
    if (result.changes > 0) {
        console.log(`✅ Perito de teste ativado com sucesso!`);
        console.log(`   Cidade: ${city.name}/${ESTADO_UF}`);
        console.log(`   Especialidade: ${specialty.name}`);
        console.log(`   URL: http://localhost:3010/${ESTADO_UF.toLowerCase()}/${CIDADE_SLUG}/${ESPECIALIDADE_SLUG}`);
        console.log(`\n   Para desfazer: node scripts/ativar-parceiro-teste.js --desfazer`);
    } else {
        console.warn(`⚠️  Nenhum registro alterado. Verifique se a vaga já existe no banco.`);
        console.warn(`   city_id=${city.id}, specialty_id=${specialty.id}`);
    }
}
