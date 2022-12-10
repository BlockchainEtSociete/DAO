import { AlertColor, Button, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, TextField } from "@mui/material"
import dayjs from "dayjs";
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import useEthContext from "../../hooks/useEthContext";
import { getRPCErrorMessage } from "../Common/error";
import SnackbarAlert from "../Common/SnackbarAlert";
import { SessionDetail } from "./VotingSession.types";

interface VotingSessionDetail {
    sessionId: string;
}

const SessionStatus = [
    'Pending',
    'In progress',
    'Ended'
]

const VotingSessionDetail = ({sessionId}: VotingSessionDetail) => {
    const { state: { governanceContract, accounts, web3 } } = useEthContext()

    const [vote, setVote] = useState(true)
    const [sessionStatus, setSessionStatus] = useState('')
    const [proposal, setProposal] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')

    const [userVoted, setUserVoted] = useState(false)

    const [voting, setVoting] = useState(false)
    const [votingPower, setVotingPower] = useState(0)

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')
    
    useEffect(() => {
        (async () => {
            try {
                const sessionStatus: number = await governanceContract.methods.getVotingSessionStatus(web3.utils.BN(sessionId)).call({from: accounts[0]})
                setSessionStatus(SessionStatus[sessionStatus]);

                const sessionDetail: SessionDetail = await governanceContract.methods.getOneProposalSession(web3.utils.BN(sessionId)).call({from: accounts[0]})
                
                setProposal(sessionDetail.proposal.description)
                setStartTime(dayjs.unix(sessionDetail.startTime).format('DD/MM/YYYY HH:mm:ss'))
                setEndTime(dayjs.unix(sessionDetail.endTime).format('DD/MM/YYYY HH:mm:ss'))

                const swidBalance = await governanceContract.methods.getVotingPower().call({from: accounts[0]})
                setVotingPower(web3.utils.fromWei(web3.utils.BN(swidBalance)))


                const hasVoted = await governanceContract.methods.getVoterStatus(web3.utils.BN(sessionId)).call({from: accounts[0]})
                setUserVoted(hasVoted)

                console.log(hasVoted)
            }
            catch (e) {
                const reason = getRPCErrorMessage(e);
                console.log(reason)
            }
        })()
    })
    
    const handleVote = (e: ChangeEvent<HTMLInputElement>) => {
        setVote(e.target.value === 'yes' ? true : false)
    }

    const submitVote = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setVoting(true)

        try {
            await governanceContract.methods.voteOnProposal(sessionId, vote, web3.utils.BN(web3.utils.toWei(votingPower))).send({from: accounts[0]})

            setMessage('Your vote has been submitted. Thank you ! :)')
            setSeverity('success')
            setOpen(true)
        } catch (e) {
            console.log(e)
            setMessage(getRPCErrorMessage(e))
            setSeverity('error')
            setOpen(true)
        }
        setVoting(false)
    }

    return (
        <>
        {userVoted && <p>You already voted on this session.</p>}
        {!userVoted && <>
            <div>Session status: {sessionStatus}</div>
            <div>{proposal}</div>
            <div>Vote period: {startTime} - {endTime}</div>
            <form method="post" id="mintForm" encType="multipart/form-data" onSubmit={submitVote}>           
                <div className="form-item">
                    <FormLabel id="vote-label">Vote</FormLabel>
                    <RadioGroup 
                        aria-labelledby="vote-label"
                        defaultValue={vote ? 'yes' : 'no'}
                        onChange={handleVote}
                        name="vote">
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                </div>
                <div className="form-item">
                    <FormLabel id="vote-label">Amount of voting power to use</FormLabel>
                    <Slider 
                        defaultValue={votingPower} 
                        step={0.1} 
                        min={0.1} 
                        max={votingPower} 
                        valueLabelDisplay="on"
                        marks
                    />
                </div>
                <div className="form-item" style={{textAlign: 'center'}}>
                    <Button variant="contained" type="submit" disabled={voting}>
                        Propose to vote
                    </Button>
                </div>
            </form>
            <SnackbarAlert open={open} setOpen={setOpen} message={message} severity={severity} />
            </>
        }
        </>
    )
}

export default VotingSessionDetail