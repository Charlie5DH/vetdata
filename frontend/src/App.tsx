import { Route, Routes, Navigate, useLocation } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthBootstrap } from "@/components/auth/auth-bootstrap";
import { ChatWidget } from "@/components/chat/chat-widget";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ClinicProfilePage from "@/pages/clinic/ClinicProfilePage";
import ClinicSetupPage from "@/pages/clinic/ClinicSetupPage";
import ClinicTeamPage from "@/pages/clinic/ClinicTeamPage";
import Customization from "@/pages/Customization";
import Dashboard from "@/pages/Dashboard";
import MeasureCreate from "@/pages/MeasureCreate";
import Measures from "@/pages/Measures";
import PatientDetails from "@/pages/PatientDetails";
import Patients from "@/pages/Patients";
import PatientCreate from "@/pages/patients/create";
import Profile from "@/pages/Profile";
import TemplateCreate from "@/pages/templates/create";
import Templates from "@/pages/Templates";
import TreatmentCreate from "@/pages/TreatmentCreate";
import TreatmentSessionDetails from "@/pages/TreatmentSessionDetails";
import Treatments from "@/pages/Treatments";
import TutorCreate from "@/pages/TutorCreate";
import TutorDetails from "@/pages/TutorDetails";
import Tutors from "@/pages/Tutors";
import VisaoGeral from "@/pages/VisaoGeral";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";

function AuthenticatedApp() {
  const location = useLocation();
  const isClinicSetupRoute = location.pathname.startsWith("/clinic/setup");

  if (isClinicSetupRoute) {
    return (
      <AuthBootstrap>
        <Routes>
          <Route path="/clinic/setup" element={<ClinicSetupPage />} />
          <Route path="*" element={<Navigate to="/clinic/setup" replace />} />
        </Routes>
      </AuthBootstrap>
    );
  }

  return (
    <AuthBootstrap>
      <div className="[--header-height:3.5rem]">
        <SidebarProvider className="flex min-h-svh flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset className="min-h-0">
              <div className="flex min-h-0 flex-1 flex-col">
                <Routes>
                  <Route path="/:clinicSlug" element={<Dashboard />} />
                  <Route
                    path="/:clinicSlug/visao-geral"
                    element={<VisaoGeral />}
                  />
                  <Route
                    path="/:clinicSlug/clinic"
                    element={<ClinicProfilePage />}
                  />
                  <Route
                    path="/:clinicSlug/team"
                    element={<ClinicTeamPage />}
                  />
                  <Route
                    path="/:clinicSlug/customization"
                    element={<Customization />}
                  />
                  <Route path="/:clinicSlug/perfil/*" element={<Profile />} />
                  <Route path="/:clinicSlug/patients" element={<Patients />} />
                  <Route
                    path="/:clinicSlug/patients/new"
                    element={<PatientCreate />}
                  />
                  <Route
                    path="/:clinicSlug/patients/:id"
                    element={<PatientDetails />}
                  />
                  <Route path="/:clinicSlug/tutors" element={<Tutors />} />
                  <Route
                    path="/:clinicSlug/tutors/new"
                    element={<TutorCreate />}
                  />
                  <Route
                    path="/:clinicSlug/tutors/:id"
                    element={<TutorDetails />}
                  />
                  <Route
                    path="/:clinicSlug/templates"
                    element={<Templates />}
                  />
                  <Route
                    path="/:clinicSlug/templates/new"
                    element={<TemplateCreate />}
                  />
                  <Route
                    path="/:clinicSlug/treatments"
                    element={<Treatments />}
                  />
                  <Route
                    path="/:clinicSlug/treatments/new"
                    element={<TreatmentCreate />}
                  />
                  <Route
                    path="/:clinicSlug/treatments/:id"
                    element={<TreatmentSessionDetails />}
                  />
                  <Route
                    path="/:clinicSlug/measures/new"
                    element={<MeasureCreate />}
                  />
                  <Route path="/:clinicSlug/measures" element={<Measures />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </SidebarInset>
          </div>
          <ChatWidget />
        </SidebarProvider>
      </div>
    </AuthBootstrap>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="*" element={<AuthenticatedApp />} />
    </Routes>
  );
}

export default App;
