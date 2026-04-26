import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { HomePage } from "./pages/home";
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "./pages/auth";
import { InvitePage, WelcomePage } from "./pages/onboarding";
import { ComponentsShowcasePage } from "./pages/dev";

import { DashboardPage } from "./pages/dashboard";
import {
  SalesPage,
  BrokersPage,
  AiMapPage,
} from "./pages/workspace";
import {
  TeamPage as OrgTeamPage,
  RolesPage,
  OrganizationPage,
  BillingPage,
  BotIntegrationsPage,
  PreferencesPage,
} from "./pages/settings";

import ListPage from "./pages/projects/ListPage";
import { ProjectRouteLayout } from "@/components/project/ProjectRouteLayout";

const ProjectIndexEntry = lazy(() =>
  import("@/components/project/ProjectIndexEntry").then((m) => ({
    default: m.ProjectIndexEntry,
  })),
);
const OverviewPage = lazy(() => import("./pages/projects/OverviewPage"));
const TasksPage = lazy(() => import("./pages/projects/TasksPage"));
const FilesPage = lazy(() => import("./pages/projects/FilesPage"));
const RfisPage = lazy(() => import("./pages/projects/RfisPage"));
const BudgetRedirect = lazy(() => import("./pages/projects/BudgetRedirect"));
const DrawingsPage = lazy(() => import("./pages/projects/DrawingsPage"));
const DrawingViewerPage = lazy(
  () => import("./pages/projects/DrawingViewerPage"),
);
const DailyReportsPage = lazy(
  () => import("./pages/projects/DailyReportsPage"),
);
const InspectionsPage = lazy(() => import("./pages/projects/InspectionsPage"));
const SchedulePage = lazy(() => import("./pages/projects/SchedulePage"));
const ReportsPage = lazy(() => import("./pages/projects/ReportsPage"));
const MeetingsPage = lazy(() => import("./pages/projects/MeetingsPage"));
const FinancialsPage = lazy(() => import("./pages/projects/FinancialsPage"));
const ProjectTeamPage = lazy(() => import("./pages/projects/TeamPage"));
const ActivityPage = lazy(() => import("./pages/projects/ActivityPage"));
const InventoryPage = lazy(() => import("./pages/projects/InventoryPage"));
const HiringFeedPage = lazy(
  () => import("./pages/hiring/HiringFeedPage"),
);
const HiringCandidatesPage = lazy(
  () => import("./pages/hiring/HiringCandidatesPage"),
);
const HiringWorkersPage = lazy(
  () => import("./pages/hiring/HiringWorkersPage"),
);
const MessagesInboxPage = lazy(
  () => import("./pages/chat/MessagesInboxPage"),
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
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ListPage />} />

        <Route path="projects/:projectId" element={<ProjectRouteLayout />}>
          <Route index element={<ProjectIndexEntry />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="drawings" element={<DrawingsPage />} />
          <Route
            path="drawings/viewer/:planId"
            element={<DrawingViewerPage />}
          />
          <Route path="rfis" element={<RfisPage />} />
          <Route path="daily-reports" element={<DailyReportsPage />} />
          <Route path="inspections" element={<InspectionsPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="financials" element={<FinancialsPage />} />
          <Route path="team" element={<ProjectTeamPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="budget" element={<BudgetRedirect />} />
        </Route>

        <Route path="sales" element={<SalesPage />} />
        <Route path="brokers" element={<BrokersPage />} />
        <Route path="hiring" element={<HiringFeedPage />} />
        <Route path="hiring/candidates" element={<HiringCandidatesPage />} />
        <Route path="hiring/workers" element={<HiringWorkersPage />} />
        <Route path="messages" element={<MessagesInboxPage />} />
        <Route path="messages/channels" element={<Navigate to="/messages" replace />} />
        <Route path="messages/dms" element={<Navigate to="/messages" replace />} />
        <Route path="intelligence/ai-map" element={<AiMapPage />} />
        <Route path="team" element={<OrgTeamPage />} />

        <Route
          path="settings"
          element={<Navigate to="/settings/preferences" replace />}
        />
        <Route path="settings/preferences" element={<PreferencesPage />} />
        <Route path="settings/roles" element={<RolesPage />} />
        <Route path="settings/organization" element={<OrganizationPage />} />
        <Route path="settings/billing" element={<BillingPage />} />
        <Route
          path="settings/bot-integrations"
          element={<BotIntegrationsPage />}
        />
      </Route>
    </Routes>
  );
}
