import { apiRequest } from "./api";
export function getOverview() { return apiRequest("/api/analytics/overview"); }
export function getWeeklyReport() { return apiRequest("/api/analytics/weekly-report"); }
