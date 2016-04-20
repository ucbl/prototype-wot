'use strict';

class FunctionalityDirectory {
	constructor(){
        // The map of functionality instances, indexed by types (Functionality class)
		this.registry = new Map();
	}

	/**
     * Bind a functionality serialization to the directory, according to its "@type" property
     */
	bind(functionality) {
        let type = functionality['@type'];
            let functionalities;
            if (this.registry.get(type) === undefined) {
                functionalities = [];
            } else {
                functionalities = this.registry.get(type);
            }
            console.log("[bind] fin de boucle : functionalities = " + JSON.stringify(functionalities));

            functionalities.push(functionality);
            this.registry.set(type, functionalities);
	}

	/**
	 * Unbinds all occurrences of a functionality from the registry, according to its "@id" property
	 *
	 * @param functionalityId Id of a functionality instance
	 * @returns {boolean} true if at least one occurrence was found, false otherwise
     */
	unbind(functionalityId) {
		let result = false;
        //Iterate ovr each functionality type
		for (let functionalities of this.registry) {
            let positions = [];
            //Find the functionalities that have the same @id as the one given in parameters
            //(should only be one, but...)
            console.log("[Unbind] 1ere boucle : " + JSON.stringify(functionalities));
            for(let i in functionalities) {
                console.log("[Unbind] 2eme boucle : " + JSON.stringify(functionalities[i]) + " -> " + functionalities[i]["@id"]);
                if(functionalities[i]["@id"] === functionalityId) {
                    positions.push(i);
                }
            }
            //Remove each of those
			for (i of positions) {
				functionalities.splice(i, 1);
				if (functionalities.length > 0) {
					this.registry.set(funcType, functionalities);
				} else {
					this.registry.delete(funcType);
				}
				result = true;
			}
		}
        return result;
	}

    /**
     * unbinds a functionality instance and binds it again
     * @param functionality
     * @returns {*}
     */
    rebind (functionality) {
        this.unbind(functionality["@id"]);
        return this.bind(functionality);
    }

	/**
     * Search the instances of a functionality class in the directory
     *
     * @param functionalityClass URI of the functionality class to look for
     * @returns the array of functionality instances corresponding to this class
     */
	lookup(functionalityClass) {
		return this.registry.get(functionalityClass)?this.registry.get(functionalityClass):[];
	}

    /**
     * gets all functionality instances stored in the directory
     * @returns {{}} a JSON object containing all functionalities (structured according to their types)
     */
	getAll() {
		var result = {};
		for (let functionalityClass of this.registry.keys()) {
			result["" + functionalityClass] = this.registry.get(functionalityClass);
		}
		return result;
	}
}

module.exports = FunctionalityDirectory;