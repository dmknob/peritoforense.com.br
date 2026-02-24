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
                   COALESCE(l.is_active, 0) AS is_active
            FROM specialties sp
            LEFT JOIN listings l ON l.specialty_id = sp.id AND l.city_id = ?
            ORDER BY sp.sort_order
        `).all(cityId);
    },
};
