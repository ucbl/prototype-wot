module.exports = {

    '@context': '',
    '@id': '',
    '@type': '',
    '@description': '',

    capabilities: [
        {
            ontology: 'http://liris.cnrs.fr/asawoo/capability/temperatureSense',
            access: {
                standard: 'http://192.168.x.x:8080/capability/temperatureSense',
                direct: 'http://192.168.x.x:9000/capability/temperatureSense'
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
