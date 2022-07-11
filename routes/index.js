var express = require('express');
var router = express.Router();
const Mensaje = require('../models/mensaje.model');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const chatlog = (await Mensaje.find().sort({ createdAt: -1 }).limit(5)).reverse()
  res.render('index', { chatlog });
});

module.exports = router;
