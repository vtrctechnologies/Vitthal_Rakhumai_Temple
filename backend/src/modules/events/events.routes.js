const express = require('express');
const router = express.Router();
const ctrl = require('./events.controller');

router.get('/', ctrl.list);

module.exports = router;
