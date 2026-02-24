const statesModel = require('../models/states');

exports.index = (req, res) => {
    const { uf } = req.params;

    const state = statesModel.findByUf(uf);
    if (!state) return res.status(404).render('pages/404', { title: 'Estado não encontrado' });

    const cities = statesModel.getPublishedCitiesByUf(uf);
    if (!cities.length) return res.status(404).render('pages/404', { title: 'Nenhuma cidade disponível neste estado' });

    // Única cidade no estado → vai direto para o hub da cidade (302, não 301,
    // pois o redirect some quando uma segunda cidade for ativada)
    if (cities.length === 1) {
        return res.redirect(302, `/${uf.toLowerCase()}/${cities[0].slug}`);
    }

    const title = `Peritos Forenses em ${state.name} – ${state.uf}`;
    const description = `Lista de cidades com peritos forenses e assistência técnica judicial disponíveis no estado de ${state.name}.`;

    const BASE_URL = process.env.BASE_URL;
    const pageUrl = `${BASE_URL}/${uf.toLowerCase()}`;

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Portal', item: BASE_URL },
                    { '@type': 'ListItem', position: 2, name: state.name, item: pageUrl },
                ],
            },
        ],
    });

    res.render('pages/state', {
        title,
        description,
        jsonLd,
        state,
        cities,
    });
};
