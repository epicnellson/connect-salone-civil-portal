import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function RepresentativeFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("");
  
  const representatives = useQuery(api.representatives.searchRepresentatives, {
    searchTerm: searchTerm || undefined,
    district: selectedDistrict || undefined,
    ministry: selectedMinistry || undefined,
  });
  
  const districts = useQuery(api.representatives.getDistricts);
  const ministries = useQuery(api.services.getMinistries);
  const seedRepresentatives = useMutation(api.representatives.seedRepresentatives);

  const handleSeedData = async () => {
    try {
      await seedRepresentatives({});
    } catch (error) {
      console.error("Error seeding representatives:", error);
    }
  };

  if (!representatives?.length && !searchTerm && !selectedDistrict && !selectedMinistry) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-xl font-semibold mb-2">Representative Finder</h3>
        <p className="text-gray-600 mb-4">
          Find government officials and representatives across Sierra Leone
        </p>
        <button
          onClick={handleSeedData}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Load Representatives
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
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">All Districts</option>
              {districts?.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            
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
          </div>
        </div>
      </div>

      {/* Representatives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {representatives?.map((rep) => (
          <div key={rep._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {rep.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {rep.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{rep.title}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-20 font-medium">Ministry:</span>
                    <span>{rep.ministry}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-20 font-medium">District:</span>
                    <span>{rep.district}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-20 font-medium">Office:</span>
                    <span>{rep.office}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span>
                    <p className="mt-1">{rep.officeAddress}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  {rep.phone && (
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">📞</span>
                      <a href={`tel:${rep.phone}`} className="text-green-600 hover:underline">
                        {rep.phone}
                      </a>
                    </div>
                  )}
                  
                  {rep.email && (
                    <div className="flex items-center text-sm">
                      <span className="text-blue-600 mr-2">✉️</span>
                      <a href={`mailto:${rep.email}`} className="text-blue-600 hover:underline">
                        {rep.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {representatives?.length === 0 && (searchTerm || selectedDistrict || selectedMinistry) && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No Representatives Found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
}
