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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/generate-quiz" element={<GenerateQuizPage />} />
            <Route path="/quiz/:id" element={<QuizTakePage />} />
            <Route path="/quiz-result/:attemptId" element={<QuizResultPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
