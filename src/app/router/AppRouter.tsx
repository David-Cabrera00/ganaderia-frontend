import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import AppLayout from "../../layouts/AppLayout";
import AuthLayout from "../../layouts/AuthLayout";
import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import UsersPage from "../../features/users/pages/UsersPage";
import CreateUserPage from "../../features/users/pages/CreateUserPage";
import EditUserPage from "../../features/users/pages/EditUserPage";
import CowsPage from "../../features/cows/pages/CowsPage";
import CreateCowPage from "../../features/cows/pages/CreateCowPage";
import EditCowPage from "../../features/cows/pages/EditCowPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />

            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/create" element={<CreateUserPage />} />
            <Route path="/users/:id/edit" element={<EditUserPage />} />

            <Route path="/cows" element={<CowsPage />} />
            <Route path="/cows/create" element={<CreateCowPage />} />
            <Route path="/cows/:id/edit" element={<EditCowPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;