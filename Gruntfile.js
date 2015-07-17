module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.initConfig({

	    'nodemon': {
  			functionalities: {
    			script: 'functionalities/server.js'
  			},
  			ontology: {
    			script: 'ontology/server.js'
  			},
  			coderepo: {
    			script: 'code-repository/server.js'
  			},
  			interoperability: {
  				script: 'interoperability/server.js'
  			}
		},

		'concurrent': {
			dev: {
	    		tasks: [
		    		'nodemon:functionalities',
				    'nodemon:ontology',
		    		'nodemon:coderepo',
		    		'nodemon:interoperability'
		    	],
			    options: {
	    			logConcurrentOutput: true
		    	}
			}
		}
	});

	grunt.registerTask('default', [
		'concurrent'
	]);
}