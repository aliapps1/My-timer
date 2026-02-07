// Focus Timer Pro - Complete Working Version
// Version 2.0 - All bugs fixed

let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = 'en';
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
        months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"]
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
    console.log('App initialized');
    updateCurrentDate();
    checkForCompletedTimer();
    restoreTimerState();
    updateUI();
    updateDisplay();
    setInterval(updateCurrentDate, 60000);
});

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

// FIX 1: Store end time for background operation
function initAndStart() {
    console.log('Start clicked');
    
    if (!isPaused) {
        console.log('Already running');
        return;
    }
    
    isPaused = false;
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // CRITICAL: Store end time, not current time
    const endTime = Date.now() + (timeLeft * 1000);
    localStorage.setItem('focus_timer_end', endTime);
    localStorage.setItem('focus_timer_duration', duration);
    localStorage.setItem('is_running', 'true');
    
    console.log('Timer started, ends at:', new Date(endTime));
    
    // Use syncTimer instead of simple countdown
    timerId = setInterval(syncTimer, 1000);
    
    // CRITICAL: Send message to Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'TIMER_STARTED',
            endTime: endTime,
            duration: duration
        });
    }
}

// FIX 2: Sync with stored end time
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

// FIX 3: Check on page load if timer finished in background
function checkForCompletedTimer() {
    const isRunning = localStorage.getItem('is_running') === 'true';
    const endTimeStr = localStorage.getItem('focus_timer_end');
    
    if (isRunning && endTimeStr) {
        const endTime = parseInt(endTimeStr);
        const now = Date.now();
        
        if (now >= endTime) {
            console.log('Timer completed in background!');
            timeLeft = 0;
            // Don't auto-play alarm, just reset
            localStorage.removeItem('focus_timer_end');
            localStorage.removeItem('is_running');
            localStorage.removeItem('focus_timer_duration');
            timeLeft = duration;
            updateDisplay();
            
            // Show notification
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

// FIX 4: Properly stop alarm
function finishTimer() {
    console.log('Timer finished - PLAYING ALARM');
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    
    localStorage.removeItem('focus_timer_end');
    localStorage.removeItem('is_running');
    localStorage.removeItem('focus_timer_duration');
    
    // Reset time
    timeLeft = duration;
    updateDisplay();
    
    // CRITICAL: Notify Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'TIMER_COMPLETE',
            duration: duration
        });
    }
    
    // ALWAYS PLAY ALARM - NO CHECKS
    console.log('Playing alarm now...');
    playAlarmWithStop();
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 Focus Session Complete!', {
            body: 'Great work! Time to take a break.',
            icon: 'icon-192.png',
            requireInteraction: true,
            vibrate: [400, 200, 400, 200, 400]
        });
    }
    
    // Update stats
    const addedMin = Math.floor(duration / 60);
    stats.todayMin += addedMin;
    
    // Update weekly data
    const today = getTodayString();
    if (!stats.weeklyData) stats.weeklyData = {};
    stats.weeklyData[today] = (stats.weeklyData[today] || 0) + addedMin;
    
    localStorage.setItem('focusStats', JSON.stringify(stats));
    console.log('Stats updated:', stats);
    updateUI();
}

function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

// FIX 5: Alarm always plays - simpler version
function playAlarmWithStop() {
    console.log('playAlarmWithStop called');
    
    // Clear any existing alarm timer
    if (alarmTimerId) {
        clearTimeout(alarmTimerId);
        alarmTimerId = null;
    }
    
    // Stop any currently playing alarm first
    if (alarm) {
        alarm.pause();
        alarm.currentTime = 0;
    }
    
    // Play alarm - NO CONDITIONS
    if (alarm) {
        alarm.loop = true;
        alarm.volume = 1.0;
        console.log('Alarm play() called');
        
        // Force play with user interaction workaround
        const playPromise = alarm.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ Alarm playing successfully!');
                })
                .catch(error => {
                    console.log('❌ Alarm blocked by browser:', error);
                    // Try alternative sound method
                    createWebAudioAlarm();
                });
        }
    }
    
    // Vibrate
    if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 400, 200, 400, 200, 400]);
        console.log('Vibration triggered');
    }
    
    // Auto-stop after 15 seconds (longer for safety)
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

// Backup alarm using Web Audio API
function createWebAudioAlarm() {
    console.log('Using Web Audio API as backup');
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.5;
        
        // Play 6 beeps
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
    
    // Stop alarm if playing
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

function updateUI() {
    const t = translations[currentLang];
    
    // Calculate weekly total properly
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
    
    const elements = {
        'lbl-title': t.title,
        'btn-start': t.start,
        'btn-pause': t.pause,
        'btn-reset': t.reset,
        'btn-share': t.share,
        'lbl-today': t.today,
        'lbl-week': t.week,
        'lbl-streak': t.streak,
        'stat-today': stats.todayMin + " " + t.min,
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
    console.log('UI updated - Today:', stats.todayMin, 'Week:', weekTotal);
}

function getWeekStart() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    return `${weekStart.getFullYear()}-${(weekStart.getMonth()+1).toString().padStart(2,'0')}-${weekStart.getDate().toString().padStart(2,'0')}`;
}

async function shareStats() {
    const t = translations[currentLang];
    const text = `🎯 ${t.title}\n${t.today} ${stats.todayMin} ${t.min}\n${t.week} ${stats.todayMin} ${t.min}\n${t.streak} ${stats.streak} ${t.day}`;

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

// Load saved language
const savedLang = localStorage.getItem('preferredLang');
if (savedLang) {
    currentLang = savedLang;
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Register service worker with version
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=3').then(reg => {
        console.log('Service Worker registered:', reg);
    }).catch(err => {
        console.log('SW registration failed:', err);
    });
}

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Page visible again');
        checkForCompletedTimer();
        
        if (localStorage.getItem('is_running') === 'true') {
            syncTimer();
        }
    }
});

console.log('Focus Timer Pro v3.0 loaded');
