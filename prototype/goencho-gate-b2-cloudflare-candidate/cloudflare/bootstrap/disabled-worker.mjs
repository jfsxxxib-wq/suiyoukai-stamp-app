const DISABLED_BODY = '{"ok":false,"code":"CANARY_DISABLED"}';

export default {
  async fetch() {
    return new Response(DISABLED_BODY, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  },
};
