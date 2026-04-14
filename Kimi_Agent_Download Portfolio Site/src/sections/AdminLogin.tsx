import { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '25') {
      setUsername('');
      setPassword('');
      setError('');
      setIsOpen(false);
      onLoginSuccess();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-[#111] border border-[#333] p-3 rounded-full text-gray-400 hover:text-white hover:border-[#ff6b35] transition-all shadow-lg group"
        aria-label="Admin Login"
      >
        <Lock size={18} className="group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#333] rounded-lg w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-[#ff6b35]" size={24} />
              </div>
              <h2 className="text-xl font-serif text-white">Admin Access</h2>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username (admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
              </div>
              
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              
              <button
                type="submit"
                className="w-full bg-[#ff6b35] hover:bg-[#ff8c5a] text-white font-medium py-2 rounded-md transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
