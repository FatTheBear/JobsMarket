import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCompanyApproval() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const token = localStorage.getItem('token');
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
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
            showToast("Failed to load pending companies.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (companyId, companyName) => {
        if (!window.confirm(`Are you sure you want to approve ${companyName}?`)) return;

        setActionId(companyId);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch(`${API_URL}/api/admin/companies/${companyId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCompanies(companies.filter(c => c.company_id !== companyId));
            showToast(`Approved! Activation code for ${companyName}: ${response.data.activationCode}`, "success");
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to approve company.", "error");
        } finally {
            setActionId(null);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 6000);
    };

    if (loading) {
        return <h3 style={{ textAlign: "center", marginTop: "50px" }}>Loading pending registrations...</h3>;
    }

    return (
        <div>
            {toast.show && (
                <div style={{
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    backgroundColor: toast.type === "success" ? "#d4edda" : "#f8d7da",
                    color: toast.type === "success" ? "#155724" : "#721c24",
                    border: `1px solid ${toast.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <strong>{toast.message}</strong>
                    <button 
                        onClick={() => setToast({ show: false, message: "", type: "" })}
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}
                    >
                        ✖
                    </button>
                </div>
            )}

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