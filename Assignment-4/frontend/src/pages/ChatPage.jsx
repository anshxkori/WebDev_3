import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Users,
  Radio,
  Hash,
  Smile,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ChatPage({ socket, socketConnected }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeRoom, setActiveRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const availableRooms = [
    { id: 'general', name: 'general', desc: 'Main Lab 4 room (Fig 3 screenshot)' },
    { id: 'web-dev-lab', name: 'web-dev-lab', desc: 'Technical questions & code sharing' },
    { id: 'announcements', name: 'announcements', desc: 'Lab assignment updates' },
  ];

  // Join room when activeRoom or socket changes
  useEffect(() => {
    if (!socket || !socketConnected) return;

    // Join room event
    socket.emit('joinRoom', {
      room: activeRoom,
      username: user?.username || 'Anonymous',
      userId: user?.id || user?._id,
    });

    // Listen for room users update
    const handleRoomUsers = (data) => {
      if (data.room === activeRoom) {
        setRoomUsers(data.users || []);
      }
    };

    // Listen for incoming messages
    const handleReceiveMessage = (msg) => {
      if (msg.room === activeRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    // Listen for system messages
    const handleSystemMessage = (sys) => {
      if (sys.room === activeRoom) {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}-${Math.random()}`,
            isSystem: true,
            message: sys.message,
            timestamp: sys.timestamp,
          },
        ]);
      }
    };

    socket.on('roomUsers', handleRoomUsers);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('systemMessage', handleSystemMessage);

    return () => {
      socket.off('roomUsers', handleRoomUsers);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('systemMessage', handleSystemMessage);
    };
  }, [socket, socketConnected, activeRoom, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !socket || !socketConnected) return;

    socket.emit('sendMessage', {
      room: activeRoom,
      username: user?.username || 'Anonymous',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    });

    setInputMessage('');
  };

  const sendQuickSample = (text) => {
    if (!socket || !socketConnected) {
      addToast('Socket is disconnected', 'error');
      return;
    }
    socket.emit('sendMessage', {
      room: activeRoom,
      username: user?.username || 'Anonymous',
      message: text,
      timestamp: new Date().toISOString(),
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-5">
      {/* Left Column: Rooms & Online Users */}
      <div className="w-full md:w-64 flex flex-col gap-5 shrink-0">
        {/* Rooms Card */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-brand-400" />
            <span>Chat Rooms</span>
          </h4>
          <div className="space-y-1">
            {availableRooms.map((room) => {
              const isActive = activeRoom === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    if (activeRoom !== room.id) {
                      setMessages([]);
                      setActiveRoom(room.id);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" />
                    <span>{room.name}</span>
                  </div>
                  <p className={`text-[10px] font-normal truncate mt-0.5 ${isActive ? 'text-brand-100' : 'text-slate-500'}`}>
                    {room.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connected Users Card */}
        <div className="flex-1 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Room Users</span>
            </h4>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {roomUsers.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {roomUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No users online</p>
            ) : (
              roomUsers.map((u, i) => (
                <div
                  key={u.socketId || i}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60"
                >
                  <div className="relative">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {u.username} {u.username === user?.username && '(You)'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex-1 flex flex-col rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        {/* Chat Room Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>#{activeRoom}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                  Live
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Messages broadcast in real-time to all connected sockets
              </p>
            </div>
          </div>

          {/* Quick screenshot sample buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => sendQuickSample('Hey team, backend is ready 👋')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Screenshot Fig 3 text"
            >
              Fig 3 Sample 1
            </button>
            <button
              onClick={() => sendQuickSample('Messages arriving in real time ⚡')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Screenshot Fig 3 text"
            >
              Fig 3 Sample 2
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Welcome to #{activeRoom}</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  This room uses Socket.IO real-time websockets. Send a message below to see it broadcast instantly!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id || i} className="text-center my-2">
                    <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-400 font-mono">
                      {msg.message} • {formatTime(msg.timestamp)}
                    </span>
                  </div>
                );
              }

              const isMe = msg.username === user?.username;

              return (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-bold ${isMe ? 'text-brand-300' : 'text-slate-300'}`}>
                      {msg.username}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-brand-600 to-teal-600 text-white shadow-lg shadow-brand-600/20 rounded-tr-none'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message #${activeRoom}...`}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || !socketConnected}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
