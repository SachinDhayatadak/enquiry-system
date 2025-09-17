import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/client";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  createdAt: string;
  updatedAt: string;
}

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setUser(res.data.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading user...</p>;
  if (!user) return <p className="text-center mt-10">User not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>

      <div className="space-y-3">
        <p>
          <span className="font-semibold">Name:</span> {user.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">Role:</span>{" "}
          <span
            className={`px-2 py-1 rounded text-sm ${
              user.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {user.role}
          </span>
        </p>
        <p>
          <span className="font-semibold">Created At:</span>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Last Updated:</span>{" "}
          {new Date(user.updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-4 mt-6">
        <Link
          to={`/users/${user._id}/edit`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Edit
        </Link>
        <Link
          to="/users"
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Back to List
        </Link>
      </div>
    </div>
  );
}
