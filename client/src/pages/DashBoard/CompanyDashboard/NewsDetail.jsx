import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function NewsDetail() {
    const { id } = useParams();
    const [news, setNews] = useState(null);

    useEffect(() => {
        console.log("RUNNING API CALL HERE");
        fetch(`http://localhost:5000/api/public/news/${id}`)
            .then(res => res.json())
            .then(setNews)
            .catch(console.error);
    }, [id]);

    if (!news) return <div>Đang tải nội dung...</div>;

    // FIX IMAGE SAFE
    const imageSrc =
        news.thumbnail_url
            ? (news.thumbnail_url.startsWith("http")
                ? news.thumbnail_url
                : `http://localhost:5000${news.thumbnail_url}`)
            : "/default-news-image.jpg";

    // FIX DATE SAFE (MySQL format)
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr.replace(" ", "T")).toLocaleDateString();
    };

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
            <h1>{news.title}</h1>

            <p>
                <i>{formatDate(news.created_at)}</i>
            </p>

            <img
                src={imageSrc}
                alt="thumb"
                style={{
                    width: "200px",
                    height: "130px",
                    objectFit: "cover",
                    borderRadius: "6px"
                }}
                onError={(e) => {
                    e.target.src = "/default-news-image.jpg";
                }}
            />

            <div
                dangerouslySetInnerHTML={{
                    __html: news.content || "<p>No content</p>"
                }}
            />
        </div>
    );
}