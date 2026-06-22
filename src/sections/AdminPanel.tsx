import { useEffect, useState } from 'react';
import {
  X, User, Code, FileText, Settings, RotateCcw, Plus, Trash2,
  Pencil, Check, ExternalLink, Zap, Info, LogOut
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import type { Project, Skill } from '../context/AdminContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'hero', label: 'Hero', icon: User },
  { id: 'about', label: 'About Me', icon: Info },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'contact', label: 'Contact', icon: Settings },
];

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const {
    data,
    updateHero,
    updateAbout,
    updateContact,
    updateSkills,
    addProject,
    removeProject,
    updateProject,
    addBlogPost,
    removeBlogPost,
    resetData
  } = useAdmin();
  const { logout, adminPassword } = useAuth();

  const [activeTab, setActiveTab] = useState('hero');
  const [heroForm, setHeroForm] = useState(data.hero);
  const [aboutForm, setAboutForm] = useState(data.about);
  const [contactForm, setContactForm] = useState(data.contact);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({ category: '', title: '', description: '', image: '', link: '' });
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<Omit<Project, 'id'>>>({});
  const [newSkill, setNewSkill] = useState({ name: '', percentage: 80, icon: '⚡' });
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingSkill, setEditingSkill] = useState<Partial<Omit<Skill, 'id'>>>({});
  const [newBlogPost, setNewBlogPost] = useState({ category: '', title: '', excerpt: '', image: '' });

  useEffect(() => {
    setHeroForm(data.hero);
    setAboutForm(data.about);
    setContactForm(data.contact);
  }, [data]);

  const beginSave = (section: string) => {
    setSavingSection(section);
    setSaveMessage('');
    setSaveError('');
  };

  const finishSave = (message: string) => {
    setSavingSection(null);
    setSaveError('');
    setSaveMessage(`${message} — site will update in ~30-60s`);
  };

  const failSave = (error: unknown) => {
    setSavingSection(null);
    setSaveMessage('');
    setSaveError(error instanceof Error ? error.message : 'Update failed. Please try again.');
  };

  const uploadImage = async (file: File, folder: 'hero' | 'projects' | 'blog' | 'resume'): Promise<string> => {
    if (!adminPassword) {
      throw new Error('Admin password missing. Please log in again.');
    }

    const isDocument = file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc');

    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      
      if (isDocument) {
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read document'));
        reader.readAsDataURL(file);
        return;
      }

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > width && height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminPassword,
        fileName: file.name,
        fileBase64,
        folder
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.error || `Upload failed (${response.status})`);
    }

    const data = await response.json();
    return data.path;
  };

  const handleAddProject = async () => {
    if (newProject.title && newProject.description) {
      beginSave('projects');
      try {
        await addProject({ ...newProject });
        setNewProject({ category: '', title: '', description: '', image: '', link: '' });
        finishSave('Project added successfully.');
      } catch (error) {
        failSave(error);
      }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProject({
      category: project.category,
      title: project.title,
      description: project.description,
      image: project.image,
      link: project.link || ''
    });
  };

  const handleSaveProject = async () => {
    if (editingProjectId !== null) {
      beginSave('projects');
      try {
        await updateProject(editingProjectId, editingProject);
        setEditingProjectId(null);
        setEditingProject({});
        finishSave('Project updated successfully.');
      } catch (error) {
        failSave(error);
      }
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.name) {
      beginSave('skills');
      try {
        await updateSkills([...data.skills, { id: Date.now(), ...newSkill }]);
        setNewSkill({ name: '', percentage: 80, icon: '⚡' });
        finishSave('Skill added successfully.');
      } catch (error) {
        failSave(error);
      }
    }
  };

  const handleRemoveSkill = async (id: number) => {
    beginSave('skills');
    try {
      await updateSkills(data.skills.filter((skill) => skill.id !== id));
      finishSave('Skill removed successfully.');
    } catch (error) {
      failSave(error);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkillId(skill.id);
    setEditingSkill({ name: skill.name, percentage: skill.percentage, icon: skill.icon });
  };

  const handleSaveSkill = async () => {
    if (editingSkillId !== null) {
      beginSave('skills');
      try {
        await updateSkills(data.skills.map((skill) => skill.id === editingSkillId ? { ...skill, ...editingSkill } : skill));
        setEditingSkillId(null);
        setEditingSkill({});
        finishSave('Skill updated successfully.');
      } catch (error) {
        failSave(error);
      }
    }
  };

  const handleAddBlogPost = async () => {
    if (newBlogPost.title && newBlogPost.excerpt) {
      beginSave('blog');
      try {
        await addBlogPost({
          ...newBlogPost,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
        setNewBlogPost({ category: '', title: '', excerpt: '', image: '' });
        finishSave('Blog post added successfully.');
      } catch (error) {
        failSave(error);
      }
    }
  };

  const handleRemoveProject = async (id: number) => {
    beginSave('projects');
    try {
      await removeProject(id);
      finishSave('Project removed successfully.');
    } catch (error) {
      failSave(error);
    }
  };

  const handleRemoveBlogPost = async (id: number) => {
    beginSave('blog');
    try {
      await removeBlogPost(id);
      finishSave('Blog post removed successfully.');
    } catch (error) {
      failSave(error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSavingSection('image-upload');
      setSaveMessage('');
      setSaveError('');
      try {
        const url = await uploadImage(file, 'hero');
        setHeroForm((prev) => ({ ...prev, profileImage: url }));
        setSavingSection(null);
        setSaveMessage('Image uploaded — click Update Hero to apply it');
      } catch (error) {
        setSavingSection(null);
        setSaveError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      }
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      setSavingSection('image-upload');
      setSaveMessage('');
      setSaveError('');
      try {
        const url = await uploadImage(file, 'projects');
        if (isEditing) {
          setEditingProject((prev) => ({ ...prev, image: url }));
        } else {
          setNewProject((prev) => ({ ...prev, image: url }));
        }
        setSavingSection(null);
        setSaveMessage('Image uploaded — click Save to apply it');
      } catch (error) {
        setSavingSection(null);
        setSaveError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      }
    }
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSavingSection('image-upload');
      setSaveMessage('');
      setSaveError('');
      try {
        const url = await uploadImage(file, 'blog');
        setNewBlogPost((prev) => ({ ...prev, image: url }));
        setSavingSection(null);
        setSaveMessage('Image uploaded — click Add Post to apply it');
      } catch (error) {
        setSavingSection(null);
        setSaveError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      }
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSavingSection('image-upload');
      setSaveMessage('');
      setSaveError('');
      try {
        const url = await uploadImage(file, 'resume');
        setHeroForm((prev) => ({ ...prev, resume: url }));
        setSavingSection(null);
        setSaveMessage('Resume uploaded — click Update Hero to apply it');
      } catch (error) {
        setSavingSection(null);
        setSaveError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      }
    }
  };

  const handleUpdateHero = async () => {
    beginSave('hero');
    try {
      await updateHero(heroForm);
      finishSave('Hero section updated successfully.');
    } catch (error) {
      failSave(error);
    }
  };

  const handleUpdateAbout = async () => {
    beginSave('about');
    try {
      await updateAbout(aboutForm);
      finishSave('About section updated successfully.');
    } catch (error) {
      failSave(error);
    }
  };

  const handleUpdateContact = async () => {
    beginSave('contact');
    try {
      await updateContact(contactForm);
      finishSave('Contact section updated successfully.');
    } catch (error) {
      failSave(error);
    }
  };

  const handleReset = async () => {
    beginSave('reset');
    try {
      await resetData();
      finishSave('Portfolio reset successfully.');
    } catch (error) {
      failSave(error);
    }
  };

  const handleLogout = async () => {
    beginSave('auth');
    try {
      await logout();
      finishSave('Logged out successfully.');
      onClose();
    } catch (error) {
      failSave(error);
    }
  };

  if (!isOpen) return null;

  const inputClass = 'w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff6b35] transition-colors mt-1';
  const textareaClass = 'w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff6b35] transition-colors mt-1 min-h-[100px] resize-none';
  const labelClass = 'text-sm text-gray-400 block';
  const saveBtnClass = 'flex-1 py-1.5 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md text-sm font-medium flex items-center justify-center gap-1 transition-colors';
  const cancelBtnClass = 'flex-1 py-1.5 border border-[#333] text-gray-400 hover:text-white rounded-md text-sm font-medium transition-colors';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0a0a0a] border border-[#333] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] shrink-0">
          <h2 className="text-xl font-serif text-white flex items-center gap-2">
            <Settings className="text-[#ff6b35]" size={20} />
            Admin Panel
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="px-3 py-1.5 border border-[#333] rounded-md text-sm text-gray-400 hover:text-white hover:border-[#ff6b35] transition-colors flex items-center gap-1">
              <LogOut size={14} /> Logout
            </button>
            <button onClick={handleReset} className="px-3 py-1.5 border border-[#333] rounded-md text-sm text-gray-400 hover:text-white hover:border-[#ff6b35] transition-colors flex items-center gap-1">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={onClose} className="px-2 py-1.5 border border-[#333] rounded-md text-gray-400 hover:text-white hover:border-[#ff6b35] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="flex flex-1 min-h-0">
          <div className="w-48 bg-[#111] border-r border-[#222] p-2 space-y-1 shrink-0 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-[#ff6b35]/20 text-[#ff6b35]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {savingSection === 'image-upload' && <div className="mb-4 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 animate-pulse">Uploading image...</div>}
            {saveMessage && <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">{saveMessage}</div>}
            {saveError && <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 break-words">{saveError}</div>}

            {activeTab === 'hero' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>
                <div><label className={labelClass}>Greeting</label><input value={heroForm.greeting} onChange={(e) => setHeroForm((prev) => ({ ...prev, greeting: e.target.value }))} className={inputClass} /></div>
                <div><label className={labelClass}>Name</label><input value={heroForm.name} onChange={(e) => setHeroForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} /></div>
                <div><label className={labelClass}>Title</label><input value={heroForm.title} onChange={(e) => setHeroForm((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} /></div>
                <div><label className={labelClass}>Description</label><textarea value={heroForm.description} onChange={(e) => setHeroForm((prev) => ({ ...prev, description: e.target.value }))} className={textareaClass} /></div>
                <div>
                  <label className={labelClass}>Profile Image (Upload)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className={inputClass + ' file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#ff6b35] file:text-white hover:file:bg-[#ff8c5a] cursor-pointer'} />
                  <p className="text-xs text-gray-500 mt-1">Upload your photo directly from your computer, then click Update Hero.</p>
                </div>
                <div>
                  <label className={labelClass}>Resume (Upload)</label>
                  <input type="file" accept=".pdf,.docx,.doc,.jpg,.jpeg" onChange={handleResumeUpload} className={inputClass + ' file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#ff6b35] file:text-white hover:file:bg-[#ff8c5a] cursor-pointer'} />
                  <p className="text-xs text-gray-500 mt-1">Upload your resume, then click Update Hero to save the link.</p>
                </div>
                <button onClick={handleUpdateHero} disabled={savingSection === 'hero'} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:opacity-60 text-white rounded-md font-medium transition-colors">
                  {savingSection === 'hero' ? 'Updating Hero...' : 'Update Hero'}
                </button>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white mb-4">About Me</h3>
                <div>
                  <label className={labelClass}>About Description</label>
                  <textarea value={aboutForm.description} onChange={(e) => setAboutForm((prev) => ({ ...prev, description: e.target.value }))} className={`${textareaClass} min-h-[140px]`} />
                </div>
                <div>
                  <label className={labelClass + ' mb-2'}>Stats</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div><label className="text-xs text-gray-500 block mb-1">Projects Completed</label><input type="number" value={aboutForm.stats.projects} onChange={(e) => setAboutForm((prev) => ({ ...prev, stats: { ...prev.stats, projects: parseInt(e.target.value) || 0 } }))} className={inputClass} /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Client Satisfaction %</label><input type="number" value={aboutForm.stats.satisfaction} onChange={(e) => setAboutForm((prev) => ({ ...prev, stats: { ...prev.stats, satisfaction: parseInt(e.target.value) || 0 } }))} className={inputClass} /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Years Experience</label><input type="number" value={aboutForm.stats.experience} onChange={(e) => setAboutForm((prev) => ({ ...prev, stats: { ...prev.stats, experience: parseInt(e.target.value) || 0 } }))} className={inputClass} /></div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic pt-1">* Service cards (Website Dev, App Dev, etc.) are shown from the About section&apos;s static list.</p>
                <button onClick={handleUpdateAbout} disabled={savingSection === 'about'} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:opacity-60 text-white rounded-md font-medium transition-colors">
                  {savingSection === 'about' ? 'Updating About...' : 'Update About'}
                </button>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Projects</h3>
                <div className="space-y-3 mb-6">
                  {data.projects.map((project) => (
                    <div key={project.id} className="p-3 bg-[#111] border border-[#222] rounded-lg">
                      {editingProjectId === project.id ? (
                        <div className="space-y-2">
                          <input placeholder="Category" value={editingProject.category ?? ''} onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })} className={inputClass} />
                          <input placeholder="Title" value={editingProject.title ?? ''} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} className={inputClass} />
                          <textarea placeholder="Description" value={editingProject.description ?? ''} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} className={`${textareaClass} min-h-[70px]`} />
                          <div className="flex gap-2 items-start">
                            <input placeholder="Image URL" value={editingProject.image ?? ''} onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })} className={`${inputClass} flex-1`} />
                            <label className="shrink-0 cursor-pointer pt-1 mt-1">
                              <div className="px-3 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-md text-xs font-medium text-gray-300 transition-colors">
                                Upload File
                              </div>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProjectImageUpload(e, true)} />
                            </label>
                          </div>
                          <input placeholder="Project URL (e.g. https://yourproject.com)" value={editingProject.link ?? ''} onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })} className={inputClass} />
                          <div className="flex gap-2 pt-1">
                            <button onClick={handleSaveProject} className={saveBtnClass}><Check size={14} /> Save</button>
                            <button onClick={() => { setEditingProjectId(null); setEditingProject({}); }} className={cancelBtnClass}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{project.title}</div>
                            <div className="text-sm text-gray-500">{project.category}</div>
                            {project.link && project.link !== '#' && <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#ff6b35] hover:underline mt-0.5 truncate max-w-[260px]"><ExternalLink size={10} />{project.link}</a>}
                          </div>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            <button onClick={() => handleEditProject(project)} className="p-1.5 text-gray-400 hover:text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded transition-colors" title="Edit"><Pencil size={15} /></button>
                            <button onClick={() => handleRemoveProject(project.id)} className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#111] border border-[#222] rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Add New Project</h4>
                  <input placeholder="Category" value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} className={inputClass} />
                  <input placeholder="Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className={inputClass} />
                  <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className={textareaClass} />
                  <div className="flex gap-2 items-start">
                    <input placeholder="Image URL" value={newProject.image} onChange={(e) => setNewProject({ ...newProject, image: e.target.value })} className={`${inputClass} flex-1`} />
                    <label className="shrink-0 cursor-pointer pt-1 mt-1">
                      <div className="px-3 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-md text-xs font-medium text-gray-300 transition-colors">
                        Upload File
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProjectImageUpload(e, false)} />
                    </label>
                  </div>
                  <input placeholder="Project URL (e.g. https://yourproject.com)" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} className={inputClass} />
                  <button onClick={handleAddProject} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md font-medium flex items-center justify-center gap-1 transition-colors"><Plus size={16} /> Add Project</button>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Skills & Technologies</h3>
                <div className="space-y-3 mb-6">
                  {data.skills.map((skill) => (
                    <div key={skill.id} className="p-3 bg-[#111] border border-[#222] rounded-lg">
                      {editingSkillId === skill.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <input placeholder="Icon (emoji)" value={editingSkill.icon ?? ''} onChange={(e) => setEditingSkill({ ...editingSkill, icon: e.target.value })} className={inputClass} />
                            <input placeholder="Skill name" value={editingSkill.name ?? ''} onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })} className={`${inputClass} col-span-2`} />
                          </div>
                          <div><label className="text-xs text-gray-500 block mb-1">Proficiency: {editingSkill.percentage ?? 80}%</label><input type="range" min={1} max={100} value={editingSkill.percentage ?? 80} onChange={(e) => setEditingSkill({ ...editingSkill, percentage: parseInt(e.target.value) })} className="w-full accent-[#ff6b35]" /></div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={handleSaveSkill} className={saveBtnClass}><Check size={14} /> Save</button>
                            <button onClick={() => { setEditingSkillId(null); setEditingSkill({}); }} className={cancelBtnClass}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl shrink-0">{skill.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-white text-sm">{skill.name}</span>
                                <span className="text-[#ff6b35] text-xs font-bold">{skill.percentage}%</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--t-border)' }}><div className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] rounded-full transition-all duration-300" style={{ width: `${skill.percentage}%` }} /></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-3 shrink-0">
                            <button onClick={() => handleEditSkill(skill)} className="p-1.5 text-gray-400 hover:text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded transition-colors" title="Edit"><Pencil size={15} /></button>
                            <button onClick={() => handleRemoveSkill(skill.id)} className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#111] border border-[#222] rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Add New Skill</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input placeholder="Icon" value={newSkill.icon} onChange={(e) => setNewSkill({ ...newSkill, icon: e.target.value })} className={inputClass} />
                    <input placeholder="Skill name" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} className={`${inputClass} col-span-2`} />
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Proficiency: {newSkill.percentage}%</label><input type="range" min={1} max={100} value={newSkill.percentage} onChange={(e) => setNewSkill({ ...newSkill, percentage: parseInt(e.target.value) })} className="w-full accent-[#ff6b35]" /></div>
                  <button onClick={handleAddSkill} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md font-medium flex items-center justify-center gap-1 transition-colors"><Plus size={16} /> Add Skill</button>
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Blog Posts</h3>
                <div className="space-y-3 mb-6">
                  {data.blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg">
                      <div>
                        <div className="font-medium text-white">{post.title}</div>
                        <div className="text-sm text-gray-500">{post.category} • {post.date}</div>
                      </div>
                      <button onClick={() => handleRemoveBlogPost(post.id)} className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#111] border border-[#222] rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Add New Post</h4>
                  <input placeholder="Category" value={newBlogPost.category} onChange={(e) => setNewBlogPost({ ...newBlogPost, category: e.target.value })} className={inputClass} />
                  <input placeholder="Title" value={newBlogPost.title} onChange={(e) => setNewBlogPost({ ...newBlogPost, title: e.target.value })} className={inputClass} />
                  <textarea placeholder="Excerpt" value={newBlogPost.excerpt} onChange={(e) => setNewBlogPost({ ...newBlogPost, excerpt: e.target.value })} className={textareaClass} />
                  <div className="flex gap-2 items-start">
                    <input placeholder="Image URL" value={newBlogPost.image} onChange={(e) => setNewBlogPost({ ...newBlogPost, image: e.target.value })} className={`${inputClass} flex-1`} />
                    <label className="shrink-0 cursor-pointer pt-1 mt-1">
                      <div className="px-3 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-md text-xs font-medium text-gray-300 transition-colors">
                        Upload File
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBlogImageUpload} />
                    </label>
                  </div>
                  <button onClick={handleAddBlogPost} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md font-medium flex items-center justify-center gap-1 transition-colors"><Plus size={16} /> Add Post</button>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div><label className={labelClass}>Email</label><input value={contactForm.email} onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))} className={inputClass} /></div>
                <div><label className={labelClass}>Phone</label><input value={contactForm.phone} onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))} className={inputClass} /></div>
                <div><label className={labelClass}>Location</label><input value={contactForm.location} onChange={(e) => setContactForm((prev) => ({ ...prev, location: e.target.value }))} className={inputClass} /></div>
                <button onClick={handleUpdateContact} disabled={savingSection === 'contact'} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:opacity-60 text-white rounded-md font-medium transition-colors">
                  {savingSection === 'contact' ? 'Updating Contact...' : 'Update Contact'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
