var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  var user = {
    name: "Jorge Usuario",
    age: "35",
    mail: "jorge.usuario@mail.com"
  };

  res.json(user);

});

module.exports = router;
