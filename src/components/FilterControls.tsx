import { useState } from "react";
import { CheckIcon, FilterIcon, XIcon } from "lucide-react";

interface FilterControlsProps {
  contentRating: string[];
  origin: string[];
  status: number[];
  onContentRatingChange: (ratings: string[]) => void;
  onOriginChange: (origins: string[]) => void;
  onStatusChange: (status: number[]) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  contentRating,
  origin,
  status,
  onContentRatingChange,
  onOriginChange,
  onStatusChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleContentRatingToggle = (rating: string) => {
    const updatedRatings = contentRating.includes(rating)
      ? contentRating.filter((r) => r !== rating)
      : [...contentRating, rating];

    if (updatedRatings.length > 0) {
      onContentRatingChange(updatedRatings);
    }
  };

  const handleOriginToggle = (country: string) => {
    const updatedOrigins = origin.includes(country)
      ? origin.filter((o) => o !== country)
      : [...origin, country];

    if (updatedOrigins.length > 0) {
      onOriginChange(updatedOrigins);
    }
  };

  const handleStatusToggle = (statusCode: number) => {
    const updatedStatus = status.includes(statusCode)
      ? status.filter((s) => s !== statusCode)
      : [...status, statusCode];

    if (updatedStatus.length > 0) {
      onStatusChange(updatedStatus);
    }
  };

  const getStatusLabel = (statusCode: number) => {
    const statusMap: Record<number, string> = {
      1: "Ongoing",
      2: "Completed",
      3: "Cancelled",
      4: "Hiatus",
    };

    return statusMap[statusCode] || "Unknown";
  };

  const activeFiltersCount =
    (contentRating.length < 3 ? contentRating.length : 0) +
    (origin.length < 5 ? origin.length : 0) +
    (status.length < 4 ? status.length : 0);

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <h2 className="text-lg font-medium">Search Filters</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <FilterIcon size={16} />
          {showFilters ? "Hide Filters" : "Edit Filters"}
          {activeFiltersCount > 0 && !showFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-600 rounded-full text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {!showFilters && (
        <div className="mb-4 text-sm text-gray-400">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-gray-500 mr-2">Content:</span>
              {contentRating.length === 3 ? (
                <span>All ratings</span>
              ) : (
                contentRating.map((r) => (
                  <span key={r} className="capitalize mr-1">
                    {r}
                  </span>
                ))
              )}
            </div>
            <div>
              <span className="text-gray-500 mr-2">Origin:</span>
              {origin.length === 5 ? (
                <span>All origins</span>
              ) : (
                origin.map((o) => (
                  <span key={o} className="uppercase mr-1">
                    {o}
                  </span>
                ))
              )}
            </div>
            <div>
              <span className="text-gray-500 mr-2">Status:</span>
              {status.length === 4 ? (
                <span>All statuses</span>
              ) : (
                status.map((s) => (
                  <span key={s} className="mr-1">
                    {getStatusLabel(s)}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-md mb-6 animate-fadeIn space-y-6">
          <div>
            <h3 className="font-medium mb-3 text-sm text-gray-300 uppercase tracking-wider">
              Content Rating
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "safe", label: "Safe" },
                { id: "suggestive", label: "Suggestive" },
                { id: "erotica", label: "Erotica" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleContentRatingToggle(option.id)}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all ${
                    contentRating.includes(option.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                  {contentRating.includes(option.id) ? (
                    <CheckIcon size={14} />
                  ) : (
                    <XIcon size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm text-gray-300 uppercase tracking-wider">
              Origin
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "jp", label: "Manga (JP)" },
                { id: "kr", label: "Manhwa (KR)" },
                { id: "cn", label: "Manhua (CN)" },
                { id: "hk", label: "Manhua (HK)" },
                { id: "gb", label: "English" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOriginToggle(option.id)}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all ${
                    origin.includes(option.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                  {origin.includes(option.id) ? (
                    <CheckIcon size={14} />
                  ) : (
                    <XIcon size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm text-gray-300 uppercase tracking-wider">
              Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 1, label: "Ongoing" },
                { id: 2, label: "Completed" },
                { id: 3, label: "Cancelled" },
                { id: 4, label: "Hiatus" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleStatusToggle(option.id)}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all ${
                    status.includes(option.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                  {status.includes(option.id) ? (
                    <CheckIcon size={14} />
                  ) : (
                    <XIcon size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
