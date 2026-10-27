import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import HomePage from "./HomePage";
import ProfilePage from "./Profile";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";
import Subjects from "./Subjects";
import UploadLesson from "./UploadLesson";
import AllQuizzesPage from "./AllQuizzesPage";
import AllMeetingsPage from "./AllMeetingsPage";
import QuizDetailsPage from "./QuizDetailsPage";
import MeetingDetailsPage from "./MeetingDetailsPage";
import QuizEditPage from "./QuizEditPage";
import MeetingEditPage from "./MeetingEditPage";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles, deniedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (deniedRoles && deniedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pl-[220px]">
        <main className="min-h-screen pb-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute deniedRoles={["student"]} allowedRoles={["instructor", "admin"]}>
                  <UploadLesson />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <AllQuizzesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings"
              element={
                <ProtectedRoute>
                  <AllMeetingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <ProtectedRoute>
                  <QuizDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meeting/:id"
              element={
                <ProtectedRoute>
                  <MeetingDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:id/edit"
              element={
                <ProtectedRoute>
                  <QuizEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meeting/:id/edit"
              element={
                <ProtectedRoute>
                  <MeetingEditPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

