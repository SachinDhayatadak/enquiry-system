import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple validation
  const validateForm = () => {
    if (!form.name) return "Name is required";
    if (!form.email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Enter a valid email";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
      toast.success("Registration successful!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
      toast.error("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md px-8 py-10 shadow-lg rounded-2xl border border-gray-100"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h1>
        <p className="text-gray-500 text-sm mb-6">
          Create an account to start managing your enquiries.
        </p>

        {error && (
          <p className="text-red-500 bg-red-100 p-2 rounded text-sm mb-4">{error}</p>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full px-3 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-3 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-sky-700 transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <div className="flex justify-between items-center mt-6 text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-sky-600 font-medium hover:underline">
              Log In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
