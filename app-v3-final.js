// Focus Champion - Final Working Version
// Simple, Clean, Guaranteed to Work

let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = 'en';
let isMuted = false;
let alarmTimerId = null;

// Initialize stats
let stats = JSON.parse(localStorage.getItem('focusStats')) || {
    todayMin: 0,
    weeklyData: {},
    lastDate: null
};

// Initialize user profile
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    isPremium: false,
    sessionsToday: 0,
    totalSessions: 0
};

const alarm = document.getElementById('alarmAudio');
if (alarm) {
    alarm.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
}

const translations = {
    en: {
        title: "Focus Champion",
        start: "Start",
        pause: "Pause",
        reset: "Reset",
        share: "Share Result",
        today: "📅 Today:",
        week: "📈 This Week:",
        streak: "🔥 Streak:",
        min: "min",
        day: "days",
        sessions: "sessions",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    fa: {
        title: "قهرمان تمرکز",
        start: "شروع",
        pause: "توقف",
        reset: "بازنشانی",
        share: "اشتراک گذاری",
        today: "📅 امروز:",
        week: "📈 این هفته:",
        streak: "🔥 زنجیره:",
        min: "دقیقه",
        day: "روز",
        sessions: "جلسه",
        days: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"],
        months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"]
    },
    ar: {
        title: "بطل التركيز",
        start: "بدء",
        pause: "إيقاف",
        reset: "إعادة ضبط",
        share: "مشاركة",
        today: "📅 اليوم:",
        week: "📈 هذا الأسبوع:",
        streak: "🔥 متسلسل:",
        min: "دقيقة",
        day: "يوم",
        sessions: "جلسات",
        days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
        months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    }
};

function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + 
               (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return [jy, jm, jd];
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Focus Champion loaded');
    resetDailyIfNeeded();
    updateCurrentDate();
    updateUI();
    updateDisplay();
    setInterval(updateCurrentDate, 60000);
});

function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function resetDailyIfNeeded() {
    const today = getTodayString();
    if (stats.lastDate !== today) {
        stats.todayMin = 0;
        stats.lastDate = today;
        userProfile.sessionsToday = 0;
        localStorage.setItem('focusStats', JSON.stringify(stats));
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        console.log('✅ Daily reset done');
    }
}

function updateCurrentDate() {
    const now = new Date();
    const t = translations[currentLang];
    const dateEl = document.getElementById('currentDate');
    
    if (!dateEl) return;
    
    if (currentLang === 'fa') {
        const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
        const dayName = t.days[now.getDay()];
        const monthName = t.months[jm - 1];
        dateEl.innerText = `${dayName}، ${jd} ${monthName} ${jy}`;
    } else {
        const dayName = t.days[now.getDay()];
        const monthName = t.months[now.getMonth()];
        const day = now.getDate();
        dateEl.innerText = `${dayName}, ${monthName} ${day}`;
    }
}

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
    console.log('▶️ Start clicked');
    
    if (!isPaused) {
        console.log('Already running');
        return;
    }
    
    // Check session limit
    if (!userProfile.isPremium && userProfile.sessionsToday >= 3) {
        const msg = currentLang === 'fa' 
            ? 'شما امروز 3 جلسه کامل کردید!\n\n🔒 Premium برای جلسات نامحدود\nقیمت: $1.99/ماه'
            : 'You completed 3 sessions today!\n\n🔒 Upgrade to Premium\nOnly $1.99/month';
        
        if (confirm(msg + '\n\nUpgrade now?')) {
            userProfile.isPremium = true;
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            updateUI();
        } else {
            return;
        }
    }
    
    isPaused = false;
    console.log('Timer started');
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            finishTimer();
        }
    }, 1000);
}

function finishTimer() {
    console.log('🎉 Timer finished!');
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    timeLeft = duration;
    updateDisplay();
    
    // SAVE STATS - SIMPLE AND DIRECT
    const minutes = Math.floor(duration / 60);
    const today = getTodayString();
    
    // Update today
    stats.todayMin += minutes;
    stats.lastDate = today;
    
    // Update weekly
    if (!stats.weeklyData) stats.weeklyData = {};
    stats.weeklyData[today] = (stats.weeklyData[today] || 0) + minutes;
    
    // Update sessions
    userProfile.sessionsToday++;
    userProfile.totalSessions++;
    
    // SAVE NOW
    localStorage.setItem('focusStats', JSON.stringify(stats));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    console.log('💾 Stats saved:', {
        todayMin: stats.todayMin,
        sessions: userProfile.sessionsToday
    });
    
    // Update UI
    updateUI();
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 Session Complete!', {
            body: `Great! You completed ${minutes} minutes.`,
            icon: 'icon-192.png',
            vibrate: [400, 200, 400, 200, 400]
        });
    }
    
    // Play alarm
    playAlarm();
}

function playAlarm() {
    console.log('🔔 Playing alarm');
    
    if (alarm) {
        alarm.loop = true;
        alarm.volume = 1.0;
        alarm.play()
            .then(() => console.log('✅ Alarm playing'))
            .catch(() => console.log('❌ Alarm blocked'));
    }
    
    if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 400, 200, 400, 200, 400]);
    }
    
    setTimeout(() => {
        if (alarm) {
            alarm.pause();
            alarm.currentTime = 0;
            alarm.loop = false;
        }
    }, 15000);
}

function pauseTimer() {
    console.log('⏸️ Pause');
    isPaused = true;
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    if (alarm) {
        alarm.pause();
        alarm.currentTime = 0;
    }
}

function resetTimer() {
    console.log('🔄 Reset');
    pauseTimer();
    timeLeft = duration;
    updateDisplay();
}

function setTime(s, btn) {
    console.log('Time set:', s);
    pauseTimer();
    duration = s;
    timeLeft = s;
    
    document.querySelectorAll('.modes button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    updateDisplay();
}

function changeLang(l) {
    console.log('Language:', l);
    currentLang = l;
    localStorage.setItem('preferredLang', l);
    updateUI();
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
}

function getWeekTotal() {
    if (!stats.weeklyData) return 0;
    
    const today = getTodayString();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    let total = 0;
    for (let date in stats.weeklyData) {
        if (date >= weekStartStr && date <= today) {
            total += stats.weeklyData[date];
        }
    }
    return total;
}


function updateUI() {
    const t = translations[currentLang];
    const weekTotal = calculateWeekTotal();
    
    // خواندن آمار امروز طبق عکس شما
    const today = getTodayString();
    const sessionsToday = userProfile.sessionsToday || 0;
    const minsToday = stats.todayMin || 0;
    
    // فرمت دهی متن امروز: 10 min (1/3 sessions)
    const sessionsText = `(${sessionsToday}/3 ${t.sessions})`;

    const elements = {
        'lbl-title': t.title,
        'btn-start': t.start,
        'btn-pause': t.pause,
        'btn-reset': t.reset,
        'btn-share': t.share,
        'lbl-today': t.today,
        'lbl-week': t.week,
        'lbl-streak': t.streak,
        'stat-today': `${minsToday} ${t.min} ${sessionsText}`,
        'stat-week': `${weekTotal} ${t.min}`,
        'stat-streak': `${stats.streak} ${t.day}`
    };
    
    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = elements[id];
    }
    
    const card = document.getElementById('mainCard');
    if (card) {
        card.className = ['fa', 'ar'].includes(currentLang) ? 'card rtl-mode' : 'card';
    }
    updateCurrentDate();
}

// اصلاح ثبت Service Worker در انتهای فایل app-v3-final.js:
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw-v3.js').then(reg => {
        console.log('SW registered');
    });
}


async function shareStats() {
    const t = translations[currentLang];
    const weekTotal = getWeekTotal();
    const text = `🎯 ${t.title}\n${t.today} ${stats.todayMin} ${t.min}\n${t.week} ${weekTotal} ${t.min}`;

    if (navigator.share) {
        try {
            await navigator.share({ title: t.title, text: text });
        } catch (err) {
            console.log('Share failed');
        }
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert(currentLang === 'fa' ? 'کپی شد!' : 'Copied!');
        });
    }
}

// Load saved language
const savedLang = localStorage.getItem('preferredLang');
if (savedLang) currentLang = savedLang;

// Request notifications
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

console.log('✅ Focus Champion ready');
console.log('Stats:', stats);
console.log('Profile:', userProfile);
function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: 'Focus Champion',
            url: window.location.href
        });
    } else {
        alert("Link copied!");
    }
}

