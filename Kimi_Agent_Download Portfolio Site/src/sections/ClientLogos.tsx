import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Globe, Layers, Zap, Shield, Database } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const clients = [
  { name: 'TechCorp', icon: Cpu },
  { name: 'GlobalNet', icon: Globe },
  { name: 'LayerStack', icon: Layers },
  { name: 'FastFlow', icon: Zap },
  { name: 'SecureHub', icon: Shield },
  { name: 'DataPrime', icon: Database }
];

export default function ClientLogos() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.fromTo(sectionRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );

      gsap.fromTo(trackRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
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
      className="relative py-16 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />

      <div ref={trackRef} className="relative">
        {/* First track */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {[...clients, ...clients].map((client, index) => (
            <div
              key={`${client.name}-${index}`}
              className="flex-shrink-0 mx-12 lg:mx-20 group cursor-pointer"
            >
              <div className="flex items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <client.icon 
                  size={40} 
                  className="text-gray-400 group-hover:text-[#ff6b35] transition-colors duration-300 group-hover:scale-110 transform" 
                />
                <span className="text-xl font-semibold text-gray-400 group-hover:text-white transition-colors duration-300">
                  {client.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-gray-600 uppercase tracking-widest">
        Trusted By Industry Leaders
      </div>
    </section>
  );
}
