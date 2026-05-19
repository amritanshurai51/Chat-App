import { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import './ChatPage.css';

export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
      // Select first room by default
      if (res.data.length > 0 && !selectedRoom) {
        setSelectedRoom(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load rooms', err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleRoomCreated = (room) => {
    setRooms(prev => [room, ...prev]);
    setSelectedRoom(room);
    setSidebarOpen(false);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSidebarOpen(false);
  };

  return (
    <div className="chat-layout">
      <button
        className="mobile-sidebar-toggle"
        type="button"
        onClick={() => setSidebarOpen(true)}
      >
        Rooms
      </button>
      {sidebarOpen && (
        <button
          className="mobile-sidebar-backdrop"
          type="button"
          aria-label="Close rooms panel"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={handleSelectRoom}
        onRoomCreated={handleRoomCreated}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="chat-main">
        {selectedRoom ? (
          <ChatWindow room={selectedRoom} />
        ) : (
          <div className="no-room">
            <div className="no-room-icon">💬</div>
            <h2>Welcome to ChatWave</h2>
            <p>Select a room or create one to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
