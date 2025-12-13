import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ServiceDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const services = useQuery(api.services.searchServices, {
    searchTerm: searchTerm || undefined,
    ministry: selectedMinistry || undefined,
    category: selectedCategory || undefined,
  });
  
  const ministries = useQuery(api.services.getMinistries);
  const categories = useQuery(api.services.getCategories);
  const seedServices = useMutation(api.services.seedServices);

  const handleSeedData = async () => {
    try {
      await seedServices({});
    } catch (error) {
      console.error("Error seeding services:", error);
    }
  };

  if (!services?.length && !searchTerm && !selectedMinistry && !selectedCategory) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-xl font-semibold mb-2">Service Directory</h3>
        <p className="text-gray-600 mb-4">
          Browse all available government services in Sierra Leone
        </p>
        <button
          onClick={handleSeedData}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Load Services
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">All Ministries</option>
              {ministries?.map((ministry) => (
                <option key={ministry} value={ministry}>
                  {ministry}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services?.map((service) => (
          <div key={service._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {service.ministry}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {service.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{service.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {service.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Official Fees</h4>
                  <p className="text-sm text-gray-600">{service.officialFees}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Processing Time</h4>
                  <p className="text-sm text-gray-600">{service.processingTime}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Locations</h4>
                  <ul className="space-y-1">
                    {service.locations.map((location, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        📍 {location}
                      </li>
                    ))}
                  </ul>
                </div>

                {service.contactInfo && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Contact</h4>
                    <p className="text-sm text-gray-600">📞 {service.contactInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {services?.length === 0 && (searchTerm || selectedMinistry || selectedCategory) && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
}
