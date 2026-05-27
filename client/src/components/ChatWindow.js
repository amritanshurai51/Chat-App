import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

const EMOJI_OPTIONS = [
  '😀', '😂', '😊', '😍', '🥳', '😎',
  '🤔', '😭', '😡', '👍', '👏', '🙏',
  '🔥', '🎉', '❤️', '💯', '😅', '🤝'
];

export default function ChatWindow({ room }) {
  const { user } = useAuth();
  const { messages, typingUsers, loading, sendMessage, deleteMessage, handleTyping } = useChat(room._id);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!showEmojiPicker) return undefined;

    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setInput((current) => `${current}${emoji}`);
      setShowEmojiPicker(false);
      return;
    }

    const start = textarea.selectionStart ?? input.length;
    const end = textarea.selectionEnd ?? input.length;
    const nextValue = `${input.slice(0, start)}${emoji}${input.slice(end)}`;

    setInput(nextValue);
    handleTyping();
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPosition = start + emoji.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-room-hash">#</span>
          <div>
            <h2 className="chat-room-name">{room.name}</h2>
            {room.description && (
              <p className="chat-room-desc">{room.description}</p>
            )}
          </div>
        </div>
        <div className="chat-header-right">
          <span className="member-count">👥 {room.members?.length || 0} members</span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {loading && (
          <div className="messages-loading">Loading messages...</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="messages-empty">
            <div className="messages-empty-icon">👋</div>
            <p>This is the beginning of <strong>#{room.name}</strong></p>
            <p className="messages-empty-sub">Say hello!</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const isFirstInGroup =
            !prevMsg ||
            prevMsg.sender?._id !== msg.sender?._id ||
            new Date(msg.createdAt) - new Date(prevMsg.createdAt) > 5 * 60 * 1000;

          return (
            <MessageBubble
              key={msg._id || idx}
              message={msg}
              isOwn={msg.sender?._id === user._id}
              showHeader={isFirstInGroup}
              onDelete={deleteMessage}
            />
          );
        })}
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <span className="typing-dots">
              <span /><span /><span />
            </span>
            <span className="typing-text">
              {typingUsers.map(u => u.username).join(', ')}{' '}
              {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSend}>
        <div className="chat-input-wrapper">
          <div className="emoji-picker-container" ref={emojiPickerRef}>
            <button
              type="button"
              className={`emoji-toggle-btn ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => setShowEmojiPicker((current) => !current)}
              aria-label="Open emoji picker"
              aria-expanded={showEmojiPicker}
            >
              🙂
            </button>

            {showEmojiPicker && (
              <div className="emoji-picker" role="dialog" aria-label="Emoji picker">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-option"
                    onClick={() => insertEmoji(emoji)}
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            className="chat-input"
            value={input}
            onChange={e => { setInput(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${room.name}`}
            rows={1}
            maxLength={2000}
          />
          <button type="submit" className="send-btn" disabled={!input.trim()}>
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
