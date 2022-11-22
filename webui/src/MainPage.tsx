import ApiIcon from "@mui/icons-material/Api";
import GitHubIcon from "@mui/icons-material/GitHub";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ReactNode, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { To, NavigateOptions, Outlet, useNavigate } from "react-router-dom";
import { AppContext } from "./context";
import { navigateToLogout } from "./rpc/backend";
import { User } from "./rpc/models";
import { useIsDesktop } from "./util/hooks";

const drawerWidth = 240;

type Props = Readonly<{ user: User }>;

export const MainPageWithContext = ({ user }: Props) => (
  <AppContext.Provider value={{ currentUser: user }}>
    <MainPage />
  </AppContext.Provider>
);

const MainPage = () => {
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [t] = useTranslation();

  const toggleDrawer = useCallback(() => setDrawerOpen(o => !o), []);

  const nav = useNavigate();
  const navigate = useCallback(
    (to: To, opts?: NavigateOptions) => {
      setDrawerOpen(false);
      nav(to, opts);
    },
    [nav],
  );

  const menuItem = (label: string, onClick: () => void, icon: ReactNode) => (
    <ListItem key={label} disablePadding onClick={onClick}>
      <ListItemButton>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );

  const navItem = (label: string, navTo: string, icon: ReactNode) => menuItem(label, () => navigate(navTo), icon);

  const loadGithub = () => window.open("https://github.com/codingismy11to7/sdweb", "_blank");

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t("common.title")}
          </Typography>
          <Tooltip title={t("common.github")}>
            <IconButton color="inherit" onClick={loadGithub}>
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {navItem(t("common.search"), "/", <SearchIcon />)}
            {navItem(t("common.api"), "api", <ApiIcon />)}
          </List>
          <Divider />
          <List>
            {navItem(t("common.changepw"), "password", <KeyIcon />)}
            {menuItem(t("common.logout"), navigateToLogout, <LogoutIcon />)}
            {navItem(t("admin.administration"), "administration", <KeyIcon />)}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: isDesktop ? 3 : 0, width: "100%" }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
