// utils/colorCalculator.js

// Color to ambience mapping
const colorToAmbience = {
    red: 'tokyo',
    orange: 'brom',
    yellow: 'bright',
    green: 'tolvo',
    blue: 'electrical',
    purple: 'soho',
    pink: 'tropical',
    none: 'bright'
};

// Ambience palettes
const ambiencePalettes = {
    bright: {
        colors: [
            { hue: 50, sat: 20, bri: 100 },
            { hue: 60, sat: 10, bri: 90 },
            { hue: 45, sat: 15, bri: 95 },
        ]
    },
    tolvo: {
        colors: [
            { hue: 200, sat: 30, bri: 60 },
            { hue: 180, sat: 40, bri: 55 },
            { hue: 210, sat: 35, bri: 50 }
        ]
    },
    tropical: {
        colors: [
            { hue: 320, sat: 80, bri: 70 },
            { hue: 280, sat: 60, bri: 65 },
            { hue: 250, sat: 70, bri: 60 }
        ]
    },
    soho: {
        colors: [
            { hue: 300, sat: 40, bri: 50 },
            { hue: 260, sat: 45, bri: 55 },
            { hue: 220, sat: 50, bri: 60 }
        ]
    },
    electrical: {
        colors: [
            { hue: 190, sat: 90, bri: 85 },
            { hue: 220, sat: 85, bri: 80 },
            { hue: 160, sat: 80, bri: 90 }
        ]
    },
    brom: {
        colors: [
            { hue: 30, sat: 60, bri: 50 },
            { hue: 15, sat: 65, bri: 55 },
            { hue: 45, sat: 70, bri: 60 }
        ]
    },
    tokyo: {
        colors: [
            { hue: 340, sat: 80, bri: 70 },
            { hue: 290, sat: 85, bri: 75 },
            { hue: 320, sat: 90, bri: 80 }
        ]
    },
    euphoria: {
        colors: [
            { hue: 0, sat: 100, bri: 100 },
            { hue: 120, sat: 100, bri: 100 },
            { hue: 240, sat: 100, bri: 100 }
        ]
    },
    rainbow: {
        colors: [
            { hue: 0, sat: 100, bri: 100 },
            { hue: 60, sat: 100, bri: 100 },
            { hue: 120, sat: 100, bri: 100 },
            { hue: 180, sat: 100, bri: 100 },
            { hue: 240, sat: 100, bri: 100 },
            { hue: 300, sat: 100, bri: 100 }
        ]
    }
};

// Feeling modifiers
const feelingModifiers = {
    peaceful: { hue: 180, sat: -10, bri: 5 },
    overwhelmed: { hue: 0, sat: 30, bri: -10 },
    grateful: { hue: 60, sat: 10, bri: 10 },
    hopeful: { hue: 50, sat: 15, bri: 20 },
    confused: { hue: 300, sat: 20, bri: -5 },
    seeking: { hue: 120, sat: 5, bri: 0 },
    troubled: { hue: 0, sat: 20, bri: -15 },
    joyful: { hue: 40, sat: 30, bri: 20 }
};

// Mood modifiers
const moodModifiers = {
    neutral: { hue: 0, sat: 0, bri: 0 },
    happy: { hue: 30, sat: 20, bri: 20 },
    sad: { hue: 220, sat: 10, bri: -15 },
    angry: { hue: 0, sat: 30, bri: -10 },
    surprised: { hue: 60, sat: 25, bri: 15 }
};

// Focus modifiers
const focusModifiers = {
    reflection: { hue: 0, sat: -15, bri: -10 },
    love: { hue: 10, sat: 10, bri: 5 },
    worship: { hue: 20, sat: 15, bri: 10 },
    study: { hue: -10, sat: -5, bri: 5 },
    nature: { hue: 30, sat: 5, bri: 0 }
};

// Favorite color modifiers
const favoriteColorModifiers = {
    red: { hue: 0, sat: 20, bri: 15 },
    orange: { hue: 30, sat: 10, bri: 5 },
    yellow: { hue: 55, sat: 5, bri: 10 },
    green: { hue: 120, sat: 15, bri: 10 },
    blue: { hue: 210, sat: 15, bri: 5 },
    purple: { hue: 280, sat: 15, bri: 10 },
    pink: { hue: 330, sat: 20, bri: 10 }
};

export function calculateLightColors(userInputs) {
    const { favoriteColor, feelingToday, focusToday, mood } = userInputs;

    // Determine ambience based on favorite color
    const colorKey = favoriteColor?.toLowerCase();
    const ambience = colorToAmbience[colorKey] || 'bright';
    const palette = ambiencePalettes[ambience];

    // Deep copy the base colors
    let colors = JSON.parse(JSON.stringify(palette.colors));

    // Apply feeling modifiers
    const feeling = feelingToday?.toLowerCase();
    if (feeling && feelingModifiers[feeling]) {
        const mod = feelingModifiers[feeling];
        colors.forEach(color => {
            color.hue = (color.hue + mod.hue + 360) % 360;
            color.sat = Math.max(20, Math.min(100, color.sat + mod.sat));
            color.bri = Math.max(30, Math.min(100, color.bri + mod.bri));
        });
    }

    // Apply mood modifiers
    const moodKey = mood?.toLowerCase();
    if (moodKey && moodModifiers[moodKey]) {
        const mod = moodModifiers[moodKey];
        colors.forEach(color => {
            color.hue = (color.hue + mod.hue + 360) % 360;
            color.sat = Math.max(20, Math.min(100, color.sat + mod.sat));
            color.bri = Math.max(30, Math.min(100, color.bri + mod.bri));
        });
    }

    // Apply focus modifiers
    const focus = focusToday?.toLowerCase();
    if (focus) {
        // Find which focus option matches (partial match)
        const focusKey = Object.keys(focusModifiers).find(key =>
            focus.includes(key.toLowerCase())
        );

        if (focusKey) {
            const mod = focusModifiers[focusKey];
            colors.forEach(color => {
                color.hue = (color.hue + mod.hue + 360) % 360;
                color.sat = Math.max(20, Math.min(100, color.sat + mod.sat));
                color.bri = Math.max(30, Math.min(100, color.bri + mod.bri));
            });
        }
    }

    // Apply favorite color modifiers
    if (colorKey && favoriteColorModifiers[colorKey]) {
        const mod = favoriteColorModifiers[colorKey];
        colors.forEach(color => {
            color.hue = (color.hue + mod.hue + 360) % 360;
            color.sat = Math.max(20, Math.min(100, color.sat + mod.sat));
            color.bri = Math.max(30, Math.min(100, color.bri + mod.bri));
        });
    }

    // Special case for very happy mood
    if (feeling === 'joyful' && moodKey === 'happy') {
        if (Math.random() > 0.5) {
            colors = JSON.parse(JSON.stringify(ambiencePalettes.euphoria.colors));
        }
    }

    // Ensure exactly 4 lights
    while (colors.length < 4) {
        colors.push(JSON.parse(JSON.stringify(colors[colors.length % palette.colors.length])));
    }

    return colors.slice(0, 4);
}