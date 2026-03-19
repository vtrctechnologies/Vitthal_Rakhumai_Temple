const express = require('express');
const router = express.Router();
const ctrl = require('./sports.controller');

router.get('/', ctrl.list);

module.exports = router;
