const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

module.exports = {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  isConfigured: () => {
    return !!GEMINI_API_KEY;
  }
};
