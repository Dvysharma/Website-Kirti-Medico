document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // 1. Core State & Constants
    // ==========================================
    let medicineList = [];
    let uploadedFiles = [];
    
    // ==========================================
    // 2. Theme Switcher (Light / Dark Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById('themeToggle');
    
    // Initial theme check
    const savedTheme = localStorage.getItem('theme_preference') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme_preference', newTheme);
            console.log(`🌓 Theme toggled to: ${newTheme}`);
        });
    }

    // ==========================================
    // 2.1 Mobile Hamburger Menu Toggle
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinksList = document.querySelectorAll('.nav-links a');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when a link is clicked
        navLinksList.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside of navbar/menu
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 3. Live Store Status (Open/Closed Badge)
    // ==========================================
    function updateStoreStatus() {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (!statusDot || !statusText) return;

        // Current local time
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeVal = hours * 100 + minutes; // E.g., 8:30 AM is 830, 9:00 PM is 2100

        // Store Hours: 8:00 AM (800) to 9:00 PM (2100)
        const openTime = 800;
        const closeTime = 2100;

        if (timeVal >= openTime && timeVal < closeTime) {
            statusDot.className = 'status-dot open';
            statusText.textContent = 'Open Now';
            statusText.parentElement.style.borderColor = 'var(--success)';
        } else {
            statusDot.className = 'status-dot closed';
            statusText.textContent = 'Closed (Emergency Calls Only)';
            statusText.parentElement.style.borderColor = 'var(--accent)';
        }
    }

    // Run immediately and update every minute
    updateStoreStatus();
    setInterval(updateStoreStatus, 60000);

    // ==========================================
    // 4. FAQ Accordion Logic
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question-btn');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQs
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current FAQ
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // ==========================================
    // 5. Medicine List Builder (Cart Logic)
    // ==========================================
    const medNameInput = document.getElementById('medNameInput');
    const medQtyInput = document.getElementById('medQtyInput');
    const addMedItemBtn = document.getElementById('addMedItemBtn');
    const noItemsText = document.getElementById('noItemsText');
    const medicineTable = document.getElementById('medicineTable');
    const medicineTableBody = document.getElementById('medicineTableBody');
    const orderRequirements = document.getElementById('orderRequirements');

    function renderMedicineList() {
        if (!medicineTableBody || !medicineTable || !noItemsText) return;

        medicineTableBody.innerHTML = '';
        
        if (medicineList.length === 0) {
            noItemsText.style.display = 'block';
            medicineTable.style.display = 'none';
        } else {
            noItemsText.style.display = 'none';
            medicineTable.style.display = 'table';
            
            medicineList.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: 600;">${item.name}</td>
                    <td style="text-align: center; font-weight: 700; color: var(--primary);">${item.qty}</td>
                    <td style="text-align: center;">
                        <button type="button" class="remove-item-btn" data-index="${index}" aria-label="Remove item">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </td>
                `;
                medicineTableBody.appendChild(tr);
            });
            
            // Attach delete listeners
            const removeBtns = medicineTableBody.querySelectorAll('.remove-item-btn');
            removeBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-index'));
                    medicineList.splice(idx, 1);
                    renderMedicineList();
                    updateRequirementsTextarea();
                });
            });
        }
    }

    function updateRequirementsTextarea() {
        if (!orderRequirements) return;
        
        if (medicineList.length === 0) {
            // Keep user written requirements if table is empty
            return;
        }

        // Build a formatted markdown list
        let formattedList = "🛒 --- MEDICINE ORDER LIST ---\n";
        medicineList.forEach((item, index) => {
            formattedList += `${index + 1}. ${item.name} (Quantity: ${item.qty})\n`;
        });
        
        // Find existing text without list if present or clear
        const currentValue = orderRequirements.value;
        const listMarker = "🛒 --- MEDICINE ORDER LIST ---";
        const markerIndex = currentValue.indexOf(listMarker);
        
        if (markerIndex !== -1) {
            // Replace old list
            orderRequirements.value = formattedList;
        } else {
            // Append or prepend list
            orderRequirements.value = formattedList + (currentValue ? "\n📝 Notes:\n" + currentValue : "");
        }
    }

    if (addMedItemBtn && medNameInput && medQtyInput) {
        addMedItemBtn.addEventListener('click', () => {
            const name = medNameInput.value.trim();
            const qty = parseInt(medQtyInput.value);

            if (!name) {
                alert('Please enter a medicine name.');
                medNameInput.focus();
                return;
            }

            // Check if item already exists, if so merge quantity
            const existingIndex = medicineList.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
            if (existingIndex !== -1) {
                medicineList[existingIndex].qty += qty;
            } else {
                medicineList.push({ name, qty });
            }

            medNameInput.value = '';
            medQtyInput.value = '1';
            renderMedicineList();
            updateRequirementsTextarea();
            medNameInput.focus();
        });

        // Add item on Enter in input field
        medNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addMedItemBtn.click();
            }
        });
    }

    // ==========================================
    // 6. Visual Prescription File Uploader
    // ==========================================
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('prescriptionFile');
    const fileListContainer = document.getElementById('fileList');
    const hasPrescriptionCheck = document.getElementById('hasPrescription');

    if (dropZone && fileInput && fileListContainer) {
        // Trigger file input click on dropZone click
        dropZone.addEventListener('click', (e) => {
            if (e.target.closest('.delete-file-btn') || e.target.closest('.file-preview-item')) {
                // Don't trigger file dialog if clicking delete buttons
                return;
            }
            fileInput.click();
        });

        // Drag events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        ['dragleave', 'dragend'].forEach(type => {
            dropZone.addEventListener(type, () => {
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            handleFiles(files);
        });
    }

    function handleFiles(files) {
        if (files.length === 0) return;

        // Verify limits: size (< 5MB) and type
        Array.from(files).forEach(file => {
            const sizeInMB = file.size / (1024 * 1024);
            if (sizeInMB > 5) {
                alert(`File "${file.name}" exceeds the 5MB size limit.`);
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert(`File "${file.name}" is not a valid format. Only JPG, PNG, and PDF files are allowed.`);
                return;
            }

            // Prevent duplicate files
            if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                return;
            }

            uploadedFiles.push(file);
        });

        renderUploadedFiles();
        
        // Auto-check prescription box if files are uploaded
        if (hasPrescriptionCheck) {
            hasPrescriptionCheck.checked = uploadedFiles.length > 0;
        }
    }

    function renderUploadedFiles() {
        if (!fileListContainer) return;
        fileListContainer.innerHTML = '';

        if (uploadedFiles.length === 0) return;

        uploadedFiles.forEach((file, index) => {
            const sizeString = (file.size / 1024).toFixed(1) + ' KB';
            
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            fileItem.innerHTML = `
                <div class="file-details">
                    <!-- File Icon SVG -->
                    <svg class="file-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>
                    <div>
                        <span class="file-name-text">${file.name}</span>
                        <span class="file-size-text">(${sizeString})</span>
                    </div>
                </div>
                <button type="button" class="delete-file-btn" data-index="${index}" aria-label="Delete file">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;
            fileListContainer.appendChild(fileItem);
        });

        // Bind delete events
        const deleteBtns = fileListContainer.querySelectorAll('.delete-file-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // Stop click bubbling to dropzone
                const idx = parseInt(this.getAttribute('data-index'));
                uploadedFiles.splice(idx, 1);
                renderUploadedFiles();
                
                if (hasPrescriptionCheck) {
                    hasPrescriptionCheck.checked = uploadedFiles.length > 0;
                }
            });
        });
    }

    // ==========================================
    // 8. Form Submission via Backend Server API
    // ==========================================
    const orderForm = document.getElementById('orderForm');
    
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('custName').value.trim();
            const phone = document.getElementById('custPhone').value.trim();
            const email = document.getElementById('custEmail').value.trim();
            const requirements = document.getElementById('orderRequirements').value.trim();
            const homeDelivery = document.getElementById('homeDelivery').checked;
            const hasPrescription = document.getElementById('hasPrescription').checked;

            // Input Validation
            if (!name || !phone || !requirements) {
                alert('Please fill out all required fields: Name, Phone, and Order Details.');
                return;
            }

            const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(phone)) {
                alert('Please enter a valid phone number with at least 10 digits.');
                return;
            }

            const submitBtn = document.getElementById('submitOrderBtn');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>⏳ Dispatching Request...</span>`;
            submitBtn.style.opacity = '0.7';

            try {
                // Construct payload
                const formData = new FormData();
                formData.append('name', name);
                formData.append('phone', phone);
                if (email) formData.append('email', email);
                formData.append('message', requirements);
                formData.append('home_delivery', homeDelivery ? 'Yes' : 'No');
                formData.append('has_prescription', hasPrescription ? 'Yes' : 'No');

                // Add all uploaded prescription files
                uploadedFiles.forEach(file => {
                    formData.append('attachment', file);
                });

                // Send request to our backend server
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    submitBtn.innerHTML = `<span>✅ Order Dispatched Successfully!</span>`;
                    
                    // Display details
                    alert(`Thank you, ${name}! Your medicine order has been successfully sent to the pharmacist.\n\n📞 We will call you back at ${phone} within 15 minutes to confirm availability and final pricing.`);
                    
                    // Reset Form State
                    orderForm.reset();
                    medicineList = [];
                    uploadedFiles = [];
                    renderMedicineList();
                    renderUploadedFiles();
                } else {
                    throw new Error(result.message || 'API Response Error');
                }

            } catch (error) {
                console.error('Error submitting order request:', error);
                alert(`Order Submission Failed: ${error.message || 'Server connection timeout'}.\n\nPlease call us directly at +91 98795 20608 for immediate medicine delivery.`);
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '1';
                }, 4000);
            }
        });
    }

    // ==========================================
    // 9. Intersection Observer for Scroll Effects
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    if ('IntersectionObserver' in window && fadeElements.length > 0) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once animated
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        });

        fadeElements.forEach(el => {
            animationObserver.observe(el);
        });
    } else {
        // Fallback for older browsers
        fadeElements.forEach(el => el.classList.add('visible'));
    }
});
