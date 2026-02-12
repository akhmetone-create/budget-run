// Fallback excuses since we removed the API dependency to fix build errors
const EXCUSES = [
  "We're pivoting to an organic-only growth strategy.",
  "It's not a loss, it's a brand awareness investment.",
  "The ROI is intangible but spiritual.",
  "We optimized for engagement, not revenue.",
  "It's a strategic burn to capture market share.",
  "The algorithm ate my homework.",
  "We are A/B testing bankruptcy.",
  "Let's circle back on the budget variance next quarter.",
  "It's a loss leader for a product we haven't invented yet.",
  "The synergy wasn't synergistic enough.",
  "We invested in 'thought leadership' instead of profits.",
  "It's a paradigm shift, you wouldn't understand.",
  "Disrupting the market requires breaking the bank."
];

export const generateExcuse = async (score: number): Promise<string> => {
  // Simulate a short network delay for realism (like it's "thinking")
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const randomIndex = Math.floor(Math.random() * EXCUSES.length);
  return EXCUSES[randomIndex];
};