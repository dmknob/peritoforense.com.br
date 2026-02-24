const citiesModel = require('../models/cities');

exports.index = (req, res) => {
    const { uf, city: citySlug } = req.params;

    const city = citiesModel.findBySlug(uf, citySlug);
    if (!city) return res.status(404).render('pages/404', { title: 'Cidade não encontrada' });

    const specialties = citiesModel.getSpecialtiesWithStatus(city.id);

    const title = `Peritos Forenses em ${city.name} – ${city.uf}`;
    const description = `Encontre peritos forenses e assistência técnica judicial em ${city.name}/${city.uf}. Digite seu contato ao perito exclusivo na sua área de interesse.`;

    const BASE_URL = process.env.BASE_URL;
    const pageUrl = `${BASE_URL}/${uf.toLowerCase()}/${citySlug}`;

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Portal', item: BASE_URL },
                    { '@type': 'ListItem', position: 2, name: city.name, item: pageUrl },
                ],
            },
            {
                '@type': 'ItemList',
                name: title,
                description,
                url: pageUrl,
                itemListElement: specialties.map((s, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    name: s.name,
                    url: `${pageUrl}/${s.slug}`,
                })),
            },
        ],
    });

    res.render('pages/city', {
        title,
        description,
        jsonLd,
        city,
        specialties,
    });
};

exports.allCities = (req, res) => {
    const statesWithCities = citiesModel.getAllGroupedByState();

    // Count total cities
    const totalCities = statesWithCities.reduce((acc, state) => acc + state.cities.length, 0);

    const title = 'Cidades e Estados Atendidos';
    const description = `Veja a lista de todos os ${totalCities} municípios com atuação de peritos forenses e assistentes técnicos judiciais do portal.`;

    const BASE_URL = process.env.BASE_URL;
    const pageUrl = `${BASE_URL}/cidades`;

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Portal', item: BASE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Cidades Atendidas', item: pageUrl },
                ],
            }
        ],
    });

    res.render('pages/all-cities', {
        title,
        description,
        jsonLd,
        statesWithCities,
        totalCities
    });
};
