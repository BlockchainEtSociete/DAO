import { AlertColor, Button, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, TextField } from "@mui/material"
import dayjs from "dayjs";
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import useEthContext from "../../hooks/useEthContext";
import { getRPCErrorMessage } from "../Common/error";
import SnackbarAlert from "../Common/SnackbarAlert";
import { getSessionStatus, SessionDetail, SessionStatus, SessionStatusId } from "./VotingSession.types";

interface VotingSessionDetailProps {
    sessionId: string;
}

const VotingSessionDetail = ({sessionId}: VotingSessionDetailProps) => {
    const { state: { governanceContract, accounts, web3 } } = useEthContext()

    const [vote, setVote] = useState(true)
    const [sessionStatus, setSessionStatus] = useState(0)
    const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>()

    const [userVoted, setUserVoted] = useState(true)

    const [voting, setVoting] = useState(false)
    const [SWIDBalance, setSWIDBalance] = useState(0)
    const [votingPower, setVotingPower] = useState(0)

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')
    
    useEffect(() => {
        (async () => {
            try {
                const sessionDetail: SessionDetail = await governanceContract.methods.getOneProposalSession(web3.utils.BN(sessionId)).call({from: accounts[0]})
                setSessionDetail(sessionDetail)

                setSessionStatus(getSessionStatus(sessionDetail.startTime, sessionDetail.endTime));

                const swidBalance = await governanceContract.methods.getVotingPower().call({from: accounts[0]})
                setSWIDBalance(web3.utils.fromWei(web3.utils.BN(swidBalance)))

                const hasVoted = await governanceContract.methods.getVoterStatus(web3.utils.BN(sessionId)).call({from: accounts[0]})
                setUserVoted(hasVoted)

                console.log(hasVoted)
            }
            catch (e) {
                const reason = getRPCErrorMessage(e);
                console.log(reason)
            }
        })()
    }, [accounts, governanceContract, sessionId, web3])

    // Recalculating status every 10 secs.
    useEffect(()=>{
        if (sessionDetail) {
            const newSessionStatus = getSessionStatus(sessionDetail.startTime, sessionDetail.endTime)
            setSessionStatus(newSessionStatus)

            const interval=setInterval(()=>{
                const newSessionStatus = getSessionStatus(sessionDetail.startTime, sessionDetail.endTime)
                setSessionStatus(newSessionStatus)
            },10000)
            
            return()=>clearInterval(interval)
        }
    },[sessionDetail])
    
    const handleVote = (e: ChangeEvent<HTMLInputElement>) => {
        setVote(e.target.value === 'yes' ? true : false)
    }

    const handleVotingPower = (e: any) => {
        setVotingPower(e.target.value)
    }

    const submitVote = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setVoting(true)

        try {
            await governanceContract.methods.voteOnProposal(sessionId, vote, web3.utils.BN(web3.utils.toWei(`${votingPower}`))).send({from: accounts[0]})
            
            setUserVoted(true)
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
        {!userVoted && sessionStatus !== SessionStatusId.InProgress && <p>The voting session is not open.</p>} 
        {!userVoted && sessionStatus === SessionStatusId.InProgress && sessionDetail && <>
            <br/>
            <div><span style={{fontWeight: 'bold'}}>Max amount of sWID you can use:</span> {SWIDBalance} sWID</div><br/>
            <div><span style={{fontWeight: 'bold'}}>Session status:</span> {SessionStatus[sessionStatus]}</div><br/>
            <div>{sessionDetail.proposal.description}</div><br/>
            <div><span style={{fontWeight: 'bold'}}>Vote period:</span> {dayjs.unix(sessionDetail.startTime).format('DD/MM/YYYY HH:mm:ss')} - {dayjs.unix(sessionDetail.endTime).format('DD/MM/YYYY HH:mm:ss')}</div>
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
                        max={SWIDBalance} 
                        onChange={handleVotingPower}
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