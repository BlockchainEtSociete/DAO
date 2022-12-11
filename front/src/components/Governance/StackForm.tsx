import { AlertColor, Button, FormLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, TextField } from "@mui/material"
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import { getRPCErrorMessage } from "../Common/error";
import SnackbarAlert from "../Common/SnackbarAlert";

interface StackFormProps {
    setWIDBalance: Function,
    setSWIDBalance: Function,
}

const StackForm = ({setWIDBalance, setSWIDBalance}: StackFormProps) => {
    const { state: { governanceContract, widContract, accounts, web3 } } = useEthContext()

    const [widBalance, setWidBalance] = useState(0)
    const [stacking, setStacking] = useState(false)
    const [stackAmount, setStackAmount] = useState(0)
    const [stackDuration, setStackDuration] = useState(0)

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')

    useEffect(() => {
        (async () => {
            const balance = await widContract.methods.balanceOf(accounts[0]).call({from: accounts[0]})
            setWidBalance(web3.utils.fromWei(balance))
        })()
    }, [accounts, web3, widContract])

    const handleStacking = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStacking(true)
        try {
            const swidContractAddress = await governanceContract.methods.getStackingContractAddress().call({from: accounts[0]})

            if (swidContractAddress) {
                const approved = await widContract.methods.approve(swidContractAddress, web3.utils.toWei(`${stackAmount}`)).send({from: accounts[0]})

                if (approved) {
                    await governanceContract.methods.stackWID(stackDuration, web3.utils.toWei(`${stackAmount}`)).send({from: accounts[0]})

                    const balance = await widContract.methods.balanceOf(accounts[0]).call({from: accounts[0]})
                    setWIDBalance(web3.utils.fromWei(web3.utils.BN(balance)))
        
                    const swidBalance = await governanceContract.methods.getVotingPower().call({from: accounts[0]})
                    setSWIDBalance(web3.utils.fromWei(web3.utils.BN(swidBalance)))

                    setMessage('Sucessfully stacked your WID')
                    setSeverity('success')
                    setOpen(true)
                }
            }
        } catch (e) {
            console.log(e)
            setMessage(getRPCErrorMessage(e))
            setSeverity('error')
            setOpen(true)
        }
        setStacking(false)
    }

    const handleStackAmount = (e: any) => {
        setStackAmount(e.target.value);
    }

    const handleDuration = (event: SelectChangeEvent<number>) => {
        setStackDuration(event.target.value as number);
    }

    return (
        <>
        {widBalance <= 0 && <p>You need to get WID tokens to be able to stack</p>}
        {widBalance > 0 &&
            <form method="post" id="stackingForm" encType="multipart/form-data" onSubmit={handleStacking}>            
                <div className="form-item">
                    <FormLabel id="vote-label">Amount of WID to stack</FormLabel>
                    <Slider 
                        defaultValue={stackAmount} 
                        step={1} 
                        min={1} 
                        max={widBalance}
                        onChange={handleStackAmount} 
                        valueLabelDisplay="on"
                        marks
                    />
                </div>
                
                <div className="form-item">
                    <InputLabel id="duration-label">Stacking duration</InputLabel>
                    <Select fullWidth={true} name="contract_type" labelId="duration-label" onChange={handleDuration}>
                        <MenuItem value={'15768000'}>6 months</MenuItem>
                        <MenuItem value={'31536000'}>1 year</MenuItem>
                        <MenuItem value={'94608000'}>3 years</MenuItem>
                        <MenuItem value={'157680000'}>5 years</MenuItem>
                    </Select>
                </div>
                <div className="form-item" style={{textAlign: 'center'}}>
                    <Button variant="contained" type="submit" disabled={stacking}>
                        Stack WID
                    </Button>
                </div>
            </form>
        }
        <SnackbarAlert open={open} setOpen={setOpen} message={message} severity={severity} />
        </>
    )
}

export default StackForm