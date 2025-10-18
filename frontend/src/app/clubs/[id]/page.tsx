"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Club {
  id: string;
  name: string;
  description: string;
  game: string;
  logo: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  ownerId: string;
  owner: {
    id: string;
    username: string;
    avatar: string;
    discordId: string;
  };
  createdAt: string;
}

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [joining, setJoining] = useState(false); // ← AJOUTEZ

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }

    // Récupérer les détails du club
    const hostname = window.location.hostname;
    fetch(`http://${hostname}:3000/clubs/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Club non trouvé");
        return res.json();
      })
      .then((data) => {
        setClub(data);
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsOwner(data.ownerId === user.id);
        }
        setLoading(false);

        // Charger les membres
        return fetch(`http://${hostname}:3000/clubs/${params.id}/members`);
      })
      .then((res) => res?.json())
      .then((membersData) => {
        if (membersData) {
          setMembers(membersData);

          // Vérifier si l'utilisateur est membre
          if (userStr) {
            const user = JSON.parse(userStr);
            const isMemberCheck = membersData.some(
              (m: any) => m.userId === user.id
            );
            setIsMember(isMemberCheck);
          }
        }
      })
      .catch((error) => {
        console.error("Erreur:", error);
        setLoading(false);
      });
  }, [params.id]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce club ? Cette action est irréversible."
      )
    ) {
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const hostname = window.location.hostname;
      const response = await fetch(
        `http://${hostname}:3000/clubs/${params.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        router.push("/clubs");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleJoin = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
      return;
    }

    setJoining(true);

    try {
      const hostname = window.location.hostname;
      const response = await fetch(
        `http://${hostname}:3000/clubs/${params.id}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Recharger la page pour voir les changements
        window.location.reload();
      } else {
        const error = await response.json();
        alert(
          error.message || "Erreur lors de la tentative de rejoindre le club"
        );
        setJoining(false);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-white mb-4">Club non trouvé</h1>
        <Link
          href="/clubs"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Retour aux clubs
        </Link>
      </div>
    );
  }

  const avatarUrl = club.owner.avatar
    ? `https://cdn.discordapp.com/avatars/${club.owner.discordId}/${club.owner.avatar}.png`
    : "https://cdn.discordapp.com/embed/avatars/0.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <Link
          href="/clubs"
          className="text-indigo-300 hover:text-indigo-200 mb-6 inline-block"
        >
          ← Retour aux clubs
        </Link>

        {/* En-tête du club */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-6">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-5xl flex-shrink-0">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                "🎮"
              )}
            </div>

            {/* Infos principales */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {club.name}
                  </h1>
                  {club.game && (
                    <p className="text-xl text-indigo-300 mb-4">
                      🎮 {club.game}
                    </p>
                  )}
                </div>

                {/* Badge Public/Privé */}
                {club.isPublic ? (
                  <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold">
                    🌍 Public
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold">
                    🔒 Privé
                  </span>
                )}
              </div>

              {/* Statistiques */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {club.memberCount}
                  </div>
                  <div className="text-sm text-gray-300">Membres</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {club.maxMembers}
                  </div>
                  <div className="text-sm text-gray-300">Maximum</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round((club.memberCount / club.maxMembers) * 100)}%
                  </div>
                  <div className="text-sm text-gray-300">Rempli</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                📝 Description
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap">
                {club.description || "Aucune description pour le moment."}
              </p>
            </div>

            {/* Membres */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                👥 Membres ({members.length})
              </h2>

              {members.length > 0 ? (
                <div className="space-y-3">
                  {members.map((member: any) => {
                    const memberAvatarUrl = member.user.avatar
                      ? `https://cdn.discordapp.com/avatars/${member.user.discordId}/${member.user.avatar}.png`
                      : "https://cdn.discordapp.com/embed/avatars/0.png";

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 bg-white/5 p-3 rounded-lg"
                      >
                        <img
                          src={memberAvatarUrl}
                          alt={member.user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-white font-semibold">
                            {member.user.username}
                          </div>
                          <div className="text-sm text-gray-400">
                            Membre depuis le{" "}
                            {new Date(member.joinedAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        </div>
                        {member.role === "owner" && (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                            👑 Owner
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">
                    Aucun membre pour le moment. Soyez le premier à rejoindre !
                    🚀
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Propriétaire */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                👑 Propriétaire
              </h2>
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={club.owner.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="text-white font-semibold">
                    {club.owner.username}
                  </div>
                  <div className="text-sm text-gray-400">Fondateur</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">⚡ Actions</h2>

              {currentUserId ? (
                <div className="space-y-3">
                  {!isOwner && !isMember && (
                    <button
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                    >
                      {joining ? "⏳ Rejoindre..." : "➕ Rejoindre le Club"}
                    </button>
                  )}

                  {!isOwner && isMember && (
                    <div className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-center">
                      ✅ Vous êtes membre
                    </div>
                  )}

                  {isOwner && (
                    <>
                      <button className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold">
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                      >
                        🗑️ Supprimer
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/"
                  className="block w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold text-center"
                >
                  🔐 Se connecter pour rejoindre
                </Link>
              )}
            </div>

            {/* Informations */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                ℹ️ Informations
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Créé le</span>
                  <span className="text-white">
                    {new Date(club.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white">
                    {club.isPublic ? "Public" : "Privé"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
