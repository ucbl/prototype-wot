//TODO: access this through global config
var interoperabilityLayerUrl = '/interoperability';

$(document).ready(function() {
	reloadObjects();
	setInterval(function(){
		reloadObjects();
	}, 5000);
});

function reloadObjects() {
	$.get(interoperabilityLayerUrl, {'dataType': 'json'}, function(response){
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