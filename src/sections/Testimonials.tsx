import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const { data } = useAdmin();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
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

      // Carousel entrance
      gsap.fromTo(carouselRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: carouselRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % data.testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, data.testimonials.length]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((activeIndex + 1) % data.testimonials.length);
  };

  const prevSlide = () => {
    goToSlide((activeIndex - 1 + data.testimonials.length) % data.testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="text-sm text-[#ff6b35] uppercase tracking-widest mb-4 block">
            Testimonials
          </span>
          <h2 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-4">
            Client Reviews
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            What people say about working with me.
          </p>
        </div>

        {/* 3D Carousel */}
        <div 
          ref={carouselRef}
          className="relative max-w-4xl mx-auto perspective-1200"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative h-[400px] lg:h-[350px]">
            {data.testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex;
              const isPrev = index === (activeIndex - 1 + data.testimonials.length) % data.testimonials.length;
              const isNext = index === (activeIndex + 1) % data.testimonials.length;

              let transform = 'translateZ(-100px) rotateY(0deg) scale(0.8)';
              let opacity = 0;
              let zIndex = 0;

              if (isActive) {
                transform = 'translateZ(100px) rotateY(0deg) scale(1)';
                opacity = 1;
                zIndex = 3;
              } else if (isPrev) {
                transform = 'translateZ(-50px) rotateY(25deg) scale(0.85)';
                opacity = 0.6;
                zIndex = 2;
              } else if (isNext) {
                transform = 'translateZ(-50px) rotateY(-25deg) scale(0.85)';
                opacity = 0.6;
                zIndex = 2;
              }

              return (
                <div
                  key={testimonial.id}
                  className="absolute inset-0 preserve-3d transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform,
                    opacity,
                    zIndex,
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  <div className="h-full p-8 lg:p-12 bg-[#111] border border-[#222] rounded-2xl
                    hover:border-[#ff6b35]/30 transition-colors duration-300 flex flex-col justify-center">
                    {/* Quote icon */}
                    <div className="mb-6">
                      <Quote size={40} className="text-[#ff6b35]/50" />
                    </div>

                    {/* Quote text */}
                    <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-8 italic">
                      "{testimonial.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] 
                        flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.title}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16
              w-12 h-12 rounded-full bg-[#222] border border-[#333] text-white
              flex items-center justify-center
              hover:bg-[#ff6b35] hover:border-[#ff6b35] hover:scale-110
              transition-all duration-300 z-10"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16
              w-12 h-12 rounded-full bg-[#222] border border-[#333] text-white
              flex items-center justify-center
              hover:bg-[#ff6b35] hover:border-[#ff6b35] hover:scale-110
              transition-all duration-300 z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {data.testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-[#ff6b35] scale-125'
                    : 'bg-[#333] hover:bg-[#555]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
