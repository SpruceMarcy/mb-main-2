let express = require('express');
let router = express.Router();

let latestIssue = '4'

router.get('/', function(req, res, next) {
  res.redirect(303, '/issue/'+latestIssue);
});
router.get('/issue/:issue/?', function(req, res, next) {
  let issueNo = Number(req.params.issue)
  if (!issueNo || issueNo < 1 || issueNo > latestIssue){
    res.redirect(303, '/issue/'+latestIssue);
  }
  res.render('kcaqo/show', {'issue':req.params.issue});
});
module.exports = router;
