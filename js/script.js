var audio = new Audio();

$(document).ready(function(){
	init();
});

function init() {

	$(window).on('resize', function(){
		breedtePanels();
		openSluitenPanel(null);
	});

	$("body").on("click", ".toggle-panel", function() {
		openSluitenPanel($(this).parent());
	});

	breedtePanels();

	$("body").on("click", ".big-play", function(){
		
		$(this).toggleClass('fa-pause');
		$(this).toggleClass('fa-play');

		if (audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	});

	$("#zoekArtist, #resultaatArtisten").focus(function () {
		$(".option-list").velocity({
			height: "200px"
		}, 1500);
	});

	//zoeken artist
	$("#zoekArtist").keyup(function() {

		var q = $("#zoekArtist").val();
		$("#resultaatArtisten").html("");

		if (q !== "") {
			zoeken(q);
		}
	});

	$("body").on("click", ".draw-en-info", function() {
		$("#resultaatArtisten").velocity({
			height: "0"
		}, 1500);
	});

	//click op custom combo box
	$("body").on("click", ".option-item", function() {

		$(".option-list").velocity({
			height: "0"
		}, 1500);

		var id = $(this).find('input[type="hidden"]').val();

		geefArtist(id).done(function(result) {
			$("#draw-area").empty().append('<div class="boom-rij" data-rij="1"></div>');
			vulNodesAan(result, 1, $('div[data-rij="1"]'));
			populaireNummers(result.id);

		}).fail(function() {
			console.log("Er is een fout opgetreden");
		});		
	});

	//click op artist node van boom
	$('body').on("click", ".artist-node", function() {
		var id = $(this).find("input").val();
		var rijnr = $(this).parent().data("rij");

		geefRelevanteArtisten(id, rijnr);
		populaireNummers(id);
		fadeAndere(this);
	});

	//preview-lied
	$('body').on("click", ".preview-lied", function() {

		if(!$(".artist-info").hasClass("open")) {
  			$(".artist-info").addClass("open");
 		}

 		isSongLast($(this));
 		isSongFirst($(this));

		audio.src =  $(this).data('href');
        audio.pause();
        audio.play();

        $(".big-play").addClass("fa-pause");
        $(".big-play").removeClass("fa-play");

        $(".top-nummers").find('span').remove();
        $(this).html('<span class="fa fa-play spelend"></span>' + $(this).html());
	});

	$('body').on("click", ".next-song", function(){

		if ($(this).css("opacity") !=  "0.5") {
			var playing = $(".preview-lied:has(span)");
			var next = playing.next();

			isSongLast(next);
			isSongFirst(next);

	        next.html('<span class="fa fa-play spelend"></span>' + next.html());
	        playing.find("span").remove();

	        audio.src =  next.data('href');
	        audio.pause();
	        audio.play();
    	}
	});

	$('body').on("click", ".previous-song", function(){
		if ($(this).css("opacity") !=  "0.5") {
			var playing = $(".preview-lied:has(span)");
			var previous = playing.prev();

			isSongFirst(previous);
			isSongLast(previous);

	        previous.html('<span class="fa fa-play spelend"></span>' + previous.html());
	        playing.find("span").remove();

	        audio.src =  previous.data('href');
	        audio.pause();
	        audio.play();
    	}
	});
}

function isSongLast(next) {

	if (next.html() == $(".top-nummers li:last-child").html()){
		$(".next-song").css("opacity", "0.5");
		return true;
	}

	$(".next-song").css("opacity", "1");
	return false;
}

function isSongFirst(previous) {

	if (previous.html() == $(".top-nummers li:first-child").html()){
		$(".previous-song").css("opacity", "0.5");
		return true;
	}

	$(".previous-song").css("opacity", "1");
	return false;
}

function zoeken(q) {

	$.ajax({
		url: "https://api.spotify.com/v1/search?q=" + q + "&type=artist",
		Accept: "application/json",
        type: "GET",
		success: function(data) {
			var aantal = data.artists.items.length;
			
			for (var i = 0; i < aantal; i++) {

				var image = geefImage(data.artists.items[i].images);
				
				$("#resultaatArtisten").append('<div class="option-item"><input type="hidden" value="' + data.artists.items[i].id + '"/><div class="artist-foto-container"><img src="' + image.url + '" style="' + image.style + '" class="artist-foto" alt="Foto van ' + data.artists.items[i].name + '"/></div><p>' + data.artists.items[i].name + '</p></div>');
			}
		},
		error: function() {
			$("#resultaatArtisten").html("<p>Er is een fout opgetreden tijdens de aanvraag. Probeer later opnieuw.</p>");
		}
	});
}

function telImages(imagesLijst) {
	return imagesLijst.length;
}

function geefImage(imagesLijst) {

	//var imgLst = data.artists.items[i].images;
	//var imgsrc = geefImage(imgLst);
	var aantalimgs = imagesLijst.length;

	if (aantalimgs !== 0) {

		var img = imagesLijst[aantalimgs - 1].url;

		return {
			url: img, 
			style: geetStyle(img)
		}
	}

	return {
		url: "assets/images/anomiem.png",
		style: "width: 50px"
	}
}

function geetStyle(image) {
	if (image.height >= image.width) {
		return "width: 50px";
	}
	return "height: 50px";
}

function vulNodesAan(data, rijnr, rij) {

	var imgData = geefImage(data.images);

	if(rij != 1) {
		$(rij).hide().append('<div class="artist-node"><input type="hidden" value="' + data.id + '"/><div class="artist-foto-container" style="border: solid 3px black;"><img style="' + imgData.style + '" src="' + imgData.url + '" alt="" /></div><p>' + data.name + '</p></div>').fadeIn(500, function() {
			$('.artist-node').css('display', 'flex');
		});
	} else { 
		$(rij).hide().append('<div class="artist-node"><input type="hidden" value="' + data.id + '"/><div class="artist-foto-container"><img style="' + imgData.style + '" src="' + imgData.url + '" alt="" /></div><p>' + data.name + '</p></div>').fadeIn(500, function() {
			$('.artist-node').css('display', 'flex');
		});
	}
}

function populaireNummers(id) {

	$("#info-artisten-naam").html();

	geefArtist(id).done(function(data) {

		$(".titel").html(data.name);
	});

	geefPopulaireNummersAjax(id).done(function(data){
		var aantal = data.tracks.length;
		
		$(".top-nummers").empty();

        audio.src = data.tracks[0].preview_url;
        audio.pause();
        audio.play();

		for (var i = 0; i < aantal; i++) {

			if (i == 0) {	
				$(".top-nummers").append('<li class="preview-lied" data-href="' + data.tracks[i].preview_url + '"><span class="fa fa-play spelend"></span>' + data.tracks[i].name + "</li>");	
			}
			else {
				$(".top-nummers").append('<li class="preview-lied" data-href="' + data.tracks[i].preview_url + '">' + data.tracks[i].name + "</li>");	
			}
		}

		$(".previous-song").css("opacity", "0.5");

		if (aantal == 1) {
			$(".next-song").css("opacity", "0.5");
		}
		else {
			$(".next-song").css("opacity", "1");
		}

	}).fail(function() {
		$(".top-nummers").append('<li>Kan de populaire nummers niet opvragen.</li>');	
		$(".next-song").css("opacity", "0.5");
		$(".previous-song").css("opacity", "0.5");
		$(".big-play").css("opacity", "0.5");
	});
}

function geefRelevanteArtisten(id, rijnr) {

	geefRelevanteArtistenAjax(id).done(function(data) {
		var nieweRij = $('#draw-area>div[data-rij="' + (rijnr + 1) + '"]').length == 0;
		var rij;

		if (nieweRij) {
			$("#draw-area").append('<div class="boom-rij" data-rij="' + (rijnr + 1) + '" style="display:block;"></div>');
			rij = $('div[data-rij="' + (rijnr + 1) + '"]');
		}
		else {
			var lst = $('div[data-rij="' + (rijnr + 1) + '"]>.artist-node');
			lst.fadeOut(500, function(){
				$(this).remove();
			});

			rij = $('#draw-area>div[data-rij="' + (rijnr + 1) + '"]');
		}

		var aantal = $('div[data-rij]').length;

		for (var i = 0; i < aantal; i++) {

			var oudeRij = $('div[data-rij]').eq(i);

			if (oudeRij.data('rij') > rijnr + 1 && oudeRij.data('rij') != 1) {
				oudeRij.fadeOut(500, function(){
					$(this).remove();
				});
			}
		}

		for (var i = 0; i < 10; i++) {
			vulNodesAan(data.artists[i], rijnr + 1, rij)
		}

		var leftPos = $('#draw-area').scrollLeft();
  		$("#draw-area").animate({
  			scrollLeft: leftPos + 250
  		}, 800);
	});	
}

function geefArtist(id) {
	return $.ajax({
		url: "https://api.spotify.com/v1/artists/" + id,
		Accept: "application/json",
        type: "GET",
		success: function(data) {
			return data;
		}
	});
}

function geefRelevanteArtistenAjax(id) {
	return $.ajax({
		url: "https://api.spotify.com/v1/artists/" + id + "/related-artists",
		Accept: "application/json",
	    type: "GET",
		success: function(data) { }
	});
}

function fadeAndere(sender) {

	var ouder = $(sender).parent();
	var kinderen = $(ouder).find(".artist-node");
	var aantal = kinderen.length;

	for (var i = 0; i < aantal; i++) {

		if (kinderen.eq(i).find('input').val() != $(sender).find('input').val()) {
			kinderen.eq(i).fadeTo(250, 0.5);
			kinderen.eq(i).find(".artist-foto-container").css("border", "none");
		}
		else {
			kinderen.eq(i).fadeTo(250, 1);
			kinderen.eq(i).find(".artist-foto-container").css("border", "solid 3px black");
		}
	};
}

function geefPopulaireNummersAjax(id) {
	return $.ajax({
		url: "https://api.spotify.com/v1/artists/" + id + "/top-tracks?country=BE",
		Accept: "application/json",
        type: "GET",
		success: function(data) { }
	});
}

function breedtePanels(){
	$(".draw-area, .artist-info, .draw-en-info").css("height", parseInt($(window).height()) - parseInt($("fieldset").height()) + "px");

	$(".artist-info").css("width", parseInt($(window).width()) / 4 - 20 + "px");
	$(".artist-info").removeClass("open");
	$(".artist-info").css("left", "75%");

	if (parseInt($(window).width()) <= 660) {
		$(".core-info").css("opacity", "0");
	}
	else{
		$(".core-info").css("opacity", "1");
	}
}

function openSluitenPanel(sender){
	if (parseInt($(window).width()) <= 660) {
		$(sender).toggleClass("open");

		if($(".artist-info").hasClass("open")){

			$(sender).velocity({ 
				width: parseInt($(window).width()) / 100 * 90 - 20 + "px",
				left: "10%"
			}, {
				begin: function(){
					$(".core-info").velocity('fadeIn', {
						duration: 500
					});
				}
			}, 1500);
		}
		else {
			$(sender).velocity({
			    width: parseInt($(window).width()) / 4 - 20 + "px",
			    left: "75%"
			}, {
			    begin: function() {
					$(".core-info").velocity('fadeOut', {
						duration: 500
					});
				}
			}, 1500);
		}
	}
	else {
		if(!$(".artist-info").hasClass("open")) {
			$(sender).addClass("open");
		}

		$(".core-info").css("display", "block !important");
	}
}