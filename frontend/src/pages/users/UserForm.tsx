import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/client";
import toast from "react-hot-toast";

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Fetch user if in Edit mode
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      API.get(`/users/${id}`)
        .then((res) => {
          const { name, email, role } = res.data.data;
          setFormData({ name, email, role, password: "" }); // password left empty
        })
        .catch(() => toast.error("Failed to load user"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // 🔹 Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.put(`/users/${id}`, formData);
        toast.success("User updated successfully ✅");
      } else {
        await API.post("/users", formData);
        toast.success("User created successfully ✅");
      }
      navigate("/users");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong ❌");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading form...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit User" : "New User"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Password (only for create or if admin wants to reset) */}
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            placeholder={isEdit ? "Leave blank to keep existing password" : ""}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {isEdit ? "Update User" : "Create User"}
        </button>
      </form>
    </div>
  );
}
