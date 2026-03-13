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
const BIO_ACIDENTES = `A titularidade desta cadeira é exercida pelo Eng. Adrisnando Menezes, profissional que transpõe o rigor da segurança aeronáutica para a análise de sinistros terrestres. Com formação técnica em Manutenção Aeronáutica (MMA) e curso de Piloto Privado pelo Aero Clube do Ceará, a sua metodologia de investigação é pautada por protocolos de precisão metrológica e análise sistémica de falhas. Especialista em Engenharia Mecânica, Adrisnando utiliza princípios de física e dinâmica de massas para decifrar vetores de impacto e deformações estruturais. A sua atuação no polo corporativo da Aldeota oferece a advogados e empresas uma reconstrução científica detalhada, transformando evidências de campo em laudos robustos para o desfecho de litígios de alta complexidade.`;

const BIO_GRAFOTECNIA = `Sob a responsabilidade do Eng. Adrisnando Menezes, a cadeira de Grafotecnia em Fortaleza aplica o exatismo da engenharia à análise científica de punhos gráficos. Especialista pós-graduado na área, o seu foco técnico reside na identificação de autoria e deteção de falsificações através da grafometria e da análise de dinamismos da escrita. Como diferencial estratégico, Adrisnando integra conhecimentos de Química Forense na sua prática — especialização atualmente em conclusão —, permitindo uma compreensão profunda da interação entre pigmentos e suportes. Localizado em Fortaleza, ele atua na blindagem de negócios jurídicos e na resolução de disputas sobre manuscritos, entregando pareceres com a fundamentação científica exigida em casos de alta complexidade.`;

const BIO_DOCUMENTOSCOPIA = `O Eng. Adrisnando Menezes detém a titularidade em Documentoscopia, especialidade dedicada ao exame da integridade física e química de documentos e títulos de crédito. Utilizando a sua base em Engenharia Mecânica e a especialização em Química Forense, Adrisnando identifica adulterações por lavagem química, raspagens ou substituições de dados com precisão laboratorial. A sua formação inclui ainda o treino em Investigação de Local de Crime (CSI), o que confere uma visão pericial aguçada sobre a preservação e análise de evidências documentais. A sua atuação é vital para garantir a autenticidade de escrituras e contratos de alto valor, oferecendo uma barreira técnica contra fraudes sofisticadas no cenário jurídico e imobiliário cearense.`;

const BIO_ENGENHARIA = `Membro associado do IBAPE/CE, o Eng. Adrisnando Menezes lidera a cadeira de Engenharia Forense, consolidando a análise de patologias construtivas, avaliações de ativos e engenharia de segurança do trabalho. O seu perfil é marcado por uma evolução académica contínua, com especializações em curso nas áreas de Engenharia de Custos e Gestão de Obras, além da Engenharia de Automação já concluída. Com o rigor normativo do CREA-CE, Adrisnando entrega laudos de inspeção predial, vistorias cautelares e avaliações imobiliárias que suportam decisões judiciais críticas. É o braço técnico para escritórios que demandam um assistente capaz de gerenciar desde a análise de riscos industriais até a quantificação precisa de danos em estruturas e equipamentos.`;

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
