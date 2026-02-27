import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE from '../../apiConfig';

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
            case 'Technical': return 'bg-blue-100 text-blue-800';
            case 'Behavioral': return 'bg-purple-100 text-purple-800';
            case 'Cultural': return 'bg-green-100 text-green-800';
            case 'Scenario': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (user?.RoleID !== 2) {
        return (
            <div className="p-6 bg-white rounded-lg shadow">
                <p className="text-gray-500">Access denied. This feature is for recruiters only.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Interview Question Generator</h2>

            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'generate' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('generate')}
                >
                    Generate Questions
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'saved' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved Questions ({savedQuestions.length})
                </button>
            </div>

            {activeTab === 'generate' && (
                <>
                    {/* Configuration Panel */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Job
                                </label>
                                <select
                                    value={selectedJob}
                                    onChange={(e) => setSelectedJob(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>5</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Beginner</span>
                                    <span>Advanced</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={generateQuestions}
                            disabled={loading || !selectedJob}
                            className={`mt-4 px-6 py-2 rounded-md text-white font-medium ${loading || !selectedJob ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Generating...' : 'Generate Questions'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Generated Questions */}
                    {questions.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Generated Questions</h3>
                            <div className="space-y-4">
                                {questions.map((q, index) => (
                                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getQuestionTypeColor(q.questionType)}`}>
                                                    {q.questionType}
                                                </span>
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                    {q.skillName}
                                                </span>
                                                {q.priority === 'High Priority' && (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                                        High Priority
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => saveQuestion(q)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Save Question
                                            </button>
                                        </div>

                                        <p className="text-gray-800 font-medium mb-2">{q.questionText}</p>

                                        <div className="text-sm text-gray-600">
                                            <p><span className="font-medium">Difficulty:</span> {q.difficultyLevel}/10 ({getDifficultyLabel(q.difficultyLevel)})</p>
                                            <p><span className="font-medium">Expected Keywords:</span> {q.expectedKeywords?.join(', ') || 'N/A'}</p>
                                            <p><span className="font-medium">Scoring Guide:</span> {q.scoringGuide}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'saved' && (
                <>
                    {savedQuestions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No saved questions yet. Generate some questions and save your favorites!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {savedQuestions.map((q) => (
                                <div key={q.QuestionID} className="border rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getQuestionTypeColor(q.QuestionType)}`}>
                                                {q.QuestionType}
                                            </span>
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                Used: {q.UsedCount} times
                                            </span>
                                            {q.SuccessRate && (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                                    Success Rate: {q.SuccessRate}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-800 font-medium mb-2">{q.QuestionText}</p>

                                    <div className="text-sm text-gray-600">
                                        <p><span className="font-medium">Difficulty:</span> {q.DifficultyLevel}/10</p>
                                        {q.ExpectedAnswerKeywords && (
                                            <p><span className="font-medium">Expected Keywords:</span> {JSON.parse(q.ExpectedAnswerKeywords).join(', ')}</p>
                                        )}
                                        {q.ScoringRubric && (
                                            <p><span className="font-medium">Scoring:</span> {q.ScoringRubric}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default InterviewQuestionsGenerator;
