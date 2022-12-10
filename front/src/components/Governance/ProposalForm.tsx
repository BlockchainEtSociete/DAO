import { AlertColor, Button, TextField } from "@mui/material"
import { DesktopDatePicker, DesktopDateTimePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs, { Dayjs } from "dayjs"
import { ChangeEvent, FormEvent, useState } from "react"
import useEthContext from "../../hooks/useEthContext"
import { getRPCErrorMessage } from "../Common/error"
import SnackbarAlert from "../Common/SnackbarAlert"

const ProposalForm = () => {
    const { state: { governanceContract, accounts } } = useEthContext()

    const [sending, setSending] = useState(false)

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')

    const [proposalDescription, setProposalDescription] = useState('')
    const [proposalStartTime, setProposalStartTime] = useState(dayjs().unix())
    const [proposalEndTime, setProposalEndTime] = useState(dayjs().unix())

    const handleAddProposal = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSending(true)
        try {
            await governanceContract.methods.addProposal(proposalDescription, proposalStartTime, proposalEndTime).send({from: accounts[0]})

            setMessage('Sucessfully added proposal')
            setSeverity('success')
            setOpen(true)
        } catch (e) {
            console.log(e)
            setMessage(getRPCErrorMessage(e))
            setSeverity('error')
            setOpen(true)
        }

        setSending(false)
    }

    const handleDescription = (e: ChangeEvent<HTMLInputElement>) => {
        setProposalDescription(e.target.value)
    }

    const handleStartDate = (newValue: Dayjs | null) => {
        if (newValue)
            setProposalStartTime(newValue.unix());
    }

    const handleEndDate = (newValue: Dayjs | null) => {
        if (newValue)
            setProposalEndTime(newValue.unix());
    }

    return (
        <>
        <form method="post" id="mintForm" encType="multipart/form-data" onSubmit={handleAddProposal}>            
            <div className="form-item">
                <TextField name="description" label="Description" onChange={handleDescription}></TextField>
            </div>
            <div className="form-item">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDateTimePicker
                    label="End date"
                    inputFormat="DD/MM/YYYY HH:mm:ss"
                    value={dayjs.unix(proposalStartTime)}
                    onChange={handleStartDate}
                    renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
            </div>
            <div className="form-item">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDateTimePicker
                    label="End date"
                    inputFormat="DD/MM/YYYY HH:mm:ss"
                    value={dayjs.unix(proposalEndTime)}
                    onChange={handleEndDate}
                    renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
            </div>
            <div className="form-item" style={{textAlign: 'center'}}>
                <Button variant="contained" type="submit" disabled={sending}>
                    Propose to vote
                </Button>
            </div>
        </form>
        <SnackbarAlert open={open} setOpen={setOpen} message={message} severity={severity} />
        </>
    )
}

export default ProposalForm