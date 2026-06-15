const mongoose = require('mongoose');

const audienceDiscoverySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    audienceSize: { type: Number, default: 0 },
    recommendation: { type: String, default: '' },
    aiSuggestion: {
      campaignGoal: { type: String, default: '' },
      bestChannel: { type: String, default: '' },
      marketingStrategy: { type: String, default: '' },
      personalizedMessage: { type: String, default: '' }
    },
    ruleKey: { type: String, required: true },
    customerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('AudienceDiscovery', audienceDiscoverySchema);
