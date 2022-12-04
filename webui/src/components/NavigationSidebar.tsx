import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ApiIcon from "@mui/icons-material/Api";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import PreviewIcon from "@mui/icons-material/Preview";
import SearchIcon from "@mui/icons-material/Search";
import { Drawer } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { FC, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useIsAdminUser } from "../context";
import { navigateToLogout } from "../rpc/backend";
import { Navigator, useNavigator } from "../util/navigation";

const drawerWidth = 240;

const menuItem = (label: string, onClick: () => void, icon: ReactNode) => (
  <ListItem key={label} disablePadding onClick={onClick}>
    <ListItemButton>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  </ListItem>
);

type Props = Readonly<{ drawerOpen: boolean; onClose: () => void }>;

export const NavigationSidebar: FC<Props> = ({ drawerOpen, onClose }) => {
  const [t] = useTranslation();
  const isAdminUser = useIsAdminUser();

  const nav = useNavigator();
  const navigate = useCallback(
    (f: (n: Navigator) => void) => {
      onClose();
      f(nav);
    },
    [nav, onClose],
  );

  const navItem = useCallback(
    (label: string, navTo: (n: Navigator) => void, icon: ReactNode) => menuItem(label, () => navigate(navTo), icon),
    [navigate],
  );

  return (
    <Drawer
      open={drawerOpen}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {navItem(t("common.search"), n => n.toSearch(), <SearchIcon />)}
          {navItem(t("common.api"), n => n.toApiDocs(), <ApiIcon />)}
        </List>
        <Divider />
        <List>
          {navItem(t("common.changepw"), n => n.toChangePw(), <KeyIcon />)}
          {isAdminUser ? navItem(t("admin.administration"), n => n.toAdmin(), <AdminPanelSettingsIcon />) : <></>}
          {isAdminUser ? navItem(t("admin.requests"), n => n.toRequests(), <PreviewIcon />) : <></>}
        </List>
        <Divider />
        <List>{menuItem(t("common.logout"), navigateToLogout, <LogoutIcon />)}</List>
      </Box>
    </Drawer>
  );
};
