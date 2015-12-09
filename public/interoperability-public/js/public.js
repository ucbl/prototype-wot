//TODO: access this through global config
var interoperabilityLayerUrl = '/interoperability/devices';

$(document).ready(function() {
	reloadDevices();
	setInterval(function(){
		reloadDevices();
	}, 5000);
});

function reloadDevices() {
	$.get(interoperabilityLayerUrl, {}, function(response){
        $('.knownDevices').html($(response).find('.device'));
		equalHeights('.object');
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