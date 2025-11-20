
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import AuthForm from './components/AuthForm';
import Loader from './components/Loader';
import PrivacyPolicy from './components/PrivacyPolicy';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)} />
      ) : (
        <AuthForm onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)} />
      )}
      <PrivacyPolicy 
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />
    </>
  );
};

export default App;