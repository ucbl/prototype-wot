/**
 * Created by jordan on 27/01/2016
 */

'use strict';

const ACM = require('./../manager/ApplianceCommunicationManager'),
    CM = require('./../manager/CapabilitiesManager'),
    LFM = require('./../manager/LocalFunctionalitiesManager'),
    CFM = require('./../manager/CollaborationFunctionalitiesManager'),
    FPM = require('./../manager/FunctionalitiesPublicationManager'),
    FDM = require('./../manager/FunctionalitiesDeploymentManager'),
    CTXM = require('./../manager/ContextManager'),
    WSClient = require('./../manager/WebServiceClient'),
    HyLAR = require('./../../lib/hylar/hylar'),
    utils = require('../helper/utils'),
    crypto = require('crypto'),
    global = require('./../helper/global'),
    os = require('os');

/**
 * Avatar of a device
 */
class Avatar {

    constructor(hylar, acm, cm, lfm, cfm, fpm, fdm, ctxm, wsclient, opts) {

		this.hylar = hylar;
        this.acm = acm;
        this.cm = cm;
        this.lfm = lfm;
        this.cfm = cfm;
        this.fpm = fpm;
        this.fdm = fdm;
        this.ctxm = ctxm;
        this.wsclient = wsclient;
        this.deviceUri = opts.deviceUri;
        this.name = opts.deviceUri || crypto.randomBytes(10).toString('hex');

        this.avatar_uri = `http://${utils.getLocalIp()}:${this.fpm.http_port}`;

        global.debug('========================================================================');
        global.debug(`  New avatar built : ${this.name} (${this.avatar_uri})`);
        global.debug('=========================================================================');
    }

    /**
     * Create a new instance of an Avatar
     *
     * @returns {Avatar}
     */
    static buildAvatar(opts) {
		return new Promise(function(resolve, reject) {

			if (!opts.http_port || !opts.deviceUri)
				reject('HTTP listening port or device URI not specified');

			let hylar = new HyLAR();
			let acm = new ACM();
			let cm = new CM();
			let lfm = new LFM();
			let cfm = new CFM();
			let fpm = new FPM(opts.http_port);
			let fdm = new FDM();
			let ctxm = new CTXM();
			let wsclient = new WSClient();

			// Create an instance of the Avatar
			let avatar = new Avatar(hylar, acm, cm, lfm, cfm, fpm, fdm, ctxm, wsclient, opts);

			// Initialize the reasoner
			wsclient.getAsawooOntology().then((data) => {
				return hylar.load(data, 'application/json');
			}).then(() => {
				// Init the managers 1st stage
				wsclient.init(avatar);
				acm.init(avatar.deviceUri, wsclient);
                return cm.init(avatar, acm, ctxm);
			}).then(() => {
				// Init the managers 2nd stage (as CapabilityManager initialization needs to send a request)
				ctxm.init(avatar, acm, cm, lfm);
				lfm.init(avatar, ctxm, cm, wsclient);
				cfm.init(avatar, ctxm, wsclient, lfm);
				fpm.init(avatar, ctxm, lfm, cfm);
				fdm.init(avatar, ctxm);
				resolve(avatar.toJSON());
			})/*.catch((error) => {
				console.error("y a une merde");
				reject(error);
			});*/
		});
    }

    /**
     * When a capability changed on the device (new capability or one became unavailable)
     */
    updateAvatar() {
		//TODO
		//this.cm.updateCapabilities();
    }

    /**
     * When a functionality is bound on the directory
     */
    functionalityBoundOnDirectory() {
        global.debug('✩✩✩ Notification recieved from directory ✩✩✩', this.deviceUri, true);
        this.cfm.searcCollaborativeFunctionalities();
    }

    /**
     * When a functionality is unbound on the directory
     */
    functionalityUnboundOnDirectory() {

    }

    /**
     * Serialize the avatar
     */
    toJson() {
        return {
            deviceUri: this.deviceUri,
            uri: this.avatar_uri,
            capabilities: this.cm.getCapabilities(),
            functionalities: {
                local: this.lfm.getFunctionalities(),
                collaborative: this.cfm.getFunctionalities()
            }
        };
    }
}

module.exports = Avatar;
