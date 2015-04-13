var urlCimaObjects = 'http://localhost:3333/cima-list';
var urlAvatarsHtml = 'http://localhost:3000/avatars-html';
var urlAvatars = 'http://localhost:3000/avatars';

$(document).ready(function() {

	reloadObjects();

	reloadAvatars();
	reloadAvatarsInterval = setInterval(function(){
			reloadAvatars();
		}, 20000);

});

function activateAjax() {

	// Create the avatars
	$('.objectActivate').click(function(evt) {
		var self = $(this);
		evt.stopImmediatePropagation();
		evt.preventDefault();
		var idAvatarRel = self.attr('rel');
		$.ajax({
			url: urlAvatars,
			type: 'PUT',
			data: {idAvatar: idAvatarRel},
			success: function(response) {
				if (response.created) {
					self.removeClass('objectActivate');
				}
				reloadAvatars();
			}
		});
	});

	// Show the info in a modal window
	$('.avatarId').click(function(){
		var url = $(this).attr('rel');
		openModal(url);
	});
	$('.functionalityDocumentation').click(function(){
		var url = $(this).parents('.functionality').attr('rel');
		openModal(url);
	});

	// Execute an action
	$('.functionalityExecute').click(function(evt){
		var self = $(this);
		evt.stopImmediatePropagation();
		evt.preventDefault();
		var urlExecution = self.attr('rel');
		$.ajax({url: urlExecution,
				type: 'GET',
				success: function(response) {
					if (response) {
						for (i in response) {
							// In case that we just have to recover a state
							var urlExecutionFunctionality = response[i].urlExecution;
							console.log(response[i]);
							if (response[i].method == 'GET') {
								console.log(urlExecutionFunctionality);
								$.ajax({url: urlExecutionFunctionality,
										type: 'PUT',
										data: {method: 'GET'},
										success: function(responseIns) {
											openModalJSON(responseIns);
										}
									});
							}
							// In case that we have to change a state
							if (response[i].method == 'PUT') {
								var optionsData = {method: 'PUT'};
								for (j in response[i].supportedProperty) {
									optionsData[response[i].supportedProperty[j].id] = prompt(response[i].supportedProperty[j].label);
								}
								$.ajax({url: urlExecutionFunctionality,
										type: 'PUT',
										data: optionsData,
										success: function(responseIns) {
											openModalJSON(responseIns);
										}
									});
							}
						}
					} else {
						console.log('There was an error executing the functionality');	
					}
				}
			});
	});
	/*
	$('.functionalityExecute').click(function(evt){
		var self = $(this);
		evt.stopImmediatePropagation();
		evt.preventDefault();
		var urlExecution = self.attr('rel');
		$.ajax({
			url: urlExecution,
			type: 'PUT',
			data: {method: "PUT",
					value: "333555"
					},
			success: function(response) {
				console.log(response);
			}
		});
	});
	*/
}

function reloadObjects() {
	$.get(urlCimaObjects, {}, function(response){
		$('.objectsFromCima').html(response);
		activateAjax();
	});	
}

function reloadAvatars() {
	$.get(urlAvatarsHtml, {}, function(response){
		$('.avatars').html(response);
		activateAjax();
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

var modalPreScroll = 0;
function openModal(url, classWindow) {
	classWindow = (classWindow==undefined) ? 'modalWindow' : classWindow;
	$('#bodyFrame').css('overflow', 'hidden');
	modalPreScroll = $(window).scrollTop();
	window.scrollTo(0, 0);
	var modalBg = jQuery('<div/>', {class: 'modalBackground',
									style: 'background:#000; width:100%; height:100%; left:0; position:fixed; top:0; z-index:99998; cursor:pointer;'
									});
	var modalWindow = jQuery('<div/>', {class: classWindow,
										style: 'position:absolute; z-index:99999;'
										});
	var modalClose = jQuery('<div/>', {class: 'modalClose'});
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	modalBg.css('opacity', 0.9);
	modalBg.click(function(){
		closeModal();
	});
	modalClose.click(function(){
		closeModal();
	});
	modalBg.appendTo($('#bodyFrame'));
	modalWindow.appendTo($('#bodyFrame'));
	$.ajax(url)
		.done(function(response) {
			modalWindow.html('<div id="codeJson"></div>');
			$("#codeJson").jJsonViewer(response);

			modalClose.appendTo(modalWindow);
			modalWindow.css('left', (windowWidth - modalWindow.width()) / 2);
			if (modalWindow.height() < windowHeight) {
				modalWindow.css('top', (windowHeight - modalWindow.height()) / 2);
			} else {
				modalWindow.css('top', 30);
				$('#bodyFrame').css('overflow', 'auto');
			}
			activateAjax();
		});
}
function openModalJSON(json, classWindow) {
	classWindow = (classWindow==undefined) ? 'modalWindow' : classWindow;
	$('#bodyFrame').css('overflow', 'hidden');
	modalPreScroll = $(window).scrollTop();
	window.scrollTo(0, 0);
	var modalBg = jQuery('<div/>', {class: 'modalBackground',
									style: 'background:#000; width:100%; height:100%; left:0; position:fixed; top:0; z-index:99998; cursor:pointer;'
									});
	var modalWindow = jQuery('<div/>', {class: classWindow,
										style: 'position:absolute; z-index:99999;'
										});
	var modalClose = jQuery('<div/>', {class: 'modalClose'});
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	modalBg.css('opacity', 0.9);
	modalBg.click(function(){
		closeModal();
	});
	modalClose.click(function(){
		closeModal();
	});
	modalBg.appendTo($('#bodyFrame'));
	modalWindow.appendTo($('#bodyFrame'));

	modalWindow.html('<div id="codeJson"></div>');
	$("#codeJson").jJsonViewer(json);
	modalClose.appendTo(modalWindow);
	modalWindow.css('left', (windowWidth - modalWindow.width()) / 2);
	if (modalWindow.height() < windowHeight) {
		modalWindow.css('top', (windowHeight - modalWindow.height()) / 2);
	} else {
		modalWindow.css('top', 30);
		$('#bodyFrame').css('overflow', 'auto');
	}
}
function closeModal() {
	$('.modalBackground').remove();
	$('.modalWindow').remove();
	$('.modalWindowBig').remove();
	$('#bodyFrame').css('overflow', 'auto');
	window.scrollTo(0, modalPreScroll);
}

JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};