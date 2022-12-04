import { Box } from "@mui/material"
import { useEffect, useState } from "react";
import EmployeeCardDisplay from "../components/EmployeeCard/EmployeeCardDisplay";
import EmployeeVacancyRights from "../components/EmployeeCard/EmployeeVacancyRights"
import useEthContext from "../hooks/useEthContext";

const EmployeePage = () => {
    const { state: { contract, accounts } } = useEthContext()

    const [tokenId, setTokenId] = useState('');

    useEffect(() => {
        (async () => {
            const foundTokenId = await contract.methods.getEmployeeCardId(accounts[0]).call({from: accounts[0]})
            setTokenId(foundTokenId)
        })()
    }, [accounts, contract, setTokenId])

    return (
        <Box sx={{margin: '20px'}}>
            {tokenId && <EmployeeCardDisplay tokenId={tokenId} /> }
            <EmployeeVacancyRights />
        </Box>
    )
}

export default EmployeePage