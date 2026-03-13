/**
 * Script de Produção — Ativação do Parceiro Adrisnando Menezes (Fortaleza/CE)
 *
 * Ativa quatro posições simultaneamente:
 *   → /ce/fortaleza/acidentes-de-transito
 *   → /ce/fortaleza/grafotecnia
 *   → /ce/fortaleza/documentoscopia
 *   → /ce/fortaleza/engenharia-forense
 *
 * Uso:
 *   node scripts/ativar-adrisnando-fortaleza.js            → Ativa as 4 vagas
 *   node scripts/ativar-adrisnando-fortaleza.js --desfazer → Reverte todas para "Vácuo de Poder"
 *
 * ⚠️  ATENÇÃO: Confira os dados na seção de configuração antes de executar.
 * Plano de implementação: docs/plano-ativacao-adrisnando-fortaleza.md
 */

const db = require('../src/models/db');

// ──────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DO PARCEIRO — conferir antes de executar
// ──────────────────────────────────────────────────────────────────
const PARCEIRO = {
    nome: 'Adrisnando Menezes',
    whatsapp: '5585999037920',  // ⚠️ SEMPRE string com aspas — número sem aspas vira REAL no SQLite
    registro: 'CREA-CE Nº 56744',
    foto: null,                 // Preencher futuramente: ex. '/img/parceiros/adrisnando-menezes.webp'
};

const CIDADE_SLUG = 'fortaleza';
const ESTADO_UF = 'CE';

// Textos fornecidos pelo Leandro
const BIO_ACIDENTES = `A titularidade desta cadeira em Fortaleza é exercida pelo Eng. Adrisnando Menezes, cuja base técnica foi forjada em uma década de atuação na manutenção aeronáutica pela Força Aérea Brasileira (FAB). Esta experiência militar confere à sua análise de acidentes de trânsito um rigor metrológico e uma disciplina investigativa superiores, aplicando princípios da física e da mecânica avançada na reconstrução dinâmica de colisões. Sua expertise permite decifrar vetores de impacto, deformações estruturais e falhas de componentes com precisão laboratorial. Como prova de seu compromisso com a excelência, Adrisnando mantém uma trajetória de evolução contínua, integrando conhecimentos de Engenharia de Automação e Eletrônica Industrial para realizar perícias complexas em veículos modernos e sistemas de segurança ativa, entregando laudos que são referências de autoridade técnica no Judiciário cearense.`;

const BIO_GRAFOTECNIA = `Especialista dedicado ao estudo científico da escrita, o Eng. Adrisnando Menezes ocupa a cadeira de Grafotecnia focada na identificação de autoria e detecção de falsificações gráficas. Sua atuação nesta área é marcada pela transposição do rigor da engenharia para a análise microscópica de grafismos, avaliando pressões, calibres e dinamismos que individualizam a escrita. Em uma busca incessante por atualização, Adrisnando está concluindo especializações em Química Forense e Engenharia Forense, o que lhe permite uma visão multidisciplinar sobre o ato gráfico. Localizado no centro corporativo de Fortaleza (Aldeota), ele oferece suporte decisivo em casos de contestação de assinaturas, testamentos e documentos contratuais, unindo a sensibilidade técnica à fundamentação científica exigida pelos tribunais de elite.`;

const BIO_DOCUMENTOSCOPIA = `A cadeira de Documentoscopia em Fortaleza, sob a responsabilidade do Eng. Adrisnando Menezes, foca na análise física e química da integridade documental. Diferente da grafotecnia, aqui o foco é o exame do suporte (papel), das tintas, dos elementos de segurança e das possíveis adulterações físicas ou químicas em documentos. Adrisnando utiliza sua sólida formação em Engenharia Mecânica e seu aprofundamento em Química Forense para identificar raspagens, lavagens químicas e substituições de dados com precisão absoluta. Sua infraestrutura técnica e seu constante investimento em novas especializações garantem uma blindagem contra fraudes documentais sofisticadas, transformando o laudo em uma evidência técnica incontestável para a segurança de negócios jurídicos e transações imobiliárias de alto ticket.`;

const BIO_ENGENHARIA = `Membro ativo do IBAPE/CE, o Eng. Adrisnando Menezes detém a titularidade em Engenharia Forense, área que consolida sua atuação em avaliações de ativos, inspeções prediais e engenharia de segurança do trabalho. Com o diferencial de estar cursando especialização em Engenharia de Custos e Gerenciamento de Obras, ele entrega uma visão estratégica sobre a valoração de bens e a identificação de patologias estruturais. Sua prática combina o cumprimento estrito das normas da ABNT com uma capacidade analítica apurada para sinistros industriais e vistorias cautelares. O perfil de Adrisnando representa o novo padrão da perícia cearense: técnica, atualizada e pautada pela transparência, sendo o assistente técnico preferencial para demandas que exigem alto nível de detalhamento em engenharia legal.`;

// Especialidades a ativar
const VAGAS = [
    { slug: 'acidentes-de-transito', bio: BIO_ACIDENTES },
    { slug: 'grafotecnia', bio: BIO_GRAFOTECNIA },
    { slug: 'documentoscopia', bio: BIO_DOCUMENTOSCOPIA },
    { slug: 'engenharia-forense', bio: BIO_ENGENHARIA },
];
// ──────────────────────────────────────────────────────────────────

const desfazer = process.argv.includes('--desfazer');

// Busca a cidade
const city = db
    .prepare('SELECT c.id, c.name FROM cities c JOIN states s ON s.id = c.state_id WHERE c.slug = ? AND s.uf = ?')
    .get(CIDADE_SLUG, ESTADO_UF);

if (!city) {
    console.error(`❌ Cidade não encontrada: "${CIDADE_SLUG}" (${ESTADO_UF})`);
    process.exit(1);
}

console.log(`\n📍 Cidade: ${city.name}/${ESTADO_UF} (id=${city.id})`);
console.log(`🔄 Modo: ${desfazer ? 'DESFAZER (Vácuo de Poder)' : 'ATIVAR parceiro'}\n`);

// Executa dentro de uma transação para garantir consistência
const executar = db.transaction(() => {
    for (const vaga of VAGAS) {
        const specialty = db
            .prepare('SELECT id, name FROM specialties WHERE slug = ?')
            .get(vaga.slug);

        if (!specialty) {
            console.error(`❌ Especialidade não encontrada: "${vaga.slug}"`);
            process.exit(1);
        }

        if (desfazer) {
            const stmt = db.prepare(`
                UPDATE listings SET
                    is_active        = 0,
                    partner_name     = NULL,
                    partner_bio      = NULL,
                    partner_photo    = NULL,
                    partner_whatsapp = NULL,
                    partner_crea     = NULL,
                    updated_at       = datetime('now')
                WHERE city_id = ? AND specialty_id = ?
            `);
            const result = stmt.run(city.id, specialty.id);
            if (result.changes > 0) {
                console.log(`✅ [REVERTIDA] ${specialty.name} → Vácuo de Poder`);
                console.log(`   URL: /${ESTADO_UF.toLowerCase()}/${CIDADE_SLUG}/${vaga.slug}\n`);
            } else {
                console.warn(`⚠️  [SEM ALTERAÇÃO] ${specialty.name} — verifique se a vaga existe no banco.`);
            }
        } else {
            const stmt = db.prepare(`
                UPDATE listings SET
                    is_active        = 1,
                    partner_name     = ?,
                    partner_bio      = ?,
                    partner_photo    = ?,
                    partner_whatsapp = ?,
                    partner_crea     = ?,
                    updated_at       = datetime('now')
                WHERE city_id = ? AND specialty_id = ?
            `);
            const result = stmt.run(
                PARCEIRO.nome,
                vaga.bio,
                PARCEIRO.foto,
                PARCEIRO.whatsapp,
                PARCEIRO.registro,
                city.id,
                specialty.id
            );
            if (result.changes > 0) {
                console.log(`✅ [ATIVADA] ${specialty.name}`);
                console.log(`   URL: http://localhost:3010/${ESTADO_UF.toLowerCase()}/${CIDADE_SLUG}/${vaga.slug}\n`);
            } else {
                console.warn(`⚠️  [SEM ALTERAÇÃO] ${specialty.name} — verifique se a vaga existe no banco.`);
                console.warn(`   city_id=${city.id}, specialty_id=${specialty.id}\n`);
            }
        }
    }
});

executar();

if (!desfazer) {
    console.log('─'.repeat(60));
    console.log(`👤 Parceiro: ${PARCEIRO.nome}`);
    console.log(`📱 WhatsApp: ${PARCEIRO.whatsapp}`);
    console.log(`🏅 Registro: ${PARCEIRO.registro}`);
    console.log(`\n   Para reverter: node scripts/ativar-adrisnando-fortaleza.js --desfazer`);
}
