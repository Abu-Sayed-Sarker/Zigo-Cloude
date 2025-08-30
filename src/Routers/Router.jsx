import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../Layouts/Dashboard";
import VideoCallComponent from "../Pages/Test/TestPage";
import App from "../Pages/Test/Test";
import TestHome from "../Pages/Test/TestHome";
import TestHome2 from "../Pages/Test/TestHome2";
import App2 from "../Pages/Test/Test2";

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
        path: "/testHome",
        element: <TestHome2 />,
      },
      {
        path: "/test",
        element: <VideoCallComponent />,
      },
      {
        path: "/room/:roomId",
        element: <App />,
      },
      {
        path: "/roomssss/:roomId",
        element: <App2 />,
      },
    ],
  },
  {
    path: "/register",
    element: <h1>Register</h1>,
  },
]);
