"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  avatar: string;
  discordId: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    if (!user) return;

    const fetchNotificationCount = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const hostname = window.location.hostname;

        const response = await fetch(
          `http://${hostname}:3000/notifications/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.count);
        }
      } catch (error) {
        console.error("Erreur notifications:", error);
      }
    };

    // Charger au démarrage
    fetchNotificationCount();

    // Recharger toutes les 30 secondes
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const getAvatarUrl = () => {
    if (!user) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";
  };

  // Ne rien afficher si pas connecté
  if (!user) return null;

  return (
    <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Nom de l'app */}
          <Link href="/friends" className="flex items-center gap-3 group">
            <div className="text-4xl group-hover:scale-110 transition-transform">
              🎮
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Nexus</h1>
              <p className="text-xs text-gray-300">Gaming Hub</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/friends"
              className="text-white hover:text-indigo-300 transition-colors font-semibold flex items-center gap-2"
            >
              <span className="text-xl">👥</span>
              <span>Amis</span>
            </Link>
            <Link
              href="/clubs"
              className="text-white hover:text-indigo-300 transition-colors font-semibold flex items-center gap-2"
            >
              <span className="text-xl">🎮</span>
              <span>Clubs</span>
            </Link>
            <Link
              href="/lfg"
              className="text-white hover:text-indigo-300 transition-colors font-semibold flex items-center gap-2"
            >
              <span className="text-xl">🔍</span>
              <span>LFG</span>
            </Link>
            <Link
              href="/messages"
              className="text-white hover:text-indigo-300 transition-colors font-semibold flex items-center gap-2"
            >
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </Link>

            {/* 🔔 CLOCHE DE NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-white hover:text-indigo-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <span className="text-2xl">🔔</span>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              {/* Dropdown des notifications (version simple pour l'instant) */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-2xl border border-white/20 z-50">
                  <div className="p-4">
                    <p className="text-white text-center font-semibold">
                      🚧 Dropdown en construction... 🚧
                    </p>
                    <p className="text-gray-400 text-sm text-center mt-2">
                      Vous avez {notificationCount} notification
                      {notificationCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
              <Link
                href="/profile"
                className="flex items-center gap-2 group hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
              >
                <img
                  src={getAvatarUrl()}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-white/30 group-hover:border-indigo-400 transition-colors"
                />
                <span className="text-white font-semibold group-hover:text-indigo-300 transition-colors">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold shadow-lg"
              >
                🚪 Déconnexion
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
