/**
 * Created by jordan on 27/01/2016
 */

'use strict';

const EventEmitter = require('events'),
    Globals = require('../../../../models/globals'),
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

            return this.lfm.getImcompleteFunctionalities()
                .then((imcompletes) => {
                    return this.searcCollaborativeFunctionalities(imcompletes);
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

        global.debug('Searching for collaborative functionalities...', this.avatar.displayName, true);

        let incomplete_funcs = {},
            collabPromises = [];

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
                global.debug(`For functionality ${f} missing : `, this.avatar.displayName, true);
                for (let missing_f of incomplete_funcs[f]) global.debug(`├── ${missing_f}`, this.avatar.displayName);
            }
        }

        // Get the running functionalities from the directory
        request.get(global.config.directory.fonctionality.getAll, (err, res, data) => {

            global.debug('✔ Get avaialble functionalities from the directory', this.avatar.displayName, true);

            if (err) {
                global.debug(err, this.avatar.displayName);
            }
            data = JSON.parse(data);

            let remote_funcs = data;

            if (!remote_funcs || (typeof remote_funcs != 'object')) {
                return;
            }

            // For each incomplete functionality
            for (let f in incomplete_funcs) {

                let dep_found = [];
                let dep_ok = false;

                // For each dependencies of this incomplete functionality
                for (let dep of incomplete_funcs[f]) {

                    dep_ok = false;

                    for (var key in remote_funcs) {
                        var remote_f = remote_funcs[key];
                        if (key == dep) {
                            dep_found.push(remote_f);
                            dep_ok = true;
                            break;
                        }
                    }

                    if (!dep_ok) break;
                }

                if (!dep_ok) continue;

                // We can do an incomplete functionality
                collabPromises.push(this.collaborationNegociationPhase1(f, dep_found));
            }

            return Promise.all(collabPromises);
        });
    }

    /**
     * Negocation phase 1 : Get the URI of the
     * collaboration service of the others functionalities
     */
    collaborationNegociationPhase1(func, remote_func) {

        global.debug(`Collaboration possible for '${func}' with: `, this.avatar.displayName, true);

        let negotiations = {};
        let negotiationPromises = [];
        let remaining = remote_func.length;

        /**
         * Get the uri of the negication service
         *
         * @param negocations
         * @param index
         */
        let getUri = (negocations, index) => {

            for (let functionalityUri of negocations[index].functionality) {
                request.get(functionalityUri, (err, res, data) => {

                    data = JSON.parse(data || {});

                    // Failure
                    if (err || !data.negotiate) {
                        global.debug(`✘ Can't collaborate with ${negocations[index].functionality.uri}`, this.avatar.displayName, true);
                        return new Promise();
                    }

                    negotiations[index].negotiate_uri = data.negotiate;

                    // If we have all URI => second phase
                    if (--remaining == 0) {
                        return this.collaborationNegociationPhase2(func, negocations);
                    }
                });
            }
        };

        for (let f of remote_func) {
            global.debug(` ├── ${f.id} at ${f.uri}`, this.avatar.displayName);

            negotiations[f.id] = {functionality: f};
            negotiationPromises.push(getUri(negotiations, f.id));
        }

        return Promise.all(negotiationPromises);
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
                    return this.collaborationNegociationPhase3(func, negotiations);
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
                global.debug('✘ Neogication failed or refused', this.avatar.displayName);
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

        global.debug('✔ Negotiation succeeded', this.avatar.displayName);

        // Notify that the collaborative functionalities has changed
        this.emit('COLLABORATIVE_FUNC_UPDATED');
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
