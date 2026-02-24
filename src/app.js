require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/default');

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Template locals disponíveis em todas as views
app.use((req, res, next) => {
    res.locals.BASE_URL = process.env.BASE_URL || '';
    res.locals.WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '';
    res.locals.GA_ID = process.env.GA_ID || '';
    res.locals.path = req.path;
    // Defaults — controllers podem sobrescrever
    res.locals.title = 'Portal Nacional de Perícia Forense';
    res.locals.description = 'Conectando os mais qualificados peritos assistentes aos escritórios de advocacia e empresas de todo o país.';
    res.locals.ogMeta = null;
    res.locals.jsonLd = null;
    next();
});

// Routes
app.use('/', require('./routes/index'));

// 404
app.use((req, res) => {
    res.status(404).render('pages/404', { title: 'Página não encontrada' });
});

module.exports = app;
