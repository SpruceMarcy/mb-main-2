let express = require('express');
let router = express.Router();
let fs = require('fs');
let blogs = JSON.parse(fs.readFileSync('views/blog/blogs.json'));

/* to be moved */
router.get('/tools/uwu', function(req, res, next) {
  let opts = getOpts();
  res.render('tools/uwu', opts);
});




/* GET home page. */
router.get('/', function(req, res, next) {
  let opts = getOpts();
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

router.get('/about', function(req, res, next) {
  let opts = getOpts();
  res.render('about', opts);
});

router.get('/twitter', function(req, res, next) {
  let opts = getOpts();
  res.redirect('https://twitter.com/mxmbrook');
});
router.get('/linkedin', function(req, res, next) {
  let opts = getOpts();
  res.redirect('https://www.linkedin.com/in/marcy-brook-9a410017a/',);
});
router.get('/github', function(req, res, next) {
  let opts = getOpts();
  res.redirect('https://github.com/SpruceMarcy');
});

module.exports = router;
