// Client-side form validation using HTML5 and TypeScript
import { parseChoseisanCSV, getParticipantSchedule, type ScheduleData } from './csvParser';

interface FormElements {
  url: HTMLInputElement;
  name: HTMLInputElement;
  csvData: HTMLTextAreaElement;
  form: HTMLFormElement;
}

function getFormElements(): FormElements | null {
  const url = document.getElementById("url") as HTMLInputElement;
  const name = document.getElementById("name") as HTMLInputElement;
  const csvData = document.getElementById("csv-data") as HTMLTextAreaElement;
  const form = document.getElementById("chouseisan-form") as HTMLFormElement;

  if (!url || !name || !csvData || !form) {
    console.error("Required form elements not found");
    return null;
  }

  return { url, name, csvData, form };
}

function clearCustomErrors(): void {
  const urlError = document.getElementById("url-error");
  const nameError = document.getElementById("name-error");
  const csvError = document.getElementById("csv-data-error");

  if (urlError) {
    urlError.textContent = "";
    urlError.style.display = "none";
  }
  if (nameError) {
    nameError.textContent = "";
    nameError.style.display = "none";
  }
  if (csvError) {
    csvError.textContent = "";
    csvError.style.display = "none";
  }
}

function showCustomError(elementId: string, message: string): void {
  const errorElement = document.getElementById(`${elementId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function validateChouseisanUrl(url: string): boolean {
  // Additional validation beyond HTML5 pattern
  if (!url.includes("chouseisan.com")) {
    showCustomError("url", "調整さんのURLを入力してください。");
    return false;
  }

  // HTML5 pattern already validates the format, but we can add more specific checks
  const urlPattern = /^https?:\/\/chouseisan\.com\/s\?h=[a-f0-9]+$/;
  if (!urlPattern.test(url)) {
    showCustomError("url", "正しい調整さんのURL形式を入力してください。");
    return false;
  }

  return true;
}

function validateCSVData(csvData: string): ScheduleData | null {
  try {
    const scheduleData = parseChoseisanCSV(csvData);
    return scheduleData;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSVデータの解析に失敗しました。';
    showCustomError("csv-data", message);
    return null;
  }
}

function determineInputMode(url: string, name: string, csvData: string): 'url' | 'csv' | 'invalid' {
  const hasUrl = url.trim() !== '';
  const hasName = name.trim() !== '';
  const hasCsv = csvData.trim() !== '';
  
  if (hasCsv) {
    // CSV mode - CSV data provided
    return 'csv';
  } else if (hasUrl && hasName) {
    // URL mode - both URL and name provided
    return 'url';
  } else {
    // Invalid - insufficient data
    return 'invalid';
  }
}

function handleFormSubmit(event: Event): void {
  event.preventDefault();
  console.log("Form submit event intercepted");

  const elements = getFormElements();
  if (!elements) return;

  const { url, name, csvData, form } = elements;

  // Clear previous custom errors
  clearCustomErrors();

  // Determine input mode
  const inputMode = determineInputMode(url.value, name.value, csvData.value);
  
  if (inputMode === 'invalid') {
    showCustomError("url", "URLと名前、またはCSVデータのいずれかを入力してください。");
    return;
  }

  let hasCustomErrors = false;
  let scheduleData: ScheduleData | null = null;
  let participantName = '';

  if (inputMode === 'csv') {
    // CSV mode validation
    scheduleData = validateCSVData(csvData.value);
    if (!scheduleData) {
      hasCustomErrors = true;
    } else {
      // If name is provided, validate it against CSV participants
      if (name.value.trim()) {
        participantName = name.value.trim();
        try {
          getParticipantSchedule(scheduleData, participantName);
        } catch (error) {
          const message = error instanceof Error ? error.message : '参加者名が見つかりません。';
          showCustomError("name", message);
          hasCustomErrors = true;
        }
      } else {
        // If no name provided, show available participants
        participantName = scheduleData.participants[0] || '';
      }
    }
  } else {
    // URL mode validation
    // First, let HTML5 validation do its work for required fields
    const isValid = form.checkValidity();

    if (!isValid) {
      // HTML5 validation failed, let browser show its messages
      form.reportValidity();
      return;
    }

    // Additional URL validation
    if (!validateChouseisanUrl(url.value)) {
      hasCustomErrors = true;
    }

    // Additional name validation (trimming)
    if (!name.value.trim()) {
      showCustomError("name", "名前を入力してください。");
      hasCustomErrors = true;
    } else {
      participantName = name.value.trim();
    }
  }

  if (!hasCustomErrors) {
    console.log("All validation passed");
    if (inputMode === 'csv') {
      generateICalFromData('', participantName, csvData.value);
    } else {
      // For URL mode, we still need CSV data, so show an error for now
      showCustomError("csv-data", "現在はCSVデータモードのみサポートしています。調整さんからCSVをダウンロードして貼り付けてください。");
    }
  }
}

async function generateICalFromData(url: string, name: string, csvData: string): Promise<void> {
  try {
    // Show loading state
    showLoadingMessage();

    const response = await fetch('/api/generate-ical', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url || undefined,
        name: name,
        csvData: csvData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'iCal生成に失敗しました。');
    }

    // Get the iCal content
    const icalContent = await response.text();
    const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'schedule.ics';
    
    // Create download
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const downloadUrl = URL.createObjectURL(blob);
    
    // Create webcal URL for calendar apps
    const webcalContent = icalContent;
    const webcalBlob = new Blob([webcalContent], { type: 'text/calendar' });
    const webcalUrl = URL.createObjectURL(webcalBlob);
    
    showSuccessWithDownload(filename, downloadUrl, webcalUrl, name);
    
  } catch (error) {
    console.error('iCal generation failed:', error);
    const message = error instanceof Error ? error.message : 'iCal生成中にエラーが発生しました。';
    showCustomError("csv-data", message);
    hideLoadingMessage();
  }
}

function showLoadingMessage(): void {
  // Remove existing messages
  const existingSuccess = document.querySelector(".success-message");
  const existingLoading = document.querySelector(".loading-message");
  if (existingSuccess) existingSuccess.remove();
  if (existingLoading) existingLoading.remove();

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading-message";
  loadingDiv.innerHTML = `
    <div style="background-color: #cce5ff; border: 1px solid #99ccff; color: #0066cc; padding: 12px; border-radius: 4px; margin-top: 20px;">
      <strong>⏳ iCalを生成中...</strong><br>
      しばらくお待ちください。
    </div>
  `;

  const form = document.querySelector(".input-form");
  if (form) {
    form.appendChild(loadingDiv);
  }
}

function hideLoadingMessage(): void {
  const existingLoading = document.querySelector(".loading-message");
  if (existingLoading) {
    existingLoading.remove();
  }
}

function showSuccessWithDownload(filename: string, downloadUrl: string, webcalUrl: string, participantName: string): void {
  // Remove existing messages
  const existingSuccess = document.querySelector(".success-message");
  const existingLoading = document.querySelector(".loading-message");
  if (existingSuccess) existingSuccess.remove();
  if (existingLoading) existingLoading.remove();

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  
  // Create Google Calendar URL for direct import
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&cid=${encodeURIComponent(webcalUrl)}`;
  
  successDiv.innerHTML = `
    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 4px; margin-top: 20px;">
      <strong>✓ iCalファイルが生成されました！</strong><br>
      参加者: ${participantName}<br><br>
      
      <div style="margin: 10px 0;">
        <a href="${downloadUrl}" download="${filename}" 
           style="background-color: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 10px;">
          📥 iCalダウンロード
        </a>
      </div>
      
      <div style="margin: 10px 0;">
        <a href="${googleCalendarUrl}" target="_blank" rel="noopener noreferrer"
           style="background-color: #4285f4; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 10px;">
          📅 Googleカレンダーに追加
        </a>
        <button onclick="copyToClipboard('${webcalUrl}')" 
                style="background-color: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          📋 カレンダーURL をコピー
        </button>
      </div>
      
      <small style="color: #666;">
        💡 <strong>カレンダーに追加する方法:</strong><br>
        1. 「Googleカレンダーに追加」ボタンで直接追加<br>
        2. または「カレンダーURL をコピー」→ Googleカレンダーの「他のカレンダー」→「URLで追加」
      </small>
    </div>
  `;

  const form = document.querySelector(".input-form");
  if (form) {
    form.appendChild(successDiv);
  }
}

// Add global function for copy to clipboard
(window as any).copyToClipboard = function(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    const button = event?.target as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ コピーしました！';
      button.style.backgroundColor = '#28a745';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '#007bff';
      }, 2000);
    }
  }).catch(err => {
    console.error('コピーに失敗しました:', err);
    alert('コピーに失敗しました。手動でURLをコピーしてください。');
  });
};

function showSuccessMessage(mode: 'url' | 'csv', url: string, name: string, scheduleData: ScheduleData | null): void {
  // Remove existing success message
  const existingSuccess = document.querySelector(".success-message");
  if (existingSuccess) {
    existingSuccess.remove();
  }

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  
  let content = `
    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 4px; margin-top: 20px;">
      <strong>✓ 入力が正常です！</strong><br>
  `;

  if (mode === 'csv') {
    if (scheduleData) {
      const participantSchedule = name ? getParticipantSchedule(scheduleData, name) : [];
      content += `
        タイトル: ${scheduleData.title}<br>
        参加者: ${scheduleData.participants.join(', ')}<br>
        ${name ? `選択された参加者: ${name}<br>` : ''}
        ${name ? `「◯」の予定数: ${participantSchedule.length}件<br>` : ''}
        総予定数: ${scheduleData.entries.length}件<br>
      `;
      
      if (name && participantSchedule.length > 0) {
        content += `<br><strong>「${name}」の確定予定:</strong><br>`;
        participantSchedule.forEach(entry => {
          content += `• ${entry.date} ${entry.time}<br>`;
        });
      }
    }
  } else {
    content += `
      URL: ${url}<br>
      名前: ${name}<br>
    `;
  }

  content += `
      <em>TODO: iCal生成処理を実装予定</em>
    </div>
  `;

  successDiv.innerHTML = content;

  const form = document.querySelector(".input-form");
  if (form) {
    form.appendChild(successDiv);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", (): void => {
  console.log("DOM loaded, setting up form validation");

  const elements = getFormElements();
  if (!elements) return;

  const { form } = elements;

  // Use native form submission with validation
  form.addEventListener("submit", handleFormSubmit);
  console.log("Form submit event listener added");
});

console.log("Validation TypeScript module loaded");
