import { useState } from "react";
import {
  CheckIcon,
  XIcon,
  Search,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Genre } from "@/types";

interface FilterPanelProps {
  contentRating: string[];
  origin: string[];
  status: number[];
  includedGenres: number[];
  excludedGenres: number[];
  onContentRatingChange: (ratings: string[]) => void;
  onOriginChange: (origins: string[]) => void;
  onStatusChange: (status: number[]) => void;
  onIncludeGenre: (genreId: number) => void;
  onExcludeGenre: (genreId: number) => void;
  onRemoveGenre: (genreId: number) => void;
  onClearGenreFilters: () => void;
  genres: Genre[];
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  contentRating,
  origin,
  status,
  includedGenres,
  excludedGenres,
  onContentRatingChange,
  onOriginChange,
  onStatusChange,
  onIncludeGenre,
  onExcludeGenre,
  onRemoveGenre,
  onClearGenreFilters,
  genres,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  const [activeSection, setActiveSection] = useState<"basic" | "genres">(
    "basic"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"genre" | "format" | "theme">(
    "genre"
  );

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

  const filteredGenres = genres
    .filter((genre) => {
      if (searchQuery) {
        return genre.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return genre.group.toLowerCase() === activeTab.toLowerCase();
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const getGenreById = (id: number) => {
    return genres.find((genre) => genre.id === id);
  };

  const displayActiveGenres =
    includedGenres.length > 0 || excludedGenres.length > 0;

  return (
    <div className="w-full mb-6 rounded-md overflow-hidden">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Search Filters</h2>
          <div className="flex space-x-2">
            {displayActiveGenres && (
              <button
                onClick={onClearGenreFilters}
                className="text-sm px-2 py-1 text-red-400 hover:text-red-300 border border-red-900 rounded hover:bg-red-900/30 transition-colors"
              >
                Clear genre filters
              </button>
            )}
            {isExpanded && (
              <button
                onClick={() =>
                  setActiveSection(
                    activeSection === "basic" ? "genres" : "basic"
                  )
                }
                className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-1"
              >
                {activeSection === "basic" ? "Genre Filters" : "Basic Filters"}
                {activeSection === "basic" ? (
                  <ArrowDown size={14} />
                ) : (
                  <ArrowUp size={14} />
                )}
              </button>
            )}
            <button
              onClick={onToggleExpand}
              className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Show Filters
                </>
              )}
            </button>
          </div>
        </div>

        {!isExpanded && (
          <div className="mt-2 text-sm text-gray-400">
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
              {displayActiveGenres && (
                <div>
                  <span className="text-gray-500 mr-2">Genres:</span>
                  <span>
                    {includedGenres.length + excludedGenres.length} filters
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div
            className={`p-4 space-y-6 ${
              activeSection === "basic" ? "block" : "hidden"
            }`}
          >
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

          <div
            className={`p-4 ${activeSection === "genres" ? "block" : "hidden"}`}
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full mb-2"></div>
                <p>Loading genres...</p>
              </div>
            ) : (
              <>
                {displayActiveGenres && (
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-2">
                      Active genre filters:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {includedGenres.map((genreId) => {
                        const genre = getGenreById(genreId);
                        if (!genre) return null;

                        return (
                          <span
                            key={`include-${genreId}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900 text-blue-100 rounded-md text-xs"
                          >
                            <CheckIcon size={12} />
                            {genre.name}
                            <button
                              onClick={() => onRemoveGenre(genreId)}
                              className="ml-1 text-blue-300 hover:text-blue-100"
                            >
                              <XIcon size={12} />
                            </button>
                          </span>
                        );
                      })}

                      {excludedGenres.map((genreId) => {
                        const genre = getGenreById(genreId);
                        if (!genre) return null;

                        return (
                          <span
                            key={`exclude-${genreId}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-900 text-red-100 rounded-md text-xs"
                          >
                            <XIcon size={12} />
                            {genre.name}
                            <button
                              onClick={() => onRemoveGenre(genreId)}
                              className="ml-1 text-red-300 hover:text-red-100"
                            >
                              <XIcon size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {!searchQuery && (
                    <div className="flex mb-4 border-b border-gray-800">
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === "genre"
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("genre")}
                      >
                        Genres
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === "format"
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("format")}
                      >
                        Formats
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === "theme"
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("theme")}
                      >
                        Themes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {filteredGenres.map((genre) => {
                    const isIncluded = includedGenres.includes(genre.id);
                    const isExcluded = excludedGenres.includes(genre.id);

                    return (
                      <div
                        key={genre.id}
                        className={`p-2 border rounded-md text-sm cursor-pointer transition-colors ${
                          isIncluded
                            ? "bg-blue-900 border-blue-700 text-blue-100"
                            : isExcluded
                            ? "bg-red-900 border-red-700 text-red-100"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{genre.name}</span>
                          <div className="flex space-x-1 ml-2">
                            {!isIncluded && (
                              <button
                                onClick={() => onIncludeGenre(genre.id)}
                                className={`p-0.5 rounded-full ${
                                  isExcluded
                                    ? "text-red-200 hover:text-white"
                                    : "text-gray-400 hover:text-blue-400"
                                }`}
                                title="Include this genre"
                              >
                                <CheckIcon size={14} />
                              </button>
                            )}

                            {!isExcluded && (
                              <button
                                onClick={() => onExcludeGenre(genre.id)}
                                className={`p-0.5 rounded-full ${
                                  isIncluded
                                    ? "text-blue-200 hover:text-white"
                                    : "text-gray-400 hover:text-red-400"
                                }`}
                                title="Exclude this genre"
                              >
                                <XIcon size={14} />
                              </button>
                            )}

                            {(isIncluded || isExcluded) && (
                              <button
                                onClick={() => onRemoveGenre(genre.id)}
                                className="p-0.5 rounded-full text-gray-400 hover:text-gray-200"
                                title="Remove filter"
                              >
                                <XIcon size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredGenres.length === 0 && (
                  <div className="p-4 text-center text-gray-400">
                    <p>No genres found matching your criteria.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;
