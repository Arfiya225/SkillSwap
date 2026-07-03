/* eslint-disable @typescript-eslint/no-unused-vars */
export interface MeetingProvider {
  createMeeting(roomId: string, title: string, description: string, startTime: string, endTime: string): Promise<string>;
  updateMeeting(roomId: string, meetingId: string, title: string, description: string, startTime: string, endTime: string): Promise<string>;
  cancelMeeting(meetingId: string): Promise<void>;
}

export class LocalMeetingProvider implements MeetingProvider {
  async createMeeting(
    roomId: string,
    _title: string,
    _description: string,
    _startTime: string,
    _endTime: string
  ): Promise<string> {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return origin ? `${origin}/rooms/${roomId}` : `/rooms/${roomId}`;
  }

  async updateMeeting(
    roomId: string,
    meetingId: string,
    _title: string,
    _description: string,
    _startTime: string,
    _endTime: string
  ): Promise<string> {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return origin ? `${origin}/rooms/${roomId}` : `/rooms/${roomId}`;
  }

  async cancelMeeting(_meetingId: string): Promise<void> {
    // Local provider cancellation logic is a no-op
  }
}

export const activeMeetingProvider: MeetingProvider = new LocalMeetingProvider();
