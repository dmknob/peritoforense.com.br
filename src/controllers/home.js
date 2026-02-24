const SPECIALTIES = [
    { name: 'Forense Digital', slug: 'forense-digital', icon: '💻', description: 'Crimes cibernéticos, recuperação de dados e análise de dispositivos.' },
    { name: 'Grafotecnia', slug: 'grafotecnia', icon: '✍️', description: 'Veracidade de assinaturas e escritas manuais.' },
    { name: 'Documentoscopia', slug: 'documentoscopia', icon: '📄', description: 'Autenticidade de documentos físicos e digitais.' },
    { name: 'Engenharia Forense', slug: 'engenharia-forense', icon: '🏗️', description: 'Perícia em obras, estruturas e acidentes de engenharia.' },
    { name: 'Avaliação de Imóveis', slug: 'avaliacao-de-imoveis', icon: '🏛️', description: 'Determinação de valores para fins judiciais e inventários.' },
    { name: 'Perícia Contábil', slug: 'pericia-contabil', icon: '📊', description: 'Auditoria em cálculos financeiros, tributários e societários.' },
    { name: 'Perícia Trabalhista', slug: 'pericia-trabalhista', icon: '⚖️', description: 'Avaliação de nexo causal, incapacidades e liquidação de verbas.' },
    { name: 'Acidentes de Trânsito', slug: 'acidentes-de-transito', icon: '🚗', description: 'Reconstituição de colisões e análise de dinâmica veicular.' },
    { name: 'Propriedade Intelectual', slug: 'propriedade-intelectual', icon: '🔒', description: 'Perícia em plágio de software, patentes e marcas.' },
    { name: 'Perícia Ambiental', slug: 'pericia-ambiental', icon: '🌿', description: 'Avaliação de danos ao meio ambiente e conformidade técnica.' },
];

exports.index = (req, res) => {
    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Portal Nacional de Perícia Forense',
        url: process.env.BASE_URL,
        description: 'Conectando os mais qualificados peritos assistentes aos escritórios de advocacia e empresas de todo o país.',
        potentialAction: {
            '@type': 'SearchAction',
            target: `${process.env.BASE_URL}/busca?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    });

    res.render('pages/home', {
        title: 'Portal Nacional de Perícia Forense e Assistência Técnica Judicial',
        description: 'Encontre o perito forense exclusivo em sua cidade. Forense Digital, Grafotecnia, Documentoscopia, Engenharia Forense e mais.',
        specialties: SPECIALTIES,
        jsonLd,
    });
};
