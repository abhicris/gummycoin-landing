// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Handle URL routing for /links
    if (window.location.pathname === '/links') {
        // Scroll to links section after page loads
        setTimeout(() => {
            const linksSection = document.querySelector('#links');
            if (linksSection) {
                linksSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Form submission handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .ecosystem-card, .partner-logo');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Stats counter animation
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Smooth scroll functions
function scrollToSignup() {
    const signupSection = document.getElementById('signup');
    if (signupSection) {
        signupSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function scrollToJourney() {
    const journeySection = document.getElementById('journey');
    if (journeySection) {
        journeySection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function scrollToVideo() {
    const videoSection = document.getElementById('video');
    if (videoSection) {
        videoSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Handle signup form submission
function handleSignup() {
    const form = document.getElementById('signupForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
    submitBtn.disabled = true;

    // Call the API
    fetch('/api/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: data.email,
            source: 'landing-page',
            name: data.name || '',
            interest: data.interest || 'early-access'
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
        showNotification('🎉 Welcome to Gummy! You\'ve been added to our early access list.', 'success');
            form.reset();
        } else {
            showNotification(result.error || 'Something went wrong. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    })
    .finally(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Handle email form submission (for the main signup form)
function submitEmail(event) {
    console.log('📧 submitEmail function called');
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    console.log('📧 Name entered:', name);
    console.log('📧 Email entered:', email);
    console.log('📧 Form element:', form);
    
    // Validate name
    if (!name || name.trim().length < 2) {
        console.log('❌ Name validation failed:', name);
        showNotification('Please enter your name.', 'error');
        return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        console.log('❌ Email validation failed:', email);
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    console.log('✅ Email validation passed:', email);
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
    submitBtn.disabled = true;

    // Prepare signup data
    const signupData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        source: 'landing-page',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        interest: 'early-access'
    };

    // Try to save to server first, then fallback to localStorage
    saveToServer(signupData).then(serverResult => {
        if (serverResult.success) {
            showNotification('🎉 Welcome to Gummy! You\'ve been added to our early access list.', 'success');
            form.reset();
            trackSignupEvent(signupData);
        } else {
            // Server failed, try localStorage as backup
            console.log('Server save failed, trying localStorage...');
            saveToLocalStorage(signupData).then(localResult => {
                if (localResult.success) {
                    showNotification('✅ Saved! We\'ll sync your signup once connected.', 'info');
                } else {
                    showNotification('❌ Failed to save. Please try again.', 'error');
                }
                form.reset();
            });
        }
    }).catch(error => {
        console.error('Signup error:', error);
        // Fallback to local storage
        saveToLocalStorage(signupData).then(localResult => {
            if (localResult.success) {
                showNotification('✅ Saved locally! We\'ll sync your signup later.', 'info');
            } else {
                showNotification('❌ Failed to save. Please try again.', 'error');
            }
        form.reset();
        });
    }).finally(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Save to server (primary method)
function saveToServer(signupData) {
    console.log('🌐 Attempting to save to server:', signupData.email);
    return new Promise((resolve) => {
        fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: signupData.email,
                source: signupData.source,
                name: signupData.name,
                interest: signupData.interest
            })
        })
        .then(response => {
            console.log('🌐 Server response status:', response.status);
            return response.json();
        })
        .then(result => {
            console.log('🌐 Server response:', result);
            if (result.success) {
                console.log('✅ Email saved to server:', signupData.email);
                resolve({ success: true, method: 'server' });
            } else {
                console.log('❌ Server save failed:', result.error);
                resolve({ success: false, error: result.error });
            }
        })
        .catch(error => {
            console.error('🌐 Server save error:', error);
            resolve({ success: false, error: error.message });
        });
    });
}

// Save to local storage (backup method)
function saveToLocalStorage(signupData) {
    console.log('💾 saveToLocalStorage called with:', signupData);
    return new Promise((resolve) => {
        try {
            let existingSignups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
            console.log('💾 Existing signups found:', existingSignups.length);
            
            // Check for duplicate
            const isDuplicate = existingSignups.some(signup => signup.email === signupData.email);
            if (isDuplicate) {
                console.log('⚠️ Duplicate email detected:', signupData.email);
                resolve({ success: false, error: 'Email already exists' });
                return;
            }
            
            existingSignups.push(signupData);
            localStorage.setItem('gummy_signups', JSON.stringify(existingSignups));
            console.log('✅ Email saved to local storage:', signupData.email);
            console.log('💾 Total emails now:', existingSignups.length);
            
            // Verify it was saved
            const verification = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
            console.log('🔍 Verification - emails in storage:', verification.length);
            
            resolve({ success: true, method: 'localStorage' });
        } catch (error) {
            console.error('💾 Local storage error:', error);
            resolve({ success: false, error: error.message });
        }
    });
}

// Send to N8N webhook (when configured)
function sendToN8NWebhook(signupData) {
    return new Promise((resolve) => {
        // You can set this URL later when n8n is ready
        const n8nWebhookUrl = window.GUMMY_CONFIG?.N8N_WEBHOOK_URL || null;
        
        if (!n8nWebhookUrl) {
            console.log('N8N webhook not configured yet');
            resolve({ success: false, error: 'N8N not configured' });
            return;
        }
        
        fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData)
        })
        .then(response => {
            if (response.ok) {
                console.log('✅ Email sent to N8N webhook:', signupData.email);
                resolve({ success: true, method: 'n8n' });
            } else {
                resolve({ success: false, error: `N8N webhook failed: ${response.status}` });
            }
        })
        .catch(error => {
            console.error('N8N webhook error:', error);
            resolve({ success: false, error: error.message });
        });
    });
}

// Send to Google Forms (backup option)
function sendToGoogleForms(signupData) {
    return new Promise((resolve) => {
        // You can create a Google Form and use it as backup
        const googleFormUrl = window.GUMMY_CONFIG?.GOOGLE_FORM_URL || null;
        
        if (!googleFormUrl) {
            resolve({ success: false, error: 'Google Forms not configured' });
            return;
        }
        
        // Create form data for Google Forms
        const formData = new FormData();
        formData.append('entry.12345678', signupData.email); // Replace with actual entry ID
        formData.append('entry.87654321', signupData.timestamp);
        
        fetch(googleFormUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Required for Google Forms
        })
        .then(() => {
            console.log('✅ Email sent to Google Forms:', signupData.email);
            resolve({ success: true, method: 'googleForms' });
        })
        .catch(error => {
            console.error('Google Forms error:', error);
            resolve({ success: false, error: error.message });
        });
    });
}

// Video player functionality
function playVideo() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    const videoOverlay = document.querySelector('.video-overlay');
    
    // In a real implementation, this would load and play a video
    // For now, we'll show a demo message
    videoOverlay.innerHTML = `
        <div style="text-align: center; color: #666;">
            <i class="fas fa-video" style="font-size: 3rem; color: #FFCBA4; margin-bottom: 1rem;"></i>
            <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">Demo Video</p>
            <p style="font-size: 0.9rem;">This would show the Gummy app in action</p>
            <button onclick="resetVideo()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #FFCBA4; border: none; border-radius: 8px; color: white; cursor: pointer;">
                Close Demo
            </button>
        </div>
    `;
}

function resetVideo() {
    const videoOverlay = document.querySelector('.video-overlay');
    videoOverlay.innerHTML = `
        <button class="play-button" onclick="playVideo()">
            <i class="fas fa-play"></i>
        </button>
        <p class="video-text">App Demo Video</p>
    `;
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format the number based on the original format
        const originalText = element.textContent;
        if (originalText.includes('$')) {
            element.textContent = '$' + Math.floor(current).toLocaleString();
        } else if (originalText.includes('+')) {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Set background color based on type
    let backgroundColor;
    switch(type) {
        case 'success':
            backgroundColor = '#10b981';
            break;
        case 'error':
            backgroundColor = '#ef4444';
            break;
        case 'warning':
            backgroundColor = '#f59e0b';
            break;
        case 'info':
        default:
            backgroundColor = '#3b82f6';
            break;
    }

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;

    // Add notification content styles
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;

    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        padding: 0;
    `;

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Analytics tracking
function trackSignupEvent(data) {
    console.log('Tracking signup:', data);
    
    // Google Analytics 4 (if configured)
    if (typeof gtag === 'function') {
        gtag('event', 'sign_up', {
            'method': 'website',
            'source': data.source,
            'interest': data.interest
        });
    }
    
    // Facebook Pixel (if configured)
    if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
            content_name: 'Email Signup',
            content_category: 'Gummy Early Access'
        });
    }
}

// Admin functions for email management
window.GummyAdmin = {
    // Export all collected emails
    exportEmails: function() {
        // Try to get emails from server first, then fallback to localStorage
        fetch('/api/admin-stats')
        .then(response => response.json())
        .then(data => {
            if (data.recentSubscribers && data.recentSubscribers.length > 0) {
                this.exportEmailsToCSV(data.recentSubscribers);
            } else {
                // Fallback to localStorage
                const signups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
                if (signups.length === 0) {
                    alert('No emails collected yet!');
                    return;
                }
                this.exportEmailsToCSV(signups);
            }
        })
        .catch(error => {
            console.error('Failed to get emails from server:', error);
            // Fallback to localStorage
            const signups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
            if (signups.length === 0) {
                alert('No emails collected yet!');
                return;
            }
            this.exportEmailsToCSV(signups);
        });
    },
    
    // Helper function to export emails to CSV
    exportEmailsToCSV: function(signups) {
        
        // Create CSV content with proper escaping
        let csvContent = "Email,Source,Timestamp,Referrer,Interest\n";
        
        signups.forEach(signup => {
            const email = `"${signup.email}"`;
            const source = `"${signup.source}"`;
            const timestamp = `"${signup.timestamp}"`;
            const referrer = `"${signup.referrer || ''}"`;
            const interest = `"${signup.interest}"`;
            
            csvContent += `${email},${source},${timestamp},${referrer},${interest}\n`;
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `gummy_signups_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Fallback for older browsers
            const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", csvContent);
            link.setAttribute("download", `gummy_signups_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        console.log(`✅ Exported ${signups.length} email signups to CSV`);
        alert(`Successfully exported ${signups.length} emails!`);
    },
    
    // View all signups
    viewSignups: function() {
        // Try to get emails from server first
        fetch('/api/admin-stats')
        .then(response => response.json())
        .then(data => {
            if (data.recentSubscribers && data.recentSubscribers.length > 0) {
                console.table(data.recentSubscribers);
                console.log(`📧 Found ${data.recentSubscribers.length} email signups from server`);
                alert(`Found ${data.recentSubscribers.length} email signups from server. Check the console for details.`);
                return data.recentSubscribers;
            } else {
                // Fallback to localStorage
                const signups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
                if (signups.length === 0) {
                    console.log('No emails collected yet!');
                    alert('No emails collected yet!');
                    return [];
                }
                console.table(signups);
                console.log(`📧 Found ${signups.length} email signups from localStorage`);
                alert(`Found ${signups.length} email signups from localStorage. Check the console for details.`);
                return signups;
            }
        })
        .catch(error => {
            console.error('Failed to get emails from server:', error);
            // Fallback to localStorage
            const signups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
            if (signups.length === 0) {
                console.log('No emails collected yet!');
                alert('No emails collected yet!');
                return [];
            }
            console.table(signups);
            console.log(`📧 Found ${signups.length} email signups from localStorage`);
            alert(`Found ${signups.length} email signups from localStorage. Check the console for details.`);
            return signups;
        });
    },
    
    // Clear all signups (be careful!)
    clearSignups: function() {
        if (confirm('Are you sure you want to clear all collected emails? This cannot be undone.')) {
            localStorage.removeItem('gummy_signups');
            console.log('All signups cleared');
        }
    },
    
    // Configure N8N webhook
    setN8NWebhook: function(webhookUrl) {
        window.GUMMY_CONFIG = window.GUMMY_CONFIG || {};
        window.GUMMY_CONFIG.N8N_WEBHOOK_URL = webhookUrl;
        localStorage.setItem('gummy_config', JSON.stringify(window.GUMMY_CONFIG));
        console.log('N8N webhook configured:', webhookUrl);
    },
    
    // Sync local emails to N8N
    syncToN8N: function() {
        const signups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
        const webhookUrl = window.GUMMY_CONFIG?.N8N_WEBHOOK_URL;
        
        if (!webhookUrl) {
            console.error('N8N webhook URL not configured. Use GummyAdmin.setN8NWebhook(url) first.');
            return;
        }
        
        console.log(`Syncing ${signups.length} signups to N8N...`);
        
        signups.forEach((signup, index) => {
            setTimeout(() => {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signup)
                })
                .then(response => {
                    if (response.ok) {
                        console.log(`✅ Synced: ${signup.email}`);
                    } else {
                        console.error(`❌ Failed to sync: ${signup.email}`);
                    }
                })
                .catch(error => {
                    console.error(`❌ Error syncing ${signup.email}:`, error);
                });
            }, index * 100); // Delay to avoid rate limiting
        });
    },
    
    // Get stats
    getStats: function() {
        // Try to get stats from server first
        return fetch('/api/admin-stats')
        .then(response => response.json())
        .then(data => {
            if (data.totalSubscribers > 0) {
                console.log('📊 Stats from server:', data);
                return {
                    totalSignups: data.totalSubscribers,
                    signupsBySource: data.signupsBySource || { 'server': data.totalSubscribers },
                    signupsByDay: data.signupsByDay || {},
                    recentSignups: data.recentSubscribers || []
                };
            } else {
                // Fallback to localStorage
                const signups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
                const stats = {
                    totalSignups: signups.length,
                    signupsBySource: {},
                    signupsByDay: {},
                    recentSignups: signups.slice(-10)
                };
                
                signups.forEach(signup => {
                    // By source
                    stats.signupsBySource[signup.source] = (stats.signupsBySource[signup.source] || 0) + 1;
                    
                    // By day
                    const date = signup.timestamp.split('T')[0];
                    stats.signupsByDay[date] = (stats.signupsByDay[date] || 0) + 1;
                });
                
                console.table(stats.signupsBySource);
                console.table(stats.signupsByDay);
                return stats;
            }
        })
        .catch(error => {
            console.error('Failed to get stats from server:', error);
            // Fallback to localStorage
            const signups = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
            const stats = {
                totalSignups: signups.length,
                signupsBySource: {},
                signupsByDay: {},
                recentSignups: signups.slice(-10)
            };
            
            signups.forEach(signup => {
                // By source
                stats.signupsBySource[signup.source] = (stats.signupsBySource[signup.source] || 0) + 1;
                
                // By day
                const date = signup.timestamp.split('T')[0];
                stats.signupsByDay[date] = (stats.signupsByDay[date] || 0) + 1;
            });
            
            console.table(stats.signupsBySource);
            console.table(stats.signupsByDay);
            return stats;
        });
    }
};

        // Load saved configuration
        document.addEventListener('DOMContentLoaded', function() {
            const savedConfig = localStorage.getItem('gummy_config');
            if (savedConfig) {
                window.GUMMY_CONFIG = JSON.parse(savedConfig);
                console.log('Loaded Gummy configuration:', window.GUMMY_CONFIG);
            }
            
                    // Debug: Check if form exists and add test function
        const emailForm = document.getElementById('emailForm');
        if (emailForm) {
            console.log('✅ Email form found and ready');
            
            // Add global test functions
            window.testEmailCollection = function() {
                const testData = {
                    email: 'test@gummy.co',
                    source: 'test',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: 'test',
                    interest: 'test'
                };
                console.log('🧪 Testing email collection...');
                saveToLocalStorage(testData).then(result => {
                    console.log('🧪 Test result:', result);
                    alert(`Test email saved: ${result.success ? 'SUCCESS' : 'FAILED'}`);
                });
            };
            
            // Function to manually add an email for testing
            window.addTestEmail = function(email = 'test@example.com') {
                const testData = {
                    email: email,
                    source: 'manual-test',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: 'manual',
                    interest: 'test'
                };
                return saveToLocalStorage(testData);
            };
            
            // Function to check localStorage directly
            window.checkEmails = function() {
                const emails = JSON.parse(localStorage.getItem('gummy_signups') || '[]');
                console.log('📧 Emails in localStorage:', emails);
                alert(`Found ${emails.length} emails. Check console for details.`);
                return emails;
            };
            
        } else {
            console.log('❌ Email form not found');
        }
        });

// Social media links (placeholder)
function openSocialMedia(platform) {
    const urls = {
        twitter: 'https://twitter.com/gummyecosystem',
        discord: 'https://discord.gg/gummyecosystem',
        telegram: 'https://t.me/gummyecosystem',
        github: 'https://github.com/gummyecosystem',
        linkedin: 'https://linkedin.com/company/gummyecosystem'
    };
    
    if (urls[platform]) {
        window.open(urls[platform], '_blank');
    }
}

// Add click handlers to social links
document.addEventListener('DOMContentLoaded', function() {
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split('-').pop();
            openSocialMedia(platform);
        });
    });
});

// Mobile menu toggle (for future implementation)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);
