import dayjs from "dayjs";
import { MouseEvent, useEffect, useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import { getRPCErrorMessage } from "../Common/error";
import { getSessionStatus, SessionDetail, SessionStatus, SessionStatusId } from "./VotingSession.types";
import "./VotingSessionTile.scss"

interface VotingSessionTileProps {
    sessionId: number;
    handleSelectedVotingSession: Function;
}

const VotingSessionTile = ({ sessionId, handleSelectedVotingSession }: VotingSessionTileProps) => {

    const { state: { governanceContract, accounts, web3 } } = useEthContext()

    const [voteCasted, setVoteCasted] = useState(false)
    const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null)
    const [sessionStatus, setSessionStatus] = useState(0)

    useEffect(() => {
        (async () => {
            try {
                const sessionDetailResult: SessionDetail = await governanceContract.methods.getOneProposalSession(sessionId).call({from: accounts[0]})
                setSessionDetail(sessionDetailResult)
            }
            catch (e) {
                const reason = getRPCErrorMessage(e);
                console.log(reason)
            }
        })()
    }, [accounts, governanceContract, sessionId])

    // Recalculating status every 10 secs.
    useEffect(()=>{
        if (sessionDetail) {
            const sessionStatus = getSessionStatus(sessionDetail.startTime, sessionDetail.endTime)
            setSessionStatus(sessionStatus)

            const interval=setInterval(()=>{
                const sessionStatus = getSessionStatus(sessionDetail.startTime, sessionDetail.endTime)
                setSessionStatus(sessionStatus)
            },10000)
            
            return()=>clearInterval(interval)
        }
    },[sessionDetail])

    useEffect(() => {
        (async () => {
            // When status changes to ended for the first time, we have to refresh the session details.
            if (!voteCasted && sessionStatus === SessionStatusId.Ended) {
                try {
                    const sessionDetailResult: SessionDetail = await governanceContract.methods.getOneProposalSession(sessionId).call({from: accounts[0]})
                    setSessionDetail(sessionDetailResult)
                }
                catch (e) {
                    const reason = getRPCErrorMessage(e);
                    console.log(reason)
                }
                setVoteCasted(true)
            }

        })()
    }, [accounts, governanceContract, sessionId, sessionStatus, voteCasted])

    const handleVotingSessionClick = (event: MouseEvent<HTMLElement>) => {
        handleSelectedVotingSession(sessionId, sessionStatus)
    }

    return (
        <>
            <figure className="voting-tile" onClick={handleVotingSessionClick}>
                <div><span>Identifiant de session:</span> {sessionId}</div>
                <div><span>Etat:</span> {SessionStatus[sessionStatus]}</div>
                <br/>
                <div>{sessionDetail?.proposal.description}</div>
                <br/>
                <div><span>Heure de début des votes:</span> {sessionDetail && dayjs.unix(sessionDetail.startTime).format('DD/MM/YYYY HH:mm:ss')}</div>
                <div><span>Heure de fin des votes:</span> {sessionDetail && dayjs.unix(sessionDetail.endTime).format('DD/MM/YYYY HH:mm:ss')}</div>
                
                {sessionStatus === SessionStatusId.Ended &&
                    <>
                        <br/>
                        <div><span>Oui:</span> {sessionDetail?.proposal.voteCountYes}</div>
                        <div><span>Non:</span> {sessionDetail?.proposal.voteCountNo}</div>
                    </>
                }
            </figure>
        </>
    )
}

export default VotingSessionTile