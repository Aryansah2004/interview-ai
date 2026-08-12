import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import Protected from "./features/auth/components/Protected";

const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const Home = lazy(() => import("./features/interview/pages/Home"));
const Interview = lazy(() => import("./features/interview/pages/interview"));
const Reports = lazy(() => import("./features/interview/pages/Reports"));
const Progress = lazy(() => import("./features/interview/pages/Progress"));
const ForgotPassword = lazy(() => import("./features/auth/pages/ForgotPassword"));

const withSuspense = (element) => (
    <Suspense fallback={<div>Loading...</div>}>
        {element}
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: "/login",
        element: withSuspense(<Login/>)
    },
    {
        path: "/register",
        element: withSuspense(<Register/>)
    },
    {
        path: "/",
        element: withSuspense(<Protected><Home /></Protected>)
    },
    {
        path: "/home",
        element: withSuspense(<Protected><Home /></Protected>)
    },
    {
        path: "/interview/:interviewId",
        element: withSuspense(<Protected><Interview /></Protected>)
    },
    {
        path: "/reports",
        element: withSuspense(<Protected><Reports /></Protected>)
    },
    {
        path: "/progress",
        element: withSuspense(<Protected><Progress /></Protected>)
    },
    {
        path: "/forgot-password",
        element: withSuspense(<ForgotPassword/>)
    }
])
