import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown, Download } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function Hero() {
  const { data } = useAdmin();
  const sectionRef = useRef<HTMLElement>(null);
  const greetingRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<SVGSVGElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });

      // Greeting character animation
      if (greetingRef.current) {
        const chars = greetingRef.current.textContent?.split('') || [];
        greetingRef.current.innerHTML = chars.map(char => 
          `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
        
        tl.fromTo(greetingRef.current.querySelectorAll('span'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.03, ease: 'expo.out' }
        );
      }

      // Name clipPath reveal
      tl.fromTo(nameRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.8, ease: 'expo.out' },
        '-=0.3'
      );

      // Title word by word
      if (titleRef.current) {
        const words = titleRef.current.textContent?.split(' ') || [];
        titleRef.current.innerHTML = words.map(word => 
          `<span class="inline-block mr-3">${word}</span>`
        ).join('');
        
        tl.fromTo(titleRef.current.querySelectorAll('span'),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'expo.out' },
          '-=0.4'
        );
      }

      // Description line reveal
      tl.fromTo(descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
        '-=0.2'
      );

      // Buttons
      if (buttonsRef.current) {
        const btns = buttonsRef.current.querySelectorAll('button, a');
        tl.fromTo(btns,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'elastic.out(1, 0.5)' },
          '-=0.3'
        );
      }

      // Profile image 3D flip
      tl.fromTo(imageRef.current,
        { rotateY: 90, scale: 0.8, opacity: 0 },
        { rotateY: 0, scale: 1, opacity: 1, duration: 1, ease: 'expo.out' },
        '-=1'
      );

      // Frame stroke draw
      if (frameRef.current) {
        const circle = frameRef.current.querySelector('circle');
        if (circle) {
          const circumference = 2 * Math.PI * 140;
          gsap.set(circle, { strokeDasharray: circumference, strokeDashoffset: circumference });
          tl.to(circle,
            { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' },
            '-=0.8'
          );
        }
      }

      // Floating shapes pop in
      if (shapesRef.current) {
        const shapes = shapesRef.current.querySelectorAll('.shape');
        tl.fromTo(shapes,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'elastic.out(1, 0.5)' },
          '-=0.6'
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pt-20"
      style={{ backgroundColor: 'var(--t-bg)' }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ff6b35]/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#ff6b35]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(128,128,128,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(128,128,128,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-0 items-center w-full py-20">
          {/* Left Column - Content */}
          <div className="space-y-6 lg:pr-12">
            <span
              ref={greetingRef}
              className="inline-block text-xl lg:text-2xl font-light"
              style={{ color: 'var(--t-text-secondary)' }}
            >
              {data.hero.greeting}
            </span>

            <h1
              ref={nameRef}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold leading-tight whitespace-nowrap"
              style={{ color: 'var(--t-text)' }}
            >
              {data.hero.name}
            </h1>

            <h2
              ref={titleRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gradient"
            >
              {data.hero.title}
            </h2>

            <p
              ref={descRef}
              className="text-lg max-w-lg leading-relaxed"
              style={{ color: 'var(--t-text-secondary)' }}
            >
              {data.hero.description}
            </p>

            <div ref={buttonsRef} className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={scrollToProjects}
                className="group px-8 py-3.5 bg-[#ff6b35] text-white rounded-full font-medium
                  hover:bg-[#ff8c5a] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,107,53,0.5)]
                  transition-all duration-300 flex items-center gap-2"
              >
                View My Work
                <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
              </button>
              <a
                href={data.hero.resume || "/resume.pdf"}
                download="Akishwar_Resume"
                className="group px-8 py-3.5 border rounded-full font-medium
                  hover:border-[#ff6b35] hover:text-[#ff6b35]
                  transition-all duration-300 flex items-center gap-2"
                style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
              >
                Download Resume
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column - Profile Image */}
          <div className="relative flex justify-center lg:justify-end perspective-1000">
            <div
              ref={imageRef}
              className="relative preserve-3d group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Animated gradient frame */}
              <svg
                ref={frameRef}
                className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] animate-spin"
                style={{ animationDuration: '20s' }}
                viewBox="0 0 300 380"
              >
                <defs>
                  <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b35" />
                    <stop offset="50%" stopColor="#ff8c5a" />
                    <stop offset="100%" stopColor="#ff6b35" />
                  </linearGradient>
                </defs>
                <circle
                  cx="150"
                  cy="190"
                  r="140"
                  fill="none"
                  stroke="url(#frameGradient)"
                  strokeWidth="2"
                  opacity="0.6"
                />
              </svg>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#ff6b35]/20 rounded-full blur-[60px] animate-pulse-glow" />

              {/* Profile image */}
              <div className="relative w-[280px] h-[350px] sm:w-[320px] sm:h-[400px] lg:w-[360px] lg:h-[450px] rounded-full overflow-hidden
                border-2 group-hover:border-[#ff6b35]/50 transition-colors duration-500"
                style={{ borderColor: 'var(--t-border)' }}>
                <img
                  src={data.hero.profileImage}
                  alt={data.hero.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating shapes */}
              <div ref={shapesRef} className="absolute inset-0 pointer-events-none">
                <div className="shape absolute -top-8 -left-8 w-16 h-16 border-2 border-[#ff6b35]/40 rotate-45 animate-float" />
                <div className="shape absolute -bottom-4 -right-4 w-12 h-12 bg-[#ff6b35]/20 rounded-full animate-float-delayed" />
                <div className="shape absolute top-1/4 -right-12 w-8 h-8 border border-[#ff6b35]/30 rotate-12 animate-float" style={{ animationDelay: '-1s' }} />
                <div className="shape absolute bottom-1/4 -left-12 w-10 h-10 bg-gradient-to-br from-[#ff6b35]/30 to-transparent rounded-lg rotate-45 animate-float-delayed" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: `linear-gradient(to top, var(--t-bg), transparent)` }} />
    </section>
  );
}
