/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import type { Comic } from "@/types";
import FilterControls from "@/components/FilterControls";
import Description from "@/components/Description";
import { ExternalLink, History, Loader2, RefreshCcw } from "lucide-react";

const MAX_PAGES_TO_TRY = 30;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundComic, setFoundComic] = useState<Comic | null>(null);
  const [comicHistory, setComicHistory] = useState<Comic[]>([]);

  const [contentRating, setContentRating] = useState<string[]>([
    "safe",
    "suggestive",
    "erotica",
  ]);
  const [origin, setOrigin] = useState<string[]>([
    "jp",
    "kr",
    "cn",
    "hk",
    "gb",
  ]);
  const [status, setStatus] = useState<number[]>([1, 2, 3, 4]);

  useEffect(() => {
    const savedContentRating = localStorage.getItem("contentRating");
    const savedOrigin = localStorage.getItem("origin");
    const savedStatus = localStorage.getItem("status");
    const savedHistory = localStorage.getItem("comicHistory");

    if (savedContentRating) {
      try {
        const parsed = JSON.parse(savedContentRating);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContentRating(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved content rating");
      }
    }

    if (savedOrigin) {
      try {
        const parsed = JSON.parse(savedOrigin);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrigin(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved origin");
      }
    }

    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStatus(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved status");
      }
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setComicHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved comic history");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("contentRating", JSON.stringify(contentRating));
  }, [contentRating]);

  useEffect(() => {
    localStorage.setItem("origin", JSON.stringify(origin));
  }, [origin]);

  useEffect(() => {
    localStorage.setItem("status", JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem("comicHistory", JSON.stringify(comicHistory));
  }, [comicHistory]);

  const fetchComicsFromPage = async (page: number) => {
    const response = await fetch(`/api/comick?limit=50&page=${page}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  };

  const filterComics = (comics: Comic[]) => {
    return comics.filter((comic: Comic) => {
      const ratingMatch = comic.content_rating
        ? contentRating.includes(comic.content_rating)
        : true;

      const originMatch = comic.country ? origin.includes(comic.country) : true;

      const statusMatch = comic.status ? status.includes(comic.status) : true;

      const isInHistory = [...comicHistory, foundComic]
        .filter(Boolean)
        .some((historyComic) => historyComic && historyComic.id === comic.id);

      return ratingMatch && originMatch && statusMatch && !isInHistory;
    });
  };

  const findRandomComic = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const pagesToTry = Array.from(
        { length: MAX_PAGES_TO_TRY },
        (_, i) => i + 1
      );

      for (let i = pagesToTry.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pagesToTry[i], pagesToTry[j]] = [pagesToTry[j], pagesToTry[i]];
      }

      let filteredComics: Comic[] = [];
      let pagesTriedCount = 0;
      const maxAttempts = 3;
      let attempt = 0;

      while (attempt < maxAttempts && filteredComics.length === 0) {
        attempt++;
        pagesTriedCount = 0;

        for (const page of pagesToTry) {
          pagesTriedCount++;

          try {
            const comics = await fetchComicsFromPage(page);
            const filtered = filterComics(comics);

            if (filtered.length > 0) {
              filteredComics = filtered;
              break;
            }

            if (pagesTriedCount === Math.floor(MAX_PAGES_TO_TRY / 2)) {
              setError(
                "Still searching for comics that match your criteria..."
              );
            }
          } catch (err) {
            console.error(`Error fetching page ${page}:`, err);
            continue;
          }
        }

        if (filteredComics.length === 0 && attempt === maxAttempts - 1) {
          for (const page of pagesToTry.slice(0, 5)) {
            try {
              const comics = await fetchComicsFromPage(page);
              const filtered = comics.filter((comic: Comic) => {
                const ratingMatch = comic.content_rating
                  ? contentRating.includes(comic.content_rating)
                  : true;
                const originMatch = comic.country
                  ? origin.includes(comic.country)
                  : true;
                const statusMatch = comic.status
                  ? status.includes(comic.status)
                  : true;

                return ratingMatch && originMatch && statusMatch;
              });

              if (filtered.length > 0) {
                filteredComics = filtered;
                break;
              }
            } catch (err) {
              console.error(`Error fetching page ${page} (fallback):`, err);
              continue;
            }
          }
        }
      }

      if (filteredComics.length === 0) {
        throw new Error(
          "No comics found matching your criteria. Try adjusting your filters."
        );
      }

      const randomIndex = Math.floor(Math.random() * filteredComics.length);
      const selectedComic = filteredComics[randomIndex];

      if (foundComic) {
        setComicHistory((prev) => {
          const updated = [foundComic, ...prev].slice(0, 6);
          return updated;
        });
      }

      setFoundComic(selectedComic);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (comic: Comic) => {
    if (foundComic && foundComic.id !== comic.id) {
      setComicHistory((prev) => {
        const filtered = prev.filter((c) => c.id !== comic.id);
        const updated = [foundComic, ...filtered].slice(0, 6);
        return updated;
      });
    }

    setFoundComic(comic);

    setComicHistory((prev) => prev.filter((c) => c.id !== comic.id));
  };

  const handleContentRatingChange = (selectedRatings: string[]) => {
    setContentRating(selectedRatings);
  };

  const handleOriginChange = (selectedOrigins: string[]) => {
    setOrigin(selectedOrigins);
  };

  const handleStatusChange = (selectedStatus: number[]) => {
    setStatus(selectedStatus);
  };

  const getStatusLabel = (statusCode: number | undefined) => {
    if (!statusCode) return "Unknown";

    const statusMap: Record<number, string> = {
      1: "Ongoing",
      2: "Completed",
      3: "Cancelled",
      4: "Hiatus",
    };

    return statusMap[statusCode] || "Unknown";
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="max-w-4xl mx-auto">
          <FilterControls
            contentRating={contentRating}
            origin={origin}
            status={status}
            onContentRatingChange={handleContentRatingChange}
            onOriginChange={handleOriginChange}
            onStatusChange={handleStatusChange}
          />

          {!foundComic && (
            <div className="mt-6 mb-8 flex justify-center">
              <button
                onClick={findRandomComic}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Finding comic...
                  </>
                ) : (
                  <>
                    <RefreshCcw size={20} />
                    Find Random Comic
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-md text-center animate-fadeIn">
              {error}
            </div>
          )}

          {foundComic && (
            <div className="animate-fadeIn mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Found Comic</h2>
                <button
                  onClick={findRandomComic}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Finding...
                    </>
                  ) : (
                    <>
                      <RefreshCcw size={14} />
                      Find New Comic
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-md overflow-hidden">
                <div className="p-5 flex flex-col md:flex-row gap-6">
                  {foundComic.md_covers && foundComic.md_covers.length > 0 ? (
                    <div className="flex-shrink-0">
                      <img
                        src={`https://meo.comick.pictures/${foundComic.md_covers[0].b2key}`}
                        alt={foundComic.title}
                        className="w-40 md:w-48 h-auto object-cover rounded-md border border-gray-700"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-40 md:w-48 h-64 bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center text-gray-600">
                      No Cover
                    </div>
                  )}

                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-2">
                      {foundComic.title}
                    </h3>
                    {foundComic.md_titles &&
                      foundComic.md_titles.length > 0 &&
                      foundComic.md_titles[0]?.title !== foundComic.title && (
                        <p className="text-gray-400 text-sm mb-3">
                          {foundComic.md_titles[0].title}
                        </p>
                      )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {foundComic.content_rating && (
                        <span className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                          {foundComic.content_rating.charAt(0).toUpperCase() +
                            foundComic.content_rating.slice(1)}
                        </span>
                      )}
                      {foundComic.country && (
                        <span className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                          {foundComic.country.toUpperCase()}
                        </span>
                      )}
                      {foundComic.status !== undefined && (
                        <span className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                          {getStatusLabel(foundComic.status)}
                        </span>
                      )}
                      {foundComic.year && (
                        <span className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                          {foundComic.year}
                        </span>
                      )}
                      {foundComic.last_chapter !== undefined && (
                        <span className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                          {foundComic.last_chapter} Chapter
                          {foundComic.last_chapter !== 1 ? "s" : ""}
                        </span>
                      )}
                      {foundComic.user_follow_count !== undefined && (
                        <span className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                          {foundComic.user_follow_count.toLocaleString()}{" "}
                          Follows
                        </span>
                      )}
                    </div>

                    {foundComic.desc && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-1">
                          Description
                        </h4>
                        <Description content={foundComic.desc} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end">
                  <a
                    href={`https://comick.io/comic/${foundComic.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors flex items-center gap-2"
                  >
                    Read on ComicK.io
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {comicHistory.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                <History size={18} className="text-gray-400" />
                <h2 className="text-lg font-medium">Recent Comics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comicHistory.map((comic) => (
                  <div
                    key={comic.id}
                    className="p-3 bg-gray-900 border border-gray-800 rounded-md flex gap-3 hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => loadFromHistory(comic)}
                  >
                    {comic.md_covers && comic.md_covers.length > 0 ? (
                      <img
                        src={`https://meo.comick.pictures/${comic.md_covers[0].b2key}`}
                        alt={comic.title}
                        className="w-16 h-24 object-cover rounded border border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-gray-600 text-xs">
                        No Cover
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-sm text-white mb-1 truncate">
                        {comic.title}
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {comic.country && (
                          <span className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                            {comic.country.toUpperCase()}
                          </span>
                        )}
                        {comic.status !== undefined && (
                          <span className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                            {getStatusLabel(comic.status)}
                          </span>
                        )}
                      </div>
                      {comic.desc && (
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {comic.desc}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
