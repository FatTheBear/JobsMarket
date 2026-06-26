import React, { useState, useEffect } from "react";
import axios from "axios";
import { useModal } from './useModal'; // Đảm bảo đường dẫn này đúng

export default function AdminCompanyApproval() {
    const { showAlert, showConfirm } = useModal();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const API_URL = "http://localhost:5000";

    useEffect(() => {
        fetchPendingCompanies();
    }, []);

    const fetchPendingCompanies = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/admin/companies/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(response.data);
        } catch (error) {
            await showAlert("Failed to load pending companies.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (companyId, companyName) => {
        // Thay thế confirm bằng modal
        const confirmed = await showConfirm(`Are you sure you want to approve ${companyName}?`);
        if (!confirmed) return;

        setActionId(companyId);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch(`${API_URL}/api/admin/companies/${companyId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCompanies(companies.filter(c => c.company_id !== companyId));
            // Thông báo thành công với modal
            await showAlert(`Approved! Activation code for ${companyName}: ${response.data.activationCode}`, "success");
        } catch (error) {
            await showAlert(error.response?.data?.message || "Failed to approve company.", "error");
        } finally {
            setActionId(null);
        }
    };

    if (loading) {
        return <h3 style={{ textAlign: "center", marginTop: "50px" }}>Loading pending registrations...</h3>;
    }

    return (
        <div>
            <h1 className="admin-title">
                Company Approval
            </h1>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>HR Name</th>
                            <th>HR Phone</th>
                            <th>Email</th>
                            <th>Tax ID</th>
                            <th>Business License</th>
                            <th>Logo</th>
                            <th>Approve</th>
                        </tr>
                    </thead>

                    <tbody>
                        {companies.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                                    No pending companies
                                </td>
                            </tr>
                        ) : (
                            companies.map((company) => (
                                <tr key={company.company_id}>
                                    <td>{company.company_name}</td>
                                    <td>{company.hr_name || "N/A"}</td>
                                    <td>{company.hr_phone || "N/A"}</td>
                                    <td>{company.company_email}</td>
                                    <td>{company.tax_id || "N/A"}</td>

                                    <td>
                                        {company.business_license_url ? (
                                            <a
                                                href={`${API_URL}${company.business_license_url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: "#01796F", textDecoration: "underline" }}
                                            >
                                                View License
                                            </a>
                                        ) : (
                                            <span style={{ color: "gray" }}>No File</span>
                                        )}
                                    </td>

                                    <td>
                                        {company.logo_url ? (
                                            <img
                                                src={`${API_URL}${company.logo_url}`}
                                                alt="logo"
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    border: "1px solid #ddd"
                                                }}
                                            />
                                        ) : (
                                            <span style={{ color: "gray" }}>No Logo</span>
                                        )}
                                    </td>

                                    <td>
                                        <button
                                            className="action-btn unban"
                                            onClick={() => handleApprove(company.company_id, company.company_name)}
                                            disabled={actionId === company.company_id}
                                            style={{
                                                opacity: actionId === company.company_id ? 0.7 : 1,
                                                cursor: actionId === company.company_id ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            {actionId === company.company_id ? "Processing..." : "Approve"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}