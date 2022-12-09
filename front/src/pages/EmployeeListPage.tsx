import { Box } from "@mui/material"
import EmployeeCardList from "../components/EmployeeCard/EmployeeCardsList"

const EmployeeListPage = () => {

    return (
        <Box sx={{margin: '20px'}}>
            <EmployeeCardList />
        </Box>
    )
}

export default EmployeeListPage