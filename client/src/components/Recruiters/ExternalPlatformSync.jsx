import React from 'react';
import { Link2, RefreshCw, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const ExternalPlatformSync = ({ loading, onRefresh }) => {
    const [syncData, setSyncData] = React.useState([]);
    const [loadingData, setLoadingData] = React.useState(true);
    const [syncing, setSyncing] = React.useState(false);

    React.useEffect(() => {
        fetchSyncData();
    }, []);

    const fetchSyncData = async () => {
        try {
            setLoadingData(true);
            const res = await axios.get(`${API_BASE}/recruiters/platform-sync`);
            setSyncData(res.data);
        } catch (err) {
            console.error("Platform Sync Fetch Error:", err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSync = async (platform) => {
        try {
            setSyncing(true);
            await axios.post(`${API_BASE}/recruiters/platform-sync`, {
                platform: platform,
                syncDirection: 'Export'
            });
            await fetchSyncData();
        } catch (err) {
            console.error("Sync Error:", err);
        } finally {
            setSyncing(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'Failed': return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'Pending': return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />;
            default: return <AlertCircle className="w-4 h-4 text-[var(--text-muted)]" />;
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case 'LinkedIn': return 'bg-blue-600';
            case 'Indeed': return 'bg-indigo-600';
            case 'Glassdoor': return 'bg-green-600';
            default: return 'bg-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Platform Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['LinkedIn', 'Indeed', 'Glassdoor'].map((platform) => (
                    <div key={platform} className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 ${getPlatformColor(platform)} rounded-2xl flex items-center justify-center`}>
                                <Link2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase">{platform}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Job syndication</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSync(platform)}
                            disabled={syncing}
                            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? 'Syncing...' : 'Sync Jobs'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Sync Status Table */}
            <div className="glass-card rounded-[2.5rem] p-8 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <RefreshCw className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Platform Sync History</h3>
                </div>

                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Platform Sync...</p>
                    </div>
                ) : syncData.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                        <Link2 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">No sync history yet</p>
                        <p className="text-[10px] text-[var(--text-muted)] opacity-60">Click "Sync Jobs" to post to platforms</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                    <th className="text-left pb-4 pr-4">Platform</th>
                                    <th className="text-left pb-4 pr-4">Type</th>
                                    <th className="text-left pb-4 pr-4">Status</th>
                                    <th className="text-left pb-4 pr-4">Last Sync</th>
                                    <th className="text-left pb-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                                {syncData.slice(0, 10).map((sync, idx) => (
                                    <tr key={idx} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${getPlatformColor(sync.Platform)} rounded-lg flex items-center justify-center`}>
                                                    <Link2 className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-sm font-black">{sync.Platform}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="px-3 py-1 bg-[var(--bg-primary)] rounded-lg text-[10px] font-black">
                                                {sync.SyncDirection || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sync.SyncStatus === 'Success' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                                                    sync.SyncStatus === 'Failed' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                                                        'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                                }`}>
                                                {sync.SyncStatus || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-xs font-bold text-[var(--text-muted)]">
                                                {sync.LastSyncedAt
                                                    ? new Date(sync.LastSyncedAt).toLocaleString()
                                                    : 'Never'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            {sync.ProfileURL && (
                                                <a
                                                    href={sync.ProfileURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--bg-primary)] rounded-lg text-[10px] font-black hover:bg-indigo-500 hover:text-white transition-all"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    View
                                                </a>
                                            )}
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

export default ExternalPlatformSync;
