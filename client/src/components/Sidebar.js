import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import './Sidebar.css';

export default function Sidebar({ rooms, selectedRoom, onSelectRoom, onRoomCreated }) {
  const { user, logout } = useAuth();
  const { onlineUsers, connected } = useSocket();
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await axios.post('/api/rooms', newRoom);
      onRoomCreated(res.data);
      setNewRoom({ name: '', description: '' });
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name) => name?.slice(0, 2).toUpperCase() || '??';

  return (
    <aside className="sidebar">
      {/* User profile */}
      <div className="sidebar-profile">
        <div className="avatar">{getInitials(user?.username)}</div>
        <div className="profile-info">
          <span className="profile-name">{user?.username}</span>
          <span className={`profile-status ${connected ? 'online' : 'offline'}`}>
            {connected ? 'Online' : 'Connecting...'}
          </span>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
      </div>

      {/* Rooms header */}
      <div className="sidebar-section-header">
        <span>Rooms</span>
        <button className="add-room-btn" onClick={() => setShowCreate(!showCreate)}>+</button>
      </div>

      {/* Create room form */}
      {showCreate && (
        <form className="create-room-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Room name"
            value={newRoom.name}
            onChange={e => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
            maxLength={50}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newRoom.description}
            onChange={e => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
            maxLength={200}
          />
          {error && <p className="create-error">{error}</p>}
          <div className="create-actions">
            <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="create-submit" disabled={creating}>
              {creating ? '...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Room list */}
      <div className="room-list">
        {rooms.length === 0 && (
          <p className="no-rooms">No rooms yet. Create one!</p>
        )}
        {rooms.map(room => (
          <button
            key={room._id}
            className={`room-item ${selectedRoom?._id === room._id ? 'active' : ''}`}
            onClick={() => onSelectRoom(room)}
          >
            <span className="room-hash">#</span>
            <div className="room-info">
              <span className="room-name">{room.name}</span>
              {room.description && (
                <span className="room-desc">{room.description}</span>
              )}
            </div>
            <span className="room-members">{room.members?.length || 0}</span>
          </button>
        ))}
      </div>

      {/* Online users */}
      <div className="sidebar-footer">
        <div className="online-count">
          <span className="online-dot" />
          {onlineUsers.length} online
        </div>
      </div>
    </aside>
  );
}
