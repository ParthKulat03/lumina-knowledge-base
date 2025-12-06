import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import SearchPage from "@/pages/search";
import DocumentsPage from "@/pages/documents";
import SettingsPage from "@/pages/settings";
import NotFoundPage from "@/pages/not-found";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
