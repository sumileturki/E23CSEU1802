import axios from "axios";

const LOG_API =
  "http://4.224.186.213/evaluation-service/logs";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJlMjNjc2V1MTgwMkBiZW5uZXR0LmVkdS5pbiIsImV4cCI6MTc3ODQ4MTgzNywiaWF0IjoxNzc4NDgwOTM3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMTMwZWQ0ZWItNDUwMS00YWM1LTkyOWUtMmMyOTA2NDY5NjFlIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic3VtaWxlIiwic3ViIjoiNjYxYWMxNjktYTRkMC00MzE4LTlmYzAtMGQ2NGM1YmQ4YjZmIn0sImVtYWlsIjoiZTIzY3NldTE4MDJAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoic3VtaWxlIiwicm9sbE5vIjoiZTIzY3NldTE4MDIiLCJhY2Nlc3NDb2RlIjoiVGZEeGdyIiwiY2xpZW50SUQiOiI2NjFhYzE2OS1hNGQwLTQzMTgtOWZjMC0wZDY0YzViZDhiNmYiLCJjbGllbnRTZWNyZXQiOiJ3VGR3Y2plbUV0U3hoVnJTIn0.FQba-q45sBIgIgtlWVKRkyoemX8yhgSZULMnH7oVYMQ";

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
) {
  try {

    const response = await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type":
            "application/json",
        },
      }
    );

   
  } catch (error: any) {
    console.error("Logging failed");

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Response:",
      error.response?.data
    );

    console.error(
      "Status:",
      error.response?.status
    );
  }
}