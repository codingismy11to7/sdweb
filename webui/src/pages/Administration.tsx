import { Button, Container } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import UserForm from "../components/UserForm";
import { fetchUsers } from "../rpc/backend";
import { User, UsersResponse } from "../rpc/models";
import { map } from "../util/undefOr";

const columns: Array<GridColDef<User, User>> = [
  { field: "username", headerName: "User", width: 150 },
  { field: "admin", headerName: "Is Admin", width: 150, type: "boolean" },
];

const Administration = () => {
  const [notFetched, setNotFetched] = useState(true);
  const [users, setUsers] = useState<UsersResponse>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string>();

  const doUserFetch = useCallback(() => {
    fetchUsers(
      res => setUsers(res),
      err => console.error(err),
    ).then(() => setNotFetched(false));
  }, []);

  useEffect(() => {
    if (notFetched) {
      doUserFetch();
    }
  }, [doUserFetch, notFetched]);

  const handleAddUser = () => {
    setEditingUsername(undefined);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setEditingUsername(undefined);
    setModalOpen(false);
    doUserFetch();
  }, [doUserFetch]);

  const editingUser = useMemo(
    () => map(editingUsername, username => users?.find(u => u.username === username)),
    [editingUsername, users],
  );

  return (
    <Container maxWidth="sm" style={{ height: 375 }}>
      <Button size="small" onClick={handleAddUser} variant="contained">
        Add a user
      </Button>
      <DataGrid<User>
        getRowId={r => r.username}
        rows={users ?? []}
        onRowClick={r => {
          setEditingUsername(r.row.username as string);
          setModalOpen(true);
        }}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
      />
      <UserForm open={modalOpen} onClose={closeModal} editingUser={editingUser} />
    </Container>
  );
};

export default Administration;
