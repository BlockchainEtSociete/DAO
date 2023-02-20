import { Button } from "@mui/material"
import { useEffect, useState } from "react"
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import { SessionStatusId } from "./VotingSession.types"
import VotingSessionDetail from "./VotingSessionDetail"
import VotingSessionTile from "./VotingSessionTile"

const VotingSessionsList = () => {
    const { state: { governanceContract, accounts } } = useEthContext()

    const [votingSessions, setVotingSessions]= useState<number[]>([])
    const [showVotingDetail, setShowVotingDetail] = useState(false)
    const [selectedVotingSessionId, setSelectedVotingSessionId] = useState('')

    const handleSelectedVotingSession = (sessionId: string, sessionStatus: number) => {
        console.log(sessionId)
        if (sessionStatus === SessionStatusId.InProgress) {
            setSelectedVotingSessionId(sessionId)
            setShowVotingDetail(true)
        }
    }

    const handleCloseDetails = () => {
        setSelectedVotingSessionId('')
        setShowVotingDetail(false)
    }

    useEffect(() => {
        const addVotingSession = (votingSessionId: number) => {
            // Only add session if it's not already added
            if (!votingSessions.includes(votingSessionId)) {
                const votingSessionsUpdated = [...votingSessions, votingSessionId].sort((s1, s2) => s2 - s1);
                setVotingSessions(votingSessionsUpdated);
            }
        }

        (async () => {
            try {
                // Find all voting sessions created in the contract.
                let oldEvents = await governanceContract.getPastEvents('ProposalSessionRegistered', {
                    fromBlock: 0,
                    toBlock: 'latest'
                });

                if (oldEvents && oldEvents.length > 0) {
                    oldEvents.map(async (event: any) => {
                        addVotingSession(event.returnValues.sessionId)
                    });
                }

                await governanceContract.events.ProposalSessionRegistered({fromBlock: 'earliest'})
                    .on('data', async (event: any) => {
                        addVotingSession(event.returnValues.sessionId)
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
    }, [accounts, governanceContract, votingSessions])

    return (
        <>
        {!showVotingDetail && votingSessions && votingSessions.length === 0 && <p>Aucune session de vote pour le moment.</p>}
        {!showVotingDetail && !votingSessions && <p>Chargement...</p>}
        {!showVotingDetail && votingSessions && votingSessions.length > 0 &&
            <>
            { votingSessions.map((sessionId: number) => 
                (<div style={{width: "100%"}}><VotingSessionTile sessionId={sessionId} handleSelectedVotingSession={handleSelectedVotingSession}/></div>))
            }
            </>
        }
        {showVotingDetail && <>
                <Button onClick={handleCloseDetails}>&lt; Return to list</Button>
                <VotingSessionDetail sessionId={selectedVotingSessionId} /> 
            </>
        }
        </>
    )
}

export default VotingSessionsList