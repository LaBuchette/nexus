"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LFGPost {
  id: string;
  title: string;
  description: string;
  game: string;
  playersNeeded: number;
  clubId: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    avatar: string;
    discordId: string;
  };
  club: {
    id: string;
    name: string;
  };
}

export default function LFGPage() {
  const [posts, setPosts] = useState<LFGPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    game: "",
    playersNeeded: 1,
    clubId: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }

    const hostname = window.location.hostname;

    // Récupérer toutes les annonces LFG
    fetch(`http://${hostname}:3000/lfg`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement");
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur:", error);
        setLoading(false);
      });

    // Récupérer les clubs pour le formulaire
    fetch(`http://${hostname}:3000/clubs`)
      .then((res) => res.json())
      .then((data) => setClubs(data))
      .catch((error) => console.error("Erreur clubs:", error));
  }, []);

  // Créer une annonce
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId || !formData.clubId) {
      alert("Veuillez sélectionner un club");
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      const response = await fetch(`http://${hostname}:3000/lfg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Recharger les annonces
        const data = await fetch(`http://${hostname}:3000/lfg`).then((res) =>
          res.json()
        );
        setPosts(data);

        // Réinitialiser le formulaire
        setFormData({
          title: "",
          description: "",
          game: "",
          playersNeeded: 1,
          clubId: "",
        });
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setCreating(false);
    }
  };

  // Calculer le temps écoulé depuis la création
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              🎮 Looking For Group
            </h1>
            <p className="text-gray-300">
              Trouve des coéquipiers pour tes parties !
            </p>
          </div>

          {currentUserId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
            >
              ➕ Créer une annonce
            </button>
          )}
        </div>

        {/* Liste des annonces */}
        {posts.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Aucune annonce pour le moment
            </h2>
            <p className="text-gray-300 mb-6">
              Sois le premier à poster une annonce de recherche !
            </p>
            {currentUserId && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
              >
                ➕ Créer la première annonce
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const avatarUrl = post.creator.avatar
                ? `https://cdn.discordapp.com/avatars/${post.creator.discordId}/${post.creator.avatar}.png`
                : "https://cdn.discordapp.com/embed/avatars/0.png";

              return (
                <div
                  key={post.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all cursor-pointer border border-white/20"
                >
                  {/* En-tête de la card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="px-2 py-1 bg-indigo-600 rounded-full text-xs font-semibold">
                          🎮 {post.game}
                        </span>
                        <span className="px-2 py-1 bg-purple-600 rounded-full text-xs font-semibold">
                          👥 {post.playersNeeded}{" "}
                          {post.playersNeeded === 1 ? "joueur" : "joueurs"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Footer de la card */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <img
                        src={avatarUrl}
                        alt={post.creator.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm text-white font-semibold">
                          {post.creator.username}
                        </div>
                        <div className="text-xs text-gray-400">
                          {getTimeAgo(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/clubs/${post.clubId}`}
                      className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold"
                    >
                      {post.club.name} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de création d'annonce */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">
                  ➕ Créer une annonce LFG
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-white hover:text-red-400 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Cherche 2 joueurs pour Ranked Valorant"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Décris ce que tu recherches (niveau, rôle, horaires...)"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Jeu */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Jeu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.game}
                    onChange={(e) =>
                      setFormData({ ...formData, game: e.target.value })
                    }
                    placeholder="Ex: Valorant, League of Legends, CS2..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Nombre de joueurs */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Nombre de joueurs recherchés *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={formData.playersNeeded}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        playersNeeded: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Club */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Club *
                  </label>
                  <select
                    required
                    value={formData.clubId}
                    onChange={(e) =>
                      setFormData({ ...formData, clubId: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" className="bg-gray-800 text-white">
                      Sélectionne un club
                    </option>
                    {clubs.map((club) => (
                      <option
                        key={club.id}
                        value={club.id}
                        className="bg-gray-800 text-white"
                      >
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Boutons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    {creating ? "Création..." : "Créer l'annonce"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
