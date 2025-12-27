"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Avatar } from "@/components/ui";
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/feed", label: "Accueil", icon: Home },
  { href: "/network", label: "Réseau", icon: Users },
  { href: "/jobs", label: "Emplois", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 12 },
];

export function Navbar() {
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Utiliser l'utilisateur authentifié ou des valeurs par défaut
  const user = {
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : "Utilisateur",
    title: authUser?.headline || "Membre ProNet",
    avatar: authUser?.avatarUrl || null,
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-nav">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Search */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-primary-500">
                ProNet
              </span>
            </Link>

            {/* Search Desktop */}
            <div className="hidden md:block relative w-72">
              <Input
                placeholder="Rechercher..."
                className="pl-10 py-2 text-sm"
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Search Mobile Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center px-4 py-2 text-neutral-500 hover:text-primary-500 transition-colors group"
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">{item.label}</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all" />
              </Link>
            ))}
          </nav>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Avatar name={user.name} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-neutral-900 leading-tight">
                    {user.name.split(" ")[0]}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="lg" />
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-neutral-500">{user.title}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="mt-3 block w-full text-center py-1.5 border border-primary-500 text-primary-500 rounded-full text-sm font-medium hover:bg-primary-50 transition-colors"
                    >
                      Voir le profil
                    </Link>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-3 animate-slide-up">
            <Input
              placeholder="Rechercher des personnes, emplois, entreprises..."
              icon={<Search className="h-4 w-4" />}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="lg:hidden border-t border-neutral-200 bg-white animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
