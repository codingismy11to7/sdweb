import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { App } from "./App";
import { Api } from "./pages/Api";
import ChangePassword from "./pages/ChangePassword";
import { Search } from "./pages/Search";
import { Search2 } from "./pages/Search2";
import reportWebVitals from "./reportWebVitals";

const Redirect = () => {
  const nav = useNavigate();
  useEffect(() => nav("/sd", { replace: true }), [nav]);
  return <></>;
};
const router = createBrowserRouter([
  { path: "/", element: <App />, children: [{ index: true, element: <Redirect /> }] },
  {
    path: "/sd",
    element: <App />,
    children: [
      { index: true, element: <Search /> },
      { path: "search", element: <Search2 /> },
      { path: "search/:imageId", element: <Search2 /> },
      { path: "api", element: <Api /> },
      { path: "password", element: <ChangePassword /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
