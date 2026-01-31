import { apiFetch } from "@/lib/api";

export const getHabits = () => apiFetch("/habits");
export const getMonthLogs = (y: number, m: number) =>
  apiFetch(`/habits/logs?year=${y}&month=${m}`);

export const toggleHabit = (id: number, date: string) =>
  apiFetch(`/habits/${id}/toggle`, {
    method: "POST",
    body: JSON.stringify({ date }),
  });
