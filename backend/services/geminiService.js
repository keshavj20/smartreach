const { GoogleGenerativeAI } = require('@google/generative-ai');
const Settings = require('../models/Settings');

async function getApiKey() {
  try {
    const setting = await Settings.findOne({ key: 'geminiApiKey' });
    if (setting?.value && setting.value.length > 10) return setting.value;
  } catch {}
  return process.env.GEMINI_API_KEY;
}

exports.generatePersonalizedOffer = async ({ customer, orders, segmentTitle }) => {
  const apiKey = await getApiKey();
  const topCategories = getTopCategories(orders);
  const avgOrder = orders.length ? Math.round(orders.reduce((s, o) => s + o.amount, 0) / orders.length) : 0;
  const daysSincePurchase = customer.lastPurchaseDate
    ? Math.floor((Date.now() - new Date(customer.lastPurchaseDate)) / 86400000)
    : null;
  const profile = { name: customer.name, city: customer.city || 'your city', totalSpent: customer.totalSpent || 0, totalOrders: orders.length, avgOrderValue: avgOrder, topCategories, daysSincePurchase, segment: segmentTitle };

  if (!apiKey || apiKey === 'your_gemini_api_key_here') return getMockOffer(profile);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a smart marketing AI for an Indian e-commerce brand called SmartReach Store.

Customer Profile:
- Name: ${profile.name}
- City: ${profile.city}
- Total Spent: Rs.${profile.totalSpent.toLocaleString('en-IN')}
- Total Orders: ${profile.totalOrders}
- Average Order Value: Rs.${profile.avgOrderValue}
- Favorite Categories: ${topCategories.join(', ') || 'General'}
- Days Since Last Purchase: ${daysSincePurchase !== null ? daysSincePurchase + ' days' : 'Never purchased'}
- Customer Segment: ${segmentTitle}

Generate a highly personalized marketing offer. Use their name, reference their past purchase categories, and create a relevant discount.

Respond ONLY with this exact JSON (no markdown, no backticks):
{
  "subject": "Email subject line, catchy, personalized, max 60 chars",
  "offerCode": "Discount code using their first name e.g. AARAV20",
  "discountPercent": 20,
  "offerMessage": "2-3 sentence personalized plain-text message using name, city, purchase history, offer code, 48hr expiry",
  "htmlBody": "Complete HTML email body with inline styles only. Brand color #5B4CF5. Include: personalized greeting, their top categories, offer code in highlighted box, CTA button. Professional and mobile-friendly."
}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '').trim();
    return { ...JSON.parse(text), customerProfile: profile };
  } catch (err) {
    console.error('Gemini offer error:', err.message);
    return getMockOffer(profile);
  }
};

exports.getAudienceRecommendation = async ({ title, description, audienceSize, recommendation }) => {
  const apiKey = await getApiKey();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return getMockRecommendation(title);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert marketing strategist for a modern Indian e-commerce brand.
Audience: "${title}", ${audienceSize} customers. Description: "${description}". Recommendation: "${recommendation}".
Return JSON only:
{"campaignGoal":"...","bestChannel":"Email/SMS/WhatsApp/Push/In-App with reasoning","marketingStrategy":"...","personalizedMessage":"..."}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    return getMockRecommendation(title);
  }
};

function getTopCategories(orders) {
  const freq = {};
  orders.forEach(o => { freq[o.category] = (freq[o.category] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
}

function getMockOffer({ name, city, totalSpent, totalOrders, topCategories, daysSincePurchase, avgOrderValue }) {
  const firstName = name.split(' ')[0];
  const discount = totalSpent > 10000 ? 30 : totalSpent > 5000 ? 25 : 20;
  const code = firstName.substring(0, 5).toUpperCase() + discount;
  const cats = topCategories.length ? topCategories.join(' & ') : 'our collections';
  return {
    subject: `${firstName}, your exclusive ${discount}% off is waiting! 🎁`,
    offerCode: code,
    discountPercent: discount,
    offerMessage: `Hi ${firstName}! Based on your love for ${cats}, we have an exclusive deal for you in ${city}. Use code ${code} for ${discount}% off — valid 48 hours only!`,
    htmlBody: buildHtml({ firstName, name, city, totalSpent, topCategories, discount, code }),
    customerProfile: { name, city, totalSpent, totalOrders, topCategories, daysSincePurchase, avgOrderValue }
  };
}

function buildHtml({ firstName, name, city, totalSpent, topCategories, discount, code }) {
  const cats = topCategories.length ? topCategories.join(', ') : 'our bestsellers';
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB"><div style="background:linear-gradient(135deg,#5B4CF5,#9B59FF);padding:32px 24px;text-align:center"><h1 style="color:#fff;margin:0;font-size:26px;font-weight:800">SmartReach Store</h1><p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px">Your personal AI-powered offer</p></div><div style="padding:28px 24px"><h2 style="color:#1A1D2E;font-size:20px;margin:0 0 12px">Hi ${firstName}! 👋</h2><p style="color:#4B5563;line-height:1.7;margin:0 0 16px">We noticed you love <strong>${cats}</strong> and we have curated something special just for you in <strong>${city}</strong>.</p><p style="color:#4B5563;line-height:1.7;margin:0 0 24px">As a valued customer who has spent <strong>Rs.${totalSpent.toLocaleString('en-IN')}</strong> with us, you deserve this exclusive reward.</p><div style="background:rgba(91,76,245,.06);border:2px dashed #5B4CF5;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px"><p style="color:#6B7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Your Exclusive Offer Code</p><p style="color:#5B4CF5;font-size:36px;font-weight:900;margin:0 0 8px;letter-spacing:.1em">${code}</p><p style="color:#9B59FF;font-size:16px;font-weight:700;margin:0">${discount}% OFF your next order</p><p style="color:#9CA3AF;font-size:12px;margin:8px 0 0">Valid for 48 hours only</p></div><div style="text-align:center;margin:0 0 24px"><a href="#" style="background:linear-gradient(135deg,#5B4CF5,#9B59FF);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:16px;display:inline-block">Shop Now</a></div><p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0">This offer is exclusively for ${name} and expires in 48 hours.</p></div><div style="background:#F9FAFB;padding:16px 24px;text-align:center;border-top:1px solid #E5E7EB"><p style="color:#9CA3AF;font-size:11px;margin:0">SmartReach Store — AI-Powered Marketing</p></div></div>`;
}

function getMockRecommendation(title) {
  const m = {
    'High Value Inactive Customers': { campaignGoal: 'Re-activate high-spending customers, targeting 25% re-engagement in 2 weeks.', bestChannel: 'Email', marketingStrategy: 'Launch a "We Miss You" sequence with VIP rewards and exclusive comeback discount.', personalizedMessage: 'Use VIPBACK20 for 20% off your next order — valid 72 hours.' },
    'Frequent Buyers': { campaignGoal: 'Increase average order value by 15% and build brand advocates.', bestChannel: 'WhatsApp', marketingStrategy: 'VIP loyalty program with early access and double points this weekend.', personalizedMessage: 'You are in our top 1%! Early access to new collection + double points.' },
    'New Customers': { campaignGoal: 'Drive second purchase within 14 days.', bestChannel: 'Email', marketingStrategy: 'Welcome series with brand story, bestsellers, and second-purchase discount.', personalizedMessage: 'Use WELCOME15 for 15% off your second order — expires in 7 days.' },
    'Cross-Sell Opportunities': { campaignGoal: 'Increase basket size, targeting 30% cross-sell conversion.', bestChannel: 'Push', marketingStrategy: '"Complete the Look" campaign with bundle discounts.', personalizedMessage: 'Complete your look and save 20% on bundles today.' },
    'Churn Risk Customers': { campaignGoal: 'Prevent customer loss with urgent re-engagement offers.', bestChannel: 'SMS', marketingStrategy: '2-message urgent sequence with escalating incentives.', personalizedMessage: 'Use COMEBACK30 for 30% off — expires in 48 hours.' }
  };
  return m[title] || { campaignGoal: 'Drive engagement.', bestChannel: 'Email', marketingStrategy: 'Targeted personalized campaign.', personalizedMessage: 'Special offer just for you!' };
}
