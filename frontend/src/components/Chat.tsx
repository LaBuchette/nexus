"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    discordId: string;
  };
}

interface ChatProps {
  clubId: string;
  userId: string;
}

export default function Chat({ clubId, userId }: ChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Défiler automatiquement vers le bas quand il y a de nouveaux messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connexion Socket.IO
  useEffect(() => {
    const hostname = window.location.hostname;
    const socketInstance = io(`http://${hostname}:3000`);

    socketInstance.on("connect", () => {
      console.log("✅ Connecté au serveur Socket.IO");
      setIsConnected(true);

      // Rejoindre la room du club
      socketInstance.emit("joinClub", { clubId, userId });
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Déconnecté du serveur Socket.IO");
      setIsConnected(false);
    });

    // Recevoir l'historique des messages
    socketInstance.on("messageHistory", (history: Message[]) => {
      console.log("📚 Historique reçu:", history.length, "messages");
      setMessages(history);
    });

    // Recevoir un nouveau message
    socketInstance.on("newMessage", (message: Message) => {
      console.log("💬 Nouveau message reçu:", message);
      setMessages((prev) => [...prev, message]);
    });

    // Erreurs
    socketInstance.on("error", (error: any) => {
      console.error("❌ Erreur Socket.IO:", error);
      alert(error.message || "Une erreur est survenue");
    });

    setSocket(socketInstance);

    // Nettoyage à la déconnexion du composant
    return () => {
      if (socketInstance) {
        socketInstance.emit("leaveClub", { clubId });
        socketInstance.disconnect();
      }
    };
  }, [clubId, userId]);

  // Envoyer un message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket) return;

    socket.emit("sendMessage", {
      clubId,
      userId,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
        <h2 className="text-2xl font-bold text-white">💬 Chat</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-300">
            {isConnected ? "Connecté" : "Déconnecté"}
          </span>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              Aucun message pour le moment. Soyez le premier à écrire ! 🚀
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const avatarUrl = message.author.avatar
              ? `https://cdn.discordapp.com/avatars/${message.author.discordId}/${message.author.avatar}.png`
              : "https://cdn.discordapp.com/embed/avatars/0.png";

            const isMyMessage = message.author.id === userId;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isMyMessage ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <img
                  src={avatarUrl}
                  alt={message.author.username}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />

                {/* Message */}
                <div
                  className={`flex flex-col ${
                    isMyMessage ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        isMyMessage ? "text-indigo-300" : "text-white"
                      }`}
                    >
                      {message.author.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-2xl max-w-md ${
                      isMyMessage
                        ? "bg-indigo-600 text-white"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez un message..."
          disabled={!isConnected}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isConnected || !newMessage.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
