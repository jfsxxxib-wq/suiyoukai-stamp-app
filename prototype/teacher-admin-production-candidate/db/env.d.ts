declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    SUIYOUKAI_LOCAL_TEST_MODE?: string;
    SUIYOUKAI_ADMIN_USER_IDS?: string;
    SUIYOUKAI_TEACHER_USER_MAP?: string;
  }
}
