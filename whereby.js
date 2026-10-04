// Whereby integration for NAVIAR CONSULT
// Manages video consultation rooms and meeting management

const config = require('./config');
const db = require('./db');

class Whereby {
  constructor() {
    this.apiKey = process.env.WHEREBY_API_KEY || 'test_whereby_key';
    this.baseUrl = 'https://api.whereby.com';
    this.enabled = process.env.ENABLE_WHEREBY !== 'false';
  }

  async createMeetingRoom(consultationId, advisorId, clientId, options = {}) {
    try {
      const {
        roomName = 'NAVIAR Consultation',
        duration = 60,
        recordingEnabled = true,
        maxParticipants = 10
      } = options;

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (this.enabled) {
        // In production: POST /rooms to Whereby API
        // Requires: roomName, duration, recordingEnabled, maxParticipants
      }

      await db.execute(
        `INSERT INTO meeting_rooms
         (id, consultation_id, advisor_id, client_id, room_name, duration, recording_enabled, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [roomId, consultationId, advisorId, clientId, roomName, duration, recordingEnabled, 'created']
      );

      console.log(`[WHEREBY] Created meeting room ${roomId}`);

      return {
        success: true,
        roomId,
        roomName,
        duration,
        recordingEnabled,
        joinUrl: `${this.baseUrl}/rooms/${roomId}/join`,
        hostUrl: `${this.baseUrl}/rooms/${roomId}/host`
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to create room:', error);
      return { success: false, error: error.message };
    }
  }

  async startMeeting(roomId) {
    try {
      const room = await db.queryOne(
        'SELECT * FROM meeting_rooms WHERE id = $1',
        [roomId]
      );

      if (!room) {
        return { success: false, error: 'Meeting room not found' };
      }

      await db.execute(
        'UPDATE meeting_rooms SET status = $1, started_at = NOW() WHERE id = $2',
        ['active', roomId]
      );

      console.log(`[WHEREBY] Started meeting ${roomId}`);

      return {
        success: true,
        roomId,
        status: 'active',
        startedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to start meeting:', error);
      return { success: false, error: error.message };
    }
  }

  async endMeeting(roomId) {
    try {
      const room = await db.queryOne(
        'SELECT * FROM meeting_rooms WHERE id = $1',
        [roomId]
      );

      if (!room) {
        return { success: false, error: 'Meeting room not found' };
      }

      const duration = room.started_at
        ? Math.round((new Date() - new Date(room.started_at)) / 60000)
        : 0;

      await db.execute(
        'UPDATE meeting_rooms SET status = $1, ended_at = NOW(), actual_duration = $2 WHERE id = $3',
        ['ended', duration, roomId]
      );

      console.log(`[WHEREBY] Ended meeting ${roomId}`);

      return {
        success: true,
        roomId,
        status: 'ended',
        endedAt: new Date().toISOString(),
        actualDuration: duration
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to end meeting:', error);
      return { success: false, error: error.message };
    }
  }

  async getMeetingDetails(roomId) {
    try {
      const room = await db.queryOne(
        'SELECT * FROM meeting_rooms WHERE id = $1',
        [roomId]
      );

      if (!room) {
        return { success: false, error: 'Meeting room not found' };
      }

      return {
        success: true,
        room: {
          id: room.id,
          consultationId: room.consultation_id,
          advisorId: room.advisor_id,
          clientId: room.client_id,
          roomName: room.room_name,
          duration: room.duration,
          recordingEnabled: room.recording_enabled,
          status: room.status,
          createdAt: room.created_at,
          startedAt: room.started_at,
          endedAt: room.ended_at,
          actualDuration: room.actual_duration,
          joinUrl: `${this.baseUrl}/rooms/${room.id}/join`,
          hostUrl: `${this.baseUrl}/rooms/${room.id}/host`
        }
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to get meeting details:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecordings(roomId) {
    try {
      const room = await db.queryOne(
        'SELECT * FROM meeting_rooms WHERE id = $1',
        [roomId]
      );

      if (!room) {
        return { success: false, error: 'Meeting room not found' };
      }

      if (!room.recording_enabled) {
        return { success: true, recordings: [] };
      }

      const recordings = await db.queryMany(
        'SELECT * FROM meeting_recordings WHERE room_id = $1 ORDER BY created_at DESC',
        [roomId]
      );

      return {
        success: true,
        roomId,
        recordings: recordings.map(r => ({
          id: r.id,
          roomId: r.room_id,
          url: r.recording_url,
          duration: r.duration,
          fileSize: r.file_size,
          createdAt: r.created_at,
          accessible: r.accessible
        }))
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to get recordings:', error);
      return { success: false, error: error.message };
    }
  }

  async storeRecording(roomId, recordingUrl, duration, fileSize) {
    try {
      const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(
        `INSERT INTO meeting_recordings
         (id, room_id, recording_url, duration, file_size, accessible)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [recordingId, roomId, recordingUrl, duration, fileSize, true]
      );

      console.log(`[WHEREBY] Stored recording ${recordingId}`);

      return {
        success: true,
        recordingId,
        url: recordingUrl,
        duration,
        fileSize
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to store recording:', error);
      return { success: false, error: error.message };
    }
  }

  async generateAccessToken(roomId, userId, role = 'participant') {
    try {
      const room = await db.queryOne(
        'SELECT * FROM meeting_rooms WHERE id = $1',
        [roomId]
      );

      if (!room) {
        return { success: false, error: 'Meeting room not found' };
      }

      const validRoles = ['host', 'participant'];
      if (!validRoles.includes(role)) {
        return { success: false, error: 'Invalid role' };
      }

      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await db.execute(
        `INSERT INTO meeting_access_tokens
         (id, room_id, user_id, role, token, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [token, roomId, userId, role, token, expiresAt]
      );

      console.log(`[WHEREBY] Generated access token for ${roomId}`);

      return {
        success: true,
        token,
        roomId,
        role,
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to generate access token:', error);
      return { success: false, error: error.message };
    }
  }

  async getMeetingStats(consultationId) {
    try {
      const stats = await db.queryOne(
        `SELECT
          COUNT(*) as total_meetings,
          SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) as completed_meetings,
          AVG(actual_duration) as avg_duration,
          SUM(CASE WHEN recording_enabled = true THEN 1 ELSE 0 END) as recorded_meetings
         FROM meeting_rooms
         WHERE consultation_id = $1`,
        [consultationId]
      );

      const recordings = await db.queryOne(
        `SELECT
          COUNT(*) as total_recordings,
          SUM(file_size) as total_storage_bytes,
          SUM(duration) as total_recording_duration
         FROM meeting_recordings mr
         JOIN meeting_rooms mroom ON mr.room_id = mroom.id
         WHERE mroom.consultation_id = $1`,
        [consultationId]
      );

      return {
        success: true,
        consultationId,
        meetings: {
          total: stats.total_meetings || 0,
          completed: stats.completed_meetings || 0,
          averageDuration: Math.round(stats.avg_duration || 0),
          recorded: stats.recorded_meetings || 0
        },
        recordings: {
          total: recordings.total_recordings || 0,
          totalStorageMB: Math.round((recordings.total_storage_bytes || 0) / 1024 / 1024),
          totalDuration: Math.round((recordings.total_recording_duration || 0) / 60)
        }
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to get meeting stats:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyAccessToken(token, roomId) {
    try {
      const tokenRecord = await db.queryOne(
        'SELECT * FROM meeting_access_tokens WHERE token = $1 AND room_id = $2',
        [token, roomId]
      );

      if (!tokenRecord) {
        return { success: false, error: 'Invalid or expired token' };
      }

      if (new Date(tokenRecord.expires_at) < new Date()) {
        return { success: false, error: 'Token expired' };
      }

      return {
        success: true,
        valid: true,
        userId: tokenRecord.user_id,
        role: tokenRecord.role,
        expiresAt: tokenRecord.expires_at
      };
    } catch (error) {
      console.error('[WHEREBY] Failed to verify access token:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new Whereby();
