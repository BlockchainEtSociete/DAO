

import { create } from 'ipfs-http-client'

const auth =
    'Basic ' + btoa('2GE57JSYAYoTaIBw6HATXYyJWlM' + ':' + '2c68d980bee6d3c9e46c53d6ca5b0db0');

const ipfs = create({
    /*host: 'ipfs.infura.io', 
    port: 5001,*/
    host: 'localhost',
    port: 5001,
    protocol: 'http', 
    /*headers: {
        authorization: auth,
    }*/
});

export default ipfs;