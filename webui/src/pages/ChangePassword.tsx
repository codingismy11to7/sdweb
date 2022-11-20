import { Alert, Snackbar } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { navigateToLogout, sendChangePasswordRequest } from "../rpc/backend";

const logoutAction = (label: string) => (
  <Button color="secondary" size="small" onClick={navigateToLogout}>
    {label}
  </Button>
);

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [t] = useTranslation();

  const enabled = !!newPassword.length && !!confirmPass.length && newPassword === confirmPass;

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
          else setAlertOpen(true);
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
              label={t("common.currentpw")}
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
              label={t("common.newpw")}
              type={"password"}
              required
              value={newPassword}
              fullWidth
              onChange={e => setNewPassword(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              label={t("common.confirmpw")}
              type={"password"}
              required
              value={confirmPass}
              fullWidth
              onChange={e => setConfirmPass(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button fullWidth={true} variant="contained" onClick={doChange} disabled={!enabled}>
              {t("common.changepw")}
            </Button>
          </Grid>
        </Grid>
      </Card>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <Alert severity="success" action={logoutAction(t("common.logout"))}>
          {t("common.pwchanged")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChangePassword;
