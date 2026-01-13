// ListingWriter Browser Extension - Popup Script

const API_URL = 'http://localhost:8081/api/generate'; // Update for production

// State
let images = [];
let currentResults = null;

// DOM Elements
const formView = document.getElementById('form-view');
const resultsView = document.getElementById('results-view');
const errorView = document.getElementById('error-view');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');

const itemNameInput = document.getElementById('item-name');
const priceInput = document.getElementById('price');
const conditionSelect = document.getElementById('condition');
const categorySelect = document.getElementById('category');
const detailsInput = document.getElementById('details');

const generateBtn = document.getElementById('generate-btn');
const backBtn = document.getElementById('back-btn');
const retryBtn = document.getElementById('retry-btn');
const themeToggle = document.getElementById('theme-toggle');

const resultsContainer = document.getElementById('results-container');
const errorMessage = document.getElementById('error-message');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Load theme
  const { theme } = await chrome.storage.local.get('theme');
  if (theme === 'light') {
    document.body.classList.add('light');
    themeToggle.querySelector('.theme-icon').innerHTML = '&#9728;';
  }

  // Load saved form data
  const saved = await chrome.storage.local.get(['itemName', 'price', 'category']);
  if (saved.itemName) itemNameInput.value = saved.itemName;
  if (saved.price) priceInput.value = saved.price;
  if (saved.category) categorySelect.value = saved.category;

  setupEventListeners();
}

function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Drop zone
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFileSelect);

  // Generate button
  generateBtn.addEventListener('click', handleGenerate);

  // Navigation
  backBtn.addEventListener('click', showFormView);
  retryBtn.addEventListener('click', showFormView);
}

// Theme
async function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  themeToggle.querySelector('.theme-icon').innerHTML = isLight ? '&#9728;' : '&#9790;';
  await chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
}

// Image handling
function handleDragOver(e) {
  e.preventDefault();
  dropZone.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  dropZone.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  addImages(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addImages(files);
  fileInput.value = '';
}

function addImages(files) {
  const remaining = 3 - images.length;
  const toAdd = files.slice(0, remaining);

  toAdd.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Images must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      images.push(e.target.result);
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderImagePreviews() {
  imagePreview.innerHTML = images.map((img, i) => `
    <div class="preview-item">
      <img src="${img}" alt="Preview ${i + 1}">
      <button class="preview-remove" onclick="removeImage(${i})">×</button>
    </div>
  `).join('');
}

window.removeImage = function(index) {
  images.splice(index, 1);
  renderImagePreviews();
};

// Generate listings
async function handleGenerate() {
  // Validation
  if (images.length === 0) {
    alert('Please upload at least one photo');
    return;
  }

  const itemName = itemNameInput.value.trim();
  if (!itemName) {
    alert('Please enter an item name');
    return;
  }

  const price = parseFloat(priceInput.value);
  if (!price || price <= 0) {
    alert('Please enter a valid price');
    return;
  }

  // Save form data for convenience
  await chrome.storage.local.set({
    itemName,
    price,
    category: categorySelect.value
  });

  // Show loading state
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images,
        itemName,
        price,
        condition: conditionSelect.value,
        category: categorySelect.value,
        additionalDetails: detailsInput.value.trim()
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    if (!data.success || !data.listings) {
      throw new Error(data.error || 'Failed to generate listings');
    }

    currentResults = data.listings;
    showResultsView();
  } catch (error) {
    console.error('Generation error:', error);
    errorMessage.textContent = error.message || 'Please try again.';
    showErrorView();
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  generateBtn.disabled = loading;
  generateBtn.querySelector('.btn-text').classList.toggle('hidden', loading);
  generateBtn.querySelector('.btn-loader').classList.toggle('hidden', !loading);
}

// Views
function showFormView() {
  formView.classList.add('active');
  resultsView.classList.remove('active');
  errorView.classList.remove('active');
}

function showResultsView() {
  renderResults();
  formView.classList.remove('active');
  resultsView.classList.add('active');
  errorView.classList.remove('active');
}

function showErrorView() {
  formView.classList.remove('active');
  resultsView.classList.remove('active');
  errorView.classList.add('active');
}

function renderResults() {
  const tones = [
    { key: 'casual', label: 'Casual', icon: '&#128172;' },
    { key: 'professional', label: 'Professional', icon: '&#128188;' },
    { key: 'punchy', label: 'Punchy', icon: '&#9889;' }
  ];

  resultsContainer.innerHTML = tones.map(tone => {
    const listing = currentResults[tone.key];
    const text = `${listing.title}\n\n${listing.description}`;

    return `
      <div class="result-card">
        <div class="result-header tone-${tone.key}">
          <div class="result-tone">
            <span class="tone-icon">${tone.icon}</span>
            <span class="tone-label">${tone.label}</span>
          </div>
        </div>
        <div class="result-body">
          <div class="result-title">${escapeHtml(listing.title)}</div>
          <div class="result-description">${escapeHtml(listing.description)}</div>
          <div class="result-actions">
            <button class="action-btn copy-btn" onclick="copyText('${encodeURIComponent(text)}', this)">Copy</button>
            <button class="action-btn autofill-btn" onclick="autofill('${encodeURIComponent(text)}')">Auto-fill</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.copyText = async function(encodedText, button) {
  const text = decodeURIComponent(encodedText);
  await navigator.clipboard.writeText(text);

  button.textContent = 'Copied!';
  button.classList.add('copied');

  setTimeout(() => {
    button.textContent = 'Copy';
    button.classList.remove('copied');
  }, 2000);
};

window.autofill = async function(encodedText) {
  const text = decodeURIComponent(encodedText);

  // Get active tab and inject the text
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'autofill',
      text: text
    });

    // Close popup after autofill
    window.close();
  } catch (error) {
    // Content script not loaded, copy to clipboard instead
    await navigator.clipboard.writeText(text);
    alert('Text copied! Paste it into the description field.');
  }
};
