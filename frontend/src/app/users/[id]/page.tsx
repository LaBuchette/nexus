"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  avatar: string;
  discordId: string;
  email: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // États pour les actions
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [blockingUser, setBlockingUser] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      setCurrentUserId(currentUser.id);
    }

    // Charger toutes les données
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    await Promise.all([
      loadUserProfile(),
      checkFriendStatus(),
      checkBlockStatus(),
    ]);
    setLoading(false);
  };

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(`http://${hostname}:3000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        alert("Utilisateur non trouvé");
        router.push("/friends");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement du profil");
    }
  };

  const checkFriendStatus = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      // Vérifier si on est amis
      const friendsRes = await fetch(`http://${hostname}:3000/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (friendsRes.ok) {
        const friends = await friendsRes.json();
        const areFriends = friends.some(
          (f: any) => f.sender.id === userId || f.receiver.id === userId
        );
        setIsFriend(areFriends);
      }

      // Vérifier s'il y a une demande en attente
      const [sentRes, pendingRes] = await Promise.all([
        fetch(`http://${hostname}:3000/friends/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://${hostname}:3000/friends/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sentRes.ok) {
        const sentRequests = await sentRes.json();
        const hasSent = sentRequests.some((r: any) => r.receiver.id === userId);
        if (hasSent) setHasPendingRequest(true);
      }

      if (pendingRes.ok) {
        const pendingRequests = await pendingRes.json();
        const hasReceived = pendingRequests.some(
          (r: any) => r.sender.id === userId
        );
        if (hasReceived) setHasPendingRequest(true);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const checkBlockStatus = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      // Utiliser la route bidirectionnelle
      const response = await fetch(
        `http://${hostname}:3000/blocks/check-bidirectional/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsBlocked(data.isBlocked);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Bloquer l'utilisateur
  const blockUser = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir bloquer ${user.username} ?\n\nCette personne ne pourra plus vous envoyer de demandes d'ami ni interagir avec vous.`
    );

    if (!confirmed) return;

    try {
      setBlockingUser(true);
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(`http://${hostname}:3000/blocks/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Bloqué depuis le profil" }),
      });

      if (response.ok) {
        alert(`${user.username} a été bloqué avec succès.`);
        setIsBlocked(true);
        // Recharger pour mettre à jour l'état
        loadAllData();
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors du blocage");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setBlockingUser(false);
    }
  };

  // Envoyer une demande d'ami
  const sendFriendRequest = async () => {
    if (!user) return;

    try {
      setSendingRequest(true);
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
        alert(`Demande d'ami envoyée à ${user.username} !`);
        setHasPendingRequest(true);
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors de l'envoi de la demande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setSendingRequest(false);
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-white text-2xl">Utilisateur non trouvé</div>
      </div>
    );
  }

  // Si c'est notre propre profil
  if (currentUserId === user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            C'est votre profil !
          </h2>
          <Link
            href="/friends"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold inline-block"
          >
            Retour aux amis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour */}
        <Link
          href="/friends"
          className="inline-flex items-center gap-2 text-white hover:text-indigo-300 mb-6 transition-colors"
        >
          ← Retour
        </Link>

        {/* Card de profil */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {/* Header avec avatar */}
          <div className="flex items-center gap-6 mb-8">
            <img
              src={getAvatarUrl(user)}
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-white/20"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {user.username}
              </h1>
              <p className="text-gray-300">
                Membre depuis le{" "}
                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 mb-8">
            {/* Bouton Ajouter en ami / État */}
            {isBlocked ? (
              <button
                disabled
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-not-allowed"
              >
                🚫 Utilisateur bloqué
              </button>
            ) : isFriend ? (
              <button
                disabled
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-not-allowed"
              >
                ✓ Déjà ami
              </button>
            ) : hasPendingRequest ? (
              <button
                disabled
                className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold cursor-not-allowed"
              >
                ⏳ Demande en attente
              </button>
            ) : (
              <button
                onClick={sendFriendRequest}
                disabled={sendingRequest}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
              >
                {sendingRequest ? "Envoi..." : "➕ Ajouter en ami"}
              </button>
            )}

            {/* Bouton Bloquer / Déjà bloqué */}
            {isBlocked ? (
              <button
                disabled
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-not-allowed"
              >
                🚫 Déjà bloqué
              </button>
            ) : (
              <button
                onClick={blockUser}
                disabled={blockingUser}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
              >
                {blockingUser ? "Blocage..." : "🚫 Bloquer"}
              </button>
            )}
          </div>

          {/* Informations */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Informations</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Nom d'utilisateur</span>
                <span className="text-white font-semibold">
                  {user.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Discord ID</span>
                <span className="text-white font-mono text-sm">
                  {user.discordId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Inscription</span>
                <span className="text-white">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
