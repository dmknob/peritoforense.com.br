const listingsModel = require('../models/listings');
const statesModel = require('../models/states');

exports.show = (req, res) => {
    const { uf, city: citySlug, specialty: specialtySlug } = req.params;

    const listing = listingsModel.findByRoute(uf, citySlug, specialtySlug);
    if (!listing) return res.status(404).render('pages/404', { title: 'Página não encontrada' });

    const title = `${listing.h1_term} em ${listing.city_name} – ${listing.state_name}`;
    const description = `${listing.is_active
        ? `Contrate o perito ${listing.partner_name} em ${listing.city_name}/${listing.uf}. Assistência técnica judicial especializada.`
        : `Vaga exclusiva de ${listing.h1_term} em ${listing.city_name}/${listing.uf}. Posição em seleção.`
        }`;

    const jsonLd = listing.is_active
        ? JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: listing.partner_name,
            description: listing.partner_bio,
            areaServed: listing.city_name,
            url: `${process.env.BASE_URL}/${uf.toLowerCase()}/${citySlug}/${specialtySlug}`,
        })
        : JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description,
            url: `${process.env.BASE_URL}/${uf.toLowerCase()}/${citySlug}/${specialtySlug}`,
        });

    res.render('pages/listing', {
        title,
        description,
        jsonLd,
        listing,
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
