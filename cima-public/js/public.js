var urlCimaObjects = 'http://localhost:3333/cima';

$(document).ready(function() {

	reloadObjects();
	reloadObjectsInterval = setInterval(function(){
			reloadObjects();
		}, 5000);

});

function reloadObjects() {
	$.get(urlCimaObjects, {}, function(response){
		$('.objectsFromCima').html(response);
		equalHeights('.objectIns');
	});	
}

function equalHeights(className) {
	var maxHeight = 0;
	$(className).css('min-height', 'auto');
	$(className).each(function(index, ele) {
		maxHeight = ($(ele).height() > maxHeight) ? $(ele).height() : maxHeight;
	});
	$(className).css('min-height', maxHeight);
}