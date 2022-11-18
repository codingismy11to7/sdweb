import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useState } from "react";
import { sendChangePasswordRequest } from "../backend";
import { Alert, IconButton, Snackbar } from "@mui/material";
import { BackendUrl } from "../consts";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  const enabled = !!newPassword.length && !!confirmPass.length && newPassword === confirmPass;

  const logoutAction = (
    <>
      <Button color="secondary" size="small" onClick={() => document.location.assign(`${BackendUrl}/logout`)}>
        LOGOUT
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={() => setAlertOpen(false)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  const doChange = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPass("");
    setPassError("");
    if (enabled) {
      sendChangePasswordRequest(
        { currentPassword, newPassword },
        res => {
          if (res.error) setPassError(res.error);
          else
            setAlertOpen(true);
        },
        res => setPassError(`Server error: ${res.statusText}`),
      );
    }
  }, [enabled, currentPassword, newPassword]);

  return (
    <Container maxWidth={"sm"}>
      <Card variant={"outlined"} sx={{ p: 1 }}>
        <Grid container spacing={2} direction={"column"}>
          <Grid item>
            <TextField
              autoFocus
              label={"Current Password"}
              type={"password"}
              required
              value={currentPassword}
              fullWidth
              error={passError.length > 0}
              helperText={passError}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              label={"New Password"}
              type={"password"}
              required
              value={newPassword}
              fullWidth
              onChange={e => setNewPassword(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              label={"Confirm Password"}
              type={"password"}
              required
              value={confirmPass}
              fullWidth
              onChange={e => setConfirmPass(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button fullWidth={true} variant="contained" onClick={doChange} disabled={!enabled}>
              Change
            </Button>
          </Grid>
        </Grid>
      </Card>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert severity="success" action={logoutAction}>Password Changed!</Alert>
      </Snackbar>
    </Container>
  );
};

export default ChangePassword;
