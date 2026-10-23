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
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Subjects
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Browse your enrolled subjects and lessons
        </p>
      </div>

      <div className="space-y-4 max-w-4xl">
        {subjectsData.map((subject) => (
          <div
            key={subject.id}
            className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_32px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.03)]"
          >
            <button
              onClick={() => toggleSubject(subject.id)}
              className="w-full flex items-center gap-4 p-4 sm:p-5 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <FiFolder className="text-teal-400" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 m-0">
                    {subject.name}
                  </h3>
                  <span className="text-xs font-semibold text-teal-400 bg-teal-50 px-2 py-0.5 rounded-md">
                    {subject.code}
                  </span>
                </div>
                <p className="text-sm text-gray-500 m-0 truncate">
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
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-4 sm:p-5 space-y-2">
                  {subject.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                        <FiFileText
                          className="text-gray-500 group-hover:text-teal-400 transition-colors"
                          size={18}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 m-0 truncate">
                          {lesson.title}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-md border ${getTypeColor(
                          lesson.type
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
