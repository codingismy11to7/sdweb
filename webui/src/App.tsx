import { createTheme } from "@mui/material";
import ThemeProvider from "@mui/system/ThemeProvider";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Loading } from "./components/Loading";
import i18n from "./i18n/i18n";
import Login from "./pages/Login";
import { MainPageWithContext } from "./pages/MainPage";
import { checkIsLoggedIn } from "./rpc/backend";
import { LoggedInResponse } from "./rpc/models";
import { fold, isUndefined } from "./util/undefOr";

const theme = createTheme();

export const App = () => {
  const [loggedIn, setLoggedIn] = useState<LoggedInResponse>();
  const loggedInUser = loggedIn?.user;

  useEffect(() => {
    checkIsLoggedIn().then(li => setLoggedIn(li));
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        {isUndefined(loggedIn) ? (
          <Loading />
        ) : (
          fold(
            loggedInUser,
            () => <Login />,
            user => <MainPageWithContext user={user} />,
          )
        )}
      </ThemeProvider>
    </I18nextProvider>
  );
};
