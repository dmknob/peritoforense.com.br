const listingsModel = require('../models/listings');
const statesModel = require('../models/states');

// FAQ genérico por especialidade — Leandro personaliza via seo_intro_html
const SPECIALTY_FAQS = {
    'forense-digital': [
        {
            q: 'O que faz um Perito Forense Digital?',
            a: 'O Perito Forense Digital realiza a coleta, preservação e análise de evidências em dispositivos eletrônicos — computadores, celulares, servidores e mídias de armazenamento — para uso em processos judiciais. Sua atuação é fundamental em casos de crimes cibernéticos, vazamento de dados e fraudes digitais.',
        },
        {
            q: 'Quando devo contratar um assistente técnico em Forense Digital?',
            a: 'Sempre que houver evidências digitais em disputa — e-mails adulterados, contratos eletrônicos questionados, desvio de dados corporativos ou invasão de sistemas. O assistente técnico garante que a perícia oficial seja contestada com embasamento técnico independente.',
        },
        {
            q: 'O laudo do perito assistente tem validade judicial?',
            a: 'Sim. O parecer do assistente técnico é peça processual legalmente reconhecida pelo CPC (art. 465 e seguintes). Ele pode contestar o laudo do perito do juízo ou reforçar a tese da parte contratante.',
        },
        {
            q: 'Há urgência no prazo para contratar um perito assistente em Forense Digital?',
            a: 'Sim. O assistente técnico deve ser indicado logo após a nomeação do perito oficial, para garantir participação em todas as fases da perícia. Entre em contato pelo WhatsApp disponível nesta página.',
        },
    ],
    'grafotecnia': [
        {
            q: 'O que é a perícia grafotécnica?',
            a: 'A grafotecnia é a ciência que analisa a autenticidade de assinaturas e escritas manuais. O Perito Grafotécnico examina documentos para identificar falsificações, adulterações e determinar a autoria de manuscritos em contratos, testamentos e cheques.',
        },
        {
            q: 'Quando devo solicitar uma perícia de assinatura?',
            a: 'Sempre que houver suspeita de assinatura falsa em contratos, procurações, cheques, testamentos ou qualquer documento que fundamente uma relação jurídica. A perícia grafotécnica é admitida como prova em processos cíveis e criminais.',
        },
        {
            q: 'Quanto tempo leva uma perícia grafotécnica?',
            a: 'O prazo varia conforme a complexidade do material e a quantidade de documentos a analisar. Em geral, laudos simples ficam prontos em 5 a 15 dias úteis. O assistente técnico pode informar o prazo estimado na consulta inicial.',
        },
        {
            q: 'Quais documentos devo guardar para a perícia grafotécnica?',
            a: 'Preserve todos os documentos originais em questão — cópias não substituem o original para análise de tinta e papel. Também são úteis outros documentos com a assinatura genuína do suspeito para comparação. Entre em contato pelo WhatsApp nesta página para uma orientação inicial sobre o seu caso.',
        },
    ],
    'documentoscopia': [
        {
            q: 'O que analisa o Perito em Documentoscopia?',
            a: 'O Perito Documentoscopista examina a autenticidade física e química de documentos: papel, tinta, impressão, carimbos, rasuras e qualquer alteração que comprometa a integridade do documento original. Atua em RGs, CPFs, diplomas, contratos e documentos públicos.',
        },
        {
            q: 'Qual a diferença entre documentoscopia e grafotecnia?',
            a: 'A grafotecnia foca na análise de escritas e assinaturas manuais. A documentoscopia tem escopo mais amplo: analisa o suporte físico do documento, os materiais de impressão, carimbos e toda a estrutura material do documento — independentemente do conteúdo manuscrito.',
        },
        {
            q: 'Diplomas e certificados podem ser periciados?',
            a: 'Sim. A documentoscopia é amplamente utilizada para verificar a autenticidade de diplomas universitários, certificados profissionais e títulos eleitorais. O laudo pericial pode ser usado em processos administrativos e judiciais.',
        },
        {
            q: 'Posso solicitar uma análise preliminar antes de abrir processo judicial?',
            a: 'Sim. Muitos clientes contratam o perito documentoscopista em caráter extrajudicial para confirmar a suspeita antes de protocolar a ação. Esse laudo preliminar já orienta a estratégia jurídica e pode ser juntado ao processo se necessário. Consulte um especialista pelo WhatsApp disponível nesta página.',
        },
    ],
    'engenharia-forense': [
        {
            q: 'O que faz um Perito de Engenharia Forense?',
            a: 'O Perito de Engenharia Forense analisa obras, estruturas, acidentes de construção e falhas de equipamentos para determinar causas, responsabilidades e avaliar danos. Atua em litígios envolvendo construtoras, incorporadoras e acidentes de trabalho na construção civil.',
        },
        {
            q: 'Quando a perícia de engenharia é necessária em disputas judiciais?',
            a: 'Em qualquer processo que envolva qualidade de obra, vícios construtivos, desabamentos, alagamentos causados por falhas estruturais, laudos de vistoria, avaliação de benfeitorias ou responsabilidade técnica de profissionais de engenharia e arquitetura.',
        },
        {
            q: 'O assistente técnico de engenharia pode acompanhar a vistoria do perito oficial?',
            a: 'Sim, e é altamente recomendado. O CPC permite que o assistente técnico acompanhe todas as diligências do perito nomeado pelo juízo, formule quesitos e elabore pareceres técnicos sobre o laudo oficial.',
        },
        {
            q: 'Como contratar um perito de engenharia forense nesta região?',
            a: 'Entre em contato pelo WhatsApp indicado nesta página. Nossa central de coordenação conecta você ao engenheiro perito disponível para atuar na comarca do seu processo, com experiência em litígios de construção civil, estruturas e avaliações de imóveis.',
        },
    ],
    'avaliacao-de-imoveis': [
        {
            q: 'O que é um laudo de avaliação de imóvel para fins judiciais?',
            a: 'É um documento técnico elaborado por engenheiro ou arquiteto habilitado que determina o valor de mercado ou valor venal de um imóvel para uso em processos de inventário, divórcio, desapropriação, execução judicial e partilha de bens.',
        },
        {
            q: 'Qual a diferença entre avaliação judicial e avaliação de mercado?',
            a: 'A avaliação de mercado é produzida para fins comerciais (venda, locação). A avaliação judicial segue normas técnicas específicas (ABNT NBR 14653) e produz laudo com validade como prova pericial em juízo, podendo ser contestada por assistente técnico da parte contrária.',
        },
        {
            q: 'Quando é necessário contratar um assistente técnico na avaliação de imóvel?',
            a: 'Sempre que a avaliação feita pelo perito oficial do juízo parecer subestimada ou superestimada. O assistente técnico pode elaborar parecer técnico discordante e sugerir a realização de nova perícia ou esclarecimentos pelo perito nomeado.',
        },
        {
            q: 'O valor da avaliação pode mudar o resultado do meu processo?',
            a: 'Sim, significativamente. Em inventários, divórcios e execuções, o valor do imóvel impacta diretamente a partilha, o valor da dívida ou da arrematação. Um assistente técnico que conteste uma avaliação equivocada pode representar diferenças de dezenas de milhares de reais. Consulte pelo WhatsApp desta página.',
        },
    ],
    'pericia-contabil': [
        {
            q: 'O que faz um Perito Contador?',
            a: 'O Perito Contador realiza a perícia contábil em processos judiciais: analisa livros fiscais, demonstrações financeiras, apuração de haveres, cálculos de indenização e liquidação de sentenças. É especialidade com regulamentação própria do CFC (Normas Técnicas de Perícia Contábil).',
        },
        {
            q: 'Em quais tipos de processo a perícia contábil é obrigatória?',
            a: 'A perícia contábil é frequente em ações de dissolução de sociedade, apuração de haveres, investigação de balanços fraudulentos, cálculo de alimentos, execuções fiscais e qualquer litígio em que os números financeiros sejam objeto de disputa.',
        },
        {
            q: 'O assistente técnico contábil pode questionar os cálculos do perito oficial?',
            a: 'Sim. O assistente técnico contábil analisa o laudo do perito nomeado, identifica erros metodológicos ou de cálculo e apresenta parecer técnico ao juiz. Essa atuação pode resultar em diferenças significativas no valor da condenação ou da indenização.',
        },
        {
            q: 'Quando devo acionar o assistente técnico contábil no meu processo?',
            a: 'O ideal é contratá-lo logo após a nomeação do perito oficial, para que ele possa acompanhar todas as fases da perícia e formular quesitos dentro do prazo legal. Não espere o laudo chegar — entre em contato pelo WhatsApp nesta página assim que o processo pericial for instaurado.',
        },
    ],
    'pericia-trabalhista': [
        {
            q: 'O que é a perícia trabalhista?',
            a: 'A perícia trabalhista é realizada em processos na Justiça do Trabalho para apurar questões técnicas como: insalubridade, periculosidade, nexo causal de doenças ocupacionais, acidente de trabalho e liquidação de verbas rescisórias. O perito é especialista em normas de segurança e saúde do trabalho.',
        },
        {
            q: 'Quando a empresa deve contratar um assistente técnico trabalhista?',
            a: 'Sempre que o reclamante alegar insalubridade, periculosidade ou doença ocupacional. O assistente técnico da empresa pode contestar o enquadramento, o agente nocivo apontado ou o nexo causal apresentado pelo perito official.',
        },
        {
            q: 'O laudo pericial trabalhista vincula o juiz?',
            a: 'Não vincula, mas tem peso probatório elevado. O juiz pode divergir do laudo, desde que fundamente sua decisão. Por isso, contar com um assistente técnico que elabore parecer técnico robusto aumenta significativamente as chances de contestação bem-sucedida.',
        },
        {
            q: 'A empresa pode ser condenada a pagar adicional de insalubridade retroativo sem perícia?',
            a: 'Sim, se não contestada a tempo. A ausência de assistente técnico deixa o laudo do perito official sem contraditório técnico, e o juiz tende a homologá-lo. Para evitar condenações indevidas, acione o assistente técnico pelo WhatsApp disponível nesta página assim que a reclamação trabalhista for distribuída.',
        },
    ],
    'acidentes-de-transito': [
        {
            q: 'O que faz o Perito de Acidente de Trânsito?',
            a: 'O Perito de Acidente de Trânsito reconstitui a dinâmica de colisões e atropelamentos, analisa danos veiculares, velocidades, marcas de frenagem e condições das vias para determinar causas e responsabilidades. Seu laudo é peça central em ações de indenização por danos materiais e morais.',
        },
        {
            q: 'A perícia de trânsito pode reverter uma condenação baseada no boletim de ocorrência?',
            a: 'Sim. O boletim de ocorrência é um documento informativo, não uma prova técnica. A perícia de trânsito analisa a física do acidente e pode demonstrar que a versão registrada no BO não é tecnicamente compatível com os danos encontrados nos veículos e na pista.',
        },
        {
            q: 'Quando devo contratar um perito assistente em acidente de trânsito?',
            a: 'Sempre que houver processo judicial envolvendo responsabilidade pelo acidente — seja para contestar a versão da outra parte ou para fortalecer o pedido de indenização. O assistente técnico acompanha a perícia oficial e elabora parecer independente.',
        },
        {
            q: 'Posso contratar o perito assistente antes do processo ser aberto?',
            a: 'Sim. Um laudo extrajudicial elaborado logo após o acidente registra os vestígios enquanto ainda existem — marcas na pista, posição dos veículos, danos não reparados. Esse laudo pode ser usado na fase pré-processual e reforça muito a posição da sua parte. Consulte pelo WhatsApp nesta página.',
        },
    ],
    'propriedade-intelectual': [
        {
            q: 'O que analisa o Perito em Propriedade Intelectual?',
            a: 'O Perito em Propriedade Intelectual analisa casos de plágio de software, violação de patentes, uso indevido de marcas registradas, cópia de obras protegidas por direito autoral e violação de segredos industriais. Sua atuação é técnica e vai além da análise jurídica do caso.',
        },
        {
            q: 'Como funciona a perícia de plágio de software?',
            a: 'O perito analisa o código-fonte dos programas envolvidos, identifica similaridades estruturais, algoritmos copiados e padrões de desenvolvimento. A análise vai além do código aparente, examinando a arquitectura interna e as decisões de design do sistema.',
        },
        {
            q: 'A perícia de propriedade intelectual é admitida em quais juízos?',
            a: 'A perícia é admitida na Justiça Federal (patentes e marcas registradas no INPI), na Justiça Estadual (direito autoral e concorrência desleal) e em arbitragens. O assistente técnico pode atuar em todos esses foros.',
        },
        {
            q: 'O código-fonte da minha empresa ficará confidencial durante a perícia?',
            a: 'Sim. O perito assistente em propriedade intelectual é obrigado a manter sigilo sobre os materiais analisados, e o processo pode tramitar em segredo de justiça quando envolve segredo industrial. Consulte um especialista pelo WhatsApp nesta página para entender como proteger seus ativos durante a disputa.',
        },
    ],
    'pericia-ambiental': [
        {
            q: 'O que faz o Perito Ambiental em processos judiciais?',
            a: 'O Perito Ambiental avalia danos ao meio ambiente causados por desmatamento, contaminação de solo e água, poluição atmosférica e sonora, e descarte irregular de resíduos. Seu laudo quantifica o dano e pode subsidiar ações de indenização por dano ambiental e Termos de Ajustamento de Conduta.',
        },
        {
            q: 'A perícia ambiental é necessária em licenciamentos contestados?',
            a: 'Sim. Quando um licenciamento ambiental é contestado judicialmente — por comunidades afetadas, pelo Ministério Público ou por concorrentes — o assistente técnico ambiental pode analisar os estudos de impacto apresentados e apontar falhas ou omissões na avaliação oficial.',
        },
        {
            q: 'Qual a diferença entre perícia ambiental judicial e consultoria ambiental?',
            a: 'A consultoria ambiental é contratada para assessoria técnica extrajudicial — licenciamentos, relatórios e planos de gestão. A perícia ambiental judicial é produzida especificamente para um processo e deve seguir normas processuais, podendo ser submetida ao contraditório pela parte contrária.',
        },
        {
            q: 'Empresas autuadas por órgãos ambientais podem usar laudos periciais na defesa?',
            a: 'Sim. O laudo de assistente técnico ambiental pode ser apresentado tanto em processos administrativos quanto judiciais para contestar o enquadramento da infração, demonstrar ausência de nexo causal ou quantificar o dano real de forma mais precisa. Entre em contato pelo WhatsApp desta página para uma avaliação do seu caso.',
        },
    ],
};

const DEFAULT_FAQS = [
    {
        q: 'O que é um assistente técnico judicial?',
        a: 'O assistente técnico é um profissional especializado contratado pela parte em um processo judicial para acompanhar, contestar ou corroborar o laudo produzido pelo perito nomeado pelo juiz. Sua atuação está prevista no Código de Processo Civil (art. 465 e seguintes).',
    },
    {
        q: 'Qual a diferença entre perito do juízo e assistente técnico?',
        a: 'O perito do juízo é nomeado pelo juiz e produz laudo imparcial. O assistente técnico é contratado pela parte e atua em defesa dos interesses do seu contratante dentro dos limites técnicos e éticos da profissão.',
    },
    {
        q: 'Como contratar um perito assistente nesta região?',
        a: 'Entre em contato pelo WhatsApp disponibilizado nesta página. Nossa central conecta você ao profissional mais adequado para o seu caso, considerando a especialidade e a localidade do processo.',
    },
];

exports.show = (req, res) => {
    const { uf, city: citySlug, specialty: specialtySlug } = req.params;

    const listing = listingsModel.findByRoute(uf, citySlug, specialtySlug);
    if (!listing) return res.status(404).render('pages/404', { title: 'Página não encontrada' });

    const BASE_URL = process.env.BASE_URL;
    const pageUrl = `${BASE_URL}/${uf.toLowerCase()}/${citySlug}/${specialtySlug}`;

    const title = `${listing.h1_term} em ${listing.city_name} – ${listing.state_name}`;
    const description = `${listing.is_active
        ? `Contrate o perito ${listing.partner_name} em ${listing.city_name}/${listing.uf}. Assistência técnica judicial especializada.`
        : `Vaga exclusiva de ${listing.h1_term} em ${listing.city_name}/${listing.uf}. Posição em seleção.`
        }`;

    const faqs = SPECIALTY_FAQS[specialtySlug] || DEFAULT_FAQS;

    // ── BreadcrumbList ───────────────────────────────────────────────
    const breadcrumb = {
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Portal', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: listing.state_name, item: `${BASE_URL}/${uf.toLowerCase()}` },
            { '@type': 'ListItem', position: 3, name: listing.city_name, item: `${BASE_URL}/${uf.toLowerCase()}/${citySlug}` },
            { '@type': 'ListItem', position: 4, name: listing.specialty_name, item: pageUrl },
        ],
    };

    // ── ProfessionalService / Service ────────────────────────────────
    const serviceSchema = listing.is_active
        ? {
            '@type': 'ProfessionalService',
            name: listing.partner_name,
            description: listing.partner_bio || description,
            url: pageUrl,
            telephone: listing.partner_whatsapp ? `+55${listing.partner_whatsapp}` : undefined,
            image: listing.partner_photo || undefined,
            areaServed: {
                '@type': 'City',
                name: listing.city_name,
            },
            serviceType: listing.specialty_name,
            employee: {
                '@type': 'Person',
                name: listing.partner_name,
                jobTitle: listing.h1_term,
            },
        }
        : {
            '@type': 'Service',
            name: title,
            description,
            url: pageUrl,
            areaServed: {
                '@type': 'City',
                name: listing.city_name,
            },
            serviceType: listing.specialty_name,
            provider: {
                '@type': 'Organization',
                name: 'peritoforense.com.br',
                url: BASE_URL,
            },
        };

    // ── FAQPage ──────────────────────────────────────────────────────
    const faqSchema = {
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
        })),
    };

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [breadcrumb, serviceSchema, faqSchema],
    });

    res.render('pages/listing', {
        title,
        description,
        jsonLd,
        listing,
        faqs,
    });
};

exports.sitemap = (req, res) => {
    const routes = listingsModel.getAllPublished();
    const cities = listingsModel.getPublishedCities();
    const BASE_URL = process.env.BASE_URL;

    const today = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home
    xml += `  <url><loc>${BASE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n`;

    // Hub Todas as Cidades
    xml += `  <url><loc>${BASE_URL}/cidades</loc><changefreq>monthly</changefreq><priority>0.9</priority><lastmod>${today}</lastmod></url>\n`;

    // Páginas de estado
    const states = statesModel.getAllStatesWithCities();
    for (const s of states) {
        xml += `  <url><loc>${BASE_URL}/${s.uf.toLowerCase()}</loc><changefreq>monthly</changefreq><priority>0.7</priority><lastmod>${today}</lastmod></url>\n`;
    }

    // Hub de cidades
    for (const c of cities) {
        xml += `  <url><loc>${BASE_URL}/${c.uf.toLowerCase()}/${c.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>\n`;
    }

    // Páginas de especialidade
    for (const r of routes) {
        xml += `  <url><loc>${BASE_URL}/${r.uf.toLowerCase()}/${r.city_slug}/${r.specialty_slug}</loc><changefreq>monthly</changefreq><priority>0.9</priority><lastmod>${today}</lastmod></url>\n`;
    }

    xml += `</urlset>`;
    res.send(xml);
};
