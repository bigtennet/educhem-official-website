// Visitor Tracking Script
// Tracks visitors and saves to visitors.json

(function() {
    // Only track on main site, not admin
    if (window.location.pathname.includes('admin.html')) {
        return;
    }
    
    // Get visitor data
    const visitorData = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        page: window.location.pathname,
        device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: getBrowser(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        screen: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
    };
    
    // Detect browser
    function getBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        return 'Unknown';
    }
    
    // Save visitor data
    fetch('api/tracker.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData)
    }).catch(error => {
        console.log('Tracking error (non-critical):', error);
    });
})();

