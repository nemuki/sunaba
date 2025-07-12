import { describe, it, expect } from 'vitest'
import { generateICalForParticipant, extractChouseisanId, generateFilename } from '../src/icalGenerator'
import { parseChoseisanCSV } from '../src/csvParser'

describe('icalGenerator', () => {
  const sampleCSV = `ゆる飲み

日程,Aさん,Bさん
7/14(月) 19:00〜,◯,◯
7/15(火) 19:00〜,◯,△
7/16(水) 19:00〜,◯,×
コメント,,`

  it('should generate iCal content for participant', () => {
    const scheduleData = parseChoseisanCSV(sampleCSV)
    const icalContent = generateICalForParticipant({
      url: 'https://chouseisan.com/s?h=abc123',
      title: 'ゆる飲み',
      participantName: 'Bさん',
      scheduleData
    })
    
    expect(icalContent).toContain('BEGIN:VCALENDAR')
    expect(icalContent).toContain('END:VCALENDAR')
    expect(icalContent).toContain('SUMMARY:ゆる飲み')
    expect(icalContent).toContain('DESCRIPTION:調整さんURL: https://chouseisan.com/s?h=abc123')
    
    // Bさん has only one ◯ entry, so should have only one event
    const eventCount = (icalContent.match(/BEGIN:VEVENT/g) || []).length
    expect(eventCount).toBe(1)
  })

  it('should generate iCal content without URL', () => {
    const scheduleData = parseChoseisanCSV(sampleCSV)
    const icalContent = generateICalForParticipant({
      title: 'ゆる飲み',
      participantName: 'Aさん',
      scheduleData
    })
    
    expect(icalContent).toContain('BEGIN:VCALENDAR')
    expect(icalContent).toContain('SUMMARY:ゆる飲み')
    expect(icalContent).toContain('DESCRIPTION:調整さん: ゆる飲み')
    
    // Aさん has all three ◯ entries
    const eventCount = (icalContent.match(/BEGIN:VEVENT/g) || []).length
    expect(eventCount).toBe(3)
  })

  it('should handle participant with no confirmed schedules', () => {
    const csvWithNoConfirmed = `テスト

日程,Aさん,Bさん
7/14(月) 19:00〜,◯,×
7/15(火) 19:00〜,◯,△
コメント,,`

    const scheduleData = parseChoseisanCSV(csvWithNoConfirmed)
    const icalContent = generateICalForParticipant({
      title: 'テスト',
      participantName: 'Bさん',
      scheduleData
    })
    
    expect(icalContent).toContain('BEGIN:VCALENDAR')
    expect(icalContent).toContain('END:VCALENDAR')
    
    // No confirmed schedules, so no events
    const eventCount = (icalContent.match(/BEGIN:VEVENT/g) || []).length
    expect(eventCount).toBe(0)
  })

  it('should throw error for non-existent participant', () => {
    const scheduleData = parseChoseisanCSV(sampleCSV)
    
    expect(() => {
      generateICalForParticipant({
        title: 'ゆる飲み',
        participantName: 'Cさん',
        scheduleData
      })
    }).toThrow('参加者「Cさん」が見つかりません')
  })

  it('should extract chouseisan ID from URL', () => {
    expect(extractChouseisanId('https://chouseisan.com/s?h=02d742a89fd040959ebbf75e1514be62')).toBe('02d742a89fd040959ebbf75e1514be62')
    expect(extractChouseisanId('https://chouseisan.com/s?h=abc123')).toBe('abc123')
    expect(extractChouseisanId('https://other-site.com')).toBe(null)
    expect(extractChouseisanId('invalid-url')).toBe(null)
  })

  it('should generate filename with chouseisan ID and base64 participant name', () => {
    const url = 'https://chouseisan.com/s?h=02d742a89fd040959ebbf75e1514be62'
    const participantName = 'Bさん'
    const filename = generateFilename(url, participantName)
    
    expect(filename).toBe('02d742a89fd040959ebbf75e1514be62-QuOBleOCkw==.ics')
  })

  it('should generate fallback filename when no URL provided', () => {
    const participantName = 'Bさん'
    const filename = generateFilename(undefined, participantName)
    
    expect(filename).toBe('schedule-QuOBleOCkw==.ics')
  })

  it('should generate fallback filename when invalid URL provided', () => {
    const participantName = 'Aさん'
    const filename = generateFilename('invalid-url', participantName)
    
    expect(filename).toBe('schedule-QeOBleOCkw==.ics')
  })
})