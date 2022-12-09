import { Box, Button } from "@mui/material"
import { useEffect, useState } from "react"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { ipfsGetContent } from "../Common/Ipfs"
import EmployeeCardManage from "./EmployeeCardManage"
import EmployeeCardTile from "./EmployeeCardTile"

interface EmployeeTileData {
    firstName: string;
    lastName: string;
    picture?: string;
    service: string;
    role: string;
}

const EmployeeCardList = () => {
    const { state: { contract, accounts } } = useEthContext()

    const [employeeCards, setEmployeeCards]: any = useState({})
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
        const addEmployeeCardToList = async (employeeCardId: number) => {
            // Only add card if it's not already added
            if (!employeeCards[employeeCardId]) {
                const employeeCardURI = await contract.methods.tokenURI(employeeCardId).call({ from: accounts[0] })

                if (employeeCardURI) {
                    const metadataString = await ipfsGetContent(employeeCardURI)
                    const metadata = JSON.parse(uint8ArrayToString(metadataString, 'utf8'))

                    const employeeProfileData: EmployeeTileData = {
                        firstName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Firstname').value,
                        lastName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Lastname').value,
                        service: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Service').value,
                        role: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Role').value,
                    }

                    const pictureAttribute = metadata.attributes.find((attribute: any) => attribute.trait_type === 'Picture');
                    if (pictureAttribute) {
                        const pictureFile = await ipfsGetContent(pictureAttribute.value)
                        const pictureBase64 = uint8ArrayToString(pictureFile, 'base64')
                        employeeProfileData.picture = pictureBase64
                    }
                    const employeeCardInfos: any = {}
                    employeeCardInfos[employeeCardId] = employeeProfileData
                    setEmployeeCards((current: any) => ({...current, ...employeeCardInfos}));
                }
            }
        }

        (async () => {
            try {
                // Find all employee cards minted in the contract.
                let oldEvents = await contract.getPastEvents('EmployeeCardMinted', {
                    fromBlock: 0,
                    toBlock: 'latest'
                });

                if (oldEvents && oldEvents.length > 0) {
                    oldEvents.map(async (event: any) => {
                        await addEmployeeCardToList(event.returnValues.tokenId)
                    });
                }

                await contract.events.EmployeeCardMinted({fromBlock: 'earliest'})
                    .on('data', async (event: any) => {
                        addEmployeeCardToList(event.returnValues.tokenId)
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
    })

    return (
        <>
        {showCardDetails === true && 
            <>
            <Button onClick={handleCloseDetails}>&lt; Return to list</Button>
            <EmployeeCardManage tokenId={selectedCardId} />
            </>
        }
        {!showCardDetails && (!employeeCards || Object.keys(employeeCards).length === 0) && <p>Loading...</p>}
        {!showCardDetails && employeeCards && Object.keys(employeeCards).length > 0 &&
            <Box sx={{ width: '100%', position: 'relative' }}>
                {(Object.keys(employeeCards)).map((employeeCardId: string) => {
                    return (
                        <EmployeeCardTile 
                            key={employeeCardId} 
                            tokenId={employeeCardId}
                            picture={employeeCards[employeeCardId].picture}
                            lastname={employeeCards[employeeCardId].lastName}
                            firstname={employeeCards[employeeCardId].firstName}
                            service={employeeCards[employeeCardId].service}
                            role={employeeCards[employeeCardId].role} 
                            handleSelectedCard={handleSelectedCard}
                        />
                    )
                })}
            </Box>
        }
        </>
    )
}

export default EmployeeCardList