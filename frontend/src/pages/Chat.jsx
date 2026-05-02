import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api.config';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE = 'http://localhost:4000/api';

export default function Chat() {
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchRooms();
      connectWebSocket();
    }
    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [user]);

  useEffect(() => {
    if (user && locationState?.recipientId) {
      startNewChat(locationState.recipientId);
    }
  }, [user, locationState]);

  const startNewChat = async (recipientId) => {
    try {
      const res = await apiClient.get(`/chat/rooms/${user.id}/${recipientId}`);
      const room = res.data;
      setActiveRoom(room);
      fetchRooms(); // Update sidebar
    } catch (err) {
      console.error("Error starting new chat", err);
    }
  };

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
    }
  }, [activeRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await apiClient.get(`/chat/rooms/${user.id}`);
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms", err);
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
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to WebSocket');
        // Subscribe to user-specific queue for new message notifications
        client.subscribe(`/user/${user.id}/queue/messages`, (msg) => {
          const receivedMsg = JSON.parse(msg.body);
          if (activeRoom && receivedMsg.chatRoom.id === activeRoom.id) {
            setMessages(prev => [...prev, receivedMsg]);
          }
          fetchRooms(); // Refresh room list to show latest message
        });
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

    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    });

    setNewMessage('');
  };

  const getOtherUser = (room) => {
    return room.user1.id === user.id ? room.user2 : room.user1;
  };

  if (!user) return <div className="p-20 text-center">Please sign in to chat.</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r bg-white flex flex-col shadow-sm z-10">
        <div className="p-6 border-b bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-grow overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No conversations yet.</div>
          ) : (
            rooms.map(room => {
              const otherUser = getOtherUser(room);
              return (
                <div 
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-4 border-b cursor-pointer transition-all hover:bg-indigo-50 flex items-center gap-4 ${activeRoom?.id === room.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img src={otherUser.profilePictureUrl || 'https://via.placeholder.com/150'} alt={otherUser.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-gray-900">{otherUser.fullName}</h3>
                    </div>
                  </div>
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
            <div className="p-4 border-b flex items-center gap-4 bg-white shadow-sm z-10">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                <img src={getOtherUser(activeRoom).profilePictureUrl || 'https://via.placeholder.com/150'} alt="Recipient" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg">{getOtherUser(activeRoom).fullName}</h2>
            </div>
            
            <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto bg-[#f8fafc] space-y-4">
              {messages.map((msg, i) => {
                const isMine = msg.sender.id === user.id;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                      isMine 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className={`text-[10px] mt-1 block opacity-70 ${isMine ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-5 py-3 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
