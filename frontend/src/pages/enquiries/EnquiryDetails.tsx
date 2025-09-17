import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/client";
import toast from "react-hot-toast";

interface Enquiry {
  _id: string;
  customerName: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  assignedTo?: { _id: string; name: string; email: string } | null;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export default function EnquiryDetails() {
  const { id } = useParams<{ id: string }>();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);

  // staff list & assign state
  const [staffList, setStaffList] = useState<User[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [activity, setActivity] = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [status, setStatus] = useState(enquiry?.status || "new");

  useEffect(() => {
    fetchData();
    fetchStaff();
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (enquiry) {
      setStatus(enquiry.status);
    }
  }, [enquiry]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const res = await API.put(`/enquiries/${id}`, { status });
      setEnquiry(res.data.data);
      toast.success("Status updated");
      fetchActivity();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await API.get(`/enquiries/${id}/activity`);
      setActivity(res.data.data);
    } catch (err) {
      console.error("Error fetching activity log:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/enquiries/${id}`);
      setEnquiry(res.data.data);
      setSelectedStaff(res.data.data.assignedTo?._id ?? "");
    } catch (err) {
      console.error("Error fetching enquiry:", err);
      toast.error("Failed to load enquiry");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await API.get("/users", {
        params: { role: "staff", limit: 100 }, // server supports role filter
      });
      // if API returns wrapped object (pagination) handle both shapes:
      const users = res.data.data.users ?? res.data.data;
      setStaffList(users);
    } catch (err) {
      console.error("Error fetching staff:", err);
      // non-fatal
    }
  };

  const handleAssign = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setAssigning(true);
    try {
      const payload = selectedStaff ? { assignedTo: selectedStaff } : { assignedTo: null };
      const res = await API.put(`/enquiries/${id}/assign`, payload);
      setEnquiry(res.data.data);
      toast.success("Assignment updated");
      fetchActivity();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update assignment");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading enquiry...</p>;
  if (!enquiry) return <p className="text-center mt-10">Enquiry not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-2 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Enquiry Details</h1>

      <div className="space-y-3">
        <p><span className="font-semibold">Customer:</span> {enquiry.customerName}</p>
        <p><span className="font-semibold">Email:</span> {enquiry.email}</p>
        {enquiry.phone && <p><span className="font-semibold">Phone:</span> {enquiry.phone}</p>}
        {enquiry.message && <p><span className="font-semibold">Message:</span> {enquiry.message}</p>}
        <p>
          <span className="font-semibold">Status:</span>{" "}
          {/* <span
            className={`px-2 py-1 rounded text-sm capitalize ${enquiry.status === "new"
              ? "bg-blue-100 text-blue-700"
              : enquiry.status === "in-progress"
                ? "bg-yellow-100 text-yellow-700"
                : enquiry.status === "closed"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-green-100 text-green-700"
              }`}
          >
            {enquiry.status}
          </span> */}

          <form onSubmit={handleStatusUpdate} className="flex items-center gap-3">
            <label className="font-semibold">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>

            <button
              type="submit"
              disabled={updatingStatus}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updatingStatus ? "Saving..." : "Save"}
            </button>
          </form>


        </p>
        <div className="flex gap-4">
          <form onSubmit={handleAssign} className="flex items-center gap-3">
            <label className="font-semibold">Assigned To:</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">-- Unassigned --</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>{s.name} - {s.email}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={assigning}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {assigning ? "Saving..." : "Save"}
            </button>
          </form>

          {/* quick unassign button */}
          {enquiry.assignedTo && (
            <button
              className="mt-2 text-sm text-red-600 hover:underline"
              onClick={async () => {
                setSelectedStaff("");
                await handleAssign();
              }}
            >
              Unassign
            </button>
          )}
        </div>

        {enquiry.assignedTo && (
          <p>
            <span className="font-semibold">Currently Assigned:</span>{" "}
            {enquiry.assignedTo.name} ({enquiry.assignedTo.email})
          </p>
        )}

        <p><span className="font-semibold">Created At:</span> {new Date(enquiry.createdAt).toLocaleString()}</p>
        <p><span className="font-semibold">Last Updated:</span> {new Date(enquiry.updatedAt).toLocaleString()}</p>
      </div>

      <div className="flex gap-4 mt-6">
        <Link to={`/enquiries/${enquiry._id}/edit`} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Edit</Link>
        <Link to="/enquiries" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Back to List</Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Activity Log</h2>
        {activity.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {activity.map((a) => (
              <li key={a._id} className="text-sm text-gray-700">
                <span className="font-semibold">{a.action}</span> – {a.details}
                <span className="ml-2 text-gray-500">
                  ({new Date(a.createdAt).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
