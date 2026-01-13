// ListingWriter Browser Extension - Content Script
// Runs on marketplace pages to enable auto-fill functionality

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    autofillDescription(request.text);
    sendResponse({ success: true });
  }
  return true;
});

// Autofill the description field on the current page
function autofillDescription(text) {
  const hostname = window.location.hostname;

  // Try different selectors based on the marketplace
  const selectors = getSelectorsForSite(hostname);

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      fillElement(element, text);
      showToast('Listing description filled!');
      return;
    }
  }

  // If no specific selector found, try common patterns
  const commonSelectors = [
    'textarea[name*="description"]',
    'textarea[id*="description"]',
    'textarea[placeholder*="description"]',
    'textarea[aria-label*="description"]',
    '[contenteditable="true"]',
    'textarea',
  ];

  for (const selector of commonSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (isDescriptionField(element)) {
        fillElement(element, text);
        showToast('Listing description filled!');
        return;
      }
    }
  }

  // Fallback: copy to clipboard
  navigator.clipboard.writeText(text);
  showToast('Description copied! Paste it manually.');
}

// Get site-specific selectors
function getSelectorsForSite(hostname) {
  if (hostname.includes('craigslist')) {
    return [
      'textarea#PostingBody',
      'textarea[name="PostingBody"]',
      '#postingForm textarea',
    ];
  }

  if (hostname.includes('facebook.com')) {
    return [
      '[aria-label="Description"]',
      '[aria-label="Describe your item"]',
      'textarea[placeholder*="Describe"]',
      '[data-testid="marketplace-description-input"]',
    ];
  }

  if (hostname.includes('offerup')) {
    return [
      'textarea[name="description"]',
      '[data-testid="description-input"]',
      '#description',
    ];
  }

  if (hostname.includes('mercari')) {
    return [
      'textarea[name="description"]',
      '#item-description',
      '[data-testid="description"]',
    ];
  }

  if (hostname.includes('poshmark')) {
    return [
      'textarea[name="description"]',
      '#description',
      '.listing-editor__description textarea',
    ];
  }

  if (hostname.includes('ebay')) {
    return [
      'textarea[name="description"]',
      '#description',
      '[data-testid="description-text-area"]',
      'iframe#desc_ifr', // eBay uses an iframe for description
    ];
  }

  return [];
}

// Check if element looks like a description field
function isDescriptionField(element) {
  const text = (
    (element.name || '') +
    (element.id || '') +
    (element.placeholder || '') +
    (element.getAttribute('aria-label') || '')
  ).toLowerCase();

  const keywords = ['description', 'details', 'about', 'describe', 'body'];
  return keywords.some(kw => text.includes(kw));
}

// Fill an element with text
function fillElement(element, text) {
  if (element.tagName === 'IFRAME') {
    // Handle iframe (like eBay's rich text editor)
    try {
      const doc = element.contentDocument || element.contentWindow.document;
      const body = doc.body;
      if (body) {
        body.innerHTML = text.replace(/\n/g, '<br>');
      }
    } catch (e) {
      console.error('Cannot access iframe:', e);
    }
    return;
  }

  if (element.contentEditable === 'true') {
    // Contenteditable element
    element.innerHTML = text.replace(/\n/g, '<br>');
    element.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  // Regular input/textarea
  element.value = text;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));

  // For React-based sites, also try setting via native setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, text);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Show a toast notification
function showToast(message) {
  // Remove existing toast
  const existing = document.getElementById('lw-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'lw-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Inject toast styles
const style = document.createElement('style');
style.textContent = `
  #lw-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    padding: 12px 24px;
    border-radius: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
    z-index: 2147483647;
    transition: transform 0.3s ease;
  }
  #lw-toast.show {
    transform: translateX(-50%) translateY(0);
  }
`;
document.head.appendChild(style);

console.log('ListingWriter content script loaded');
