const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    // Never expose the full API key
    if (obj.geminiApiKey) obj.geminiApiKey = obj.geminiApiKey.substring(0, 8) + '••••••••';
    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true
      }
    }));
    await Settings.bulkWrite(ops);

    // If updating Gemini key, also update process.env
    if (updates.geminiApiKey) {
      process.env.GEMINI_API_KEY = updates.geminiApiKey;
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
