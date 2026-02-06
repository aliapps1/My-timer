// Focus Timer Pro - Main App Logic
// Enhanced version with proper stats tracking and persistence

let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = 'en';
let isMuted = false;

// Load or initialize stats
let stats = JSON.parse(localStorage.getItem('focusStats')) || {
    todayMin: 0,
    weekMin: 0,
    streak: 0,
    lastActiveDate: null,
    weeklyData: {} // {date: minutes}
};

const alarm = document.getElementById('alarmAudio');

// Set alarm sound as data URI (embedded)
alarm.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwPj4+Pj4+TExMTExZWVlZWVlnZ2dnZ3V1dXV1dYODg4ODkZGRkZGRn5+fn5+frKysrKy6urq6urrIyMjIyNbW1tbW1uTk5OTk8vLy8vLy////////AAAAAExhdmM1OC4xMzQAAAAAAAAAAAAAAAAkBgAAAAAAAAA=';

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
        day: "days",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
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
        day: "روز",
        days: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"],
        months: ["ژانویه", "فوریه", "مارس", "آوریل", "می", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"]
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
        day: "يوم",
        days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
        months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    checkAndUpdateStreak();
    restoreTimerState();
    updateUI();
    updateDisplay();
    
    // Update date every minute
    setInterval(updateCurrentDate, 60000);
});

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const t = translations[currentLang];
    const dayName = t.days[now.getDay()];
    const monthName = t.months[now.getMonth()];
    const day = now.getDate();
    
    document.getElementById('currentDate').innerText = `${dayName}, ${monthName} ${day}`;
}

// Get today's date string
function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

// Get week start date
function getWeekStart() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

// Check and update streak
function checkAndUpdateStreak() {
    const today = getTodayString();
    
    if (!stats.lastActiveDate) {
        stats.lastActiveDate = today;
        stats.streak = 0;
    } else if (stats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (stats.lastActiveDate === yesterdayStr) {
            // Continuing streak
            stats.streak++;
        } else {
            // Streak broken
            stats.streak = 0;
        }
        
        stats.lastActiveDate = today;
        stats.todayMin = 0; // Reset daily counter
    }
    
    saveStats();
}

// Calculate weekly total
function calculateWeeklyTotal() {
    const weekStart = getWeekStart();
    const today = getTodayString();
    let total = 0;
    
    if (!stats.weeklyData) stats.weeklyData = {};
    
    // Add up all days in current week
    for (let key in stats.weeklyData) {
        if (key >= weekStart && key <= today) {
            total += stats.weeklyData[key] || 0;
        }
    }
    
    // Include today's minutes
    total += stats.todayMin;
    
    return total;
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('focusStats', JSON.stringify(stats));
}

// Update display
function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    // Update progress bar
    const progress = ((duration - timeLeft) / duration) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Start timer
function initAndStart() {
    if (!isPaused) return;
    isPaused = false;
    
    // Save end time
    const endTime = Date.now() + (timeLeft * 1000);
    localStorage.setItem('focus_timer_end', endTime);
    localStorage.setItem('focus_timer_duration', duration);
    localStorage.setItem('is_running', 'true');

    timerId = setInterval(syncTimer, 500);
}

// Sync timer with actual time
function syncTimer() {
    const end = localStorage.getItem('focus_timer_end');
    if (!end || isPaused) return;

    const now = Date.now();
    timeLeft = Math.max(0, Math.round((parseInt(end) - now) / 1000));
    updateDisplay();

    if (timeLeft <= 0) {
        finishTimer();
    }
}

// Finish timer
function finishTimer() {
    clearInterval(timerId);
    isPaused = true;
    localStorage.removeItem('focus_timer_end');
    localStorage.removeItem('is_running');
    localStorage.removeItem('focus_timer_duration');
    
    if (!isMuted && document.getElementById('soundChoice').value !== 'none') {
        alarm.play().catch(e => console.log('Audio play failed:', e));
        setTimeout(() => {
            alarm.pause();
            alarm.currentTime = 0;
        }, 15000);
    }
    
    completeSession();
}

// Pause timer
function pauseTimer() {
    isPaused = true;
    clearInterval(timerId);
    localStorage.removeItem('is_running');
    
    // Save current state
    localStorage.setItem('focus_timer_paused_time', timeLeft);
    
    alarm.pause();
}

// Reset timer
function resetTimer() {
    pauseTimer();
    localStorage.removeItem('focus_timer_end');
    localStorage.removeItem('focus_timer_paused_time');
    timeLeft = duration;
    updateDisplay();
}

// Set time mode
function setTime(s, btn) {
    resetTimer();
    duration = s;
    timeLeft = s;
    document.querySelectorAll('.modes button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateDisplay();
}

// Restore timer state on page load
function restoreTimerState() {
    const isRunning = localStorage.getItem('is_running') === 'true';
    const savedDuration = localStorage.getItem('focus_timer_duration');
    const pausedTime = localStorage.getItem('focus_timer_paused_time');
    
    if (savedDuration) {
        duration = parseInt(savedDuration);
    }
    
    if (isRunning) {
        syncTimer();
        isPaused = false;
        timerId = setInterval(syncTimer, 500);
    } else if (pausedTime) {
        timeLeft = parseInt(pausedTime);
        updateDisplay();
    }
}

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && localStorage.getItem('is_running') === 'true') {
        syncTimer();
    }
});

// Complete session
function completeSession() {
    const addedMin = Math.floor(duration / 60);
    const today = getTodayString();
    
    // Update stats
    stats.todayMin += addedMin;
    
    // Update weekly data
    if (!stats.weeklyData) stats.weeklyData = {};
    stats.weeklyData[today] = (stats.weeklyData[today] || 0) + addedMin;
    
    checkAndUpdateStreak();
    saveStats();
    updateUI();
    
    // Show completion notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Session Complete! 🎉', {
            body: `Great work! You completed ${addedMin} minutes of focused work.`,
            icon: 'icon-192.png'
        });
    }
}

// Update UI with current language
function updateUI() {
    const t = translations[currentLang];
    
    document.getElementById('lbl-title').innerText = t.title;
    document.getElementById('btn-start').innerText = t.start;
    document.getElementById('btn-pause').innerText = t.pause;
    document.getElementById('btn-reset').innerText = t.reset;
    document.getElementById('btn-share').innerText = t.share;
    document.getElementById('lbl-today').innerText = t.today;
    document.getElementById('lbl-week').innerText = t.week;
    document.getElementById('lbl-streak').innerText = t.streak;
    
    // Update stats
    document.getElementById('stat-today').innerText = stats.todayMin + " " + t.min;
    document.getElementById('stat-week').innerText = calculateWeeklyTotal() + " " + t.min;
    document.getElementById('stat-streak').innerText = stats.streak + " " + t.day;
    
    // Update RTL mode
    document.getElementById('mainCard').className = ['fa', 'ar'].includes(currentLang) ? 'card rtl-mode' : 'card';
    
    // Update date
    updateCurrentDate();
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').innerText = isMuted ? '🔇' : '🔊';
    if (isMuted) alarm.pause();
}

// Change language
function changeLang(l) {
    currentLang = l;
    localStorage.setItem('preferredLang', l);
    updateUI();
}

// Load preferred language
const savedLang = localStorage.getItem('preferredLang');
if (savedLang) {
    currentLang = savedLang;
}

// Share stats
async function shareStats() {
    const t = translations[currentLang];
    const text = `🎯 ${t.title}
${t.today} ${stats.todayMin} ${t.min}
${t.week} ${calculateWeeklyTotal()} ${t.min}  
${t.streak} ${stats.streak} ${t.day}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: t.title,
                text: text
            });
        } catch (err) {
            console.log('Share failed:', err);
        }
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert(currentLang === 'fa' ? 'کپی شد!' : currentLang === 'ar' ? 'تم النسخ!' : 'Copied!');
        });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW registration failed:', err);
    });
}
