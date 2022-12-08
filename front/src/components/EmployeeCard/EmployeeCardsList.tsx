import { Box } from "@mui/material"
import { useEffect, useState } from "react"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { ipfsGetContent } from "../Common/Ipfs"
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
        {employeeCards && Object.keys(employeeCards).length > 0 &&
            <Box sx={{ width: '100%' }}>
                {(Object.keys(employeeCards)).map((employeeCardId: string) => {
                    return (
                        <EmployeeCardTile 
                            key={employeeCardId} 
                            picture={employeeCards[employeeCardId].picture}
                            lastname={employeeCards[employeeCardId].lastName}
                            firstname={employeeCards[employeeCardId].firstName}
                            service={employeeCards[employeeCardId].service}
                            role={employeeCards[employeeCardId].role} 
                        />
                    )
                })}
            </Box>
        }
        </>
    )
}

export default EmployeeCardList