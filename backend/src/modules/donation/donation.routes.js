const express = require('express');
const router = express.Router();
const ctrl = require('./donation.controller');

router.post('/', ctrl.create);

module.exports = router;
