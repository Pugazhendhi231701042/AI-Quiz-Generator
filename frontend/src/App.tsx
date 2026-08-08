import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DocumentsPage } from './pages/DocumentsPage';
import { GenerateQuizPage } from './pages/GenerateQuizPage';
import { QuizTakePage } from './pages/QuizTakePage';
import { QuizResultPage } from './pages/QuizResultPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { PerformancePage } from './pages/PerformancePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        {user && <Sidebar />}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-quiz"
              element={
                <ProtectedRoute>
                  <GenerateQuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <ProtectedRoute>
                  <QuizTakePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz-result/:attemptId"
              element={
                <ProtectedRoute>
                  <QuizResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <FlashcardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <PerformancePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
