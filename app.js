var createError = require('http-errors');
var subdomain = require('express-subdomain');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var toolsRouter = require('./routes/tools');
var shenanigansRouter = require('./routes/shenanigans')
var projectsRouter = require('./routes/projects')
var kcaqo = require('./routes/kcaqo')

var app = express();
var defaultRouter = express.Router();


// view engine setup
app.engine('ejs', require('ejs-mate'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
if(process.env.ENVIRONMENT_SPEC -= "prod") {
  app.set('subdomain offset',3)
} else {
  app.set('subdomain offset',1)
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


kcaqo.get('*', function(req, res, next) {
  if(req.url.startsWith('/fonts')) {
    next()
  } else if(req.url.startsWith('/images')) {
    next()
  } else {
    next(createError(404));
  }
})

defaultRouter.use('/', indexRouter);
defaultRouter.use('/tools', toolsRouter);
defaultRouter.use('/shenanigans', shenanigansRouter);
defaultRouter.use('/shenans', shenanigansRouter);
defaultRouter.use('/nans',shenanigansRouter)
defaultRouter.use('/projects',projectsRouter)


app.use(subdomain("KeepCalmAndQueerOn",kcaqo))

app.use(subdomain("keepcalmandqueeron",kcaqo))
app.use(defaultRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
defaultRouter.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',getOpts());
});

module.exports = app;

// layout parameters! - custom
global.getOpts = function(){
  let opts = {};
  opts["seasonal_text"]="";
  opts["seasonal_style"]=false;
  opts["page_title"]=false;
  opts["page_description"]=false;
  opts["include_recaptcha"]=false;
  return opts;
}