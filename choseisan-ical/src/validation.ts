// Client-side form validation using HTML5 and TypeScript
interface FormElements {
  url: HTMLInputElement;
  name: HTMLInputElement;
  form: HTMLFormElement;
}

function getFormElements(): FormElements | null {
  const url = document.getElementById("url") as HTMLInputElement;
  const name = document.getElementById("name") as HTMLInputElement;
  const form = document.getElementById("chouseisan-form") as HTMLFormElement;

  if (!url || !name || !form) {
    console.error("Required form elements not found");
    return null;
  }

  return { url, name, form };
}

function clearCustomErrors(): void {
  const urlError = document.getElementById("url-error");
  const nameError = document.getElementById("name-error");

  if (urlError) {
    urlError.textContent = "";
    urlError.style.display = "none";
  }
  if (nameError) {
    nameError.textContent = "";
    nameError.style.display = "none";
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

function handleFormSubmit(event: Event): void {
  event.preventDefault();
  console.log("Form submit event intercepted");

  const elements = getFormElements();
  if (!elements) return;

  const { url, name, form } = elements;

  // Clear previous custom errors
  clearCustomErrors();

  // First, let HTML5 validation do its work
  const isValid = form.checkValidity();

  if (!isValid) {
    // HTML5 validation failed, let browser show its messages
    form.reportValidity();
    return;
  }

  // HTML5 validation passed, now do additional custom validation
  let hasCustomErrors = false;

  // Additional URL validation
  if (!validateChouseisanUrl(url.value)) {
    hasCustomErrors = true;
  }

  // Additional name validation (trimming)
  if (!name.value.trim()) {
    showCustomError("name", "名前を入力してください。");
    hasCustomErrors = true;
  }

  if (!hasCustomErrors) {
    console.log("All validation passed");
    showSuccessMessage(url.value, name.value.trim());
  }
}

function showSuccessMessage(url: string, name: string): void {
  // Remove existing success message
  const existingSuccess = document.querySelector(".success-message");
  if (existingSuccess) {
    existingSuccess.remove();
  }

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.innerHTML = `
    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 4px; margin-top: 20px;">
      <strong>✓ 入力が正常です！</strong><br>
      URL: ${url}<br>
      名前: ${name}<br>
      <em>TODO: iCal生成処理を実装予定</em>
    </div>
  `;

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
