import { Box } from "@mui/material";
import ConnectedInfo from "./ConnectedInfo";

const Header = () => {
    return (
        <Box sx={{textAlign: 'right', margin: '20px', clear: 'both'}}>

            <Box sx={{ padding: 0, marginLeft: '10px', float: 'left'}}>
                <img src="/WorkID_logo.png" alt="WorkID" />
                <p>&nbsp;</p>
            </Box>
            <ConnectedInfo />
        </Box>
    )
}

export default Header