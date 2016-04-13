/**
 * Created by jordan on 26/01/2016
 */

 'use strict';

const EventEmitter = require('events'),
      global = require('../helper/global'),
      _ = require('underscore');

/**
 * This class is used to manage the capabilities
 * of a device.
 */
class CapabilityManager extends EventEmitter {

    constructor() {
        super();
        this.avatar = null;
        this.ctxm = null;
        this.capabilities = [];
    }

    /**
     * Initialisation of the manager
     *
     * @param ctxm
     */
    init(avatar, acm, ctxm) {
        let triplesCapabilities = [];

        this.avatar = avatar;
		this.acm = acm;
        this.ctxm = ctxm;

        return this.acm.getCapabilityList()
            .then((capabilities) => {
                this.capabilities = capabilities;
                //global.debug(`Capabilities of object:`, this.capabilities, true);

                // Inserting capabilities instances in the avatar's reasoner
                for (let c of this.capabilities) {
                    global.debug(`├── Capability ${c['@id']}`, this.avatar.deviceUri);
                    triplesCapabilities.push(`<${c['@id']}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://liris.cnrs.fr/asawoo/capability/${c.id}> .`);
                }

                global.debug(`✔ ${_.size(capabilities)} capabilities inserted in the reasoner.`, this.avatar.deviceUri, true);
                return avatar.hylar.query(`INSERT DATA { ${triplesCapabilities.join('\n')} }`)
            })
            .then(() => {
                    this.emit('CAPABILITIES_UPDATED');
                    return;
            })
            .catch((err) => {
                global.debug(err, this.capabilities);
            });
    }

    /**
     * Get the capabilties of a device
     */
    getCapabilities() {
        return this.capabilities;
    }

    /**
     * Get a contextual value of a device
     */
    getContextValue(args) {
        throw 'getContextValue(): not implemented yet';
    }
}

module.exports = CapabilityManager;