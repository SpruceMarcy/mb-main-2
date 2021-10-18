let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/index', opts);
});

router.get('/alpaca', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/alpaca', opts);
});

router.get('/bean', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/bean', opts);
});

router.get('/cells', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/cells', opts);
});

router.get('/SEcircle', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/circle', opts);
});

router.get('/crytyper', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/crytyper', opts);
});

router.get('/dithering', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/dither', opts);
});

router.get('/lavalamp', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/lavalamp', opts);
});

router.get('/matrix', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/matrix', opts);
});
router.get('/sarcasm', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/sarcasm', opts);
});
router.get('/settings', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/settings', opts);
});

router.get('/uwu', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/uwu', opts);
});

router.get('/vic', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/vic', opts);
});

module.exports = router;
