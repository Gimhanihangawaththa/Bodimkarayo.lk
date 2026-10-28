import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api.config';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE = 'http://localhost:4000/api';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetRecipientId = 
    searchParams.get('userId') || 
    searchParams.get('userid') || 
    searchParams.get('recipientId') || 
    location.state?.recipientId;

  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const scrollRef = useRef(null);
  const activeRoomRef = useRef(activeRoom);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const getOtherUser = (room) => {
    if (!room) return { fullName: 'User', profilePictureUrl: null };
    const r = room.chatRoom || room;
    if (!r.user1 || !r.user2) return { fullName: 'User', profilePictureUrl: null };
    return String(r.user1.id) === String(user?.id) ? r.user2 : r.user1;
  };

  useEffect(() => {
    if (user?.id) {
      fetchRooms();
      connectWebSocket();
    }
    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && targetRecipientId && String(targetRecipientId) !== String(user.id)) {
      const currentOther = activeRoomRef.current ? getOtherUser(activeRoomRef.current) : null;
      if (!activeRoomRef.current || String(currentOther?.id) !== String(targetRecipientId)) {
        startNewChat(targetRecipientId);
      }
    }
  }, [user?.id, targetRecipientId]);

  const startNewChat = async (recipientId) => {
    if (!user?.id || !recipientId) return;
    try {
      const res = await apiClient.get(`/chat/rooms/${user.id}/${recipientId}`);
      const room = res.data;
      if (room) {
        setActiveRoom(room);
        const roomsRes = await apiClient.get(`/chat/rooms/${user.id}`);
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
      }
    } catch (err) {
      console.error("Error starting new chat", err);
    }
  };

  useEffect(() => {
    if (activeRoom?.id) {
      fetchMessages(activeRoom.id);
      markAsRead(activeRoom.id);
    }
  }, [activeRoom?.id]);

  const markAsRead = async (roomId) => {
    if (!user?.id || !roomId) return;
    try {
      await apiClient.post(`/chat/mark-read/${roomId}/${user.id}`);
      const res = await apiClient.get(`/chat/rooms/${user.id}`);
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchRooms = async () => {
    if (!user?.id) return;
    try {
      const res = await apiClient.get(`/chat/rooms/${user.id}`);
      const roomsData = Array.isArray(res.data) ? res.data : [];
      setRooms(roomsData);

      setActiveRoom(prev => {
        if (prev) {
          const match = roomsData.find(rd => {
            const r = rd.chatRoom || rd;
            return r.id === prev.id;
          });
          return match ? (match.chatRoom || match) : prev;
        }

        if (targetRecipientId) {
          const found = roomsData.find(rd => {
            const r = rd.chatRoom || rd;
            return (
              (String(r.user1?.id) === String(user.id) && String(r.user2?.id) === String(targetRecipientId)) ||
              (String(r.user2?.id) === String(user.id) && String(r.user1?.id) === String(targetRecipientId))
            );
          });
          if (found) return found.chatRoom || found;
        }

        if (roomsData.length > 0) {
          return roomsData[0].chatRoom || roomsData[0];
        }

        return null;
      });
    } catch (err) {
      console.error("Error fetching rooms", err);
    }
  };

  const handleSelectRoom = (roomData) => {
    const room = roomData.chatRoom || roomData;
    setActiveRoom(room);
    const other = getOtherUser(room);
    if (other?.id) {
      navigate(`/chat?userId=${other.id}`, { replace: true });
    }
  };

  const handleDeleteRoom = async (roomId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation? All messages will be permanently removed.")) {
      return;
    }
    try {
      await apiClient.delete(`/chat/rooms/${roomId}`);
      if (activeRoom?.id === roomId) {
        setActiveRoom(null);
        navigate('/chat', { replace: true });
      }
      fetchRooms();
    } catch (err) {
      console.error("Error deleting chat room", err);
      alert("Failed to delete conversation.");
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const res = await apiClient.get(`/chat/messages/${roomId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:4000/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      onConnect: () => {
        console.log('Connected to WebSocket SUCCESSFULLY');
        client.subscribe(`/topic/messages.${user.id}`, (msg) => {
          console.log('Received message via WebSocket topic:', msg.body);
          const receivedMsg = JSON.parse(msg.body);
          if (activeRoomRef.current && String(receivedMsg.chatRoom?.id) === String(activeRoomRef.current.id)) {
            setMessages(prev => {
              if (prev.some(m => m.id === receivedMsg.id)) return prev;
              return [...prev.filter(m => !(m.sender?.id === user?.id && m.content === receivedMsg.content && typeof m.id === 'number' && m.id > 1000000000000)), receivedMsg];
            });
          }
          // Refresh room list for latest messages / unread counts
          apiClient.get(`/chat/rooms/${user.id}`).then(res => {
            setRooms(Array.isArray(res.data) ? res.data : []);
          }).catch(console.error);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });
    client.activate();
    setStompClient(client);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !stompClient) return;

    const payload = {
      roomId: activeRoom.id,
      senderId: user.id,
      content: newMessage,
    };

    // Optimistic update
    const tempMsg = {
      ...payload,
      sender: user,
      timestamp: new Date().toISOString(),
      id: Date.now() // temporary ID
    };
    setMessages(prev => [...prev, tempMsg]);

    console.log('Sending message:', payload);
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    });
    console.log('Message published to destination /app/chat.sendMessage');

    setNewMessage('');
    setTimeout(() => {
      fetchRooms();
    }, 300);
  };

  if (!user) return <div className="p-20 text-center">Please sign in to chat.</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-80 md:w-96 border-r border-slate-200/80 bg-white flex flex-col shadow-xs z-10 shrink-0">
        <div className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-[#3488c3] to-[#2978b3] text-white shadow-xs">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <p className="text-xs text-blue-100 font-medium mt-0.5">Your conversations & flatmate chats</p>
        </div>
        <div className="flex-grow overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                💬
              </div>
              <p className="text-sm font-semibold text-slate-600">No conversations yet</p>
              <p className="text-xs text-slate-400">Start chatting by contacting a landlord or roommate post.</p>
            </div>
          ) : (
            rooms.map(roomData => {
              const room = roomData.chatRoom || roomData;
              const unreadCount = roomData.unreadCount || 0;
              const otherUser = getOtherUser(room);
              const isActive = activeRoom?.id === room.id;
              return (
                <div 
                  key={room.id}
                  onClick={() => handleSelectRoom(roomData)}
                  className={`group p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-blue-50/50 flex items-center gap-3.5 ${
                    isActive ? 'bg-[#3488c3]/10 border-l-4 border-l-[#3488c3]' : ''
                  }`}
                >
                  <div className="w-11 h-11 bg-slate-200 rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <img src={otherUser.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={otherUser.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{otherUser.fullName}</h3>
                      {unreadCount > 0 && (
                        <span className="bg-[#3488c3] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">Click to view conversation</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteRoom(room.id, e)}
                    title="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-grow flex flex-col bg-white">
        {activeRoom ? (
          <>
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white shadow-xs z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img src={getOtherUser(activeRoom).profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="Recipient" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight">{getOtherUser(activeRoom).fullName}</h2>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Now
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDeleteRoom(activeRoom.id, e)}
                title="Delete this conversation"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/70 hover:border-rose-300 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Chat</span>
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto bg-slate-50/70 space-y-4">
              {messages.map((msg, i) => {
                const isMine = msg.sender.id === user.id;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-xs ${
                      isMine 
                        ? 'bg-[#3488c3] text-white rounded-br-none' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className={`text-[10px] mt-1.5 block opacity-80 font-medium ${isMine ? 'text-right text-blue-100' : 'text-left text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 bg-white flex gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-3 rounded-xl bg-slate-100/80 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#3488c3]/20 focus:border-[#3488c3] outline-none transition-all text-sm font-medium text-slate-800"
              />
              <button 
                type="submit"
                className="bg-[#3488c3] hover:bg-[#2978b3] text-white p-3 rounded-xl shadow-md shadow-[#3488c3]/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-[#3488c3]/10 text-[#3488c3] rounded-full flex items-center justify-center shadow-xs">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {rooms.length > 0 ? "Select a conversation to start chatting" : "No active conversations yet"}
              </p>
              <p className="text-sm text-slate-500 font-medium mt-1 max-w-md mx-auto">
                {rooms.length > 0 
                  ? "Pick a conversation from the left sidebar to send and receive messages."
                  : "Connect with flatmates or boarding landlords to start a live conversation."}
              </p>
              {rooms.length === 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                  <button 
                    type="button"
                    onClick={() => navigate('/roommates')} 
                    className="px-5 py-2.5 bg-[#3488c3] hover:bg-[#2978b3] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#3488c3]/20 cursor-pointer"
                  >
                    Find Roommates
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate('/properties')} 
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Browse Properties
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
