import { useState, useEffect } from 'react';
import { X, Users, Copy, Check, LogOut, XCircle, Clock, Filter } from 'lucide-react';

export default function GroupSessionModal({
  isOpen,
  onClose,
  activeSession,
  participants = [],
  currentFilters,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onEndSession
}) {
  const [view, setView] = useState('main'); // 'main', 'create', 'join', 'active'
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset view when session state changes
  useEffect(() => {
    if (!activeSession) {
      setView('main');
    }
  }, [activeSession]);

  if (!isOpen) return null;

  const isHost = participants.find(p => p.is_host && p.id === activeSession?.participantId);

  const handleCopyCode = async () => {
    if (activeSession?.session?.session_code) {
      await navigator.clipboard.writeText(activeSession.session.session_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateSession = async () => {
    setLoading(true);
    setError('');
    try {
      await onCreateSession();
      setView('active');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a session code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onJoinSession(joinCode.trim().toUpperCase(), displayName || 'Guest');
      setView('active');
      setJoinCode('');
      setDisplayName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSession = async () => {
    if (confirm('Are you sure you want to leave this session?')) {
      await onLeaveSession();
      onClose();
    }
  };

  const handleEndSession = async () => {
    if (confirm('Are you sure you want to end this session for everyone?')) {
      await onEndSession();
      onClose();
    }
  };

  const getActiveFilterCount = () => {
    if (!currentFilters) return 0;
    return Object.entries(currentFilters).reduce((count, [, v]) => {
      if (Array.isArray(v)) return count + (v.length ? 1 : 0);
      return count + (v !== "" ? 1 : 0);
    }, 0);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="w-full max-w-md rounded-lg shadow-2xl" style={{ backgroundColor: '#2B2B2B' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#3B3B3B' }}>
          <div className="flex items-center gap-2">
            <Users size={24} style={{ color: '#EFDB00' }} />
            <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              {activeSession ? 'Active Session' : 'Group Session'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70"
            style={{ color: '#999999' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: '#3B3B3B', borderColor: '#FF4444', color: '#FF4444' }}>
              {error}
            </div>
          )}

          {/* Active Session View */}
          {activeSession && (
            <div className="space-y-4">
              {/* Session Code */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1C1C1C' }}>
                <div className="text-sm mb-2" style={{ color: '#999999' }}>Session Code</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-mono font-bold tracking-wider" style={{ color: '#EFDB00' }}>
                    {activeSession.session?.session_code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded hover:opacity-70 transition-opacity"
                    style={{ backgroundColor: '#3B3B3B', color: '#FFFFFF' }}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* Current Filters Summary */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1C1C1C' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Filter size={16} style={{ color: '#EFDB00' }} />
                  <div className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                    Active Filters
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: '#EFDB00' }}>
                  {getActiveFilterCount()}
                </div>
                {getActiveFilterCount() > 0 && currentFilters && (
                  <div className="mt-2 text-sm space-y-1" style={{ color: '#999999' }}>
                    {currentFilters.genres?.length > 0 && (
                      <div>Genres: {currentFilters.genres.length}</div>
                    )}
                    {currentFilters.tropes?.length > 0 && (
                      <div>Tropes: {currentFilters.tropes.length}</div>
                    )}
                    {currentFilters.languages?.length > 0 && (
                      <div>Languages: {currentFilters.languages.length}</div>
                    )}
                    {(currentFilters.minYear || currentFilters.maxYear) && (
                      <div>Year: {currentFilters.minYear || '?'} - {currentFilters.maxYear || '?'}</div>
                    )}
                    {(currentFilters.minRating || currentFilters.maxRating) && (
                      <div>Rating: {currentFilters.minRating || '?'} - {currentFilters.maxRating || '?'}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Participants List */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1C1C1C' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} style={{ color: '#EFDB00' }} />
                  <div className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                    Participants ({participants.length})
                  </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded"
                      style={{ backgroundColor: '#2B2B2B' }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: participant.last_seen_at &&
                              new Date() - new Date(participant.last_seen_at) < 30000
                              ? '#00FF00'
                              : '#666666'
                          }}
                        />
                        <span style={{ color: '#FFFFFF' }}>
                          {participant.display_name}
                          {participant.is_host && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}>
                              Host
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: '#999999' }}>
                        <Clock size={12} />
                        {formatTimestamp(participant.joined_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {participants.length > 1 && (
                  <button
                    onClick={handleLeaveSession}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#3B3B3B', color: '#FFFFFF' }}
                  >
                    <LogOut size={18} />
                    Leave Session
                  </button>
                )}
                {(isHost || participants.length === 1) && (
                  <button
                    onClick={handleEndSession}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity ${participants.length === 1 ? 'flex-1' : ''}`}
                    style={{ backgroundColor: '#FF4444', color: '#FFFFFF' }}
                  >
                    <XCircle size={18} />
                    End
                  </button>
                )}
              </div>
            </div>
          )}

          {/* No Active Session View */}
          {!activeSession && view === 'main' && (
            <div className="space-y-3">
              <button
                onClick={() => setView('create')}
                className="w-full p-4 rounded-lg text-left hover:opacity-80 transition-opacity"
                style={{ backgroundColor: '#1C1C1C', color: '#FFFFFF' }}
              >
                <div className="font-semibold mb-1">Create New Session</div>
                <div className="text-sm" style={{ color: '#999999' }}>
                  Start a collaborative filtering session and invite others
                </div>
              </button>

              <button
                onClick={() => setView('join')}
                className="w-full p-4 rounded-lg text-left hover:opacity-80 transition-opacity"
                style={{ backgroundColor: '#1C1C1C', color: '#FFFFFF' }}
              >
                <div className="font-semibold mb-1">Join Existing Session</div>
                <div className="text-sm" style={{ color: '#999999' }}>
                  Enter a session code to join a group
                </div>
              </button>
            </div>
          )}

          {/* Create Session View */}
          {!activeSession && view === 'create' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1C1C1C', color: '#999999' }}>
                <p className="mb-2">
                  Create a new collaborative filtering session. Your current filters will be shared with all participants.
                </p>
                <p className="text-sm">
                  You'll receive a shareable code that others can use to join.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setView('main')}
                  className="flex-1 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#3B3B3B', color: '#FFFFFF' }}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </div>
          )}

          {/* Join Session View */}
          {!activeSession && view === 'join' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                  Session Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-2 rounded-lg font-mono text-lg tracking-wider uppercase"
                  style={{
                    backgroundColor: '#1C1C1C',
                    color: '#EFDB00',
                    border: '1px solid #3B3B3B'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                  Your Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Guest"
                  maxLength={20}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: '#1C1C1C',
                    color: '#FFFFFF',
                    border: '1px solid #3B3B3B'
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setView('main');
                    setJoinCode('');
                    setDisplayName('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#3B3B3B', color: '#FFFFFF' }}
                >
                  Back
                </button>
                <button
                  onClick={handleJoinSession}
                  disabled={loading || !joinCode.trim()}
                  className="flex-1 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}
                >
                  {loading ? 'Joining...' : 'Join Session'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
