$(document).ready(function() {

	var getInfo = function() {
		var entry = $(".box").val();
		console.log(entry);
		if(entry == "") {
			// $(".info").prepend("<p class='loading'>Please enter a word.</p>")
		} else {
			$.ajax({
				type: "GET",
				url: "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + entry + "?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1",
				crossDomain: true,
				datatype: "xml"
			});
		}
	}

	$(".search-btn").click(getInfo());
	$(".box").keyup(function(event) {
		if(event.keyCode == 13) {
			getInfo();
		}
	});
});

