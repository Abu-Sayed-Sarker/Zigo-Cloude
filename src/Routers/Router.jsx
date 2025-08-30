import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../Layouts/Dashboard";
import Room from "../Pages/Room Page/Room";
import VideoCallComponent from "../Pages/Test/TestPage";
import App from "../Pages/Test/Test";
import TestHome from "../Pages/Test/TestHome";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    errorElement: <h1>404</h1>,
    children: [
      {
        path: "/",
        element: <TestHome />,
      },
      {
        path: "/room/:roomId",
        element: <App />,
      },
      {
        path: "/room/:roomId",
        element: <Room />,
      },
    ],
  },
  {
    path: "/register",
    element: <h1>Register</h1>,
  },
]);
