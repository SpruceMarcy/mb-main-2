let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/index', opts);
});
router.get('/SECircle', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/SECircle', opts);
});
router.get('/Dithering', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/DitheringDemonstration', opts);
});
router.get('/Matrix', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/MatrixMultiplication', opts);
});
router.get('/Vic20ArtEditor', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/Vic20ArtEditor', opts);
});
router.get('/Phylogenetic_Tree_Editor',function (req, res, next){
  let opts = getOpts();
  res.render('tools/Phylogeny',opts)
});
module.exports = router;
