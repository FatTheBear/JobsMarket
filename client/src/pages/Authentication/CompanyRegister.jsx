import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Register.module.css";

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    hrName: "",
    hrPhone: "",
    email: "",
    password: "",
    repeatPassword: "",
    companyName: "",
    companyPhone: "",
    location: "",
    taxId: "",
    industryId: "",
    size: "",
    description: ""
  });

  const [files, setFiles] = useState({
    logo: null,
    businessLicense: null
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    setFiles({ ...files, [name]: e.target.files[0] });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.hrName) newErrors.hrName = "HR Name is required";
    if (!formData.hrPhone) newErrors.hrPhone = "HR Phone is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.repeatPassword) newErrors.repeatPassword = "Passwords do not match";
    if (!formData.companyName) newErrors.companyName = "Company Name is required";
    if (!formData.companyPhone) newErrors.companyPhone = "Company Phone is required";
    if (!formData.location) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!files.logo) newErrors.logo = "Company Logo is required";
    if (!formData.taxId) newErrors.taxId = "Tax ID is required";
    if (!files.businessLicense) newErrors.businessLicense = "Business License is required";
    if (!formData.industryId) newErrors.industryId = "Industry is required";
    if (!formData.size) newErrors.size = "Company Size is required";
    if (!formData.description) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateStep2()) return;

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== "repeatPassword") {
        submitData.append(key, formData[key]);
      }
    });

    submitData.append("logo", files.logo);
    submitData.append("businessLicense", files.businessLicense);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register-company", submitData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 200 || response.status === 201) {
        navigate('/registration-pending');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        setApiError(data.errors ? data.errors.join(", ") : data.message);
      } else {
        setApiError("Connection error! Please ensure the server is running.");
      }
    }
  };

  return (
    <section className="vh-100 bg-image" style={{ backgroundImage: 'url("https://mdbcdn.b-cdn.net/img/Photos/new-templates/search-box/img4.webp")', backgroundSize: 'cover', backgroundAttachment: 'fixed', overflowY: 'auto' }}>
      <div className={`mask d-flex align-items-center py-5 ${styles.gradientCustom3}`} style={{ minHeight: '100vh' }}>
        <div className="container">
          <div className="row d-flex justify-content-center align-items-center">
            <div className="col-12 col-lg-10 col-xl-9">
              <div className="card" style={{ borderRadius: 15 }}>
                <div className="card-body p-5">
                  <h2 className="text-uppercase text-center mb-5">
                    Company Registration
                  </h2>

                  {apiError && (
                    <div className="alert alert-danger mb-4 text-center">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} noValidate>
                    {step === 1 && (
                      <>
                        <h5 className="mb-4" style={{ color: '#01796F' }}>1. Basic Information</h5>
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <input type="text" id="hrName" name="hrName" className={`form-control ${styles.formControl}`} placeholder="HR Name" value={formData.hrName} onChange={handleInputChange} />
                              <label htmlFor="hrName">Full Name</label>
                            </div>
                            {errors.hrName && <div className="text-danger small mt-1 px-1">{errors.hrName}</div>}
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <input type="text" id="hrPhone" name="hrPhone" className={`form-control ${styles.formControl}`} placeholder="HR Phone" value={formData.hrPhone} onChange={handleInputChange} />
                              <label htmlFor="hrPhone">Contact Number</label>
                            </div>
                            {errors.hrPhone && <div className="text-danger small mt-1 px-1">{errors.hrPhone}</div>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-12 mb-4">
                            <div className="form-floating">
                              <input type="email" id="email" name="email" className={`form-control ${styles.formControl}`} placeholder="Email" value={formData.email} onChange={handleInputChange} />
                              <label htmlFor="email">Company Email Address</label>
                            </div>
                            {errors.email && <div className="text-danger small mt-1 px-1">{errors.email}</div>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <input type="password" id="password" name="password" className={`form-control ${styles.formControl}`} placeholder="Password" value={formData.password} onChange={handleInputChange} />
                              <label htmlFor="password">Password</label>
                            </div>
                            {errors.password && <div className="text-danger small mt-1 px-1">{errors.password}</div>}
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <input type="password" id="repeatPassword" name="repeatPassword" className={`form-control ${styles.formControl}`} placeholder="Repeat Password" value={formData.repeatPassword} onChange={handleInputChange} />
                              <label htmlFor="repeatPassword">Repeat Password</label>
                            </div>
                            {errors.repeatPassword && <div className="text-danger small mt-1 px-1">{errors.repeatPassword}</div>}
                          </div>
                        </div>

                        <h5 className="mb-4 mt-2" style={{ color: '#01796F' }}>Company Details</h5>
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <input type="text" id="companyName" name="companyName" className={`form-control ${styles.formControl}`} placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} />
                              <label htmlFor="companyName">Company Name</label>
                            </div>
                            {errors.companyName && <div className="text-danger small mt-1 px-1">{errors.companyName}</div>}
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <input type="text" id="companyPhone" name="companyPhone" className={`form-control ${styles.formControl}`} placeholder="Company Phone" value={formData.companyPhone} onChange={handleInputChange} />
                              <label htmlFor="companyPhone">Company Phone</label>
                            </div>
                            {errors.companyPhone && <div className="text-danger small mt-1 px-1">{errors.companyPhone}</div>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-12 mb-4">
                            <div className="form-floating">
                              <input type="text" id="location" name="location" className={`form-control ${styles.formControl}`} placeholder="Location" value={formData.location} onChange={handleInputChange} />
                              <label htmlFor="location">Headquarters Location</label>
                            </div>
                            {errors.location && <div className="text-danger small mt-1 px-1">{errors.location}</div>}
                          </div>
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                          <Link to="/login" className="text-muted mt-2">
                            Already have an account? Sign In
                          </Link>
                          <button type="button" onClick={handleNext} className={`btn btn-success btn-lg px-5 ${styles.gradientCustom4}`}>
                            Next <i className="ms-2">➔</i>
                          </button>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <h5 className="mb-4" style={{ color: '#01796F' }}>2. Detailed Information</h5>

                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <label className="form-label text-muted px-1">Company Logo</label>
                            <input type="file" name="logo" className={`form-control form-control-lg ${styles.formControl}`} accept="image/*" onChange={handleFileChange} />
                            {errors.logo && <div className="text-danger small mt-1 px-1">{errors.logo}</div>}
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label text-muted px-1">Business License</label>
                            <input type="file" name="businessLicense" className={`form-control form-control-lg ${styles.formControl}`} accept=".pdf,image/*" onChange={handleFileChange} />
                            {errors.businessLicense && <div className="text-danger small mt-1 px-1">{errors.businessLicense}</div>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-12 mb-4">
                            <div className="form-floating">
                              <input type="text" id="taxId" name="taxId" className={`form-control ${styles.formControl}`} placeholder="Tax ID" value={formData.taxId} onChange={handleInputChange} />
                              <label htmlFor="taxId">Tax ID</label>
                            </div>
                            {errors.taxId && <div className="text-danger small mt-1 px-1">{errors.taxId}</div>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <select id="industryId" name="industryId" className={`form-select ${styles.formControl}`} value={formData.industryId} onChange={handleInputChange}>
                                <option value="" disabled>Select Industry</option>
                                <option value="1">Information Technology</option>
                                <option value="2">Finance & Banking</option>
                                <option value="3">Healthcare</option>
                                <option value="4">Education</option>
                                <option value="5">E-commerce</option>
                              </select>
                              <label htmlFor="industryId">Industry</label>
                            </div>
                            {errors.industryId && <div className="text-danger small mt-1 px-1">{errors.industryId}</div>}
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="form-floating">
                              <select id="size" name="size" className={`form-select ${styles.formControl}`} value={formData.size} onChange={handleInputChange}>
                                <option value="" disabled>Select Size</option>
                                <option value="1-50">1 - 50 Employees</option>
                                <option value="51-200">51 - 200 Employees</option>
                                <option value="201-1000">201 - 1000 Employees</option>
                                <option value="1000+">1000+ Employees</option>
                              </select>
                              <label htmlFor="size">Company Scale</label>
                            </div>
                            {errors.size && <div className="text-danger small mt-1 px-1">{errors.size}</div>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-12 mb-4">
                            <div className="form-floating">
                              <textarea id="description" name="description" className={`form-control ${styles.formControl}`} placeholder="Description" style={{ height: '120px' }} value={formData.description} onChange={handleInputChange}></textarea>
                              <label htmlFor="description">Company Description</label>
                            </div>
                            {errors.description && <div className="text-danger small mt-1 px-1">{errors.description}</div>}
                          </div>
                        </div>

                        <div className="form-check d-flex justify-content-center mb-5 mt-3">
                          <input className="form-check-input me-2" type="checkbox" id="termsCheck" defaultChecked />
                          <label className="form-check-label" htmlFor="termsCheck">
                            I agree to all statements in <a href="#!" style={{ color: '#01796F' }}><u>Terms of service</u></a>
                          </label>
                        </div>

                        <div className="d-flex justify-content-between">
                          <button type="button" onClick={handleBack} className="btn btn-outline-secondary btn-lg px-4" style={{ borderRadius: '8px' }}>
                            <i>⬅</i> Back
                          </button>
                          <button type="submit" className={`btn btn-success btn-lg px-5 ${styles.gradientCustom4}`}>
                            Submit
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}