export interface MeetingProvider {
  createMeeting(title: string, description: string, startTime: string, endTime: string): Promise<string>;
  updateMeeting(meetingId: string, title: string, description: string, startTime: string, endTime: string): Promise<string>;
  cancelMeeting(meetingId: string): Promise<void>;
}

export class LocalMeetingProvider implements MeetingProvider {
  async createMeeting(
    title: string,
    description: string,
    startTime: string,
    endTime: string
  ): Promise<string> {
    const id = Math.random().toString(36).substring(2, 15);
    return `https://skillswap.local/meeting/${id}`;
  }

  async updateMeeting(
    meetingId: string,
    title: string,
    description: string,
    startTime: string,
    endTime: string
  ): Promise<string> {
    // If the meeting link exists already, return it; otherwise generate a new local link
    if (meetingId.startsWith("http")) {
      return meetingId;
    }
    return `https://skillswap.local/meeting/${meetingId}`;
  }

  async cancelMeeting(meetingId: string): Promise<void> {
    // Local provider cancellation logic is a no-op
  }
}

export const activeMeetingProvider: MeetingProvider = new LocalMeetingProvider();
