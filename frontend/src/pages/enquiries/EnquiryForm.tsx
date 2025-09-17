import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/client";
import toast from "react-hot-toast";

interface EnquiryFormData {
  customerName: string;
  email: string;
  phone?: string;
  message?: string;
  status?: string;
}

export default function EnquiryForm() {
  const { id } = useParams(); // If present → Edit mode
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<EnquiryFormData>({
    customerName: "",
    email: "",
    phone: "",
    message: "",
    status: "new",
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Fetch enquiry if in Edit mode
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      API.get(`/enquiries/${id}`)
        .then((res) => {
          setFormData(res.data.data);
        })
        .catch((err) => {
          console.error("Error fetching enquiry:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // 🔹 Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.put(`/enquiries/${id}`, formData);
        toast.success("Enquiry updated successfully!");
      } else {
        await API.post("/enquiries", formData);
        toast.success("Enquiry created successfully!");
      }
      navigate("/enquiries");
    } catch (err) {
      console.error("Error saving enquiry:", err);
      toast.error("Something went wrong.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading form...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Enquiry" : "New Enquiry"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block text-gray-700">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
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

        {/* Phone */}
        <div>
          <label className="block text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-gray-700">Message</label>
          <textarea
            name="message"
            value={formData.message || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Status (only visible in Edit mode) */}
        {isEdit && (
          <div>
            <label className="block text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status || "new"}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {isEdit ? "Update Enquiry" : "Create Enquiry"}
        </button>
      </form>
    </div>
  );
}
