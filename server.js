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

// force https
// https://jaketrent.com/post/https-redirect-node-heroku/
if (process.env.NODE_ENV === "production") {
  router.use((req, res, next) => {
    // if (req.header("x-forwarded-proto") !== "https") {
    //   res.redirect(`https://${req.header('host')}${req.url}`);
    // }
    // next();
    if (req.secure) {
      next();
    } else {
      res.redirect("https://" + req.headers.host + req.url);
    }
  });
} 

app.listen(port, function() {
  console.log('App listening on port ' + port + '!');
})