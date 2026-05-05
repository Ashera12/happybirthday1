import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UsernameInput from './components/UsernameInput';
import CardEditor from './components/CardEditor';
import ViewCard from './components/ViewCard';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [draftUsername, setDraftUsername] = useState(() => {
    // Try to get from localStorage on init
    return localStorage.getItem('draft-username') || '';
  });

  useEffect(() => {
    const path = window.location.pathname;
    console.log('Current path:', path);
    setCurrentPath(path);
    
    // Listen for popstate (back/forward buttons)
    const handlePopState = () => {
      console.log('Popstate, new path:', window.location.pathname);
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    console.log('Navigating to:', path);
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    console.log('Navigation complete, current pathname:', window.location.pathname);
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
    console.log('Submitting username:', username);
    localStorage.setItem('draft-username', username);
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
