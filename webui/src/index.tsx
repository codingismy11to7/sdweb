import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { App } from "./App";
import { Api } from "./pages/Api";
import { Lorem } from "./pages/Lorem";
import { Search } from "./pages/Search";
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
      { path: "api", element: <Api /> },
      { path: "lorem", element: <Lorem /> },
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
