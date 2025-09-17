// import { useEffect, useState } from "react";
// import API from "../../api/client";
// import toast from "react-hot-toast";

// interface Stats {
//     total: number;
//     new: number;
//     inProgress: number;
//     closed: number;
// }

// export default function Dashboard() {
//     const [stats, setStats] = useState<Stats | null>(null);

//     useEffect(() => {
//         fetchStats();
//     }, []);

//     const fetchStats = async () => {
//         try {
//             const res = await API.get("/enquiries/stats");
//             setStats(res.data.data);
//         } catch (err) {
//             toast.error("Failed to load stats");
//         }
//     };

//     if (!stats) return <p className="text-center mt-10">Loading stats...</p>;

//     return (
//         <div>
//             <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

//             {/* Stat Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-white p-6 rounded-lg shadow">
//                     <h3 className="text-gray-500">Total Enquiries</h3>
//                     <p className="text-3xl font-bold">{stats.total}</p>
//                 </div>
//                 <div className="bg-white p-6 rounded-lg shadow">
//                     <h3 className="text-gray-500">New</h3>
//                     <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
//                 </div>
//                 <div className="bg-white p-6 rounded-lg shadow">
//                     <h3 className="text-gray-500">In Progress</h3>
//                     <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
//                 </div>
//                 <div className="bg-white p-6 rounded-lg shadow">
//                     <h3 className="text-gray-500">Closed</h3>
//                     <p className="text-3xl font-bold text-green-600">{stats.closed}</p>
//                 </div>
//             </div>
//         </div>
//     );
// }


import { useEffect, useState } from "react";
import API from "../../api/client";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Stats {
    total: number;
    new: number;
    inProgress: number;
    closed: number;
}

interface Enquiry {
    _id: string;
    customerName: string;
    email: string;
    status: string;
    createdAt: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recent, setRecent] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/enquiries/stats")
            .then((res) => {
                setStats(res.data.data);
                setRecent(res.data.data.recent);
            })
            .catch(() => toast.error("Failed to load dashboard data"))
            .finally(() => setLoading(false));
    }, []);


    if (loading) return <p className="mt-10 text-center">Loading dashboard...</p>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500">Total Enquiries</h3>
                    <p className="text-3xl font-bold">{stats?.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500">New</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats?.new}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500">In Progress</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats?.inProgress}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500">Closed</h3>
                    <p className="text-3xl font-bold text-green-600">{stats?.closed}</p>
                </div>
            </div>

            {/* Recent Enquiries */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recent Enquiries</h2>
                {recent.length === 0 ? (
                    <p>No enquiries found.</p>
                ) : (
                    <table className="w-full border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left p-3">Customer</th>
                                <th className="text-left p-3">Email</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((e) => (
                                <tr key={e._id} className="border-t">
                                    <td className="p-3">{e.customerName}</td>
                                    <td className="p-3">{e.email}</td>
                                    <td className="p-3 capitalize">{e.status}</td>
                                    <td className="p-3">
                                        {new Date(e.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="mt-4 text-right">
                    <Link
                        to="/enquiries"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        View all enquiries →
                    </Link>
                </div>
            </div>
        </div>
    );
}
