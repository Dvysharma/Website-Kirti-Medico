// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
        observer.observe(el);
    });
});

// Prescription file upload handling
document.addEventListener('DOMContentLoaded', function() {
    const prescriptionFile = document.getElementById('prescriptionFile');
    if (prescriptionFile) {
        prescriptionFile.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                let fileNames = Array.from(files).map(file => file.name).join(', ');
                alert(`${files.length} prescription file(s) selected: ${fileNames}\n\nWe'll process them with your order.`);
            }
        });
    }
});

// Order form submission
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            // Validate form
            const name = this.querySelector('input[placeholder="Your Name *"]').value;
            const phone = this.querySelector('input[placeholder="Phone Number *"]').value;
            const requirements = this.querySelector('textarea').value;
            
            if (!name || !phone || !requirements) {
                alert('Please fill in all required fields (Name, Phone, and Requirements).');
                return;
            }
            
            // Phone validation
            const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(phone)) {
                alert('Please enter a valid phone number.');
                return;
            }
            
            submitBtn.textContent = 'Sending Order Request...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = '✅ Order Request Sent!';
                submitBtn.style.background = '#10b981';
                submitBtn.style.opacity = '1';
                
                // Show detailed success message
                alert(`Thank you, ${name}! 
                
Your order request has been received successfully.

📞 We will call you at ${phone} within 15 minutes to:
• Confirm your medicine requirements
• Verify prescription details (if applicable)  
• Arrange delivery or pickup
• Provide final pricing

🚚 For orders above ₹500, delivery is FREE!
💊 All medicines are genuine and properly stored.

Thank you for choosing KIRTI MEDICO!`);
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '1';
                    this.reset();
                }, 3000);
            }, 2000);
        });
    }
});

// Medical particle effects
function createMedicalParticles() {
    const particles = ['💊', '🩺', '+', '❤️', '🌡️', '💉'];
    const hero = document.querySelector('.hero');
    
    if (!hero) return;
    
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'absolute';
        particle.style.fontSize = Math.random() * 10 + 15 + 'px';
        particle.style.opacity = '0.4';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1';
        particle.style.animation = `floatParticle ${8 + Math.random() * 12}s infinite linear`;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.color = '#10b981';
        
        hero.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 20000);
    }
}

// Create particles periodically
document.addEventListener('DOMContentLoaded', function() {
    // Initial particles
    setTimeout(createMedicalParticles, 1000);
    
    // Create new particles every 4 seconds
    setInterval(createMedicalParticles, 4000);
});

// Emergency call tracking and analytics
document.addEventListener('DOMContentLoaded', function() {
    const emergencyBtn = document.querySelector('.emergency-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function(e) {
            // Log emergency call attempt (for analytics)
            console.log('Emergency call initiated at:', new Date().toISOString());
            
            // You could send this to analytics service
            // analytics.track('emergency_call_clicked');
            
            // Optional: Show confirmation before calling
            const confirmed = confirm('You are about to call KIRTI MEDICO Emergency Line.\n\n📞 +91 98765 43210\n\nProceed with the call?');
            if (!confirmed) {
                e.preventDefault();
            }
        });
    }
});

// WhatsApp and Call button interactions
document.addEventListener('DOMContentLoaded', function() {
    // WhatsApp button
    const whatsappBtn = document.querySelector('.whatsapp-float a');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            console.log('WhatsApp chat initiated');
            // Track WhatsApp clicks for analytics
        });
    }
    
    // Call button
    const callBtn = document.querySelector('.call-float a');
    if (callBtn) {
        callBtn.addEventListener('click', function() {
            console.log('Direct call initiated');
            // Track call clicks for analytics
        });
    }
});

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Enhanced form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Real-time form validation
    const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            
            // Email validation
            if (this.type === 'email' && value) {
                if (!validateEmail(value)) {
                    this.style.borderColor = '#ef4444';
                    this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                } else {
                    this.style.borderColor = '#10b981';
                    this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }
            }
            
            // Phone validation
            if (this.type === 'tel' && value) {
                if (!validatePhone(value)) {
                    this.style.borderColor = '#ef4444';
                    this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                } else {
                    this.style.borderColor = '#10b981';
                    this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }
            }
            
            // Required field validation
            if (this.required && !value) {
                this.style.borderColor = '#ef4444';
                this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#10b981';
            this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        });
    });
});

// Delivery and prescription checkbox interactions
document.addEventListener('DOMContentLoaded', function() {
    const homeDeliveryCheck = document.getElementById('homeDelivery');
    const prescriptionCheck = document.getElementById('prescription');
    
    if (homeDeliveryCheck) {
        homeDeliveryCheck.addEventListener('change', function() {
            if (this.checked) {
                console.log('Home delivery requested');
                // Could show delivery options or address form
            }
        });
    }
    
    if (prescriptionCheck) {
        prescriptionCheck.addEventListener('change', function() {
            if (this.checked) {
                console.log('Prescription upload indicated');
                // Could automatically trigger file upload dialog
                const prescriptionFile = document.getElementById('prescriptionFile');
                if (prescriptionFile && confirm('Would you like to upload your prescription now?')) {
                    prescriptionFile.click();
                }
            }
        });
    }
});

// Scroll-triggered animations for better performance
let ticking = false;

function updateAnimations() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Parallax effect for hero background
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
    
    ticking = false;
}

function requestAnimationTick() {
    if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateAnimations);
    }
}

// Add scroll listener with throttling
window.addEventListener('scroll', requestAnimationTick);

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('mobile-active');
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 KIRTI MEDICO Website Loaded Successfully');
    console.log('📞 Emergency: +91 98765 43210');
    console.log('💬 WhatsApp: +91 98765 43210');
    
    // Any additional initialization can go here
    
    // Example: Load user preferences if stored locally
    const savedPreferences = localStorage.getItem('kirtiMedicoPrefs');
    if (savedPreferences) {
        try {
            const prefs = JSON.parse(savedPreferences);
            console.log('User preferences loaded:', prefs);
        } catch (e) {
            console.log('No valid preferences found');
        }
    }
});

// Save user preferences (example for future enhancements)
function saveUserPreferences(preferences) {
    try {
        localStorage.setItem('kirtiMedicoPrefs', JSON.stringify(preferences));
        console.log('Preferences saved:', preferences);
    } catch (e) {
        console.log('Could not save preferences:', e);
    }
}

// Export functions for global use if needed
window.KirtiMedico = {
    validateEmail,
    validatePhone,
    createMedicalParticles,
    saveUserPreferences,
    toggleMobileMenu
};