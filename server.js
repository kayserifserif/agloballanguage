const express = require('express');
const app = express();
const parser = require('body-parser');
const router = express.Router();

var port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(parser.urlencoded({extended: true}));
app.set('view engine', 'pug');

var index = require('./routes/index.js');
app.use('/', index);

app.listen(port, function() {
  console.log('App listening on port ' + port + '!');
})