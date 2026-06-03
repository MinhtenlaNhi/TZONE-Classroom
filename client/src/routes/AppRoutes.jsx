import { Navigate, Route, Routes, useParams } from "react-router-dom";
import HomePage from "../pages/Home";
import CourseCategoryTapSuPage from "../pages/CourseCategoryTapSu";
import CourseCategoryToeicAPage from "../pages/CourseCategoryToeicA";
import CourseCategoryToeicBPage from "../pages/CourseCategoryToeicB";
import CourseCategoryToeicSWPage from "../pages/CourseCategoryToeicSW";
import AllCoursesPage from "../pages/AllCoursesPage";
import CoursePublicDetailPage from "../pages/CoursePublicDetailPage";
import LoginPage from "../pages/Login";
import AdminTeachersPage from "../pages/Admin";
import AdminCategoriesPage from "../pages/AdminCategories";
import AdminCoursesPage from "../pages/AdminCourses";
import AdminCourseFormPage from "../pages/AdminCourseFormPage";
import OnboardingPage from "../pages/Onboarding";
import RegisterPage from "../pages/Register";
import RegisterDetailsPage from "../pages/RegisterDetails";
import DashboardHome from "../pages/DashboardHome";
import MyCoursesPage from "../pages/MyCoursesPage";
import LearningPage from "../pages/LearningPage";
import AssignmentPage from "../pages/AssignmentPage";
import TeacherCourseLinksPage from "../pages/TeacherCourseLinks";
import TeacherSchedulePage from "../pages/TeacherSchedulePage";
import SchedulePage from "../pages/SchedulePage";
import ForgotPasswordPage from "../pages/ForgotPassword";
import ResetPasswordPage from "../pages/ResetPassword";
import ProfilePage from "../pages/Profile";
import MyReviewsPage from "../pages/MyReviewsPage";
import MyTestsPage from "../pages/MyTestsPage";

import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import AdminOrdersPage from "../pages/AdminOrders";
import AdminReviewsPage from "../pages/AdminReviews";
import AdminDashboardPage from "../pages/AdminDashboard";
import AdminUsersPage from "../pages/AdminUsers";

import TeacherDashboard from "../pages/TeacherDashboard";
import TeacherCoursesPage from "../pages/TeacherCoursesPage";
import TeacherLessonsPage from "../pages/TeacherLessonsPage";
import TeacherSubmissionsPage from "../pages/TeacherSubmissionsPage";

import TeacherShell from "../layouts/TeacherShell";
import AdminShell from "../layouts/AdminShell";
import StudentShell from "../layouts/StudentShell";
import AdminRoute from "./AdminRoute";
import AdminOnlyRoute from "./AdminOnlyRoute";
import OnboardingRoute from "./OnboardingRoute";
import PrivateRoute from "./PrivateRoute";
import StudentRoute from "./StudentRoute";
import { getAdminHomePath } from "../auth/auth";

function AdminIndexRedirect() {
  return <Navigate to={getAdminHomePath()} replace />;
}

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
    <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>{title}</h1>
    <p style={{ color: "#6b7280" }}>Trang đang được phát triển.</p>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses/tap-su" element={<CourseCategoryTapSuPage />} />
      <Route path="/courses/toeic-a" element={<CourseCategoryToeicAPage />} />
      <Route path="/courses/toeic-b" element={<CourseCategoryToeicBPage />} />
      <Route path="/courses/toeic-sw" element={<CourseCategoryToeicSWPage />} />
      <Route path="/courses" element={<AllCoursesPage />} />
      <Route path="/courses/:id" element={<CoursePublicDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/details" element={<RegisterDetailsPage />} />
      {/* Teacher Routes moved inside StudentShell */}
      <Route element={<PrivateRoute><StudentRoute><StudentShell /></StudentRoute></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/schedule" element={<SchedulePage />} />
        
        {/* Cart & Orders */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />

        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/learn/:courseId" element={<LearningPage />} />
        <Route path="/learn/:courseId/assignment/:id" element={<AssignmentPage />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/reviews" element={<MyReviewsPage />} />
        <Route path="/tests" element={<MyTestsPage />} />

        {/* Teacher Routes moved inside TeacherShell */}
      </Route>

      {/* Teacher Workspace Routes */}
      <Route element={<PrivateRoute><TeacherShell /></PrivateRoute>}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
        <Route path="/teacher/courses/:courseId/lessons" element={<TeacherLessonsPage />} />
        <Route path="/teacher/lessons/:lessonId/submissions" element={<TeacherSubmissionsPage />} />
        <Route path="/teacher/assignments/:assignmentId/submissions" element={<TeacherSubmissionsPage />} />
        <Route path="/teacher/course-links" element={<TeacherCourseLinksPage />} />
        <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />
        <Route path="/teacher/account" element={<ProfilePage variant="teacher" />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminShell />
          </AdminRoute>
        }
      >
        <Route index element={<AdminIndexRedirect />} />
        <Route path="dashboard" element={<AdminOnlyRoute><AdminDashboardPage /></AdminOnlyRoute>} />
        <Route path="users" element={<AdminOnlyRoute><AdminUsersPage /></AdminOnlyRoute>} />
        <Route path="teachers" element={<AdminOnlyRoute><AdminTeachersPage /></AdminOnlyRoute>} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="courses/create" element={<AdminCourseFormPage />} />
        <Route path="courses/edit/:id" element={<AdminCourseFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
