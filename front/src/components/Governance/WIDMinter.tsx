import { AlertColor, Button, TextField } from "@mui/material";
import { ChangeEvent, FormEvent, useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import { getRPCErrorMessage } from "../Common/error";
import SnackbarAlert from "../Common/SnackbarAlert";

interface WIDMinterProps {
    setWIDBalance: Function,
}

const WIDMinter = ({setWIDBalance}: WIDMinterProps) => {
    const { state: { widContract, accounts, widOwner, web3 } } = useEthContext()

    const [minting, setMinting] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [mintingAmount, setMintingAmount] = useState(0);

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')

    const handleAmount = (e: ChangeEvent<HTMLInputElement>) => {
        setMintingAmount(+e.target.value);
    } 

    const handleRecipient = (e: ChangeEvent<HTMLInputElement>) => {
        setRecipient(e.target.value);
    } 

    const handleMintWID = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setOpen(false)
        setMinting(true)

        try {
            console.log(web3.utils.toWei(`${mintingAmount}`))
            await widContract.methods.mint(recipient, web3.utils.toWei(`${mintingAmount}`)).send({from: accounts[0]})
            
            const balance = await widContract.methods.balanceOf(accounts[0]).call({from: accounts[0]})
            setWIDBalance(web3.utils.fromWei(web3.utils.BN(balance)))

            setMessage(`Minted ${mintingAmount} WID to ${recipient}`)
            setSeverity('success')
            setOpen(true)
            setMinting(false)
        }        
        catch (e) {
            console.log(e)
            setMessage(getRPCErrorMessage(e))
            setSeverity('error')
            setOpen(true)
            setMinting(false)
        }

    }

    return (
        <>
        {accounts[0] === widOwner &&
            <>
            <form method="post" id="mintForm" encType="multipart/form-data" onSubmit={handleMintWID}>            
                <div className="form-item">
                    <TextField fullWidth={true} name="ethaddress" label="Employee Ethereum wallet address" onChange={handleRecipient}></TextField>
                </div>
                <div className="form-item">
                    <TextField fullWidth={true} name="amountwid" label="Amount of WID" onChange={handleAmount}></TextField>
                </div>
                <div className="form-item" style={{textAlign: 'center'}}>
                    <Button variant="contained" type="submit" disabled={minting}>
                        Mint WID
                    </Button>
                </div>
            </form>
            </>
        }
        <SnackbarAlert open={open} setOpen={setOpen} message={message} severity={severity} />
        </>
    )

}

export default WIDMinter;