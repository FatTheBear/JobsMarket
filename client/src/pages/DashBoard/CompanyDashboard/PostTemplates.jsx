import React from "react";

export default function PostTemplates() {
  const templates = [
    {
      title: "Frontend Developer",
      content:
        "We are looking for a Frontend Developer with experience in React.js and modern JavaScript.",
    },
    {
      title: "Backend Developer",
      content:
        "We are looking for a Backend Developer with experience in Node.js, Express and MySQL.",
    },
    {
      title: "UI/UX Designer",
      content:
        "We are seeking a creative UI/UX Designer to design user-friendly web applications.",
    },
    {
      title: "QA Engineer",
      content:
        "We are hiring a QA Engineer to ensure software quality through testing and automation.",
    },
  ];

  return (
    <div>
      <h1>Job Post Templates</h1>

      {templates.map((template) => (
        <div
          key={template.title}
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>{template.title}</h3>
          <p>{template.content}</p>
        </div>
      ))}
    </div>
  );
}