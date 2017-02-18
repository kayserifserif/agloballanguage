var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
var xml2js = require('xml2js');
// var jsdom = require('jsdom');

app.use(express.static(__dirname + '/public'));

// app.use(function(req, res, next) {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
// 	next();
// });

var url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/sesquipedalian?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1"
var parseString = xml2js.parseString;
xmlToJson(url);

function xmlToJson(url, callback) {
	var req = http.get(url, function(res) {
		var xml = '';

		res.on('data', function(chunk) {
			xml += chunk;
		});

		res.on('error', function(e) {
			// callback
			console.log(e, null);
		}); 

		res.on('timeout', function(e) {
			// callback
			console.log(e, null);
		}); 

		res.on('end', function() {
			parseString(xml, function(err, result) {
				// callback(null, result);
				// console.log(null, result);
				// console.log(result);
				var entry = result.entry_list.entry[0]
				var word = entry.ew[0];
				var definition = entry.def[0].dt;
				console.log(JSON.stringify(word, null, 2));
				console.log(JSON.stringify(definition, null, 2));
			});
		});
	});
}

//

app.listen(3000, function() {
	console.log('Listening on port 3000!');
});