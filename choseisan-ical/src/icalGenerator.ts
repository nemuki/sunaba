import ical from 'ical-generator';
import { ScheduleData, ScheduleEntry, getParticipantSchedule } from './csvParser';

export interface ICalOptions {
  url?: string;
  title: string;
  participantName: string;
  scheduleData: ScheduleData;
}

export function generateICalForParticipant(options: ICalOptions): string {
  const { url, title, participantName, scheduleData } = options;
  
  // Get participant's confirmed schedules (◯ only)
  const participantSchedules = getParticipantSchedule(scheduleData, participantName);
  
  // Create iCal calendar
  const calendar = ical({
    prodId: { company: 'choseisan-ical', product: 'choseisan-ical' },
    name: `${title} - ${participantName}`,
    description: url ? `調整さん: ${url}` : `調整さん: ${title}`,
    timezone: 'Asia/Tokyo'
  });
  
  // Add events for each confirmed schedule
  participantSchedules.forEach((entry: ScheduleEntry) => {
    const eventDate = parseJapaneseDate(entry.date, entry.time);
    
    if (eventDate) {
      calendar.createEvent({
        start: eventDate,
        end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), // Default 2 hours duration
        summary: title,
        description: url ? `調整さんURL: ${url}\n参加者: ${participantName}` : `調整さん: ${title}\n参加者: ${participantName}`,
        location: '',
        uid: `choseisan-${hashCode(url || title)}-${hashCode(entry.date + entry.time)}-${hashCode(participantName)}@choseisan-ical.local`
      });
    }
  });
  
  return calendar.toString();
}

// Parse Japanese date format like "7/14(月) 19:00〜"
function parseJapaneseDate(dateStr: string, timeStr: string): Date | null {
  try {
    // Remove day of week in parentheses and extract date
    const dateMatch = dateStr.match(/^(\d+)\/(\d+)/);
    if (!dateMatch) return null;
    
    const month = parseInt(dateMatch[1], 10);
    const day = parseInt(dateMatch[2], 10);
    
    // Extract time - handle formats like "19:00〜", "19:00-21:00", etc.
    const timeMatch = timeStr.match(/(\d+):(\d+)/);
    if (!timeMatch) return null;
    
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    
    // Use current year for now - could be improved to handle year transitions
    const currentYear = new Date().getFullYear();
    
    return new Date(currentYear, month - 1, day, hour, minute);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

// Simple hash function for generating UIDs
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}