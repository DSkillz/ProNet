"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Search,
  Users,
  FileText,
  Briefcase,
  Building2,
  Loader2,
  UserPlus,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { searchApi, SearchResults } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";

  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(type);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query, activeTab);
    }
  }, [query, activeTab]);

  const performSearch = async (q: string, searchType: string) => {
    if (!q || q.length < 2) return;

    setIsLoading(true);
    const response = await searchApi.search(q, searchType);
    if (response.data) {
      setResults(response.data);
    }
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.length >= 2) {
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchInput)}&type=${activeTab}`);
      performSearch(searchInput, activeTab);
    }
  };

  const tabs = [
    { id: "all", label: "Tout", icon: Search },
    { id: "users", label: "Personnes", icon: Users },
    { id: "posts", label: "Publications", icon: FileText },
    { id: "jobs", label: "Emplois", icon: Briefcase },
    { id: "companies", label: "Entreprises", icon: Building2 },
  ];

  const hasResults = results && (
    (results.users?.length || 0) > 0 ||
    (results.posts?.length || 0) > 0 ||
    (results.jobs?.length || 0) > 0 ||
    (results.companies?.length || 0) > 0
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* Search bar */}
          <Card className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Rechercher des personnes, publications, emplois..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button type="submit">Rechercher</Button>
            </form>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {isLoading ? (
            <Card className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          ) : !query ? (
            <Card className="text-center py-20">
              <Search className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Recherchez sur ProNet</h2>
              <p className="text-neutral-500">Trouvez des personnes, des emplois, des entreprises et plus encore.</p>
            </Card>
          ) : !hasResults ? (
            <Card className="text-center py-20">
              <Search className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Aucun resultat</h2>
              <p className="text-neutral-500">Aucun resultat pour "{query}". Essayez avec d'autres termes.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Users */}
              {(activeTab === "all" || activeTab === "users") && results?.users && results.users.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personnes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.users.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900">{user.firstName} {user.lastName}</p>
                          {user.headline && (
                            <p className="text-sm text-neutral-500 truncate">{user.headline}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Posts */}
              {(activeTab === "all" || activeTab === "posts") && results?.posts && results.posts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Publications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className="block p-3 -mx-3 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar name={`${post.author.firstName} ${post.author.lastName}`} size="sm" />
                          <span className="font-medium text-sm">{post.author.firstName} {post.author.lastName}</span>
                        </div>
                        <p className="text-neutral-700 line-clamp-2">{post.content}</p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Jobs */}
              {(activeTab === "all" || activeTab === "jobs") && results?.jobs && results.jobs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Emplois
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.jobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block p-3 -mx-3 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <p className="font-medium text-neutral-900">{job.title}</p>
                        {job.company && <p className="text-sm text-neutral-600">{job.company.name}</p>}
                        {job.location && (
                          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </p>
                        )}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Companies */}
              {(activeTab === "all" || activeTab === "companies") && results?.companies && results.companies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Entreprises
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.companies.map((company) => (
                      <Link
                        key={company.id}
                        href={`/companies/${company.id}`}
                        className="flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-neutral-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-neutral-900">{company.name}</p>
                          {company.industry && <p className="text-sm text-neutral-500">{company.industry}</p>}
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Card className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    }>
      <SearchContent />
    </Suspense>
  );
}
