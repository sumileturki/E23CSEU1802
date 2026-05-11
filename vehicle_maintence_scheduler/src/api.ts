
import axios from "axios";

const BASE_URL =
  "http://4.224.186.213/evaluation-service";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJlMjNjc2V1MTgwMkBiZW5uZXR0LmVkdS5pbiIsImV4cCI6MTc3ODQ4MTgzNywiaWF0IjoxNzc4NDgwOTM3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMTMwZWQ0ZWItNDUwMS00YWM1LTkyOWUtMmMyOTA2NDY5NjFlIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic3VtaWxlIiwic3ViIjoiNjYxYWMxNjktYTRkMC00MzE4LTlmYzAtMGQ2NGM1YmQ4YjZmIn0sImVtYWlsIjoiZTIzY3NldTE4MDJAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoic3VtaWxlIiwicm9sbE5vIjoiZTIzY3NldTE4MDIiLCJhY2Nlc3NDb2RlIjoiVGZEeGdyIiwiY2xpZW50SUQiOiI2NjFhYzE2OS1hNGQwLTQzMTgtOWZjMC0wZDY0YzViZDhiNmYiLCJjbGllbnRTZWNyZXQiOiJ3VGR3Y2plbUV0U3hoVnJTIn0.FQba-q45sBIgIgtlWVKRkyoemX8yhgSZULMnH7oVYMQ";

export async function fetchDepots() {
  const response = await axios.get(
    `${BASE_URL}/depots`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  return response.data.depots;
}


export async function fetchVehicles() {
  const response = await axios.get(
    `${BASE_URL}/vehicles`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  return response.data.vehicles;
}