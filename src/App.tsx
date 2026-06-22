import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import CTA from './sections/CTA';
import Footer from './sections/Footer';
import AdminPanel from './sections/AdminPanel';
import ContactDialog from './sections/ContactDialog';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <AppShell />
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const { user, authReady } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Initialize scroll animations
    const ctx = gsap.context(() => {
      // Refresh ScrollTrigger on load
      ScrollTrigger.refresh();
    }, mainRef);

    return () => ctx.revert();
  }, []);

  // Admin panel keyboard shortcut (Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (user) {
          setIsAdminOpen(prev => !prev);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  useEffect(() => {
    if (authReady && user) {
      setIsAdminLoginOpen(false);
    }
  }, [authReady, user]);

  const openContact = () => setIsContactOpen(true);
  const openAdminLogin = () => {
    if (user) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div ref={mainRef} className="min-h-screen overflow-x-hidden transition-colors duration-400"
      style={{ backgroundColor: 'var(--t-bg)', color: 'var(--t-text)' }}>
      <Navigation scrolled={scrolled} onContactClick={openContact} onLogoClick={openAdminLogin} />

      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <CTA onContactClick={openContact} />
      </main>

      <Footer onContactClick={openContact} />

      <AdminPanel isOpen={isAdminOpen && !!user} onClose={() => setIsAdminOpen(false)} />

      {isAdminLoginOpen && <AdminLoginDialog onClose={() => setIsAdminLoginOpen(false)} onSuccess={() => { setIsAdminLoginOpen(false); setIsAdminOpen(true); }} />}

      <ContactDialog isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

function AdminLoginDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      onSuccess();
    } catch {
      setError('Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#0a0a0a] border dark:border-[#333] border-gray-200 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
          ✕
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-[#ff6b35] text-xl">🔒</span>
          </div>
          <h2 className="text-xl font-serif font-bold" style={{ color: 'var(--t-text)' }}>Admin Access</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-[#ff6b35] transition-colors"
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-[#ff6b35] transition-colors"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors">
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
