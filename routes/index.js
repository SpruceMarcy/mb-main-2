let express = require('express');
let router = express.Router();
let fs = require('fs');
let blogs = JSON.parse(fs.readFileSync('views/blog/blogs.json'));



/* GET home page. */
router.get('/', function(req, res, next) {
  let opts = getOpts();
  opts["blog"] = blogs["posts"][blogs["most_recent"]]
  res.render('index', opts);
});

/*GET blog page*/
router.get('/blog', function(req, res, next) {
  let opts = getOpts();
  opts["blogs"] = blogs["posts"]
  res.render('blog/index', opts);
});

/*GET blog page*/
router.get('/blog/:id/?', function(req, res, next) {
  let opts = getOpts();
  opts["blog"] = blogs["posts"][req.params.id]
  res.render('blog/show', opts);
});

module.exports = router;
