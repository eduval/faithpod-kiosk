const BRIDGE_IP = "IP-HERE";
const API_USERNAME = "USERNAME-HERE";
const LIGHT_IDS = ["1", "2", "3", "4"]; // Replace with actual light IDs

const onBtn = document.getElementById('on-btn');
const offBtn = document.getElementById('off-btn');
const brightnessSlider = document.getElementById('brightness-slider');
const statusMessage = document.getElementById('status-message');
const colorControls = document.getElementById('color-controls');

// Generate individual light controls dynamically
LIGHT_IDS.forEach(id => {
  const card = document.createElement('div');
  card.className = 'control-card';
  card.innerHTML = `
    <h2>Light ${id}</h2>
    <div class="button-group">
      <button class="on-btn" data-id="${id}">ON</button>
      <button class="off-btn" data-id="${id}">OFF</button>
    </div>
    <label>Brightness:</label>
    <input type="range" min="1" max="100" value="100" class="brightness-slider" data-id="${id}">
    <br>
    <label>Color:</label>
    <input type="color" class="color-picker" data-id="${id}" value="#ffffff">
  `;
  colorControls.appendChild(card);
});

// Global ON
onBtn.addEventListener('click', () => {
  updateAllLights({ on: true });
});

// Global OFF
offBtn.addEventListener('click', () => {
  updateAllLights({ on: false });
});

// Global Brightness
brightnessSlider.addEventListener('input', () => {
  const brightness = Math.round(parseInt(brightnessSlider.value, 10) * 2.54);
  updateAllLights({ bri: brightness });
});

// Event delegation for individual controls
colorControls.addEventListener('input', (e) => {
  const id = e.target.dataset.id;

  // Individual brightness
  if (e.target.classList.contains('brightness-slider')) {
    const bri = Math.round(parseInt(e.target.value, 10) * 2.54);
    updateSingleLight(id, { bri });
  }

  // Individual color
  if (e.target.classList.contains('color-picker')) {
    const hex = e.target.value;
    const hsb = hexToHsb(hex);
    updateSingleLight(id, {
      on: true,
      hue: hsb.h,
      sat: hsb.s,
      bri: hsb.b
    });
  }
});

colorControls.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  const id = e.target.dataset.id;
  const isOn = e.target.classList.contains('on-btn');
  updateSingleLight(id, { on: isOn });
});

// Update all lights
async function updateAllLights(state) {
  statusMessage.textContent = "Sending command to all lights...";
  try {
    const promises = LIGHT_IDS.map(id => updateSingleLight(id, state));
    await Promise.all(promises);
    statusMessage.textContent = "All lights updated";
  } catch (err) {
    console.error(err);
    statusMessage.textContent = `Error: ${err.message}`;
  }
}

// Update one light
async function updateSingleLight(lightId, state) {
  const url = `http://${BRIDGE_IP}/api/${API_USERNAME}/lights/${lightId}/state`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(state)
    });
    const data = await response.json();
    if (data[0] && data[0].error) {
      throw new Error(`Light ${lightId}: ${data[0].error.description}`);
    }
    statusMessage.textContent = `Light ${lightId} updated`;
  } catch (err) {
    console.error(err);
    statusMessage.textContent = `Error: ${err.message}`;
  }
}

// Convert HEX color to HSB
function hexToHsb(hex) {
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max, d = max - min;

  s = max === 0 ? 0 : d / max;

  if (max === min) h = 0;
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 65535),
    s: Math.round(s * 254),
    b: Math.round(v * 254)
  };
}
