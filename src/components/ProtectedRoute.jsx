import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, stage = "app" }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (stage === "onboarding") {
    if (user.onboardingComplete) {
      if (!user.goalAssessment) return <Navigate to="/goal-assessment" replace />;
      if (!user.planAccepted) return <Navigate to="/plan" replace />;
      return <Navigate to="/home" replace />;
    }
    return children;
  }

  if (!user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (stage === "assessment") {
    if (user.goalAssessment && user.planAccepted) return <Navigate to="/home" replace />;
    if (user.goalAssessment && !user.planAccepted) return <Navigate to="/plan" replace />;
    return children;
  }

  if (stage === "plan") {
    if (!user.goalAssessment) return <Navigate to="/goal-assessment" replace />;
    return children;
  }

  if (!user.goalAssessment) return <Navigate to="/goal-assessment" replace />;
  if (!user.planAccepted) return <Navigate to="/plan" replace />;
  return children;
}

export function GuestOnly({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  if (!user.goalAssessment) return <Navigate to="/goal-assessment" replace />;
  if (!user.planAccepted) return <Navigate to="/plan" replace />;
  return <Navigate to="/home" replace />;
}
