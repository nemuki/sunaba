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
      showSuccessMessage(inputMode, '', participantName, scheduleData);
    } else {
      showSuccessMessage(inputMode, url.value, participantName, null);
    }
  }
}

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
