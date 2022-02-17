let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  let opts = getOpts();
  res.render('projects/index', opts);
});
module.exports = router;
