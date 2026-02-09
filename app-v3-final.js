// Focus Champion v3.0 - Complete Working Version
// Based on successful quick-test logic

let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = 'en';
let isMuted = false;
let alarmTimerId = null;

// User profile
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    isPremium: false,
    sessionsToday: 0,
    totalSessions: 0,
    level: 1,
    xp: 0,
    lastResetDate: null
};

// Stats
let stats = JSON.parse(localStorage.getItem('focusStats')) || {
    todayMin: 0,
    weekMin: 0,
    totalMin: 0,
    streak: 0,
    lastActiveDate: null,
    weeklyData: {},
    dailySessions: {}
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

// Persian calendar
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
    console.log('🚀 Focus Champion v3.0 loaded');
    resetDailySessionsIfNeeded();
    updateCurrentDate();
    updateUI();
    updateDisplay();
    setInterval(updateCurrentDate, 60000);
    console.log('📊 Current stats:', stats);
    console.log('👤 User profile:', userProfile);
});

function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function getWeekStart() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    return `${weekStart.getFullYear()}-${(weekStart.getMonth()+1).toString().padStart(2,'0')}-${weekStart.getDate().toString().padStart(2,'0')}`;
}

function resetDailySessionsIfNeeded() {
    const today = getTodayString();
    if (userProfile.lastResetDate !== today) {
        console.log('🔄 Resetting daily sessions for:', today);
        userProfile.sessionsToday = 0;
        userProfile.lastResetDate = today;
        stats.todayMin = 0;
        saveUserProfile();
        saveStats();
    }
}

function saveUserProfile() {
    try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        console.log('✅ User profile saved');
    } catch (e) {
        console.error('❌ Failed to save user profile:', e);
    }
}

function saveStats() {
    try {
        localStorage.setItem('focusStats', JSON.stringify(stats));
        console.log('✅ Stats saved:', stats);
    } catch (e) {
        console.error('❌ Failed to save stats:', e);
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

function canStartSession() {
    if (userProfile.isPremium) {
        return true;
    }
    
    const FREE_LIMIT = 3;
    if (userProfile.sessionsToday >= FREE_LIMIT) {
        console.log('⚠️ Free session limit reached');
        showPremiumPrompt();
        return false;
    }
    
    return true;
}

function showPremiumPrompt() {
    const message = currentLang === 'fa' 
        ? `شما امروز ${userProfile.sessionsToday} جلسه کامل کردید.\n\n🔒 نسخه Premium برای جلسات نامحدود!\n\nقیمت: فقط $1.99/ماه\n\nآیا می‌خواهید ارتقا دهید؟`
        : `You've completed ${userProfile.sessionsToday} sessions today.\n\n🔒 Upgrade to Premium for unlimited sessions!\n\nOnly $1.99/month\n\nUpgrade now?`;
    
    if (confirm(message)) {
        alert('🚀 Premium feature coming soon!\n\nFor now, enjoy unlimited access! 😊');
        userProfile.isPremium = true;
        saveUserProfile();
        updateUI();
    }
}

function initAndStart() {
    console.log('▶️ Start button clicked');
    
    if (!isPaused) {
        console.log('⚠️ Already running');
        return;
    }
    
    if (!canStartSession()) {
        return;
    }
    
    isPaused = false;
    console.log('✅ Timer started, duration:', duration, 'seconds');
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Simple countdown timer (like quick-test)
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
    
    // Reset display
    timeLeft = duration;
    updateDisplay();
    
    // Update stats - SIMPLE AND DIRECT (like quick-test)
    const addedMin = Math.floor(duration / 60);
    const today = getTodayString();
    
    console.log('📊 Updating stats...');
    console.log('- Adding minutes:', addedMin);
    console.log('- Today:', today);
    
    // Update session count
    userProfile.sessionsToday++;
    userProfile.totalSessions++;
    console.log('- Sessions today:', userProfile.sessionsToday);
    console.log('- Total sessions:', userProfile.totalSessions);
    
    // Update minutes
    stats.todayMin += addedMin;
    stats.totalMin += addedMin;
    console.log('- Today minutes:', stats.todayMin);
    console.log('- Total minutes:', stats.totalMin);
    
    // Update weekly data
    if (!stats.weeklyData) stats.weeklyData = {};
    stats.weeklyData[today] = (stats.weeklyData[today] || 0) + addedMin;
    console.log('- Weekly data updated');
    
    // Update daily sessions
    if (!stats.dailySessions) stats.dailySessions = {};
    stats.dailySessions[today] = (stats.dailySessions[today] || 0) + 1;
    
    // Update last active date
    stats.lastActiveDate = today;
    
    // XP and level
    const xpGained = addedMin * 2;
    userProfile.xp += xpGained;
    console.log('- XP gained:', xpGained);
    console.log('- Total XP:', userProfile.xp);
    
    // SAVE EVERYTHING
    saveStats();
    saveUserProfile();
    console.log('💾 Stats saved successfully!');
    
    // Update UI
    updateUI();
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 Focus Session Complete!', {
            body: `Great work! You completed ${addedMin} minutes.`,
            icon: 'icon-192.png',
            requireInteraction: true,
            vibrate: [400, 200, 400, 200, 400]
        });
    }
    
    // Play alarm
    playAlarmWithStop();
    
    console.log('✅ Session complete!');
}

function playAlarmWithStop() {
    console.log('🔔 Playing alarm');
    
    if (alarmTimerId) {
        clearTimeout(alarmTimerId);
        alarmTimerId = null;
    }
    
    if (alarm) {
        alarm.pause();
        alarm.currentTime = 0;
        alarm.loop = true;
        alarm.volume = 1.0;
        
        alarm.play()
            .then(() => console.log('✅ Alarm playing'))
            .catch(err => {
                console.log('❌ Alarm blocked:', err);
                createWebAudioAlarm();
            });
    }
    
    if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 400, 200, 400, 200, 400]);
    }
    
    alarmTimerId = setTimeout(() => {
        console.log('⏹️ Auto-stopping alarm');
        if (alarm) {
            alarm.pause();
            alarm.loop = false;
            alarm.currentTime = 0;
        }
        alarmTimerId = null;
    }, 15000);
}

function createWebAudioAlarm() {
    console.log('🔊 Using Web Audio API');
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.5;
        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }, i * 1000);
        }
    } catch (err) {
        console.log('❌ Web Audio error:', err);
    }
}

function pauseTimer() {
    console.log('⏸️ Pause clicked');
    isPaused = true;
    
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    
    if (alarm) {
        alarm.pause();
        alarm.loop = false;
        alarm.currentTime = 0;
    }
    
    if (alarmTimerId) {
        clearTimeout(alarmTimerId);
        alarmTimerId = null;
    }
}

function resetTimer() {
    console.log('🔄 Reset clicked');
    pauseTimer();
    timeLeft = duration;
    updateDisplay();
}

function setTime(s, btn) {
    console.log('⏱️ Time button clicked:', s);
    pauseTimer();
    duration = s;
    timeLeft = s;
    
    document.querySelectorAll('.modes button').forEach(b => b.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
    }
    
    updateDisplay();
}

function changeLang(l) {
    console.log('🌐 Language changed to:', l);
    currentLang = l;
    localStorage.setItem('preferredLang', l);
    updateUI();
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    if (btn) {
        btn.innerText = isMuted ? '🔇' : '🔊';
    }
    if (isMuted && alarm) {
        alarm.pause();
    }
}

function calculateWeekTotal() {
    let weekTotal = 0;
    const today = getTodayString();
    const weekStart = getWeekStart();
    
    if (stats.weeklyData) {
        for (let date in stats.weeklyData) {
            if (date >= weekStart && date <= today) {
                weekTotal += stats.weeklyData[date] || 0;
            }
        }
    }
    
    return weekTotal;
}

function updateUI() {
    const t = translations[currentLang];
    const weekTotal = calculateWeekTotal();
    
    let sessionInfo = '';
    if (!userProfile.isPremium) {
        sessionInfo = ` (${userProfile.sessionsToday}/3 ${t.sessions})`;
    }
    
    const elements = {
        'lbl-title': t.title,
        'btn-start': t.start,
        'btn-pause': t.pause,
        'btn-reset': t.reset,
        'btn-share': t.share,
        'lbl-today': t.today,
        'lbl-week': t.week,
        'lbl-streak': t.streak,
        'stat-today': stats.todayMin + " " + t.min + sessionInfo,
        'stat-week': weekTotal + " " + t.min,
        'stat-streak': stats.streak + " " + t.day
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
    
    updateCurrentDate();
    console.log('🔄 UI updated - Today:', stats.todayMin, 'Week:', weekTotal, 'Sessions:', userProfile.sessionsToday);
}

async function shareStats() {
    const t = translations[currentLang];
    const weekTotal = calculateWeekTotal();
    const text = `🎯 ${t.title}\n${t.today} ${stats.todayMin} ${t.min}\n${t.week} ${weekTotal} ${t.min}\n${t.streak} ${stats.streak} ${t.day}`;

    if (navigator.share) {
        try {
            await navigator.share({ title: t.title, text: text });
        } catch (err) {
            console.log('Share failed:', err);
        }
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert(currentLang === 'fa' ? 'کپی شد!' : currentLang === 'ar' ? 'تم النسخ!' : 'Copied!');
        });
    }
}

const savedLang = localStorage.getItem('preferredLang');
if (savedLang) {
    currentLang = savedLang;
}

if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=3').then(reg => {
        console.log('Service Worker registered');
    }).catch(err => {
        console.log('SW registration failed:', err);
    });
}

console.log('✅ Focus Champion v3.0 ready!');
console.log('📊 Stats:', stats);
console.log('👤 Profile:', userProfile);
