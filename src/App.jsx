import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ShareCard from './components/ShareCard';

export default function App() {
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Parse username from URL path (e.g., /nabila)
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      const potentialUsername = pathSegments[0];
      // Check if it's not a reserved path
      if (!['share', 'api', 'static'].includes(potentialUsername.toLowerCase())) {
        setUsername(potentialUsername);
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Memuat...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <ShareCard 
        username={username} 
        onClose={() => {
          window.history.pushState({}, '', '/');
          setUsername(null);
          window.location.reload();
        }} 
      />
    </div>
  );
}
