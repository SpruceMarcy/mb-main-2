let express = require('express');
let router = express.Router();
const request = require('request');
const nodemailer = require('nodemailer');
let fs = require('fs');
let blogs = JSON.parse(fs.readFileSync('views/blog/blogs.json'));

/* GET home page. */
router.get('/', function(req, res, next) {
  let opts = getOpts();
  res.render('index', opts);
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  let opts = getOpts();
  opts["include_recaptcha"] = true
  res.render('contact', opts);
});
/* POST contact page. */
router.post('/contact', function(req, res, next) {
  let opts = getOpts();
  let ipV6Stripped = req.socket.localAddress
  if (ipV6Stripped.startsWith("::ffff:")){
    ipV6Stripped = ipV6Stripped.substring(7,ipV6Stripped.length+1)
  }
  request("https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.reCAPTCHA_secret
      + "&response=" + req.body['g-recaptcha-response']
      + "&remoteip=" + ipV6Stripped,function(error,response,body) {
    let parsedBody = JSON.parse(body);
    let returned = false;
    if(process.env.ENVIRONMENT_SPEC !== "dev" && parsedBody.success !== undefined && !parsedBody.success) {
      res.status(401);
      res.locals.error = { "status" : 401}
      res.locals.ip = ipV6Stripped
      res.render('error',getOpts())
      returned = true
    }
    if(req.body.browser === undefined){
      res.status(401);
      res.locals.error = { "status" : 401}
      res.locals.ip = ipV6Stripped
      res.render('contactBotFail',getOpts())
      returned = true;
    }
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure:false,
      requireTLS:true,
      auth: {
        user: process.env.FORM_EMAIL,
        pass: process.env.FORM_PASSWORD
      }
    });
    let mailOptions = {
      from: 'contact.form@mxmbrook.co.uk',
      to: 'mdr.brook@gmail.com',
      subject: "Mxmbrook.co.uk Contact Form Response",
      text: "IP Address: " + ipV6Stripped + " | " + req.body.browser+"\n\n"+req.body.message
    };
    if(returned){
      mailOptions.to = "mdr.brook+failedmessage@gmail.com"
      mailOptions.subject = "Mxmbrook.co.uk Contact Form Failed Response"
    }

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      }
      if(!returned) {
        res.render('contactSent', opts);
      }
    });

  });
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

router.get('/master', function(req, res, next) {
  if(req.socket.remoteAddress === "::1"){
    let opts = getOpts();
    opts["tools"] = []
    fs.readdir("views/tools/", (err, files) => {
      if (err) {
        throw err;
      }
      files.forEach(file => {
        opts["tools"].push(file);
      });
      res.render('master', opts);
    });
  }else{
    res.status(403);
    res.locals.error = { "status" : 403}
    res.locals.ip = req.socket.localAddress
    res.render('error',getOpts())
  }
});

//redirects

router.get('/twitter', function(req, res, next) {
  let opts = getOpts();
  res.redirect(303, 'https://twitter.com/mxmbrook');
});
router.get('/linkedin', function(req, res, next) {
  let opts = getOpts();
  res.redirect(303,'https://www.linkedin.com/in/marcy-brook-9a410017a/',);
});
router.get('/github', function(req, res, next) {
  let opts = getOpts();
  res.redirect(303,'https://github.com/SpruceMarcy');
});
router.get('/tools/uwu', function(req, res) {
  res.redirect(301, '/shenanigans/uwu');
});


module.exports = router;
