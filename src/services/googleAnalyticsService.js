/**
 * Google Analytics Service
 * Fetches real analytics data from Google Analytics API
 */

const { google } = require('googleapis');
const path = require('path');

class GoogleAnalyticsService {
  constructor() {
    this.analytics = null;
    this.propertyId = process.env.GOOGLE_ANALYTICS_ID;
    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      // Path to your service account key file
      const keyFilePath = path.join(__dirname, '../../', process.env.GOOGLE_APPLICATION_CREDENTIALS);
      
      // Create auth client
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
      });

      // Initialize Analytics Data API (GA4)
      this.analytics = google.analyticsdata({
        version: 'v1beta',
        auth: auth
      });

      console.log('✅ Google Analytics service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Analytics:', error.message);
      this.analytics = null;
    }
  }

  async getAnalyticsData() {
    if (!this.analytics || !this.propertyId) {
      console.log('📊 Google Analytics not configured, using mock data');
      return this.getMockData();
    }

    try {
      // Get basic metrics for the last 30 days
      const response = await this.analytics.properties.runReport({
        property: `properties/${this.propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate: '30daysAgo',
              endDate: 'today'
            }
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'pageviews' },
            { name: 'bounceRate' },
            { name: 'aver