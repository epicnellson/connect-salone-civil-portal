import { useState } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Modal } from "@/components/Modal";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/Skeleton";
import { FeedbackForm } from "@/components/FeedbackForm";
import { JourneyMap } from "@/components/JourneyMap";
import { OfficeLocationMap } from "@/components/OfficeLocationMap";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  AlertTriangle,
  Check,
} from "lucide-react";

const REGIONS = [
  "Freetown",
  "Bo",
  "Kenema",
  "Makeni",
  "Port Loko",
  "Kono",
  "Bombali",
  "Tonkolili",
  "Kailahun",
  "Bonthe",
  "Pujehun",
  "Kambia",
  "Moyamba",
  "Karene",
] as const;

function matchesRegion(locations: string[] | undefined, region: string) {
  if (!locations || locations.length === 0) return false;
  const joined = locations.join(" ").toLowerCase();
  return joined.includes(region.toLowerCase());
}

interface ServiceDirectoryProps {
  isAuthenticated?: boolean;
  onLoginPrompt?: (feature: string) => void;
}

export function ServiceDirectory({ isAuthenticated = false, onLoginPrompt }: ServiceDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedAgency = useDebounce(selectedAgency, 300);
  const debouncedRegion = useDebounce(selectedRegion, 300);

  const {
    results: services,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.services.searchServicesPaginated,
    {
      searchTerm: debouncedSearch || undefined,
      agency: debouncedAgency || undefined,
      region: debouncedRegion || undefined,
    },
    { initialNumItems: 12 },
  );

  const agencies = useQuery(api.services.getAgencies);

  const selectedService =
    selectedServiceId && services
      ? (services.find((s) => s._id === selectedServiceId) ?? null)
      : null;

  const handlePrint = () => {
    window.print();
  };

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4 sm:p-6 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card card-hover p-6"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Search services (e.g., passport, driver's license)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="select"
            >
              <option value="">All Agencies</option>
              {agencies?.map((agency) => (
                <option key={agency} value={agency}>
                  {agency}
                </option>
              ))}
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="select"
            >
              <option value="">All Regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <FeedbackForm relatedEntityType="services" />

      {/* Services Grid */}
      {services.length === 0 && status !== "LoadingFirstPage" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card card-hover p-8 text-center"
        >
          <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <h3 className="text-xl font-bold tracking-tight mb-2">
            No Services Found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass-card card-hover p-4 sm:p-6 cursor-pointer relative"
                onClick={() => {
                  if (isAuthenticated) {
                    setSelectedServiceId(service._id);
                  } else {
                    onLoginPrompt?.("full service details");
                  }
                }}
              >
                {!isAuthenticated && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-emerald-500/30 z-10">
                    <span className="text-xs">🔒</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="pill bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
                    Fast Track
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin size={12} />
                    {service.locations
                      ? (REGIONS.find((r) =>
                          matchesRegion(service.locations, r),
                        ) ?? "Nationwide")
                      : "Nationwide"}
                  </span>
                </div>

                <h3 className="text-lg font-bold tracking-tight mb-2 line-clamp-2">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.agency}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Fee:</span>
                      <p className="font-semibold line-clamp-1">
                        {service.fee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <p className="font-semibold line-clamp-1">
                        {service.processingTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="btn-primary w-full justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAuthenticated) {
                      setSelectedServiceId(service._id);
                    } else {
                      onLoginPrompt?.("full service details");
                    }
                  }}
                >
                  View details →
                </div>
              </motion.div>
            ))}
          </div>

          {status === "CanLoadMore" && (
            <div className="flex justify-center mt-6">
              <button onClick={() => loadMore(12)} className="btn-primary px-8">
                Load More
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!selectedService}
        onOpenChange={(open) => {
          if (!open) setSelectedServiceId(null);
        }}
        title={selectedService?.name ?? "Service details"}
        description={
          selectedService
            ? `${selectedService.agency} • ${selectedService.region}`
            : undefined
        }
        className="max-w-4xl max-h-[85vh]"
      >
        {selectedService ? (
          <div className="space-y-5">
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={handlePrint}>
                Print checklist
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-surface rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <DollarSign size={16} />
                  <span>Official Fee</span>
                </div>
                <div className="mt-1 text-xl font-bold text-emerald-400">
                  {selectedService.fee}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-surface rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock size={16} />
                  <span>Processing Time</span>
                </div>
                <div className="mt-1 text-xl font-bold text-blue-400">
                  {selectedService.processingTime}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-surface rounded-2xl p-4"
            >
              <div className="font-semibold mb-3 flex items-center gap-2">
                <Check size={18} className="text-green-400" />
                Eligibility
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedService.eligibility}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-surface rounded-2xl p-4"
            >
              <div className="font-semibold mb-3 flex items-center gap-2">
                <Check size={18} className="text-blue-400" />
                Required Documents
              </div>
              <ul className="mt-2 space-y-2">
                {selectedService.documents?.map((doc, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start"
                  >
                    <span className="text-primary mr-2">•</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </motion.div>

            {selectedService.processSteps && selectedService.processSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <JourneyMap
                  title="Process Steps"
                  steps={selectedService.processSteps.map((step) => ({
                    label: step,
                  }))}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-surface rounded-2xl p-4"
            >
              <div className="font-semibold mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-orange-400" />
                Office Locations
              </div>
              <ul className="mt-2 space-y-1">
                {selectedService.locations?.map((loc, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    📍 {loc}
                  </li>
                ))}
              </ul>
              {selectedService.latitude && selectedService.longitude && (
                <div className="mt-3">
                  <OfficeLocationMap
                    locations={[{
                      label: selectedService.name,
                      latitude: selectedService.latitude,
                      longitude: selectedService.longitude,
                      description: selectedService.agency,
                    }]}
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-surface rounded-2xl p-4"
            >
              <div className="font-semibold mb-3 flex items-center gap-2">
                <Phone size={18} className="text-purple-400" />
                Contact Information
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <a
                  className="text-primary hover:underline flex items-center gap-2"
                  href={`tel:${selectedService.contacts}`}
                >
                  <Phone size={14} />
                  {selectedService.contacts}
                </a>
              </div>
            </motion.div>

            {selectedService.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4"
              >
                <div className="font-semibold text-yellow-200 mb-2 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Important Notice
                </div>
                <p className="mt-1 text-sm text-yellow-100/90">
                  {selectedService.notes}
                </p>
              </motion.div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
