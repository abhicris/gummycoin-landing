// Backend API Handler for Gummy Landing Page
// This file contains the server-side logic for email collection, whitelist management, and private sale

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data storage (in production, use a proper database)
const DATA_DIR = path.join(__dirname, 'data');
const EMAILS_FILE = path.join(DATA_DIR, 'emails.json');
const WHITELIST_FILE = path.join(DATA_DIR, 'whitelist.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

// Initialize data files
async function initializeDataFiles() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize emails.json
        try {
            await fs.access(EMAILS_FILE);
        } catch {
            await fs.writeFile(EMAILS_FILE, JSON.stringify([], null, 2));
        }
        
        // Initialize whitelist.json
        try {
            await fs.access(WHITELIST_FILE);
        } catch {
            await fs.writeFile(WHITELIST_FILE, JSON.stringify([], null, 2));
        }
        
        // Initialize applications.json
        try {
            await fs.access(APPLICATIONS_FILE);
        } catch {
            await fs.writeFile(APPLICATIONS_FILE, JSON.stringify([], null, 2));
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// Email collection endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email, source = 'landing-page', name, interest } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Read existing emails
        const emailsData = await fs.readFile(EMAILS_FILE, 'utf8');
        const emails = JSON.parse(emailsData);
        
        // Check if email already exists
        const existingEmail = emails.find(e => e.email.toLowerCase() === email.toLowerCase());
        if (existingEmail) {
            return res.status(409).json({ error: 'Email already subscribed' });
        }
        
        // Add new email
        const newEmail = {
            email: email.toLowerCase(),
            source,
            name: name || '',
            interest: interest || '',
            subscribedAt: new Date().toISOString(),
            ip: req.ip
        };
        
        emails.push(newEmail);
        await fs.writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2));
        
        // Send welcome email (optional)
        await sendWelcomeEmail(email, name);
        
        // Send to n8n webhook if configured
        await sendToN8N(newEmail);
        
        console.log(`New email subscription: ${email} from ${source}`);
        
        res.json({ 
            success: true, 
            message: 'Successfully subscribed to newsletter',
            subscriberCount: emails.length
        });
        
    } catch (error) {
        console.error('Error subscribing email:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Whitelist application endpoint
app.post('/api/whitelist/apply', async (req, res) => {
    try {
        const { walletAddress, email, requestedAllocation, name } = req.body;
        
        if (!walletAddress || !email) {
            return res.status(400).json({ error: 'Wallet address and email are required' });
        }
        
        // Read existing applications
        const applicationsData = await fs.readFile(APPLICATIONS_FILE, 'utf8');
        const applications = JSON.parse(applicationsData);
        
        // Check if wallet already applied
        const existingApplication = applications.find(app => 
            app.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
        
        if (existingApplication) {
            return res.status(409).json({ error: 'Wallet address already applied' });
        }
        
        // Add new application
        const newApplication = {
            walletAddress: walletAddress.toLowerCase(),
            email: email.toLowerCase(),
            requestedAllocation: parseInt(requestedAllocation) || 0,
            name: name || '',
            status: 'pending',
            appliedAt: new Date().toISOString(),
            ip: req.ip
        };
        
        applications.push(newApplication);
        await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
        
        // Send confirmation email
        await sendApplicationConfirmation(email, walletAddress, requestedAllocation);
        
        console.log(`New whitelist application: ${walletAddress} from ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Application submitted successfully',
            applicationId: newApplication.appliedAt
        });
        
    } catch (error) {
        console.error('Error submitting whitelist application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Check whitelist status endpoint
app.get('/api/whitelist/check/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        // Read whitelist data
        const whitelistData = await fs.readFile(WHITELIST_FILE, 'utf8');
        const whitelist = JSON.parse(whitelistData);
        
        // Check if wallet is whitelisted
        const whitelistedWallet = whitelist.find(w => 
            w.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
        
        if (whitelistedWallet) {
            res.json({
                isWhitelisted: true,
                allocation: whitelistedWallet.allocation,
                purchaseDeadline: whitelistedWallet.purchaseDeadline,
                status: whitelistedWallet.status
            });
        } else {
            res.json({
                isWhitelisted: false,
                allocation: 0,
                purchaseDeadline: null,
                status: 'not_whitelisted'
            });
        }
        
    } catch (error) {
        console.error('Error checking whitelist status:', error);
        res.status(500).json({ error: 'Failed to check whitelist status' });
    }
});

// Purchase tokens endpoint
app.post('/api/purchase', async (req, res) => {
    try {
        const { walletAddress, allocation, totalCost, paymentMethod } = req.body;
        
        if (!walletAddress || !allocation || !totalCost) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Verify whitelist status
        const whitelistData = await fs.readFile(WHITELIST_FILE, 'utf8');
        const whitelist = JSON.parse(whitelistData);
        
        const whitelistedWallet = whitelist.find(w => 
            w.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
        
        if (!whitelistedWallet) {
            return res.status(403).json({ error: 'Wallet not whitelisted' });
        }
        
        if (whitelistedWallet.status !== 'approved') {
            return res.status(403).json({ error: 'Purchase not approved' });
        }
        
        // Process purchase (in production, integrate with payment processor)
        const purchase = {
            walletAddress: walletAddress.toLowerCase(),
            allocation: parseInt(allocation),
            totalCost: parseFloat(totalCost),
            paymentMethod: paymentMethod || 'crypto',
            purchasedAt: new Date().toISOString(),
            status: 'pending',
            transactionId: generateTransactionId()
        };
        
        // Save purchase record
        const purchasesFile = path.join(DATA_DIR, 'purchases.json');
        let purchases = [];
        try {
            const purchasesData = await fs.readFile(purchasesFile, 'utf8');
            purchases = JSON.parse(purchasesData);
        } catch {
            // File doesn't exist, start with empty array
        }
        
        purchases.push(purchase);
        await fs.writeFile(purchasesFile, JSON.stringify(purchases, null, 2));
        
        // Send purchase confirmation email
        await sendPurchaseConfirmation(walletAddress, purchase);
        
        console.log(`New purchase: ${walletAddress} - ${allocation} GUMMY for $${totalCost}`);
        
        res.json({
            success: true,
            message: 'Purchase successful',
            transactionId: purchase.transactionId,
            status: purchase.status
        });
        
    } catch (error) {
        console.error('Error processing purchase:', error);
        res.status(500).json({ error: 'Failed to process purchase' });
    }
});

// Admin endpoints (protected in production)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const emailsData = await fs.readFile(EMAILS_FILE, 'utf8');
        const applicationsData = await fs.readFile(APPLICATIONS_FILE, 'utf8');
        const whitelistData = await fs.readFile(WHITELIST_FILE, 'utf8');
        
        const emails = JSON.parse(emailsData);
        const applications = JSON.parse(applicationsData);
        const whitelist = JSON.parse(whitelistData);
        
        res.json({
            totalSubscribers: emails.length,
            totalApplications: applications.length,
            totalWhitelisted: whitelist.length,
            recentSubscribers: emails.slice(-10),
            recentApplications: applications.slice(-10)
        });
        
    } catch (error) {
        console.error('Error getting admin stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Email sending functions
async function sendWelcomeEmail(email, name) {
    // Configure email transporter (replace with your email service)
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Gummy Ecosystem! 🍬',
        html: `
            <h2>Welcome to Gummy, ${name || 'there'}! 🍬</h2>
            <p>Thank you for joining the future of payments and rewards!</p>
            <p>You'll be the first to know about:</p>
            <ul>
                <li>🎯 Private sale announcements</li>
                <li>🚀 App launch updates</li>
                <li>💰 Exclusive rewards and airdrops</li>
                <li>📱 New features and partnerships</li>
            </ul>
            <p>Stay tuned for exciting updates!</p>
            <br>
            <p>Best regards,<br>The Gummy Team</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}

async function sendApplicationConfirmation(email, walletAddress, allocation) {
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'GummyCoin Private Sale Application Received 🍬',
        html: `
            <h2>Application Received! 🍬</h2>
            <p>Thank you for applying to the GummyCoin private sale!</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>Application Details:</h3>
                <p><strong>Wallet Address:</strong> ${walletAddress}</p>
                <p><strong>Requested Allocation:</strong> ${allocation.toLocaleString()} GUMMY</p>
                <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>We will review your application and notify you within 48 hours.</p>
            <p>If approved, you'll receive exclusive access to purchase GummyCoin tokens at $0.001 per token.</p>
            <br>
            <p>Best regards,<br>The Gummy Team</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Application confirmation sent to ${email}`);
    } catch (error) {
        console.error('Error sending application confirmation:', error);
    }
}

async function sendPurchaseConfirmation(walletAddress, purchase) {
    // Find user email from applications
    const applicationsData = await fs.readFile(APPLICATIONS_FILE, 'utf8');
    const applications = JSON.parse(applicationsData);
    
    const application = applications.find(app => 
        app.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    
    if (!application) return;
    
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: application.email,
        subject: 'GummyCoin Purchase Confirmed! 🍬',
        html: `
            <h2>Purchase Confirmed! 🍬</h2>
            <p>Your GummyCoin purchase has been successfully processed!</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>Purchase Details:</h3>
                <p><strong>Transaction ID:</strong> ${purchase.transactionId}</p>
                <p><strong>Tokens Purchased:</strong> ${purchase.allocation.toLocaleString()} GUMMY</p>
                <p><strong>Total Cost:</strong> $${purchase.totalCost.toFixed(2)}</p>
                <p><strong>Purchase Date:</strong> ${new Date(purchase.purchasedAt).toLocaleDateString()}</p>
            </div>
            <p>Your tokens will be distributed after the private sale ends on January 15, 2025.</p>
            <p>Thank you for being part of the Gummy ecosystem!</p>
            <br>
            <p>Best regards,<br>The Gummy Team</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Purchase confirmation sent to ${application.email}`);
    } catch (error) {
        console.error('Error sending purchase confirmation:', error);
    }
}

// N8N Webhook Integration
async function sendToN8N(emailData) {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
        console.log('N8N webhook URL not configured, skipping webhook call');
        return;
    }
    
    try {
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailData.email,
                source: emailData.source,
                name: emailData.name,
                interest: emailData.interest,
                subscribedAt: emailData.subscribedAt,
                ip: emailData.ip,
                subscriberCount: emailData.subscriberCount || 0
            })
        });
        
        if (response.ok) {
            console.log(`Successfully sent to N8N webhook: ${emailData.email}`);
        } else {
            console.error(`N8N webhook failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error sending to N8N webhook:', error);
    }
}

// Utility functions
function generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize and start server
async function startServer() {
    await initializeDataFiles();
    
    app.listen(PORT, () => {
        console.log(`🚀 Gummy API server running on port ${PORT}`);
        console.log(`📧 Email collection: POST /api/subscribe`);
        console.log(`📝 Whitelist application: POST /api/whitelist/apply`);
        console.log(`🔍 Whitelist check: GET /api/whitelist/check/:walletAddress`);
        console.log(`💰 Purchase tokens: POST /api/purchase`);
        console.log(`📊 Admin stats: GET /api/admin/stats`);
    });
}

startServer().catch(console.error);

module.exports = app;
