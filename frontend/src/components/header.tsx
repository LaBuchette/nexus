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

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

  // Charger les notifications non lues
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(
        `http://${hostname}:3000/notifications/unread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erreur notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Marquer UNE notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      await fetch(
        `http://${hostname}:3000/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Recharger les données
      fetchNotifications();

      // Mettre à jour le compteur (diminuer de 1)
      setNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Marquer TOUTES les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      await fetch(`http://${hostname}:3000/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Recharger les données
      fetchNotifications();
      setNotificationCount(0);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lue
    markAsRead(notification.id);

    // Rediriger selon le type
    if (notification.type === "friend_request") {
      router.push("/friends");
    }
    // Plus tard : ajouter d'autres types

    // Fermer le dropdown
    setShowNotifications(false);
  };

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
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    fetchNotifications(); // Charger quand on ouvre
                  }
                }}
                className="relative text-white hover:text-indigo-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <span className="text-2xl">🔔</span>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              {/* Dropdown des notifications - VERSION COMPLÈTE ! */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-2xl border border-white/20 z-50 max-h-[600px] overflow-hidden flex flex-col">
                  {/* Header du dropdown */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">
                      🔔 Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        ✓ Tout marquer comme lu
                      </button>
                    )}
                  </div>

                  {/* Liste des notifications */}
                  <div className="overflow-y-auto max-h-[500px]">
                    {loadingNotifications ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="text-gray-400 text-sm mt-2">
                          Chargement...
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-5xl mb-3">✅</div>
                        <p className="text-white font-semibold mb-1">
                          Aucune notification
                        </p>
                        <p className="text-gray-400 text-sm">
                          Vous êtes à jour !
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icône selon le type */}
                              <div className="text-2xl mt-1">
                                {notif.type === "friend_request" && "👥"}
                                {notif.type === "friend_request_accepted" &&
                                  "✅"}
                                {notif.type === "club_invitation" && "🎮"}
                                {notif.type === "message" && "💬"}
                              </div>

                              {/* Contenu */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm mb-1">
                                  {notif.title}
                                </p>
                                <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {new Date(notif.createdAt).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>

                              {/* Bouton marquer comme lu */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Empêcher le clic de propager
                                  markAsRead(notif.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-opacity"
                              >
                                ✓
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
