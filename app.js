const createError = require('http-errors');
const express = require('express');
const session = require("express-session");
const path = require('path');
const logger = require('morgan');
const passport = require('./authentication.js')
const MemoryStore = require('memorystore')(session)

require('dotenv').config()
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URL;

const app = express();
const indexRouter = require('./routes/index')

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

// view engine setup
app.set('views', './views/');
app.set('view engine', 'ejs');
app.set('env', 'development');
app.use(session({ 
  secret: "cats", 
  resave: false, 
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }), 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  req.app.get('env') === 'development' ? res.send(`<pre>${err.stack}</pre>`) : res.send('Error!');
});

app.listen(process.env.port || 3000, ()=> console.log(`Server listening at http://localhost:${process.env.port}`))


module.exports = app;
