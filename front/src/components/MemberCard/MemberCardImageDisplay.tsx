import { useEffect, useState } from "react"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { ipfsGetContent } from "../Common/Ipfs"

interface MemberCardDisplayProps {
    tokenId: string
}

const MemberCardImageDisplay = ({ tokenId }: MemberCardDisplayProps ) => {
    const { state: { web3, contract, accounts } } = useEthContext();

    const [cardImage, setCardImage] = useState('');

    useEffect(() => {
        if (tokenId && !isNaN(parseInt(tokenId))) {
            (async () => {
                let tokenUri: string = '';
                try {
                    tokenUri = await contract.methods.tokenURI(web3.utils.toBN(tokenId)).call({from: accounts[0]})
                }
                catch (e) {
                    console.log(getRPCErrorMessage(e));
                }

                console.log(tokenUri);

                if (tokenUri) {
                    const metadataString = await ipfsGetContent(tokenUri)
                    const metadata = JSON.parse(uint8ArrayToString(metadataString, 'utf8'))

                    if (metadata.image) {
                        const imageContent = await ipfsGetContent(metadata.image)
                        setCardImage(uint8ArrayToString(imageContent, 'base64'))
                    }
                }
            })()
        }
    }, [cardImage, setCardImage, contract, accounts, tokenId, web3])

    return (
        <div style={{margin: 'auto', width: 400}}>
        {tokenId && cardImage &&
                <div>
                    <img src={`data:image/*;base64,${cardImage}`} alt="card" style={{height: '200px'}}/>
                </div>
        }
        </div>
    )
}

export default MemberCardImageDisplay