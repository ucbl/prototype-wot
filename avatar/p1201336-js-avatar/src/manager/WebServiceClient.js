/**
 * Created by jordan on 27/01/2016
 */

'use strict';

const global = require('./../helper/global'),
		request = require("request");
/**
 * This class is used to request remote web service
 */
class WebServiceClient {

    constructor(avatar) {
        this.avatar = null;
    }

    /**
     * Initialisation of the manager
     */
    init(avatar) {
        this.avatar = avatar;
        return this;
    }

	/**
	 * Retrieves the ASAWoO functionality ontology and calls the callback with that ontology as args
	 */
	getAsawooOntology() {
		return this.sendHttpRequest({
			"url": global.config.ontology
		});        
	}

	/**
	 * Sends any HTTP request and delivers the response in a promise
	 * url is mandatory in parameter
	 * Can take a method and/or JSON content in parameters
	 * (see: https://github.com/request/request#requestoptions-callback)
	 */
	sendHttpRequest(args) {
		return new Promise ((resolve, reject) => {
			console.log("sending request to " + args.url);
			var options = {
				"url": args.url,
				"headers": {"Accept": "application/ld+json"}
			};
			if(args.method) {
				options.method = args.method;
			}
			if(args.json) {
				options.json = args.json;
			}
			request(options, (error, response, body) => {
				if(!error && response.statusCode == 200) {
					//console.log("\n\nReceived: " + body);
					resolve(body);
				} else if (!error && response.statusCode != 200) {
					console.log("Status code: " + response.statusCode);
					resolve(null);
				} else {
					reject(error);
				}
			});
		});
	}
	
    /**
     * Get a contextual value
     *
     * @param args
     */
    getContextValue(args) {
        throw 'getContextValue(): not implemented yet';
    }

    /**
     * Execute remote functionalities
     *
     * @param functionalities
     */
    executeFunctionalities(functionalities){
        throw 'executeFunctionalities(): not implemented yet';
    }

    /**
     * Get the fonctionalities
     *
     * @param capabilities
     * @returns {Array}
     */
    getFunctionalites() {
        return [];
    }
}

module.exports = WebServiceClient;