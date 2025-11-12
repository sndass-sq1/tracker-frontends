/** @format */

import Audits from "../pages/audits/Audits";
import Charts from "../pages/charts/Charts";
import Clients from "../pages/clients/Clients";
import SuperAdminDashboard from "../pages/dashboards/super-admin/Dashboard";
import ManagerDashboard from "../pages/dashboards/manager/Dashboard";
import ProjectHeadDashboard from "../pages/dashboards/project-head/Dashboard";
import LeadDashboard from "../pages/dashboards/lead/Dashboard";
import CoderDashboard from "../pages/dashboards/coder/Dashboard";
import AuditorDashboard from "../pages/dashboards/auditor/Dashboard";
import SmeDashboard from "../pages/dashboards/sme/Dashboard";
import GuideLines from "../pages/guidelines/GuideLines";
import Logins from "../pages/logins/Logins";
import Profile from "../pages/profile/Profile";
import Projects from "../pages/projects/Projects";
import Teams from "../pages/teams/Teams";
import Users from "../pages/users/Users";
import ClientProfile from "../pages/module-dashboards/clients/ClientProfile";
import ProjectProfile from "../pages/module-dashboards/projects/ProjectProfile";
import TeamProfile from "../pages/module-dashboards/teams/TeamProfile";
import UserProfile from "../pages/module-dashboards/users/UserDashboard";
import ProjectCount from "../pages/module-dashboards/projects/ProjectCount";
import TeamCount from "../pages/module-dashboards/teams/TeamCount";
import ErrorChart from "../pages/charts/ErrorChart";
import AuditColumns from "../pages/audits/AuditColumn";
import EmployeDashboard from "../pages/dashboards/super-admin/EmployeDashboard";
import BulkUpload from "../pages/bulkUpload/BulkUpload";
import ProductionUsers from "../pages/teams/ProductionUsers";
import ViewGuide from "../pages/guidelines/ViewGuide";
import TeamSummary from "../pages/teams/teamSummary/TeamSummary";
import Production from "../pages/production/Production";
import SearchBy from "../pages/searchby/SearchBy";
import UserSummary from "../pages/teams/teamSummary/UserSummary";
import ConflictPage from "../pages/ErrorConflict/ConflictPage";
import SmeDetails from "../pages/SmeConflict/SmeDetails";
import SmeConflictPage from "../pages/SmeConflict/SmeConflictPage";
import ConflictDetails from "../pages/ErrorConflict/ConflictDetails";
import ClientDashboard from "../pages/module-dashboards/clients/clientDashboard";
import ProjectDashboard from "../pages/module-dashboards/projects/ProjectDashboard";
import TeamDashboard from "../pages/module-dashboards/teams/TeamDashboard";
import ViewProjects from "../pages/module-dashboards/projects/ViewProjects";
import ViewTeams from "../pages/module-dashboards/teams/ViewTeams";
const roleRoutes = {
  super_admin: [
    { path: "/", element: <SuperAdminDashboard />, menu: "dashboard" },
    { path: "/clients", element: <Clients />, menu: "clients" },
    { path: "/clients/:id", element: <ClientProfile />, menu: false },
    { path: "/clientDashboard", element: <ClientDashboard />, menu: false },
    { path: "/projects", element: <Projects />, menu: "projects" },
    {
      path: "/clients/project-count/:id",
      element: <ProjectCount />,
      menu: false,
    },
    { path: "/projects/:id", element: <ProjectProfile />, menu: false },
    {
      path: "/ProjectDashboard",
      element: <ProjectDashboard />,
      menu: false,
    },
    {
      path: "/ViewProjects",
      element: <ViewProjects />,
      menu: false,
    },
    {
      path: "/ViewTeams",
      element: <ViewTeams />,
      menu: false,
    },
    { path: "/users", element: <Users />, menu: "users" },
    { path: "/users/idle", element: <Users />, menu: false },
    { path: "/users/assign", element: <Users />, menu: false },
    { path: "/users/deleted", element: <Users />, menu: false },
    { path: "/teams", element: <Teams />, menu: "teams" },
    { path: "/users/:id", element: <UserProfile />, menu: false },
    { path: "/teams/inactive", element: <Teams />, menu: false },
    { path: "/TeamDashboard", element: <TeamDashboard />, menu: false },
    {
      path: "/production/coders/:id",
      element: <ProductionUsers />,
      menu: false,
    },
    {
      path: "/production/auditors/:id",
      element: <ProductionUsers />,
      menu: false,
    },
    {
      path: "/production/coders/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },
    {
      path: "/production/auditors/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },
    { path: "/coder/charts/:id", element: <UserSummary />, menu: false },
    { path: "/auditor/charts/:id", element: <UserSummary />, menu: false },
    { path: "/team-count/:id", element: <TeamCount />, menu: false },
    { path: "/teams/:id", element: <TeamProfile />, menu: false },

    // { path: "/qa1", element: <Qa1 />, menu: "qa1" },
    // { path: "/qa2", element: <Qa2 />, menu: "qa2" },
    // { path: "/masteraudit", element: <MasterAudit />, menu: "masteraudit" },
    { path: "/guidelines", element: <GuideLines />, menu: "guidelines" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
    { path: "/logins", element: <Logins />, menu: "logins" },
    { path: "/profile", element: <Profile />, menu: "profile" },
    { path: "/emp-dashboard", element: <EmployeDashboard /> },
    { path: "/clients/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/projects/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/logins/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/users/bulkUpload", element: <BulkUpload />, menu: false },
    // { path: "/teams/teamSummary/teamsummary", element: <TeamSummary />, menu: false }
  ],
  project_head: [
    { path: "/", element: <ProjectHeadDashboard />, menu: "dashboard" },
    { path: "/users", element: <Users />, menu: "users" },
    { path: "/teams", element: <Teams />, menu: "teams" },
    {
      path: "/production/coders/:id",
      element: <ProductionUsers />,
      menu: false,
    },
    {
      path: "/production/auditors/:id",
      element: <ProductionUsers />,
      menu: false,
    },
    {
      path: "/production/coders/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },
    {
      path: "/production/auditors/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },

    { path: "/coder/charts/:id", element: <UserSummary />, menu: false },
    { path: "/auditor/charts/:id", element: <UserSummary />, menu: false },
    { path: "/team-count/:id", element: <TeamCount />, menu: false },
    { path: "/teams/:id", element: <TeamProfile />, menu: false },
    { path: "/logins", element: <Logins />, menu: "logins" },
    { path: "/searchby", element: <SearchBy />, menu: "search" },
    { path: "/guidelines", element: <GuideLines />, menu: "guidelines" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
    { path: "/profile", element: <Profile />, menu: "profile" },
    { path: "/logins/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/users/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/emp-dashboard", element: <EmployeDashboard /> },
    { path: "/users/:id", element: <UserProfile />, menu: false },
  ],
  manager: [
    { path: "/", element: <ManagerDashboard />, menu: "dashboard" },
    { path: "/clients", element: <Clients />, menu: "clients" },
    { path: "/clients/:id", element: <ClientProfile />, menu: false },
    { path: "/clientDashboard", element: <ClientDashboard />, menu: false },
    { path: "/projects", element: <Projects />, menu: "projects" },
    {
      path: "/clients/project-count/:id",
      element: <ProjectCount />,
      menu: false,
    },
    { path: "/projects/:id", element: <ProjectProfile />, menu: false },
    {
      path: "/ProjectDashboard",
      element: <ProjectDashboard />,
      menu: false,
    },
    {
      path: "/ViewProjects",
      element: <ViewProjects />,
      menu: false,
    },
    {
      path: "/ViewTeams",
      element: <ViewTeams />,
      menu: false,
    },
    { path: "/users", element: <Users />, menu: "users" },
    { path: "/users/idle", element: <Users />, menu: false },
    { path: "/users/assign", element: <Users />, menu: false },
    { path: "/users/deleted", element: <Users />, menu: false },
    { path: "/users/:id", element: <UserProfile />, menu: false },
    { path: "/teams", element: <Teams />, menu: "teams" },
    { path: "/teams/inactive", element: <Teams />, menu: false },
    { path: "/TeamDashboard", element: <TeamDashboard />, menu: false },
    {
      path: "/production/coders/:id",
      element: <ProductionUsers />,
      menu: false,
    },
    {
      path: "/production/auditors/:id",
      element: <ProductionUsers />,
      menu: false,
    },
    {
      path: "/production/coders/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },
    {
      path: "/production/auditors/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },
    { path: "/coder/charts/:id", element: <UserSummary />, menu: false },
    { path: "/auditor/charts/:id", element: <UserSummary />, menu: false },
    { path: "/team-count/:id", element: <TeamCount />, menu: false },
    { path: "/teams/:id", element: <TeamProfile />, menu: false },
    // { path: "/team/production/coders/:id", element: <ProductionUsers />, menu: "production" },
    // { path: "/team/production/auditors/:id", element: <ProductionUsers />, menu: "production" },
    { path: "/guidelines", element: <GuideLines />, menu: "guidelines" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
    { path: "/logins", element: <Logins />, menu: "logins" },
    { path: "/profile", element: <Profile />, menu: "profile" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
    { path: "/emp-dashboard", element: <EmployeDashboard /> },
    { path: "/clients/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/projects/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/logins/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/users/bulkUpload", element: <BulkUpload />, menu: false },
  ],
  sme: [
    { path: "/", element: <SmeDashboard />, menu: "dashboard" },
    {
      path: "/smeconflictpage",
      element: <SmeConflictPage />,
      menu: "error conflicts",
    },
    { path: "/details/:id", element: <SmeDetails />, menu: false },
    { path: "/guidelines", element: <GuideLines />, menu: "guidelines" },
    { path: "/profile", element: <Profile />, menu: "profile" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
  ],
  lead: [
    { path: "/", element: <LeadDashboard />, menu: "dashboard" },
    {
      path: "/production/coders/:id",
      element: <Production defaultTab="teams_coder" />,
      menu: "production",
    },
    {
      path: "/production/auditors/:id",
      element: <Production defaultTab="teams_auditor" />,
      menu: false,
    },
    // { path: "/error-chart", element: <ErrorChart />, menu: "Conflicts" },
    // { path: "/conflicts", element: <ConflictsTabColumns />, menu: "Conflicts" },
    {
      path: "/production/coders/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },
    {
      path: "/production/auditors/charts/:id",
      element: <TeamSummary />,
      menu: false,
    },
    { path: "/coder/charts/:id", element: <UserSummary />, menu: false },
    {
      path: "/auditor/charts/:id",
      element: <UserSummary />,
      menu: false,
    },
    { path: "/users", element: <Users />, menu: "users" },
    { path: "/logins", element: <Logins />, menu: "logins" },
    { path: "/searchby", element: <SearchBy />, menu: "search" },
    { path: "/guidelines", element: <GuideLines />, menu: "guidelines" },
    // { path: "/leadsearch", element: <LeadSearch />, menu: "leadsearch" },
    { path: "/profile", element: <Profile />, menu: "profile" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
    { path: "/logins/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/users/bulkUpload", element: <BulkUpload />, menu: false },
    { path: "/emp-dashboard", element: <EmployeDashboard /> },
    { path: "/users/:id", element: <UserProfile />, menu: false },
  ],
  coder: [
    { path: "/", element: <CoderDashboard />, menu: "dashboard" },
    { path: "/charts", element: <Charts />, menu: "charts" },
    { path: "/error-chart", element: <ErrorChart />, menu: false },
    {
      path: "/error-conflict",
      element: <ConflictPage />,
      menu: "errors",
    },
    {
      path: "/conflict-details/:id",
      element: <ConflictDetails />,
      menu: false,
    },
    { path: "/guidelines", element: <GuideLines />, menu: "guidelines" },
    { path: "/profile", element: <Profile />, menu: "profile" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
    // { path: "/my-profile", element: <Clients /> },
  ],
  auditor: [
    { path: "/", element: <AuditorDashboard />, menu: "dashboard" },
    { path: "/add-audits", element: <Audits />, menu: "add-audits" },
    { path: "/audits", element: <AuditColumns />, menu: "audits" },
    { path: "/error-chart", element: <ErrorChart />, menu: false },
    {
      path: "/error-conflict",
      element: <ConflictPage />,
      menu: "errors",
    },
    {
      path: "/conflict-details/:id",
      element: <ConflictDetails />,
      menu: false,
    },
    // { path: "/error-conflict", element: <ErrorChartsPage />, menu: "error-conflict" },
    { path: "/guidelines", element: <GuideLines />, menu: "guidelines" },
    { path: "/profile", element: <Profile />, menu: "profile" },
    { path: "/view-guide/:id", element: <ViewGuide />, menu: false },
  ],
};

export default roleRoutes;
