module.exports = {

    '@context': '',
    '@id': '',
    '@type': '',
    '@description': '',

    capabilities: [
        {
            ontology: 'http://liris.cnrs.fr/asawoo/capability/openWindow',
            access: {
                standard: 'http://192.168.x.x:8080/capability/openWindow',
                direct: 'http://192.168.x.x:9000/capability/openWindow'
            }
        },
        {
            ontology: 'http://liris.cnrs.fr/asawoo/capability/closeWindow',
            access: {
                standard: 'http://192.168.x.x:8080/capability/closeWindow',
                direct: 'http://192.168.x.x:9000/capability/closeWindow'
            }
        }
    ],

    connection: {
        dataConnection: '',
        parameters: '',
        address: '192.168.z.z'
    },

    protocol: {
        parameters: [
            {
                name: '',
                value: ''
            }
        ]
    }
};