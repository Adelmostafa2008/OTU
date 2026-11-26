import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import HomePage from "./HomePage";
import ProfilePage from "./Profile";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";
import AddUser from "./AddUser";
import Subjects from "./Subjects";
import Upload from "./Upload";
import AllQuizzesPage from "./AllQuizzesPage";
import AllMeetingsPage from "./AllMeetingsPage";
import AllAssignmentsPage from "./AllAssignmentsPage";
import QuizDetailsPage from "./QuizDetailsPage";
import MeetingDetailsPage from "./MeetingDetailsPage";
import AssignmentDetailsPage from "./AssignmentDetailsPage";
import LessonDetailsPage from "./LessonDetailsPage";
import QuizEditPage from "./QuizEditPage";
import MeetingEditPage from "./MeetingEditPage";
import AssignmentEditPage from "./AssignmentEditPage";
import LessonEditPage from "./LessonEditPage";
import ChangePassword from "./ChangePassword";
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
      <div className="pt-14 lg:pl-[220px] lg:pt-0">
        <main className="min-h-[calc(100vh-3.5rem)] pb-20 lg:min-h-screen">
          <div className="page-shell">
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
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
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
                  <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                    <Upload />
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
                path="/add-user"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-student"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Navigate to="/add-user" replace />
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
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <AllAssignmentsPage />
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
                path="/lesson/:id"
                element={
                  <ProtectedRoute>
                    <LessonDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignment/:id"
                element={
                  <ProtectedRoute>
                    <AssignmentDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lesson/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]} deniedRoles={["guest"]}>
                    <LessonEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]} deniedRoles={["guest"]}>
                    <QuizEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meeting/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]} deniedRoles={["guest"]}>
                    <MeetingEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignment/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]} deniedRoles={["guest"]}>
                    <AssignmentEditPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
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
