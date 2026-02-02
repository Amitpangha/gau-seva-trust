// Google Sheets API Configuration
const SHEET_ID = '1d413ccDljpMJsSpDO5y_mSFbXRFd8MqRHwXXjjYoIQ4'; // From sheet URL
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Get from Google Cloud Console (Free)

// Or use Google Apps Script Web App (Easier, No API Key Needed)
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';

class GoogleSheetsDB {
    // Save user registration
    async saveUser(userData) {
        const data = {
            action: 'saveUser',
            ...userData
        };
        
        return this.callAppsScript(data);
    }
    
    // Save donation
    async saveDonation(donationData) {
        const data = {
            action: 'saveDonation',
            ...donationData
        };
        
        return this.callAppsScript(data);
    }
    
    // Save expense
    async saveExpense(expenseData) {
        const data = {
            action: 'saveExpense',
            ...expenseData
        };
        
        return this.callAppsScript(data);
    }
    
    // Get all donations for transparency
    async getDonations() {
        const data = {
            action: 'getDonations'
        };
        
        return this.callAppsScript(data);
    }
    
    // Get all expenses
    async getExpenses() {
        const data = {
            action: 'getExpenses'
        };
        
        return this.callAppsScript(data);
    }
    
    // Get leaderboard
    async getLeaderboard() {
        const data = {
            action: 'getLeaderboard'
        };
        
        return this.callAppsScript(data);
    }
    
    // Call Google Apps Script Web App
    async callAppsScript(data) {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error calling Apps Script:', error);
            
            // Fallback to localStorage for demo
            return this.fallbackToLocalStorage(data);
        }
    }
    
    // Fallback to localStorage when offline
    fallbackToLocalStorage(data) {
        if (data.action === 'saveUser') {
            const users = JSON.parse(localStorage.getItem('gauSevaUsers') || '[]');
            users.push({
                id: 'GS' + Date.now(),
                ...data,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('gauSevaUsers', JSON.stringify(users));
            return { success: true, message: 'Saved to local storage' };
        }
        
        return { success: false, message: 'Offline mode' };
    }
}

// Initialize
const db = new GoogleSheetsDB();