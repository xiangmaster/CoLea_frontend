import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/student/DashboardPage';
import { CourseDetailPage } from './pages/student/CourseDetailPage';
import { GroupsPage } from './pages/student/GroupsPage';
import { TasksPage } from './pages/student/TasksPage';
import { TaskDetailPage } from './pages/student/TaskDetailPage';
import { DocsListPage } from './pages/student/DocsListPage';
import { DocEditorPage } from './pages/student/DocEditorPage';
import { AnalyticsPage } from './pages/student/AnalyticsPage';
import { AiCoachPage } from './pages/student/AiCoachPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { TeacherCourseDetailPage } from './pages/teacher/TeacherCourseDetailPage';
import { TeacherGroupsPage } from './pages/teacher/TeacherGroupsPage';
import { TeacherGroupDetailPage } from './pages/teacher/TeacherGroupDetailPage';
import { TeacherTasksPage } from './pages/teacher/TeacherTasksPage';
import { TeacherGradingPage } from './pages/teacher/TeacherGradingPage';
import { TeacherAnalyticsPage } from './pages/teacher/TeacherAnalyticsPage';
import { TeacherRiskPage } from './pages/teacher/TeacherRiskPage';
import { TeacherAnnouncementsPage } from './pages/teacher/TeacherAnnouncementsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/app" element={<AppLayout variant="student" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route path="courses/:courseId/groups" element={<GroupsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="docs" element={<DocsListPage />} />
        <Route path="docs/:docId" element={<DocEditorPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai" element={<AiCoachPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/teacher" element={<AppLayout variant="teacher" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboardPage />} />
        <Route path="courses/:courseId" element={<TeacherCourseDetailPage />} />
        <Route path="groups/:courseId" element={<TeacherGroupsPage />} />
        <Route path="groups/:courseId/:groupId" element={<TeacherGroupDetailPage />} />
        <Route path="tasks/:courseId" element={<TeacherTasksPage />} />
        <Route path="grading" element={<TeacherGradingPage />} />
        <Route path="grading/:submissionId" element={<TeacherGradingPage />} />
        <Route path="analytics" element={<TeacherAnalyticsPage />} />
        <Route path="risk" element={<TeacherRiskPage />} />
        <Route path="announcements" element={<TeacherAnnouncementsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
