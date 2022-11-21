import React, { useContext } from "react";
import { User } from "./rpc/models";

export type AppContextType = Readonly<{ currentUser: User }>;

export const AppContext = React.createContext<AppContextType>({ currentUser: { username: "", admin: false } });

export const useLoggedInUser = () => useContext(AppContext).currentUser;
export const useIsAdminUser = () => useLoggedInUser().admin;
