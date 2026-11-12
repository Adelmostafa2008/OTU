import { useState } from "react";
import { FiFolder, FiFileText, FiChevronRight, FiChevronDown } from "react-icons/fi";

const Subjects = () => {
  const [expandedSubject, setExpandedSubject] = useState(null);

  // Dummy data for subjects and their lessons
  const subjectsData = [
    {
      id: 1,
      name: "Mathematics",
      code: "MATH101",
      description: "Advanced calculus and linear algebra",
      lessons: [
        { id: 101, title: "Introduction to Calculus", type: "Lecture" },
        { id: 102, title: "Derivatives and Applications", type: "Lecture" },
        { id: 103, title: "Practice Exercises - Week 1", type: "Assignment" },
      ],
    },
    {
      id: 2,
      name: "Computer Science",
      code: "CS201",
      description: "Data structures and algorithms",
      lessons: [
        { id: 201, title: "Arrays and Linked Lists", type: "Lecture" },
        { id: 202, title: "Stacks and Queues", type: "Tutorial" },
        { id: 203, title: "Recursion Fundamentals", type: "Lecture" },
        { id: 204, title: "Lab Exercise 1", type: "Lab" },
      ],
    },
    {
      id: 3,
      name: "Physics",
      code: "PHY102",
      description: "Mechanics and thermodynamics",
      lessons: [
        { id: 301, title: "Newton's Laws of Motion", type: "Lecture" },
        { id: 302, title: "Energy and Work", type: "Lecture" },
      ],
    },
    {
      id: 4,
      name: "English Literature",
      code: "ENG150",
      description: "Modern literature and critical analysis",
      lessons: [
        { id: 401, title: "Shakespearean Tragedies", type: "Lecture" },
        { id: 402, title: "Essay Writing Workshop", type: "Workshop" },
        { id: 403, title: "Reading Assignment", type: "Assignment" },
      ],
    },
  ];

  const toggleSubject = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Lecture":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Tutorial":
        return "bg-green-50 text-green-700 border-green-200";
      case "Lab":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Assignment":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Workshop":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Subjects
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Browse your enrolled subjects and lessons
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto w-full">
        {subjectsData.map((subject) => (
          <div
            key={subject.id}
            className="bg-white border rounded-2xl overflow-hidden transition-all"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <button
              onClick={() => toggleSubject(subject.id)}
              className="w-full flex items-center gap-4 p-4 sm:p-5 bg-white hover:bg-gray-50/70 transition-colors text-left"
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary) 10%, transparent)" }}
              >
                <FiFolder style={{ color: "var(--color-brand-primary)" }} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 min-w-0 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900 m-0 break-words">
                    {subject.name}
                  </h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
                    style={{
                      color: "var(--color-brand-primary)",
                      backgroundColor: "color-mix(in srgb, var(--color-brand-primary) 10%, transparent)",
                    }}
                  >
                    {subject.code}
                  </span>
                </div>
                <p className="text-sm text-gray-500 m-0 whitespace-normal break-words w-full">
                  {subject.description}
                </p>
                <p className="text-xs text-gray-400 m-0 mt-1">
                  {subject.lessons.length} lesson{subject.lessons.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-shrink-0">
                {expandedSubject === subject.id ? (
                  <FiChevronDown className="text-gray-400" size={20} />
                ) : (
                  <FiChevronRight className="text-gray-400" size={20} />
                )}
              </div>
            </button>

            {expandedSubject === subject.id && (
              <div className="border-t bg-gray-50/60" style={{ borderColor: "var(--color-border-primary)" }}>
                <div className="p-4 sm:p-5 space-y-2">
                  {subject.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border transition-all cursor-pointer group"
                      style={{ borderColor: "var(--color-border-primary)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "color-mix(in srgb, var(--color-brand-primary) 45%, transparent)";
                        e.currentTarget.style.backgroundColor =
                          "color-mix(in srgb, var(--color-brand-primary) 4%, white)";
                        const iconDiv = e.currentTarget.querySelector(".lesson-icon-bg");
                        const icon = e.currentTarget.querySelector(".lesson-icon");
                        if (iconDiv)
                          iconDiv.style.backgroundColor =
                            "color-mix(in srgb, var(--color-brand-primary) 15%, transparent)";
                        if (icon) icon.style.color = "var(--color-brand-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-border-primary)";
                        e.currentTarget.style.backgroundColor = "white";
                        const iconDiv = e.currentTarget.querySelector(".lesson-icon-bg");
                        const icon = e.currentTarget.querySelector(".lesson-icon");
                        if (iconDiv) iconDiv.style.backgroundColor = "rgb(243 244 246)";
                        if (icon) icon.style.color = "rgb(107 114 128)";
                      }}
                    >
                      <div className="lesson-icon-bg flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center transition-colors">
                        <FiFileText className="lesson-icon text-gray-500 transition-colors" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 m-0 break-words">
                          {lesson.title}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-md border flex-shrink-0 ${getTypeColor(
                          lesson.type,
                        )}`}
                      >
                        {lesson.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;
