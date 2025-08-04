// utils/hueController.js

const bridgeIp = "34e31a34f0a1.ngrok-free.app"; // Replace
const username = "Qf5lwr5wH8QMbsp5699GCBzJNRuVUqAgWhm6JIVi"; // Replace


export async function sendColorsToHueLights(colors) {
    try {
        for (let i = 0; i < colors.length; i++) {
            await sendColorToHueLight(i + 1, colors[i]);
        }
        return true;
    } catch (error) {
        console.error("Error sending colors to Hue lights:", error);
        return false;
    }
}

async function sendColorToHueLight(lightId, colorState) {
    const url = `https://${bridgeIp}/api/${username}/lights/${lightId}/state`;

    const payload = {
        on: true,
        hue: Math.round(colorState.hue * 182.04),
        sat: Math.round(colorState.sat * 2.54),
        bri: Math.round((colorState.bri / 100) * 254),
        transitiontime: 10
    };

    const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Failed to update light ${lightId}`);
    }

    return await response.json();
}
