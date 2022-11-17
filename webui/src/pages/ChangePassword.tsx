import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import { useCallback, useState } from "react";
import { BackendUrl } from "../consts";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface ChangePassResponse {
  error: string;
}

const ChangePassword = () => {
  const theme = useTheme();
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");

  const enabled = !!newPass.length && !!confirmPass.length && newPass === confirmPass;

  const doChange = useCallback(() => {
    setCurrPass("")
    setNewPass("")
    setConfirmPass("")
    setPassError("")
    if (enabled) {
      fetch(`${BackendUrl}/api/changepw`, {
        method: "POST",
        body: JSON.stringify({ currentpass: currPass, newpass: newPass }),
        credentials: "include",
      })
        .then(res => res.json())
        .then((res: ChangePassResponse) => {
          if (res.error) setPassError(res.error)
        })
    }
  }, [enabled, newPass, currPass, passError]);

  return (
    <Container maxWidth={"sm"}>
      <Card variant={"outlined"} style={{ padding: theme.spacing() }}>
        <Grid container spacing={2} direction={"column"}>
          <Grid item>
            <TextField
              autoFocus
              label={"Current Password"}
              name={"currpassword"}
              type={"password"}
              required
              value={currPass}
              fullWidth
              error={passError.length > 0}
              helperText={passError}
              onChange={e => setCurrPass(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              autoFocus
              label={"New Password"}
              name={"newpassword"}
              type={"password"}
              required
              value={newPass}
              fullWidth
              onChange={e => setNewPass(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              autoFocus
              label={"Confirm Password"}
              name={"confirmpassword"}
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
    </Container>
  );
};

export default ChangePassword;