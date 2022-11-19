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
import { To, NavigateOptions, Outlet, useNavigate } from "react-router-dom";
import { navigateToLogout } from "./backend";

const drawerWidth = 240;

export const MainPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

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
            Stable Diffusion
          </Typography>
          <Tooltip title="GitHub Repository">
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
            {navItem("Search", "/", <SearchIcon />)}
            {navItem("New Search", "search", <SearchIcon />)}
            {navItem("API", "api", <ApiIcon />)}
          </List>
          <Divider />
          <List>
            {navItem("Change Password", "password", <KeyIcon />)}
            {menuItem("Logout", navigateToLogout, <LogoutIcon />)}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
