import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  Send,
  UserPlus,
  Users,
  Smile,
  Check,
  UserCheck,
  Search,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Flame,
  ChevronLeft
} from 'lucide-react';
import {
  supabaseSim,
  ChatMessage,
  FriendRequest,
  UserProfile,
  DEFAULT_AVATARS
} from '../utils/supabaseSim';
import { supabase } from '../utils/supabaseClient';

interface FloatingChatWidgetProps {
  currentUsername?: string;
  username?: string;
  isDark?: boolean;
  theme?: string;
  onOpenProfile?: () => void;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  currentUsername: propCurrentUsername,
  username: propUsername,
  isDark: propIsDark,
  theme: propTheme,
  onOpenProfile,
}) => {
  const activeUsername = (propCurrentUsername || propUsername || localStorage.getItem('grammar_quiz_username_v1') || 'ผู้ใช้').trim();
  const isDark = propIsDark !== undefined ? propIsDark : propTheme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'add'>('global');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  // Data states
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [allUsers, setAllUsers] = useState<{ username: string; isFriend: boolean }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestStatusMsg, setRequestStatusMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Emoji Presets
  const QUICK_EMOJIS = ['✌️', '🔥', '📚', '💪', '❤️', '🤔', '🎉', '💯'];

  // Load chat data and friends (async — Supabase)
  const refreshChatData = async () => {
    await supabaseSim.warmProfileCache();
    const gMsgs = await supabaseSim.getChatMessages(activeUsername);
    setGlobalMessages(gMsgs);

    if (!activeUsername) return;

    const friends = await supabaseSim.getFriends(activeUsername);
    setFriendsList(friends);

    const reqs = await supabaseSim.getFriendRequests(activeUsername);
    setFriendRequests(reqs);

    if (selectedFriend) {
      const dMsgs = await supabaseSim.getChatMessages(activeUsername, selectedFriend);
      setDirectMessages(dMsgs);
    }

    const users = await supabaseSim.getRealUsers();
    const formatted = users
      .filter(u => u.username.toLowerCase() !== activeUsername.toLowerCase())
      .map(u => ({
        username: u.username,
        isFriend: friends.some(f => f.toLowerCase() === u.username.toLowerCase()),
      }));
    setAllUsers(formatted);
  };

  useEffect(() => {
    refreshChatData();

    // Supabase Realtime — ข้อความใหม่จาก device อื่นมาถึงทันที
    const channel = supabase
      .channel('winter_chat_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'winter_chat' }, () => {
        refreshChatData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'winter_users' }, () => {
        refreshChatData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeUsername, selectedFriend]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalMessages, directMessages, isOpen, activeTab, selectedFriend]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSender = activeUsername || 'ผู้เยือน';
    if (!inputMessage.trim()) return;

    const myProfile = supabaseSim.getProfile(cleanSender);
    if (activeTab === 'global') {
      await supabaseSim.sendChatMessage({ sender: cleanSender, text: inputMessage, isGlobal: true, avatar: myProfile.avatar });
    } else if (activeTab === 'friends' && selectedFriend) {
      await supabaseSim.sendChatMessage({ sender: cleanSender, recipient: selectedFriend, text: inputMessage, isGlobal: false, avatar: myProfile.avatar });
    }
    setInputMessage('');
    refreshChatData();
  };

  const handleSendFriendRequest = async (targetUser: string) => {
    const res = await supabaseSim.sendFriendRequest(activeUsername, targetUser);
    setRequestStatusMsg(res.message);
    setTimeout(() => setRequestStatusMsg(null), 3000);
    refreshChatData();
  };

  const handleAcceptRequest = async (reqId: string) => {
    await supabaseSim.respondFriendRequest(reqId, true);
    refreshChatData();
  };

  const handleRejectRequest = async (reqId: string) => {
    await supabaseSim.respondFriendRequest(reqId, false);
    refreshChatData();
  };

  const currentProfile = activeUsername ? supabaseSim.getProfile(activeUsername) : null;
  const totalUnreadBadge = friendRequests.length;

  return (
    <>
      {/* Floating Toggle Button (lifted above the Netlify badge) */}
      <div className="fixed bottom-16 right-5 z-[100] flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-zinc-950 font-black shadow-[0_10px_25px_rgba(245,158,11,0.4)] hover:shadow-amber-500/50 transition-all border border-amber-200 cursor-pointer"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-zinc-950" />
            {totalUnreadBadge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-rose-500 text-white rounded-full animate-bounce">
                {totalUnreadBadge}
              </span>
            )}
          </div>
          <span className="text-xs font-black tracking-wide">
            {isOpen ? 'ซ่อนแชท' : 'แชทนักเรียน'}
          </span>
        </motion.button>
      </div>

      {/* Floating Chat Modal Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-32 right-3 sm:right-6 z-[101] w-[calc(100vw-24px)] sm:w-[380px] h-[520px] max-h-[80vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden backdrop-blur-md ${
              isDark
                ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100'
                : 'bg-white/95 border-stone-200 text-stone-800'
            }`}
          >
            {/* Top Bar Header */}
            <div className={`p-3.5 border-b flex items-center justify-between ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-stone-100/90 border-stone-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {selectedFriend && activeTab === 'friends' ? (
                  <button
                    onClick={() => setSelectedFriend(null)}
                    className="p-1 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500 font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    {selectedFriend && activeTab === 'friends' ? (
                      <>
                        <span>แชทกับ {selectedFriend}</span>
                      </>
                    ) : (
                      <>
                        <span>WINTER Student Lounge</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </>
                    )}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    {selectedFriend ? 'ข้อความส่วนตัว' : `คุณคือ: ${activeUsername || 'ผู้เยือน'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    title="แก้ไขโปรไฟล์"
                    className="p-1.5 rounded-xl hover:bg-zinc-800/40 text-amber-400 transition-colors"
                  >
                    <img
                      src={currentProfile?.avatar || DEFAULT_AVATARS[0]}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-amber-400/50"
                    />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex border-b text-xs font-bold ${
              isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-stone-200 bg-stone-50'
            }`}>
              <button
                onClick={() => {
                  setActiveTab('global');
                  setSelectedFriend(null);
                }}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'global'
                    ? 'border-amber-400 text-amber-500 font-black'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>แชทรวม</span>
              </button>

              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'friends'
                    ? 'border-amber-400 text-amber-500 font-black'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>เพื่อน ({friendsList.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('add');
                  setSelectedFriend(null);
                }}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors border-b-2 relative ${
                  activeTab === 'add'
                    ? 'border-amber-400 text-amber-500 font-black'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>แอดเพื่อน</span>
                {friendRequests.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
                )}
              </button>
            </div>

            {/* Status notification toast */}
            {requestStatusMsg && (
              <div className="bg-amber-500 text-zinc-950 font-black text-xs px-3 py-1.5 text-center shadow-inner">
                {requestStatusMsg}
              </div>
            )}

            {/* TAB CONTENT 1: GLOBAL CHAT */}
            {activeTab === 'global' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {globalMessages.map((msg) => {
                    const isMe = msg.sender.toLowerCase() === activeUsername.toLowerCase();
                    const senderProfile = supabaseSim.getProfile(msg.sender);

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 text-xs ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img
                          src={msg.avatar || senderProfile.avatar}
                          alt={msg.sender}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-amber-400/30"
                        />
                        <div className={`max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-1 mb-0.5 text-[10px] text-zinc-400 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="font-bold text-zinc-300">{msg.sender}</span>
                            <span>•</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`p-2.5 rounded-2xl font-medium leading-relaxed break-words shadow-xs ${
                              isMe
                                ? 'bg-amber-500 text-zinc-950 rounded-tr-xs font-semibold'
                                : isDark
                                  ? 'bg-zinc-800 text-zinc-100 rounded-tl-xs border border-zinc-700/50'
                                  : 'bg-stone-100 text-stone-800 rounded-tl-xs border border-stone-200'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Emoji Bar & Input Form */}
                <div className={`p-2.5 border-t ${
                  isDark ? 'border-zinc-800 bg-zinc-950/80' : 'border-stone-200 bg-stone-50'
                }`}>
                  <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setInputMessage((prev) => prev + emoji)}
                        className="p-1 px-2 rounded-lg bg-zinc-800/40 hover:bg-amber-500/20 text-xs transition-colors shrink-0"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="พิมพ์ข้อความคุยกับเพื่อนๆ..."
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-stone-300 text-stone-800'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold transition-all shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: FRIENDS LIST & DIRECT CHAT */}
            {activeTab === 'friends' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {selectedFriend ? (
                  // Direct 1-on-1 Chat Thread
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {directMessages.length === 0 ? (
                        <div className="text-center py-10 text-xs text-zinc-400">
                          <p>ยังไม่มีประวัติการคุยกับ {selectedFriend}</p>
                          <p className="mt-1">พิมพ์ข้อความทักทายเพื่อนได้เลย!</p>
                        </div>
                      ) : (
                        directMessages.map((msg) => {
                          const isMe = msg.sender.toLowerCase() === activeUsername.toLowerCase();
                          return (
                            <div
                              key={msg.id}
                              className={`flex gap-2 text-xs ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`p-2.5 rounded-2xl font-medium leading-relaxed break-words shadow-xs ${
                                  isMe
                                    ? 'bg-amber-500 text-zinc-950 rounded-tr-xs font-semibold'
                                    : isDark
                                      ? 'bg-zinc-800 text-zinc-100 rounded-tl-xs border border-zinc-700/50'
                                      : 'bg-stone-100 text-stone-800 rounded-tl-xs border border-stone-200'
                                }`}>
                                  {msg.text}
                                </div>
                                <div className={`text-[9px] text-zinc-400 mt-0.5 ${isMe ? 'text-right' : 'text-left'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className={`p-2.5 border-t flex gap-2 ${
                      isDark ? 'border-zinc-800 bg-zinc-950/80' : 'border-stone-200 bg-stone-50'
                    }`}>
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`ส่งข้อความหา ${selectedFriend}...`}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-stone-300 text-stone-800'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold transition-all shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ) : (
                  // Friends List Selection
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {friendsList.length === 0 ? (
                      <div className="text-center py-12 text-xs text-zinc-400 space-y-2">
                        <Users className="w-10 h-10 text-amber-500/40 mx-auto" />
                        <p className="font-bold text-zinc-300">ยังไม่มีเพื่อนในลิสต์เลย</p>
                        <p className="text-[11px]">ไปที่แถบ "แอดเพื่อน" เพื่อส่งคำขอเป็นเพื่อนกับนักเรียนคนอื่นได้เลย!</p>
                      </div>
                    ) : (
                      friendsList.map((friendName) => {
                        const friendProfile = supabaseSim.getProfile(friendName);
                        return (
                          <div
                            key={friendName}
                            onClick={() => setSelectedFriend(friendName)}
                            className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                              isDark
                                ? 'bg-zinc-800/40 border-zinc-700/60 hover:bg-zinc-800 hover:border-amber-400/40'
                                : 'bg-stone-50 border-stone-200 hover:bg-stone-100 hover:border-amber-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={friendProfile.avatar}
                                alt={friendName}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/30"
                              />
                              <div>
                                <h5 className="font-extrabold text-xs text-zinc-200">{friendName}</h5>
                                <p className="text-[10px] text-zinc-400 truncate max-w-[160px]">
                                  {friendProfile.bio}
                                </p>
                              </div>
                            </div>
                            <button className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 transition-colors">
                              เปิดแชท 💬
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: ADD FRIENDS & PENDING REQUESTS */}
            {activeTab === 'add' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Pending Friend Requests Section */}
                {friendRequests.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <h5 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      <span>คำขอเป็นเพื่อน ({friendRequests.length})</span>
                    </h5>
                    <div className="space-y-2">
                      {friendRequests.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs"
                        >
                          <span className="font-extrabold text-zinc-100">{req.fromUsername}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px]"
                            >
                              รับเป็นเพื่อน
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 font-bold text-[10px]"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อผู้ใช้เพื่อแอดเพื่อน..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-stone-50 border-stone-300 text-stone-800'
                    }`}
                  />
                </div>

                {/* List of Recommended / Search Users */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-zinc-400">รายชื่อผู้ใช้เตรียมสอบทั้งหมด</h5>
                  {allUsers.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">ไม่พบรายชื่อผู้ใช้นี้</p>
                  ) : (
                    allUsers
                      .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((u) => {
                        const uProfile = supabaseSim.getProfile(u.username);
                        return (
                          <div
                            key={u.username}
                            className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                              isDark ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-stone-50 border-stone-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={uProfile.avatar}
                                alt={u.username}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/30"
                              />
                              <div>
                                <h6 className="font-bold text-xs text-zinc-200">{u.username}</h6>
                                <p className="text-[10px] text-zinc-400">{uProfile.bio}</p>
                              </div>
                            </div>

                            {u.isFriend ? (
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                เป็นเพื่อนแล้ว
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendFriendRequest(u.username)}
                                className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all flex items-center gap-1 active:scale-95"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>แอดเพื่อน</span>
                              </button>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
