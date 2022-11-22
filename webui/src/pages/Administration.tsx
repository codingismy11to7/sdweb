import { Box, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { fetchUsers } from "../rpc/backend";
import { UsersResponse } from "../rpc/models";
import UserForm from "./UserForm";

const columns: GridColDef[] = [
  { field: "username", headerName: "User", width: 150 },
  { field: "admin", headerName: "Is Admin", width: 150, type: "boolean" },
];

const Administration = () => {
  const [notFetched, setNotFetched] = useState(true);
  const [users, setUsers] = useState<UsersResponse>();
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [admin, setAdmin] = useState(false);

  const doUserFetch = () => {
    fetchUsers(
      res => setUsers(res),
      err => console.error(err),
    )
      .then(() => setNotFetched(false))
      .then(() => setModalOpen(false));
  };

  useEffect(() => {
    if (notFetched) {
      doUserFetch();
    }
  }, [users, notFetched]);

  const handleAddUser = () => {
    setUsername("");
    setAdmin(false);
    setModalOpen(true);
  };

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <Button size="small" onClick={handleAddUser}>
        Add a user
      </Button>
      <DataGrid
        getRowId={r => r.username}
        rows={users ?? []}
        onRowClick={r => {
          setUsername(r.row.username as string);
          setAdmin(r.row.admin as boolean);
          setModalOpen(true);
        }}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
      />
      <UserForm open={modalOpen} onClose={() => doUserFetch()} name={username} admin={admin} />
    </Box>
  );
};

export default Administration;
