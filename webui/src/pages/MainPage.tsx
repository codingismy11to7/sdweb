import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
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
import { lazy, ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { To, NavigateOptions, Outlet, useNavigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Loading } from "../components/Loading";
import { AppContext, useIsAdminUser } from "../context";
import { navigateToLogout } from "../rpc/backend";
import { User } from "../rpc/models";
import { useIsDesktop } from "../util/hooks";
import { Api } from "./Api";
import ChangePassword from "./ChangePassword";
import { Search } from "./Search";

const Administration = lazy(() => import("./Administration"));

const drawerWidth = 240;

const Redirect = () => {
  const nav = useNavigate();
  useEffect(() => nav("/sd/search", { replace: true }), [nav]);
  return <></>;
};
const createRouter = (admin: boolean) =>
  createBrowserRouter([
    { path: "/", element: <MainPage />, children: [{ index: true, element: <Redirect /> }] },
    {
      path: "/sd",
      element: <MainPage />,
      children: [
        { index: true, element: <Redirect /> },
        { path: "search", element: <Search /> },
        { path: "search/:imageId", element: <Search /> },
        { path: "api", element: <Api /> },
        { path: "password", element: <ChangePassword /> },
      ].concat(admin ? [{ path: "administration/*", element: <Administration /> }] : []),
    },
  ]);

type Props = Readonly<{ user: User }>;

export const MainPageWithContext = ({ user }: Props) => {
  const isAdmin = user.admin;
  const router = useMemo(() => createRouter(isAdmin), [isAdmin]);

  return (
    <AppContext.Provider value={{ currentUser: user }}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
};

const MainPage = () => {
  const isAdminUser = useIsAdminUser();
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
            {isAdminUser ? navItem(t("admin.administration"), "administration", <AdminPanelSettingsIcon />) : <></>}
          </List>
          <Divider />
          <List>{menuItem(t("common.logout"), navigateToLogout, <LogoutIcon />)}</List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: isDesktop ? 3 : 0, width: "100%" }}>
        <Toolbar />
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};
