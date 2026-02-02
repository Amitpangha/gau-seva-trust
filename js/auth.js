// Registration Form Logic
let currentStep = 1;
let donationType = '';
let otpSent = false;
let otpVerified = false;

// Form Steps Navigation
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
    
    // Update progress bar
    updateProgressBar(step);
}

function nextStep(next) {
    if (validateStep(currentStep)) {
        showStep(next);
    }
}

function prevStep(prev) {
    showStep(prev);
}

function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
        const name = document.getElementById('fullName').value.trim();
        const mobile = document.getElementById('mobile').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!name) {
            showError('fullName', 'नाम आवश्यक है');
            isValid = false;
        }
        
        if (!/^[0-9]{10}$/.test(mobile)) {
            showError('mobile', 'वैध मोबाइल नंबर दर्ज करें');
            isValid = false;
        }
        
        if (password.length < 6) {
            showError('password', 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            document.getElementById('passwordError').textContent = 'पासवर्ड मेल नहीं खाते';
            isValid = false;
        }
        
        if (!otpVerified) {
            alert('कृपया OTP वेरिफाई करें');
            isValid = false;
        }
    }
    
    if (step === 2) {
        if (!donationType) {
            alert('कृपया दान का प्रकार चुनें');
            isValid = false;
        }
    }
    
    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '#f44336';
    
    // Add error message if not exists
    let errorSpan = field.nextElementSibling;
    if (!errorSpan || !errorSpan.classList.contains('error-message')) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        field.parentNode.insertBefore(errorSpan, field.nextSibling);
    }
    errorSpan.textContent = message;
    
    // Auto remove error on focus
    field.addEventListener('focus', function() {
        this.style.borderColor = '';
        if (errorSpan) errorSpan.textContent = '';
    });
}

// OTP System
document.getElementById('sendOTP').addEventListener('click', function() {
    const mobile = document.getElementById('mobile').value;
    
    if (!/^[0-9]{10}$/.test(mobile)) {
        alert('कृपया वैध मोबाइल नंबर दर्ज करें');
        return;
    }
    
    // Simulate OTP sending
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> भेज रहा है...';
    
    // In real implementation, call your backend
    setTimeout(() => {
        this.innerHTML = '<i class="fas fa-redo"></i> दोबारा भेजें';
        this.disabled = false;
        document.getElementById('otp').disabled = false;
        otpSent = true;
        
        // For demo, show OTP in alert
        const demoOTP = '123456';
        alert(`डेमो के लिए OTP: ${demoOTP}\nवास्तविक ऐप में SMS आएगा`);
        
    }, 2000);
});

// Password Strength
document.getElementById('password').addEventListener('input', function(e) {
    const password = e.target.value;
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update bars
    strengthBars.forEach((bar, index) => {
        if (index < strength) {
            bar.style.background = index < 2 ? '#f44336' : 
                                  index < 4 ? '#ff9800' : '#4caf50';
        } else {
            bar.style.background = '#ddd';
        }
    });
    
    // Update text
    const texts = ['कमज़ोर', 'सामान्य', 'अच्छा', 'मजबूत', 'बहुत मजबूत'];
    strengthText.textContent = texts[strength - 1] || 'पासवर्ड स्ट्रेंथ';
});

// Donation Type Selection
function selectDonationType(type) {
    donationType = type;
    document.getElementById('donationType').value = type;
    
    // Remove active class from all
    document.querySelectorAll('.type-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    // Add active to selected
    event.target.closest('.type-option').classList.add('active');
    
    // Show amount options
    const amountSection = document.getElementById('amountSection');
    const amountOptions = document.querySelector('.amount-options');
    amountSection.style.display = 'block';
    
    let optionsHTML = '';
    let customAmountVisible = false;
    
    switch(type) {
        case 'one-time':
            optionsHTML = `
                <button type="button" class="amount-btn-select" data-amount="500">₹500</button>
                <button type="button" class="amount-btn-select" data-amount="1000">₹1000</button>
                <button type="button" class="amount-btn-select" data-amount="2500">₹2500</button>
                <button type="button" class="amount-btn-select" data-amount="5000">₹5000</button>
            `;
            customAmountVisible = true;
            break;
            
        case 'monthly':
            optionsHTML = `
                <div class="subscription-option">
                    <input type="radio" name="monthlyAmount" id="monthly500" value="500">
                    <label for="monthly500">
                        <strong>₹500/माह</strong>
                        <small>सपोर्टर</small>
                    </label>
                </div>
                <div class="subscription-option">
                    <input type="radio" name="monthlyAmount" id="monthly1500" value="1500">
                    <label for="monthly1500">
                        <strong>₹1500/माह</strong>
                        <small>चैंपियन</small>
                    </label>
                </div>
                <div class="subscription-option">
                    <input type="radio" name="monthlyAmount" id="monthly2500" value="2500">
                    <label for="monthly2500">
                        <strong>₹2500/माह</strong>
                        <small>हीरो</small>
                    </label>
                </div>
            `;
            break;
            
        case 'daily':
            optionsHTML = `
                <div class="daily-option">
                    <input type="radio" name="dailyAmount" id="daily10" value="10">
                    <label for="daily10">
                        <strong>₹10/दिन</strong>
                        <small>₹300/माह</small>
                    </label>
                </div>
                <div class="daily-option">
                    <input type="radio" name="dailyAmount" id="daily20" value="20">
                    <label for="daily20">
                        <strong>₹20/दिन</strong>
                        <small>₹600/माह</small>
                    </label>
                </div>
                <div class="daily-option">
                    <input type="radio" name="dailyAmount" id="daily50" value="50">
                    <label for="daily50">
                        <strong>₹50/दिन</strong>
                        <small>₹1500/माह</small>
                    </label>
                </div>
            `;
            break;
    }
    
    amountOptions.innerHTML = optionsHTML;
    document.getElementById('customAmount').style.display = customAmountVisible ? 'block' : 'none';
    
    // Add event listeners to new buttons
    if (type === 'one-time') {
        document.querySelectorAll('.amount-btn-select').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.amount-btn-select').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                document.getElementById('customAmount').value = this.getAttribute('data-amount');
            });
        });
    }
}

// Form Submission
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateStep(3)) {
        return;
    }
    
    // Collect form data
    const formData = {
        name: document.getElementById('fullName').value.trim(),
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value || null,
        password: document.getElementById('password').value,
        donationType: donationType,
        address: document.getElementById('address').value || null,
        city: document.getElementById('city').value || null,
        pincode: document.getElementById('pincode').value || null,
        wantsReceipt: document.getElementById('receipt80G').checked,
        smsUpdates: document.getElementById('smsUpdates').checked,
        emailUpdates: document.getElementById('emailUpdates').checked,
        whatsappUpdates: document.getElementById('whatsappUpdates').checked,
        timestamp: new Date().toISOString()
    };
    
    // Get amount based on type
    if (donationType === 'one-time') {
        formData.amount = document.getElementById('customAmount').value || 
                         document.querySelector('.amount-btn-select.active')?.getAttribute('data-amount') || '500';
    } else if (donationType === 'monthly') {
        formData.amount = document.querySelector('input[name="monthlyAmount"]:checked')?.value || '500';
    } else if (donationType === 'daily') {
        formData.amount = document.querySelector('input[name="dailyAmount"]:checked')?.value || '10';
    }
    
    // Show loading
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> प्रोसेसिंग...';
    submitBtn.disabled = true;
    
    try {
        // Save to Google Sheets
        const saved = await saveToGoogleSheets(formData);
        
        if (saved) {
            // Show success message
            showSuccessMessage(formData);
            
            // Auto login
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', formData.name);
            localStorage.setItem('userMobile', formData.mobile);
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 3000);
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        alert('रजिस्ट्रेशन में त्रुटि: ' + error.message);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

function showSuccessMessage(data) {
    const form = document.getElementById('registrationForm');
    form.innerHTML = `
        <div class="success-message">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>रजिस्ट्रेशन सफल!</h3>
            <p>धन्यवाद ${data.name}, आपका अकाउंट बन गया है।</p>
            
            <div class="success-details">
                <p><strong>रजिस्ट्रेशन ID:</strong> GS${Date.now().toString().slice(-6)}</p>
                <p><strong>मोबाइल:</strong> ${data.mobile}</p>
                <p><strong>दान प्रकार:</strong> ${getDonationTypeHindi(data.donationType)}</p>
                ${data.amount ? `<p><strong>चयनित राशि:</strong> ₹${data.amount}${data.donationType === 'daily' ? '/दिन' : data.donationType === 'monthly' ? '/माह' : ''}</p>` : ''}
            </div>
            
            <div class="success-actions">
                <a href="donate.html" class="btn-primary">
                    <i class="fas fa-donate"></i> अभी दान करें
                </a>
                <a href="dashboard.html" class="btn-secondary">
                    <i class="fas fa-tachometer-alt"></i> डैशबोर्ड देखें
                </a>
            </div>
            
            <div class="success-note">
                <i class="fas fa-info-circle"></i>
                आपको 3 सेकंड में डैशबोर्ड पर रीडायरेक्ट किया जाएगा
            </div>
        </div>
    `;
}

function getDonationTypeHindi(type) {
    const types = {
        'one-time': 'एक बार दान',
        'monthly': 'मासिक दान',
        'daily': 'दैनिक दान'
    };
    return types[type] || type;
}

// Save to Google Sheets (Free Method)
async function saveToGoogleSheets(data) {
    // Method 1: Google Forms (Free, No API Key Needed)
    const googleFormId = 'YOUR_GOOGLE_FORM_ID'; // Get from your Google Form URL
    const formURL = `https://docs.google.com/forms/d/e/${googleFormId}/formResponse`;
    
    // Map your Google Form field IDs
    const formFields = {
        'entry.1234567890': data.name,        // Name field
        'entry.0987654321': data.mobile,      // Mobile field
        'entry.1122334455': data.email || '', // Email field
        'entry.5566778899': data.donationType,
        'entry.6677889900': data.amount,
        'entry.7788990011': new Date().toLocaleString('hi-IN')
    };
    
    const formData = new FormData();
    for (const [field, value] of Object.entries(formFields)) {
        formData.append(field, value);
    }
    
    try {
        // Note: This won't work directly due to CORS
        // Use a CORS proxy or backend server in production
        console.log('Simulating save to Google Sheets:', data);
        
        // For demo, save to localStorage
        const users = JSON.parse(localStorage.getItem('gauSevaUsers') || '[]');
        users.push({
            id: 'GS' + Date.now(),
            ...data,
            joined: new Date().toISOString()
        });
        localStorage.setItem('gauSevaUsers', JSON.stringify(users));
        
        return true;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        
        // Fallback to localStorage
        const users = JSON.parse(localStorage.getItem('gauSevaUsers') || '[]');
        users.push(data);
        localStorage.setItem('gauSevaUsers', JSON.stringify(users));
        
        return true;
    }
}

// Progress Bar
function updateProgressBar(step) {
    const progress = document.querySelector('.progress-bar');
    if (!progress) {
        // Create progress bar if not exists
        const authHeader = document.querySelector('.auth-header');
        const progressHTML = `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(step/3)*100}%"></div>
                </div>
                <div class="progress-steps">
                    <span class="progress-step ${step >= 1 ? 'active' : ''}">1</span>
                    <span class="progress-step ${step >= 2 ? 'active' : ''}">2</span>
                    <span class="progress-step ${step >= 3 ? 'active' : ''}">3</span>
                </div>
            </div>
        `;
        authHeader.insertAdjacentHTML('afterend', progressHTML);
    } else {
        document.querySelector('.progress-fill').style.width = `${(step/3)*100}%`;
        document.querySelectorAll('.progress-step').forEach((span, index) => {
            span.classList.toggle('active', index + 1 <= step);
        });
    }
}

// Initialize
showStep(1);