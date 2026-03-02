const db = require('./db');

module.exports = {
    findBySlug(uf, citySlug) {
        return db.prepare(`
            SELECT c.*, s.uf, s.name AS state_name
            FROM cities c
            JOIN states s ON s.id = c.state_id
            WHERE LOWER(s.uf) = LOWER(?)
              AND c.slug = ?
              AND c.is_published = 1
        `).get(uf, citySlug);
    },

    getSpecialtiesWithStatus(cityId) {
        return db.prepare(`
            SELECT sp.id, sp.name, sp.slug, sp.h1_term, sp.description, sp.sort_order,
                   COALESCE(l.is_active, 0) AS is_active,
                   COALESCE(l.is_hidden, 0) AS is_hidden
            FROM specialties sp
            LEFT JOIN listings l ON l.specialty_id = sp.id AND l.city_id = ?
            ORDER BY sp.sort_order
        `).all(cityId);
    },

    getAllGroupedByState() {
        const rows = db.prepare(`
            SELECT c.name AS city_name, c.slug AS city_slug, c.id AS city_id,
                   s.uf, s.name AS state_name
            FROM cities c
            JOIN states s ON s.id = c.state_id
            WHERE c.is_published = 1
            ORDER BY s.name, c.name
        `).all();

        const grouped = [];
        let currentState = null;

        for (const row of rows) {
            if (!currentState || currentState.uf !== row.uf) {
                currentState = {
                    uf: row.uf,
                    name: row.state_name,
                    cities: []
                };
                grouped.push(currentState);
            }
            currentState.cities.push({
                id: row.city_id,
                name: row.city_name,
                slug: row.city_slug
            });
        }
        return grouped;
    },
};
