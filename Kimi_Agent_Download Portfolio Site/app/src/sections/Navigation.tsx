import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  scrolled: boolean;
  onContactClick: () => void;
  onLogoClick: () => void;
}

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Skills', href: '#skills' },
  { name: 'Contact', href: '#contact' }
];

export default function Navigation({ scrolled, onContactClick, onLogoClick }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(logoRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.8, ease: 'expo.out' }
      );

      if (linksRef.current) {
        const links = linksRef.current.querySelectorAll('a');
        tl.fromTo(links,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'expo.out' },
          '-=0.4'
        );
      }

      if (ctaRef.current) {
        tl.fromTo(ctaRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' },
          '-=0.2'
        );
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'h-[60px] glass border-b'
            : 'h-[80px] bg-transparent'
        }`}
        style={{ borderColor: scrolled ? 'var(--t-border)' : 'transparent' }}
      >
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
          {/* Logo */}
          <div ref={logoRef} className="flex items-center gap-4">
            <a
              href="#home"
              onClick={(e) => { e.preventDefault(); onLogoClick(); }}
              className={`font-serif font-bold transition-transform duration-300 cursor-pointer select-none ${
                scrolled ? 'text-xl scale-[0.85]' : 'text-2xl'
              }`}
              style={{ color: 'var(--t-text)' }}
            >
              Akishwar<span className="text-[#ff6b35]">.L</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div ref={linksRef} className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="relative text-sm hover:text-[#ff6b35] transition-colors duration-200 group"
                style={{ color: 'var(--t-text-secondary)' }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-[#ff6b35] transition-all duration-250 group-hover:w-full group-hover:left-0" />
              </a>
            ))}
          </div>

          {/* Right side buttons */}
          <div ref={ctaRef} className="hidden lg:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: 'var(--t-text)'
              }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* CTA Button */}
            <button
              onClick={onContactClick}
              className="px-6 py-2.5 border border-[#ff6b35] text-[#ff6b35] rounded-full text-sm font-medium
                hover:bg-[#ff6b35] hover:text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(255,107,53,0.4)]
                transition-all duration-300"
            >
              Let's Talk
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all"
              style={{ color: 'var(--t-text)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
              style={{ color: 'var(--t-text)' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-400 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 backdrop-blur-xl" style={{ backgroundColor: 'var(--t-overlay)' }} onClick={() => setMobileMenuOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-[280px] border-l p-8 pt-24
            transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ backgroundColor: 'var(--t-bg-soft)', borderColor: 'var(--t-border)' }}
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="text-xl hover:text-[#ff6b35] transition-colors duration-200"
                style={{ color: 'var(--t-text-secondary)', animationDelay: `${index * 80}ms` }}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); onContactClick(); }}
              className="mt-4 px-6 py-3 bg-[#ff6b35] text-white rounded-full text-center font-medium
                hover:bg-[#ff8c5a] transition-colors duration-300"
            >
              Let's Talk
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
