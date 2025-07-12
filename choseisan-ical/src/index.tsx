import { Hono } from 'hono'
import { renderer } from './renderer'
import { parseChoseisanCSV } from './csvParser'
import { generateICalForParticipant, generateFilename } from './icalGenerator'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <div class="container">
      <h1>調整さん iCal 変換</h1>
      <p>調整さんのURLと名前、またはCSVデータを入力して、iCal形式で予定を取得できます。</p>
      
      <form class="input-form" id="chouseisan-form" novalidate>
        <div class="form-group">
          <label for="url">調整さんURL:</label>
          <input 
            type="url" 
            id="url" 
            name="url" 
            placeholder="https://chouseisan.com/s?h=..." 
            pattern="https?://chouseisan\.com/s\?h=[a-f0-9]+"
            title="正しい調整さんのURL形式を入力してください。"
          />
          <div class="error-message" id="url-error"></div>
        </div>
        
        <div class="form-group">
          <label for="name">名前:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="例: Bさん" 
            maxLength={50}
            title="名前は50文字以内で入力してください。"
          />
          <div class="error-message" id="name-error"></div>
        </div>

        <div class="form-group">
          <label for="csv-data">CSVデータ（調整さんからダウンロード）:</label>
          <textarea 
            id="csv-data" 
            name="csv-data" 
            rows={8}
            placeholder="ゆる飲み&#10;&#10;日程,Aさん,Bさん&#10;7/14(月) 19:00〜,◯,◯&#10;7/15(火) 19:00〜,◯,△&#10;7/16(水) 19:00〜,◯,×&#10;コメント,,"
            title="調整さんからダウンロードしたCSVデータを貼り付けてください。"
          ></textarea>
          <div class="error-message" id="csv-data-error"></div>
          <small class="helper-text">URLと名前の代わりに、調整さんからダウンロードしたCSVデータを貼り付けることもできます。</small>
        </div>
        
        <button type="submit" id="submit-btn">iCal生成</button>
      </form>
    </div>
  )
})

// API endpoint to generate iCal
app.post('/api/generate-ical', async (c) => {
  try {
    const body = await c.req.json()
    const { url, name, csvData } = body

    if (!name?.trim()) {
      return c.json({ error: '名前を入力してください。' }, 400)
    }

    if (!csvData?.trim()) {
      return c.json({ error: 'CSVデータを入力してください。' }, 400)
    }

    // Parse CSV data
    const scheduleData = parseChoseisanCSV(csvData)
    
    // Generate iCal
    const icalContent = generateICalForParticipant({
      url: url?.trim() || undefined,
      title: scheduleData.title,
      participantName: name.trim(),
      scheduleData
    })

    // Generate proper filename
    const filename = generateFilename(url?.trim(), name.trim())

    return c.text(icalContent, 200, {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    })
  } catch (error) {
    console.error('iCal generation error:', error)
    const message = error instanceof Error ? error.message : 'iCal生成中にエラーが発生しました。'
    return c.json({ error: message }, 500)
  }
})

export default app
