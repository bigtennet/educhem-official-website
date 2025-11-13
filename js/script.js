// EduChem with Ajibola - Main JavaScript File

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Newsletter Form Submission
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        
        try {
            const formData = new FormData();
            formData.append('email', email);
            
            const response = await fetch('api/newsletter.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                newsletterForm.reset();
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('An error occurred. Please try again later.', 'error');
            console.error('Newsletter error:', error);
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Here you would typically send the form data to your backend
        // For now, we'll just show an alert
        alert(`Thank you for your message, ${formData.name}! We'll get back to you soon at ${formData.email}.`);
        contactForm.reset();
    });
}

// Load resources from JSON on resources page
if (window.location.pathname.includes('resources.html')) {
    loadResourcesFromJSON();
}

async function loadResourcesFromJSON() {
    try {
        const response = await fetch('resources.json');
        if (!response.ok) throw new Error('Failed to load resources');
        
        const resources = await response.json();
        renderResourcesFromJSON(resources);
    } catch (error) {
        console.error('Error loading resources:', error);
        document.getElementById('resourcesContainer').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Unable to load resources. Please try again later.</p>
            </div>
        `;
    }
}

function renderResourcesFromJSON(resources) {
    const container = document.getElementById('resourcesContainer');
    
    // Group resources by category
    const categories = {
        'notes': { resources: [], icon: 'fa-file-pdf', title: 'PDF Lesson Notes', desc: 'Comprehensive Chemistry lesson notes covering key topics and concepts' },
        'exam': { resources: [], icon: 'fa-clipboard-check', title: 'Exam Preparation Materials', desc: 'Comprehensive exam prep resources for WAEC, JAMB, and SSCE' },
        'tutorial': { resources: [], icon: 'fa-chalkboard-teacher', title: 'EduChem Slides & Tutorials', desc: 'Interactive slides and tutorial materials for visual learning' },
        'infographic': { resources: [], icon: 'fa-chart-bar', title: 'Educational Infographics', desc: 'Visual learning aids and infographics for quick reference' }
    };
    
    resources.forEach(resource => {
        if (categories[resource.category]) {
            categories[resource.category].resources.push(resource);
        }
    });
    
    let html = '';
    
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        if (category.resources.length === 0) return;
        
        html += `<div class="resource-category" data-category="${categoryKey}">`;
        html += `<div class="category-header">`;
        html += `<i class="fas ${category.icon}"></i>`;
        html += `<h2>${category.title}</h2>`;
        html += `<p>${category.desc}</p>`;
        html += `</div>`;
        html += `<div class="resources-grid">`;
        
        category.resources.forEach(resource => {
            const iconClass = getIconForType(resource.type);
            const tags = resource.tags ? resource.tags.join(' ') : '';
            
            html += `<div class="resource-card" data-tags="${tags}">`;
            html += `<div class="resource-icon"><i class="fas ${iconClass}"></i></div>`;
            html += `<h3>${escapeHtml(resource.title)}</h3>`;
            html += `<p>${escapeHtml(resource.description)}</p>`;
            html += `<div class="resource-meta">`;
            html += `<span class="resource-type">${resource.type}</span>`;
            if (resource.size) {
                html += `<span class="resource-size">${resource.size}</span>`;
            }
            html += `</div>`;
            html += `<a href="${resource.downloadUrl || '#'}" class="btn btn-download">`;
            html += `<i class="fas fa-download"></i> Download`;
            html += `</a>`;
            html += `</div>`;
        });
        
        html += `</div></div>`;
    });
    
    container.innerHTML = html;
    
    // Re-initialize filter functionality
    initializeResourceFilters();
}

function getIconForType(type) {
    const icons = {
        'PDF': 'fa-file-pdf',
        'PPTX': 'fa-file-powerpoint',
        'PNG': 'fa-file-image',
        'JPG': 'fa-file-image',
        'DOCX': 'fa-file-word'
    };
    return icons[type] || 'fa-file';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Resources Page - Search and Filter Functionality
let searchInput, filterButtons, resourceCards, resourceCategories;

function initializeResourceFilters() {
    searchInput = document.getElementById('searchInput');
    filterButtons = document.querySelectorAll('.filter-btn');
    resourceCards = document.querySelectorAll('.resource-card');
    resourceCategories = document.querySelectorAll('.resource-category');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterResources(searchTerm, getActiveFilter());
        });
    }
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filter = button.getAttribute('data-filter');
                const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                filterResources(searchTerm, filter);
            });
        });
    }
}

// Legacy filter initialization (for static content)
if (document.getElementById('searchInput') && !window.location.pathname.includes('resources.html')) {
    const legacySearchInput = document.getElementById('searchInput');
    const legacyFilterButtons = document.querySelectorAll('.filter-btn');
    
    if (legacySearchInput) {
        legacySearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterResources(searchTerm, getActiveFilter());
        });
    }
    
    if (legacyFilterButtons.length > 0) {
        legacyFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                legacyFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filter = button.getAttribute('data-filter');
                const searchTerm = legacySearchInput ? legacySearchInput.value.toLowerCase() : '';
                filterResources(searchTerm, filter);
            });
        });
    }
}

function getActiveFilter() {
    const activeButton = document.querySelector('.filter-btn.active');
    return activeButton ? activeButton.getAttribute('data-filter') : 'all';
}

function filterResources(searchTerm, filter) {
    let visibleCount = 0;
    
    resourceCategories.forEach(category => {
        const categoryType = category.getAttribute('data-category');
        let categoryVisible = false;
        
        const cards = category.querySelectorAll('.resource-card');
        cards.forEach(card => {
            const tags = card.getAttribute('data-tags').toLowerCase();
            const matchesSearch = !searchTerm || tags.includes(searchTerm);
            const matchesFilter = filter === 'all' || categoryType === filter;
            
            if (matchesSearch && matchesFilter) {
                card.classList.remove('hidden');
                categoryVisible = true;
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Show/hide category header based on visible cards
        if (categoryVisible && (filter === 'all' || categoryType === filter)) {
            category.style.display = 'block';
        } else if (filter !== 'all' && categoryType !== filter) {
            category.style.display = 'none';
        } else if (!categoryVisible && filter === 'all') {
            category.style.display = 'block';
        }
    });
    
    // Show message if no resources found
    let noResultsMsg = document.getElementById('no-results-message');
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = '<p>No resources found matching your search. Try different keywords or filters.</p>';
            document.querySelector('.resources-section .container').appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Scroll to Top Functionality
let scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    z-index: 999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
`;
document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'flex';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect to scroll to top button
scrollToTopBtn.addEventListener('mouseenter', () => {
    scrollToTopBtn.style.transform = 'translateY(-5px)';
    scrollToTopBtn.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
});

scrollToTopBtn.addEventListener('mouseleave', () => {
    scrollToTopBtn.style.transform = 'translateY(0)';
    scrollToTopBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
});

// Add animation on scroll (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .testimonial-card, .resource-card, .value-card, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

if (themeToggle && themeIcon) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

// Console message
console.log('%cEduChem with Ajibola', 'color: #1e88e5; font-size: 20px; font-weight: bold;');
console.log('%cMaking Chemistry Exciting Again!', 'color: #00acc1; font-size: 14px;');

