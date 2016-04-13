/**
 * Created by jordan on 27/01/2016
 */

'use strict';

const EventEmitter = require('events'),
    global = require('./../helper/global'),
    request = require('request'),
    rdf = require('rdf-ext'),
    _ = require('underscore'),
    Functionality = require('../model/Functionality'),
    formats = require('rdf-formats-common')(rdf);

/**
 * This class is used to manage the local functionalities
 * of a device
 */
module.exports = class extends EventEmitter {

    constructor() {
        super();
        this.avatar = null;
        this.ctxm = null;
        this.cm = null;
		this.wsclient = null;
        this.localFunctionalities = [];
        this.incompleteLocalFunctionalities = [];
    }

    /**
     * Initialisation of the manager
     *
     * @param ctxm
     */
    init(avatar, ctxm, cm, wsclient) {
        this.avatar = avatar;
        this.ctxm = ctxm;
        this.cm = cm;
		this.wsclient = wsclient;

        this.cm.on('CAPABILITIES_UPDATED', () => this.searcLocalFunctionalities());

        return this;
    }

    /**
     * Get the list of the local functionalities
     *
     * @return {Array}
     */
    getFunctionalities() {
        return this.localFunctionalities;
    }


    /**
     * Reasone on the capabilities to discover capabilities
     */
    searcLocalFunctionalities() {

        let functionalities = [];
        let incomplete_functionalities = {};

        global.debug('Searching for local functionalities...', this.avatar.deviceUri, true);

        let completeImcompleteFuncQuery1 = `
            PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab/>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            CONSTRUCT { ?functType rdf:type ?functType }
            WHERE {
            	?capInstance rdf:type ?capType .
            	?capType rdfs:subClassOf asawoo:Capability .
            	{
            		?functType asawoo:isImplementedBy ?capType .
            	} UNION {
            		?primaryFunctType asawoo:isImplementedBy ?capType .
                    ?functType asawoo:isComposedOf* ?primaryFunctType .
            	}
            }`;

        let completeImcompleteFuncQuery2 = `
            PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab/>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            CONSTRUCT { ?functType rdf:type ?functType }
            WHERE {
            		?functType asawoo:isComposedOf ?primaryFunctType .
            		?functType asawoo:isComposedOf ?primaryFunctType2 .
            		?primaryFunctType asawoo:isImplementedBy ?capType .
            		?primaryFunctType2 asawoo:isImplementedBy ?capType2 .
            		?cap2 rdf:type ?capType2 .
            		FILTER NOT EXISTS {
            			?cap rdf:type ?capType .
            		}
            }`;


        let completeIncompleteFuncts = [];

        // Complete and incomplete functionalities
        this.avatar.hylar.query(completeImcompleteFuncQuery1)
        .then((data) => {
            completeIncompleteFuncts = data.triples;
            return this.avatar.hylar.query(completeImcompleteFuncQuery2);
        })
        // Complete functionalities
        .then((data) => {
            let insertLocalFunctionalitiesQuery = '';
            // Deducing local functionalities
            let incompleteFuncts = data.triples;

            for (var i = 0; i < incompleteFuncts.length; i++) {
                for (var j = 0; j < completeIncompleteFuncts.length; j++) {
                    if (completeIncompleteFuncts[j]) {
                        if (completeIncompleteFuncts[j].toString() == incompleteFuncts[i].toString()) {
                            delete completeIncompleteFuncts[j];
                        }
                    }
                }
            }

            global.debug(`Functionalites found:`, this.avatar.deviceUri, true);

            for (let f of completeIncompleteFuncts) {
                if(f) {
                    global.debug(`├── ✔ Functionality ${f.subject.nominalValue}`, this.avatar.deviceUri);
                    this.localFunctionalities.push(new Functionality(f.subject.nominalValue, `${this.avatar.avatar_uri}/functionality?id=${f.subject.nominalValue}`));
                    f.subject.nominalValue = `${this.avatar.avatar_uri}/functionality?id=${f.subject.nominalValue}`;
                }
            }

            // Insert local functionalities
            return this.avatar.hylar.query('INSERT DATA { ' + completeIncompleteFuncts.join('') + '}');
        })
        .then(() => {
            // Notify that the local functionalities has changed
            this.emit('LOCAL_FUNC_UPDATED');
        })
        .catch((err) => {
            global.debug(err, this.avatar.deviceUri);
        });
    }

    /**
     * Get the imcomplete fonctionalities
     */
    getImcompleteFunctionalities(){

        return new Promise((resolve, reject) => {

            let imcompleteFuncQuery =`
                PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                SELECT DISTINCT ?incompleteFunctType ?missingFunctType WHERE {
                    ?incompleteFunctType asawoo:isComposedOf* ?missingFunctType .
                    ?incompleteFunctType asawoo:isComposedOf* ?functCompType2 .
                    ?functInstance2 rdf:type ?functCompType2 .
                    FILTER NOT EXISTS { ?functInstance rdf:type ?missingFunctType . }
                    FILTER (str(?incompleteFunctType) != str(?missingFunctType))
                }`;

            this.avatar.hylar.query(imcompleteFuncQuery)
            .then((data) => {
                let imcompleteFunctionalities = {};
                if(!data) return;
                for(let couple of data){
                    if(couple){
                        if(!imcompleteFunctionalities[couple.incompleteFunctType.value]){
                            imcompleteFunctionalities[couple.incompleteFunctType.value] = [];
                        }
                        imcompleteFunctionalities[couple.incompleteFunctType.value].push(couple.missingFunctType.value);
                    }
                }

                resolve(imcompleteFunctionalities);
            });
        });
    }
};
