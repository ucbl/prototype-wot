module.exports = {

    '@context': '',
    '@id': '',
    '@type': '',
    '@description': '',

    capabilities: [
        {
            ontology: 'http://liris.cnrs.fr/asawoo/capability/sms',
            access: {
                standard: 'http://192.168.x.x:8080/capability/sms',
                direct: 'http://192.168.x.x:9000/capability/sms'
            }
        },
        {
            ontology: 'http://liris.cnrs.fr/asawoo/capability/call',
            access: {
                standard: 'http://192.168.x.x:8080/capability/call',
                direct: 'http://192.168.x.x:9000/capability/call'
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