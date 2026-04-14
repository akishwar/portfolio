import { useState } from 'react';
import {
  X, User, Briefcase, Code, FileText, Settings, RotateCcw, Plus, Trash2,
  Pencil, Check, ExternalLink, Zap, Info
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { Project, Skill } from '../context/AdminContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'hero',     label: 'Hero',     icon: User },
  { id: 'about',    label: 'About Me', icon: Info },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'skills',   label: 'Skills',   icon: Zap },
  { id: 'blog',     label: 'Blog',     icon: FileText },
  { id: 'contact',  label: 'Contact',  icon: Settings },
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

  const [activeTab, setActiveTab] = useState('hero');

  // ── Projects state ──
  const [newProject, setNewProject] = useState({ category: '', title: '', description: '', image: '', link: '' });
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<Omit<Project, 'id'>>>({});

  // ── Skills state ──
  const [newSkill, setNewSkill] = useState({ name: '', percentage: 80, icon: '⚡' });
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingSkill, setEditingSkill] = useState<Partial<Omit<Skill, 'id'>>>({});

  // ── Blog state ──
  const [newBlogPost, setNewBlogPost] = useState({ category: '', title: '', excerpt: '', image: '' });

  /* ── Project handlers ── */
  const handleAddProject = () => {
    if (newProject.title && newProject.description) {
      addProject({ ...newProject });
      setNewProject({ category: '', title: '', description: '', image: '', link: '' });
    }
  };
  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setEditingProject({ category: p.category, title: p.title, description: p.description, image: p.image, link: p.link || '' });
  };
  const handleSaveProject = () => {
    if (editingProjectId !== null) { updateProject(editingProjectId, editingProject); setEditingProjectId(null); setEditingProject({}); }
  };

  /* ── Skill handlers ── */
  const handleAddSkill = () => {
    if (newSkill.name) {
      const id = Date.now();
      updateSkills([...data.skills, { id, ...newSkill }]);
      setNewSkill({ name: '', percentage: 80, icon: '⚡' });
    }
  };
  const handleRemoveSkill = (id: number) => updateSkills(data.skills.filter(s => s.id !== id));
  const handleEditSkill = (s: Skill) => {
    setEditingSkillId(s.id);
    setEditingSkill({ name: s.name, percentage: s.percentage, icon: s.icon });
  };
  const handleSaveSkill = () => {
    if (editingSkillId !== null) {
      updateSkills(data.skills.map(s => s.id === editingSkillId ? { ...s, ...editingSkill } : s));
      setEditingSkillId(null); setEditingSkill({});
    }
  };

  /* ── Blog handlers ── */
  const handleAddBlogPost = () => {
    if (newBlogPost.title && newBlogPost.excerpt) {
      addBlogPost({ ...newBlogPost, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
      setNewBlogPost({ category: '', title: '', excerpt: '', image: '' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const storageRef = ref(storage, `hero/profileImage-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      updateHero({ profileImage: url });
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff6b35] transition-colors mt-1";
  const textareaClass = "w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff6b35] transition-colors mt-1 min-h-[100px] resize-none";
  const labelClass = "text-sm text-gray-400 block";
  const saveBtnClass = "flex-1 py-1.5 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md text-sm font-medium flex items-center justify-center gap-1 transition-colors";
  const cancelBtnClass = "flex-1 py-1.5 border border-[#333] text-gray-400 hover:text-white rounded-md text-sm font-medium transition-colors";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0a0a0a] border border-[#333] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] shrink-0">
          <h2 className="text-xl font-serif text-white flex items-center gap-2">
            <Settings className="text-[#ff6b35]" size={20} />
            Admin Panel
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={resetData} className="px-3 py-1.5 border border-[#333] rounded-md text-sm text-gray-400 hover:text-white hover:border-[#ff6b35] transition-colors flex items-center gap-1">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={onClose} className="px-2 py-1.5 border border-[#333] rounded-md text-gray-400 hover:text-white hover:border-[#ff6b35] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-48 bg-[#111] border-r border-[#222] p-2 space-y-1 shrink-0 overflow-y-auto">
            {tabs.map(tab => (
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ── HERO ── */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>
                <div><label className={labelClass}>Greeting</label><input value={data.hero.greeting} onChange={e => updateHero({ greeting: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Name</label><input value={data.hero.name} onChange={e => updateHero({ name: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Title</label><input value={data.hero.title} onChange={e => updateHero({ title: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Description</label><textarea value={data.hero.description} onChange={e => updateHero({ description: e.target.value })} className={textareaClass} /></div>
                <div>
                  <label className={labelClass}>Profile Image (Upload)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className={inputClass + " file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#ff6b35] file:text-white hover:file:bg-[#ff8c5a] cursor-pointer"} />
                  <p className="text-xs text-gray-500 mt-1">Upload your photo directly from your computer to instantly update it.</p>
                </div>
                <div>
                  <label className={labelClass}>Resume (Upload)</label>
                  <input type="file" accept=".pdf,.docx,.doc,.jpg,.jpeg" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const storageRef = ref(storage, `hero/resume-${Date.now()}`);
                      await uploadBytes(storageRef, file);
                      const url = await getDownloadURL(storageRef);
                      updateHero({ resume: url });
                    }
                  }} className={inputClass + " file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#ff6b35] file:text-white hover:file:bg-[#ff8c5a] cursor-pointer"} />
                  <p className="text-xs text-gray-500 mt-1">Upload your Resume to update the Download button (PDF, DOCX, JPEG).</p>
                </div>
              </div>
            )}

            {/* ── ABOUT ME ── */}
            {activeTab === 'about' && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white mb-4">About Me</h3>

                <div>
                  <label className={labelClass}>About Description</label>
                  <textarea
                    value={data.about.description}
                    onChange={e => updateAbout({ description: e.target.value })}
                    className={`${textareaClass} min-h-[140px]`}
                  />
                </div>

                <div>
                  <label className={labelClass + " mb-2"}>Stats</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Projects Completed</label>
                      <input
                        type="number"
                        value={data.about.stats.projects}
                        onChange={e => updateAbout({ stats: { ...data.about.stats, projects: parseInt(e.target.value) || 0 } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Client Satisfaction %</label>
                      <input
                        type="number"
                        value={data.about.stats.satisfaction}
                        onChange={e => updateAbout({ stats: { ...data.about.stats, satisfaction: parseInt(e.target.value) || 0 } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Years Experience</label>
                      <input
                        type="number"
                        value={data.about.stats.experience}
                        onChange={e => updateAbout({ stats: { ...data.about.stats, experience: parseInt(e.target.value) || 0 } })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic pt-1">
                  * Service cards (Website Dev, App Dev, etc.) are shown from the About section's static list.
                </p>
              </div>
            )}

            {/* ── PROJECTS ── */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Projects</h3>

                <div className="space-y-3 mb-6">
                  {data.projects.map(project => (
                    <div key={project.id} className="p-3 bg-[#111] border border-[#222] rounded-lg">
                      {editingProjectId === project.id ? (
                        <div className="space-y-2">
                          <input placeholder="Category" value={editingProject.category ?? ''} onChange={e => setEditingProject({ ...editingProject, category: e.target.value })} className={inputClass} />
                          <input placeholder="Title" value={editingProject.title ?? ''} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} className={inputClass} />
                          <textarea placeholder="Description" value={editingProject.description ?? ''} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} className={`${textareaClass} min-h-[70px]`} />
                          <input placeholder="Image URL" value={editingProject.image ?? ''} onChange={e => setEditingProject({ ...editingProject, image: e.target.value })} className={inputClass} />
                          <input placeholder="Project URL (e.g. https://yourproject.com)" value={editingProject.link ?? ''} onChange={e => setEditingProject({ ...editingProject, link: e.target.value })} className={inputClass} />
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
                            {project.link && project.link !== '#' && (
                              <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#ff6b35] hover:underline mt-0.5 truncate max-w-[260px]">
                                <ExternalLink size={10} />{project.link}
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            <button onClick={() => handleEditProject(project)} className="p-1.5 text-gray-400 hover:text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded transition-colors" title="Edit"><Pencil size={15} /></button>
                            <button onClick={() => removeProject(project.id)} className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-[#111] border border-[#222] rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Add New Project</h4>
                  <input placeholder="Category" value={newProject.category} onChange={e => setNewProject({ ...newProject, category: e.target.value })} className={inputClass} />
                  <input placeholder="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className={inputClass} />
                  <textarea placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} className={textareaClass} />
                  <input placeholder="Image URL" value={newProject.image} onChange={e => setNewProject({ ...newProject, image: e.target.value })} className={inputClass} />
                  <input placeholder="Project URL (e.g. https://yourproject.com)" value={newProject.link} onChange={e => setNewProject({ ...newProject, link: e.target.value })} className={inputClass} />
                  <button onClick={handleAddProject} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md font-medium flex items-center justify-center gap-1 transition-colors">
                    <Plus size={16} /> Add Project
                  </button>
                </div>
              </div>
            )}

            {/* ── SKILLS ── */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Skills & Technologies</h3>

                <div className="space-y-3 mb-6">
                  {data.skills.map(skill => (
                    <div key={skill.id} className="p-3 bg-[#111] border border-[#222] rounded-lg">
                      {editingSkillId === skill.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <input placeholder="Icon (emoji)" value={editingSkill.icon ?? ''} onChange={e => setEditingSkill({ ...editingSkill, icon: e.target.value })} className={inputClass} />
                            <input placeholder="Skill name" value={editingSkill.name ?? ''} onChange={e => setEditingSkill({ ...editingSkill, name: e.target.value })} className={`${inputClass} col-span-2`} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Proficiency: {editingSkill.percentage ?? 80}%</label>
                            <input
                              type="range" min={1} max={100}
                              value={editingSkill.percentage ?? 80}
                              onChange={e => setEditingSkill({ ...editingSkill, percentage: parseInt(e.target.value) })}
                              className="w-full accent-[#ff6b35]"
                            />
                          </div>
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
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--t-border)' }}>
                                <div className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] rounded-full transition-all duration-300" style={{ width: `${skill.percentage}%` }} />
                              </div>
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
                    <input placeholder="Icon 🔥" value={newSkill.icon} onChange={e => setNewSkill({ ...newSkill, icon: e.target.value })} className={inputClass} />
                    <input placeholder="Skill name" value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} className={`${inputClass} col-span-2`} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Proficiency: {newSkill.percentage}%</label>
                    <input type="range" min={1} max={100} value={newSkill.percentage} onChange={e => setNewSkill({ ...newSkill, percentage: parseInt(e.target.value) })} className="w-full accent-[#ff6b35]" />
                  </div>
                  <button onClick={handleAddSkill} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md font-medium flex items-center justify-center gap-1 transition-colors">
                    <Plus size={16} /> Add Skill
                  </button>
                </div>
              </div>
            )}

            {/* ── BLOG ── */}
            {activeTab === 'blog' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Blog Posts</h3>
                <div className="space-y-3 mb-6">
                  {data.blogPosts.map(post => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg">
                      <div>
                        <div className="font-medium text-white">{post.title}</div>
                        <div className="text-sm text-gray-500">{post.category} • {post.date}</div>
                      </div>
                      <button onClick={() => removeBlogPost(post.id)} className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#111] border border-[#222] rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Add New Post</h4>
                  <input placeholder="Category" value={newBlogPost.category} onChange={e => setNewBlogPost({ ...newBlogPost, category: e.target.value })} className={inputClass} />
                  <input placeholder="Title" value={newBlogPost.title} onChange={e => setNewBlogPost({ ...newBlogPost, title: e.target.value })} className={inputClass} />
                  <textarea placeholder="Excerpt" value={newBlogPost.excerpt} onChange={e => setNewBlogPost({ ...newBlogPost, excerpt: e.target.value })} className={textareaClass} />
                  <input placeholder="Image URL" value={newBlogPost.image} onChange={e => setNewBlogPost({ ...newBlogPost, image: e.target.value })} className={inputClass} />
                  <button onClick={handleAddBlogPost} className="w-full py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-md font-medium flex items-center justify-center gap-1 transition-colors">
                    <Plus size={16} /> Add Post
                  </button>
                </div>
              </div>
            )}

            {/* ── CONTACT ── */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div><label className={labelClass}>Email</label><input value={data.contact.email} onChange={e => updateContact({ email: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Phone</label><input value={data.contact.phone} onChange={e => updateContact({ phone: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Location</label><input value={data.contact.location} onChange={e => updateContact({ location: e.target.value })} className={inputClass} /></div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
