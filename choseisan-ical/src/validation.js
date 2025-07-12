// Client-side form validation
function handleSubmit() {
  console.log('handleSubmit called');
  const url = document.getElementById('url').value;
  const name = document.getElementById('name').value;
  console.log('URL:', url, 'Name:', name);
  
  // Clear previous errors
  const urlError = document.getElementById('url-error');
  const nameError = document.getElementById('name-error');
  if (urlError) urlError.textContent = '';
  if (nameError) nameError.textContent = '';
  
  let hasErrors = false;
  
  // Validate URL
  if (!url) {
    if (urlError) {
      urlError.textContent = 'URLを入力してください。';
      urlError.style.display = 'block';
    }
    hasErrors = true;
    console.log('URL validation failed: empty');
  } else if (!url.includes('chouseisan.com')) {
    if (urlError) {
      urlError.textContent = '調整さんのURLを入力してください。';
      urlError.style.display = 'block';
    }
    hasErrors = true;
    console.log('URL validation failed: not chouseisan.com');
  } else if (!url.match(/^https?:\/\/chouseisan\.com\/s\?h=[a-f0-9]+$/)) {
    if (urlError) {
      urlError.textContent = '正しい調整さんのURL形式を入力してください。';
      urlError.style.display = 'block';
    }
    hasErrors = true;
    console.log('URL validation failed: wrong format');
  }
  
  // Validate name
  if (!name.trim()) {
    if (nameError) {
      nameError.textContent = '名前を入力してください。';
      nameError.style.display = 'block';
    }
    hasErrors = true;
    console.log('Name validation failed: empty');
  } else if (name.trim().length > 50) {
    if (nameError) {
      nameError.textContent = '名前は50文字以内で入力してください。';
      nameError.style.display = 'block';
    }
    hasErrors = true;
    console.log('Name validation failed: too long');
  }
  
  if (!hasErrors) {
    console.log('Validation passed');
    // Show success message
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
      existingSuccess.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 4px; margin-top: 20px;">
        <strong>✓ 入力が正常です！</strong><br>
        URL: ${url}<br>
        名前: ${name}<br>
        <em>TODO: iCal生成処理を実装予定</em>
      </div>
    `;
    
    const form = document.querySelector('.input-form');
    if (form) {
      form.appendChild(successDiv);
    }
  } else {
    console.log('Validation failed, hasErrors=true');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners');
  const button = document.getElementById('submit-btn');
  if (button) {
    button.addEventListener('click', handleSubmit);
    console.log('Click event listener added to button');
  } else {
    console.log('Button not found');
  }
});

console.log('Validation script loaded');