// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    initMobileMenu();
    initLiveCounter();
    initDonationButtons();
    initScrollTop();
    initModal();
    initCopyUPI();
    initFloatingButtons();
    updateLiveData();
});

// ===== THEME TOGGLE =====
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuBtn.querySelector('i').className = 
            mobileMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
            mobileMenu.classList.remove('active');
            menuBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
}

// ===== LIVE COUNTER ANIMATION =====
function initLiveCounter() {
    const counters = document.querySelectorAll('.counter-item h3');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = counter.id === 'totalDonations' 
                    ? '₹' + Math.round(current).toLocaleString()
                    : Math.round(current).toLocaleString();
                setTimeout(updateCounter, 20);
            }
        };
        
        updateCounter();
    });
}

// ===== DONATION BUTTONS =====
function initDonationButtons() {
    // Amount buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            alert(`आपने ₹${amount} का दान चुना है। पेमेंट पेज पर रीडायरेक्ट किया जा रहा है...`);
            // Redirect to payment page
            window.location.href = `donate.html?amount=${amount}&type=one-time`;
        });
    });
    
    // Daily donation buttons
    document.querySelectorAll('.daily-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dailyAmount = this.getAttribute('data-daily');
            const monthlyAmount = dailyAmount * 30;
            if (confirm(`आप ₹${dailyAmount}/दिन (₹${monthlyAmount}/माह) का दैनिक दान चुन रहे हैं। क्या आप आगे बढ़ना चाहते हैं?`)) {
                window.location.href = `donate.html?daily=${dailyAmount}&type=daily`;
            }
        });
    });
    
    // UPI app buttons
    document.querySelectorAll('.upi-app').forEach(btn => {
        btn.addEventListener('click', function() {
            const app = this.getAttribute('data-app');
            const upiId = document.getElementById('upiCode').textContent;
            
            let url;
            switch(app) {
                case 'gpay':
                    url = `tez://upi/pay?pa=${upiId}&pn=Gau%20Seva%20Trust`;
                    break;
                case 'phonepe':
                    url = `phonepe://upi/pay?pa=${upiId}&pn=Gau%20Seva%20Trust`;
                    break;
                case 'paytm':
                    url = `paytmmp://upi/pay?pa=${upiId}&pn=Gau%20Seva%20Trust`;
                    break;
            }
            
            window.location.href = url;
            setTimeout(() => {
                if (!document.hidden) {
                    alert(`कृपया ${app} ऐप खोलें और UPI ID: ${upiId} पर भुगतान करें`);
                }
            }, 1000);
        });
    });
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
    const scrollBtn = document.querySelector('.scroll-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== MODAL =====
function initModal() {
    const modal = document.getElementById('proofModal');
    const closeBtn = document.querySelector('.close-modal');
    const viewProofBtns = document.querySelectorAll('.view-proof');
    
    viewProofBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const proofDetails = this.closest('.expense-proof').querySelector('.proof-details');
            const title = proofDetails.querySelector('strong').textContent;
            const details = proofDetails.querySelector('small').textContent;
            
            document.getElementById('proofContent').innerHTML = `
                <h4>${title}</h4>
                <p>${details}</p>
                <img src="images/proofs/${title.toLowerCase().replace(/\s+/g, '-')}.jpg" 
                     alt="${title}" style="width:100%; border-radius:10px; margin:1rem 0;">
                <p><strong>बिल नंबर:</strong> BIL${Date.now().toString().slice(-6)}</p>
                <p><strong>दिनांक:</strong> ${new Date().toLocaleDateString('hi-IN')}</p>
                <p><strong>सत्यापित:</strong> ✅ ट्रस्ट द्वारा सत्यापित</p>
            `;
            
            modal.style.display = 'flex';
        });
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ===== COPY UPI ID =====
function initCopyUPI() {
    const copyBtn = document.querySelector('.copy-upi');
    
    copyBtn.addEventListener('click', function() {
        const upiId = document.getElementById('upiCode').textContent;
        
        navigator.clipboard.writeText(upiId).then(() => {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> कॉपी किया गया';
            this.style.background = '#4CAF50';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
            }, 2000);
        });
    });
}

// ===== FLOATING BUTTONS =====
function initFloatingButtons() {
    // WhatsApp button
    document.querySelector('.whatsapp-btn').addEventListener('click', () => {
        window.open('https://wa.me/919876543210?text=गौ%20सेवा%20ट्रस्ट%20के%20बारे%20में%20जानकारी%20चाहिए', '_blank');
    });
    
    // Donate float button
    document.querySelector('.donate-float').addEventListener('click', () => {
        window.location.href = 'donate.html';
    });
}

// ===== LIVE DATA UPDATES =====
async function updateLiveData() {
    try {
        // Simulate live updates from Google Sheets
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/Donations?key=YOUR_API_KEY');
        const data = await response.json();
        
        // Update live feed
        updateLiveFeed(data.values);
        
        // Update counters every 30 seconds
        setInterval(updateLiveData, 30000);
    } catch (error) {
        console.log('Using mock data for demo');
        // Mock updates for demo
        simulateLiveUpdates();
    }
}

function simulateLiveUpdates() {
    setInterval(() => {
        const donors = ['राजेश शर्मा', 'प्रिया पटेल', 'अमित सिंह', 'नीता जोशी', 'संजय गुप्ता'];
        const amounts = ['₹1,000', '₹2,500', '₹500', '₹5,000', '₹1,500'];
        const types = ['एक बार दान', 'मासिक सदस्यता', 'दैनिक दान'];
        
        const randomDonor = donors[Math.floor(Math.random() * donors.length)];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        addToLiveFeed(randomDonor, randomAmount, randomType);
        
        // Update total
        const totalElement = document.getElementById('totalDonations');
        const currentTotal = parseInt(totalElement.textContent.replace(/[^0-9]/g, ''));
        const newAmount = parseInt(randomAmount.replace(/[^0-9]/g, ''));
        totalElement.textContent = '₹' + (currentTotal + newAmount).toLocaleString();
        
    }, 15000); // Every 15 seconds
}

function addToLiveFeed(donor, amount, type) {
    const feed = document.getElementById('liveFeed');
    const donorInitials = donor.split(' ').map(n => n[0]).join('');
    
    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item new';
    feedItem.innerHTML = `
        <div class="donor-avatar">${donorInitials}</div>
        <div class="feed-content">
            <strong>${donor}</strong> ने ${amount} का दान किया
            <small>अभी • ${type}</small>
        </div>
        <div class="amount-badge">${amount}</div>
    `;
    
    feed.insertBefore(feedItem, feed.firstChild);
    
    // Remove "new" class after 5 seconds
    setTimeout(() => {
        feedItem.classList.remove('new');
    }, 5000);
    
    // Keep only last 10 items
    if (feed.children.length > 10) {
        feed.removeChild(feed.lastChild);
    }
}

// ===== GOOGLE SHEETS INTEGRATION =====
// This function will save registration data to Google Sheets
async function saveToGoogleSheets(formData) {
    // You'll need to set up Google Sheets API
    // For now, we'll use a simple Google Forms workaround
    
    const googleFormURL = 'YOUR_GOOGLE_FORM_URL';
    const formDataEncoded = new URLSearchParams(formData).toString();
    
    try {
        await fetch(googleFormURL, {
            method: 'POST',
            mode: 'no-cors',
            body: formDataEncoded,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return true;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return false;
    }
}