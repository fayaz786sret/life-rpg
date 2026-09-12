import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { LoginPage } from './components/Auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div className="text-6xl" style={{ animation: 'var(--animate-float)' }}>⚔️</div>
      <div className="skeleton rounded-full" style={{ width: '12rem', height: '0.5rem' }} />
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading your realm…</p>
    </div>
  </div>
);

const AppInner = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <LoginPage />;
  return (
    <GameProvider>
      <DashboardPage />
    </GameProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
