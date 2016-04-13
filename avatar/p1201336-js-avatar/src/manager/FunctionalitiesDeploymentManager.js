/**
 * Created by jordan on 03/01/2016
 */

'use strict';

const request = require('request'),
      global = require('./../helper/global');

/**
 * This manager is used to manage the deployment
 * of functionalities code
 */
class FunctionalitiesDeployementManager {

    constructor() {
        this.avatar = null;
        this.ctxm = null;
    }

    /**
     * Initialisation of the manager
     *
     * @param ctxMgr
     */
    init(avatar, ctxMgr) {
        this.avatar = avatar;
        this.ctxm = ctxMgr;

        return this;
    }

    /**
     * Download the code corresponding to a functionality
     * @param functionality
     */
    downloadCode(functionality) {
        throw 'downloadCode(): not implemented yet';
    }
}

module.exports = FunctionalitiesDeployementManager;