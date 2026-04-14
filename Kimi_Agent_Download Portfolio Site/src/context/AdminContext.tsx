import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
    greeting: "Hello,",
    name: "I'm Akishwar L",
    title: "B.Tech AI&DS Student",
    description: "Passionate developer and part time full stack developer. I build robust and scalable web applications.",
    profileImage: "/hero-profile.jpg",
    resume: ""
  },
  about: {
    description: "I am a B.Tech AI&DS student, passionate developer, and part-time full-stack developer focused on building scalable backend services and responsive frontend interfaces. My journey began with a deep curiosity for computer science, evolving into a career dedicated to developing efficient and user-centered applications.",
    stats: {
      projects: 15,
      satisfaction: 100,
      experience: 3
    }
  },
  projects: [
    {
      id: 1,
      category: "Full Stack Application",
      title: "Nyaya Sahayogi",
      description: "An advanced legal analysis tool integrating OCR and LLM for robust case evaluation and evidence parsing.",
      image: "/project-1.jpg",
      link: "https://github.com/akishwar/nyaya-sahayogi"
    },
    {
      id: 2,
      category: "Web Application",
      title: "Breast Cancer Risk App",
      description: "A machine learning-powered web application assisting doctors with patient risk assessment based on geographical and demographic data.",
      image: "/project-2.jpg",
      link: "https://github.com/akishwar/breast-cancer-risk"
    }
  ],
  skills: [
    { id: 1, name: "React", percentage: 95, icon: "⚛️" },
    { id: 2, name: "TypeScript", percentage: 90, icon: "📘" },
    { id: 3, name: "Node.js", percentage: 88, icon: "🟢" },
    { id: 4, name: "Python", percentage: 85, icon: "🐍" },
    { id: 5, name: "AWS", percentage: 82, icon: "☁️" },
    { id: 6, name: "GraphQL", percentage: 80, icon: "◈" },
    { id: 7, name: "Docker", percentage: 78, icon: "🐳" },
    { id: 8, name: "PostgreSQL", percentage: 85, icon: "🐘" }
  ],
  testimonials: [],
  blogPosts: [],
  contact: {
    email: "lakishwar@gmail.com",
    phone: "",
    location: "India"
  }
};

interface AdminContextType {
  data: PortfolioData;
  updateHero: (hero: Partial<PortfolioData['hero']>) => void;
  updateAbout: (about: Partial<PortfolioData['about']>) => void;
  updateProjects: (projects: Project[]) => void;
  updateSkills: (skills: Skill[]) => void;
  updateTestimonials: (testimonials: Testimonial[]) => void;
  updateBlogPosts: (blogPosts: BlogPost[]) => void;
  updateContact: (contact: Partial<PortfolioData['contact']>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  removeProject: (id: number) => void;
  updateProject: (id: number, project: Partial<Omit<Project, 'id'>>) => void;
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
  removeBlogPost: (id: number) => void;
  resetData: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "portfolio", "data"), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as PortfolioData);
      } else {
        setDoc(doc(db, "portfolio", "data"), defaultData);
        setData(defaultData);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateHero = useCallback((hero: Partial<PortfolioData['hero']>) => {
    setData(prev => {
      const newData = { ...prev, hero: { ...prev.hero, ...hero } };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const updateAbout = useCallback((about: Partial<PortfolioData['about']>) => {
    setData(prev => {
      const newData = { ...prev, about: { ...prev.about, ...about } };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const updateProjects = useCallback((projects: Project[]) => {
    setData(prev => {
      const newData = { ...prev, projects };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const updateSkills = useCallback((skills: Skill[]) => {
    setData(prev => {
      const newData = { ...prev, skills };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const updateTestimonials = useCallback((testimonials: Testimonial[]) => {
    setData(prev => {
      const newData = { ...prev, testimonials };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const updateBlogPosts = useCallback((blogPosts: BlogPost[]) => {
    setData(prev => {
      const newData = { ...prev, blogPosts };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const updateContact = useCallback((contact: Partial<PortfolioData['contact']>) => {
    setData(prev => {
      const newData = { ...prev, contact: { ...prev.contact, ...contact } };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    setData(prev => {
      const newProject = { ...project, id: Date.now() };
      const newData = { ...prev, projects: [...prev.projects, newProject] };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const removeProject = useCallback((id: number) => {
    setData(prev => {
      const newData = { ...prev, projects: prev.projects.filter(p => p.id !== id) };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const updateProject = useCallback((id: number, project: Partial<Omit<Project, 'id'>>) => {
    setData(prev => {
      const newData = {
        ...prev,
        projects: prev.projects.map(p => p.id === id ? { ...p, ...project } : p)
      };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const addBlogPost = useCallback((post: Omit<BlogPost, 'id'>) => {
    setData(prev => {
      const newPost = { ...post, id: Date.now() };
      const newData = { ...prev, blogPosts: [...prev.blogPosts, newPost] };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const removeBlogPost = useCallback((id: number) => {
    setData(prev => {
      const newData = { ...prev, blogPosts: prev.blogPosts.filter(p => p.id !== id) };
      setDoc(doc(db, "portfolio", "data"), newData);
      return newData;
    });
  }, []);

  const resetData = useCallback(() => {
    setData(defaultData);
    setDoc(doc(db, "portfolio", "data"), defaultData);
  }, []);

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
