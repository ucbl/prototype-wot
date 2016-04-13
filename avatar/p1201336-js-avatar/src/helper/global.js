/**
 * Created by jordan on 28/01/2016
 */
'use strict';

var global = {
    config: {
        debug: true,
        directory: {
            fonctionality: {
                getAll: 'http://localhost:3000/asawoo/directory/',
                bind: 'http://localhost:3000/asawoo/directory/',
                unbind: 'http://localhost:3000/asawoo/directory/',
                lookup: 'http://localhost:3000/asawoo/directory/'
            }
        },
        repository: {
            functionality: 'http://localhost:3000/repository/functionality'
        },
		ontology: "http://localhost:3000/ontology/asawoo-ontology"
    }
};

global.debug = (data, prefix, isolate) => {
    if(isolate) process.stdout.write('\n');
    process.stdout.write(' ');
    if (prefix) process.stdout.write(`[ ${prefix} ] `);
    process.stdout.write(`${data}\n`);
};


module.exports = global;
