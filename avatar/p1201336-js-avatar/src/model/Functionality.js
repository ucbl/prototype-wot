/**
 * Created by jordan on 04/02/16
 */

'use strict';

/**
 * Class Functionality
 */
module.exports = class {

    constructor(id, uri, collaborative, opts) {
        this.id = id;
        this.uri = uri;
        this.collaborative = collaborative || false;
        this.opts = opts || {};
    }

    serialize() {
        return {
            id: this.id,
            uri: this.uri,
            collaborative: this.collaborative
        }
    }
};