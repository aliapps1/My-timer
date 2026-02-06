// فایل worker.js
let timer = null;
self.onmessage = function(e) {
    if (e.data === 'start') {
        timer = setInterval(() => {
            self.postMessage('tick');
        }, 1000);
    } else if (e.data === 'stop') {
        clearInterval(timer);
    }
};
