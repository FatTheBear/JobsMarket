import React, { useState, useEffect } from "react";
import { useModal } from "./useModal";



const CreateNewsModal = ({ onClose, onCreate, categories = [], initialData, onCreateCategory }) => {
    const { showAlert } = useModal();
    const [form, setForm] = useState({
        title: "",
        slug: "",
        category_id: "",
        thumbnail_url: "",
        short_description: "",
        content: "",
        status: "Draft",
        is_featured: 0,
        published_at: ""
    });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title || "",
                slug: initialData.slug || "",
                category_id: initialData.category_id || "",
                thumbnail_url: initialData.thumbnail_url || "",
                short_description: initialData.short_description || "",
                content: initialData.content || "",
                status: initialData.status || "Draft",
                is_featured: initialData.is_featured || 0,
                published_at: initialData.published_at
                    ? new Date(initialData.published_at).toISOString().split("T")[0]
                    : ""
            });
            setFile(null);
            setPreviewUrl(null);
        }
    }, [initialData]);

    useEffect(() => {
        if (initialData) return;
        if (!form.title) return;
        const slug = form.title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
        setForm((prev) => ({ ...prev, slug }));
    }, [form.title]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
    };

    const resizeImage = (file, maxWidth = 400, quality = 0.6) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (!blob) return resolve(file);
                    resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
                }, "image/jpeg", quality);
            };
            img.onerror = () => resolve(file);
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const raw = e.target.files[0];
        if (!raw) return;
        const resized = await resizeImage(raw);
        setFile(resized);
        setPreviewUrl(URL.createObjectURL(resized));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.category_id) {
            await showAlert("Title and Category are required", "error");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("slug", form.slug);
            formData.append("category_id", Number(form.category_id));
            formData.append("short_description", form.short_description);
            formData.append("content", form.content);
            formData.append("status", form.status);
            formData.append("is_featured", form.is_featured);
            formData.append("published_at", form.published_at);
            if (file) {
                formData.append("thumbnail", file);
            } else if (form.thumbnail_url) {
                formData.append("thumbnail_url", form.thumbnail_url);
            }
            await onCreate(formData);
            onClose();
        } catch {
            await showAlert("Create failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        console.log("onCreateCategory prop:", onCreateCategory); // thêm dòng này
        setAddingCategory(true);
        try {
            const created = await onCreateCategory(newCategoryName.trim());
            console.log("created result:", created); // thêm dòng này
            setForm(prev => ({ ...prev, category_id: created.id }));
            setNewCategoryName("");
            setShowAddCategory(false);
        } catch (err) {
            console.error("handleAddCategory error:", err); // sửa catch để thấy lỗi thật
            await showAlert("Failed to create category", "error");
        } finally {
            setAddingCategory(false);
        }
    };

    const thumbnailSrc = previewUrl || (form.thumbnail_url ? `http://localhost:5000${form.thumbnail_url}` : null);

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                {/* Header */}
                <div style={s.header}>
                    <span style={s.headerTitle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: "middle" }}>
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 13H8" /><path d="M16 17H8" /><path d="M16 13h-2" />
                        </svg>
                        {initialData ? "Edit article" : "Create article"}
                    </span>
                    <button onClick={onClose} style={s.closeBtn} aria-label="Close">✕</button>
                </div>

                {/* Body */}
                <div style={s.body}>
                    {/* Title */}
                    <div style={s.field}>
                        <label style={s.label}>Title</label>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="Enter article title..." style={s.input} />
                    </div>

                    {/* Slug + Category */}
                    <div style={s.row}>
                        <div style={s.field}>
                            <label style={s.label}>Slug</label>
                            <input name="slug" value={form.slug} onChange={handleChange} placeholder="auto-generated-slug" style={s.input} />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Category</label>
                            <div style={{ display: "flex", gap: 6 }}>
                                <select
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    style={{ ...s.input, flex: 1 }}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowAddCategory(v => !v)}
                                    style={s.addCatBtn}
                                    title="Add new category"
                                >+</button>
                            </div>
                            {showAddCategory && (
                                <div style={s.addCatBox}>
                                    <input
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                                        placeholder="New category name..."
                                        style={{ ...s.input, flex: 1 }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        disabled={addingCategory || !newCategoryName.trim()}
                                        style={s.addCatConfirmBtn}
                                    >
                                        {addingCategory ? "..." : "Add"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div style={s.field}>
                        <label style={s.label}>Thumbnail</label>
                        <label style={s.uploadBox}>
                            {thumbnailSrc ? (
                                <img src={thumbnailSrc} alt="preview" style={s.previewImg} />
                            ) : (
                                <>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                                    </svg>
                                    <span style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Click to upload image</span>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                        </label>
                    </div>

                    {/* Short description */}
                    <div style={s.field}>
                        <label style={s.label}>Short description</label>
                        <textarea name="short_description" value={form.short_description} onChange={handleChange} placeholder="Brief summary of the article..." style={s.textarea} />
                    </div>

                    {/* Content */}
                    <div style={s.field}>
                        <label style={s.label}>Content</label>
                        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Full article content..." style={{ ...s.textarea, minHeight: 100 }} />
                    </div>

                    {/* Status + Date */}
                    <div style={s.row}>
                        <div style={s.field}>
                            <label style={s.label}>Status</label>
                            <select name="status" value={form.status} onChange={handleChange} style={s.input}>
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Publish date</label>
                            <input type="date" name="published_at" value={form.published_at} onChange={handleChange} style={s.input} />
                        </div>
                    </div>

                    {/* Featured toggle */}
                    <div style={s.toggleRow}>
                        <span style={s.toggleLabel}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#01796F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Featured article
                        </span>
                        <label style={s.toggle}>
                            <input type="checkbox" name="is_featured" checked={form.is_featured === 1} onChange={handleChange} style={{ display: "none" }} />
                            <span style={{
                                ...s.toggleTrack,
                                background: form.is_featured === 1 ? "#01796F" : "#cbd5e1"
                            }}>
                                <span style={{
                                    ...s.toggleThumb,
                                    transform: form.is_featured === 1 ? "translateX(16px)" : "translateX(0)"
                                }} />
                            </span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div style={s.footer}>
                    <button onClick={onClose} style={s.cancelBtn}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={loading ? { ...s.createBtn, opacity: 0.7 } : s.createBtn}>
                        {loading ? "Creating..." : "Create article"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const s = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 16
    },
    modal: {
        background: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 520,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "92vh"
    },
    header: {
        background: "#01796F",
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0
    },
    headerTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 500
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: "none",
        background: "rgba(255,255,255,0.15)",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    body: {
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflowY: "auto"
    },
    footer: {
        padding: "16px 24px",
        background: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        flexShrink: 0
    },
    field: { display: "flex", flexDirection: "column", gap: 5 },
    label: { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
    input: {
        padding: "9px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        fontSize: 14,
        color: "#1e293b",
        background: "#fff",
        outline: "none",
        fontFamily: "inherit",
        width: "100%",
        boxSizing: "border-box"
    },
    textarea: {
        padding: "9px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        fontSize: 14,
        color: "#1e293b",
        background: "#fff",
        outline: "none",
        fontFamily: "inherit",
        resize: "vertical",
        minHeight: 72,
        lineHeight: 1.5,
        width: "100%",
        boxSizing: "border-box"
    },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    uploadBox: {
        border: "1.5px dashed #cbd5e1",
        borderRadius: 8,
        padding: 16,
        textAlign: "center",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transition: "border-color 0.15s"
    },
    previewImg: {
        width: "100%",
        maxHeight: 140,
        objectFit: "cover",
        borderRadius: 6
    },
    toggleRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0"
    },
    toggleLabel: { fontSize: 14, color: "#334155", display: "flex", alignItems: "center" },
    toggle: { cursor: "pointer" },
    toggleTrack: {
        display: "block",
        width: 36,
        height: 20,
        borderRadius: 999,
        position: "relative",
        transition: "background 0.2s"
    },
    toggleThumb: {
        display: "block",
        position: "absolute",
        width: 14,
        height: 14,
        background: "#fff",
        borderRadius: "50%",
        top: 3,
        left: 3,
        transition: "transform 0.2s"
    },
    cancelBtn: {
        padding: "9px 18px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#fff",
        color: "#64748b",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer"
    },
    createBtn: {
        padding: "9px 20px",
        borderRadius: 8,
        border: "none",
        background: "#01796F",
        color: "#fff",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer"
    },

    addCatBtn: {
        padding: "9px 14px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#f1f5f9",
        color: "#01796F",
        fontSize: 18,
        fontWeight: 600,
        cursor: "pointer",
        lineHeight: 1,
        flexShrink: 0
    },
    addCatBox: {
        display: "flex",
        gap: 6,
        marginTop: 4,
        padding: "10px 12px",
        background: "#f0fdf9",
        borderRadius: 8,
        border: "1px solid #99f6e4"
    },
    addCatConfirmBtn: {
        padding: "9px 14px",
        borderRadius: 8,
        border: "none",
        background: "#01796F",
        color: "#fff",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        flexShrink: 0
    },
};

export default CreateNewsModal;