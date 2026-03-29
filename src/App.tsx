import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
  PreferencesSettingsPage,
} from "./pages/settings";

import ProjectsListPage from "./pages/projects/ProjectsListPage";
import { ProjectRouteLayout } from "@/features/project-ui/ProjectRouteLayout";

const ProjectIndexEntry = lazy(() =>
  import("@/features/project-ui/ProjectIndexEntry").then((m) => ({
    default: m.ProjectIndexEntry,
  })),
);
const ProjectOverviewPage = lazy(() =>
  import("@/pages/projects/ProjectOverviewPage").then((m) => ({
    default: m.ProjectOverviewPage,
  })),
);
const ProjectTasksPage = lazy(() => import("./pages/projects/ProjectTasksPage"));
const ProjectFilesPage = lazy(() => import("./pages/projects/ProjectFilesPage"));
const ProjectRfisPage = lazy(() => import("./pages/projects/ProjectRfisPage"));
const ProjectBudgetRedirect = lazy(
  () => import("./pages/projects/ProjectBudgetRedirect"),
);
const ProjectDrawingsPage = lazy(
  () => import("./pages/projects/ProjectDrawingsPage"),
);
const ProjectDrawingViewerPage = lazy(
  () => import("./pages/projects/ProjectDrawingViewerPage"),
);
const ProjectDailyReportsPage = lazy(
  () => import("./pages/projects/ProjectDailyReportsPage"),
);
const ProjectInspectionsPage = lazy(
  () => import("./pages/projects/ProjectInspectionsPage"),
);
const ProjectSchedulePage = lazy(
  () => import("./pages/projects/ProjectSchedulePage"),
);
const ProjectReportsPage = lazy(
  () => import("./pages/projects/ProjectReportsPage"),
);
const ProjectMeetingsPage = lazy(
  () => import("./pages/projects/ProjectMeetingsPage"),
);
const ProjectFinancialsPage = lazy(
  () => import("./pages/projects/ProjectFinancialsPage"),
);
const ProjectTeamPage = lazy(() => import("./pages/projects/ProjectTeamPage"));
const ProjectActivityPage = lazy(
  () => import("./pages/projects/ProjectActivityPage"),
);
const ProjectInventoryPage = lazy(
  () => import("./pages/projects/ProjectInventoryPage"),
);

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

        <Route path="projects/:projectId" element={<ProjectRouteLayout />}>
          <Route index element={<ProjectIndexEntry />} />
          <Route path="overview" element={<ProjectOverviewPage />} />
          <Route path="tasks" element={<ProjectTasksPage />} />
          <Route path="drawings" element={<ProjectDrawingsPage />} />
          <Route path="drawings/viewer/:planId" element={<ProjectDrawingViewerPage />} />
          <Route path="rfis" element={<ProjectRfisPage />} />
          <Route path="daily-reports" element={<ProjectDailyReportsPage />} />
          <Route path="inspections" element={<ProjectInspectionsPage />} />
          <Route path="files" element={<ProjectFilesPage />} />
          <Route path="schedule" element={<ProjectSchedulePage />} />
          <Route path="reports" element={<ProjectReportsPage />} />
          <Route path="meetings" element={<ProjectMeetingsPage />} />
          <Route path="financials" element={<ProjectFinancialsPage />} />
          <Route path="team" element={<ProjectTeamPage />} />
          <Route path="activity" element={<ProjectActivityPage />} />
          <Route path="inventory" element={<ProjectInventoryPage />} />
          <Route path="budget" element={<ProjectBudgetRedirect />} />
        </Route>

        <Route path="sales" element={<SalesPage />} />
        <Route path="brokers" element={<BrokersPage />} />
        <Route path="intelligence/ai-map" element={<AiMapPage />} />
        <Route path="team" element={<TeamPage />} />

        <Route path="settings" element={<Navigate to="/settings/preferences" replace />} />
        <Route path="settings/preferences" element={<PreferencesSettingsPage />} />
        <Route path="settings/roles" element={<RolesSettingsPage />} />
        <Route path="settings/organization" element={<OrganizationSettingsPage />} />
        <Route path="settings/billing" element={<BillingPage />} />
        <Route path="settings/bot-integrations" element={<BotIntegrationsPage />} />
      </Route>
    </Routes>
  );
}
