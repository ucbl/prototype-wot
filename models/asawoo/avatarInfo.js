/**
 * Created by Lionel on 13/04/2016.
 */

'use strict';

/**
 * Information stored in the ASAWoO platform about an avatar
 */
class AvatarInfo {

    constructor(id, device, http_port, uri) {
        this.id = id;
        this.name = id;
        this.deviceUri = device;
        this.http_port = http_port;
        this.avatar_uri = null;
        this["@id"] = uri;
        this.functionalities = [];
    }
/*
 deviceUri: device,
 name: ,
 http_port: this.getAvailablePort()
 */
    get() {
        return JSON.stringify(this);
    }

    setAccessUri(uri) {
        this.avatar_uri = uri;
    }

    addFunctionality(functionalityId) {
        this.functionalities.push(functionalityId);
    }

    removeFunctionality(functionalityId) {
        this.functionalities.remove(functionalityId);
    }

    getAllFunctionalities() {
        return this.functionalities;
    }
}