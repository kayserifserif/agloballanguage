const express = require('express');
const app = express();
const parser = require('body-parser');

var port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(parser.urlencoded({extended: true}));
app.set('view engine', 'pug');

var index = require('./routes/index.js');
app.use('/', index);
var word = require('./routes/word.js');
app.use('/word', word);
var router = express.Router();

app.listen(port, function() {
  console.log('App listening on port ' + port + '!');
})