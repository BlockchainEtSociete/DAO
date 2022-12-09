import { useCallback, useEffect, useState } from "react"
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { ipfsGetContent } from "../Common/Ipfs"

interface EmployeeCardDisplayProps {
    tokenId: string
    cardStatus?: boolean;
}

interface EmployeeProfile {
    firstName: string;
    lastName: string;
    picture?: string;
    birthDate: string;
    startDate: string;
    service: string;
    role: string;
    contractType: string;
    contractCategory: string;
}

const EmployeeCardProfile = ({ tokenId, cardStatus = true }: EmployeeCardDisplayProps ) => {
    const { state: { web3, contract, accounts } } = useEthContext();

    const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null)
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
                    
                    const employeeProfileData: EmployeeProfile = {
                        firstName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Firstname').value,
                        lastName: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Lastname').value,
                        birthDate: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Birth date').value,
                        startDate: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Start date').value,
                        service: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Service').value,
                        role: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Role').value,
                        contractType: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Contract type').value,
                        contractCategory: metadata.attributes.find((attribute: any) => attribute.trait_type === 'Contract category').value
                    }

                    const pictureAttribute = metadata.attributes.find((attribute: any) => attribute.trait_type === 'Picture');
                    if (pictureAttribute) {
                        const pictureContent = await ipfsGetContent(pictureAttribute.value)
                        employeeProfileData.picture = uint8ArrayToString(pictureContent, 'base64')
                    }

                    setEmployeeProfile(employeeProfileData)
                }
            }
        })()
    }, [accounts, cardStatus, contract, tokenId, web3])

    return (
        <div style={{margin: 'auto', width: 400}}>
        {!tokenId && 
            <div>
                <p>You've no employee card</p>
            </div>
        }
        {tokenId && !employeeProfile && <p>Loading...</p>}
        {tokenId && employeeProfile &&
            <div>
                <p>Welcome {employeeProfile.firstName} {employeeProfile.lastName}</p>
                <p>Is card valid ? {isCardValid === true ? 'Yes' : 'No'}</p>
                <p style={{fontWeight: 'bold'}}>Your profile informations: </p>
                {employeeProfile.picture && <img src={`data:image/*;base64,${employeeProfile.picture}`} alt="Employee" style={{height: '100px'}}/>}
                <div>Birth date: {employeeProfile.birthDate}</div>
                <div>Start date: {employeeProfile.startDate}</div>
                <div>Service: {employeeProfile.service}</div>
                <div>Role: {employeeProfile.role}</div>
                <div>Contract type: {employeeProfile.contractType}</div>
                <div>Contract category: {employeeProfile.contractCategory}</div>
            </div>
        }
        </div>
    )
}

export default EmployeeCardProfile