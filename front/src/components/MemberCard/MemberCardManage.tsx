import { AlertColor, Button, TextField } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import SnackbarAlert from "../Common/SnackbarAlert";
import MemberCardProfile from "./MemberCardProfile";

interface MemberCardManageProps {
    tokenId: string;
}

const MemberCardManage = ({tokenId}: MemberCardManageProps) => {
    const { state: { contract, accounts, web3 } } = useEthContext()
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs())
    const [endTime, setEndTime] = useState(0)
    const [isCardValid, setIsCardValid] = useState(true)

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')

    useEffect(() => {
        (async () => {
            const cardEndTime = await contract.methods.getMemberCardEndTime(tokenId).call({from: accounts[0]})
            setEndTime(+cardEndTime)
        })()
    }, [accounts, contract, tokenId])

    const handleEndDateChange = (newValue: Dayjs | null) => {
        setEndDate(newValue);
    }

    const handleInvalidateCard = async () => {
        if (endDate) {
            const endTime: number = endDate.unix();

            const invalidateCardCall = await contract.methods.invalidateMemberCard(web3.utils.toBN(tokenId), web3.utils.toBN(endTime)).send({ from: accounts[0] })
            const endTimeFromEvent = invalidateCardCall.events.MemberCardEnded.returnValues.endTime

            if (+endTimeFromEvent === endTime) {
                setMessage(`The member card invalidation request on ${endDate.format('DD/MM/YYYY')} has been taken in account`)
                setSeverity('success')
                setOpen(true)

                const updatedCardStatus = await contract.methods.isTokenValid(web3.utils.toBN(tokenId)).call({from: accounts[0]})
                setIsCardValid(updatedCardStatus)
                setEndTime(+endTimeFromEvent)
            }
            else {
                setMessage('An error occured while trying to invalidate the card')
                setSeverity('error')
                setOpen(true) 
            }
        }
    }

    return (
        <>
        <MemberCardProfile tokenId={tokenId} cardStatus={isCardValid} />
        <p>&nbsp;</p>
        {endTime === 0 &&
        <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                label="Date de fin d'adhésion"
                inputFormat="DD/MM/YYYY"
                value={endDate}
                onChange={handleEndDateChange}
                renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>
            <Button onClick={handleInvalidateCard}>Invalider la carte</Button>
        </div>
        }
        <SnackbarAlert open={open} setOpen={setOpen} message={message} severity={severity} />
        </>
    )
}

export default MemberCardManage