// Brand Ambassador Dog Mascot Emotions
// Visual Brand Ambassadors representing the audience sentiment without pet gimmicks in analysis copy

export const DOG_MASCOTS = {
  sad: {
    type: "sad",
    src: "/Sad.png",
    fallbackUrl:
      "https://png.pngtree.com/png-clipart/20250314/original/pngtree-sad-dog-with-tilted-head-png-image_19211792.png",
    name: "Barnaby",
    title: "Critical & Disappointed",
    badge: "Displeased Audience",
    themeColor: "#dc2626",
    bgColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.25)",
    watcherFeedback:
      "Viewers expressed significant dissatisfaction, frustration, or unmet promises. Consider checking the detailed feedback before spending time on this video.",
    creatorFeedback:
      "Audience reaction indicates substantial friction or disappointment. Review the content gaps and comment critiques below to pinpoint issues.",
    learnerFeedback:
      "Learners noted confusing explanations, missing prerequisites, or unaddressed gaps. Review the limitations and lacking topics before relying on this for study.",
  },
  neutral: {
    type: "neutral",
    src: "/Neutral.png",
    fallbackUrl:
      "https://static.vecteezy.com/system/resources/previews/068/065/849/non_2x/a-golden-retriever-sitting-with-a-neutral-expression-on-a-plain-color-isolated-background-studio-shot-on-transparent-background-png.png",
    name: "Sammy",
    title: "Even-Tempered & Balanced",
    badge: "Mixed / Moderate Audience",
    themeColor: "#d97706",
    bgColor: "rgba(217, 119, 6, 0.08)",
    borderColor: "rgba(217, 119, 6, 0.25)",
    watcherFeedback:
      "Audience opinion is balanced or divided. The video delivers moderate value with some topics well-received and others needing improvement.",
    creatorFeedback:
      "Your audience is engaged but split. Some sections resonated well, while others could benefit from clearer explanations or tighter editing.",
    learnerFeedback:
      "Good foundational concepts covered, though some nuance or advanced topics may require supplemental resources or companion videos.",
  },
  happy: {
    type: "happy",
    src: "/Happy.png",
    fallbackUrl:
      "https://static.vecteezy.com/system/resources/previews/018/871/732/non_2x/cute-and-happy-dog-png.png",
    name: "Buddy",
    title: "Delighted & Highly Impressed",
    badge: "Resoundingly Positive",
    themeColor: "#16a34a",
    bgColor: "rgba(22, 163, 74, 0.08)",
    borderColor: "rgba(22, 163, 74, 0.25)",
    watcherFeedback:
      "Viewers love this video! The audience praised the clarity, delivery, and overall quality. Highly recommended watch.",
    creatorFeedback:
      "Outstanding audience reception! Comments show high satisfaction, strong value retention, and genuine appreciation for your content.",
    learnerFeedback:
      "Exceptional educational resource! Learners praise the clear walkthrough, structured takeaways, and comprehensive explanations.",
  },
};

/**
 * Determine the mascot emotional state based on overall rating and sentiment
 * @param {number} overallRating - Rating from 0 to 10
 * @param {string} sentiment - 'positive', 'neutral', 'negative', 'mixed'
 */
export function getDogMascot(overallRating, sentiment) {
  const ratingNum = typeof overallRating === "number" ? overallRating : parseFloat(overallRating);
  const normalizedSentiment = (sentiment || "").toLowerCase();

  // If rating is explicitly valid
  if (!isNaN(ratingNum)) {
    if (ratingNum >= 7.0) {
      return DOG_MASCOTS.happy;
    }
    if (ratingNum >= 4.8) {
      return DOG_MASCOTS.neutral;
    }
    return DOG_MASCOTS.sad;
  }

  // Fallback to sentiment string
  if (normalizedSentiment === "positive") {
    return DOG_MASCOTS.happy;
  }
  if (normalizedSentiment === "negative") {
    return DOG_MASCOTS.sad;
  }
  return DOG_MASCOTS.neutral;
}
