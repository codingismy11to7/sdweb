import DeleteIcon from "@mui/icons-material/Delete";
import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Container from "@mui/system/Container";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  sendCreateUserRequest,
  sendDeleteUserRequest,
  setUserAdminRequest,
  setUserPasswordRequest,
} from "../rpc/backend";
import { User } from "../rpc/models";
import { foreach, isDefined } from "../util/undefOr";

interface Props {
  open: boolean;
  onClose: () => void;
  editingUser?: User;
}

const UserForm = ({ open, onClose, editingUser }: Props) => {
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [changingAdmin, setChangingAdmin] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [t] = useTranslation();

  const doCloseForm = useCallback(() => {
    setUsername("");
    setIsAdmin(false);
    setChangingAdmin(false);
    setUpdatePassword(false);
    setPassword("");
    setConfirmPass("");
    setConfirmingDelete(false);
    onClose();
  }, [onClose]);

  const editMode = isDefined(editingUser);
  const existingName = editingUser?.username;
  const existingIsAdmin = editingUser?.admin;
  useEffect(() => {
    foreach(existingName, setUsername);
    foreach(existingIsAdmin, setIsAdmin);
  }, [existingIsAdmin, existingName]);

  const doCreateUser = useCallback(() => {
    sendCreateUserRequest({ username, password }, () => {}).then(() => doCloseForm());
  }, [username, password, doCloseForm]);

  const doAdminUpdate = useCallback(
    (admin: boolean) => {
      foreach(existingName, username => {
        setChangingAdmin(true);
        setUserAdminRequest(username, { admin }, () => {})
          .then(() => setIsAdmin(admin))
          .finally(() => setChangingAdmin(false));
      });
    },
    [existingName],
  );

  const doPasswordUpdate = useCallback(
    (password: string) => {
      foreach(existingName, username => {
        setUserPasswordRequest(username, { password }, () => {}).then(() => doCloseForm());
      });
    },
    [doCloseForm, existingName],
  );

  const confirmDelete = useCallback(() => setConfirmingDelete(true), []);

  const doDelete = useCallback(() => {
    foreach(existingName, username => sendDeleteUserRequest(username, () => {}).then(() => doCloseForm()));
  }, [doCloseForm, existingName]);

  const enabled =
    (updatePassword || !editMode) && !!password.length && !!confirmPass.length && password === confirmPass;

  return (
    <Dialog onClose={doCloseForm} open={open} fullWidth>
      <DialogTitle>{t("admin.addupdate")}</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Container maxWidth={"md"}>
          <Card variant={"outlined"} sx={{ p: 1 }}>
            <Grid container spacing={2} direction={"column"}>
              <Grid item>
                <TextField
                  autoFocus
                  label={t("common.username")}
                  required
                  value={username}
                  fullWidth
                  disabled={editMode}
                  onChange={e => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  disabled={!editMode || changingAdmin}
                  control={<Checkbox checked={isAdmin} onChange={(_, c) => doAdminUpdate(c)} />}
                  label={t("admin.administrator")}
                />
              </Grid>
              {editMode ? (
                <Grid item>
                  <FormControlLabel
                    control={<Checkbox checked={updatePassword} onChange={(_, c) => setUpdatePassword(c)} />}
                    label={t("common.changepw")}
                  />
                </Grid>
              ) : (
                <></>
              )}
              {updatePassword || !editMode ? (
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
                      error={password !== confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                    />
                  </Grid>
                </>
              ) : (
                <></>
              )}
            </Grid>
          </Card>
        </Container>
      </DialogContent>
      <DialogActions>
        <Grid container spacing={1} direction={"row"} paddingTop={2}>
          <Grid item style={{ flexGrow: 1 }}>
            {editMode ? (
              <Button
                fullWidth={true}
                variant="contained"
                disabled={!enabled}
                onClick={() => doPasswordUpdate(password)}
              >
                {t("admin.update")}
              </Button>
            ) : (
              <Button fullWidth={true} variant="contained" disabled={!enabled} onClick={() => doCreateUser()}>
                {t("admin.add")}
              </Button>
            )}
          </Grid>
          <Grid item>
            <Button
              disabled={!editMode}
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={confirmDelete}
            >
              {t("admin.delete")}
            </Button>
          </Grid>
        </Grid>
        <Dialog open={confirmingDelete && editMode} onClose={() => setConfirmingDelete(false)}>
          <DialogContent>{t("admin.confirmdelete", editingUser)}</DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmingDelete(false)}>{t("common.cancel")}</Button>
            <Button onClick={doDelete}>{t("common.ok")}</Button>
          </DialogActions>
        </Dialog>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
