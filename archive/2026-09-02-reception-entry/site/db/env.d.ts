declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    SHEET_WEBAPP_URL: string;
    SHEET_WRITE_SECRET: string;
  }
}
