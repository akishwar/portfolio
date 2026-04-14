import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Github, Dribbble, ArrowUpRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

gsap.registerPlugin(ScrollTrigger);

const quickLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Skills', href: '#skills' },
  { name: 'Contact', href: '#contact' }
];

const services = [
  'Web Development',
  'App Development',
  'UI/UX Design',
  'Cloud Solutions'
];

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/akishwar', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/in/akishwar', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/akishwar', label: 'GitHub' },
  { icon: Dribbble, href: '#', label: 'Dribbble' }
];

interface FooterProps {
  onContactClick: () => void;
}

export default function Footer({ onContactClick }: FooterProps) {
  const { data } = useAdmin();
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const columns = contentRef.current.querySelectorAll('.footer-column');
        gsap.fromTo(columns,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: footerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="relative py-16 lg:py-24 border-t overflow-hidden"
      style={{ backgroundColor: 'var(--t-bg-soft)', borderColor: 'var(--t-border)' }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="text-[20vw] font-serif font-bold select-none"
          style={{ color: 'var(--t-watermark)' }}>
          AL
        </span>
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        <div ref={contentRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="footer-column lg:col-span-1">
            <a href="#home" className="inline-block text-2xl font-serif font-bold mb-4"
              style={{ color: 'var(--t-text)' }}>
              Akishwar<span className="text-[#ff6b35]">.L</span>
            </a>
            <p className="mb-6 leading-relaxed" style={{ color: 'var(--t-text-muted)' }}>
              Passionate about software engineering and intuitive user experiences.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border
                    flex items-center justify-center
                    hover:bg-[#ff6b35]/10 hover:border-[#ff6b35]/50 hover:text-[#ff6b35] hover:scale-110
                    transition-all duration-300"
                  style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)', color: 'var(--t-text-secondary)' }}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="font-semibold mb-6" style={{ color: 'var(--t-text)' }}>Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className="hover:text-[#ff6b35] hover:translate-x-1 
                      inline-flex items-center gap-1 transition-all duration-200 group"
                    style={{ color: 'var(--t-text-muted)' }}
                  >
                    {link.name}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="font-semibold mb-6" style={{ color: 'var(--t-text)' }}>Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="hover:text-[#ff6b35] transition-colors duration-200 cursor-pointer"
                    style={{ color: 'var(--t-text-muted)' }}>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3 className="font-semibold mb-6" style={{ color: 'var(--t-text)' }}>Get in Touch</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm mb-1" style={{ color: 'var(--t-text-muted)' }}>Email</div>
                <a 
                  href={`mailto:${data.contact.email}`}
                  className="hover:text-[#ff6b35] transition-colors"
                  style={{ color: 'var(--t-text-secondary)' }}
                >
                  {data.contact.email}
                </a>
              </div>
              {data.contact.phone && (
                <div>
                  <div className="text-sm mb-1" style={{ color: 'var(--t-text-muted)' }}>Phone</div>
                  <a 
                    href={`tel:${data.contact.phone}`}
                    className="hover:text-[#ff6b35] transition-colors"
                    style={{ color: 'var(--t-text-secondary)' }}
                  >
                    {data.contact.phone}
                  </a>
                </div>
              )}
              <div>
                <div className="text-sm mb-1" style={{ color: 'var(--t-text-muted)' }}>Location</div>
                <span style={{ color: 'var(--t-text-secondary)' }}>{data.contact.location}</span>
              </div>
              <button
                onClick={onContactClick}
                className="mt-2 px-5 py-2.5 bg-[#ff6b35] text-white rounded-full text-sm font-medium
                  hover:bg-[#ff8c5a] hover:scale-105 transition-all duration-300"
              >
                Contact Me
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'var(--t-border)' }}>
          <p className="text-sm" style={{ color: 'var(--t-text-muted)' }}>
            © {new Date().getFullYear()} Akishwar L. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-[#ff6b35] transition-colors" style={{ color: 'var(--t-text-muted)' }}>
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#ff6b35] transition-colors" style={{ color: 'var(--t-text-muted)' }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
