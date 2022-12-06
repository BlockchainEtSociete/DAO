import { Box } from "@mui/material"
import { useEffect, useState } from "react";
import { getRPCErrorMessage } from "../components/Common/error";
import EmployeeCardProfile from "../components/EmployeeCard/EmployeeCardProfile";
import useEthContext from "../hooks/useEthContext";

const EmployeePage = () => {
    const { state: { contract, accounts } } = useEthContext()

    const [tokenId, setTokenId] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const foundTokenId = await contract.methods.getEmployeeCardId(accounts[0]).call({from: accounts[0]})
                setTokenId(foundTokenId)
            }
            catch (e) {
                console.log(getRPCErrorMessage(e));
            }
        })()
    }, [accounts, contract, setTokenId])

    return (
        <Box sx={{margin: '20px'}}>
            <EmployeeCardProfile tokenId={tokenId} />
        </Box>
    )
}

export default EmployeePage