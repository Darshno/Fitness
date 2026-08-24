import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute, { GuestOnly } from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import FlowLayout from "./layouts/FlowLayout";
import PublicLayout from "./layouts/PublicLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import GoalAssessment from "./pages/GoalAssessment";
import Plan from "./pages/Plan";
import Home from "./pages/Home";
import Physical from "./pages/Physical";
import Nutrition from "./pages/Nutrition";
import Mental from "./pages/Mental";
import Settings from "./pages/Settings";
import Progress from "./pages/Progress";
import CycleCare from "./pages/CycleCare";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<GuestOnly><Landing /></GuestOnly>} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
        </Route>

        <Route
          element={(
            <ProtectedRoute stage="onboarding">
              <FlowLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>
        <Route
          element={(
            <ProtectedRoute stage="assessment">
              <FlowLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/goal-assessment" element={<GoalAssessment />} />
        </Route>
        <Route
          element={(
            <ProtectedRoute stage="plan">
              <FlowLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/plan" element={<Plan />} />
        </Route>

        <Route
          element={(
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/home" element={<Home />} />
          <Route path="/physical" element={<Physical />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/mental" element={<Mental />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Navigate to="/settings" replace />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/cycle-care" element={<CycleCare />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
