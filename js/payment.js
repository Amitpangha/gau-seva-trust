// Razorpay Payment Integration
class PaymentSystem {
    constructor() {
        this.razorpayKey = 'rzp_test_YOUR_KEY'; // Test key
        this.isLive = false;
        this.user = null;
        
        this.loadRazorpaySDK();
    }
    
    loadRazorpaySDK() {
        if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.head.appendChild(script);
        }
    }
    
    // Initialize payment
    async processPayment(options) {
        return new Promise((resolve, reject) => {
            // Convert amount to paise
            const amountInPaise = Math.round(options.amount * 100);
            
            const paymentOptions = {
                key: this.razorpayKey,
                amount: amountInPaise,
                currency: 'INR',
                name: 'गौ सेवा ट्रस्ट',
                description: options.description || 'Donation for Gau Seva',
                image: 'https://yourwebsite.com/logo.png',
                handler: async (response) => {
                    try {
                        // Verify payment on server
                        const verification = await this.verifyPayment(response.razorpay_payment_id);
                        
                        if (verification.success) {
                            // Save donation to database
                            const donationData = {
                                donorName: options.name,
                                mobile: options.mobile,
                                amount: options.amount,
                                type: options.type,
                                paymentMethod: 'Razorpay',
                                razorpayId: response.razorpay_payment_id,
                                email: options.email,
                                receipt80G: options.receipt80G || false,
                                userId: options.userId || null
                            };
                            
                            await db.saveDonation(donationData);
                            
                            resolve({
                                success: true,
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature
                            });
                        } else {
                            reject(new Error('Payment verification failed'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                },
                prefill: {
                    name: options.name || '',
                    email: options.email || '',
                    contact: options.mobile || ''
                },
                notes: {
                    donationType: options.type,
                    address: options.address || ''
                },
                theme: {
                    color: '#2E7D32'
                }
            };
            
            const rzp = new Razorpay(paymentOptions);
            rzp.open();
        });
    }
    
    // Verify payment (In production, verify on your server)
    async verifyPayment(paymentId) {
        try {
            // In production, call your backend to verify
            // For demo, always return success
            return { success: true, paymentId: paymentId };
        } catch (error) {
            console.error('Payment verification error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Process UPI Payment
    processUPIPayment(amount, upiId) {
        const upiLinks = {
            gpay: `tez://upi/pay?pa=${upiId}&pn=Gau%20Seva%20Trust&am=${amount}`,
            phonepe: `phonepe://upi/pay?pa=${upiId}&pn=Gau%20Seva%20Trust&am=${amount}`,
            paytm: `paytmmp://upi/pay?pa=${upiId}&pn=Gau%20Seva%20Trust&am=${amount}`
        };
        
        // Try to open UPI app
        window.location.href = upiLinks.gpay;
        
        // Fallback if app not installed
        setTimeout(() => {
            if (!document.hidden) {
                this.showUPIInstructions(upiId, amount);
            }
        }, 1000);
    }
    
    showUPIInstructions(upiId, amount) {
        const modal = document.createElement('div');
        modal.className = 'upi-instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3><i class="fas fa-qrcode"></i> UPI से भुगतान करें</h3>
                <p>कृपया अपने UPI ऐप में निम्नलिखित डिटेल्स दर्ज करें:</p>
                
                <div class="upi-details">
                    <div class="detail-item">
                        <label>UPI ID:</label>
                        <code>${upiId}</code>
                        <button class="copy-btn"><i class="far fa-copy"></i></button>
                    </div>
                    <div class="detail-item">
                        <label>राशि:</label>
                        <code>₹${amount}</code>
                    </div>
                    <div class="detail-item">
                        <label>नाम:</label>
                        <code>Gau Seva Trust</code>
                    </div>
                </div>
                
                <div class="instructions">
                    <p><strong>निर्देश:</strong></p>
                    <ol>
                        <li>अपना UPI ऐप खोलें (Google Pay, PhonePe, Paytm)</li>
                        <li>"Send Money/Pay" पर क्लिक करें</li>
                        <li>UPI ID दर्ज करें: <strong>${upiId}</strong></li>
                        <li>राशि दर्ज करें: <strong>₹${amount}</strong></li>
                        <li>भुगतान पूरा करें</li>
                    </ol>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-done">मैंने भुगतान कर दिया है</button>
                    <button class="btn-cancel">रद्द करें</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Copy UPI ID
        modal.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(upiId);
            alert('UPI ID कॉपी किया गया');
        });
        
        // Close modal
        modal.querySelector('.btn-done').addEventListener('click', async () => {
            const name = prompt('आपका नाम दर्ज करें:');
            if (name) {
                // Save UPI donation
                await db.saveDonation({
                    donorName: name,
                    amount: amount,
                    type: 'UPI',
                    paymentMethod: 'UPI',
                    status: 'Pending Verification'
                });
                
                alert('धन्यवाद! हम आपके भुगतान की पुष्टि करेंगे और आपको अपडेट भेजेंगे।');
                modal.remove();
            }
        });
        
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            modal.remove();
        });
    }
    
    // Process Subscription
    async processSubscription(userId, type, amount) {
        // For monthly subscriptions
        const subscriptionData = {
            userId: userId,
            type: 'monthly',
            amount: amount,
            startDate: new Date().toISOString(),
            nextBilling: this.getNextMonthDate(),
            status: 'Active'
        };
        
        // Save to subscriptions sheet
        await db.saveSubscription(subscriptionData);
        
        // Process first payment
        await this.processPayment({
            amount: amount,
            type: 'monthly_subscription',
            description: `Monthly subscription - ₹${amount}/month`
        });
        
        return subscriptionData;
    }
    
    getNextMonthDate() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().split('T')[0];
    }
}

// Initialize payment system
const payment = new PaymentSystem();