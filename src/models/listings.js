const db = require('./db');

module.exports = {
    findByRoute(uf, citySlug, specialtySlug) {
        return db.prepare(`
            SELECT
                l.*,
                c.name    AS city_name,
                c.slug    AS city_slug,
                c.id      AS city_id,
                sp.name   AS specialty_name,
                sp.slug   AS specialty_slug,
                sp.h1_term,
                sp.description AS specialty_description,
                s.uf,
                s.name    AS state_name
            FROM listings l
            JOIN cities     c  ON c.id  = l.city_id
            JOIN specialties sp ON sp.id = l.specialty_id
            JOIN states      s  ON s.id  = c.state_id
            WHERE LOWER(s.uf)  = LOWER(?)
              AND c.slug        = ?
              AND sp.slug       = ?
              AND c.is_published = 1
        `).get(uf, citySlug, specialtySlug);
    },

    getAllPublished() {
        return db.prepare(`
            SELECT
                c.slug AS city_slug,
                s.uf,
                sp.slug AS specialty_slug
            FROM listings l
            JOIN cities      c  ON c.id  = l.city_id
            JOIN specialties sp ON sp.id = l.specialty_id
            JOIN states      s  ON s.id  = c.state_id
            WHERE c.is_published = 1
            ORDER BY s.uf, c.slug, sp.sort_order
        `).all();
    },

    getPublishedCities() {
        return db.prepare(`
            SELECT DISTINCT c.slug, c.name, s.uf, c.id
            FROM cities c
            JOIN states s ON s.id = c.state_id
            WHERE c.is_published = 1
            ORDER BY s.uf, c.name
        `).all();
    },
};
