import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>調整さん iCal 変換</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

p {
  color: #666;
  margin-bottom: 30px;
  text-align: center;
}

.input-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

input[type="url"],
input[type="text"],
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

input[type="url"]:focus,
input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: #007bff;
}

input[type="url"]:invalid,
input[type="text"]:invalid,
textarea:invalid {
  border-color: #dc3545;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
  min-height: 20px;
  font-weight: 500;
  display: block;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

button:active {
  background-color: #004085;
}

.helper-text {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  border: 1px solid #c3e6cb;
}

.success-message h3 {
  margin: 0 0 10px 0;
  color: #155724;
}

.success-message p {
  margin: 5px 0;
  text-align: left;
}

.google-calendar-btn {
  display: inline-block;
  background-color: #4285f4;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 10px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.google-calendar-btn:hover {
  background-color: #3367d6;
  color: white;
}
          `,
          }}
        />
      </head>
      <body>
        {children}
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
// Validation script inlined for Cloudflare Workers compatibility
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('chouseisan-form');
  const urlInput = document.getElementById('url');
  const nameInput = document.getElementById('name');
  const csvInput = document.getElementById('csv-data');

  function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.textContent = '');
  }

  function showSuccessMessage(filename) {
    // Remove existing success message if any
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
      existingSuccess.remove();
    }

    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = \`
      <h3>✅ iCalファイルが生成されました！</h3>
      <p><strong>ファイル名:</strong> \${filename}</p>
      <p>ダウンロードされたファイルをダブルクリックするか、下のボタンでGoogleカレンダーに追加できます。</p>
      <a href="https://calendar.google.com/calendar/u/0/r/settings/export" target="_blank" rel="noopener noreferrer" class="google-calendar-btn">
        📅 Googleカレンダーにインポート
      </a>
    \`;

    // Insert after form
    const form = document.getElementById('chouseisan-form');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(successDiv, form.nextSibling);
    }
  }

  function showError(inputId, message) {
    const errorElement = document.getElementById(inputId + '-error');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function validateUrl(url) {
    if (!url) return true; // URL is optional
    const urlPattern = /^https?:\\/\\/chouseisan\\.com\\/s\\?h=[a-f0-9]+$/;
    return urlPattern.test(url);
  }

  function validateName(name) {
    return name.trim().length > 0 && name.trim().length <= 50;
  }

  function validateCsvData(csvData) {
    if (!csvData.trim()) return false;
    const lines = csvData.trim().split('\\n');
    return lines.length >= 3; // At least title, header, and one data row
  }

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearErrors();

      const url = urlInput?.value?.trim() || '';
      const name = nameInput?.value?.trim() || '';
      const csvData = csvInput?.value?.trim() || '';

      let hasErrors = false;

      if (!validateName(name)) {
        showError('name', '名前は1文字以上50文字以内で入力してください。');
        hasErrors = true;
      }

      if (url && !validateUrl(url)) {
        showError('url', '正しい調整さんのURL形式を入力してください。');
        hasErrors = true;
      }

      if (!validateCsvData(csvData)) {
        showError('csv-data', 'CSVデータを正しく入力してください。');
        hasErrors = true;
      }

      if (hasErrors) return;

      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '生成中...';
      }

      try {
        const response = await fetch('/api/generate-ical', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, name, csvData }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'calendar.ics';
          
          // Download iCal file
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);

          // Show success message and Google Calendar link
          showSuccessMessage(filename);
        } else {
          const errorData = await response.json();
          alert('エラー: ' + (errorData.error || '不明なエラーが発生しました。'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('エラー: 通信に失敗しました。');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'iCal生成';
        }
      }
    });
  }
});
          `,
          }}
        />
      </body>
    </html>
  );
});
