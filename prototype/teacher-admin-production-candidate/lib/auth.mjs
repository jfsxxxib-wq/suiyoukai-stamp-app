function csvSet(value) {
  return new Set(String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean));
}

function teacherMap(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function resolveActor(headers, config = {}) {
  if (String(config.localTestMode) === '1') {
    const testActor = headers.get('x-suiyoukai-test-actor');
    if (testActor === 'admin') return { ok: true, actor: { role: 'admin', actorId: 'local-test-admin' } };
    if (testActor?.startsWith('teacher:')) {
      const teacherId = testActor.slice('teacher:'.length).trim();
      if (teacherId) return { ok: true, actor: { role: 'teacher', actorId: `local-test-${teacherId}`, teacherId } };
    }
  }

  const actorId = headers.get('oai-authenticated-user-id')?.trim();
  if (!actorId) return { ok: false, status: 401, message: 'ログインを確認できません。' };

  if (csvSet(config.adminUserIds).has(actorId)) {
    return { ok: true, actor: { role: 'admin', actorId } };
  }

  const mappedTeacher = teacherMap(config.teacherUserMap)[actorId];
  if (typeof mappedTeacher === 'string' && mappedTeacher.trim()) {
    return { ok: true, actor: { role: 'teacher', actorId, teacherId: mappedTeacher.trim() } };
  }

  return { ok: false, status: 403, message: 'このページを使う権限がありません。' };
}

export function authConfigFromEnv(env) {
  return {
    localTestMode: env.SUIYOUKAI_LOCAL_TEST_MODE,
    adminUserIds: env.SUIYOUKAI_ADMIN_USER_IDS,
    teacherUserMap: env.SUIYOUKAI_TEACHER_USER_MAP,
  };
}
