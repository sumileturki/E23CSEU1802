export interface Notification {
  id: string;
  studentId: number;
  type: "Event" | "Result" | "Placement";
  message: string;
  isRead: boolean;
  createdAt: string;
}