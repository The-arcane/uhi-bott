"use server";

export async function sendMessageAction(message: string): Promise<string> {
  try {
    const response = await fetch("https://raunss.app.n8n.cloud/webhook/6b8358eb-b8ce-4e88-9f5d-cbac3932002f", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from webhook:", errorText);
      return `I'm sorry, the server responded with an error: ${response.status}. Please check your webhook configuration.`;
    }
    
    const responseText = await response.text();

    try {
      // Assuming the webhook might return a JSON object e.g. { "reply": "..." }
      const responseJson = JSON.parse(responseText);
      // n8n often returns an array, so we handle that case.
      const data = Array.isArray(responseJson) ? responseJson[0] : responseJson;
      // Look for a reply in common fields, otherwise stringify the object.
      return data.reply || data.message || data.text || JSON.stringify(data);
    } catch (e) {
      // If it's not a valid JSON, it might be a plain text response
      return responseText;
    }

  } catch (error) {
    console.error("Error in sendMessageAction:", error);
    return "I'm sorry, but I encountered an issue while processing your request. Please try again later.";
  }
}
