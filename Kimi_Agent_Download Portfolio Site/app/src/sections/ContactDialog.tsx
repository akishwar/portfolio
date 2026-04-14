import { useState } from 'react';
import { X, Mail, Send, User, MessageSquare, CheckCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactDialog({ isOpen, onClose }: ContactDialogProps) {
  const { data } = useAdmin();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${data.contact.email}`, {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            subject: `New Portfolio Message from ${name}`,
            message,
            _captcha: "false"
        })
      });

      if (response.ok) {
        setLoading(false);
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
          onClose();
        }, 3000);
      } else {
        setLoading(false);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      alert('An error occurred while sending the message. Please try again later.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-200 dark:border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff6b35]/20 rounded-full flex items-center justify-center">
              <Mail className="text-[#ff6b35]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Get in Touch</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">I'd love to hear from you!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center
              text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {sent ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
            <p className="text-gray-500 dark:text-gray-400">Thank you for reaching out. I'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={onSubmitHandler} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Your Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg
                      text-gray-900 dark:text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/40 focus:border-[#ff6b35] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg
                      text-gray-900 dark:text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/40 focus:border-[#ff6b35] transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Project Inquiry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg
                  text-gray-900 dark:text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/40 focus:border-[#ff6b35] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Message</label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="message"
                  placeholder="Tell me about your project..."
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg
                    text-gray-900 dark:text-white placeholder-gray-400 resize-none
                    focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/40 focus:border-[#ff6b35] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white font-medium rounded-lg
                flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(255,107,53,0.4)]
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
