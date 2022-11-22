import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import { Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from "react-router-dom";
import { Loading } from "../components/Loading";
import { NavigationSidebar } from "../components/NavigationSidebar";
import { AppContext } from "../context";
import { User } from "../rpc/models";
import { useIsDesktop } from "../util/hooks";
import { Api } from "./Api";
import ChangePassword from "./ChangePassword";
import { Search } from "./Search";

const Administration = lazy(() => import("./Administration"));

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
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [t] = useTranslation();

  const toggleDrawer = useCallback(() => setDrawerOpen(o => !o), []);

  const onDrawerClose = useCallback(() => setDrawerOpen(false), []);

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
      <NavigationSidebar drawerOpen={drawerOpen} onClose={onDrawerClose} />
      <Box component="main" sx={{ flexGrow: 1, p: isDesktop ? 3 : 0, width: "100%" }}>
        <Toolbar />
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};
