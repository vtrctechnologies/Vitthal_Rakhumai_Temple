const express = require('express');
const router = express.Router();
const ctrl = require('./live.controller');

router.get('/', ctrl.list);

module.exports = router;
