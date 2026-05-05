const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

const getPayload = (err, req) => {
  const timestamp = new Date().toISOString();
  const route = `${req.method} ${req.originalUrl}`;
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const stack = err.stack || 'No stack trace available';

  return {
    text: `*Server Error Detected*
*Timestamp:* ${timestamp}
*Route:* ${route}
*Status:* ${statusCode}
*Message:* ${message}
*Stack Trace:*
">
${stack}`
  };
};

export const sendSlackError = async (err, req) => {
  if (!slackWebhookUrl) {
    return;
  }

  if (!req || !req.originalUrl || !req.method) {
    console.warn('[SLACK] Missing request context, skipping Slack notification');
    return;
  }

  const payload = getPayload(err, req);

  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

export const logError = async (err, req) => {
  if (err.statusCode >= 500) {
    try {
      await sendSlackError(err, req);
    } catch (error) {
      console.error('[SLACK] Unable to send error notification:', error);
    }
  }
};
