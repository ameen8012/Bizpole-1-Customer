import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    Loader2,
    User,
    Briefcase,
    FileText,
    Calendar,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Globe
} from 'lucide-react';
import * as CustomerApi from '../../api/CustomerApi';
import { format } from 'date-fns';

const CustomerDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Summary');

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            setLoading(true);
            try {
                const response = await CustomerApi.getCustomerById(id);
                if (response.data.success) {
                    setCustomer(response.data.data);
                } else {
                    setError(response.data.message || "Failed to fetch customer details");
                }
            } catch (err) {
                console.error("fetchCustomerDetails error", err);
                setError("An error occurred while fetching customer details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCustomerDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[#4b49ac] animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading customer details...</p>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 inline-block mb-4">
                    {error || "Customer not found"}
                </div>
                <div>
                    <button
                        onClick={() => navigate('/associate/customers')}
                        className="text-[#4b49ac] font-bold hover:underline"
                    >
                        Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    const renderSummary = () => (
        <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <DetailItem label="First Name" value={customer.FirstName} />
                <DetailItem label="Last Name" value={customer.LastName || '-'} />

                <DetailItem label="PAN Number" value={customer.PANNumber || '-'} />
                <DetailItem label="Date of Birth" value={customer.DateOfBirth ? format(new Date(customer.DateOfBirth), 'dd/MM/yyyy') : '-'} />

                <DetailItem label="Primary Company" value={customer.PrimaryCompanyName || '-'} />
                <DetailItem label="Preferred Language" value={customer.PreferredLanguage || '-'} />

                <DetailItem label="Customer Category" value={customer.CustomerCategory || '-'} />
                <DetailItem label="Created On" value={customer.CreatedAt ? format(new Date(customer.CreatedAt), 'dd/MM/yyyy, HH:mm:ss') : '-'} />

                <DetailItem label="Updated On" value={customer.UpdatedAt ? format(new Date(customer.UpdatedAt), 'dd/MM/yyyy, HH:mm:ss') : '-'} />
                <DetailItem label="Mobile" value={customer.Mobile} />

                <DetailItem label="Secondary Mobile" value={customer.SecondaryMobile || '-'} />
                <DetailItem label="Email" value={customer.Email} />

                <DetailItem label="Secondary Email" value={customer.SecondaryEmail || '-'} />
                <DetailItem label="Address Line 1" value={customer.AddressLine1 || '-'} />

                <DetailItem label="Address Line 2" value={customer.AddressLine2 || '-'} />
                <DetailItem label="Country" value={customer.Country || 'India'} />

                <DetailItem label="State" value={customer.State || '-'} />
                <DetailItem label="City" value={customer.District || '-'} />

                <DetailItem label="Pincode" value={customer.PinCode || '-'} />
            </div>
        </div>
    );

    const renderCompanyInfo = () => (
        <div className="space-y-6">
            {customer.Companies && customer.Companies.length > 0 ? (
                customer.Companies.map((company) => (
                    <div key={company.CompanyID} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{company.BusinessName}</h3>
                            {company.PrimaryCompany === 1 && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Primary
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DetailItem label="Company Code" value={company.CompanyCode || '-'} />
                            <DetailItem label="GST Number" value={company.GSTNumber || '-'} />
                            <DetailItem label="PAN" value={company.CompanyPAN || '-'} />
                            <DetailItem label="Constitution" value={company.ConstitutionCategory || '-'} />
                            <DetailItem label="Sector" value={company.Sector || '-'} />
                            <DetailItem label="Email" value={company.CompanyEmail || '-'} />
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No company information available</p>
                </div>
            )}
        </div>
    );

    const tabs = ['Summary', 'Company Information', 'Files'];

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/associate/customers')}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-600 hover:text-slate-900 shadow-sm transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Link to="/associate/customers" className="hover:text-slate-600 transition-colors uppercase tracking-wider font-semibold">Customer</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 uppercase tracking-wider font-semibold">Customer Details</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900 font-bold uppercase tracking-wider">{activeTab}</span>
                </div>

                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {customer.FirstName} {customer.LastName || ''}
                    </h1>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-8 border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab
                            ? 'text-amber-500'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'Summary' && renderSummary()}
                {activeTab === 'Company Information' && renderCompanyInfo()}
                {activeTab === 'Files' && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Document files will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="flex items-center gap-2">
        <p className="text-[13px] font-bold text-slate-900 whitespace-nowrap">{label}:</p>
        <p className="text-[13px] text-slate-600 font-medium">{value}</p>
    </div>
);

export default CustomerDetailView;
