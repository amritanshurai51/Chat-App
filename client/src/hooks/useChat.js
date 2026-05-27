import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export const useChat = (roomId) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Load message history
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    api.get(`/messages/${roomId}`)
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId]);

  // Socket events
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('join_room', { roomId });

    const onMessage = (msg) => setMessages(prev => [...prev, msg]);
    const onSystem = (msg) => setMessages(prev => [...prev, msg]);
    const onDeleteMessage = ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };
    const onTypingStart = ({ userId, username }) => {
      if (userId === user._id) return;
      setTypingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, username }]);
    };
    const onTypingStop = ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    };

    socket.on('receive_message', onMessage);
    socket.on('system_message', onSystem);
    socket.on('message_deleted', onDeleteMessage);
    socket.on('user_typing', onTypingStart);
    socket.on('user_stop_typing', onTypingStop);

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('receive_message', onMessage);
      socket.off('system_message', onSystem);
      socket.off('message_deleted', onDeleteMessage);
      socket.off('user_typing', onTypingStart);
      socket.off('user_stop_typing', onTypingStop);
      setMessages([]);
      setTypingUsers([]);
    };
  }, [socket, roomId, user._id]);

  const sendMessage = useCallback((content) => {
    if (!socket || !content.trim()) return;
    socket.emit('send_message', { roomId, content });
    // Stop typing
    socket.emit('typing_stop', { roomId });
    clearTimeout(typingTimeoutRef.current);
  }, [socket, roomId]);

  const deleteMessage = useCallback((messageId) => {
    if (!socket || !messageId) return;
    socket.emit('delete_message', { roomId, messageId });
  }, [socket, roomId]);

  const handleTyping = useCallback(() => {
    if (!socket) return;
    socket.emit('typing_start', { roomId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId });
    }, 2000);
  }, [socket, roomId]);

  return { messages, typingUsers, loading, sendMessage, deleteMessage, handleTyping };
};
