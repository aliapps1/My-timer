// Focus Timer Pro - Version 3.0 (Fixed Background & Stats)
let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = localStorage.getItem('preferredLang') || 'en';
let isMuted = false;
let alarmTimerId = null;

let stats = JSON.parse(localStorage.getItem('focusStats')) || {
    todayMin: 0,
    weekMin: 0,
    streak: 0,
    lastActiveDate: null,
    weeklyData: {}
};

const alarm = document.getElementById('alarmAudio');
if (alarm) {
    alarm.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
}

const translations = {
    en: { title: "Focus Timer Pro", start: "Start", pause: "Pause", reset: "Reset", share: "Share Result", today: "📅 Today:", week: "📈 This Week:", streak: "🔥 Streak:", min: "min", day: "days", days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] },
    fa: { title: "تایمر تمرکز", start: "شروع", pause: "توقف", reset: "بازنشانی", share: "اشتراک گذاری", today: "📅 امروز:", week: "📈 این هفته:", streak: "🔥 زنجیره:", min: "دقیقه", day: "روز", days: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"], months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"] },
    ar: { title: "مؤقت التركيز", start: "بدء", pause: "إيقاف", reset: "إعادة ضبط", share: "مشاركة", today: "📅 اليوم:", week: "📈 هذا الأسبوع:", streak: "🔥 متسلسل:", min: "دقيقة", day: "يوم", days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"], months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"] }
};

document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    checkForCompletedTimer();
    restoreTimerState();
    updateUI();
    updateDisplay();
    setInterval(updateCurrentDate, 60000);
});

function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const display = document.getElementById('display');
    if (display) display.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = ((duration - timeLeft) / duration) * 100 + '%';
}

function initAndStart() {
    if (!isPaused) return;
    isPaused = false;
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    const endTime = Date.now() + (timeLeft * 1000);
    localStorage.setItem('focus_timer_end', endTime);
    localStorage.setItem('focus_timer_duration', duration);
    localStorage.setItem('is_running', 'true');
    
    timerId = setInterval(syncTimer, 1000);
    
    // هماهنگی با Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'TIMER_STARTED',
            endTime: endTime
        });
    }
}

function syncTimer() {
    const endTime = parseInt(localStorage.getItem('focus_timer_end'));
    if (!endTime) { pauseTimer(); return; }
    
    const now = Date.now();
    const remaining = Math.round((endTime - now) / 1000);
    
    if (remaining <= 0) {
        timeLeft = 0;
        finishTimer();
    } else {
        timeLeft = remaining;
        updateDisplay();
    }
}

function finishTimer() {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    
    localStorage.removeItem('is_running');
    localStorage.removeItem('focus_timer_end');
    
    const addedMin = Math.floor(duration / 60);
    stats.todayMin += addedMin;
    const today = getTodayString();
    if (!stats.weeklyData) stats.weeklyData = {};
    stats.weeklyData[today] = (stats.weeklyData[today] || 0) + addedMin;
    localStorage.setItem('focusStats', JSON.stringify(stats));
    
    timeLeft = duration;
    updateDisplay();
    updateUI();
    playAlarmWithStop();
}

function checkForCompletedTimer() {
    const isRunning = localStorage.getItem('is_running') === 'true';
    const endTime = parseInt(localStorage.getItem('focus_timer_end'));
    if (isRunning && endTime && Date.now() >= endTime) {
        finishTimer();
    }
}

function updateUI() {
    const t = translations[currentLang];
    let weekTotal = 0;
    const today = getTodayString();
    const weekStart = getWeekStart();
    if (stats.weeklyData) {
        for (let date in stats.weeklyData) {
            if (date >= weekStart && date <= today) weekTotal += stats.weeklyData[date];
        }
    }
    
    const elements = {
        'lbl-title': t.title, 'btn-start': t.start, 'btn-pause': t.pause, 'btn-reset': t.reset,
        'btn-share': t.share, 'lbl-today': t.today, 'lbl-week': t.week, 'lbl-streak': t.streak,
        'stat-today': stats.todayMin + " " + t.min, 'stat-week': weekTotal + " " + t.min, 'stat-streak': stats.streak + " " + t.day
    };
    for (let id in elements) { if (document.getElementById(id)) document.getElementById(id).innerText = elements[id]; }
    document.getElementById('mainCard').className = ['fa', 'ar'].includes(currentLang) ? 'card rtl-mode' : 'card';
}

// بقیه توابع (تاریخ، آلارم و ...) همان کدهای قبلی خودت بماند
function getTodayString() { const d = new Date(); return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`; }
function getWeekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return getTodayString(); }
function pauseTimer() { isPaused = true; clearInterval(timerId); localStorage.removeItem('is_running'); if (alarm) alarm.pause(); }
function resetTimer() { pauseTimer(); timeLeft = duration; updateDisplay(); }
function setTime(s, btn) { pauseTimer(); duration = s; timeLeft = s; document.querySelectorAll('.modes button').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); updateDisplay(); }
function changeLang(l) { currentLang = l; localStorage.setItem('preferredLang', l); updateUI(); }
function playAlarmWithStop() { if (alarm) { alarm.play().catch(() => createWebAudioAlarm()); } if ('vibrate' in navigator) navigator.vibrate([500, 200, 500]); }
// ... (Calendar & WebAudio backup)
