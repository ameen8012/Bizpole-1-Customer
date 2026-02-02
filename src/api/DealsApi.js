import axiosInstance from "./axiosInstance";
import { getSecureItem } from "../utils/secureStorage";

/**
 * Convert a lead-like data structure to a deal
 * @param {Object} payload - { leadId, customer, company, franchiseeId, employeeId }
 * @returns {Promise<Object>} - API response
 */
export const convertToDeal = async (payload) => {
    try {
        // const token = getSecureItem("token");
        // console.log("token", token);

        const response = await axiosInstance.post("/lead-generation/convert-to-deal", payload, {
            // headers: {
            //     Authorization: `Bearer ${token}`
            // }
        });
        return response.data;
    } catch (error) {
        console.error("Error converting to deal:", error);
        throw error;
    }
};

/**
 * List deals with filters and pagination
 * @param {Object} filters - { franchiseId, employeeId, status, page, limit, search, isAssociate, ... }
 * @returns {Promise<Object>} - { success, total, data }
 */
export const listDeals = async (filters) => {
    try {
        const response = await axiosInstance.post("/getdeals", filters);
        return response.data;
    } catch (error) {
        console.error("Error listing deals:", error);
        throw error;
    }
};

export const listAssociateCustomers = async (payload) => {
    try {
        const response = await axiosInstance.post("/customer/associate-list", payload);
        return response.data;
    } catch (error) {
        console.error("Error listing associate customers:", error);
        throw error;
    }
};

export const listAssociateCompanies = async (payload) => {
    try {
        const response = await axiosInstance.post("/company/associate-list", payload);
        return response.data;
    } catch (error) {
        console.error("Error listing associate companies:", error);
        throw error;
    }
};

export default {
    convertToDeal,
    listDeals,
    listAssociateCustomers,
    listAssociateCompanies,
};
