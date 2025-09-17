import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/client";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DeleteModal from "../../components/DeleteModal";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Query states
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("createdAt"); // field
  const [order, setOrder] = useState<"asc" | "desc">("desc"); // direction
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [search, role, sort, order, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users", {
        params: { search, role, sort, order, page, limit: 10 },
      });
      setUsers(res.data.data.users);
      setPages(res.data.data.pagination.pages);
      setTotal(res.data.data.pagination.total);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await API.delete(`/users/${selectedId}`);
      toast.success("User deleted successfully ✅");
      fetchUsers(); // refresh list
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user ❌");
    } finally {
      setIsModalOpen(false);
      setSelectedId(null);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
        <h1 className="text-2xl font-bold">Users  {total > 0 && <span>({total})</span>}</h1>
        <div className="flex gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name/email"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="border rounded px-3 py-2"
          />

          {/* Role Filter */}
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={`${sort}:${order}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(":");
              setSort(field);
              setOrder(dir as "asc" | "desc");
              setPage(1);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="name:asc">Name A → Z</option>
            <option value="name:desc">Name Z → A</option>
            <option value="email:asc">Email A → Z</option>
            <option value="email:desc">Email Z → A</option>
          </select>

          {/* Add New User */}
          <Link
            to="/users/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New User
          </Link>
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg shadow bg-white">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="flex gap-4 p-3">
                  <Link
                    to={`/users/${user._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    <FaEye />
                  </Link>
                  <Link
                    to={`/users/${user._id}/edit`}
                    className="text-green-600 hover:underline"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(user._id)}
                    className="text-red-600 hover:underline"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          disabled={page === pages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
