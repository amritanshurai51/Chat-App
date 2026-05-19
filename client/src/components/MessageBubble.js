import './MessageBubble.css';

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name) => name?.slice(0, 2).toUpperCase() || '??';

const getAvatarColor = (name) => {
  const colors = ['#6c63ff', '#00bfa5', '#ff5c8a', '#ff9800', '#3f9eff', '#b45aff'];
  const i = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[i];
};

export default function MessageBubble({ message, isOwn, showHeader }) {
  if (message.type === 'system') {
    return (
      <div className="system-message">
        <span>{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`message-row ${isOwn ? 'own' : ''}`}>
      {!isOwn && (
        <div
          className="msg-avatar"
          style={{
            background: getAvatarColor(message.sender?.username)
          }}
        >
          {getInitials(message.sender?.username)}
        </div>
      )}
      <div className="message-body">
        {showHeader && !isOwn && (
          <div className="message-header">
            <span className="msg-username" style={{ color: getAvatarColor(message.sender?.username) }}>
              {message.sender?.username}
            </span>
            <span className="msg-time">{formatTime(message.createdAt)}</span>
          </div>
        )}
        <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
          {message.content}
        </div>
        {showHeader && isOwn && (
          <div className="message-header own-header">
            <span className="msg-time">{formatTime(message.createdAt)}</span>
          </div>
        )}
      </div>
      {isOwn && (
        <div
          className="msg-avatar"
          style={{
            background: getAvatarColor(message.sender?.username)
          }}
        >
          {getInitials(message.sender?.username)}
        </div>
      )}
    </div>
  );
}
