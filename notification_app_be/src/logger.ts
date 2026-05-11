import axios from "axios";

const LOG_API =
  "http://4.224.186.213/evaluation-service/logs";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJlMjNjc2V1MTgwMkBiZW5uZXR0LmVkdS5pbiIsImV4cCI6MTc3ODQ4MzUzOSwiaWF0IjoxNzc4NDgyNjM5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNjg2NDBiYjAtMjlhYy00NjM5LWE3NzYtZjI5MDM2Y2VjNGZjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic3VtaWxlIiwic3ViIjoiNjYxYWMxNjktYTRkMC00MzE4LTlmYzAtMGQ2NGM1YmQ4YjZmIn0sImVtYWlsIjoiZTIzY3NldTE4MDJAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoic3VtaWxlIiwicm9sbE5vIjoiZTIzY3NldTE4MDIiLCJhY2Nlc3NDb2RlIjoiVGZEeGdyIiwiY2xpZW50SUQiOiI2NjFhYzE2OS1hNGQwLTQzMTgtOWZjMC0wZDY0YzViZDhiNmYiLCJjbGllbnRTZWNyZXQiOiJ3VGR3Y2plbUV0U3hoVnJTIn0._TdlNexF_DHyWxZzSZCeea-5useUFqs2RFR8-aFehaw";

export async function Log(
  stack:
    | "backend"
    | "frontend",

  level:
    | "debug"
    | "info"
    | "warn"
    | "error"
    | "fatal",

  pkg:
    | "cache"
    | "controller"
    | "cron_job"
    | "db"
    | "domain"
    | "handler"
    | "repository"
    | "route"
    | "service",

  message: string
) {
  try {
    await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization:
            `Bearer ${TOKEN}`,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "Logging failed"
    );

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