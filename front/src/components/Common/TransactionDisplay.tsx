import { Box, CircularProgress, Link } from "@mui/material";
import { useEffect, useState } from "react";
import useEthContext from "../../hooks/useEthContext";

const TransactionDisplay = () => {
    const { state: { networkID, transactionHash } } = useEthContext()
    const [explorerUrl, setExplorerUrl] = useState('')

    let baseUrl = ''
    switch(networkID) {
        case 5:
            baseUrl = 'https://goerli.etherscan.io/tx/'
            break;

        default:
            break;
    }

    useEffect(() => {
        if (transactionHash) {
            setExplorerUrl(baseUrl + transactionHash)
        }
        else {
            setExplorerUrl('')
        }

        console.log(explorerUrl)
    }, [transactionHash, explorerUrl, baseUrl])

    return (
        <Box sx={{textAlign: 'right'}}>
        {explorerUrl && <span><CircularProgress />&nbsp;<Link href={explorerUrl} target="_blank" rel="noopener">See on EtherScan</Link></span>}
        </Box>
    )
}

export default TransactionDisplay