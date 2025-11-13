// Admin Panel JavaScript for Resources CRUD

// HARDCODED PASSWORD - Change this to your desired password
const ADMIN_PASSWORD = 'educhem2024';

let resources = [];
let currentTags = [];
let editingId = null;
let isAuthenticated = false;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    setupLoginForm();
});

// Check if user is authenticated
function checkAuthentication() {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            
            if (password === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminAuthenticated', 'true');
                showDashboard();
            } else {
                document.getElementById('loginError').classList.add('show');
                document.getElementById('adminPassword').value = '';
                setTimeout(() => {
                    document.getElementById('loginError').classList.remove('show');
                }, 3000);
            }
        });
    }
}

// Show login screen
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').classList.remove('active');
    isAuthenticated = false;
}

// Show dashboard
function showDashboard() {
    const loginScreen = document.getElementById('loginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.classList.add('active');
    isAuthenticated = true;
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        // Load all data
        console.log('Loading dashboard data...');
        loadResources();
        // Always load newsletter and analytics on dashboard show
        loadNewsletter();
        loadAnalytics();
        setupTagInput();
        setupForm();
    }, 200);
}

// Logout
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    showLogin();
}

// Switch tabs
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the correct tab button
    document.querySelectorAll('.admin-tab').forEach(tab => {
        const tabText = tab.textContent.toLowerCase();
        let shouldActivate = false;
        
        if (tabName === 'newsletter' && (tabText.includes('newsletter') || tabText.includes('email'))) {
            shouldActivate = true;
        } else if (tabName === 'analytics' && (tabText.includes('analytics') || tabText.includes('insights'))) {
            shouldActivate = true;
        } else if (tabName === 'resources' && tabText.includes('resource')) {
            shouldActivate = true;
        }
        
        if (shouldActivate) {
            tab.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Force hide
    });
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.display = 'block'; // Force show
        console.log('Tab content activated:', tabName + 'Tab');
        console.log('Tab display style:', targetTab.style.display);
        console.log('Tab classes:', targetTab.classList.toString());
    } else {
        console.error('Tab not found:', tabName + 'Tab');
    }
    
    // Always refresh data when switching tabs
    if (tabName === 'newsletter') {
        console.log('Loading newsletter data...');
        setTimeout(() => loadNewsletter(), 100);
    } else if (tabName === 'analytics') {
        console.log('Loading analytics data...');
        setTimeout(() => loadAnalytics(), 100);
    } else if (tabName === 'resources') {
        setTimeout(() => loadResources(), 100);
    }
}

// Load resources from JSON file
async function loadResources() {
    try {
        const response = await fetch('resources.json');
        if (!response.ok) throw new Error('Failed to load resources');
        
        resources = await response.json();
        renderResourcesTable();
    } catch (error) {
        console.error('Error loading resources:', error);
        document.getElementById('resourcesTableBody').innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: red;">
                    <i class="fas fa-exclamation-triangle"></i> Error loading resources. Please check resources.json file.
                </td>
            </tr>
        `;
    }
}

// Render resources table
function renderResourcesTable() {
    const tbody = document.getElementById('resourcesTableBody');
    
    if (resources.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    No resources found. Click "Add Resource" to create one.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = resources.map(resource => `
        <tr>
            <td>${resource.id}</td>
            <td><strong>${escapeHtml(resource.title)}</strong></td>
            <td><span class="badge">${getCategoryLabel(resource.category)}</span></td>
            <td>${resource.type}</td>
            <td>${resource.size || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editResource(${resource.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteResource(${resource.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'notes': 'Lesson Notes',
        'exam': 'Exam Prep',
        'tutorial': 'Tutorials',
        'infographic': 'Infographics'
    };
    return labels[category] || category;
}

// Open modal for add/edit
function openModal(mode, id = null) {
    const modal = document.getElementById('resourceModal');
    const form = document.getElementById('resourceForm');
    const modalTitle = document.getElementById('modalTitle');
    
    editingId = id;
    currentTags = [];
    
    if (mode === 'add') {
        modalTitle.textContent = 'Add Resource';
        form.reset();
        document.getElementById('tagsList').innerHTML = '';
    } else if (mode === 'edit' && id) {
        modalTitle.textContent = 'Edit Resource';
        const resource = resources.find(r => r.id === id);
        if (resource) {
            document.getElementById('resourceId').value = resource.id;
            document.getElementById('title').value = resource.title;
            document.getElementById('category').value = resource.category;
            document.getElementById('type').value = resource.type;
            document.getElementById('size').value = resource.size || '';
            document.getElementById('downloadUrl').value = resource.downloadUrl || '';
            document.getElementById('description').value = resource.description;
            currentTags = resource.tags || [];
            renderTags();
        }
    }
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('resourceModal');
    modal.classList.remove('active');
    editingId = null;
    currentTags = [];
    document.getElementById('resourceForm').reset();
    document.getElementById('tagsList').innerHTML = '';
}

// Setup form submission
function setupForm() {
    const form = document.getElementById('resourceForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const resourceData = {
            id: editingId ? parseInt(editingId) : getNextId(),
            title: formData.get('title'),
            category: formData.get('category'),
            type: formData.get('type'),
            size: formData.get('size') || '',
            downloadUrl: formData.get('downloadUrl') || '#',
            description: formData.get('description'),
            tags: currentTags
        };
        
        try {
            if (editingId) {
                // Update existing resource
                const index = resources.findIndex(r => r.id === editingId);
                if (index !== -1) {
                    resources[index] = resourceData;
                }
            } else {
                // Add new resource
                resources.push(resourceData);
            }
            
            // Save to server
            const response = await fetch('api/resources.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'save', resources: resources })
            });
            
            if (response.ok) {
                await loadResources();
                closeModal();
                showNotification('Resource saved successfully!', 'success');
            } else {
                throw new Error('Failed to save resource');
            }
        } catch (error) {
            console.error('Error saving resource:', error);
            showNotification('Error saving resource. Please try again.', 'error');
        }
    });
}

// Get next available ID
function getNextId() {
    if (resources.length === 0) return 1;
    return Math.max(...resources.map(r => r.id)) + 1;
}

// Edit resource
function editResource(id) {
    openModal('edit', id);
}

// Delete resource
async function deleteResource(id) {
    if (!confirm('Are you sure you want to delete this resource?')) {
        return;
    }
    
    try {
        resources = resources.filter(r => r.id !== id);
        
        const response = await fetch('api/resources.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'save', resources: resources })
        });
        
        if (response.ok) {
            await loadResources();
            showNotification('Resource deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete resource');
        }
    } catch (error) {
        console.error('Error deleting resource:', error);
        showNotification('Error deleting resource. Please try again.', 'error');
    }
}

// Refresh resources
function refreshResources() {
    loadResources();
    showNotification('Resources refreshed!', 'success');
}

// Setup tag input
function setupTagInput() {
    const tagInput = document.getElementById('tagInput');
    const tagsContainer = document.getElementById('tagsContainer');
    
    tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.value.trim().toLowerCase();
            if (tag && !currentTags.includes(tag)) {
                currentTags.push(tag);
                tagInput.value = '';
                renderTags();
            }
        }
    });
}

// Render tags
function renderTags() {
    const tagsList = document.getElementById('tagsList');
    tagsList.innerHTML = currentTags.map((tag, index) => `
        <span class="tag">
            ${escapeHtml(tag)}
            <span class="tag-remove" onclick="removeTag(${index})">×</span>
        </span>
    `).join('');
}

// Remove tag
function removeTag(index) {
    currentTags.splice(index, 1);
    renderTags();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load Newsletter Emails
async function loadNewsletter() {
    const tableBody = document.getElementById('newsletterTableBody');
    if (!tableBody) {
        console.error('Newsletter table body not found');
        return;
    }
    
    console.log('Loading newsletter emails...');
    try {
        const response = await fetch('email-list.json', {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            // If file doesn't exist, create empty array
            if (response.status === 404) {
                console.log('email-list.json not found, showing empty state');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-light);">
                            <i class="fas fa-inbox"></i> No subscribers yet.
                        </td>
                    </tr>
                `;
                const totalEl = document.getElementById('totalSubscribers');
                if (totalEl) totalEl.textContent = '0';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const emails = await response.json();
        console.log('Raw email data:', emails);
        const emailArray = Array.isArray(emails) ? emails : [];
        console.log('Loaded', emailArray.length, 'newsletter emails:', emailArray);
        
        if (emailArray.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-light);">
                        <i class="fas fa-inbox"></i> No subscribers yet.
                    </td>
                </tr>
            `;
        } else {
            renderNewsletterTable(emailArray);
        }
        
        const totalEl = document.getElementById('totalSubscribers');
        if (totalEl) totalEl.textContent = emailArray.length;
    } catch (error) {
        console.error('Error loading newsletter:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: red;">
                    <i class="fas fa-exclamation-triangle"></i> Error loading subscribers: ${error.message}
                    <br><small>Check browser console for details</small>
                </td>
            </tr>
        `;
    }
}

// Render newsletter table
function renderNewsletterTable(emails) {
    const tbody = document.getElementById('newsletterTableBody');
    if (!tbody) {
        console.error('Newsletter table body element not found');
        return;
    }
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <i class="fas fa-inbox"></i> No subscribers yet.
                </td>
            </tr>
        `;
        return;
    }
    
    console.log('Rendering newsletter table with', emails.length, 'emails');
    try {
        tbody.innerHTML = emails.map((item, index) => {
            const email = typeof item === 'string' ? item : (item.email || 'N/A');
            const date = typeof item === 'object' && item.date ? item.date : 'N/A';
            const safeEmail = escapeHtml(email);
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${safeEmail}</strong></td>
                    <td>${escapeHtml(date)}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="deleteSubscriber('${safeEmail.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        console.log('Newsletter table rendered successfully');
        
        // Force visibility check
        const tab = document.getElementById('newsletterTab');
        if (tab) {
            if (!tab.classList.contains('active')) {
                console.warn('⚠️ Newsletter tab is not active! Activating now...');
                tab.classList.add('active');
            }
            // Force display
            tab.style.display = 'block';
            tab.style.visibility = 'visible';
            tab.style.opacity = '1';
            console.log('Tab forced visible - display:', tab.style.display);
        }
        
        // Ensure table container is visible
        const tableContainer = document.getElementById('newsletterTableContainer');
        if (tableContainer) {
            tableContainer.style.display = 'block';
            tableContainer.style.visibility = 'visible';
        }
        
        // Log the rendered HTML for debugging
        console.log('Table body HTML:', tbody.innerHTML.substring(0, 200) + '...');
        console.log('Table body element:', tbody);
        console.log('Table body parent:', tbody.parentElement);
    } catch (error) {
        console.error('Error rendering newsletter table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: red;">
                    <i class="fas fa-exclamation-triangle"></i> Error rendering table: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Delete subscriber
async function deleteSubscriber(email) {
    if (!confirm(`Are you sure you want to remove ${email} from the newsletter?`)) {
        return;
    }
    
    try {
        const response = await fetch('api/newsletter.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        
        if (response.ok) {
            loadNewsletter();
            showNotification('Subscriber removed successfully!', 'success');
        } else {
            throw new Error('Failed to delete subscriber');
        }
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        showNotification('Error removing subscriber. Please try again.', 'error');
    }
}

// Refresh newsletter
function refreshNewsletter() {
    loadNewsletter();
    showNotification('Newsletter list refreshed!', 'success');
}

// Export emails to CSV
function exportEmails() {
    fetch('email-list.json')
        .then(res => res.json())
        .then(emails => {
            let csv = 'Email,Date\n';
            emails.forEach(item => {
                const email = typeof item === 'string' ? item : item.email;
                const date = typeof item === 'object' && item.date ? item.date : 'N/A';
                csv += `"${email}","${date}"\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification('CSV exported successfully!', 'success');
        })
        .catch(error => {
            console.error('Error exporting:', error);
            showNotification('Error exporting CSV.', 'error');
        });
}

// Load Analytics
async function loadAnalytics() {
    console.log('Loading analytics...');
    try {
        const [visitorsResponse, resourcesResponse, emailsResponse] = await Promise.all([
            fetch('visitors.json').catch(err => {
                console.log('visitors.json fetch error:', err);
                return { ok: false };
            }),
            fetch('resources.json').catch(err => {
                console.log('resources.json fetch error:', err);
                return { ok: false };
            }),
            fetch('email-list.json').catch(err => {
                console.log('email-list.json fetch error:', err);
                return { ok: false };
            })
        ]);
        
        let visitors = [];
        if (visitorsResponse && visitorsResponse.ok) {
            try {
                const data = await visitorsResponse.json();
                visitors = Array.isArray(data) ? data : [];
                console.log('Loaded visitors:', visitors.length);
            } catch (e) {
                console.error('Error parsing visitors.json:', e);
                visitors = [];
            }
        } else {
            console.log('visitors.json not found or error');
        }
        
        let resources = [];
        if (resourcesResponse && resourcesResponse.ok) {
            try {
                const data = await resourcesResponse.json();
                resources = Array.isArray(data) ? data : [];
                console.log('Loaded resources:', resources.length);
            } catch (e) {
                console.error('Error parsing resources.json:', e);
                resources = [];
            }
        } else {
            console.log('resources.json not found or error');
        }
        
        let emails = [];
        if (emailsResponse && emailsResponse.ok) {
            try {
                const data = await emailsResponse.json();
                emails = Array.isArray(data) ? data : [];
                console.log('Loaded emails:', emails.length);
            } catch (e) {
                console.error('Error parsing email-list.json:', e);
                emails = [];
            }
        } else {
            console.log('email-list.json not found or error');
        }
        
        // Update stats
        console.log('Updating stats with:', { visitors: visitors.length, resources: resources.length, emails: emails.length });
        updateStats(visitors, resources, emails);
        renderDemographics(visitors);
        renderRecentVisitors(visitors);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Show error message
        const content = document.getElementById('demographicsContent');
        if (content) {
            content.innerHTML = `<p style="text-align: center; color: red;">Error loading analytics data: ${error.message}. Please refresh.</p>`;
        }
        const recentContent = document.getElementById('recentVisitorsContent');
        if (recentContent) {
            recentContent.innerHTML = `<p style="text-align: center; color: red;">Error loading recent visitors: ${error.message}</p>`;
        }
    }
}

// Update statistics
function updateStats(visitors, resources, emails) {
    // Ensure arrays exist
    visitors = Array.isArray(visitors) ? visitors : [];
    resources = Array.isArray(resources) ? resources : [];
    emails = Array.isArray(emails) ? emails : [];
    
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todayVisits = visitors.filter(v => v && v.date === today).length;
    const weekVisits = visitors.filter(v => v && v.date >= weekAgo).length;
    
    // Get unique visitors by user agent + date combination
    const uniqueSet = new Set();
    visitors.forEach(v => {
        if (v && v.userAgent && v.date) {
            uniqueSet.add(v.userAgent + '_' + v.date);
        }
    });
    const uniqueVisitors = uniqueSet.size;
    
    const mobileVisitors = visitors.filter(v => v && v.device === 'mobile').length;
    
    // Update DOM elements safely
    const elements = {
        'totalVisitors': visitors.length,
        'totalResources': resources.length,
        'totalSubscribers': emails.length,
        'todayVisitors': todayVisits,
        'weekVisitors': weekVisits,
        'uniqueVisitors': uniqueVisitors,
        'mobileVisitors': mobileVisitors
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

// Render demographics
function renderDemographics(visitors) {
    const content = document.getElementById('demographicsContent');
    
    if (!visitors || !Array.isArray(visitors) || visitors.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-light);">No visitor data available yet. Visit the site pages to start tracking.</p>';
        return;
    }
    
    // Device breakdown
    const devices = {};
    visitors.forEach(v => {
        if (v && v.device) {
            const device = v.device || 'unknown';
            devices[device] = (devices[device] || 0) + 1;
        }
    });
    
    // Browser breakdown
    const browsers = {};
    visitors.forEach(v => {
        if (v && v.browser) {
            const browser = v.browser || 'unknown';
            browsers[browser] = (browsers[browser] || 0) + 1;
        }
    });
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">';
    
    // Device stats
    html += '<div><h4 style="margin-bottom: 1rem;">Device Types</h4><ul style="list-style: none; padding: 0;">';
    Object.entries(devices).sort((a, b) => b[1] - a[1]).forEach(([device, count]) => {
        const percentage = ((count / visitors.length) * 100).toFixed(1);
        html += `<li style="padding: 0.5rem 0; display: flex; justify-content: space-between;">
            <span>${device.charAt(0).toUpperCase() + device.slice(1)}</span>
            <span><strong>${count}</strong> (${percentage}%)</span>
        </li>`;
    });
    html += '</ul></div>';
    
    // Browser stats
    html += '<div><h4 style="margin-bottom: 1rem;">Browsers</h4><ul style="list-style: none; padding: 0;">';
    Object.entries(browsers).sort((a, b) => b[1] - a[1]).forEach(([browser, count]) => {
        const percentage = ((count / visitors.length) * 100).toFixed(1);
        html += `<li style="padding: 0.5rem 0; display: flex; justify-content: space-between;">
            <span>${browser}</span>
            <span><strong>${count}</strong> (${percentage}%)</span>
        </li>`;
    });
    html += '</ul></div>';
    
    html += '</div>';
    content.innerHTML = html;
}

// Render recent visitors
function renderRecentVisitors(visitors) {
    const content = document.getElementById('recentVisitorsContent');
    
    if (!visitors || !Array.isArray(visitors) || visitors.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-light);">No visitor data available yet. Visit the site pages to start tracking.</p>';
        return;
    }
    
    // Filter valid visitors and sort by timestamp (most recent first)
    const validVisitors = visitors.filter(v => v && v.timestamp).sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Take last 20
    const recent = validVisitors.slice(0, 20);
    
    let html = '<table class="resources-table" style="margin-top: 1rem;"><thead><tr>';
    html += '<th>Date & Time</th><th>Device</th><th>Browser</th><th>Page</th></tr></thead><tbody>';
    
    recent.forEach(v => {
        html += `<tr>
            <td>${escapeHtml(v.date || 'N/A')} ${v.time || ''}</td>
            <td>${escapeHtml(v.device || 'Unknown')}</td>
            <td>${escapeHtml(v.browser || 'Unknown')}</td>
            <td>${escapeHtml(v.page || 'N/A')}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    content.innerHTML = html;
}

// Refresh analytics
function refreshAnalytics() {
    loadAnalytics();
    showNotification('Analytics refreshed!', 'success');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

