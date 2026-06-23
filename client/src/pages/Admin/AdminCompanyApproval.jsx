import React from "react";

export default function AdminCompanyApproval({
    companies,
    onApprove
}) {
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
                                <td colSpan="8" style={{ textAlign: "center" }}>
                                    No pending companies
                                </td>
                            </tr>
                        ) : (
                            companies.map((company) => (
                                <tr key={company.id}>
                                    <td>{company.name}</td>
                                    <td>{company.hr_name}</td>
                                    <td>{company.hr_phone}</td>
                                    <td>{company.email}</td>
                                    <td>{company.tax_id}</td>

                                    <td>
                                        {company.business_license_url ? (
                                            <a
                                                href={company.business_license_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View License
                                            </a>
                                        ) : (
                                            "No File"
                                        )}
                                    </td>

                                    <td>
                                        {company.logo_url ? (
                                            <img
                                                src={company.logo_url}
                                                alt="logo"
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                        ) : (
                                            "No Logo"
                                        )}
                                    </td>

                                    <td>
                                        <button
                                            className="action-btn unban"
                                            onClick={() => onApprove(company.id)}
                                        >
                                            Approve
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