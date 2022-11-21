import { CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, Link } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { useCallback, useRef, useState } from "react";
import { Key } from "ts-key-enum";
import { LoginUrl } from "./rpc/backend";

const Login = () => {
  const theme = useTheme();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [dialogText, setDialogText] = useState("");

  const enabled = !!userName.length && !!password.length;

  const doLogin = useCallback(() => {
    if (enabled && formRef.current) formRef.current.submit();
  }, [enabled]);

  return (
    <Container maxWidth="sm">
      <Dialog open={!!dialogText} onClose={() => setDialogText("")}>
        <DialogContent>
          <DialogContentText>{dialogText} Contact me.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogText("")}>Close</Button>
        </DialogActions>
      </Dialog>
      <Card variant="outlined" style={{ padding: theme.spacing() }}>
        <CardHeader title="Login" />
        <CardContent component="form" method="post" action={LoginUrl} ref={formRef}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <TextField
                autoFocus
                label="Username"
                name="username"
                required
                value={userName}
                fullWidth
                onChange={e => setUserName(e.target.value)}
              />
            </Grid>
            <Grid item>
              <TextField
                type={"password"}
                name="password"
                label="Password"
                required
                value={password}
                fullWidth
                onKeyUp={e => {
                  if (e.key === Key.Enter) doLogin();
                }}
                onChange={e => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Button fullWidth={true} variant="contained" onClick={doLogin} disabled={!enabled}>
                Login
              </Button>
            </Grid>
          </Grid>
        </CardContent>
        <CardContent>
          <Grid item>
            <Grid container spacing={1} style={{ textAlign: "center" }}>
              <Grid item xs={6}>
                <Link component="button" variant="body2" onClick={() => setDialogText("That sucks.")}>
                  Forgot Password
                </Link>
              </Grid>
              <Grid item xs={6}>
                <Link component="button" variant="body2" onClick={() => setDialogText("You can't.")}>
                  Create Account
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};
export default Login;
