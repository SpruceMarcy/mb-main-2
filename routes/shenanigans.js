let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/index', opts);
});
router.get('/JSAlpaca', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/JSAlpaca', opts);
});
router.get('/JSBean', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/JSBean', opts);
});
router.get('/JSCells', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/JSCells', opts);
});
router.get('/Crytyper', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/Crytyper', opts);
});
router.get('/JSLavalamp', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/JSLavalamp', opts);
});
router.get('/Sarcasm', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/Sarcasm', opts);
});
router.get('/settings', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/settings', opts);
});
router.get('/uwu', function(req, res, next) {
  let opts = getOpts();
  res.render('shenanigans/uwu', opts);
});

module.exports = router;
