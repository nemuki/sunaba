import { describe, it, expect } from 'vitest'
import { parseChoseisanCSV, getParticipantSchedule } from '../src/csvParser'

describe('csvParser', () => {
  const sampleCSV = `ゆる飲み

日程,Aさん,Bさん
7/14(月) 19:00〜,◯,◯
7/15(火) 19:00〜,◯,△
7/16(水) 19:00〜,◯,×
コメント,,`

  it('should parse chouseisan CSV correctly', () => {
    const result = parseChoseisanCSV(sampleCSV)
    
    expect(result.title).toBe('ゆる飲み')
    expect(result.participants).toEqual(['Aさん', 'Bさん'])
    expect(result.entries).toHaveLength(3)
    
    expect(result.entries[0].date).toBe('7/14(月)')
    expect(result.entries[0].time).toBe('19:00〜')
    expect(result.entries[0].participants['Aさん']).toBe('◯')
    expect(result.entries[0].participants['Bさん']).toBe('◯')
  })

  it('should get participant schedule with only ◯ entries', () => {
    const scheduleData = parseChoseisanCSV(sampleCSV)
    const aSchedule = getParticipantSchedule(scheduleData, 'Aさん')
    const bSchedule = getParticipantSchedule(scheduleData, 'Bさん')
    
    // Aさん has ◯ for all 3 entries
    expect(aSchedule).toHaveLength(3)
    
    // Bさん has ◯ only for the first entry
    expect(bSchedule).toHaveLength(1)
    expect(bSchedule[0].date).toBe('7/14(月)')
  })

  it('should throw error for non-existent participant', () => {
    const scheduleData = parseChoseisanCSV(sampleCSV)
    
    expect(() => {
      getParticipantSchedule(scheduleData, 'Cさん')
    }).toThrow('参加者「Cさん」が見つかりません')
  })

  it('should handle empty CSV', () => {
    expect(() => {
      parseChoseisanCSV('')
    }).toThrow('CSVデータが短すぎます')
  })

  it('should handle malformed CSV', () => {
    expect(() => {
      parseChoseisanCSV('invalid csv data')
    }).toThrow('CSVデータが短すぎます')
  })
})