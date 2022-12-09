import { AlertColor, Button, TextField } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import SnackbarAlert from "../Common/SnackbarAlert";
import EmployeeCardProfile from "./EmployeeCardProfile";

interface EmployeeCardManageProps {
    tokenId: string;
}

const EmployeeCardManage = ({tokenId}: EmployeeCardManageProps) => {
    const { state: { contract, accounts, web3 } } = useEthContext()
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs())
    const [isCardValid, setIsCardValid] = useState(true)


    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')

    const handleEndDateChange = (newValue: Dayjs | null) => {
        setEndDate(newValue);
    }

    const handleInvalidateCard = async () => {
        if (endDate) {
            const endTime: number = endDate.unix();

            const invalidateCardCall = await contract.methods.invalidateEmployeeCard(web3.utils.toBN(tokenId), web3.utils.toBN(endTime)).send({ from: accounts[0] })
            const endTimeFromEvent = invalidateCardCall.events.EmployeeCardEnded.returnValues.endTime

            if (+endTimeFromEvent === endTime) {
                setMessage(`The employee card invalidation request on ${endDate.format('DD/MM/YYYY')} has been taken in account`)
                setSeverity('success')
                setOpen(true)

                const updatedCardStatus = await contract.methods.isTokenValid(web3.utils.toBN(tokenId)).call({from: accounts[0]})
                setIsCardValid(updatedCardStatus)
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
        <EmployeeCardProfile tokenId={tokenId} cardStatus={isCardValid} />
        <p>&nbsp;</p>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
            label="End date"
            inputFormat="DD/MM/YYYY"
            value={endDate}
            onChange={handleEndDateChange}
            renderInput={(params) => <TextField {...params} />}
            />
        </LocalizationProvider>
        <Button onClick={handleInvalidateCard}>Invalidate the card</Button>
        <SnackbarAlert open={open} setOpen={setOpen} message={message} severity={severity} />
        </>
    )
}

export default EmployeeCardManage