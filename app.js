// Focus Champion - Premium Gamified Timer
// Version 2.0 - Monetization Ready

let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = 'en';
let isMuted = false;
let alarmTimerId = null;

// User profile with premium status
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    isPremium: false,
    sessionsToday: 0,
    totalSessions: 0,
    level: 1,
    xp: 0,
    badges: [],
    lastResetDate: null
};

// Stats tracking
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
        level: "⭐ Level:",
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
        level: "⭐ سطح:",
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
        level: "⭐ المستوى:",
        min: "دقيقة",
        day: "يوم",
        sessions: "جلسات",
        days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
        months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    }
};

// Persian calendar converter
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
    console.log('Focus Champion v2.0 initialized');
    resetDailySessionsIfNeeded();
    updateCurrentDate();
    checkForCompletedTimer();
    restoreTimerState();
    updateUI();
    updateDisplay();
    setInterval(updateCurrentDate, 60000);
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

// Reset daily sessions at midnight
function resetDailySessionsIfNeeded() {
    const today = getTodayString();
    if (userProfile.lastResetDate !== today) {
        userProfile.sessionsToday = 0;
        userProfile.lastResetDate = today;
        saveUserProfile();
        console.log('Daily sessions reset for:', today);
    }
}

function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function saveStats() {
    localStorage.setItem('focusStats', JSON.stringify(stats));
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

// Check session limit for free users
function canStartSession() {
    if (userProfile.isPremium) {
        return true; // Premium users have unlimited sessions
    }
    
    const FREE_LIMIT = 3;
    if (userProfile.sessionsToday >= FREE_LIMIT) {
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
        // Redirect to premium page
        window.location.href = '#premium';
        showPremiumPage();
    }
}

function showPremiumPage() {
    alert('🚀 Premium features coming soon!\n\nFor now, I\'ll give you unlimited access 😊');
    // Temporary: unlock premium
    userProfile.isPremium = true;
    saveUserProfile();
    updateUI();
}

function initAndStart() {
    console.log('Start clicked');
    
    if (!isPaused) {
        console.log('Already running');
        return;
    }
    
    // Check session limit
    if (!canStartSession()) {
        return;
    }
    
    isPaused = false;
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    const endTime = Date.now() + (timeLeft * 1000);
    localStorage.setItem('focus_timer_end', endTime);
    localStorage.setItem('focus_timer_duration', duration);
    localStorage.setItem('is_running', 'true');
    
    console.log('Timer started, ends at:', new Date(endTime));
    
    timerId = setInterval(syncTimer, 1000);
    
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'TIMER_STARTED',
            endTime: endTime,
            duration: duration
        });
    }
}

function syncTimer() {
    const endTimeStr = localStorage.getItem('focus_timer_end');
    if (!endTimeStr) {
        pauseTimer();
        return;
    }
    
    const endTime = parseInt(endTimeStr);
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

function checkForCompletedTimer() {
    const isRunning = localStorage.getItem('is_running') === 'true';
    const endTimeStr = localStorage.getItem('focus_timer_end');
    
    if (isRunning && endTimeStr) {
        const endTime = parseInt(endTimeStr);
        const now = Date.now();
        
        if (now >= endTime) {
            console.log('Timer completed in background!');
            timeLeft = 0;
            localStorage.removeItem('focus_timer_end');
            localStorage.removeItem('is_running');
            localStorage.removeItem('focus_timer_duration');
            timeLeft = duration;
            updateDisplay();
            
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🎉 Focus Session Complete!', {
                    body: 'Timer finished while you were away',
                    icon: 'icon-192.png',
                    requireInteraction: true
                });
            }
        }
    }
}

function restoreTimerState() {
    const isRunning = localStorage.getItem('is_running') === 'true';
    const savedDuration = localStorage.getItem('focus_timer_duration');
    
    if (savedDuration) {
        duration = parseInt(savedDuration);
    }
    
    if (isRunning) {
        isPaused = false;
        syncTimer();
        timerId = setInterval(syncTimer, 1000);
    }
}

function finishTimer() {
    console.log('Timer finished - PLAYING ALARM');
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    
    localStorage.removeItem('focus_timer_end');
    localStorage.removeItem('is_running');
    localStorage.removeItem('focus_timer_duration');
    
    timeLeft = duration;
    updateDisplay();
    
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'TIMER_COMPLETE',
            duration: duration
        });
    }
    
    console.log('Playing alarm now...');
    playAlarmWithStop();
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 Focus Session Complete!', {
            body: 'Great work! Time to take a break.',
            icon: 'icon-192.png',
            requireInteraction: true,
            vibrate: [400, 200, 400, 200, 400]
        });
    }
    
    // Update all stats
    updateStatsAfterSession();
}

function updateStatsAfterSession() {
    const today = getTodayString();
    const addedMin = Math.floor(duration / 60);
    
    // Update daily sessions count
    userProfile.sessionsToday++;
    userProfile.totalSessions++;
    
    // Update stats
    stats.todayMin += addedMin;
    stats.totalMin += addedMin;
    
    // Update weekly data
    if (!stats.weeklyData) stats.weeklyData = {};
    stats.weeklyData[today] = (stats.weeklyData[today] || 0) + addedMin;
    
    // Update daily sessions tracking
    if (!stats.dailySessions) stats.dailySessions = {};
    stats.dailySessions[today] = (stats.dailySessions[today] || 0) + 1;
    
    // Update last active date
    stats.lastActiveDate = today;
    
    // Calculate XP and level
    const xpGained = addedMin * 2; // 2 XP per minute
    userProfile.xp += xpGained;
    checkLevelUp();
    
    // Save everything
    saveStats();
    saveUserProfile();
    
    console.log('✅ Stats updated:');
    console.log('- Today:', stats.todayMin, 'min');
    console.log('- Sessions today:', userProfile.sessionsToday);
    console.log('- Total sessions:', userProfile.totalSessions);
    console.log('- XP gained:', xpGained);
    console.log('- Total XP:', userProfile.xp);
    console.log('- Level:', userProfile.level);
    
    updateUI();
}

function checkLevelUp() {
    const xpThresholds = [0, 500, 1500, 3500, 7000, 15000]; // XP needed for each level
    let newLevel = 1;
    
    for (let i = 0; i < xpThresholds.length; i++) {
        if (userProfile.xp >= xpThresholds[i]) {
            newLevel = i + 1;
        }
    }
    
    if (newLevel > userProfile.level) {
        userProfile.level = newLevel;
        showLevelUpAnimation(newLevel);
    }
}

function showLevelUpAnimation(level) {
    const message = currentLang === 'fa'
        ? `🎉 تبریک! به سطح ${level} رسیدید!`
        : `🎉 Congratulations! You reached Level ${level}!`;
    
    alert(message);
    // TODO: Add confetti animation
}

function playAlarmWithStop() {
    console.log('playAlarmWithStop called');
    
    if (alarmTimerId) {
        clearTimeout(alarmTimerId);
        alarmTimerId = null;
    }
    
    if (alarm) {
        alarm.pause();
        alarm.currentTime = 0;
    }
    
    if (alarm) {
        alarm.loop = true;
        alarm.volume = 1.0;
        console.log('Alarm play() called');
        
        const playPromise = alarm.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ Alarm playing successfully!');
                })
                .catch(error => {
                    console.log('❌ Alarm blocked by browser:', error);
                    createWebAudioAlarm();
                });
        }
    }
    
    if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 400, 200, 400, 200, 400]);
        console.log('Vibration triggered');
    }
    
    alarmTimerId = setTimeout(() => {
        console.log('Auto-stopping alarm after 15 seconds');
        if (alarm) {
            alarm.pause();
            alarm.loop = false;
            alarm.currentTime = 0;
        }
        alarmTimerId = null;
    }, 15000);
}

function createWebAudioAlarm() {
    console.log('Using Web Audio API as backup');
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
                
                console.log('Web Audio beep', i + 1);
            }, i * 1000);
        }
    } catch (err) {
        console.log('Web Audio API error:', err);
    }
}

function pauseTimer() {
    console.log('Pause clicked');
    isPaused = true;
    
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    
    localStorage.removeItem('is_running');
    
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
    console.log('Reset clicked');
    pauseTimer();
    localStorage.removeItem('focus_timer_end');
    timeLeft = duration;
    updateDisplay();
}

function setTime(s, btn) {
    console.log('Time button clicked:', s);
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
    console.log('Language changed to:', l);
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
    
    // Show session count for free users
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
    console.log('UI updated - Today:', stats.todayMin, 'Week:', weekTotal, 'Sessions:', userProfile.sessionsToday);
}

async function shareStats() {
    const t = translations[currentLang];
    const weekTotal = calculateWeekTotal();
    const text = `🎯 ${t.title}\n${t.level} ${userProfile.level}\n${t.today} ${stats.todayMin} ${t.min}\n${t.week} ${weekTotal} ${t.min}\n${t.streak} ${stats.streak} ${t.day}`;

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
        console.log('Service Worker registered:', reg);
    }).catch(err => {
        console.log('SW registration failed:', err);
    });
}

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Page visible again');
        resetDailySessionsIfNeeded();
        checkForCompletedTimer();
        
        if (localStorage.getItem('is_running') === 'true') {
            syncTimer();
        }
    }
});

console.log('Focus Champion v2.0 loaded');
console.log('Premium status:', userProfile.isPremium);
console.log('Sessions today:', userProfile.sessionsToday);
console.log('Total sessions:', userProfile.totalSessions);
console.log('Level:', userProfile.level, 'XP:', userProfile.xp);
