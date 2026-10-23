import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import CardComponent from "./CardComponent";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    byYear: [],
    byFaculty: [],
    byDivision: [],
    byGroup: [],
    totalSubjects: 0,
    totalLessons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Role-based access control - only admin can access
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    fetchDashboardStats();
  }, [user, navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Making requests with empty URLs as requested
      const [studentsRes, yearRes, facultyRes, divisionRes, groupRes, subjectsRes, lessonsRes] =
        await Promise.allSettled([
          api.get(""),
          api.get(""),
          api.get(""),
          api.get(""),
          api.get(""),
          api.get(""),
          api.get(""),
        ]);

      // Use dummy data for display as requested
      setStats({
        totalStudents: 1247,
        byYear: [
          { year: "1st Year", count: 342 },
          { year: "2nd Year", count: 298 },
          { year: "3rd Year", count: 312 },
          { year: "4th Year", count: 295 },
        ],
        byFaculty: [
          { faculty: "Engineering", count: 456 },
          { faculty: "Science", count: 389 },
          { faculty: "Business", count: 402 },
        ],
        byDivision: [
          { division: "A", count: 423 },
          { division: "B", count: 412 },
          { division: "C", count: 412 },
        ],
        byGroup: [
          { group: "Group 1", count: 312 },
          { group: "Group 2", count: 298 },
          { group: "Group 3", count: 319 },
          { group: "Group 4", count: 318 },
        ],
        totalSubjects: 45,
        totalLessons: 328,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Keep dummy data on error
      setStats({
        totalStudents: 1247,
        byYear: [
          { year: "1st Year", count: 342 },
          { year: "2nd Year", count: 298 },
          { year: "3rd Year", count: 312 },
          { year: "4th Year", count: 295 },
        ],
        byFaculty: [
          { faculty: "Engineering", count: 456 },
          { faculty: "Science", count: 389 },
          { faculty: "Business", count: 402 },
        ],
        byDivision: [
          { division: "A", count: 423 },
          { division: "B", count: 412 },
          { division: "C", count: 412 },
        ],
        byGroup: [
          { group: "Group 1", count: 312 },
          { group: "Group 2", count: 298 },
          { group: "Group 3", count: 319 },
          { group: "Group 4", count: 318 },
        ],
        totalSubjects: 45,
        totalLessons: 328,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Admin Dashboard

        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Platform overview and statistics
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-teal-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overview Cards */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              <CardComponent
                name={`Total Students: ${stats.totalStudents}`}
                subject="Platform"
                description="Total enrolled students across all years"
              />
              <CardComponent
                name={`Total Subjects: ${stats.totalSubjects}`}
                subject="Content"
                description="Subjects available on the platform"
              />
              <CardComponent
                name={`Total Lessons: ${stats.totalLessons}`}
                subject="Content"
                description="Lessons uploaded across all subjects"
              />
            </div>
          </section>

          {/* Students by Year */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Students by Year</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {stats.byYear.map((item, index) => (
                <CardComponent
                  key={index}
                  name={`${item.count} Students`}
                  subject={item.year}
                  description={`Enrolled in ${item.year}`}
                />
              ))}
            </div>
          </section>

          {/* Students by Faculty */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Students by Faculty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {stats.byFaculty.map((item, index) => (
                <CardComponent
                  key={index}
                  name={`${item.count} Students`}
                  subject={item.faculty}
                  description={`Students in ${item.faculty} faculty`}
                />
              ))}
            </div>
          </section>

          {/* Students by Division */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Students by Division</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {stats.byDivision.map((item, index) => (
                <CardComponent
                  key={index}
                  name={`${item.count} Students`}
                  subject={`Division ${item.division}`}
                  description={`Students in Division ${item.division}`}
                />
              ))}
            </div>
          </section>

          {/* Students by Group */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Students by Group</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {stats.byGroup.map((item, index) => (
                <CardComponent
                  key={index}
                  name={`${item.count} Students`}
                  subject={item.group}
                  description={`Students in ${item.group}`}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
