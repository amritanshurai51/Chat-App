import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import './ChatPage.css';

export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const loadRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
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
  };

  return (
    <div className="chat-layout">
      <Sidebar
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        onRoomCreated={handleRoomCreated}
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
