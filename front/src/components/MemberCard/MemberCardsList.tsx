import { Box, Button } from "@mui/material"
import { useEffect, useState } from "react"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { ipfsGetContent } from "../Common/Ipfs"
import MemberCardManage from "./MemberCardManage"
import MemberCardTile from "./MemberCardTile"

interface MemberTileData {
    firstName: string;
    lastName: string;
    picture?: string;
}

const MemberCardList = () => {
    const { state: { contract, accounts } } = useEthContext()

    const [memberCards, setMemberCards]: any = useState({})
    const [showCardDetails, setShowCardDetails] = useState(false)
    const [selectedCardId, setSelectedCardId] = useState('')

    const handleSelectedCard = (cardId: string) => {
        console.log(cardId)
        setSelectedCardId(cardId)
        setShowCardDetails(true)
    }

    const handleCloseDetails = () => {
        setSelectedCardId('')
        setShowCardDetails(false)
    }

    useEffect(() => {
        const addMemberCardToList = async (memberCardId: number) => {
            // Only add card if it's not already added
            if (!memberCards[memberCardId]) {
                const memberCardURI = await contract.methods.tokenURI(memberCardId).call({ from: accounts[0] })

                if (memberCardURI) {
                    const metadataString = await ipfsGetContent(memberCardURI)
                    const metadata = JSON.parse(uint8ArrayToString(metadataString, 'utf8'))

                    const memberProfileData: MemberTileData = {
                        firstName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Firstname').value,
                        lastName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Lastname').value,
                    }

                    const pictureAttribute = metadata.attributes.find((attribute: any) => attribute.trait_type === 'Picture');
                    if (pictureAttribute) {
                        const pictureFile = await ipfsGetContent(pictureAttribute.value)
                        const pictureBase64 = uint8ArrayToString(pictureFile, 'base64')
                        memberProfileData.picture = pictureBase64
                    }
                    const memberCardInfos: any = {}
                    memberCardInfos[memberCardId] = memberProfileData
                    setMemberCards((current: any) => ({...current, ...memberCardInfos}));
                }
            }
        }

        (async () => {
            try {
                // Find all member cards minted in the contract.
                let oldEvents = await contract.getPastEvents('MemberCardMinted', {
                    fromBlock: 0,
                    toBlock: 'latest'
                });

                if (oldEvents && oldEvents.length > 0) {
                    oldEvents.map(async (event: any) => {
                        await addMemberCardToList(event.returnValues.tokenId)
                    });
                }

                await contract.events.MemberCardMinted({fromBlock: 'earliest'})
                    .on('data', async (event: any) => {
                        await addMemberCardToList(event.returnValues.tokenId)
                    })
                    .on('changed', (changed: string) => console.log(changed))
                    .on('error', (error: string) => console.log(error))
                    .on('connected', (str: string) => console.log(str))
            }
            catch (e) {
                const reason = getRPCErrorMessage(e);
                console.log(reason)
            }
        })()
    }, [accounts, contract, memberCards])

    return (
        <>
        {showCardDetails === true && 
            <>
            <Button onClick={handleCloseDetails}>&lt; Retour à la liste</Button>
            <MemberCardManage tokenId={selectedCardId} />
            </>
        }
        {!showCardDetails && (!memberCards || Object.keys(memberCards).length === 0) && <p>Chargement...</p>}
        {!showCardDetails && memberCards && Object.keys(memberCards).length > 0 &&
            <Box sx={{ width: '100%', position: 'relative' }}>
                {(Object.keys(memberCards)).map((memberCardId: string) => {
                    return (
                        <MemberCardTile 
                            key={memberCardId} 
                            tokenId={memberCardId}
                            picture={memberCards[memberCardId].picture}
                            lastname={memberCards[memberCardId].lastName}
                            firstname={memberCards[memberCardId].firstName}
                            handleSelectedCard={handleSelectedCard}
                        />
                    )
                })}
            </Box>
        }
        </>
    )
}

export default MemberCardList