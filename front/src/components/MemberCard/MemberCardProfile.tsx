import { useCallback, useEffect, useState } from "react"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { ipfsGetContent } from "../Common/Ipfs"

interface MemberCardDisplayProps {
    tokenId: string
    cardStatus?: boolean;
}

interface MemberProfile {
    firstName: string;
    lastName: string;
    picture?: string;
    startDate: string;
}

const MemberCardProfile = ({ tokenId, cardStatus = true }: MemberCardDisplayProps ) => {
    const { state: { web3, contract, accounts } } = useEthContext();

    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null)
    const [isCardValid, setIsCardValid] = useState(cardStatus)

    useEffect(() => {
        setIsCardValid(cardStatus);
        (async () => {

            if (tokenId && !isNaN(parseInt(tokenId))) {
                let tokenUri: string = ''
                try {
                    tokenUri = await contract.methods.tokenURI(web3.utils.toBN(tokenId)).call({from: accounts[0]})
                    const updatedCardStatus = await contract.methods.isTokenValid(web3.utils.toBN(tokenId)).call({from: accounts[0]})
                    setIsCardValid(updatedCardStatus)
                }
                catch (e) {
                    console.log(getRPCErrorMessage(e));
                }

                console.log(tokenUri);

                if (tokenUri) {
                    const metadataString = await ipfsGetContent(tokenUri)
                    const metadata = JSON.parse(uint8ArrayToString(metadataString, 'utf8'))
                    
                    const memberProfileData: MemberProfile = {
                        firstName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Firstname').value,
                        lastName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Lastname').value,
                        startDate: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Start date').value,
                    }

                    const pictureAttribute = metadata.attributes.find((attribute: any) => attribute.trait_type === 'Picture');
                    if (pictureAttribute) {
                        const pictureContent = await ipfsGetContent(pictureAttribute.value)
                        memberProfileData.picture = uint8ArrayToString(pictureContent, 'base64')
                    }

                    setMemberProfile(memberProfileData)
                }
            }
        })()
    }, [accounts, cardStatus, contract, tokenId, web3])

    return (
        <div>
        {!tokenId && 
            <div>
                <p>Vous n'avez aucune carte de membre</p>
            </div>
        }
        {tokenId && !memberProfile && <p>Chargement...</p>}
        {tokenId && memberProfile &&
            <div>
                <p>Bienvenue {memberProfile.firstName} {memberProfile.lastName}</p>
                <p><span style={{fontWeight: 'bold'}}>Votre carte est-elle encore valide ?</span> {isCardValid === true ? 'Oui' : 'Non'}</p>
                <p style={{fontWeight: 'bold'}}>Vos informations: </p>
                {memberProfile.picture && <img src={`data:image/*;base64,${memberProfile.picture}`} alt="Member" style={{height: '100px'}}/>}
                <br/><br/>
                <div><span style={{fontWeight: 'bold'}}>Date de début d'adhésion:</span> {memberProfile.startDate}</div>
            </div>
        }
        </div>
    )
}

export default MemberCardProfile