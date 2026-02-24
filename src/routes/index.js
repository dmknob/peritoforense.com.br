const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');
const stateController = require('../controllers/state');
const cityController = require('../controllers/city');
const listingController = require('../controllers/listing');

router.get('/', homeController.index);
router.get('/sitemap.xml', listingController.sitemap);
router.get('/robots.txt', (req, res) => res.sendFile(require('path').join(__dirname, '../../public/robots.txt')));
router.get('/:uf', stateController.index);
router.get('/:uf/:city', cityController.index);
router.get('/:uf/:city/:specialty', listingController.show);

module.exports = router;
