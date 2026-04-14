import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Smartphone, Cloud, Palette } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Code2,
    title: 'Website Development',
    description: 'Building responsive, high-performance websites with modern technologies.'
  },
  {
    icon: Smartphone,
    title: 'App Development',
    description: 'Native and cross-platform mobile applications for iOS and Android.'
  },
  {
    icon: Cloud,
    title: 'Cloud Solutions',
    description: 'Reliable, scalable cloud infrastructure and deployment services.'
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Creating beautiful, intuitive user interfaces and experiences.'
  }
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;

        gsap.to({ value: 0 }, {
          value: target,
          duration: 1.5,
          ease: 'expo.out',
          onUpdate: function() {
            setCount(Math.round(this.targets()[0].value));
          }
        });
      }
    });

    return () => trigger.kill();
  }, [target]);

  return (
    <span ref={counterRef} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

export default function About() {
  const { data } = useAdmin();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple title fade in (no word splitting to avoid spacing bugs)
      gsap.fromTo(titleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Timeline line grow
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Service cards 3D flip
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.service-card');
        gsap.fromTo(cards,
          { rotateY: -90, opacity: 0 },
          {
            rotateY: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Stats animation
      if (statsRef.current) {
        gsap.fromTo(statsRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--t-bg)' }}
    >
      {/* Background diagonal gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255,107,53,0.05) 50%, transparent 100%)'
        }}
      />

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Service Cards */}
          <div className="relative">
            {/* Vertical line */}
            <div 
              ref={lineRef}
              className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-[#ff6b35] via-[#ff6b35]/50 to-transparent origin-top hidden lg:block"
            />

            <div className="lg:pl-8">
              <h2 ref={titleRef} className="text-4xl lg:text-5xl font-serif font-bold mb-8"
                style={{ color: 'var(--t-text)' }}>
                About Me
              </h2>

              <p className="text-lg leading-relaxed mb-12 max-w-lg"
                style={{ color: 'var(--t-text-secondary)' }}>
                {data.about.description}
              </p>

              <div ref={cardsRef} className="grid sm:grid-cols-2 gap-6 perspective-1200">
                {services.map((service, index) => (
                  <div
                    key={service.title}
                    className="service-card group p-6 rounded-xl border
                      hover:border-[#ff6b35]/50
                      hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,107,53,0.15)]
                      transition-all duration-350 preserve-3d"
                    style={{
                      backgroundColor: 'var(--t-bg-card)',
                      borderColor: 'var(--t-border)',
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      <service.icon 
                        size={32} 
                        className="text-[#ff6b35] group-hover:text-[#ff8c5a] transition-colors" 
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-[#ff6b35] transition-colors"
                      style={{ color: 'var(--t-text)' }}>
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed"
                      style={{ color: 'var(--t-text-muted)' }}>
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="flex flex-col justify-center">
            <div ref={statsRef} className="space-y-8">
              <div className="text-center lg:text-left">
                <span className="text-sm uppercase tracking-widest mb-4 block"
                  style={{ color: 'var(--t-text-muted)' }}>
                  My Track Record
                </span>
                <h3 className="text-2xl lg:text-3xl font-serif font-bold"
                  style={{ color: 'var(--t-text)' }}>
                  Numbers that speak for themselves
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl border group hover:border-[#ff6b35]/30 transition-colors"
                  style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)' }}>
                  <div className="text-4xl lg:text-5xl font-bold text-gradient mb-2 group-hover:scale-105 transition-transform">
                    <AnimatedCounter target={data.about.stats.projects} suffix="+" />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--t-text-muted)' }}>Projects Completed</div>
                </div>

                <div className="text-center p-6 rounded-xl border group hover:border-[#ff6b35]/30 transition-colors"
                  style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)' }}>
                  <div className="text-4xl lg:text-5xl font-bold text-gradient mb-2 group-hover:scale-105 transition-transform">
                    <AnimatedCounter target={data.about.stats.satisfaction} suffix="%" />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--t-text-muted)' }}>Client Satisfaction</div>
                </div>

                <div className="text-center p-6 rounded-xl border group hover:border-[#ff6b35]/30 transition-colors"
                  style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)' }}>
                  <div className="text-4xl lg:text-5xl font-bold text-gradient mb-2 group-hover:scale-105 transition-transform">
                    <AnimatedCounter target={data.about.stats.experience} suffix="+" />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--t-text-muted)' }}>Years Experience</div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-[#ff6b35]/10 to-transparent border border-[#ff6b35]/20 rounded-xl">
                <p className="italic" style={{ color: 'var(--t-text-secondary)' }}>
                  "I focus on writing efficient algorithms and robust architectures that can naturally scale over time. Bringing innovative ideas to life is what drives me."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
