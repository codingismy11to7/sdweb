import { Button, Container } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";
import UserForm from "../components/UserForm";
import { User, UsersResponse } from "../rpc/models";
import { map } from "../util/undefOr";

const columns: Array<GridColDef<User, User>> = [
  { field: "username", headerName: "User", width: 150 },
  { field: "admin", headerName: "Is Admin", width: 150, type: "boolean" },
];

const Administration = () => {
  const users = useLoaderData() as UsersResponse;
  const [t] = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string>();

  const handleAddUser = () => {
    setEditingUsername(undefined);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setEditingUsername(undefined);
    setModalOpen(false);
  }, []);

  const editingUser = useMemo(
    () => map(editingUsername, username => users?.find(u => u.username === username)),
    [editingUsername, users],
  );

  return (
    <Container maxWidth="sm" style={{ height: 375, marginTop: "5px" }}>
      <Button size="small" onClick={handleAddUser} variant="contained">
        {t("admin.adduser")}
      </Button>
      <DataGrid<User>
        style={{ marginTop: "5px" }}
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
