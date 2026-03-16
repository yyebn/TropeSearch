import { useState } from 'react';
import { Users } from 'lucide-react';
import GroupSessionModal from './GroupSessionModal';

export default function GroupSessionButton({
  activeSession,
  participants,
  currentFilters,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onEndSession
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-80 active:opacity-60 relative"
        style={{
          backgroundColor: activeSession ? '#EFDB00' : '#3B3B3B',
          color: activeSession ? '#1C1C1C' : '#EFDB00'
        }}
        aria-label="Group Session"
      >
        <Users size={20} />
        {activeSession && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#00FF00' }} />
        )}
        {activeSession && participants?.length > 0 && (
          <span className="text-sm font-semibold">
            {participants.length}
          </span>
        )}
      </button>

      <GroupSessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        activeSession={activeSession}
        participants={participants}
        currentFilters={currentFilters}
        onCreateSession={onCreateSession}
        onJoinSession={onJoinSession}
        onLeaveSession={onLeaveSession}
        onEndSession={onEndSession}
      />
    </>
  );
}
