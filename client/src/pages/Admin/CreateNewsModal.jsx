import React, { useState, useEffect } from "react";

const CreateNewsModal = ({ onClose, onCreate, categories = [], initialData }) => {

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
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (initialData) {
            setForm(initialData);
            setFile(null); // reset file khi edit
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

        setForm((prev) => ({
            ...prev,
            slug
        }));
    }, [form.title]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value
        });
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

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) return resolve(file);

                    const newFile = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now()
                    });

                    console.log("RESIZED SIZE:", newFile.size);

                    resolve(newFile);
                }, "image/jpeg", quality);
            };

            img.onerror = () => resolve(file);

            img.src = URL.createObjectURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title || !form.category_id) {
            alert("Title và Category là bắt buộc");
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
        } catch (err) {
            alert("Create failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>Create News</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        name="title"
                        placeholder="Title"
                        value={form.title}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <input
                        name="slug"
                        placeholder="Slug"
                        value={form.slug}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {form.thumbnail_url && !file && (
                        <img
                            src={`http://localhost:5000${form.thumbnail_url}`}
                            alt="preview"
                            style={{ width: 100, marginBottom: 10, borderRadius: 6 }}
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const resized = await resizeImage(file);
                            setFile(resized);
                        }}
                    />

                    <textarea
                        name="short_description"
                        placeholder="Short description"
                        value={form.short_description}
                        onChange={handleChange}
                        style={styles.textarea}
                    />

                    <textarea
                        name="content"
                        placeholder="Content"
                        value={form.content}
                        onChange={handleChange}
                        style={{ ...styles.textarea, height: 120 }}
                    />

                    <label style={{ color: "#fff" }}>
                        <input
                            type="checkbox"
                            name="is_featured"
                            checked={form.is_featured === 1}
                            onChange={handleChange}
                        />
                        Featured
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>

                    <input
                        type="date"
                        name="published_at"
                        value={form.published_at}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <div style={styles.actions}>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>

                        <button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    modal: {
        background: "#01796F",
        padding: 20,
        borderRadius: 10,
        width: 520,
        color: "#ffffff"
    },
    form: { display: "flex", flexDirection: "column", gap: 10 },
    input: {
        padding: 10,
        borderRadius: 6,
        border: "1px solid #ffffff",
        background: "#ffffff",
        color: "#000000"
    },
    textarea: {
        padding: 10,
        borderRadius: 6,
        border: "1px solid #f8fbff",
        background: "#ffffff",
        color: "#000000",
        minHeight: 80
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10
    }
};

export default CreateNewsModal;