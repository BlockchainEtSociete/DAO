import { useEffect, useState } from "react"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { ipfsGetContent } from "../Common/Ipfs"
import { EmployeeCardMetadata } from "./EmployeeCardGenerator"

interface EmployeeCardDisplayProps {
    tokenId: string
}

const EmployeeCardProfile = ({ tokenId }: EmployeeCardDisplayProps ) => {
    const { state: { web3, contract, accounts } } = useEthContext();

    const [cardImage, setCardImage] = useState('');
    const [cardMetadata, setCardMetadata]: EmployeeCardMetadata | any = useState(null);

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
                    setCardMetadata(metadata)

                    if (metadata.attributes.picture) {
                        const pictureContent = await ipfsGetContent(metadata.attributes.picture)
                        setCardImage(uint8ArrayToString(pictureContent, 'base64'))
                    }
                }
            })()
        }
    }, [accounts, cardImage, contract, tokenId, web3])

    return (
        <div style={{margin: 'auto', width: 400}}>
        {!tokenId && 
            <div>
                <p>You've no employee card</p>
            </div>
        }
        {tokenId && cardMetadata &&
            <div>
                <p>Welcome {cardMetadata.attributes.firstName} {cardMetadata.attributes.lastName}</p>
                <p style={{fontWeight: 'bold'}}>Your profile informations: </p>
                {cardImage && <img src={`data:image/*;base64,${cardImage}`} alt="Employee" style={{height: '100px'}}/>}
                <p>Birth date: {cardMetadata.attributes.birthDate}</p>
                <p>Start date: {cardMetadata.attributes.startDate}</p>
            </div>
        }
        </div>
    )
}

export default EmployeeCardProfile