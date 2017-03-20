var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/config');

var index = require('./routes/index');
var user = require('./routes/user');
var city = require('./routes/city');
var attraction = require('./routes/attraction');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

var options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
};

mongoose.Promise = require('q').Promise;
mongoose.connect(config.MONGODB_URI, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


if(process.env.NODE_ENV  !== 'test') {
  app.use(logger('combined'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var handleCorsHeaders = function (req, res, next) {
    if (req.get("Origin") != null)
    {
        res.header('Access-Control-Allow-Origin', req.get('Origin'));
        res.header('Access-Control-Allow-Credentials', 'true');
        if (req.get('Access-Control-Request-Method')) {
            res.header('Access-Control-Allow-Methods', req.get('Access-Control-Request-Method'));
        }
        if (req.get('Access-Control-Request-Headers')) {
            res.header('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers'));
        }
        if (req.method === 'OPTIONS') {
            res.status(200).send();
        } else {
            next()
        }
    } else {
        next()
    }
};


app.use(handleCorsHeaders);



app.use('/', index);
app.use('/user', user);

app.route("/city")
    .get(city.getCities)
    .post(city.postCity);
app.route("/city/:id")
    .get(city.getCity)
    .delete(city.deleteCity)
    .put(city.updateCity);

app.route("/attraction")
    .post(attraction.postAttraction);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
