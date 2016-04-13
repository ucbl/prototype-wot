/**
 * Created by jordan on 26/01/2016
 */

'use strict';

const Avatar = require('./model/Avatar'),
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    global = require('./helper/global'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

const DELAY_STARTUP = 3000;

/**
 ********
 * TODO *
 ********
 * Rajouter dans : https://github.com/ucbl/prototype-wot/blob/hydra-vocabs-updated/data/ontology/hydra.jsonld
 *
 * (LocalFunctionality, CollborativeFunctionality} hérite de Functionality
 *
 * Data Type Property (pour Functionality)
 * - hasInvokationUri: URI
 * - hasNegotiationUri: URI
 *
 * Data Type Property (pour CollborativeFunctionality)
 * - hasCollaborators: Collection<URI>
 * - isMaster: Boolean
 *
 * class:
 * - Collaborators (Contains id of the instance functionaltiies and the URI)
 *
 * ==============================================================================================================================
 * Utiliser le CapabilityManager pour gérer les capacités
 */

let avatars = [];
let avatars_serialized = [];
let directories = {
    functionality: []
};

module.exports = {
    run: function () {

        //
        // ==================
        //    Infra mockup
        // ==================
        //
        // Directories + directories + web visualize
        //

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));

        // Start the server
        server.listen('9898', () => {
            console.log('Fake server listening on port ' + 9898)
        });

        //if (global.config.debug) {
        //    app.use((req, res, next) => {
        //        console.log(`[INFRA] <= ${req.method} ${req.path}`);
        //        console.dir(req.body);
        //        console.log();
        //        next();
        //    });
        //}

        //
        // Web interface
        //
        app.get('/', (req, res) => res.redirect('/visualizer'));
        app.use('/visualizer', express.static(__dirname + '/storage/www'));

        let clients = [];
        io.on('connection', function (socket) {

            socket.on('connect_object', (data) => connect(data));

            socket.emit('functionalities_updated', directories.functionality);
            socket.emit('avatars_updated', avatars_serialized);
        });


        app.get('/directory/functionality', (req, res) => {
            res.json({functionalities: directories.functionality});
        });

        app.post('/directory/functionality', (req, res) => {

            let funcs = req.body.functionalities || [];
            // Add the functionalties to the directory
            for (let f of funcs) {
                directories.functionality.push(f);
            }
            res.end();

            // Notify each avatars that functionalties are
            // available exept the sender
            if (funcs.length > 0) {
                for (let a of avatars) {
                    if(req.body.avatar_uri == a.avatar_uri) continue;
                    a.functionalityBoundOnDirectory();
                }
            }

            io.emit('functionalities_updated', directories.functionality);
        });

        app.get('/repository/context', (req, res) => {
            res.end();
        });

        /**
         * Retourne la liste des ontology des fonctionnalités
         */
        app.get('/repository/functionality', (req, res) => {
            fs.readFile(`${__dirname}/storage/functionalities.jsonld`, (err, data) => {
                res.end(data);
            });
        });

        app.get('/repository/capability', (req, res) => {
            res.end();
        });

        app.get('/repository/appliance', (req, res) => {
            res.end();
        });

        app.get('/cima', (req, res) => {
            res.end();
        });


        let register_avatar = (avatar) => {
            avatars.push(avatar);
            avatars_serialized.push(avatar.toJson());
            io.emit('avatars_updated', avatars_serialized);
        };

        //connect('motor');
        //connect('temp-sensor');

        /**
         * Simule object connection
         * @param id
         */
        function connect(id) {

            switch (id) {
                case 'phone':
                    register_avatar(Avatar.buildAvatar(require('./storage/cima-response1').capabilities, {
                        name: 'Mobile Phone',
                        http_port: 5001
                    }));
                    break;

                case 'motor':
                    register_avatar(Avatar.buildAvatar(require('./storage/cima-response2').capabilities, {
                        name: 'Window motor',
                        http_port: 5002
                    }));
                    break;

                case 'temp-sensor':
                    register_avatar(Avatar.buildAvatar(require('./storage/cima-response3').capabilities, {
                        name: 'Temperature sensor',
                        http_port: 5003
                    }));
            }
        }
    }
};