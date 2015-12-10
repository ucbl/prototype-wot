//TODO: access this through global config
var knownDevicesUrl = '/interoperability/devices',
    connectedDevicesUrl = '/interoperability/connected-devices';

$(document).ready(function() {
        //Load known devices
        reloadKnownDevices();
        //Periodically reload connected devices
        setInterval(function () {
            reloadConnectedDevices();
        }, 5000);

//Convenience function to test capability invocation with a JSON body in the request and a PUT method
//Can be modified and re-sent using FF console...
        $("h1").click(function () {
 /*
            $.ajax({
                "url": "/interoperability/devices/phone-samsung-2554/call",
                "method": "PUT",
                "contentType": "application/json",
                "data": JSON.stringify({"number": "12"})
            });
*/
            window.location = "#openModal";
        });
    }
);


function reloadKnownDevices() {
    $.get(knownDevicesUrl, {}, function(response){
        $('.knownDevices').html($(response).find('.device').each(function() {
            $(this).append("<div class='deviceButton'><button onclick='connect(\"" + $(this).attr('rel') + "\");'>Connect</button></div>");
        }));
        equalHeights('.device');
    });
}

function reloadConnectedDevices() {
    $.get(connectedDevicesUrl, {}, function(response){
        $('.connectedDevices').html($(response).find('.device').each(function() {
            $(this).append("<button class='deviceButton' onclick='disconnect(\"" + $(this).attr('rel') + "\");'>Disconnect</button>");
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
            $(".knownDevices").find("div.device[rel='"+ deviceUri + "']").hide();
        }
    });
}

function disconnect(deviceUri) {
    $.ajax({
        "url": deviceUri,
        "method": "DELETE",
        "success": function() {
            $(".knownDevices").find("div.device[rel='"+ deviceUri + "']").show();
        }
    });
}

function loadDevice(deviceUri) {
    $.get(deviceUri, null, function(data) {
            $("#modalContent").append(data);
            window.location = "#openModal";
        }
    );
}