// Donation Page JavaScript
let donationData = {
    type: 'one-time',
    amount: 500,
    name: '',
    mobile: '',
    email: '',
    paymentMethod: 'razorpay',
    receipt80G: true,
    sharePublic: true
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeDonationPage();
    loadUserData();
});

function initializeDonationPage() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // Update active tab
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show correct options
            document.querySelectorAll('.donation-options').forEach(opt => {
                opt.classList.remove('active');
            });
            document.getElementById(`${type}-options`).classList.add('active');
            
            donationData.type = type;
            updateSummary();
        });
    });
    
    // Amount selection for one-time
    document.querySelectorAll('.amount-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.amount-card').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            
            donationData.amount = parseInt(this.getAttribute('data-amount'));
            document.getElementById('customOneTime').value = donationData.amount;
            updateSummary();
        });
    });
    
    // Custom amount input
    document.getElementById('customOneTime').addEventListener('input', function() {
        const value = parseInt(this.value) || 0;
        if (value >= 100) {
            donationData.amount = value;
            document.querySelectorAll('.amount-card').forEach(c => {
                c.classList.remove('selected');
            });
            updateSummary();
        }
    });
    
    // Subscription selection
    document.querySelectorAll('.subscription-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.subscription-card').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            
            donationData.amount = parseInt(this.getAttribute('data-amount'));
            updateSummary();
        });
    });
    
    // Daily donation selection
    document.querySelectorAll('.daily-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.daily-card').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            
            const dailyAmount = parseInt(this.getAttribute('data-daily'));
            const monthlyAmount = parseInt(this.getAttribute('data-monthly'));
            donationData.amount = dailyAmount;
            donationData.monthlyEquivalent = monthlyAmount;
            updateSummary();
        });
    });
    
    // Payment method selection
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            document.querySelectorAll('.method-card').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll('.payment-details').forEach(d => {
                d.classList.remove('active');
            });
            document.getElementById(`${method}-details`).classList.add('active');
            
            donationData.paymentMethod = method;
        });
    });
    
    // Form input tracking
    document.getElementById('donorName').addEventListener('input', function() {
        donationData.name = this.value;
    });
    
    document.getElementById('donorMobile').addEventListener('input', function() {
        donationData.mobile = this.value;
    });
    
    document.getElementById('donorEmail').addEventListener('input', function() {
        donationData.email = this.value;
    });
    
    document.getElementById('receipt80G').addEventListener('change', function() {
        donationData.receipt80G = this.checked;
        updateSummary();
    });
    
    document.getElementById('sharePublic').addEventListener('change', function() {
        donationData.sharePublic = this.checked;
    });
    
    // Generate QR code for UPI
    generateUPIQRCode();
}

function updateSummary() {
    // Update summary in step 3
    const typeText = {
        'one-time': 'एक बार दान',
        'monthly': 'मासिक दान',
        'daily': 'दैनिक दान'
    };
    
    document.getElementById('summaryType').textContent = typeText[donationData.type] || donationData.type;
    document.getElementById('summaryAmount').textContent = 
        donationData.type === 'daily' ? 
        `₹${donationData.amount}/दिन (₹${donationData.monthlyEquivalent}/माह)` :
        `₹${donationData.amount}${donationData.type === 'monthly' ? '/माह' : ''}`;
    
    document.getElementById('summaryReceipt').textContent = donationData.receipt80G ? 'हाँ' : 'नहीं';
    document.getElementById('summaryTotal').textContent = 
        donationData.type === 'daily' ? 
        `₹${donationData.monthlyEquivalent}/माह` :
        `₹${donationData.amount}`;
    
    // Update receipt in step 4
    document.getElementById('receiptAmount').textContent = 
        donationData.type === 'daily' ? 
        `₹${donationData.amount}/दिन` :
        `₹${donationData.amount}`;
}

// Step Navigation
function nextDonationStep(step) {
    if (step === 2) {
        // Validate step 1
        if (donationData.amount < 100) {
            alert('कृपया कम से कम ₹100 का दान चुनें');
            return;
        }
    }
    
    if (step === 3) {
        // Validate step 2
        if (!donationData.name.trim()) {
            alert('कृपया अपना नाम दर्ज करें');
            document.getElementById('donorName').focus();
            return;
        }
        
        if (!/^[0-9]{10}$/.test(donationData.mobile)) {
            alert('कृपया वैध 10 अंकीय मोबाइल नंबर दर्ज करें');
            document.getElementById('donorMobile').focus();
            return;
        }
    }
    
    // Hide all steps
    document.querySelectorAll('.donation-step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update stepper
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active');
        if (parseInt(s.getAttribute('data-step')) <= step) {
            s.classList.add('active');
        }
    });
}

function prevDonationStep(step) {
    nextDonationStep(step);
}

// Process Razorpay Payment
async function processRazorpayPayment() {
    try {
        // Validate data
        if (!donationData.name || !donationData.mobile) {
            alert('कृपया अपनी जानकारी पूरी दर्ज करें');
            return;
        }
        
        const options = {
            amount: donationData.amount,
            name: donationData.name,
            mobile: donationData.mobile,
            email: donationData.email || '',
            type: donationData.type,
            description: `Donation for Gau Seva - ₹${donationData.amount}`,
            receipt80G: donationData.receipt80G
        };
        
        // Show loading
        const payBtn = document.querySelector('.btn-pay-now');
        const originalText = payBtn.innerHTML;
        payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> प्रोसेसिंग...';
        payBtn.disabled = true;
        
        // Process payment
        const result = await payment.processPayment(options);
        
        if (result.success) {
            // Save donation data
            donationData.paymentId = result.paymentId;
            donationData.timestamp = new Date().toISOString();
            donationData.donationId = 'DON' + Date.now().toString().slice(-8);
            
            // Show success step
            showConfirmationStep();
        }
        
    } catch (error) {
        alert('भुगतान में त्रुटि: ' + error.message);
        document.querySelector('.btn-pay-now').innerHTML = '<i class="fas fa-lock"></i> सुरक्षित भुगतान करें';
        document.querySelector('.btn-pay-now').disabled = false;
    }
}

// Show confirmation step
function showConfirmationStep() {
    // Update receipt details
    document.getElementById('receiptId').textContent = donationData.donationId;
    document.getElementById('receiptDate').textContent = new Date().toLocaleDateString('hi-IN');
    document.getElementById('receiptAmount').textContent = 
        donationData.type === 'daily' ? 
        `₹${donationData.amount}/दिन` :
        `₹${donationData.amount}`;
    document.getElementById('receiptMethod').textContent = 'Razorpay';
    
    // Show step 4
    nextDonationStep(4);
    
    // Send receipt via email if provided
    if (donationData.email) {
        sendReceiptEmail();
    }
    
    // Update leaderboard
    updateLeaderboard();
}

// Generate UPI QR Code
function generateUPIQRCode() {
    const upiId = 'gausevatrust@okhdfcbank';
    const amount = donationData.amount;
    
    const qrText = `upi://pay?pa=${upiId}&pn=Gau%20Seva%20Trust&am=${amount}&cu=INR`;
    
    // Clear previous QR code
    document.getElementById('donationQrCode').innerHTML = '';
    
    // Generate new QR code
    new QRCode(document.getElementById('donationQrCode'), {
        text: qrText,
        width: 150,
        height: 150,
        colorDark: "#2E7D32",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Update UPI ID display
    document.getElementById('donationUpiId').textContent = upiId;
    
    // Copy UPI ID button
    document.querySelector('.copy-btn').addEventListener('click', function() {
        navigator.clipboard.writeText(upiId);
        alert('UPI ID कॉपी किया गया');
    });
    
    // UPI app buttons
    document.querySelectorAll('.upi-app-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const app = this.getAttribute('data-app');
            payment.processUPIPayment(amount, upiId);
        });
    });
}

// Load user data if logged in
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('donorName').value = user.name || '';
        document.getElementById('donorMobile').value = user.mobile || '';
        document.getElementById('donorEmail').value = user.email || '';
        
        donationData.name = user.name;
        donationData.mobile = user.mobile;
        donationData.email = user.email;
        donationData.userId = user.id;
    }
}

// Send receipt email
async function sendReceiptEmail() {
    // This would be handled by Google Apps Script
    console.log('Receipt email sent to:', donationData.email);
}

// Update leaderboard
async function updateLeaderboard() {
    if (donationData.sharePublic) {
        // Update leaderboard via Google Sheets
        await db.saveDonation({
            donorName: donationData.name,
            mobile: donationData.mobile,
            amount: donationData.amount,
            type: donationData.type,
            paymentMethod: donationData.paymentMethod,
            razorpayId: donationData.paymentId,
            email: donationData.email,
            receipt80G: donationData.receipt80G,
            userId: donationData.userId
        });
    }
}

// Print receipt
function printReceipt() {
    const receiptContent = `
        <div style="padding: 20px; font-family: Arial; max-width: 400px;">
            <h2 style="color: #2E7D32; text-align: center;">गौ सेवा ट्रस्ट</h2>
            <h3 style="text-align: center;">दान रसीद</h3>
            <hr>
            <p><strong>दान आईडी:</strong> ${donationData.donationId}</p>
            <p><strong>दाता नाम:</strong> ${donationData.name}</p>
            <p><strong>राशि:</strong> ₹${donationData.amount}</p>
            <p><strong>दान प्रकार:</strong> ${donationData.type === 'one-time' ? 'एक बार दान' : donationData.type === 'monthly' ? 'मासिक दान' : 'दैनिक दान'}</p>
            <p><strong>तारीख:</strong> ${new Date().toLocaleDateString('hi-IN')}</p>
            <p><strong>भुगतान विधि:</strong> ${donationData.paymentMethod}</p>
            <hr>
            <p style="text-align: center;"><em>धन्यवाद! आपका दान गायों और स्ट्रीट एनिमल्स की देखभाल में उपयोग किया जाएगा।</em></p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
}

// Share donation
function shareDonation() {
    if (navigator.share) {
        navigator.share({
            title: 'मैंने गौ सेवा ट्रस्ट को दान किया',
            text: `मैंने गौ सेवा ट्रस्ट को ₹${donationData.amount} का दान किया है। आप भी दान करके जानवरों की मदद कर सकते हैं।`,
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        const text = `मैंने गौ सेवा ट्रस्ट को ₹${donationData.amount} का दान किया है। आप भी दान करके जानवरों की मदद कर सकते हैं: ${window.location.href}`;
        navigator.clipboard.writeText(text);
        alert('लिंक कॉपी किया गया! आप इसे शेयर कर सकते हैं।');
    }
}

// Save for later
function saveForLater() {
    const donation = {
        ...donationData,
        savedAt: new Date().toISOString()
    };
    
    const savedDonations = JSON.parse(localStorage.getItem('savedDonations') || '[]');
    savedDonations.push(donation);
    localStorage.setItem('savedDonations', JSON.stringify(savedDonations));
    
    alert('दान सेव किया गया। आप इसे बाद में पूरा कर सकते हैं।');
    window.location.href = 'index.html';
}