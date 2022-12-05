import { useEffect, useState } from "react"
import useEthContext from "../../hooks/useEthContext"
import { ipfsGetContent } from "../Common/Ipfs"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { isConstructorDeclaration } from "typescript"

interface EmployeeCardDisplayProps {
    tokenId: string
}

const EmployeeCardDisplay = ({ tokenId }: EmployeeCardDisplayProps ) => {
    const { state: { web3, contract, accounts } } = useEthContext();

    const [cardImage, setCardImage] = useState('');
    const [cardMetadata, setCardMetadata] = useState({});

    useEffect(() => {
        if (tokenId && !isNaN(parseInt(tokenId))) {
            (async () => {
                const tokenUri: string = await contract.methods.tokenURI(web3.utils.toBN(tokenId)).call({from: accounts[0]})

                console.log(tokenUri);
                const metadataString = await ipfsGetContent(tokenUri)
                
                const metadata = JSON.parse(uint8ArrayToString(metadataString, 'utf8'))

                if (metadata.image) {
                    const imageContent = await ipfsGetContent(metadata.image)
                    setCardImage(uint8ArrayToString(imageContent, 'base64'))
                }
            })()
        }
    }, [cardImage, setCardImage, cardMetadata, setCardMetadata, contract, accounts, tokenId, web3.utils])

    return (
        <div style={{margin: 'auto', width: 400}}>
        {tokenId && cardImage &&
            <img src={`data:image/*;base64,${cardImage}`} alt="card" style={{height: '200px'}}/>
        }
        </div>
    )
}

export default EmployeeCardDisplay