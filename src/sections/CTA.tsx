import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CTAProps {
  onContactClick: () => void;
}

export default function CTA({ onContactClick }: CTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline fade in (simplified — no char split to avoid spacing issues)
      gsap.fromTo(headlineRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Content fade in
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--t-bg)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[600px] h-[600px] bg-[#ff6b35]/10 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            ref={headlineRef}
            className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold mb-6 text-glow"
            style={{ color: 'var(--t-text)' }}
          >
            Let's Work Together
          </h2>

          <div ref={contentRef}>
            <p className="text-xl mb-10" style={{ color: 'var(--t-text-secondary)' }}>
              Have a project in mind? Let's create something amazing.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onContactClick}
                className="group px-10 py-4 bg-[#ff6b35] text-white rounded-full font-medium text-lg
                  hover:bg-[#ff8c5a] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,107,53,0.5)]
                  transition-all duration-300 flex items-center gap-2 animate-pulse-glow"
              >
                Start a Project
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onContactClick}
                className="group px-10 py-4 border rounded-full font-medium text-lg
                  hover:border-[#ff6b35] hover:text-[#ff6b35]
                  transition-all duration-300 flex items-center gap-2"
                style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
              >
                <Mail size={20} />
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
