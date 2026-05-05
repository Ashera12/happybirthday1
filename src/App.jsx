import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UsernameInput from './components/UsernameInput';
import CardEditor from './components/CardEditor';
import ViewCard from './components/ViewCard';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [draftUsername, setDraftUsername] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    
    // Listen for popstate (back/forward buttons)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Parse path
  const pathSegments = currentPath.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] || '';
  
  // Determine what to render
  const isRoot = currentPath === '/' || currentPath === '';
  const isEditPage = firstSegment === 'edit';
  const isViewPage = firstSegment && !['edit', 'share', 'api'].includes(firstSegment);
  const viewUsername = isViewPage ? firstSegment : null;

  // Handle username submission from root page
  const handleUsernameSubmit = (username) => {
    setDraftUsername(username);
    navigate('/edit');
  };

  // Handle card creation complete
  const handleCardCreated = (username) => {
    navigate(`/${username}`);
  };

  // Render appropriate component
  if (isRoot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <UsernameInput onSubmit={handleUsernameSubmit} />
      </div>
    );
  }

  if (isEditPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <CardEditor 
          card={{ username: draftUsername }}
          onSave={(cardData) => handleCardCreated(draftUsername)}
          onClose={() => navigate('/')}
        />
      </div>
    );
  }

  if (isViewPage && viewUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <ViewCard 
          username={viewUsername}
          onBack={() => navigate('/')}
          onEdit={() => navigate('/edit')}
        />
      </div>
    );
  }

  // Fallback to root
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <UsernameInput onSubmit={handleUsernameSubmit} />
    </div>
  );
}
