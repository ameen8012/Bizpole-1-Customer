import React, { useState, useEffect } from 'react';
import AddDealModal from '../../components/Modals/AddDealModal';
import { Plus, Edit2, Trash2, Search, Filter, Loader2, MoreVertical, ExternalLink } from 'lucide-react';
import DealsApi from '../../api/DealsApi';
import { getSecureItem } from '../../utils/secureStorage';
import { format } from 'date-fns';

const AssociateDeals = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDeals = async () => {
        setLoading(true);
        try {
            const user = getSecureItem("user") || {};
            const result = await DealsApi.listDeals({
                employeeId: user.EmployeeID,
                franchiseId: user.FranchiseeID,
                isAssociate: true // Filter specifically for associate created deals
            });
            if (result.success) {
                setDeals(result.data || []);
            } else {
                setError(result.message || "Failed to fetch deals");
            }
        } catch (err) {
            console.error("fetchDeals error", err);
            setError("An error occurred while fetching deals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const handleDealSuccess = () => {
        fetchDeals();
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('hot')) return 'bg-orange-50 text-orange-600 border-orange-200';
        if (s.includes('won')) return 'bg-green-50 text-green-600 border-green-200';
        if (s.includes('warm')) return 'bg-blue-50 text-blue-600 border-blue-200';
        if (s.includes('cold')) return 'bg-gray-50 text-gray-600 border-gray-200';
        if (s.includes('overdue')) return 'bg-red-50 text-red-600 border-red-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Deals</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track your business deals</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#4b49ac] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3f3da0] transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Deal
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search deals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/20 focus:border-[#4b49ac] transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Deals Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deal Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prob %</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Closure Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Services</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-[#4b49ac] animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading deals...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm">
                                                {error}
                                            </div>
                                            <button
                                                onClick={fetchDeals}
                                                className="text-[#4b49ac] font-semibold text-sm hover:underline"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : deals.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 grayscale opacity-60">
                                            <Search className="w-12 h-12 text-slate-300" />
                                            <p className="text-slate-500 font-medium text-lg">No deals found</p>
                                            <p className="text-slate-400 text-sm">Add your first deal to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                deals.filter(d =>
                                    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    d.DealCode?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((deal, index) => (
                                    <tr key={deal.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-mono tracking-tight">{deal.DealCode || "--"}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 group cursor-pointer">
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-[#4b49ac] transition-colors">
                                                    {deal.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(deal.status)}`}>
                                                {deal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{deal.CompanyName || "--"}</td>
                                        <td className="px-6 py-4">
                                            <div className="w-16">
                                                <input
                                                    type="text"
                                                    defaultValue={deal.probability || 0}
                                                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded md:bg-transparent bg-white focus:bg-white focus:ring-2 focus:ring-[#4b49ac]/20 outline-none"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {deal.ClosureDate ? format(new Date(deal.ClosureDate), 'dd-MM-yyyy') : "--"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                                            {deal.serviceName || "--"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {deal.total ? `₹${Number(deal.total).toLocaleString('en-IN')}` : "--"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono tracking-tighter">
                                            {deal.mobile}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors whitespace-nowrap">
                                                    Create Quote
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-[#4b49ac] hover:bg-slate-100 rounded-lg transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination Placeholder */}
                {!loading && deals.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing <span className="text-slate-900">{deals.length}</span> deals
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all disabled:opacity-50" disabled>
                                Prev
                            </button>
                            <button className="px-3 py-1.5 bg-white text-[#4b49ac] border border-slate-200 rounded-lg text-xs font-bold shadow-sm">1</button>
                            <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all disabled:opacity-50" disabled>
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddDealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleDealSuccess}
            />
        </div>
    );
};

export default AssociateDeals;
