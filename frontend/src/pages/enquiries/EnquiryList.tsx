import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/client";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DeleteModal from "../../components/DeleteModal";
import toast from "react-hot-toast";

interface Enquiry {
  _id: string;
  customerName: string;
  email: string;
  status: string;
  createdAt: string;
  assignedTo?: { _id: string; name: string; email: string } | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export default function EnquiryList() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [staffList, setStaffList] = useState<User[]>([]);

  useEffect(() => {
    fetchEnquiries();
    fetchStaff();
  }, [page, statusFilter, search, sort, assignedTo]);

  const fetchStaff = async () => {
    try {
      const res = await API.get("/users", { params: { role: "staff" } });
      setStaffList(res.data.data.users ?? res.data.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await API.get("/enquiries", {
        params: { page, limit: 10, status: statusFilter || undefined, search, sort, assignedTo },
      });
      setEnquiries(res.data.data.enquiries);
      setPages(res.data.data.pages);
      setTotal(res.data.data.total);
    } catch (err) {
      toast.error("Failed to load enquiries");
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
      await API.delete(`/enquiries/${selectedId}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== selectedId));
      toast.success("Enquiry deleted successfully ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete enquiry ❌");
    } finally {
      setIsModalOpen(false);
      setSelectedId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
  try {
    await API.put(`/enquiries/${id}`, { status: newStatus });
    setEnquiries((prev) =>
      prev.map((e) =>
        e._id === id ? { ...e, status: newStatus } : e
      )
    );
    toast.success("Status updated ✅");
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to update status ❌");
  }
};

  if (loading) return <p className="text-center mt-10">Loading enquiries...</p>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Filters */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Enquiries {total > 0 && <span>({total})</span>}</h1>

        <div className="flex gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by customer/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-52"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // reset page when filter changes
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          {/* Assigned To filter */}
          <select
            value={assignedTo}
            onChange={(e) => {
              setPage(1);
              setAssignedTo(e.target.value);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">All Staff</option>
            {staffList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>


          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <Link
            to="/enquiries/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Enquiry
          </Link>
        </div>
      </div>

      {/* Table */}
      {enquiries.length === 0 ? (
        <p>No enquiries found.</p>
      ) : (
        <>
          <table className="w-full border border-gray-200 rounded-lg shadow bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Assigned To</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry._id} className="border-t">
                  <td className="p-3">{enquiry.customerName}</td>
                  <td className="p-3">{enquiry.email}</td>
                  <td className="p-2">
                    <select
                      value={enquiry.status}
                      onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {enquiry.assignedTo ? enquiry.assignedTo.name : "—"}
                  </td>
                  <td className="p-3">
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="flex gap-4 p-3">
                    <Link to={`/enquiries/${enquiry._id}`} className="text-blue-600">
                      <FaEye />
                    </Link>
                    <Link to={`/enquiries/${enquiry._id}/edit`} className="text-green-600">
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(enquiry._id)}
                      className="text-red-600"
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-2">
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
        </>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
