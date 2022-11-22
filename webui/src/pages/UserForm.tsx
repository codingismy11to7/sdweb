import DeleteIcon from "@mui/icons-material/Delete";
import { Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Container from "@mui/system/Container";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  sendCreateUserRequest,
  setDeleteUserRequest,
  setUserAdminRequest,
  setUserPasswordRequest,
} from "../rpc/backend";

interface Props {
  open: boolean;
  onClose: () => void;
  name: string;
  admin: boolean;
}

const UserForm = ({ open, onClose, name, admin }: Props) => {
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [t] = useTranslation();

  const doCloseForm = useCallback(() => {
    setUsername("");
    setIsAdmin(false);
    setUpdatePassword(true);
    setPassword("");
    setConfirmPass("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    setUsername(name);
    setIsAdmin(admin);
    setUpdatePassword(name === "");
  }, [name, admin]);

  const doCreateUser = useCallback(() => {
    sendCreateUserRequest({ username, password }, _ => {}).then(_ => doCloseForm());
  }, [username, password, doCloseForm]);

  const doAdminUpdate = useCallback(
    (username: string, admin: boolean) => {
      setUserAdminRequest(username, { admin }, () => {}).then(_ => doCloseForm());
    },
    [doCloseForm],
  );

  const doPasswordUpdate = useCallback(
    (username: string, password: string) => {
      setUserPasswordRequest(username, { password }, _ => {}).then(_ => doCloseForm());
    },
    [doCloseForm],
  );

  const enabled = updatePassword && !!password.length && !!confirmPass.length && password === confirmPass;

  return (
    <Dialog onClose={_ => doCloseForm()} open={open}>
      <DialogTitle>{t("admin.addupdate")}</DialogTitle>
      <DialogContent style={{ width: "500px" }}>
        <Container maxWidth={"sm"}>
          <Card variant={"outlined"} sx={{ p: 1 }}>
            <Grid container spacing={2} direction={"column"}>
              <Grid item>
                <TextField
                  autoFocus
                  label={t("common.username")}
                  required
                  value={username}
                  fullWidth
                  disabled={!!name}
                  onChange={e => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  disabled={name === ""}
                  control={
                    <Checkbox
                      checked={isAdmin}
                      onChange={(_, c) => {
                        setIsAdmin(c);
                        if (!!name) {
                          doAdminUpdate(name, c);
                        }
                      }}
                    />
                  }
                  label={t("admin.administrator")}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Checkbox checked={updatePassword} onChange={(_, c) => setUpdatePassword(c)} />}
                  label={t("common.changepw")}
                />
              </Grid>
              {updatePassword ? (
                <>
                  <Grid item>
                    <TextField
                      label={t("common.newpw")}
                      type={"password"}
                      required
                      value={password}
                      fullWidth
                      onChange={e => setPassword(e.target.value)}
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
                </>
              ) : (
                <></>
              )}
            </Grid>
          </Card>
          <Grid container spacing={1} direction={"row"} paddingTop={2}>
            <Grid item xs={9}>
              {!!name ? (
                <Button
                  fullWidth={true}
                  variant="contained"
                  disabled={!enabled}
                  onClick={() => doPasswordUpdate(name, password)}
                >
                  {t("admin.update")}
                </Button>
              ) : (
                <Button fullWidth={true} variant="contained" disabled={!enabled} onClick={() => doCreateUser()}>
                  {t("admin.add")}
                </Button>
              )}
            </Grid>
            <Grid item xs={3}>
              <Button
                disabled={name === ""}
                color="error"
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteUserRequest(name, _ => {}).then(_ => doCloseForm())}
              >
                {t("admin.delete")}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
