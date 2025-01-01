import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function getAnalyticsData() {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
      ],
    });

    return {
      activeUsers: parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0'),
      pageViews: parseInt(response.rows?.[0]?.metricValues?.[1]?.value || '0'),
      sessions: parseInt(response.rows?.[0]?.metricValues?.[2]?.value || '0'),
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
} 