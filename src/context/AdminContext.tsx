import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';


export interface Project {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
  link?: string;
}

export interface BlogPost {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

export interface Skill {
  id: number;
  name: string;
  percentage: number;
  icon: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  title: string;
  image?: string;
}

export interface PortfolioData {
  hero: {
    greeting: string;
    name: string;
    title: string;
    description: string;
    profileImage: string;
    resume?: string;
  };
  about: {
    description: string;
    stats: {
      projects: number;
      satisfaction: number;
      experience: number;
    };
  };
  projects: Project[];
  skills: Skill[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  contact: {
    email: string;
    phone: string;
    location: string;
  };
}

const defaultData: PortfolioData = {
  hero: {
    greeting: 'Hello,',
    name: "I'm Akishwar L",
    title: 'B.Tech AI&DS Student',
    description: 'Passionate developer and part time full stack developer. I build robust and scalable web applications.',
    profileImage: '/hero-profile.jpg',
    resume: ''
  },
  about: {
    description: 'I am a B.Tech AI&DS student, passionate developer, and part-time full-stack developer focused on building scalable backend services and responsive frontend interfaces. My journey began with a deep curiosity for computer science, evolving into a career dedicated to developing efficient and user-centered applications.',
    stats: {
      projects: 15,
      satisfaction: 100,
      experience: 3
    }
  },
  projects: [
    {
      id: 1,
      category: 'Full Stack Application',
      title: 'Nyaya Sahayogi',
      description: 'An advanced legal analysis tool integrating OCR and LLM for robust case evaluation and evidence parsing.',
      image: '/project-1.jpg',
      link: 'https://github.com/akishwar/nyaya-sahayogi'
    },
    {
      id: 2,
      category: 'Web Application',
      title: 'Breast Cancer Risk App',
      description: 'A machine learning-powered web application assisting doctors with patient risk assessment based on geographical and demographic data.',
      image: '/project-2.jpg',
      link: 'https://github.com/akishwar/breast-cancer-risk'
    }
  ],
  skills: [
    { id: 1, name: 'React', percentage: 95, icon: '⚛️' },
    { id: 2, name: 'TypeScript', percentage: 90, icon: '📘' },
    { id: 3, name: 'Node.js', percentage: 88, icon: '🟢' },
    { id: 4, name: 'Python', percentage: 85, icon: '🐍' },
    { id: 5, name: 'AWS', percentage: 82, icon: '☁️' },
    { id: 6, name: 'GraphQL', percentage: 80, icon: '◈' },
    { id: 7, name: 'Docker', percentage: 78, icon: '🐳' },
    { id: 8, name: 'PostgreSQL', percentage: 85, icon: '🐘' }
  ],
  testimonials: [],
  blogPosts: [],
  contact: {
    email: 'lakishwar@gmail.com',
    phone: '',
    location: 'India'
  }
};

interface AdminContextType {
  data: PortfolioData;
  updateHero: (hero: Partial<PortfolioData['hero']>) => Promise<void>;
  updateAbout: (about: Partial<PortfolioData['about']>) => Promise<void>;
  updateProjects: (projects: Project[]) => Promise<void>;
  updateSkills: (skills: Skill[]) => Promise<void>;
  updateTestimonials: (testimonials: Testimonial[]) => Promise<void>;
  updateBlogPosts: (blogPosts: BlogPost[]) => Promise<void>;
  updateContact: (contact: Partial<PortfolioData['contact']>) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  removeProject: (id: number) => Promise<void>;
  updateProject: (id: number, project: Partial<Omit<Project, 'id'>>) => Promise<void>;
  addBlogPost: (post: Omit<BlogPost, 'id'>) => Promise<void>;
  removeBlogPost: (id: number) => Promise<void>;
  resetData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await fetch('/portfolio-data.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const jsonData = await response.json();
        if (isMounted) {
          setData(jsonData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching local portfolio data, falling back to default:', error);
        if (isMounted) {
          setData(defaultData);
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const { adminPassword } = useAuth();

  const persistData = useCallback(async (newData: PortfolioData) => {
    if (!adminPassword) {
      throw new Error('Session expired or admin password missing. Please log out and log in again.');
    }

    const response = await fetch('/api/update-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminPassword,
        data: newData
      })
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Conflict: The content was modified by someone else while you were editing. Please refresh to get the latest data and try again.');
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to save changes (${response.status})`);
    }

    setData(newData);
  }, [adminPassword]);

  const updateHero = useCallback(async (hero: Partial<PortfolioData['hero']>) => {
    await persistData({ ...data, hero: { ...data.hero, ...hero } });
  }, [data, persistData]);

  const updateAbout = useCallback(async (about: Partial<PortfolioData['about']>) => {
    await persistData({ ...data, about: { ...data.about, ...about } });
  }, [data, persistData]);

  const updateProjects = useCallback(async (projects: Project[]) => {
    await persistData({ ...data, projects });
  }, [data, persistData]);

  const updateSkills = useCallback(async (skills: Skill[]) => {
    await persistData({ ...data, skills });
  }, [data, persistData]);

  const updateTestimonials = useCallback(async (testimonials: Testimonial[]) => {
    await persistData({ ...data, testimonials });
  }, [data, persistData]);

  const updateBlogPosts = useCallback(async (blogPosts: BlogPost[]) => {
    await persistData({ ...data, blogPosts });
  }, [data, persistData]);

  const updateContact = useCallback(async (contact: Partial<PortfolioData['contact']>) => {
    await persistData({ ...data, contact: { ...data.contact, ...contact } });
  }, [data, persistData]);

  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now() };
    await persistData({ ...data, projects: [...data.projects, newProject] });
  }, [data, persistData]);

  const removeProject = useCallback(async (id: number) => {
    await persistData({ ...data, projects: data.projects.filter((project) => project.id !== id) });
  }, [data, persistData]);

  const updateProject = useCallback(async (id: number, project: Partial<Omit<Project, 'id'>>) => {
    await persistData({
      ...data,
      projects: data.projects.map((item) => item.id === id ? { ...item, ...project } : item)
    });
  }, [data, persistData]);

  const addBlogPost = useCallback(async (post: Omit<BlogPost, 'id'>) => {
    const newPost = { ...post, id: Date.now() };
    await persistData({ ...data, blogPosts: [...data.blogPosts, newPost] });
  }, [data, persistData]);

  const removeBlogPost = useCallback(async (id: number) => {
    await persistData({ ...data, blogPosts: data.blogPosts.filter((post) => post.id !== id) });
  }, [data, persistData]);

  const resetData = useCallback(async () => {
    await persistData(defaultData);
  }, [persistData]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#000000] flex items-center justify-center z-[9999]">
        <div className="w-10 h-10 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{
      data,
      updateHero,
      updateAbout,
      updateProjects,
      updateSkills,
      updateTestimonials,
      updateBlogPosts,
      updateContact,
      addProject,
      removeProject,
      updateProject,
      addBlogPost,
      removeBlogPost,
      resetData
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
