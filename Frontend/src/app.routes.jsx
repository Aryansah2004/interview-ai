import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import Reports from "./features/interview/pages/Reports";  
import Progress from "./features/interview/pages/Progress";
import ForgotPassword from "./features/auth/pages/ForgotPassword";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/home",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "/reports",
        element: <Protected><Reports /></Protected>
    },
    {
        path: "/progress",
        element: <Protected><Progress /></Protected>
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword/>
    }
])
