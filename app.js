var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var braintree = require('braintree');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/apple', function (req, res) {
  const body = req.body.Body
  res.set('Content-Type', 'text/plain')
  //res.send(`You sent: ${body} to Express`)

  var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: "9rbqdc36wh9ghr4v",
    publicKey: "vchdm396cfmypq7t",
    privateKey: "bf5c3651908ff8b1930b68d8ae314524",
  });

  gateway.transaction.sale({
    amount: "0.10",
    paymentMethodNonce: body,
    options: {
      submitForSettlement: true
    },
    billing: {
      postalCode: "KW172RY"
    }
  }).then(result => {
    if (result.success) {
      res.send("Transaction ID: " + result.transaction.id);
    } else {+
      res.send('transaction failure: ' + result.message);
    }
   }).catch(function (err) {
    res.send(err);
  });

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
