import { Box } from "@mui/material"
import { useEffect, useState } from "react"
import ProposalForm from "../components/Governance/ProposalForm"
import VotingSessionsList from "../components/Governance/VotingSessionsList"
import useEthContext from "../hooks/useEthContext"

const Governance = () => {
    const { state: { contract, accounts, web3 } } = useEthContext()

    const [isValidMember, setIsValidMember] = useState(false)

    useEffect(() => {
        (async () => {
            const foundTokenId = await contract.methods.getMemberCardId(accounts[0]).call({from: accounts[0]})
            const cardValid = await contract.methods.isTokenValid(foundTokenId).call({from: accounts[0]})
            setIsValidMember(cardValid)
        })()
    }, [accounts, web3, contract.methods])

    return (
        <Box sx={{width: "80%"}}>
        {!isValidMember && <p>Vous n'avez aucune carte de membre valide</p>}
        {isValidMember &&
            <>
            <ProposalForm />
            <VotingSessionsList />
            </>
        }
        </Box>
    )
}

export default Governance