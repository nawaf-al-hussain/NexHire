import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

const SkillMatrix = ({ requiredSkills, candidateSkills }) => {
    // candidateSkills is expected to be an array of skill names or objects
    const candidateSkillSet = new Set(
        (candidateSkills || []).map(s => typeof s === 'string' ? s.toLowerCase() : s.SkillName.toLowerCase())
    );

    return (
        <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Technical Proficiency Matrix</h5>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Match</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Gap</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {requiredSkills.map((skill, idx) => {
                    const hasSkill = candidateSkillSet.has(skill.SkillName.toLowerCase());
                    return (
                        <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hasSkill
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-rose-500/5 border-rose-500/20 opacity-80'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {hasSkill ? (
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                    <XCircle size={14} className="text-rose-500" />
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-wider">{skill.SkillName}</span>
                            </div>

                            {skill.IsMandatory ? (
                                <div className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                                    <span className="text-[7px] font-black text-indigo-500 uppercase tracking-tighter">Required</span>
                                </div>
                            ) : (
                                <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tighter opacity-40">Preferred</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {requiredSkills.filter(s => s.IsMandatory && !candidateSkillSet.has(s.SkillName.toLowerCase())).length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                    <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">
                        Missing mandatory skills identified. Candidate may require supplemental training or technical screening.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SkillMatrix;
