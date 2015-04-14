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
					if (response.mode=='simple' && response.operations) {
						var operations = response.operations;
						for (i in operations) {
							// In case that we just have to recover a state
							var urlExecutionFunctionality = operations[i].urlExecution;
							console.log(operations[i]);
							if (operations[i].method == 'GET') {
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
							if (operations[i].method == 'PUT') {
								var optionsData = {method: 'PUT'};
								for (j in operations[i].supportedProperty) {
									optionsData[operations[i].supportedProperty[j].id] = prompt(operations[i].supportedProperty[j].label);
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
					} else if (response.mode=='complex' && response.linkers) {
						var htmlContent = '';
						var htmlForm = '';
						htmlForm += "<input type=\"hidden\" name=\"idFunctionality\" value=\"" + response.idFunctionality + "\"/>";
						if (response.linkers.possible) {
							for (i in response.linkers.functionalities) {
								var functionalityId = response.linkers.functionalities[i].functionality;
								var avatars = response.linkers.functionalities[i].avatars;
								htmlForm += "<div class=\"messageCode messageCodeBlock\">";
								htmlForm += "<div class=\"messageCodeTitle\">Functionality <strong>" + functionalityId + "</strong></div>";
								if (avatars.length == 1) {
									htmlForm += "<div class=\"messageCodeChoice\">Avatar: <strong>" + avatars[0] + "</strong></div>";
									htmlForm += "<input type=\"hidden\" name=\"functionalities[" + functionalityId + "]\" value=\"" + avatars[0] + "\"/>";
								} else {
									for (j in avatars) {
										htmlForm += "<div class=\"messageCodeChoice\">";
										htmlForm += "<input type=\"radio\" checked=\"checked\" name=\"functionalities[" + functionalityId + "]\" value=\"" + avatars[j] + "\"/>";
										htmlForm += "<label>" + avatars[j] + "</label>";
										htmlForm += "</div>";
									}									
								}
								htmlForm += "</div>";
							}
							htmlContent += "<div class=\"messageTitle\">Please select the avatars to perform this functionality</div>";
							htmlContent += "<form action=\"http://localhost:3000/execute-complex-functionality/\" method=\"POST\" class=\"formExecute\">";
							htmlContent += htmlForm;
							htmlContent += "<input type=\"submit\" class=\"formSubmit\" value=\"Execute\"/>";
							htmlContent += "</form>";
						} else {
							htmlContent += "<div class=\"messageTitle messageTitleError\">There are not enough avatars that could perform this functionality</div>";
							for (i in response.linkers.functionalities) {
								if (response.linkers.functionalities[i].avatars.length == 0) {
									htmlContent += "<div class=\"messageCode\">Missing avatar for the <strong>" + response.linkers.functionalities[i].functionality + "</strong> functionality</div>";
								}
							}
						}
						openModalHtml(htmlContent);
						activateAjaxFormExecute();						
					} else {
						console.log('There was an error executing the functionality');	
					}
				}
			});
	});

}

function activateAjaxFormExecute() {
	console.log($('.formExecute'));
	// Form to execute complex functions
	$('.formExecute').submit(function(){
		//evt.stopInmediatePropagation();
		//evt.preventDefault();
		var form = $(this);
		$.ajax({url: form.attr('action'),
						type: 'POST',
						data: form.serialize(),
						success: function(response) {
							console.log(response);
						}
					});
		return false;
	});

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
function openModalHtml(htmlContent, classWindow) {
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

	modalWindow.html('<div id="htmlContent"></div>');
	$("#htmlContent").html(htmlContent);
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