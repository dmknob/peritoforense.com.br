const citiesModel = require('../models/cities');

exports.index = (req, res) => {
    const { uf, city: citySlug } = req.params;

    const city = citiesModel.findBySlug(uf, citySlug);
    if (!city) return res.status(404).render('pages/404', { title: 'Cidade não encontrada' });

    const specialties = citiesModel.getSpecialtiesWithStatus(city.id);

    const title = `Peritos Forenses em ${city.name} – ${city.uf}`;
    const description = `Encontre peritos forenses e assistência técnica judicial em ${city.name}/${city.uf}. Digite seu contato ao perito exclusivo na sua área de interesse.`;

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `${process.env.BASE_URL}/${uf.toLowerCase()}/${citySlug}`,
    });

    res.render('pages/city', {
        title,
        description,
        jsonLd,
        city,
        specialties,
    });
};
