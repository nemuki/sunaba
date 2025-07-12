// CSV Parser for Chosei-san data
export interface ScheduleEntry {
  date: string;
  time: string;
  participants: Record<string, string>; // name -> status (◯, △, ×)
}

export interface ScheduleData {
  title: string;
  entries: ScheduleEntry[];
  participants: string[];
}

export function parseChoseisanCSV(csvText: string): ScheduleData {
  const lines = csvText.trim().split('\n').map(line => line.trim());
  
  if (lines.length < 3) {
    throw new Error('CSVデータが短すぎます。正しい調整さんのCSVフォーマットを確認してください。');
  }

  // First non-empty line is the title
  const title = lines.find(line => line.length > 0) || '';
  
  // Find the header line (contains participant names)
  let headerIndex = -1;
  let participants: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('日程,') || line.startsWith('日程,')) {
      headerIndex = i;
      const parts = line.split(',');
      participants = parts.slice(1).filter(name => name.trim() !== '' && name !== 'コメント');
      break;
    }
  }
  
  if (headerIndex === -1) {
    throw new Error('CSVヘッダー（日程列）が見つかりません。正しい調整さんのCSVフォーマットを確認してください。');
  }
  
  if (participants.length === 0) {
    throw new Error('参加者が見つかりません。CSVに参加者名が含まれていることを確認してください。');
  }

  const entries: ScheduleEntry[] = [];
  
  // Parse data lines after header
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines and comment lines
    if (!line || line.startsWith('コメント,') || line === ','.repeat(participants.length)) {
      continue;
    }
    
    const parts = line.split(',');
    const dateTime = parts[0]?.trim();
    
    if (!dateTime) continue;
    
    // Parse date and time from "7/14(月) 19:00〜" format
    const dateTimeMatch = dateTime.match(/^(.+?)\s+(.+)$/);
    const date = dateTimeMatch ? dateTimeMatch[1] : dateTime;
    const time = dateTimeMatch ? dateTimeMatch[2] : '';
    
    const participantData: Record<string, string> = {};
    
    for (let j = 0; j < participants.length; j++) {
      const status = parts[j + 1]?.trim() || '';
      participantData[participants[j]] = status;
    }
    
    entries.push({
      date,
      time,
      participants: participantData
    });
  }
  
  if (entries.length === 0) {
    throw new Error('予定データが見つかりません。CSVに予定データが含まれていることを確認してください。');
  }
  
  return {
    title,
    entries,
    participants
  };
}

export function getParticipantSchedule(scheduleData: ScheduleData, participantName: string): ScheduleEntry[] {
  const trimmedName = participantName.trim();
  
  if (!scheduleData.participants.includes(trimmedName)) {
    throw new Error(`参加者「${trimmedName}」が見つかりません。利用可能な参加者: ${scheduleData.participants.join(', ')}`);
  }
  
  return scheduleData.entries.filter(entry => {
    const status = entry.participants[trimmedName];
    return status === '◯'; // Only include entries with ◯ (confirmed attendance)
  });
}
