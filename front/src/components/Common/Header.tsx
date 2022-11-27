import { Box } from "@mui/material";
import ConnectedInfo from "./ConnectedInfo";

const Header = () => {
    return (
        <Box sx={{textAlign: 'right', margin: '20px'}}>
            <ConnectedInfo />
        </Box>
    )
}

export default Header