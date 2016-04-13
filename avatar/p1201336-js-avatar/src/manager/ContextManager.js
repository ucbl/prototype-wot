/**
 * Created by jordan on 27/01/2016
 */

'use strict';

const EventEmitter = require('events'),
    request = require('request'),
    global = require('./../helper/global');



/**
 * This class allows to determine which functionalities
 * can be exposed depending of the context.
 */
module.exports = class extends EventEmitter{

    constructor() {
        super();

        this.avatar = null;
        this.appComMgr = null;
        this.capabilitiesMgr = null;
        this.localFunctionalitiesMgr = null;

        // TODO
        // Permet de mettre en cache toutes less valeurs de contexte
        // pré-calculées
        this.local_cache = {};
    }

    /**
     * Initialisation of the manager
     *
     * @param appComMgr
     * @param capabilitiesMgr
     * @param localFunctionalitiesMgr
     */
    init(avatar, appComMgr, capabilitiesMgr, localFunctionalitiesMgr) {
        this.avatar = avatar;
        this.appComMgr = appComMgr;
        this.capabilitiesMgr = capabilitiesMgr;
        this.localFunctionalitiesMgr = localFunctionalitiesMgr;

        return this;
    }

    testReasoner() {
        let facts = [];

        facts.push(new Fact('device', 'hasLongitudeHigherThan', '51'));
        facts.push(new Fact('device', 'hasLongitudeHigherThan', '51'));
        facts.push(new Fact('device', 'hasLongitudeHigherThan', '51'));

        solver.evaluateRuleSet(facts);
    }

    /**
     * Process the input message
     */
    handleChangeEvent() {
        console.log('Something has changed on the device !');
    }

    /**
     * Get the functionalities which can be exposed
     *
     * @param functionalities A list of functionnalities
     */
    getExposableFunctionnalities(functionnalities) {
        // TODO pas de filtrage pour le moment
        //this.queryReasoner('SELECT...')
        return functionnalities;
    }
};
