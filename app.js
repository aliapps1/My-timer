// Focus Timer Pro - Minimal Working Version
console.log('App loaded successfully');

let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = 'en';
let isMuted = false;

const alarm = document.getElementById('alarmAudio');
if (alarm) {
    alarm.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
}

const translations = {
    en: {
        title: "Focus Timer Pro",
        start: "Start",
        pause: "Pause",
        reset: "Reset",
        share: "Share Result",
        today: "📅 Today:",
        week: "📈 This Week:",
        streak: "🔥 Streak:",
        min: "min",
        day: "days"
    },
    fa: {
        title: "تایمر تمرکز",
        start: "شروع",
        pause: "توقف",
        reset: "بازنشانی",
        share: "اشتراک گذاری",
        today: "📅 امروز:",
        week: "📈 این هفته:",
        streak: "🔥 زنجیره:",
        min: "دقیقه",
        day: "روز"
    },
    ar: {
        title: "مؤقت التركيز",
        start: "بدء",
        pause: "إيقاف",
        reset: "إعادة ضبط",
        share: "مشاركة",
        today: "📅 اليوم:",
        week: "📈 هذا الأسبوع:",
        streak: "🔥 متسلسل:",
        min: "دقيقة",
        day: "يوم"
    }
};

function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const display = document.getElementById('display');
    if (display) {
        display.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((duration - timeLeft) / duration) * 100;
        progressBar.style.width = progress + '%';
    }
}

function initAndStart() {
    console.log('Start button clicked!');
    
    if (!isPaused) {
        console.log('Already running');
        return;
    }
    
    isPaused = false;
    console.log('Timer started, timeLeft:', timeLeft);
    
    timerId = setInterval(() => {
        timeLeft--;
        console.log('Tick:', timeLeft);
        updateDisplay();
        
        if (timeLeft <= 0) {
            finishTimer();
        }
    }, 1000);
}

function finishTimer() {
    console.log('Timer finished!');
    clearInterval(timerId);
    isPaused = true;
    timeLeft = duration;
    updateDisplay();
    
    // Play alarm
    if (alarm && !isMuted) {
        alarm.play().catch(err => console.log('Audio error:', err));
    }
    
    // Show alert
    alert('🎉 Timer Complete!');
}

function pauseTimer() {
    console.log('Pause button clicked');
    isPaused = true;
    clearInterval(timerId);
}

function resetTimer() {
    console.log('Reset button clicked');
    pauseTimer();
    timeLeft = duration;
    updateDisplay();
}

function setTime(s, btn) {
    console.log('Time button clicked:', s);
    pauseTimer();
    duration = s;
    timeLeft = s;
    
    // Update active button
    document.querySelectorAll('.modes button').forEach(b => b.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
    }
    
    updateDisplay();
}

function changeLang(l) {
    console.log('Language changed to:', l);
    currentLang = l;
    updateUI();
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    if (btn) {
        btn.innerText = isMuted ? '🔇' : '🔊';
    }
}

function updateUI() {
    const t = translations[currentLang];
    
    const elements = {
        'lbl-title': t.title,
        'btn-start': t.start,
        'btn-pause': t.pause,
        'btn-reset': t.reset,
        'btn-share': t.share,
        'lbl-today': t.today,
        'lbl-week': t.week,
        'lbl-streak': t.streak
    };
    
    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = elements[id];
        }
    }
    
    const card = document.getElementById('mainCard');
    if (card) {
        card.className = ['fa', 'ar'].includes(currentLang) ? 'card rtl-mode' : 'card';
    }
}

async function shareStats() {
    const text = '🎯 Focus Timer Pro - Great session!';
    if (navigator.share) {
        try {
            await navigator.share({ title: 'Focus Timer', text: text });
        } catch (err) {
            console.log('Share failed:', err);
        }
    } else {
        alert('Copied!');
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    updateUI();
    updateDisplay();
});

console.log('App.js finished loading');
