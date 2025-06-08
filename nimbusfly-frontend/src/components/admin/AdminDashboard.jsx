import { NavLink, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("admin_name") || "Admin";
  const airlineName = localStorage.getItem("airline_name") || "Your Airline";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div
    //   className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
    //   style={{ backgroundImage: "url('/images/admindash.jpg')" }}
    >
      {/* Overlay for dark tint */}
      <div className="bg-black bg-opacity-60 min-h-screen w-full flex flex-col">

        {/* Navbar */}
        <nav className="bg-blue-700 bg-opacity-80 text-white px-6 py-4 flex justify-between items-center shadow">
          <div className="text-xl font-bold">NimbusFly Admin Panel</div>
          <div className="space-x-4">
            <NavLink to="/admin/flights" className="hover:underline">Flights</NavLink>
            <NavLink to="/admin/bookings" className="hover:underline">Bookings</NavLink>
            <NavLink to="/admin/revenue" className="hover:underline">Revenue</NavLink>
            <NavLink to="/admin/logs" className="hover:underline">Logs</NavLink>
            <NavLink to="/admin/profile" className="hover:underline">Profile</NavLink>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow px-6 py-8 text-white">
          <h1 className="text-3xl font-semibold mb-2">
            Welcome, {adminName} 👋
          </h1>
          <p className="text-lg mb-6">
            You are managing: <span className="font-semibold">{airlineName}</span>
          </p>

          <div className="italic text-gray-200 text-sm">
            “Every great journey begins with a single flight.” ✈️
          </div>
        </main>

      </div>
    </div>
  );
}

export default AdminDashboard;