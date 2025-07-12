import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <div class="container">
      <h1>調整さん iCal 変換</h1>
      <p>調整さんのURLと名前を入力して、iCal形式で予定を取得できます。</p>
      
      <form class="input-form" id="chouseisan-form" onsubmit="return false;">
        <div class="form-group">
          <label for="url">調整さんURL:</label>
          <input 
            type="url" 
            id="url" 
            name="url" 
            placeholder="https://chouseisan.com/s?h=..." 
            required 
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
            required 
          />
          <div class="error-message" id="name-error"></div>
        </div>
        
        <button type="button" id="submit-btn">iCal生成</button>
      </form>
    </div>
  )
})

export default app
