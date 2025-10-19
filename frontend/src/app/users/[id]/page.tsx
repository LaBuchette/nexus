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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

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

  // Envoyer un signalement
  const submitReport = async () => {
    if (!reportReason) {
      alert("⚠️ Veuillez choisir un motif de signalement");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(`http://${hostname}:3000/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportedUserId: userId,
          reason: reportReason,
          description: reportDescription || undefined,
        }),
      });

      if (response.ok) {
        alert(
          `✅ Signalement envoyé avec succès !\n\n${user?.username} a été signalé pour "${reportReason}".\n\nNos modérateurs examineront votre signalement.`
        );
        // Fermer le modal et réinitialiser
        setShowReportModal(false);
        setReportReason("");
        setReportDescription("");
      } else {
        const error = await response.json();

        // Messages d'erreur personnalisés
        if (response.status === 400) {
          alert("❌ Vous ne pouvez pas vous signaler vous-même !");
        } else if (response.status === 404) {
          alert("❌ Cet utilisateur n'existe pas.");
        } else if (response.status === 409) {
          alert(
            "⏳ Vous avez déjà signalé cet utilisateur récemment.\n\nVeuillez attendre 24 heures avant de le signaler à nouveau."
          );
        } else {
          alert(`❌ Erreur : ${error.message || "Une erreur est survenue"}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du signalement:", error);
      alert("❌ Une erreur réseau est survenue. Veuillez réessayer.");
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

            {/* Bouton Signaler */}
            <button
              onClick={() => setShowReportModal(true)}
              disabled={isBlocked}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
            >
              ⚠️ Signaler
            </button>
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

          {/* Modal de Signalement */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border-2 border-orange-500/50 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    ⚠️ Signaler {user.username}
                  </h2>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                      setReportDescription("");
                    }}
                    className="text-gray-400 hover:text-red-400 text-3xl transition-colors font-bold leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Formulaire */}
                <div className="space-y-5">
                  {/* Motif du signalement */}
                  <div>
                    <label className="block text-white font-bold mb-2 text-sm uppercase tracking-wide">
                      Motif du signalement *
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="" className="bg-gray-800">
                        -- Choisir un motif --
                      </option>
                      <option value="harassment" className="bg-gray-800">
                        🚨 Harcèlement
                      </option>
                      <option value="hate_speech" className="bg-gray-800">
                        💬 Discours haineux
                      </option>
                      <option value="spam" className="bg-gray-800">
                        📧 Spam
                      </option>
                      <option value="cheating" className="bg-gray-800">
                        🎮 Triche
                      </option>
                      <option
                        value="inappropriate_content"
                        className="bg-gray-800"
                      >
                        🔞 Contenu inapproprié
                      </option>
                      <option value="impersonation" className="bg-gray-800">
                        👤 Usurpation d'identité
                      </option>
                      <option value="other" className="bg-gray-800">
                        ❓ Autre
                      </option>
                    </select>
                  </div>

                  {/* Description optionnelle */}
                  <div>
                    <label className="block text-white font-bold mb-2 text-sm uppercase tracking-wide">
                      Détails (optionnel)
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Décrivez le problème rencontré..."
                      maxLength={1000}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none font-medium"
                    />
                    <p className="text-gray-400 text-sm mt-2 font-medium">
                      {reportDescription.length}/1000 caractères
                    </p>
                  </div>

                  {/* Message d'avertissement */}
                  <div className="bg-yellow-900/40 border-2 border-yellow-600/60 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm font-semibold leading-relaxed">
                      ⚠️ Les faux signalements peuvent entraîner des sanctions
                      contre votre compte.
                    </p>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => {
                        setShowReportModal(false);
                        setReportReason("");
                        setReportDescription("");
                      }}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={submitReport}
                      disabled={!reportReason}
                      className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-white rounded-lg transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
