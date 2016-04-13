$(function () {
    'use strict';

    var $funcs = $('#available-functionalities');
    var $avatars = $('#avatars');

    var socket = io(location.origin);


    $('.connect-btn').click(function () {
        socket.emit('connect_object', $(this).attr('id'));
        $(this).attr('disabled', true);
    });

    socket.on('functionalities_updated', function (data) {
        console.log(data);

        let no_content = '<div class="no-content">No functionality available</div>';
        let html = '';
        for (let o of data) {
            let name = o.id.match(/\/([^\/]*)$/)[1] || o.id;

            html += `
            <li class="box ${o.collaborative === 'true' ? 'f-collaborative' : ''}">
                ${name}
                <span class="details">
                    <span class="id"><b>Ontology</b>: ${o.id}</span>
                    <span class="uri"><b>URI</b>: ${o.uri}</span>
                </span>
            </li>
            `;
        }
        $funcs.html(html || no_content);
    });

    socket.on('avatars_updated', function (data) {
        console.log(data);

        let no_content = '<div class="no-content">No avatar connected</div>';
        let html = '';
        for (let o of data) {
            html += `
            <li class="box">
                ${o.name}
                <span class="details">
                    <span class="uri"><b>URI</b>: ${o.uri}</span>
                    <span class="capability"> <b>Capabilities:</b>`;
                    for(let c of o.capabilities) {
                        html += `<span>${c.ontology}</span>`;
                    }
            html += `</span>
                </span>
            </li>`;
        }
        $avatars.html(html || no_content);
    });
});