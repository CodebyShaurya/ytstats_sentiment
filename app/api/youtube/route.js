export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const yturl = searchParams.get("yturl");
  const accuracy = searchParams.get("accuracy") || "low";

  if (!yturl) {
    return new Response(JSON.stringify({ error: "Missing yturl parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Call backend directly using 127.0.0.1 to avoid Windows IPv6 localhost DNS issues
    const backendUrl = `http://127.0.0.1:5000/api/youtube?yturl=${encodeURIComponent(
      yturl
    )}&accuracy=${encodeURIComponent(accuracy)}`;

    // Allow long-running analysis (up to 2 minutes for comment scraping and LLM processing)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(backendUrl, {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      data = parseBackendTextOutput(rawText);
    }

    // Ensure data.analysis exists if top-level properties are directly at root
    if (data && !data.analysis && (data.overall_rating !== undefined || data.sentiment)) {
      data = {
        analysis: {
          overall_rating: data.overall_rating,
          rating_explanation: data.rating_explanation,
          sentiment: data.sentiment,
          title_match: data.title_match,
          description_match: data.description_match,
          engagement_assessment: data.engagement_assessment,
          general_consensus: data.general_consensus,
          limitations: data.limitations,
          lacking_topics: data.lacking_topics || [],
          comments_analyzed: data.comments_analyzed,
        },
        related_videos: data.related_videos || [],
        lacking_topic_videos: data.lacking_topic_videos || [],
      };
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API route proxy error:", error);
    return new Response(
      JSON.stringify({
        error: error.name === "AbortError" ? "Request timed out" : error.message || "Failed to fetch from backend",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// ===== Helper: Parse Backend Raw Text Output =====
function parseBackendTextOutput(rawText) {
  if (!rawText) return null;

  let analysis = null;
  const related_videos = [];
  const lacking_topic_videos = [];

  // 1. Extract JSON block from GEMINI ANALYSIS section
  const jsonMatch = rawText.match(/\{[\s\S]*?\n\}/);
  if (jsonMatch) {
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON analysis block:", e);
    }
  }

  // 2. Extract RELATED VIDEOS section
  const relatedSectionMatch = rawText.match(/RELATED VIDEOS[\s\S]*?(?===+|$)/i);
  if (relatedSectionMatch) {
    const relatedText = relatedSectionMatch[0];
    const itemRegex = /\d+\.\s+([^\n\r]+)[\r\n]+\s*Channel:\s*([^\n\r]+)[\r\n]+\s*Link:\s*([^\n\r\s]+)/gi;
    let match;
    while ((match = itemRegex.exec(relatedText)) !== null) {
      related_videos.push({
        title: match[1].trim(),
        channel: match[2].trim(),
        url: match[3].trim(),
      });
    }
  }

  // 3. Extract VIDEOS FOR LACKING TOPICS section
  const lackingSectionMatch = rawText.match(/VIDEOS FOR LACKING TOPICS[\s\S]*?(?===+|$)/i);
  if (lackingSectionMatch) {
    const lackingText = lackingSectionMatch[0];
    const topicBlockRegex = /Topic:\s*([^\n\r]+)[\r\n]+\s*Reason:\s*([^\n\r]+)[\r\n]+\s*Suggestion:\s*([^\n\r]+)[\r\n]+\s*Link:\s*([^\n\r\s]+)/gi;
    let match;
    while ((match = topicBlockRegex.exec(lackingText)) !== null) {
      lacking_topic_videos.push({
        topic: match[1].trim(),
        reason: match[2].trim(),
        video: {
          title: match[3].trim(),
          url: match[4].trim(),
        },
      });
    }
  }

  return {
    analysis,
    related_videos,
    lacking_topic_videos,
  };
}

