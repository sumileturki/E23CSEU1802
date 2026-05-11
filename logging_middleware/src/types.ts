export type Stack = "backend" | "frontend";

export type Level =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export type BackendPackage =
  |"cache"
  |"controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service"
  | "auth"
  | "config"
  | "middleware"
  | "utils";