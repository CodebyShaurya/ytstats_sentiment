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

    const data = await response.json();

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
