const express = require('express');
const router = express.Router();
const ctrl = require('./settings.controller');

router.get('/', ctrl.get);

module.exports = router;
