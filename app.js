// Focus Timer Pro - Main App Logic
// Fixed version - buttons work after completion

let duration = 1500;
let timeLeft = 1500;
let isPaused = true;
let timerId = null;
let currentLang = 'en';
let isMuted = false;
let wakeLock = null;

// Load or initialize stats
let stats = JSON.parse(localStorage.getItem('focusStats')) || {
    todayMin: 0,
    weekMin: 0,
    streak: 0,
    lastActiveDate: null,
    weeklyData: {}
};

const alarm = document.getElementById('alarmAudio');
alarm.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

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

document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    checkAndUpdateStreak();
    restoreTimerState();
    updateUI();
    updateDisplay();
    setInterval(updateCurrentDate, 60000);
});

function updateCurrentDate() {
    const now = new Date();
    const t = translations[currentLang];
    const dayName = t.days[now.getDay()];
    const monthName = t.months[now.getMonth()];
    const day = now.getDate();
    document.getElementById('currentDate').innerText = `${dayName}, ${monthName} ${day}`;
}

function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function getWeekStart() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

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
            stats.streak++;
        } else {
            stats.streak = 0;
        }
        
        stats.lastActiveDate = today;
        stats.todayMin = 0;
    }
    
    saveStats();
}

function calculateWeeklyTotal() {
    const weekStart = getWeekStart();
    const today = getTodayString();
    let total = 0;
    
    if (!stats.weeklyData) stats.weeklyData = {};
    
    for (let key in stats.weeklyData) {
        if (key >= weekStart && key <= today) {
            total += stats.weeklyData[key] || 0;
        }
    }
    
    total += stats.todayMin;
    return total;
}

function saveStats() {
    localStorage.setItem('focusStats', JSON.stringify(stats));
}

function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    const progress = ((duration - timeLeft) / duration) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

async function initAndStart() {
    if (!isPaused) return;
    isPaused = false;
    
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                if (!isPaused) requestWakeLock();
            });
        }
    } catch (err) {
        console.log('Wake Lock error:', err);
    }
    
    const endTime = Date.now() + (timeLeft * 1000);
    localStorage.setItem('focus_timer_end', endTime);
    localStorage.setItem('focus_timer_duration', duration);
    localStorage.setItem('is_running', 'true');
    
    if ('Notification' in window && Notification.permission === 'granted') {
        const minutes = Math.floor(timeLeft / 60);
        new Notification('Focus Timer Running ⏰', {
            body: `Timer set for ${minutes} minutes. Keep focused!`,
            icon: 'icon-192.png',
            tag: 'focus-timer',
            requireInteraction: false,
            silent: true
        });
    }

    timerId = setInterval(syncTimer, 500);
}

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator && !wakeLock) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.log('Wake Lock request failed:', err);
    }
}

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

function finishTimer() {
    clearInterval(timerId);
    isPaused = true;
    localStorage.removeItem('focus_timer_end');
    localStorage.removeItem('is_running');
    localStorage.removeItem('focus_timer_duration');
    
    if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
    }
    
    // Reset timer to original duration
    timeLeft = duration;
    updateDisplay();
    
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('🎉 Focus Session Complete!', {
            body: 'Great work! Time to take a break.',
            icon: 'icon-192.png',
            badge: 'icon-72.png',
            tag: 'focus-complete',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            silent: false,
            timestamp: Date.now()
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
    
    if (!isMuted && document.getElementById('soundChoice').value !== 'none') {
        alarm.loop = true;
        alarm.volume = 1.0;
        alarm.play().catch(err => console.log('Audio blocked:', err));
        
        createLoudAlarmSound();
        
        if ('vibrate' in navigator) {
            navigator.vibrate([400, 200, 400, 200, 400, 200, 400]);
        }
        
        let repeatCount = 0;
        const repeatInterval = setInterval(() => {
            repeatCount++;
            createLoudAlarmSound();
            
            if ('vibrate' in navigator) {
                navigator.vibrate([400, 200, 400]);
            }
            
            if (repeatCount % 2 === 0 && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`⏰ Timer Complete - Click to dismiss`, {
                    body: `Session finished ${repeatCount * 2} seconds ago`,
                    icon: 'icon-192.png',
                    tag: 'focus-reminder',
                    requireInteraction: true,
                    vibrate: [200, 100, 200]
                });
            }
            
            if (repeatCount >= 5) {
                clearInterval(repeatInterval);
                alarm.pause();
                alarm.loop = false;
                alarm.currentTime = 0;
            }
        }, 2000);
    }
    
    completeSession();
}

function createLoudAlarmSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        playLoudTone(audioContext, 800, now, 0.4, 0.8);
        playLoudTone(audioContext, 1000, now + 0.15, 0.4, 0.8);
        playLoudTone(audioContext, 1200, now + 0.3, 0.4, 0.8);
    } catch (err) {
        console.log('Web Audio API error:', err);
    }
}

function playLoudTone(audioContext, frequency, startTime, duration, volume) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function pauseTimer() {
    isPaused = true;
    clearInterval(timerId);
    localStorage.removeItem('is_running');
    
    if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
    }
    
    localStorage.setItem('focus_timer_paused_time', timeLeft);
    alarm.pause();
}

function resetTimer() {
    pauseTimer();
    localStorage.removeItem('focus_timer_end');
    localStorage.removeItem('focus_timer_paused_time');
    timeLeft = duration;
    updateDisplay();
}

function setTime(s, btn) {
    resetTimer();
    duration = s;
    timeLeft = s;
    document.querySelectorAll('.modes button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateDisplay();
}

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

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && localStorage.getItem('is_running') === 'true') {
        syncTimer();
        if (!wakeLock && !isPaused) {
            requestWakeLock();
        }
    }
});

window.addEventListener('focus', () => {
    if (localStorage.getItem('is_running') === 'true') {
        syncTimer();
    }
});

function completeSession() {
    const addedMin = Math.floor(duration / 60);
    const today = getTodayString();
    
    stats.todayMin += addedMin;
    
    if (!stats.weeklyData) stats.weeklyData = {};
    stats.weeklyData[today] = (stats.weeklyData[today] || 0) + addedMin;
    
    checkAndUpdateStreak();
    saveStats();
    updateUI();
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Session Complete! 🎉', {
            body: `Great work! You completed ${addedMin} minutes of focused work.`,
            icon: 'icon-192.png'
        });
    }
}

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
    
    document.getElementById('stat-today').innerText = stats.todayMin + " " + t.min;
    document.getElementById('stat-week').innerText = calculateWeeklyTotal() + " " + t.min;
    document.getElementById('stat-streak').innerText = stats.streak + " " + t.day;
    
    document.getElementById('mainCard').className = ['fa', 'ar'].includes(currentLang) ? 'card rtl-mode' : 'card';
    updateCurrentDate();
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').innerText = isMuted ? '🔇' : '🔊';
    if (isMuted) alarm.pause();
}

function changeLang(l) {
    currentLang = l;
    localStorage.setItem('preferredLang', l);
    updateUI();
}

const savedLang = localStorage.getItem('preferredLang');
if (savedLang) {
    currentLang = savedLang;
}

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

if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW registration failed:', err);
    });
}
