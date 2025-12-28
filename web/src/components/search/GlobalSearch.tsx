"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input, Avatar } from "@/components/ui";
import {
  Search,
  X,
  User,
  Building2,
  FileText,
  Briefcase,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { searchApi, SearchResults } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export function GlobalSearch({
  className = "",
  placeholder = "Rechercher...",
  onClose,
  isMobile = false,
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [trending, setTrending] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Charger les tendances au montage
  useEffect(() => {
    async function loadTrending() {
      const { data } = await searchApi.trending();
      if (data && Array.isArray(data)) {
        setTrending(data.map((item) => `#${item.hashtag?.name || ''}`).filter(Boolean));
      }
    }
    loadTrending();
  }, []);

  // Effectuer la recherche
  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error } = await searchApi.search(debouncedQuery);
      setIsLoading(false);

      if (data && !error) {
        setResults(data);
      }
    }

    performSearch();
  }, [debouncedQuery]);

  // Fermer au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer avec Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback(
    (type: string, id: string) => {
      setIsOpen(false);
      setQuery("");
      onClose?.();

      switch (type) {
        case "user":
          router.push(`/profile/${id}`);
          break;
        case "job":
          router.push(`/jobs?id=${id}`);
          break;
        case "post":
          router.push(`/feed?post=${id}`);
          break;
        case "company":
          router.push(`/companies/${id}`);
          break;
      }
    },
    [router, onClose]
  );

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleViewAll = (type: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    setIsOpen(false);
    setQuery("");
    onClose?.();
  };

  const hasResults =
    results &&
    (results.users.length > 0 ||
      results.posts.length > 0 ||
      results.jobs.length > 0 ||
      results.companies.length > 0);

  const totalResults =
    results
      ? results.users.length +
        results.posts.length +
        results.jobs.length +
        results.companies.length
      : 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`pl-10 ${isMobile ? "py-3" : "py-2"} text-sm`}
          icon={<Search className="h-4 w-4 text-neutral-400" />}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown des résultats */}
      {isOpen && (query.length > 0 || trending.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {/* État de chargement */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          )}

          {/* Pas de recherche - Afficher les tendances */}
          {!isLoading && !query && trending.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                <TrendingUp className="h-4 w-4" />
                <span>Recherches tendances</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(term)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm text-neutral-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pas de résultats */}
          {!isLoading && query.length >= 2 && !hasResults && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 font-medium">Aucun résultat</p>
              <p className="text-sm text-neutral-500 mt-1">
                Essayez avec d&apos;autres mots-clés
              </p>
            </div>
          )}

          {/* Résultats */}
          {!isLoading && hasResults && (
            <div className="divide-y divide-neutral-100">
              {/* Personnes */}
              {results.users.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                      <User className="h-3.5 w-3.5" />
                      Personnes
                    </div>
                    {results.users.length >= 3 && (
                      <button
                        onClick={() => handleViewAll("users")}
                        className="text-xs text-primary-500 hover:text-primary-600"
                      >
                        Voir tout
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {results.users.slice(0, 3).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelect("user", user.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <Avatar
                          src={user.avatarUrl}
                          name={`${user.firstName} ${user.lastName}`}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-neutral-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.headline && (
                            <p className="text-xs text-neutral-500 truncate">
                              {user.headline}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400">
                          {user.connectionCount} relations
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Emplois */}
              {results.jobs.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                      <Briefcase className="h-3.5 w-3.5" />
                      Emplois
                    </div>
                    {results.jobs.length >= 3 && (
                      <button
                        onClick={() => handleViewAll("jobs")}
                        className="text-xs text-primary-500 hover:text-primary-600"
                      >
                        Voir tout
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {results.jobs.slice(0, 3).map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleSelect("job", job.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                          {job.company?.logoUrl ? (
                            <img
                              src={job.company.logoUrl}
                              alt={job.company.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Briefcase className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-neutral-900 truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {job.company?.name || "Entreprise"}
                            {job.location && ` · ${job.location}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Entreprises */}
              {results.companies.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                      <Building2 className="h-3.5 w-3.5" />
                      Entreprises
                    </div>
                    {results.companies.length >= 3 && (
                      <button
                        onClick={() => handleViewAll("companies")}
                        className="text-xs text-primary-500 hover:text-primary-600"
                      >
                        Voir tout
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {results.companies.slice(0, 3).map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleSelect("company", company.slug)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-neutral-900 truncate">
                            {company.name}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {company.industry}
                            {company._count.jobs > 0 &&
                              ` · ${company._count.jobs} offre${company._count.jobs > 1 ? "s" : ""}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                      <FileText className="h-3.5 w-3.5" />
                      Publications
                    </div>
                    {results.posts.length >= 3 && (
                      <button
                        onClick={() => handleViewAll("posts")}
                        className="text-xs text-primary-500 hover:text-primary-600"
                      >
                        Voir tout
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {results.posts.slice(0, 3).map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handleSelect("post", post.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <Avatar
                          src={post.author.avatarUrl}
                          name={`${post.author.firstName} ${post.author.lastName}`}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-900 truncate">
                            {post.content.slice(0, 80)}
                            {post.content.length > 80 && "..."}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {post.author.firstName} {post.author.lastName} ·{" "}
                            {post._count.reactions} réactions
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton voir tous les résultats */}
              <div className="p-3 bg-neutral-50">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                    setQuery("");
                    onClose?.();
                  }}
                  className="w-full py-2 text-center text-sm text-primary-500 hover:text-primary-600 font-medium"
                >
                  Voir les {totalResults} résultats pour &quot;{query}&quot;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
