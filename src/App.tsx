import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import InvitePage from "./pages/InvitePage";
import WelcomePage from "./pages/WelcomePage";
import ComponentsShowcasePage from "./pages/ComponentsShowcasePage";

import DashboardHomePage from "./pages/dashboard/Dashboard";
import { SalesPage, BrokersPage, AiMapPage } from "./pages/workspace";
import {
  TeamPage,
  RolesSettingsPage,
  OrganizationSettingsPage,
  BillingPage,
  BotIntegrationsPage,
} from "./pages/settings";

import ProjectsListPage from "./pages/projects/ProjectsListPage";
import ProjectHomePage from "./pages/projects/ProjectHomePage";
import ProjectTasksPage from "./pages/projects/ProjectTasksPage";
import ProjectFilesPage from "./pages/projects/ProjectFilesPage";
import ProjectBudgetPage from "./pages/projects/ProjectBudgetPage";
import ProjectRfisPage from "./pages/projects/ProjectRfisPage";

/** Authenticated app shell: each feature has its own top-level path (not nested under `/dashboard`). */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/components-showcase" element={<ComponentsShowcasePage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardHomePage />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="projects/:projectId" element={<ProjectHomePage />} />
        <Route path="projects/:projectId/tasks" element={<ProjectTasksPage />} />
        <Route path="projects/:projectId/files" element={<ProjectFilesPage />} />
        <Route path="projects/:projectId/budget" element={<ProjectBudgetPage />} />
        <Route path="projects/:projectId/rfis" element={<ProjectRfisPage />} />

        <Route path="sales" element={<SalesPage />} />
        <Route path="brokers" element={<BrokersPage />} />
        <Route path="intelligence/ai-map" element={<AiMapPage />} />
        <Route path="team" element={<TeamPage />} />

        <Route path="settings/roles" element={<RolesSettingsPage />} />
        <Route path="settings/organization" element={<OrganizationSettingsPage />} />
        <Route path="settings/billing" element={<BillingPage />} />
        <Route path="settings/bot-integrations" element={<BotIntegrationsPage />} />
      </Route>
    </Routes>
  );
}
