import { BrowserRouter, Navigate, Route, Routes } from "@/lib/router-compat";

import { ScrollToTop } from "@/components/common/scroll-to-top";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PublicLayout } from "@/components/layout/public-layout";
import { AppStoreProvider } from "@/lib/app-store";
import { AdminDashboardPage } from "@/views/admin/AdminDashboard";
import { AdminResourcePage } from "@/views/admin/AdminResourcePage";
import { InstructorDashboardPage } from "@/views/instructor/InstructorDashboard";
import { AgendaPage } from "@/views/public/Agenda";
import { AboutPage } from "@/views/public/About";
import { BlogPage } from "@/views/public/Blog";
import { BlogPostPage } from "@/views/public/BlogPost";
import { ContactPage } from "@/views/public/Contact";
import { CourseDetailPage } from "@/views/public/CourseDetail";
import { CoursesPage } from "@/views/public/Courses";
import { HomePage } from "@/views/public/Home";
import { InCompanyPage } from "@/views/public/InCompany";
import { EnrollmentSuccessPage } from "@/views/public/EnrollmentSuccess";
import { LoginPage } from "@/views/public/Login";
import { StudentDashboardPage } from "@/views/student/StudentDashboard";

export function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cursos" element={<CoursesPage />} />
            <Route path="/cursos/:slug" element={<CourseDetailPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/in-company" element={<InCompanyPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/inscricao-confirmada" element={<EnrollmentSuccessPage />} />
          </Route>

          <Route element={<DashboardShell role="student" />}>
            <Route path="/aluno" element={<StudentDashboardPage />} />
          </Route>

          <Route element={<DashboardShell role="instructor" />}>
            <Route path="/instrutor" element={<InstructorDashboardPage />} />
          </Route>

          <Route element={<DashboardShell role="admin" />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/cursos" element={<AdminResourcePage resource="courses" />} />
            <Route path="/admin/turmas" element={<AdminResourcePage resource="classes" />} />
            <Route path="/admin/alunos" element={<AdminResourcePage resource="students" />} />
            <Route path="/admin/leads" element={<AdminResourcePage resource="leads" />} />
            <Route path="/admin/inscricoes" element={<AdminResourcePage resource="enrollments" />} />
            <Route path="/admin/instrutores" element={<AdminResourcePage resource="instructors" />} />
            <Route path="/admin/blog" element={<AdminResourcePage resource="blog" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStoreProvider>
  );
}
