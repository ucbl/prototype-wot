//TODO: access this through global config
var knownDevicesUrl = '/interoperability/devices',
    connectedDevicesUrl = '/interoperability/connected-devices';

$(document).ready(function() {
        reloadKnownDevices();
        setInterval(function () {
            reloadConnectedDevices();
        }, 5000);

//Convenience function to test capability invocation with a JSON body in the request and a PUT method
//Can be modified and re-sent using FF console...
/*
        $("h1").click(function () {
            $.ajax({
                "url": "/interoperability/devices/phone-samsung-2554/call",
                "method": "PUT",
                "contentType": "application/json",
                "data": JSON.stringify({"number": "12"})
            });
        });
*/
    }
);


function reloadKnownDevices() {
    $.get(knownDevicesUrl, {}, function(response){
        $('.knownDevices').html($(response).find('.device').each(function(i, elt) {
            $(this).append("<div class='deviceButton'><button onclick='connect(\"" + $(elt).find('div[rel]').attr('rel') + "\");'>Connect</button></div>");
        }));
        equalHeights('.device');
    });
}

function reloadConnectedDevices() {
    $.get(connectedDevicesUrl, {}, function(response){
        $('.connectedDevices').html($(response).find('.device').each(function(i, elt) {
            $(this).append("<button class='deviceButton' onclick='disconnect(\"" + $(elt).find('div[rel]').attr('rel') + "\");'>Disconnect</button>");
        }));
        equalHeights('.device');
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

function connect(deviceUri) {
    $.ajax({
        "url": deviceUri,
        "method": "PUT",
        "success": function() {
            $(".knownDevices").find("div.device:has(div[rel='"+ deviceUri + "'])").hide();
        }
    });
}

function disconnect(deviceUri) {
        $.ajax({
            "url": deviceUri,
            "method": "DELETE",
            "success": function() {
                $(".knownDevices").find("div.device:has(div[rel='"+ deviceUri + "'])").show();
            }

        });
}