import React, { useState, useEffect } from 'react';
import { X, Search, Monitor, ClipboardList, Target, AlertCircle, PlusCircle, CheckCircle2, ChevronRight, Hash, Star, Plus, Trash2, CheckCircle, Info, Sparkles } from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const JobModal = ({ isOpen, onClose, onJobCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [minExperience, setMinExperience] = useState(0);
    const [vacancies, setVacancies] = useState(1);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]); // [{id, name, isMandatory, minProficiency}]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchSkills();
        }
    }, [isOpen]);

    const fetchSkills = async () => {
        try {
            const res = await axios.get(`${API_BASE}/skills`);
            setAvailableSkills(res.data);
        } catch (err) {
            console.error("Fetch Skills Error:", err);
        }
    };

    const handleAddSkill = (skill) => {
        if (selectedSkills.find(s => s.id === skill.SkillID)) return;
        setSelectedSkills([...selectedSkills, {
            id: skill.SkillID,
            name: skill.SkillName,
            isMandatory: true,
            minProficiency: 5
        }]);
    };

    const handleRemoveSkill = (skillId) => {
        setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
    };

    const handleSkillChange = (id, field, value) => {
        setSelectedSkills(selectedSkills.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE}/jobs`, {
                title,
                description,
                location,
                minExperience,
                vacancies,
                skills: selectedSkills
            });
            onJobCreated();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setLocation('');
            setMinExperience(0);
            setVacancies(1);
            setSelectedSkills([]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create job posting.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col text-[var(--text-primary)]">
                {/* Header */}
                <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Plus className="text-indigo-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Post New Opportunity</h2>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">Define specialized requirements & core skills</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Job Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Senior Cloud Architect"
                                    className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-white/10 dark:focus:bg-white/5 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Location</label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Remote / New York"
                                    className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-white/10 dark:focus:bg-white/5 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Min Experience (Years)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={minExperience}
                                    onChange={(e) => setMinExperience(parseInt(e.target.value))}
                                    className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-white/10 dark:focus:bg-white/5 outline-none transition-all font-black text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Vacancies</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={vacancies}
                                    onChange={(e) => setVacancies(parseInt(e.target.value))}
                                    className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-white/10 dark:focus:bg-white/5 outline-none transition-all font-black text-center"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Job Description</label>
                        <textarea
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detail the core responsibilities and expectations..."
                            className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-3xl py-6 px-8 text-sm text-[var(--text-primary)] focus:bg-white/10 dark:focus:bg-white/5 outline-none transition-all placeholder:text-[var(--text-muted)] font-medium leading-relaxed resize-none"
                        ></textarea>
                    </div>

                    {/* Skill Selection */}
                    <div className="space-y-8 p-1">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
                            <div className="flex items-center gap-3">
                                <Sparkles size={18} className="text-amber-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Skill Intelligence</h3>
                            </div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest italic">Define technical depth requirements</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {availableSkills.map(skill => (
                                <button
                                    key={skill.SkillID}
                                    type="button"
                                    onClick={() => handleAddSkill(skill)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSkills.find(s => s.id === skill.SkillID)
                                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-500'
                                        : 'bg-[var(--bg-accent)] border-[var(--border-primary)] text-[var(--text-muted)] hover:border-indigo-500/30 hover:text-indigo-500'
                                        }`}
                                >
                                    {skill.SkillName}
                                </button>
                            ))}
                        </div>

                        {selectedSkills.length > 0 && (
                            <div className="space-y-4 pt-4">
                                {selectedSkills.map(skill => (
                                    <div key={skill.id} className="glass-card p-6 rounded-3xl flex items-center justify-between bg-[var(--bg-accent)]/10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-black text-[10px] text-[var(--text-muted)]">
                                                {skill.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black">{skill.name}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={skill.isMandatory}
                                                            onChange={(e) => handleSkillChange(skill.id, 'isMandatory', e.target.checked)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-3 h-3 rounded-full border transition-all ${skill.isMandatory ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-[var(--border-primary)]'}`}></div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${skill.isMandatory ? 'text-emerald-500' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>Mandatory</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Min. Lvl</span>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    value={skill.minProficiency}
                                                    onChange={(e) => handleSkillChange(skill.id, 'minProficiency', parseInt(e.target.value))}
                                                    className="w-24 h-1 bg-[var(--bg-accent)] rounded-full appearance-none cursor-pointer accent-indigo-500"
                                                />
                                                <span className="w-6 text-center font-black text-indigo-500 text-xs">{skill.minProficiency}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill.id)}
                                                className="text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>

                {error && (
                    <div className="px-10 py-4 bg-rose-500/10 border-y border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <Info size={14} /> {error}
                    </div>
                )}

                {/* Footer */}
                <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-accent)]/20 flex items-center justify-end gap-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] hover:text-indigo-500 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                                Finalize Posting
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobModal;
