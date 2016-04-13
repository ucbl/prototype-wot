/**
 * Created by jordan on 03/01/2016
 */

'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    global = require('./../helper/global'),
    Functionality = require('../model/Functionality'),
    request = require('request'),
    _ = require('underscore'),
    EventEmitter = require('events');

/**
 * This manager is used to expose the functionalities
 * of an Avatar
 */
module.exports = class extends EventEmitter {

    constructor(http_port) {
        super();

        this.avatar = null;
        this.ctxm = null;
        this.http_port = http_port;
    }

    /**
     * Initialisation of the manager
     *
     * @param ctxm
     * @param lfm
     * @param cfm
     */
    init(avatar, ctxm, lfm, cfm) {

        this.avatar = avatar;
        this.ctxm = ctxm;
        this.lfm = lfm;
        this.cfm = cfm;

        this.initHttpServer();

        // Listen for functionalities change event
        this.lfm.on('LOCAL_FUNC_UPDATED', () => this.handleChangeLFM());
        this.cfm.on('CALLABORATIVE_FUNC_UPDATED', () => this.handleChangeCFM());

        return this;
    }

    /**
     * Initialize the http server
     */
    initHttpServer() {

        let app = express();

        // Add CORS headers
        app.use(require('./../middleware/corsHeaders'));

        // Add Vary header
        app.use(require('./../middleware/varyHeader'));

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));

        // Start the server
        app.listen(this.http_port, () => {
            global.debug(`✔ Avatar listening on port ${this.http_port}`, this.avatar.deviceUri, true);
        });


        /**
         * Show information about the avatar
         */
        app.get('/', (req, res) => {

            res.json({
                name: this.avatar.deviceUri,
                capabilities: this.avatar.cm.getCapabilities(),
                functionalities: {
                    local: this.lfm.getFunctionalities(),
                    collaborative: {
                        master: this.cfm.collaborativeFunctionalitiesAsMaster,
                        slave: this.cfm.collaborativeFunctionalitiesAsSlave
                    }
                }
            });
        });

        /**
         * Entry point of the functionality
         */
        app.get('/functionality', (req, res) => {

            let f = this._getFunctionality(req.query.id);

            if (!f) {
                res.status(404).json({error: "Functionality not found on this avatar"});
                return;
            }

            let response = {
                invoke: `${this.avatar.avatar_uri}/invoke?id=${f.id}`,
                negotiate: `${this.avatar.avatar_uri}/negotiate?id=${f.id}`,
                callaborative: f.collaborative
            };

            if (f.collaborative) {
                response['collaboration'] = f.opts.collaboration;
            }

            res.json(response);
        });

        /**
         * Invokation of the functionality
         */
        app.get('/invoke', (req, res) => {
            global.debug(`***** Invokation of ${req.query.id}`, this.avatar.deviceUri);
            res.end();
        });

        /**
         * negotiation for the functionality
         */
        app.post('/negotiate', (req, res) => {

            let data = req.body;

            /*
             * Negocation aborted
             */
            if (data.action === 'abort') {
                // Delete the functionality
                for (let idx in this.cfm.collaborativeFunctionalitiesAsSlave) {
                    if (this.cfm.collaborativeFunctionalitiesAsSlave[idx].uri == data.functionality.uri) {
                        this.cfm.collaborativeFunctionalitiesAsSlave.splice(idx, 1);
                    }
                }

                res.end();
                return;
            }

            global.debug(`Incoming negotiation request for ${req.query.id} ...`, this.avatar.deviceUri, true);

            // If it already exists
            // for (let f of _.union(this.cfm.collaborativeFunctionalitiesAsSlave, this.cfm.collaborativeFunctionalitiesAsMaster)) {
            //
            //     console.log(f.uri);
            //     if (f.uri == data.functionality.uri) {
            //         res.json({confirmation: false});
            //         global.debug(`✔ Negotation succeeded: refuse collaboration`, this.avatar.deviceUri);
            //         return;
            //     }
            // }

            this.cfm.collaborativeFunctionalitiesAsSlave.push(
                new Functionality(data.functionality.id, data.functionality.uri, {
                    master: false
                })
            );

            // TODO we alaways accept collaboration an be the slave
            res.json({confirmation: true});

            global.debug(`✔ Negociation succeeded: accepte collaboration`, this.avatar.deviceUri);
        });
    }

    /**
     * Bind the functionalilties to the directory
     */
    registerFunctionalitiesToDirectory(funcs) {

        let serialized = [];
        for (let f of funcs) {
            serialized.push(f.serialize());
        }

        request.post({
            url: global.config.directory.fonctionality.bind,
            form: {
                avatar_uri: this.avatar.avatar_uri,
                functionalities: serialized
            }
        }, (err, res, data) => {
            if (err) {
                console.log(err);
            }
        });
    }

    /**
     * On event
     */
    handleChangeCFM() {
        let l_funcs = this.cfm.getFunctionalities();
        // Filter the functionatlities with the context manager
        l_funcs = this.ctxm.getExposableFunctionnalities(l_funcs);
        // Register to directory
        this.registerFunctionalitiesToDirectory(l_funcs);
        global.debug('Publish collaborative functionalities to the directory', this.avatar.deviceUri, true);
    }

    /**
     * On event
     */
    handleChangeLFM() {

        let c_funcs = this.lfm.getFunctionalities();
        // Filter the functionatlities with the context manager
        c_funcs = this.ctxm.getExposableFunctionnalities(c_funcs);
        // Register to directory
        this.registerFunctionalitiesToDirectory(c_funcs);

        global.debug('Publish local functionalities to the directory', this.avatar.deviceUri, true);
    }

    /**
     * Return the functionality object
     *
     * @param id
     */
    _getFunctionality(id) {

        for (let f of this.lfm.getFunctionalities()) {
            if (f.id == id) {
                return f;
            }
        }

        for (let f of this.cfm.getFunctionalities()) {
            if (f.id == id) {
                return f;
            }
        }

        return null;
    }
};
