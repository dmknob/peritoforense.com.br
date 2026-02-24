const db = require('./db');

module.exports = {
    findByUf(uf) {
        return db.prepare(`
            SELECT s.id, s.uf, s.name
            FROM states s
            WHERE LOWER(s.uf) = LOWER(?)
        `).get(uf);
    },

    getPublishedCitiesByUf(uf) {
        return db.prepare(`
            SELECT c.id, c.name, c.slug, s.uf
            FROM cities c
            JOIN states s ON s.id = c.state_id
            WHERE LOWER(s.uf) = LOWER(?)
              AND c.is_published = 1
            ORDER BY c.name ASC
        `).all(uf);
    },

    getAllStatesWithCities() {
        return db.prepare(`
            SELECT s.id, s.uf, s.name,
                   COUNT(c.id) AS city_count
            FROM states s
            JOIN cities c ON c.state_id = s.id
            WHERE c.is_published = 1
            GROUP BY s.id
            ORDER BY s.name ASC
        `).all();
    },
};
