// Private Sale JavaScript
class PrivateSaleManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.walletAddress = null;
        this.isWhitelisted = false;
        this.allocation = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkWalletConnection();
        this.loadWhitelistData();
    }

    bindEvents() {
        // Wallet connection buttons
        document.getElementById('connectWalletBtn').addEventListener('click', () => this.connectWallet());
        document.getElementById('connectWalletBtn2').addEventListener('click', () => this.connectWallet());
        
        // Whitelist check button
        document.getElementById('checkWhitelistBtn').addEventListener('click', () => this.checkWhitelistStatus());
        
        // Form submissions
        document.getElementById('submitWhitelistBtn').addEventListener('click', (e) => this.submitWhitelistApplication(e));
        document.getElementById('emailForm').addEventListener('submit', (e) => this.subscribeToNewsletter(e));
        
        // Purchase button
        document.getElementById('purchaseBtn').addEventListener('click', () => this.initiatePurchase());
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showNotification('Please install MetaMask or another Web3 wallet', 'error');
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.walletAddress = accounts[0];
            
            // Create provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            this.updateWalletStatus();
            this.showNotification('Wallet connected successfully!', 'success');
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showNotification('Failed to connect wallet', 'error');
        }
    }

    updateWalletStatus() {
        const walletStatus = document.getElementById('walletStatus');
        const whitelistForm = document.getElementById('whitelistForm');
        const walletAddressInput = document.getElementById('walletAddress');
        
        if (this.walletAddress) {
            walletStatus.style.display = 'none';
            whitelistForm.style.display = 'block';
            walletAddressInput.value = this.walletAddress;
            
            // Update nav button
            const navBtn = document.getElementById('connectWalletBtn');
            navBtn.textContent = `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
            navBtn.classList.add('connected');
        } else {
            walletStatus.style.display = 'block';
            whitelistForm.style.display = 'none';
        }
    }

    async checkWhitelistStatus() {
        if (!this.walletAddress) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }

        try {
            this.showNotification('Checking whitelist status...', 'info');
            
            // Simulate API call to check whitelist
            const isWhitelisted = await this.checkWhitelistAPI(this.walletAddress);
            
            this.isWhitelisted = isWhitelisted;
            this.allocation = isWhitelisted ? this.getRandomAllocation() : 0;
            
            this.displayWhitelistResult();
            
        } catch (error) {
            console.error('Error checking whitelist:', error);
            this.showNotification('Failed to check whitelist status', 'error');
        }
    }

    async checkWhitelistAPI(address) {
        // Simulate API call - replace with actual backend call
        return new Promise((resolve) => {
            setTimeout(() => {
                // For demo purposes, make some addresses whitelisted
                const whitelistedAddresses = [
                    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                    '0x1234567890123456789012345678901234567890',
                    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
                ];
                
                const isWhitelisted = whitelistedAddresses.some(addr => 
                    addr.toLowerCase() === address.toLowerCase()
                );
                
                resolve(isWhitelisted);
            }, 2000);
        });
    }

    getRandomAllocation() {
        const allocations = [1000, 5000, 10000, 25000, 50000];
        return allocations[Math.floor(Math.random() * allocations.length)];
    }

    displayWhitelistResult() {
        const whitelistForm = document.getElementById('whitelistForm');
        const whitelistResult = document.getElementById('whitelistResult');
        const purchaseBtn = document.getElementById('purchaseBtn');
        
        whitelistForm.style.display = 'none';
        whitelistResult.style.display = 'block';
        
        const statusElement = document.getElementById('whitelistStatus');
        const allocationElement = document.getElementById('allocationAmount');
        const deadlineElement = document.getElementById('purchaseDeadline');
        
        if (this.isWhitelisted) {
            statusElement.textContent = 'Whitelisted ✅';
            statusElement.style.color = '#10b981';
            allocationElement.textContent = `${this.allocation.toLocaleString()} GUMMY`;
            deadlineElement.textContent = 'January 15, 2025';
            purchaseBtn.style.display = 'block';
            
            this.showNotification('Congratulations! You are whitelisted for the private sale.', 'success');
        } else {
            statusElement.textContent = 'Not Whitelisted ❌';
            statusElement.style.color = '#ef4444';
            allocationElement.textContent = 'N/A';
            deadlineElement.textContent = 'N/A';
            purchaseBtn.style.display = 'none';
            
            this.showNotification('You are not currently whitelisted. Apply below to join the waitlist.', 'warning');
        }
    }

    async submitWhitelistApplication(e) {
        e.preventDefault();
        
        const email = document.getElementById('emailAddress').value;
        const allocation = document.getElementById('allocationAmount').value;
        
        if (!email || !allocation) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            this.showNotification('Submitting application...', 'info');
            
            // Simulate API call
            await this.submitApplicationAPI({
                walletAddress: this.walletAddress,
                email: email,
                requestedAllocation: parseInt(allocation),
                timestamp: new Date().toISOString()
            });
            
            this.showNotification('Application submitted successfully! We will review and get back to you.', 'success');
            
            // Reset form
            document.getElementById('emailAddress').value = '';
            document.getElementById('allocationAmount').value = '';
            
        } catch (error) {
            console.error('Error submitting application:', error);
            this.showNotification('Failed to submit application', 'error');
        }
    }

    async submitApplicationAPI(data) {
        // Simulate API call - replace with actual backend call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Application submitted:', data);
                resolve(true);
            }, 2000);
        });
    }

    async subscribeToNewsletter(e) {
        e.preventDefault();
        
        const email = document.getElementById('newsletterEmail').value;
        
        if (!email) {
            this.showNotification('Please enter your email address', 'error');
            return;
        }

        try {
            this.showNotification('Subscribing to newsletter...', 'info');
            
            // Simulate API call
            await this.subscribeNewsletterAPI({
                email: email,
                source: 'private-sale-page',
                timestamp: new Date().toISOString()
            });
            
            this.showNotification('Successfully subscribed to newsletter!', 'success');
            document.getElementById('newsletterEmail').value = '';
            
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            this.showNotification('Failed to subscribe to newsletter', 'error');
        }
    }

    async subscribeNewsletterAPI(data) {
        // Simulate API call - replace with actual backend call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Newsletter subscription:', data);
                resolve(true);
            }, 1000);
        });
    }

    async initiatePurchase() {
        if (!this.isWhitelisted) {
            this.showNotification('You must be whitelisted to purchase tokens', 'error');
            return;
        }

        try {
            this.showNotification('Initiating purchase...', 'info');
            
            // Calculate purchase amount
            const tokenPrice = 0.001; // $0.001 per token
            const totalCost = this.allocation * tokenPrice;
            
            // Show purchase confirmation
            const confirmed = confirm(
                `Purchase ${this.allocation.toLocaleString()} GUMMY tokens for $${totalCost.toFixed(2)}?\n\n` +
                `Wallet: ${this.walletAddress}\n` +
                `Allocation: ${this.allocation.toLocaleString()} GUMMY\n` +
                `Total Cost: $${totalCost.toFixed(2)}`
            );
            
            if (confirmed) {
                // Simulate purchase process
                await this.processPurchase(totalCost);
            }
            
        } catch (error) {
            console.error('Error initiating purchase:', error);
            this.showNotification('Failed to initiate purchase', 'error');
        }
    }

    async processPurchase(totalCost) {
        try {
            this.showNotification('Processing purchase...', 'info');
            
            // Simulate purchase API call
            await this.purchaseAPI({
                walletAddress: this.walletAddress,
                allocation: this.allocation,
                totalCost: totalCost,
                timestamp: new Date().toISOString()
            });
            
            this.showNotification('Purchase successful! Tokens will be distributed after the sale ends.', 'success');
            
        } catch (error) {
            console.error('Error processing purchase:', error);
            this.showNotification('Failed to process purchase', 'error');
        }
    }

    async purchaseAPI(data) {
        // Simulate API call - replace with actual backend call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Purchase processed:', data);
                resolve(true);
            }, 3000);
        });
    }

    loadWhitelistData() {
        // Load any saved whitelist data from localStorage
        const savedData = localStorage.getItem('gummyWhitelistData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.walletAddress = data.walletAddress;
                this.isWhitelisted = data.isWhitelisted;
                this.allocation = data.allocation;
                
                if (this.walletAddress) {
                    this.updateWalletStatus();
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    saveWhitelistData() {
        const data = {
            walletAddress: this.walletAddress,
            isWhitelisted: this.isWhitelisted,
            allocation: this.allocation
        };
        localStorage.setItem('gummyWhitelistData', JSON.stringify(data));
    }

    checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
            this.walletAddress = window.ethereum.selectedAddress;
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.updateWalletStatus();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrivateSaleManager();
});

// Utility functions
function scrollToSaleInfo() {
    document.getElementById('sale-info').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Handle wallet changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected wallet
            location.reload();
        } else {
            // User switched accounts
            location.reload();
        }
    });
}

