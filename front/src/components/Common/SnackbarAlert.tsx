import { Alert, AlertColor, Snackbar } from "@mui/material";

interface SnackbarAlertProps {
    open: boolean,
    setOpen: Function,
    message: string,
    severity: AlertColor | undefined;
}

const SnackbarAlert = ({open, setOpen, message, severity}: SnackbarAlertProps) => {
    const handleClose = (event :any, reason: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <Snackbar
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            open={open}
            onClose={handleClose}
            autoHideDuration={6000}>
            <Alert severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    )
}

export default SnackbarAlert;