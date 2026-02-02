import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Loader2, Calendar } from "lucide-react";
import locationData from "../../utils/statesAndDistricts.json";
import DealsApi from "../../api/DealsApi";
import { getSecureItem } from "../../utils/secureStorage";

const AddDealModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        // Customer Details
        customerName: "",
        mobile: "",
        email: "",
        country: "India",
        pincode: "",
        state: "",
        district: "",
        preferredLanguage: "",
        followupNote: "",
        closureDate: "",
        // Company Details
        companyName: "",
        companyGST: "",
        companyMobile: "",
        companyEmail: "",
        companyCountry: "India",
        companyState: "",
        companyDistrict: "",
        companyPreferredLanguage: "",
    });

    const [availableCompanyDistricts, setAvailableCompanyDistricts] = useState([]);

    useEffect(() => {
        if (formData.state) {
            const selectedState = locationData.states.find(
                (s) => s.stateName === formData.state
            );
            setAvailableDistricts(selectedState ? selectedState.districts : []);
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.state]);

    useEffect(() => {
        if (formData.companyState) {
            const selectedState = locationData.states.find(
                (s) => s.stateName === formData.companyState
            );
            setAvailableCompanyDistricts(selectedState ? selectedState.districts : []);
        } else {
            setAvailableCompanyDistricts([]);
        }
    }, [formData.companyState]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.customerName.trim()) newErrors.customerName = "Required";
        if (!formData.mobile.trim()) newErrors.mobile = "Required";
        if (!formData.email.trim()) newErrors.email = "Required";
        if (!formData.state) newErrors.state = "Required";
        if (!formData.district) newErrors.district = "Required";
        if (!formData.closureDate) newErrors.closureDate = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.companyName.trim()) newErrors.companyName = "Required";
        if (!formData.companyState) newErrors.companyState = "Required";
        if (!formData.companyDistrict) newErrors.companyDistrict = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setIsSubmitting(true);
        try {
            const user = getSecureItem("user") || {};
            const payload = {
                leadId: 10, // Since it's a new deal creation not from a lead, we might need a dummy or the backend should handle it
                customer: {
                    name: formData.customerName,
                    mobile: formData.mobile,
                    email: formData.email,
                    country: formData.country,
                    pincode: formData.pincode,
                    state: formData.state,
                    district: formData.district,
                    preferredLanguage: formData.preferredLanguage,
                    followupNote: formData.followupNote,
                    closureDate: formData.closureDate,
                    isAssociate: true
                },
                company: {
                    name: formData.companyName,
                    gst: formData.companyGST,
                    mobile: formData.companyMobile,
                    email: formData.companyEmail,
                    country: formData.companyCountry,
                    state: formData.companyState,
                    district: formData.companyDistrict,
                    preferredLanguage: formData.companyPreferredLanguage,
                    isAssociate: true
                },
                franchiseeId: user.FranchiseeID || 1,
                employeeId: user.EmployeeID || 9,
                isAssociate: true
            };


            console.log("payload", payload);


            const response = await DealsApi.convertToDeal(payload);
            if (response.success) {
                onSuccess && onSuccess();
                onClose();
            } else {
                setErrors({ api: response.message || "Failed to create deal" });
            }
        } catch (error) {
            setErrors({ api: error.response?.data?.message || "An error occurred" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        {/* <h2 className="text-xl font-bold text-gray-900">
                            This lead is qualified. You must create a Deal to proceed.
                        </h2> */}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {/* Customer Details Fields */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Customer Name</label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter customer name"
                                    />
                                    {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Mobile</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter mobile number"
                                    />
                                    {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter pincode"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {locationData.states.map((s) => (
                                                <option key={s.stateId} value={s.stateName}>{s.stateName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                    </div>
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">District</label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            disabled={!formData.state}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none disabled:bg-gray-50"
                                        >
                                            <option value="">Select District</option>
                                            {availableDistricts.map((d) => (
                                                <option key={d.districtId} value={d.districtName}>{d.districtName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Preferred Language</label>
                                    <select
                                        name="preferredLanguage"
                                        value={formData.preferredLanguage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                    >
                                        <option value="">Select Language</option>
                                        <option value="Malayalam">Malayalam</option>
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Tamil">Tamil</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Follow-up Note</label>
                                    <textarea
                                        name="followupNote"
                                        value={formData.followupNote}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent min-h-[100px]"
                                        placeholder="Add note..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Closure Date (required)</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="closureDate"
                                            value={formData.closureDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        />
                                    </div>
                                    {errors.closureDate && <p className="text-xs text-red-500 mt-1">{errors.closureDate}</p>}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleNext}
                                        className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Company Details Fields */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company GST</label>
                                    <input
                                        type="text"
                                        name="companyGST"
                                        value={formData.companyGST}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter GST number"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Company Mobile</label>
                                        <input
                                            type="text"
                                            name="companyMobile"
                                            value={formData.companyMobile}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter mobile number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Company Email</label>
                                        <input
                                            type="email"
                                            name="companyEmail"
                                            value={formData.companyEmail}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Country</label>
                                    <input
                                        type="text"
                                        name="companyCountry"
                                        value={formData.companyCountry}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                                        <select
                                            name="companyState"
                                            value={formData.companyState}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {locationData.states.map((s) => (
                                                <option key={s.stateId} value={s.stateName}>{s.stateName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.companyState && <p className="text-xs text-red-500 mt-1">{errors.companyState}</p>}
                                    </div>
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">District</label>
                                        <select
                                            name="companyDistrict"
                                            value={formData.companyDistrict}
                                            onChange={handleChange}
                                            disabled={!formData.companyState}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none disabled:bg-gray-50"
                                        >
                                            <option value="">Select District</option>
                                            {availableCompanyDistricts.map((d) => (
                                                <option key={d.districtId} value={d.districtName}>{d.districtName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.companyDistrict && <p className="text-xs text-red-500 mt-1">{errors.companyDistrict}</p>}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Preferred Language</label>
                                    <select
                                        name="companyPreferredLanguage"
                                        value={formData.companyPreferredLanguage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                    >
                                        <option value="">Select Language</option>
                                        <option value="Malayalam">Malayalam</option>
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Tamil">Tamil</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                </div>

                                {errors.api && <p className="text-sm text-red-500 text-center">{errors.api}</p>}

                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={handleBack}
                                        className="bg-gray-100 text-gray-700 px-8 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Convert
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AddDealModal;
