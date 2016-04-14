'use strict';

class FunctionalityDirectory {
	constructor(){
		//var exposedFunctionalitiesList;
		//console.log('new FunctionalityDirectory constructor()');
		this.registry = new Map();
	}
	/**
     * Bind a functionality to the directory
     */
	bind(functionality, functionalityURI) {
		//avc une liste d'URI
		var listeURI = new Array();
		if (this.registry.get(functionality) === undefined) {
			listeURI = new Array();
		} else {
			var listeURI = this.registry.get(functionality);
		}
		
		listeURI.push(functionalityURI);
		this.registry.set(functionality, listeURI);

		//this.registry.set(functionality, functionalityURI);
	}
	unbind(functionality, functionalityURI) {
		var listeURI = this.registry.get(functionality);
		if (this.registry.get(functionality) !== undefined) {
			var pos = listeURI.indexOf(functionalityURI); 
			if(pos > -1) {
				listeURI.splice(pos, 1);
			} else
                return false;

			if(listeURI.length > 0) {
				this.registry.set(functionality, listeURI);
			}else {
				this.registry.delete(functionality);
			}
			return true;
		}else{
			console.log("Unbind : functionality not exist "+functionality);
			return false;
		}
	}
	/**
     * Search a functionality in the directory
     */
	lookup(functionality) {
		return this.registry.get(functionality);
	}

	showAll() {
		this.registry.forEach(function(valeur, clé) {
		  console.log(clé + " = " + valeur);
		}, this.registry);
	}

	getAll() {
		var allPairs = {};
		this.registry.forEach(function(valeur, clé) {
			allPairs[clé] = valeur;
		});
		return allPairs;
	}
}
module.exports = FunctionalityDirectory;