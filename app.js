// Focus Timer Pro - Main App Logic
// Enhanced version with proper stats tracking and persistence

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
    weeklyData: {} // {date: minutes}
};

const alarm = document.getElementById('alarmAudio');

// Backup: Use external sound URL
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
async function initAndStart() {
    if (!isPaused) return;
    isPaused = false;
    
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    
    // Request Wake Lock to keep screen/app active
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activated');
            
            // Re-acquire wake lock if it's released
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
                if (!isPaused) {
                    requestWakeLock();
                }
            });
        }
    } catch (err) {
        console.log('Wake Lock error:', err);
    }
    
    // Save end time
    const endTime = Date.now() + (timeLeft * 1000);
    localStorage.setItem('focus_timer_end', endTime);
    localStorage.setItem('focus_timer_duration', duration);
    localStorage.setItem('is_running', 'true');
    
    // Show persistent notification on Android
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

// Helper function to request wake lock
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator && !wakeLock) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.log('Wake Lock request failed:', err);
    }
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
    
    // Release wake lock
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
    
    // CRITICAL: Show notification FIRST (before sound) for better reliability
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('🎉 Focus Session Complete!', {
            body: 'Great work! Time to take a break.',
            icon: 'icon-192.png',
            badge: 'icon-72.png',
            tag: 'focus-complete',
            requireInteraction: true, // Keep notification visible
            vibrate: [200, 100, 200, 100, 200, 100, 200], // Strong vibration
            silent: false, // Allow system sound
            timestamp: Date.now()
        });
        
        // Make notification clickable
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
    
    // Play sound if not muted
    if (!isMuted && document.getElementById('soundChoice').value !== 'none') {
        // Method 1: HTML5 Audio (with loop)
        alarm.loop = true;
        alarm.volume = 1.0; // Maximum volume
        alarm.play().catch(err => {
            console.log('HTML5 audio blocked:', err);
        });
        
        // Method 2: Web Audio API (custom tone - louder)
        createLoudAlarmSound();
        
        // Method 3: Vibrate on mobile devices
        if ('vibrate' in navigator) {
            // Strong vibration pattern
            navigator.vibrate([400, 200, 400, 200, 400, 200, 400]);
        }
        
        // Repeat sound and vibration every 2 seconds for 10 seconds total
        let repeatCount = 0;
        const repeatInterval = setInterval(() => {
            repeatCount++;
            createLoudAlarmSound();
            
            if ('vibrate' in navigator) {
                navigator.vibrate([400, 200, 400]);
            }
            
            // Show additional notifications every 4 seconds
            if (repeatCount % 2 === 0 && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('⏰ Timer Complete - Click to dismiss', {
                    body: `Session finished ${repeatCount * 2} seconds ago`,
                    icon: 'icon-192.png',
                    tag: 'focus-reminder',
                    requireInteraction: true,
                    vibrate: [200, 100, 200]
                });
            }
            
            if (repeatCount >= 5) { // Stop after 10 seconds
                clearInterval(repeatInterval);
                alarm.pause();
                alarm.loop = false;
                alarm.currentTime = 0;
            }
        }, 2000);
    }
    
    completeSession();
}

// Create louder alarm sound
function createLoudAlarmSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // First tone - 800Hz
        playLoudTone(audioContext, 800, now, 0.4, 0.8);
        
        // Second tone - 1000Hz (higher pitch) after 0.15s
        playLoudTone(audioContext, 1000, now + 0.15, 0.4, 0.8);
        
        // Third tone - 1200Hz (even higher) after 0.3s
        playLoudTone(audioContext, 1200, now + 0.3, 0.4, 0.8);
        
    } catch (err) {
        console.log('Web Audio API error:', err);
    }
}

// Helper to play loud tone
function playLoudTone(audioContext, frequency, startTime, duration, volume) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Louder volume with smooth envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

// Pause timer
function pauseTimer() {
    isPaused = true;
    clearInterval(timerId);
    localStorage.removeItem('is_running');
    
    // Release wake lock
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
    
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

// Handle visibility change - critical for background operation
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && localStorage.getItem('is_running') === 'true') {
        syncTimer();
        // Re-acquire wake lock if needed
        if (!wakeLock && !isPaused) {
            requestWakeLock();
        }
    }
});

// Handle page focus - ensure timer syncs when coming back to app
window.addEventListener('focus', () => {
    if (localStorage.getItem('is_running') === 'true') {
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
