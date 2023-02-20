

import { CID, create } from 'ipfs-http-client'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import all from 'it-all'

const credentials = process.env.REACT_APP_IPFS_CREDENTIALS;


const requestHeaders: any = {};

if (credentials) {
    requestHeaders.authorization = 'Basic ' + btoa(credentials);
}

const ipfs = create({
    host: process.env.REACT_APP_IPFS_HOST ?? 'localhost', 
    port: parseInt(process.env.REACT_APP_IPFS_PORT ?? '5001'),
    protocol: 'https', 
    headers: requestHeaders,
});

export const ipfsGetContent = async (tokenUri: string) => {
    const cid = tokenUri.replace('ipfs://', '')
    const resp = uint8ArrayConcat(await all(ipfs.cat(CID.parse(cid))))

    return resp
}

export default ipfs;