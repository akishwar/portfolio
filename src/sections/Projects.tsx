import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const { data } = useAdmin();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const leftBtnRef = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);
  // GSAP tween ref so we can kill/override mid-animation
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  /* ── Title entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── Update arrow button disabled state without setState ── */
  const syncArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 4;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
    if (leftBtnRef.current)  leftBtnRef.current.disabled  = atStart;
    if (rightBtnRef.current) rightBtnRef.current.disabled = atEnd;
    if (leftBtnRef.current)  leftBtnRef.current.style.opacity  = atStart ? '0.3' : '1';
    if (rightBtnRef.current) rightBtnRef.current.style.opacity = atEnd   ? '0.3' : '1';
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncArrows();
    // passive scroll listener — no setState, no re-render
    el.addEventListener('scroll', syncArrows, { passive: true });
    return () => el.removeEventListener('scroll', syncArrows);
  }, [data.projects, syncArrows]);

  /* ── GSAP-powered smooth scroll (no browser smooth-scroll jank) ── */
  const animateScroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    // Kill any ongoing tween
    tweenRef.current?.kill();

    // Card width = container width / 3 (matching CSS), plus gap (24px)
    const cardWidth = el.clientWidth / 3 + 24;
    const target = Math.max(0, Math.min(
      el.scrollLeft + (dir === 'right' ? cardWidth : -cardWidth),
      el.scrollWidth - el.clientWidth
    ));

    // Animate el.scrollLeft directly via GSAP for smooth, native feel
    tweenRef.current = gsap.to(el, {
      scrollLeft: target,
      duration: 0.55,
      ease: 'power3.out',
      onUpdate: syncArrows,
    });
  }, [syncArrows]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--t-bg)' }}
    >
      {/* Background particles — stable positions (no Math.random in render) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#ff6b35]/25 rounded-full animate-float"
            style={{
              left: `${(i * 8.3 + 5) % 100}%`,
              top:  `${(i * 7.7 + 8) % 100}%`,
              animationDelay:    `${(i * 0.45).toFixed(2)}s`,
              animationDuration: `${9 + (i % 6) * 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-sm text-[#ff6b35] uppercase tracking-widest mb-4 block">
            Portfolio
          </span>
          <h2
            className="text-4xl lg:text-6xl font-serif font-bold mb-4"
            style={{ color: 'var(--t-text)' }}
          >
            Projects
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--t-text-secondary)' }}>
            Selected works that showcase my expertise and passion for creating exceptional digital experiences.
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center justify-end gap-2 mb-5">
          <button
            ref={leftBtnRef}
            onClick={() => animateScroll('left')}
            className="w-10 h-10 rounded-full border flex items-center justify-center
              transition-colors duration-200 cursor-pointer
              hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-[#ff6b35]/10
              disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)', opacity: 0.3 }}
            aria-label="Previous projects"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            ref={rightBtnRef}
            onClick={() => animateScroll('right')}
            className="w-10 h-10 rounded-full border flex items-center justify-center
              transition-colors duration-200 cursor-pointer
              hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-[#ff6b35]/10
              disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
            aria-label="Next projects"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Horizontal scroll container
            GPU-composited via transform: translateZ(0) + will-change
            NO scroll-snap (fights GSAP), NO scroll-behavior:smooth (browser jank) */}
        <div
          ref={scrollRef}
          className="flex gap-6 pb-4"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            /* GPU layer */
            willChange: 'scroll-position',
            transform: 'translateZ(0)',
            WebkitOverflowScrolling: 'touch',
            /* hide scrollbar */
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* webkit scrollbar hide */}
          <style>{`#projects-scroll::-webkit-scrollbar{display:none}`}</style>
          <div id="projects-scroll" />

          {data.projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-2xl overflow-hidden border shrink-0
                hover:border-[#ff6b35]/40 transition-colors duration-300
                hover:shadow-[0_20px_60px_rgba(255,107,53,0.12)]"
              style={{
                /* exactly 3 cards: (100% - 2 gaps of 24px) / 3 */
                width: 'calc((100% - 3rem) / 3)',
                minWidth: '280px',
                backgroundColor: 'var(--t-bg-card)',
                borderColor: 'var(--t-border)',
                /* GPU compositing for hover transforms */
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              {/* Image */}
              <div className="relative h-52 lg:h-60 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105"
                  style={{ transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(project.title)}&background=1a1a1a&color=ff6b35&size=400&bold=true`;
                  }}
                />

                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent
                    opacity-60 group-hover:opacity-80"
                  style={{ transition: 'opacity 0.4s ease' }}
                />

                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#ff6b35]/20 border border-[#ff6b35]/30
                  rounded-full text-xs text-[#ff6b35] font-medium backdrop-blur-sm
                  opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {project.category}
                </div>

                {/* Arrow button */}
                <a
                  href={project.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full
                    flex items-center justify-center text-white hover:bg-[#ff6b35]
                    opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100"
                  style={{ transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                >
                  <ArrowUpRight size={18} />
                </a>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className="text-xl font-serif font-bold mb-2 group-hover:text-[#ff6b35]"
                  style={{ color: 'var(--t-text)', transition: 'color 0.25s ease' }}
                >
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--t-text-secondary)' }}>
                  {project.description}
                </p>
                <a
                  href={project.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#ff6b35] font-medium
                    hover:gap-3"
                  style={{ transition: 'gap 0.2s ease' }}
                >
                  View Project
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Glow overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, transparent 60%, rgba(255,107,53,0.08) 100%)',
                  transition: 'opacity 0.4s ease',
                }}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {data.projects.length > 3 && (
          <div className="flex justify-center gap-2 mt-6">
            {data.projects.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  tweenRef.current?.kill();
                  const cardWidth = el.clientWidth / 3 + 24;
                  tweenRef.current = gsap.to(el, {
                    scrollLeft: i * cardWidth,
                    duration: 0.55,
                    ease: 'power3.out',
                    onUpdate: syncArrows,
                  });
                }}
                className="w-2 h-2 rounded-full transition-all duration-300 hover:scale-125"
                style={{ backgroundColor: 'var(--t-border)' }}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
