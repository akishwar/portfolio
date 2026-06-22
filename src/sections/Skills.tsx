import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAdmin } from '../context/AdminContext';

gsap.registerPlugin(ScrollTrigger);

function SkillBar({ skill, index }: { skill: { name: string; percentage: number; icon: string }; index: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = barRef.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => setIsVisible(true)
    });

    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (isVisible && progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${skill.percentage}%`,
        duration: 1.2,
        delay: index * 0.1,
        ease: 'expo.out'
      });
    }
  }, [isVisible, skill.percentage, index]);

  return (
    <div
      ref={barRef}
      className="group p-6 rounded-xl border
        hover:border-[#ff6b35]/50
        hover:scale-[1.02] transition-all duration-300"
      style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl group-hover:scale-110 transition-transform">{skill.icon}</span>
          <span className="font-semibold group-hover:text-[#ff6b35] transition-colors"
            style={{ color: 'var(--t-text)' }}>
            {skill.name}
          </span>
        </div>
        <span className="text-[#ff6b35] font-bold">{skill.percentage}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--t-border)' }}>
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] rounded-full relative"
          style={{ width: '0%' }}
        >
          <div className="absolute inset-0 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function Skills() {
  const { data } = useAdmin();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      if (skillsRef.current) {
        const cards = skillsRef.current.querySelectorAll('.skill-card');
        gsap.fromTo(cards,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: skillsRef.current,
              start: 'top 80%',
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
      id="skills"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--t-bg-soft)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] 
        bg-[#ff6b35]/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="text-sm text-[#ff6b35] uppercase tracking-widest mb-4 block">
            Expertise
          </span>
          <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-4 text-glow"
            style={{ color: 'var(--t-text)' }}>
            Skills & Technologies
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--t-text-secondary)' }}>
            Technologies I work with daily to bring ideas to life.
          </p>
        </div>

        {/* Skills Grid */}
        <div ref={skillsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.skills.map((skill, index) => (
            <div key={skill.id} className="skill-card">
              <SkillBar skill={skill} index={index} />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl border hover:border-[#ff6b35]/30 transition-colors"
            style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)' }}>
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--t-text)' }}>Fast Performance</h3>
            <p className="text-sm" style={{ color: 'var(--t-text-secondary)' }}>Optimized code for lightning-fast load times</p>
          </div>
          <div className="text-center p-8 rounded-2xl border hover:border-[#ff6b35]/30 transition-colors"
            style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)' }}>
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--t-text)' }}>Responsive Design</h3>
            <p className="text-sm" style={{ color: 'var(--t-text-secondary)' }}>Flawless experience across all devices</p>
          </div>
          <div className="text-center p-8 rounded-2xl border hover:border-[#ff6b35]/30 transition-colors"
            style={{ backgroundColor: 'var(--t-bg-card)', borderColor: 'var(--t-border)' }}>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--t-text)' }}>Secure Code</h3>
            <p className="text-sm" style={{ color: 'var(--t-text-secondary)' }}>Best practices for security and reliability</p>
          </div>
        </div>
      </div>
    </section>
  );
}
