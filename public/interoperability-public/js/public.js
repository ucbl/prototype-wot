//TODO: access this through global config
var interoperabilityLayerUrl = '/interoperability/devices';

$(document).ready(function() {
        reloadDevices();
        setInterval(function () {
            reloadDevices();
        }, 5000);
        $("body").click(function () {
            $.ajax({
                "url": "/interoperability/devices/phone-samsung-2554/call",
                "method": "POST",
                "contentType": "application/json",
                "data": JSON.stringify({"number": "12"})
            });
        });
    }
);


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