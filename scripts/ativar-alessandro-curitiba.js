/**
 * Script de Produção — Ativação do Parceiro Alessandro Gomes (Curitiba/PR)
 *
 * Ativa duas posições simultaneamente:
 *   → /pr/curitiba/grafotecnia
 *   → /pr/curitiba/documentoscopia
 *
 * Uso:
 *   node scripts/ativar-alessandro-curitiba.js            → Ativa ambas as vagas
 *   node scripts/ativar-alessandro-curitiba.js --desfazer → Reverte ambas para "Vácuo de Poder"
 *
 * ⚠️  ATENÇÃO: Preencha as variáveis na seção de configuração antes de executar.
 * Plano de implementação: docs/plano-ativacao-alessandro-curitiba.md
 */

const db = require('../src/models/db');

// ──────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DO PARCEIRO — preencher antes de executar
// ──────────────────────────────────────────────────────────────────
const PARCEIRO = {
    nome: 'Alessandro Gomes',
    whatsapp: '5541996721183',  // ⚠️ SEMPRE string com aspas — número sem aspas vira REAL no SQLite e quebra a URL do WhatsApp (ex: 5541...183.0)
    registro: null,             // Preencher: ex. 'ABG nº 1234' ou 'CRO-PR 12345'
    foto: null,                 // Preencher futuramente: ex. '/img/parceiros/alessandro-gomes.webp'
};

const CIDADE_SLUG = 'curitiba';
const ESTADO_UF = 'PR';

// Textos extraídos de docs/PERITO_PARANA_CURITIBA_ALESSANDRO_TEXTO_SITE.TXT
const BIO_GRAFOTECNIA = `A Ciência da Escrita: Perícia Grafotécnica de Alta Precisão em Curitiba

No cenário jurídico paranaense, a contestação de uma assinatura exige um rigor analítico que ultrapassa a simples comparação de formas. A perícia grafotécnica desenvolvida por Alessandro Gomes foca na gênese do gesto gráfico, utilizando fundamentos de Neurociências e Psicopatologia — formação consolidada na PUCPR — para identificar impulsos neuromusculares involuntários que tornam qualquer tentativa de falsificação detectável. Esta abordagem científica assegura que o laudo pericial seja um alicerce inexpugnável no Tribunal de Justiça do Paraná (TJPR) e em outras esferas, como o TJSC, TJMG, TRF4 e TRTPR, onde o perito atua com frequência.

Expertise em Análise de Autenticidade e Tecnologia Forense

O exame da escrita é potencializado pelo uso de tecnologias de ponta, como a Espectrofotometria e métodos analíticos modernos (HPLC e UPLC), fundamentais para o escrutínio técnico de pigmentos e a integridade de suportes. Aliado a isso, a formação em Biometrias Digitais e a especialização em Perícia Cibernética permitem que Alessandro Gomes atue com autoridade inquestionável em casos que envolvam assinaturas eletrônicas e biometrias, protegendo a segurança jurídica em um ambiente digital.

Rigor Operacional e Validação Internacional

A precisão técnica é complementada por uma disciplina operativa rigorosa, herdada de sua trajetória como Instrutor Tático de Defesa com certificação internacional na França, pela J.D.POLICE-C.I.P. A capacidade de detecção de fraudes é ainda refinada por capacitações na Academia Nacional de Polícia (Polícia Federal) e experiência em inteligência anticorrupção, garantindo que cada diligência em Curitiba seja conduzida sob o mais estrito padrão ético e técnico.`;

const BIO_DOCUMENTOSCOPIA = `Documentoscopia Forense: Ciência Aplicada à Detecção de Fraudes Documentais

A integridade documental é o pilar da estabilidade nos negócios e no judiciário. Em Curitiba, Alessandro Gomes oferece uma resposta sofisticada às fraudes documentais contemporâneas, especializando-se no Exame Avançado de Datação de Documentos e na análise de autenticidade de suportes físicos e digitais. Através de métodos laboratoriais de precisão, como o uso de Espectrofotômetros para análise de tintas, o perito fornece subsídios técnicos definitivos para magistrados e advogados no TJPR, TRF4 e em instâncias trabalhistas como o TRTPR.

Especialização em Vestígios Materiais e Provas Digitais

A atuação em Documentoscopia Avançada exige uma compreensão holística do vestígio. Alessandro Gomes integra conhecimentos de Papiloscopia, DNA Forense e Medicina Legal para garantir que nenhuma alteração ou montagem passe despercebida. Com a crescente desmaterialização de processos, sua pós-graduação em Perícia Cibernética e formação em Investigação Cibernética Forense asseguram a guarda e a análise de provas em ambientes virtuais com o mesmo rigor aplicado aos documentos físicos.

Diferenciais Investigativos e Disciplina Técnica

O olhar crítico sobre a fraude é potencializado pela formação em Análise e Detecção de Comportamentos Suspeitos pela Polícia Federal e pela experiência como Agente de Inteligência. Esse background, somado à certificação internacional como Instrutor Tático na França, confere a Alessandro Gomes uma autoridade única na custódia de provas e na elaboração de laudos sóbrios e imponentes, desenhados para resistir ao mais severo questionamento processual.`;

// Especialidades a ativar
const VAGAS = [
    { slug: 'grafotecnia', bio: BIO_GRAFOTECNIA },
    { slug: 'documentoscopia', bio: BIO_DOCUMENTOSCOPIA },
];
// ──────────────────────────────────────────────────────────────────

const desfazer = process.argv.includes('--desfazer');

/*
// Validação antecipada: garante que WhatsApp foi preenchido antes de ativar
if (!desfazer && !PARCEIRO.whatsapp) {
    console.error('❌ PARCEIRO.whatsapp está vazio.');
    console.error('   Por favor, preencha a variável antes de executar este script.');
    console.error('   Consulte: docs/plano-ativacao-alessandro-curitiba.md');
    process.exit(1);
}
*/

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
    console.log(`🏅 Registro: ${PARCEIRO.registro || '(não informado)'}`);
    console.log(`\n   Para reverter: node scripts/ativar-alessandro-curitiba.js --desfazer`);
}
