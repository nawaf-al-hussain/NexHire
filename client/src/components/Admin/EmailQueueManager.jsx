import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Trash2, Send, Filter, Loader2 } from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const EmailQueueManager = () => {
    const [emails, setEmails] = useState([]);
    const [stats, setStats] = useState({ Total: 0, Sent: 0, Pending: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', type: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchEmails();
    }, [filter]);

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.type) params.append('type', filter.type);
            params.append('limit', '50');

            const res = await axios.get(`${API_BASE}/maintenance/email-queue?${params}`);
            setEmails(res.data.emails || []);
            setStats(res.data.stats || { Total: 0, Sent: 0, Pending: 0 });
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (id) => {
        try {
            await axios.put(`${API_BASE}/maintenance/email-queue/${id}/retry`);
            fetchEmails();
        } catch (err) {
            console.error('Retry error:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this email from queue?')) return;
        try {
            await axios.delete(`${API_BASE}/maintenance/email-queue/${id}`);
            fetchEmails();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleTestEmail = async () => {
        setSending(true);
        try {
            await axios.post(`${API_BASE}/maintenance/email-queue/send-test`, {
                candidateId: 1,
                emailType: 'Test',
                subject: 'Test Email from NexHire',
                body: 'This is a test email to verify the queue is working.'
            });
            fetchEmails();
        } catch (err) {
            console.error('Test email error:', err);
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (isSent) => {
        if (isSent) {
            return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/20 text-emerald-500">Sent</span>;
        }
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-amber-500/10 border-amber-500/20 text-amber-500">Pending</span>;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Mail size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Email Notification Queue</h2>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                Manage queued email notifications
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleTestEmail}
                        disabled={sending}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Send Test
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Mail size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total</span>
                    </div>
                    <div className="text-3xl font-black">{stats.Total}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Emails in Queue</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Mail size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sent</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">{stats.Sent}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Successfully Sent</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Mail size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending</span>
                    </div>
                    <div className="text-3xl font-black text-amber-500">{stats.Pending}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Awaiting Send</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-[2rem] p-6">
                <div className="flex items-center gap-4">
                    <Filter size={18} className="text-[var(--text-muted)]" />
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                    </select>
                    <button
                        onClick={fetchEmails}
                        className="px-4 py-2 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/10 transition-all"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Email Table */}
            <div className="glass-card rounded-[3rem] p-8">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6">Email Queue</h3>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading...</p>
                    </div>
                ) : emails.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                        <Mail className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">No emails in queue</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                    <th className="text-left pb-4 pr-4">Recipient</th>
                                    <th className="text-left pb-4 pr-4">Type</th>
                                    <th className="text-left pb-4 pr-4">Subject</th>
                                    <th className="text-left pb-4 pr-4">Status</th>
                                    <th className="text-left pb-4 pr-4">Created</th>
                                    <th className="text-left pb-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                                {emails.map((email) => (
                                    <tr key={email.EmailID} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                        <td className="py-4 pr-4">
                                            <span className="text-sm font-black">{email.CandidateName || 'Unknown'}</span>
                                            {email.CandidateID && <span className="text-xs text-[var(--text-muted)] block">ID: {email.CandidateID}</span>}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-xs font-bold text-indigo-500">{email.EmailType}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-sm font-bold">{email.Subject}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            {getStatusBadge(email.IsSent)}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-xs font-bold text-[var(--text-muted)]">
                                                {email.CreatedAt ? new Date(email.CreatedAt).toLocaleString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                {!email.IsSent && (
                                                    <button
                                                        onClick={() => handleRetry(email.EmailID)}
                                                        className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all"
                                                        title="Retry"
                                                    >
                                                        <RefreshCw size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(email.EmailID)}
                                                    className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailQueueManager;
