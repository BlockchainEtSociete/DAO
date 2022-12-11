import { Box, Chip } from "@mui/material";
import { useState, useEffect } from "react";
import useEthContext from "../../hooks/useEthContext";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import HubIcon from '@mui/icons-material/Hub';
import TransactionDisplay from "./TransactionDisplay";
  
const ConnectedInfo = () => {
    const { state: { accounts, networkID } } = useEthContext()
    const [connectedUser, setConnectedUser] = useState('')
    const [connectedNetwork, setConnectedNetwork] = useState('')

    useEffect(() => {
        setConnectedUser(accounts[0])
        setConnectedNetwork('' + networkID)
    }, [setConnectedNetwork, connectedNetwork, setConnectedUser, connectedUser, accounts, networkID])

    return (
        <Box sx={{float: 'right'}}>
            <div style={{float: 'left'}}>
                <Chip icon={<AlternateEmailIcon />} variant="outlined" label={connectedUser} />&nbsp;
                <Chip icon={<HubIcon />} variant="outlined" label={connectedNetwork} />
            </div>
            <div style={{float: 'right'}}>
                <TransactionDisplay />
            </div>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
        </Box>
    );
};
  
export default ConnectedInfo;