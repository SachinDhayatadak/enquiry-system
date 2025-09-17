import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaHome, FaClipboardList, FaUsers } from "react-icons/fa";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const menuItems = [
    { label: "Overview", path: "/", roles: ["admin", "staff"], icon: <FaHome /> },
    { label: "Enquiries", path: "/enquiries", roles: ["admin", "staff"], icon: <FaClipboardList /> },
    { label: "Users", path: "/users", roles: ["admin"], icon: <FaUsers /> },
  ];


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Dynamic title based on current route
  const getPageTitle = () => {
    if (location.pathname.startsWith("/enquiries")) return "Enquiries";
    if (location.pathname.startsWith("/users")) return "Users";
    return "Dashboard Overview"; // default for "/"
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-3.5  border-b">
          <h2 className="text-xl font-bold text-blue-600">CRM Dashboard</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems
            .filter((item) => item.roles.includes(user?.role || "staff"))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-5 py-2.5">
          {/* Dynamic Page Title */}
          <h1 className="text-lg font-bold text-gray-800">{getPageTitle()}</h1>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="text-gray-700 font-medium capitalize">
                Hello, {user?.name}{" "}
                <span
                  className={`px-2 py-1 text-xs rounded capitalize ${user?.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  {user?.role}
                </span>
              </span>
            )}
            <FaUserCircle className="text-4xl text-gray-500" />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-5">
          <Outlet />
          {/* 👆 Nested routes render here (Dashboard, Enquiries, Users) */}
        </div>
      </main>
    </div>
  );
}
