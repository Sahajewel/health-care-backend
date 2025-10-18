export const extractJsonFromMessage = (message: any) => {
  try {
    const content = message?.content?.trim() || "";

    if (!content) {
      console.error("Empty content received");
      return [];
    }

    // 1. Try to extract JSON code block (```json ... ```)
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      const jsonText = jsonBlockMatch[1].trim();
      try {
        return JSON.parse(jsonText);
      } catch (error) {
        console.error("Error parsing JSON block:", error);
        // Continue to other methods
      }
    }

    // 2. Try to extract any JSON-like structure more carefully
    const jsonLikeMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonLikeMatch) {
      try {
        // Clean the JSON string
        let jsonText = jsonLikeMatch[1].trim();

        // Remove trailing commas (common issue with AI-generated JSON)
        jsonText = jsonText.replace(/,\s*([\]}])/g, "$1");

        // Fix unescaped quotes
        jsonText = jsonText.replace(/([{,]\s*)(\w+):/g, '$1"$2":');

        return JSON.parse(jsonText);
      } catch (error) {
        console.error("Error parsing JSON-like content:", error);
        console.log(
          "Problematic JSON text:",
          jsonLikeMatch[1].substring(0, 500)
        );
      }
    }

    // 3. If no valid JSON found, log the content for debugging
    console.log(
      "No valid JSON found in content. Content preview:",
      content.substring(0, 500)
    );
    return [];
  } catch (error) {
    console.error("Unexpected error in extractJsonFromMessage:", error);
    return [];
  }
};
