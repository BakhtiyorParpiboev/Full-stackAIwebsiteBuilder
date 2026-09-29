import { Route, Routes, useLocation, useNavigate, Link as RouterLink } from "react-router-dom"

import Home from "./pages/Home"
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import MyProjects from "./pages/MyProjects";
import Preview from "./pages/Preview";
import Community from "./pages/Community";
import View from "./pages/View";
import Navbar from "./components/Navbar";
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/auth/auth-provider";
import { authClient } from "@/lib/auth-client";
import AuthPage from "./pages/AuthPage";
import SettingsDemo from "./pages/Settings";
import SecuritySettingsDemo from "./components/SecuritySettingsDemo";
import Loading from "./pages/Loading";

function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const hideNavbar =
    pathname.startsWith("/projects/") && pathname !== "/projects" ||
    pathname.startsWith("/view/") ||
    pathname.startsWith("/preview/");
  return (
    <AuthProvider
      authClient={authClient}
      navigate={({ to, replace }) => navigate(to, { replace })}
      Link={({ href, to, children, className, ...props }: any) => (
        <RouterLink to={to || href || "#"} className={className} {...props}>
          {children}
        </RouterLink>
      )}
    >
      <div>
        <Toaster />
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/projects/:projectId" element={<Projects />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/preview/:projectId" element={<Preview />} />
          <Route path="/preview/:projectId/:versionId" element={<Preview />} />
          <Route path="/community" element={<Community />} />
          <Route path="/view/:projectId" element={<View />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/:pathname" element={<AuthPage />} />
          <Route path="/settings/account" element={<SettingsDemo />} />
          <Route path="/settings/security" element={<SecuritySettingsDemo />} />
          <Route path='/loading' element={<Loading />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App