import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

gsap.registerPlugin(ScrollTrigger);

export default function Blog() {
  const { data } = useAdmin();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Blog cards stagger
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.blog-card');
        gsap.fromTo(cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
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

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="text-sm text-[#ff6b35] uppercase tracking-widest mb-4 block">
            Blog
          </span>
          <h2 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-4">
            Latest Articles
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Thoughts on development, design, and technology.
          </p>
        </div>

        {/* Blog Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.blogPosts.map((post, index) => (
            <article
              key={post.id}
              className="blog-card group relative bg-[#111] border border-[#222] rounded-2xl overflow-hidden
                hover:border-[#ff6b35]/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,107,53,0.1)]
                transition-all duration-500"
              style={{ 
                animationDelay: `${index * 150}ms`,
                transform: index === 1 ? 'translateY(40px)' : index === 2 ? 'translateY(-20px)' : 'none'
              }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#ff6b35] rounded-full text-xs text-white font-medium">
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar size={14} />
                  {post.date}
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif font-bold text-white mb-3 
                  group-hover:text-[#ff6b35] transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Read more link */}
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm text-[#ff6b35] font-medium
                    group/link hover:gap-3 transition-all duration-300"
                >
                  Read More
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3.5 border border-[#333] text-white rounded-full font-medium
            hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-[#ff6b35]/10
            transition-all duration-300 flex items-center gap-2 mx-auto group">
            View All Articles
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
