import { supabase } from '../lib/supabase';

/**
 * Generate a random 6-character session code
 */
function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a unique participant ID
 */
function generateParticipantId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new group filter session
 * @param {object} initialFilters - The initial filter state
 * @returns {Promise<{session: object, participantId: string}>}
 */
export async function createSession(initialFilters = {}) {
  const sessionCode = generateSessionCode();

  // Default filters matching App.jsx structure
  const defaultFilters = {
    minYear: "",
    maxYear: "",
    minRating: "",
    maxRating: "",
    minRuntime: "",
    maxRuntime: "",
    director: "",
    genres: [],
    languages: [],
    tropes: []
  };

  const filters = { ...defaultFilters, ...initialFilters };

  // Create session (expires in 2 hours by default)
  const { data: session, error: sessionError } = await supabase
    .from('filter_sessions')
    .insert({
      session_code: sessionCode,
      current_filters: filters,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    })
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Failed to create session: ${sessionError.message}`);
  }

  // Add creator as first participant
  const participantId = generateParticipantId();
  const { error: participantError } = await supabase
    .from('session_participants')
    .insert({
      id: participantId,
      session_code: sessionCode,
      display_name: 'Host',
      is_host: true,
      joined_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    });

  if (participantError) {
    // Rollback: delete the session if participant creation fails
    await supabase.from('filter_sessions').delete().eq('id', session.id);
    throw new Error(`Failed to add host participant: ${participantError.message}`);
  }

  return { session, participantId };
}

/**
 * Join an existing session
 * @param {string} sessionCode - The session code to join
 * @param {string} displayName - Optional display name for the participant
 * @returns {Promise<{session: object, participantId: string}>}
 */
export async function joinSession(sessionCode, displayName = 'Guest') {
  // Check if session exists and is active
  const { data: session, error: sessionError } = await supabase
    .from('filter_sessions')
    .select('*')
    .eq('session_code', sessionCode.toUpperCase())
    .eq('is_active', true)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found or inactive');
  }

  // Check if session has expired
  if (session.expires_at && new Date(session.expires_at) < new Date()) {
    throw new Error('Session has expired');
  }

  // Add participant
  const participantId = generateParticipantId();
  const { error: participantError } = await supabase
    .from('session_participants')
    .insert({
      id: participantId,
      session_code: sessionCode.toUpperCase(),
      display_name: displayName,
      is_host: false,
      joined_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    });

  if (participantError) {
    throw new Error(`Failed to join session: ${participantError.message}`);
  }

  return { session, participantId };
}

/**
 * Update the current filters for a session
 * @param {string} sessionCode - The session code
 * @param {object} filters - The new filter state
 */
export async function updateSessionFilters(sessionCode, filters) {
  const { error } = await supabase
    .from('filter_sessions')
    .update({
      current_filters: filters,
      updated_at: new Date().toISOString()
    })
    .eq('session_code', sessionCode);

  if (error) {
    throw new Error(`Failed to update filters: ${error.message}`);
  }
}

/**
 * Update participant's last seen timestamp
 * @param {string} participantId - The participant ID
 */
export async function updateParticipantLastSeen(participantId) {
  const { error } = await supabase
    .from('session_participants')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', participantId);

  if (error) {
    console.error('Failed to update last seen:', error);
  }
}

/**
 * Get all participants for a session
 * @param {string} sessionCode - The session code
 * @returns {Promise<Array>}
 */
export async function getSessionParticipants(sessionCode) {
  const { data, error } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_code', sessionCode)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get participants: ${error.message}`);
  }

  return data || [];
}

/**
 * Leave a session (remove participant)
 * Handles host transfer and session cleanup automatically
 * @param {string} participantId - The participant ID to remove
 */
export async function leaveSession(participantId) {
  // Get participant info to check if they're host
  const { data: participant, error: getError } = await supabase
    .from('session_participants')
    .select('session_code, is_host')
    .eq('id', participantId)
    .single();

  if (getError) {
    throw new Error(`Failed to get participant info: ${getError.message}`);
  }

  const sessionCode = participant.session_code;
  const wasHost = participant.is_host;

  // Delete the participant
  const { error: deleteError } = await supabase
    .from('session_participants')
    .delete()
    .eq('id', participantId);

  if (deleteError) {
    throw new Error(`Failed to leave session: ${deleteError.message}`);
  }

  // Get remaining participants
  const { data: remainingParticipants, error: participantsError } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_code', sessionCode)
    .order('joined_at', { ascending: true });

  if (participantsError) {
    throw new Error(`Failed to get remaining participants: ${participantsError.message}`);
  }

  // If no participants left, close the session
  if (!remainingParticipants || remainingParticipants.length === 0) {
    await endSession(sessionCode);
    console.log('🔒 Session closed - no participants remaining');
    return;
  }

  // If the leaving participant was host, transfer to next oldest participant
  if (wasHost) {
    const newHost = remainingParticipants[0]; // Oldest remaining participant
    const { error: transferError } = await supabase
      .from('session_participants')
      .update({ is_host: true })
      .eq('id', newHost.id);

    if (transferError) {
      console.error('Failed to transfer host:', transferError);
    } else {
      console.log(`👑 Host transferred to ${newHost.display_name}`);
    }
  }
}

/**
 * End a session (host only - marks as inactive)
 * @param {string} sessionCode - The session code
 */
export async function endSession(sessionCode) {
  const { error } = await supabase
    .from('filter_sessions')
    .update({ is_active: false })
    .eq('session_code', sessionCode);

  if (error) {
    throw new Error(`Failed to end session: ${error.message}`);
  }
}

/**
 * Get current session data
 * @param {string} sessionCode - The session code
 * @returns {Promise<object>}
 */
export async function getSession(sessionCode) {
  const { data, error } = await supabase
    .from('filter_sessions')
    .select('*')
    .eq('session_code', sessionCode)
    .single();

  if (error) {
    throw new Error(`Failed to get session: ${error.message}`);
  }

  return data;
}

/**
 * Subscribe to filter changes in a session
 * @param {string} sessionCode - The session code
 * @param {function} callback - Callback when filters change
 * @returns {object} Subscription object with unsubscribe method
 */
export function subscribeToSessionFilters(sessionCode, callback) {
  const subscription = supabase
    .channel(`session:${sessionCode}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'filter_sessions',
        filter: `session_code=eq.${sessionCode}`
      },
      (payload) => {
        console.log('🔄 Filter update received:', payload.new.current_filters);
        callback(payload.new.current_filters);
      }
    )
    .subscribe((status) => {
      console.log(`📡 Filter subscription status for ${sessionCode}:`, status);
    });

  return subscription;
}

/**
 * Subscribe to participant changes in a session
 * @param {string} sessionCode - The session code
 * @param {function} callback - Callback when participants change
 * @returns {object} Subscription object with unsubscribe method
 */
export function subscribeToSessionParticipants(sessionCode, callback) {
  const subscription = supabase
    .channel(`participants:${sessionCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'session_participants',
        filter: `session_code=eq.${sessionCode}`
      },
      async (payload) => {
        console.log('👥 Participant change received:', payload);
        // Fetch updated participant list
        const participants = await getSessionParticipants(sessionCode);
        callback(participants);
      }
    )
    .subscribe((status) => {
      console.log(`📡 Participant subscription status for ${sessionCode}:`, status);
    });

  return subscription;
}
