import { createTheme } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import Container from "@mui/system/Container";
import ThemeProvider from "@mui/system/ThemeProvider";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n";
import Login from "./Login";
import { MainPage } from "./MainPage";
import { checkIsLoggedIn } from "./rpc/backend";

const theme = createTheme();

const Loading = () => (
  <Container maxWidth="sm">
    <Skeleton variant="rounded" animation="wave" height={"400px"} />
  </Container>
);

export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>();

  useEffect(() => {
    checkIsLoggedIn().then(li => setIsLoggedIn(li.loggedIn));
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <div>{isLoggedIn === undefined ? <Loading /> : isLoggedIn ? <MainPage /> : <Login />}</div>
      </ThemeProvider>
    </I18nextProvider>
  );
};
