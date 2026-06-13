import { useState } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  LogOut,
  Edit,
  Trash2,
  Save,
  Settings,
  Users,
  FileText,
  UserCheck,
} from "lucide-react";

export function AdminDashboard() {
  const { signOut } = useAuthActions();
  const [editingService, setEditingService] = useState<Doc<"services"> | null>(
    null,
  );
  const [editingRepresentative, setEditingRepresentative] =
    useState<Doc<"representatives"> | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "representatives">(
    "services",
  );
  const [formData, setFormData] = useState({
    name: "",
    agency: "",
    fee: "",
    processingTime: "",
    documents: "",
    eligibility: "",
    processSteps: "",
    locations: "",
    contacts: "",
    notes: "",
    lastVerified: "",
    region: "",
  });
  const [repFormData, setRepFormData] = useState({
    name: "",
    role: "",
    district: "",
    constituency: "",
    phone: "",
    email: "",
    title: "",
    ministry: "",
    office: "",
    officeAddress: "",
  });

  const isAdmin = useQuery(api.admin.isAdmin);
  const {
    results: services,
    status: servicesStatus,
    loadMore: loadMoreServices,
  } = usePaginatedQuery(
    api.services.getServicesPaginated,
    {},
    { initialNumItems: 20 },
  );
  const {
    results: representatives,
    status: repsStatus,
    loadMore: loadMoreReps,
  } = usePaginatedQuery(
    api.representatives.getRepresentativesPaginated,
    {},
    { initialNumItems: 20 },
  );
  const saveServiceMutation = useMutation(api.services.createService);
  const updateServiceMutation = useMutation(api.services.updateService);
  const deleteServiceMutation = useMutation(api.services.deleteService);
  const saveRepresentativeMutation = useMutation(
    api.representatives.createRepresentative,
  );
  const updateRepresentativeMutation = useMutation(
    api.representatives.updateRepresentative,
  );
  const deleteRepresentativeMutation = useMutation(
    api.representatives.deleteRepresentative,
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      void signOut().then(() => window.location.reload());
    }
  };

  if (isAdmin === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card card-hover p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You must be signed in with an admin account to access this panel.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      agency: service.agency || "",
      fee: service.fee || "",
      processingTime: service.processingTime || "",
      documents: service.documents?.join(", ") || "",
      eligibility: service.eligibility || "",
      processSteps: service.processSteps?.join(", ") || "",
      locations: service.locations?.join(", ") || "",
      contacts: service.contacts || "",
      notes: service.notes || "",
      lastVerified: service.lastVerified || "",
      region: service.region || "",
    });
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: "",
      agency: "",
      fee: "",
      processingTime: "",
      documents: "",
      eligibility: "",
      processSteps: "",
      locations: "",
      contacts: "",
      notes: "",
      lastVerified: "",
      region: "",
    });
  };

  const handleEditRepresentative = (representative: any) => {
    setEditingRepresentative(representative);
    setRepFormData({
      name: representative.name || "",
      role: representative.role || "",
      district: representative.district || "",
      constituency: representative.constituency || "",
      phone: representative.phone || "",
      email: representative.email || "",
      title: representative.title || "",
      ministry: representative.ministry || "",
      office: representative.office || "",
      officeAddress: representative.officeAddress || "",
    });
  };

  const resetRepForm = () => {
    setEditingRepresentative(null);
    setRepFormData({
      name: "",
      role: "",
      district: "",
      constituency: "",
      phone: "",
      email: "",
      title: "",
      ministry: "",
      office: "",
      officeAddress: "",
    });
  };

  const handleRepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRepresentative) {
      updateRepresentativeMutation({
        id: editingRepresentative._id,
        ...repFormData,
      });
    } else {
      saveRepresentativeMutation(repFormData);
    }
    resetRepForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      ...formData,
      documents: formData.documents
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d),
      processSteps: formData.processSteps
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      locations: formData.locations
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l),
    };
    if (editingService) {
      updateServiceMutation({ id: editingService._id, ...serviceData });
    } else {
      saveServiceMutation(serviceData);
    }
    resetForm();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
            Admin
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold">Control Center</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg glass-hover text-red-400 w-full sm:w-auto"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="flex gap-4 mb-6 sm:mb-8 border-b border-gray-700 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("services")}
          className={`pb-3 px-1 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "services"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <FileText size={16} className="inline mr-1.5" />
          Services
        </button>
        <button
          onClick={() => setActiveTab("representatives")}
          className={`pb-3 px-1 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "representatives"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <UserCheck size={16} className="inline mr-1.5" />
          Representatives
        </button>
      </div>

      {activeTab === "services" && (
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card card-hover p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-400" />
              {editingService ? "Edit Service" : "Create Service"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Service Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Agency"
                value={formData.agency}
                onChange={(e) =>
                  setFormData({ ...formData, agency: e.target.value })
                }
                className="input"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Fee (NLe)"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData({ ...formData, fee: e.target.value })
                  }
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="Processing Time"
                  value={formData.processingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, processingTime: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <textarea
                placeholder="Eligibility"
                value={formData.eligibility}
                onChange={(e) =>
                  setFormData({ ...formData, eligibility: e.target.value })
                }
                className="input"
                rows={2}
              />
              <textarea
                placeholder="Documents (comma separated)"
                value={formData.documents}
                onChange={(e) =>
                  setFormData({ ...formData, documents: e.target.value })
                }
                className="input"
                rows={3}
              />
              <textarea
                placeholder="Process Steps (comma separated)"
                value={formData.processSteps}
                onChange={(e) =>
                  setFormData({ ...formData, processSteps: e.target.value })
                }
                className="input"
                rows={3}
              />
              <textarea
                placeholder="Locations (comma separated)"
                value={formData.locations}
                onChange={(e) =>
                  setFormData({ ...formData, locations: e.target.value })
                }
                className="input"
                rows={2}
              />
              <input
                type="text"
                placeholder="Contacts"
                value={formData.contacts}
                onChange={(e) =>
                  setFormData({ ...formData, contacts: e.target.value })
                }
                className="input"
              />
              <textarea
                placeholder="Notes / corruption warnings"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="input"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Last Verified"
                  value={formData.lastVerified}
                  onChange={(e) =>
                    setFormData({ ...formData, lastVerified: e.target.value })
                  }
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Region"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingService ? "Update" : "Create"} Service
                </button>
                {editingService && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card card-hover p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-400" />
              Services ({services?.length || 0})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {services?.map((service) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-surface rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.agency} · {service.region}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 rounded-lg glass-hover text-emerald-400"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this service?")) {
                          deleteServiceMutation({ id: service._id });
                        }
                      }}
                      className="p-2 rounded-lg glass-hover text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === "representatives" && (
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card card-hover p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-purple-400" />
              {editingRepresentative
                ? "Edit Representative"
                : "Create Representative"}
            </h2>
            <form onSubmit={handleRepSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={repFormData.name}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, name: e.target.value })
                }
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Title/Position"
                value={repFormData.title}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, title: e.target.value })
                }
                className="input"
              />
              <input
                type="text"
                placeholder="Role"
                value={repFormData.role}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, role: e.target.value })
                }
                className="input"
              />
              <input
                type="text"
                placeholder="Ministry"
                value={repFormData.ministry}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, ministry: e.target.value })
                }
                className="input"
              />
              <input
                type="text"
                placeholder="District"
                value={repFormData.district}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, district: e.target.value })
                }
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Constituency"
                value={repFormData.constituency}
                onChange={(e) =>
                  setRepFormData({
                    ...repFormData,
                    constituency: e.target.value,
                  })
                }
                className="input"
              />
              <input
                type="text"
                placeholder="Office"
                value={repFormData.office}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, office: e.target.value })
                }
                className="input"
              />
              <input
                type="text"
                placeholder="Office Address"
                value={repFormData.officeAddress}
                onChange={(e) =>
                  setRepFormData({
                    ...repFormData,
                    officeAddress: e.target.value,
                  })
                }
                className="input"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={repFormData.phone}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, phone: e.target.value })
                }
                className="input"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={repFormData.email}
                onChange={(e) =>
                  setRepFormData({ ...repFormData, email: e.target.value })
                }
                className="input"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingRepresentative ? "Update" : "Create"} Representative
                </button>
                {editingRepresentative && (
                  <button
                    type="button"
                    onClick={resetRepForm}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card card-hover p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-purple-400" />
              Representatives ({representatives?.length || 0})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {representatives?.map((representative) => (
                <motion.div
                  key={representative._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-surface rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-bold">{representative.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {representative.title || representative.role} ·{" "}
                      {representative.district}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {representative.phone} · {representative.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRepresentative(representative)}
                      className="p-2 rounded-lg glass-hover text-emerald-400"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this representative?")) {
                          deleteRepresentativeMutation({
                            id: representative._id,
                          });
                        }
                      }}
                      className="p-2 rounded-lg glass-hover text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
