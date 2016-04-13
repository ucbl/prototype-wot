/**
 * Created by jordan on 27/01/2016
 */

'use strict';

const EventEmitter = require('events'),
    request = require('request'),
    Functionality = require('../model/Functionality'),
    _ = require('underscore'),
    global = require('./../helper/global');


/**
 * This class is used to manage the local functionalities
 * of a device
 */
module.exports = class extends EventEmitter {

    constructor() {
        super();
        this.avatar = null;
        this.ctxm = null;
        this.collaborativeFunctionalitiesAsMaster = [];
        this.collaborativeFunctionalitiesAsSlave = [];
    }

    /**
     * Initialisation of the manager
     *
     * @param ctxMgr<
     */
    init(avatar, ctxMgr, wsClient, localFuncMgr) {
        this.avatar = avatar;
        this.ctxm = ctxMgr;
        this.wsClient = wsClient;
        this.lfm = localFuncMgr;

        // When local functionalities are know or changed
        this.lfm.on('LOCAL_FUNC_UPDATED', () => {

            this.lfm.getImcompleteFunctionalities()
            .then((imcompletes) => {
                this.searcCollaborativeFunctionalities(imcompletes);
            })
            .catch((err) => {
                console.log('failed:', err, imcompletes);
            });
        });


        //

        return this;
    }

    /**
     * Reasone on the local functionalities to find
     * collaborative functionaltiies
     */
    searcCollaborativeFunctionalities(incomplete_local_funcs) {

        global.debug('Searching for collaborative functionalities...', this.avatar.deviceUri, true);

        let incomplete_funcs = {};

        // Copie the list
        for (let f in incomplete_local_funcs) {
            incomplete_funcs[f] = incomplete_local_funcs[f];
        }

        // Remove those we already know to do
        for (let collab_f of _.union(this.collaborativeFunctionalitiesAsMaster, this.collaborativeFunctionalitiesAsSlave)) {
            if (incomplete_funcs[collab_f.id]) {
                delete incomplete_funcs[collab_f.id];
            }
        }

        //console.log('I DO AS MASTER', this.collaborativeFunctionalitiesAsMaster);
        //console.log('I PARTICIPATE AS SLAVE', this.collaborativeFunctionalitiesAsSlave);
        //console.log('INCOMPLETE', incomplete_local_funcs);
        //console.log('INCOMPLETE TO FIND', incomplete_funcs);

        if (global.config.debug) {
            for (let f in incomplete_funcs) {
                global.debug(`For functionality ${f} missing : `, this.avatar.deviceUri, true);
                for (let missing_f of incomplete_funcs[f]) global.debug(`├── ${missing_f}`, this.avatar.deviceUri);
            }
        }

        // Get the running functionalities from the directory
        request.get(global.config.directory.fonctionality.getAll, (err, res, data) => {

            global.debug('✔ Get avaialble functionalities from the directory', this.avatar.deviceUri, true);

            if (err) {
                global.debug(err, this.avatar.deviceUri);
            }
            data = JSON.parse(data);

            let remote_funcs = data.functionalities;

            if (!remote_funcs || !Array.isArray(remote_funcs)) {
                return;
            }

            // For each incomplete functionality
            for (let f in incomplete_funcs) {

                let dep_found = [];
                let dep_ok = false;

                // For each dependencies of this incomplete functionality
                for (let dep of incomplete_funcs[f]) {

                    dep_ok = false;

                    for (let remote_f of remote_funcs) {
                        if (remote_f.id == dep) {
                            dep_found.push(remote_f);
                            dep_ok = true;
                            break;
                        }
                    }

                    if (!dep_ok) break;
                }

                if (!dep_ok) continue;

                // We can do an incomplete functionality
                this.collaborationNegociationPhase1(f, dep_found);
            }
        });
    }

    /**
     * Negocation phase 1 : Get the URI of the
     * collaboration service of the others functionalities
     */
    collaborationNegociationPhase1(func, remote_func) {

        global.debug(`Collaboration possible for '${func}' with: `, this.avatar.deviceUri, true);

        let negotiations = {};
        let remaining = remote_func.length;

        /**
         * Get the uri of the negication service
         *
         * @param negocations
         * @param index
         */
        let getUri = (negocations, index) => {

            request.get(negocations[index].functionality.uri, (err, res, data) => {

                data = JSON.parse(data || {});

                // Failure
                if (err || !data.negotiate) {
                    global.debug(`✘ Can't collaborate with ${negocations[index].functionality.uri}`, this.avatar.deviceUri, true);
                    return;
                }

                negotiations[index].negotiate_uri = data.negotiate;

                // If we have all URI => second phase
                if (--remaining == 0) {
                    this.collaborationNegociationPhase2(func, negocations);
                }
            });
        };

        for (let f of remote_func) {
            global.debug(` ├── ${f.id} at ${f.uri}`, this.avatar.deviceUri);

            negotiations[f.id] = {functionality: f};
            getUri(negotiations, f.id);
        }
    }

    /**
     * Ask the functionality for collaboration
     *
     * @param func
     * @param negotiations
     */
    collaborationNegociationPhase2(func, negotiations) {

        let remained = Object.keys(negotiations).length;

        let askCollaboration = (index) => {

            // TODO for the moment it's always the avatar that
            // ask the question which bacame the master
            request.post({
                url: negotiations[index].negotiate_uri,
                form: {
                    master: 'me',
                    functionality: {
                        id: func,
                        uri: `${this.avatar.avatar_uri}/functionality?id=${func}`
                    }
                }
            }, (err, res, data) => {

                --remained;
                negotiations[index].success = false;

                if (!err) {
                    data = JSON.parse(data);

                    /*
                     * Collaboration accepted
                     */
                    if (data.confirmation) {
                        negotiations[index].success = true;
                        negotiations[index].state = 'master';
                    }
                }

                // When all negocations done => phase 3
                if (remained == 0) {
                    this.collaborationNegociationPhase3(func, negotiations);
                }

            });
        };

        for (let index in negotiations) {
            askCollaboration(index);
        }
    }

    /**
     * Final phase of the negocation, register the
     * collaborative functionality if success
     *
     * @param func
     * @param negotiations
     */
    collaborationNegociationPhase3(func, negotiations) {

        let rollback = () => {
            for (let index in negotiations) {
                request.post({
                    url: negotiations[index].negotiate_uri,
                    form: {
                        action: 'abort',
                        functionality: {
                            id: index,
                            uri: `${this.avatar.avatar_uri}/functionality?id=${func}`
                        }
                    }
                });
            }
        };

        let collaborative_funcs = {};
        // Check if all negocations succeed
        for (let index in negotiations) {
            if (!negotiations[index].success) {
                global.debug('✘ Neogication failed or refused', this.avatar.deviceUri);
                rollback();
                return;
            }

            collaborative_funcs[index] = negotiations[index].functionality.uri;
        }

        // Add the functionality
        this.collaborativeFunctionalitiesAsMaster.push(
            new Functionality(func, `${this.avatar.avatar_uri}/functionality?id=${func}`, true, {
                master: true,
                collaboration: collaborative_funcs
            })
        );

        global.debug('✔ Negotiation succeeded', this.avatar.deviceUri);

        // Notify that the collaborative functionalities has changed
        this.emit('CALLABORATIVE_FUNC_UPDATED');
    }

    /**
     * Get the fonctionalities
     *
     * @returns {Array}
     */
    getFunctionalities() {
        return this.collaborativeFunctionalitiesAsMaster;
    }
};
