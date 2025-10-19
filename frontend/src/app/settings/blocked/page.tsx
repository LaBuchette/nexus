"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  avatar: string;
  discordId: string;
}

interface Block {
  id: string;
  blocker: User;
  blocked: User;
  reason: string | null;
  createdAt: string;
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingUser, setUnblockingUser] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(`http://${hostname}:3000/blocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId: string, username: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir débloquer ${username} ?\n\nCette personne pourra à nouveau vous envoyer des demandes d'ami et interagir avec vous.`
    );

    if (!confirmed) return;

    try {
      setUnblockingUser(userId);
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(`http://${hostname}:3000/blocks/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert(`${username} a été débloqué avec succès.`);
        // Recharger la liste
        loadBlockedUsers();
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors du déblocage");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setUnblockingUser(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/friends"
            className="inline-flex items-center gap-2 text-white hover:text-indigo-300 mb-4 transition-colors"
          >
            ← Retour
          </Link>
          <h1 className="text-5xl font-bold text-white mb-2">
            🚫 Utilisateurs bloqués
          </h1>
          <p className="text-gray-300">
            Gérez vos blocages et débloquez les utilisateurs si nécessaire
          </p>
        </div>

        {/* Liste des utilisateurs bloqués */}
        {blockedUsers.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Aucun utilisateur bloqué
            </h2>
            <p className="text-gray-300 mb-6">
              Vous n'avez bloqué aucun utilisateur pour le moment.
            </p>
            <Link
              href="/friends"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold inline-block"
            >
              Retour aux amis
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((block) => (
              <div
                key={block.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Link href={`/users/${block.blocked.id}`}>
                      <img
                        src={getAvatarUrl(block.blocked)}
                        alt={block.blocked.username}
                        className="w-16 h-16 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link href={`/users/${block.blocked.id}`}>
                        <h3 className="text-xl font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer">
                          {block.blocked.username}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-400">
                        Bloqué le{" "}
                        {new Date(block.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      {block.reason && (
                        <p className="text-sm text-gray-400 mt-1">
                          Raison : {block.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      unblockUser(block.blocked.id, block.blocked.username)
                    }
                    disabled={unblockingUser === block.blocked.id}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    {unblockingUser === block.blocked.id
                      ? "Déblocage..."
                      : "🔓 Débloquer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
