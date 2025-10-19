"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";

interface User {
  id: string;
  username: string;
  avatar: string;
  discordId: string;
}

interface FriendRequest {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender: User;
  receiver: User;
}

type TabType = "friends" | "pending" | "sent";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      // Charger les amis
      try {
        const friendsRes = await fetch(`http://${hostname}:3000/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (friendsRes.ok) {
          setFriends(await friendsRes.json());
        }
      } catch (e) {
        console.error("Erreur amis:", e);
      }

      // Charger les demandes reçues
      try {
        const pendingRes = await fetch(
          `http://${hostname}:3000/friends/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (pendingRes.ok) {
          setPendingRequests(await pendingRes.json());
        }
      } catch (e) {
        console.error("Erreur pending:", e);
      }

      // Charger les demandes envoyées
      try {
        const sentRes = await fetch(`http://${hostname}:3000/friends/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sentRes.ok) {
          setSentRequests(await sentRes.json());
        }
      } catch (e) {
        console.error("Erreur sent:", e);
      }

      // Charger les utilisateurs
      try {
        const usersRes = await fetch(`http://${hostname}:3000/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usersRes.ok) {
          const users = await usersRes.json();
          setAllUsers(users);
        }
      } catch (e) {
        console.error("Erreur users:", e);
      }
    } catch (error) {
      console.error("Erreur générale:", error);
    } finally {
      setLoading(false);
    }
  };

  // Accepter une demande
  const acceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(
        `http://${hostname}:3000/friends/accept/${requestId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        // Recharger les données
        loadData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Refuser une demande
  const rejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(
        `http://${hostname}:3000/friends/reject/${requestId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        // Recharger les données
        loadData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Envoyer une demande d'ami
  const sendFriendRequest = async (userId: string) => {
    try {
      setSendingRequest(userId);
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(
        `http://${hostname}:3000/friends/request/${userId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        // Recharger les données
        loadData();
        setShowAddModal(false);
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors de l'envoi de la demande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setSendingRequest(null);
    }
  };

  // Filtrer les utilisateurs disponibles pour ajouter
  const getAvailableUsers = () => {
    if (!currentUserId) return [];

    // IDs des amis actuels
    const friendIds = friends.map((f) =>
      f.sender.id === currentUserId ? f.receiver.id : f.sender.id
    );

    // IDs des demandes en attente (reçues et envoyées)
    const pendingIds = [
      ...pendingRequests.map((r) => r.sender.id),
      ...sentRequests.map((r) => r.receiver.id),
    ];

    // Filtrer : pas moi, pas déjà ami, pas de demande en attente
    return allUsers.filter(
      (user) =>
        user.id !== currentUserId &&
        !friendIds.includes(user.id) &&
        !pendingIds.includes(user.id)
    );
  };

  // Obtenir l'avatar Discord
  const getAvatarUrl = (user: User) => {
    return user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                👥 Mes Amis
              </h1>
              <p className="text-gray-300">
                Gérez vos relations et trouvez de nouveaux coéquipiers !
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
            >
              ➕ Ajouter un ami
            </button>
          </div>

          {/* Onglets */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "friends"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Amis ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "pending"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Demandes reçues ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "sent"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Demandes envoyées ({sentRequests.length})
            </button>
          </div>

          {/* Contenu selon l'onglet actif */}
          {activeTab === "friends" && (
            <div>
              {friends.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Aucun ami pour le moment
                  </h2>
                  <p className="text-gray-300">
                    Commencez à ajouter des joueurs pour construire votre réseau
                    !
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map((friendship) => {
                    const friend =
                      friendship.sender.id === currentUserId
                        ? friendship.receiver
                        : friendship.sender;

                    return (
                      <Link
                        href={`/users/${friend.id}`}
                        key={friendship.id}
                        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all border border-white/20 block cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={getAvatarUrl(friend)}
                            alt={friend.username}
                            className="w-16 h-16 rounded-full"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">
                              {friend.username}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Amis depuis le{" "}
                              {new Date(
                                friendship.updatedAt
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "pending" && (
            <div>
              {pendingRequests.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Aucune demande en attente
                  </h2>
                  <p className="text-gray-300">
                    Vous n'avez pas de nouvelles demandes d'amitié.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={getAvatarUrl(request.sender)}
                            alt={request.sender.username}
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {request.sender.username}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Demande envoyée le{" "}
                              {new Date(request.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => acceptRequest(request.id)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                          >
                            ✓ Accepter
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                          >
                            ✕ Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div>
              {sentRequests.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">📤</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Aucune demande envoyée
                  </h2>
                  <p className="text-gray-300">
                    Vous n'avez pas de demandes en attente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={getAvatarUrl(request.receiver)}
                            alt={request.receiver.username}
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {request.receiver.username}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Demande envoyée le{" "}
                              {new Date(request.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold">
                          ⏳ En attente
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Ajouter un ami */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">
                    ➕ Ajouter un ami
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-white hover:text-red-400 text-2xl transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {getAvailableUsers().length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🤷</div>
                      <p className="text-white text-lg">
                        Aucun utilisateur disponible
                      </p>
                      <p className="text-gray-400 text-sm">
                        Tous les utilisateurs sont déjà vos amis ou ont une
                        demande en attente
                      </p>
                    </div>
                  ) : (
                    getAvailableUsers().map((user) => (
                      <div
                        key={user.id}
                        className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={getAvatarUrl(user)}
                            alt={user.username}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {user.username}
                            </h3>
                          </div>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          disabled={sendingRequest === user.id}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                        >
                          {sendingRequest === user.id
                            ? "Envoi..."
                            : "➕ Ajouter"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
