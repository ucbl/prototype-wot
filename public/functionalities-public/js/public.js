var urlCimaObjects = 'http://localhost:3333/cima-list';
var urlAvatarsHtml = 'http://localhost:3000/avatars-html';
var urlAvatars = 'http://localhost:3000/avatars';

$(document).ready(function() {

	reloadObjects();

	reloadAvatars();
	reloadAvatarsInterval = setInterval(function(){
			reloadAvatars();
		}, 2000);

});

function activateAjax() {

	// Create the avatars
	$('.objectActivate').click(function(evt) {
		var self = $(this);
		evt.stopImmediatePropagation();
		evt.preventDefault();
		var idAvatarRel = self.attr('rel');
		if (self.hasClass('objectActivateDelete')) {
			self.removeClass('objectActivateDelete');
			$.ajax({
				url: urlAvatars,
				type: 'DELETE',
				data: {urlCima: idAvatarRel}
			});
			reloadAvatars();
		} else {
			$.ajax({
				url: urlAvatars,
				type: 'PUT',
				data: {urlCima: idAvatarRel},
				success: function(response) {
					if (response!=null) {
						self.addClass('objectActivateDelete');
					}
					reloadAvatars();
				}
			});			
		}
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
		var url = $(this).parents('.functionality').attr('rel');
		var urlExecution = self.attr('rel');
		$.ajax({url: urlExecution,
				type: 'GET',
				success: function(response) {
					if (response.supportedOperation[0]) {
						switch (response.supportedOperation[0].method) {
							case 'GET':
								openModalJSON(response);
							break;
							case 'POST':
							case 'PUT':
								var arguments = response.supportedOperation[0].expects.supportedProperty;
								if (arguments && arguments.length>0) {
									var htmlForm = '';
									for (i in arguments) {
										if (arguments[i].property['@type']!='vocab:Functionality') {
											htmlForm += '<div class="argument">'
															+ '<label><strong>' + arguments[i].property.label + '</strong> ' + arguments[i].property.description + '</label>'
															+ '<input type="text" name="'+ arguments[i].property.label +'" size="30"/>'
														+ '</div>';
										}
									}
									var htmlContent = '';
									htmlContent += "<div class=\"messageTitle\">Please fill the values needed to execute this functionality</div>";
									htmlContent += "<form action=\"" + urlExecution + "\" method=\"" + response.supportedOperation[0].method + "\" class=\"formExecute\">";
									htmlContent += htmlForm;
									htmlContent += "<input type=\"submit\" class=\"formSubmit\" value=\"Execute\"/>";
									htmlContent += "</form>";
									openModalHtml(htmlContent);
									activateAjaxFormExecute();
								}
							break;
						}
					}
				}
			});
	});
}

function activateAjaxFormExecute() {
	
	// Code option (diable other arguments)
	$('.codeOption input:radio[name=idCode]').click(function() {
		$('.codeOption input:text').attr('disabled', true);
		$(this).parents('.codeOption').find('input:text').attr('disabled', false);
	});

	// Form to execute complex functions
	$('.formExecute').submit(function(){
		var form = $(this);
		$.ajax({url: form.attr('action'),
						type: form.attr('method'),
						data: form.serialize(),
						success: function(response) {
							closeModal();
							openModalJSON(response);
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
		//Activate buttons
		$('.objectName').removeClass('objectActivateDelete');
		$('.objectName').each(function(index, ele){
			var idObjectArray = $(ele).attr('rel').split('/');
			var idObject = idObjectArray[idObjectArray.length - 1];
			$('.avatarId').each(function(indexIns, eleIns){
				var idAvatarArray = $(eleIns).attr('rel').split('/');
				var idAvatar = idAvatarArray[idAvatarArray.length - 1];
				if (idObject == idAvatar) {
					$(ele).addClass('objectActivateDelete');
				}
			});
		});
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