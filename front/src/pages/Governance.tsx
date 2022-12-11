import { Box } from "@mui/material"
import { useEffect, useState } from "react"
import ProposalForm from "../components/Governance/ProposalForm"
import VotingSessionsList from "../components/Governance/VotingSessionsList"
import useEthContext from "../hooks/useEthContext"

const Governance = () => {
    const { state: { widContract, governanceContract, accounts, web3 } } = useEthContext()

    const [votingPower, setVotingPower] = useState(0)

    useEffect(() => {
        (async () => {
            const swidBalance = await governanceContract.methods.getVotingPower().call({from: accounts[0]})
            setVotingPower(web3.utils.fromWei(web3.utils.BN(swidBalance)))
        })()
    }, [accounts, widContract, web3, governanceContract.methods])

    return (
        <Box sx={{width: "80%"}}>
        {votingPower === 0 && <p>You don't have any voting power</p>}
        {votingPower > 0 &&
            <VotingSessionsList />
        }
        </Box>
    )
}

export default Governance