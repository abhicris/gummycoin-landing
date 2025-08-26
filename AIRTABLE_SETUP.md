# Airtable Database Setup Guide

## 🎯 Why Airtable?
Since Vercel serverless functions have a read-only filesystem, we need an external database. Airtable is perfect because:
- ✅ **Free tier** (1,200 records per base)
- ✅ **Easy setup** - No complex database configuration
- ✅ **Web interface** - View and manage emails directly
- ✅ **API access** - Perfect for our serverless functions
- ✅ **Export options** - Download as CSV, JSON, etc.

## 🔧 Setup Instructions

### 1. Create Airtable Account
1. Go to [airtable.com](https://airtable.com)
2. Sign up for a free account
3. Create a new base (workspace)

### 2. Create Email Table
1. In your new base, create a table called **"Emails"**
2. Add these columns:
   - **Email** (Single line text) - Required
   - **Source** (Single line text) - Default: "landing-page"
   - **Name** (Single line text) - Optional
   - **Interest** (Single line text) - Default: "early-access"
   - **SubscribedAt** (Date) - Auto-generated
   - **IP** (Single line text) - For tracking

### 3. Get API Credentials
1. Go to [airtable.com/api](https://airtable.com/api)
2. Select your base
3. Copy the **Base ID** (starts with `app...`)
4. Go to your account settings → API
5. Generate a new API key
6. Copy the **API Key**

### 4. Configure Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:
   ```
   AIRTABLE_API_KEY=your_api_key_here
   AIRTABLE_BASE_ID=your_base_id_here
   ```

### 5. Test the Setup
1. Deploy your site
2. Submit an email on the landing page
3. Check your Airtable base - you should see the email appear!
4. Check the admin dashboard - it should show the email count

## 📊 Using Airtable

### View Emails
- Open your Airtable base
- All emails will appear in the "Emails" table
- You can sort, filter, and search emails

### Export Data
- Select all records
- Click "Export" → "CSV"
- Download your email list

### Manage Emails
- Delete unwanted emails
- Add notes or tags
- Create views for different purposes

## 🔒 Security Notes
- Keep your API key private
- The API key has access to your entire base
- Consider using a separate base for production

## 🚀 Alternative Databases
If you prefer other options:
- **Supabase** (PostgreSQL) - More powerful, still free
- **Firebase** (NoSQL) - Google's solution
- **MongoDB Atlas** - Popular NoSQL database
- **PlanetScale** (MySQL) - Serverless MySQL

## 📞 Support
If you need help:
1. Check Airtable's API documentation
2. Verify your environment variables are set
3. Check the browser console for errors
4. Test the API endpoints directly

## 🎯 Next Steps
Once Airtable is configured:
1. Test email collection from different devices
2. Set up email automation (Mailchimp, ConvertKit, etc.)
3. Configure N8N workflows
4. Add analytics tracking
