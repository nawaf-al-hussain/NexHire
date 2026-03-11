import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import {
    MessageSquare,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Plus,
    Save,
    Eye,
    RefreshCw,
    X
} from 'lucide-react';

const InterviewQuestionsGenerator = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [difficultyLevel, setDifficultyLevel] = useState(5);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [savedQuestions, setSavedQuestions] = useState([]);
    const [activeTab, setActiveTab] = useState('generate');

    // Fetch jobs for dropdown
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get(`${API_BASE}/jobs`);
                if (response.data) {
                    setJobs(response.data.filter(job => job.IsActive));
                }
            } catch (err) {
                console.error('Error fetching jobs:', err);
            }
        };
        fetchJobs();
    }, []);

    // Fetch saved questions when job is selected
    useEffect(() => {
        const fetchSavedQuestions = async () => {
            if (!selectedJob) return;
            try {
                const response = await axios.get(`${API_BASE}/interviews/generated-questions/${selectedJob}`);
                if (response.data) {
                    setSavedQuestions(response.data);
                }
            } catch (err) {
                console.error('Error fetching saved questions:', err);
            }
        };
        fetchSavedQuestions();
    }, [selectedJob]);

    const generateQuestions = async () => {
        if (!selectedJob) {
            setError('Please select a job first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE}/interviews/generate-questions`, {
                jobId: parseInt(selectedJob),
                questionCount,
                difficultyLevel
            });

            if (response.data) {
                setGeneratedQuestions(response.data.questions);
                setQuestions(response.data.questions);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate questions.');
            console.error('Generate questions error:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveQuestion = async (question) => {
        try {
            const response = await axios.post(`${API_BASE}/interviews/save-question`, {
                jobId: parseInt(selectedJob),
                questionType: question.questionType,
                questionText: question.questionText,
                difficultyLevel: question.difficultyLevel,
                expectedKeywords: question.expectedKeywords,
                scoringRubric: question.scoringGuide
            });

            if (response.status === 201) {
                alert('Question saved successfully!');
                // Refresh saved questions
                const savedResponse = await axios.get(`${API_BASE}/interviews/generated-questions/${selectedJob}`);
                if (savedResponse.data) {
                    setSavedQuestions(savedResponse.data);
                }
            }
        } catch (err) {
            console.error('Error saving question:', err);
        }
    };

    const getDifficultyLabel = (level) => {
        if (level <= 3) return 'Beginner';
        if (level <= 6) return 'Intermediate';
        return 'Advanced';
    };

    const getQuestionTypeColor = (type) => {
        switch (type) {
            case 'Technical': return 'text-blue-500';
            case 'Behavioral': return 'text-purple-500';
            case 'Cultural': return 'text-green-500';
            case 'Scenario': return 'text-orange-500';
            default: return 'text-[var(--text-muted)]';
        }
    };

    const getQuestionTypeBg = (type) => {
        switch (type) {
            case 'Technical': return 'bg-blue-500/10 border-blue-500/20';
            case 'Behavioral': return 'bg-purple-500/10 border-purple-500/20';
            case 'Cultural': return 'bg-green-500/10 border-green-500/20';
            case 'Scenario': return 'bg-orange-500/10 border-orange-500/20';
            default: return 'bg-[var(--bg-accent)] border-[var(--border-primary)]';
        }
    };

    if (user?.RoleID !== 2) {
        return (
            <div className="glass-card p-8 rounded-[2.5rem] text-center">
                <p className="text-[var(--text-muted)]">Access denied. This feature is for recruiters only.</p>
            </div>
        );
    }

    if (loading && !jobs.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading AI Questions Generator...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8 rounded-[2.5rem] text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Error Loading Data</h3>
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">AI Interview Question Generator</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Generate intelligent interview questions based on job requirements</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Available Jobs</span>
                    </div>
                    <div className="text-3xl font-black">{jobs.length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Job postings</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={18} className="text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Questions Generated</span>
                    </div>
                    <div className="text-3xl font-black">{generatedQuestions.length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">This session</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Difficulty Level</span>
                    </div>
                    <div className="text-3xl font-black">{difficultyLevel}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{getDifficultyLabel(difficultyLevel)}</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Saved Questions</span>
                    </div>
                    <div className="text-3xl font-black">{savedQuestions.length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">In library</p>
                </div>
            </div>

            <div className="glass-card rounded-[3rem] p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black uppercase tracking-tight">Generate Questions</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={generateQuestions}
                            disabled={loading || !selectedJob}
                            className={`flex items-center gap-2 px-4 py-3 ${loading || !selectedJob ? 'bg-[var(--bg-accent)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} rounded-xl text-xs font-black uppercase tracking-widest transition-all`}
                        >
                            <Plus className="w-4 h-4" />
                            {loading ? 'Generating...' : 'Generate Questions'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">
                            Select Job
                        </label>
                        <select
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl py-4 px-6 text-sm font-bold"
                        >
                            <option value="">Select a job...</option>
                            {jobs.map(job => (
                                <option key={job.JobID} value={job.JobID}>
                                    {job.JobTitle} - {job.Location}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">
                            Number of Questions: {questionCount}
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="20"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                            <span>5</span>
                            <span>20</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">
                            Difficulty Level: {difficultyLevel} ({getDifficultyLabel(difficultyLevel)})
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={difficultyLevel}
                            onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                            <span>Beginner</span>
                            <span>Advanced</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl mb-6">
                        <p className="text-xs font-black text-rose-400 uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {questions.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-lg font-black uppercase tracking-tight mb-4">Generated Questions</h4>
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={index} className="glass-card rounded-[2rem] p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-[var(--bg-accent)] rounded-xl text-indigo-500">
                                                <MessageSquare size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getQuestionTypeBg(q.questionType)}`}>
                                                        {q.questionType}
                                                    </span>
                                                    {q.skillName && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-[var(--bg-accent)] border border-[var(--border-primary)]">
                                                            {q.skillName}
                                                        </span>
                                                    )}
                                                    {q.priority === 'High Priority' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                            High Priority
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-black text-[var(--text-primary)] mb-3">{q.questionText}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-[var(--text-muted)]">
                                                    <div>
                                                        <span className="font-black uppercase tracking-widest">Difficulty:</span> {q.difficultyLevel}/10 ({getDifficultyLabel(q.difficultyLevel)})
                                                    </div>
                                                    <div>
                                                        <span className="font-black uppercase tracking-widest">Expected Keywords:</span> {q.expectedKeywords?.join(', ') || 'N/A'}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <span className="font-black uppercase tracking-widest">Scoring Guide:</span> {q.scoringGuide}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => saveQuestion(q)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save Question
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Saved Questions Section */}
            {savedQuestions.length > 0 && (
                <div className="glass-card rounded-[3rem] p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black uppercase tracking-tight">Saved Questions ({savedQuestions.length})</h3>
                        <button
                            onClick={() => setActiveTab(activeTab === 'saved' ? 'generate' : 'saved')}
                            className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            <Eye className="w-4 h-4" />
                            {activeTab === 'saved' ? 'Hide' : 'View'} Saved Questions
                        </button>
                    </div>

                    {activeTab === 'saved' && (
                        <div className="space-y-4">
                            {savedQuestions.map((q) => (
                                <div key={q.QuestionID} className="glass-card rounded-[2rem] p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-[var(--bg-accent)] rounded-xl text-purple-500">
                                                <MessageSquare size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getQuestionTypeBg(q.QuestionType)}`}>
                                                        {q.QuestionType}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-[var(--bg-accent)] border border-[var(--border-primary)]">
                                                        Used: {q.UsedCount} times
                                                    </span>
                                                    {q.SuccessRate && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
                                                            Success Rate: {q.SuccessRate}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-black text-[var(--text-primary)] mb-3">{q.QuestionText}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-[var(--text-muted)]">
                                                    <div>
                                                        <span className="font-black uppercase tracking-widest">Difficulty:</span> {q.DifficultyLevel}/10
                                                    </div>
                                                    {q.ExpectedAnswerKeywords && (
                                                        <div>
                                                            <span className="font-black uppercase tracking-widest">Expected Keywords:</span> {JSON.parse(q.ExpectedAnswerKeywords).join(', ')}
                                                        </div>
                                                    )}
                                                    {q.ScoringRubric && (
                                                        <div className="md:col-span-2">
                                                            <span className="font-black uppercase tracking-widest">Scoring:</span> {q.ScoringRubric}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {savedQuestions.length === 0 && questions.length === 0 && (
                <div className="glass-card rounded-[2.5rem] p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                    <p className="text-[var(--text-muted)]">No questions generated yet. Configure your settings above and generate your first AI-powered interview questions!</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Save your favorite questions to build a personalized question library.</p>
                </div>
            )}
        </div>
    );
};

export default InterviewQuestionsGenerator;