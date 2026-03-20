const mongoose = require('mongoose')

const AnalysisSchema = new mongoose.Schema(
  {
    analysisId: { type: String, unique: true, index: true },
    createdAt: { type: Date, default: () => new Date() },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { minimize: false }
)

module.exports = mongoose.model('Analysis', AnalysisSchema)

