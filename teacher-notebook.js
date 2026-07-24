(() => {
  "use strict";

  const root = document.querySelector("[data-notebook-app]");
  const lock = document.querySelector("[data-notebook-lock]");
  const book = document.querySelector("[data-notebook-book]");
  const backButton = document.querySelector("[data-notebook-back]");
  const views = [...document.querySelectorAll("[data-view]")];
  const params = new URLSearchParams(window.location.search);
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

  const previewTeachers = {
    tsuneishi: { id: "tsuneishi", name: "常石 隆志 六段" },
    yuki: { id: "yuki", name: "結城 聡 九段" },
  };

  const previewRecords = [
    { id: "g-001", teacherId: "tsuneishi", participantId: "p-yamada", participantName: "山田太郎", consentToTeacher: true, date: "2026-09-02", rank: "5級", handicap: "3子局", venue: "囲碁サロン湘南" },
    { id: "g-002", teacherId: "tsuneishi", participantId: "p-sato", participantName: "佐藤花子", consentToTeacher: true, date: "2026-09-02", rank: "8級", handicap: "5子局", venue: "囲碁サロン湘南" },
    { id: "g-003", teacherId: "tsuneishi", participantId: "p-private", participantName: "表示しない名前", consentToTeacher: false, date: "2026-09-02", rank: "", handicap: "", venue: "囲碁サロン湘南" },
    { id: "g-004", teacherId: "tsuneishi", participantId: "p-yamada", participantName: "山田太郎", consentToTeacher: true, date: "2026-08-30", rank: "6級", handicap: "4子局", venue: "囲碁サロン湘南" },
    { id: "g-005", teacherId: "yuki", participantId: "p-yamada", participantName: "山田太郎", consentToTeacher: true, date: "2026-09-02", rank: "5級", handicap: "2子局", venue: "囲碁サロン湘南" },
  ];

  // Production must inject this object only after server-side authentication.
  // Its getRecords() implementation must also enforce teacherId on the server.
  const productionSessionWasProvided = hasOwn(window, "SUIYOUKAI_TEACHER_SESSION");
  const productionSession = window.SUIYOUKAI_TEACHER_SESSION;
  const validProductionSession = productionSession
    && typeof productionSession === "object"
    && typeof productionSession.teacher?.id === "string"
    && productionSession.teacher.id.trim() !== ""
    && typeof productionSession.teacher?.name === "string"
    && productionSession.teacher.name.trim() !== ""
    && typeof productionSession.getRecords === "function";
  const previewConfig = window.SUIYOUKAI_TEACHER_NOTEBOOK_PREVIEW;
  const previewRequested = params.get("preview") === "1";
  const hostname = window.location.hostname;
  const isPrivateLanHostname = /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  const isLocalPreviewEnvironment = window.location.protocol === "file:"
    || hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1"
    || isPrivateLanHostname;
  const previewAllowed = !productionSessionWasProvided
    && previewConfig?.enabled === true
    && previewRequested
    && isLocalPreviewEnvironment;
  const previewTeacher = previewTeachers[params.get("teacher") || "tsuneishi"];
  const session = validProductionSession
    ? productionSession
    : previewAllowed && previewTeacher
      ? { teacher: previewTeacher, getRecords: async () => previewRecords }
      : null;
  const isPreviewSession = Boolean(session && session !== productionSession);

  if (!root || !lock || !book || !session) {
    if (lock) lock.hidden = false;
    if (book) book.hidden = true;
    return;
  }

  if (isPreviewSession) {
    const ribbon = document.createElement("span");
    ribbon.className = "preview-ribbon";
    ribbon.textContent = "見本データ";
    document.body.append(ribbon);
  }

  const state = { teacher: session.teacher, records: [], view: "cover", participantId: "", aboutReturnView: "cover" };
  const q = (selector) => document.querySelector(selector);
  const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  const safeText = (value) => String(value ?? "").trim();
  const meetingLabel = (count) => count <= 1 ? "初対局" : `${count}回目の対局`;

  const scopedRecords = (records) => records
    .filter((record) => record && record.teacherId === state.teacher.id)
    .map((record) => ({
      id: safeText(record.id),
      teacherId: state.teacher.id,
      participantId: safeText(record.participantId),
      participantName: record.consentToTeacher === true ? safeText(record.participantName).slice(0, 40) : "",
      consentToTeacher: record.consentToTeacher === true,
      date: /^\d{4}-\d{2}-\d{2}$/.test(record.date) ? record.date : "",
      rank: record.consentToTeacher === true ? safeText(record.rank).slice(0, 20) : "",
      handicap: record.consentToTeacher === true ? safeText(record.handicap).slice(0, 30) : "",
      venue: record.consentToTeacher === true ? safeText(record.venue).slice(0, 40) : "",
    }))
    .filter((record) => record.id && record.date)
    .sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));

  const participantRecords = (participantId) => state.records
    .filter((record) => record.consentToTeacher && record.participantId === participantId)
    .sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));

  const renderCover = () => {
    q("[data-teacher-name]").textContent = state.teacher.name;
    const today = state.records[0]?.date;
    const todayRecords = today ? state.records.filter((record) => record.date === today) : [];
    q("[data-cover-note]").textContent = todayRecords.length === 0
      ? "次の一局が、ここにそっと残ります。"
      : "今日もおつかれさまでした。一局一局のご縁が残っています。";
  };

  const renderToday = () => {
    const today = state.records[0]?.date || new Date().toISOString().slice(0, 10);
    const records = state.records
      .filter((record) => record.date === today)
      .sort((a, b) => Number(b.consentToTeacher) - Number(a.consentToTeacher));
    q("[data-today-date]").textContent = formatDate(today);
    q("[data-today-count]").textContent = records.length ? `今日のご縁　${records.length}名` : "今日の記録はまだありません";
    const list = q("[data-today-list]");
    list.textContent = "";
    if (records.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = "対局の記録が届くと、ここに今日のご縁が並びます。";
      list.append(empty);
      return;
    }

    for (const record of records) {
      const allMeetings = record.consentToTeacher ? participantRecords(record.participantId) : [];
      const currentMeetingIndex = allMeetings.findIndex((meeting) => meeting.id === record.id);
      const previousMeeting = currentMeetingIndex >= 0 ? allMeetings[currentMeetingIndex + 1] : null;
      const button = document.createElement("button");
      const mark = document.createElement("span");
      const copy = document.createElement("span");
      const name = document.createElement("strong");
      const meta = document.createElement("span");
      const detail = document.createElement("small");
      const arrow = document.createElement("span");
      button.type = "button";
      button.className = `encounter-card${record.consentToTeacher ? "" : " is-anonymous"}`;
      mark.className = "encounter-mark";
      copy.className = "encounter-copy";
      arrow.className = "encounter-arrow";
      mark.textContent = record.consentToTeacher ? "縁" : "○";
      name.textContent = record.consentToTeacher ? `${record.participantName}さん` : "匿名のご縁";
      meta.textContent = record.consentToTeacher
        ? `${meetingLabel(allMeetings.length)}${previousMeeting ? `・前回 ${formatDate(previousMeeting.date)}` : ""}`
        : "";
      detail.textContent = record.consentToTeacher ? [record.rank, record.handicap].filter(Boolean).join("・") : "";
      arrow.textContent = record.consentToTeacher ? "›" : "";
      copy.append(name, meta, detail);
      button.append(mark, copy, arrow);
      if (record.consentToTeacher) button.addEventListener("click", () => showHistory(record.participantId));
      else button.disabled = true;
      list.append(button);
    }
  };

  const renderHistory = (participantId) => {
    const records = participantRecords(participantId);
    if (!records.length) return showView("today");
    const current = records[0];
    const historyHeading = q("[data-history-name]");
    const personLine = document.createElement("span");
    const titleLine = document.createElement("span");
    historyHeading.className = "history-person-heading";
    historyHeading.textContent = "";
    personLine.textContent = `${current.participantName}さんとの`;
    titleLine.textContent = "ご縁";
    historyHeading.append(personLine, titleLine);
    q("[data-history-count]").textContent = meetingLabel(records.length);
    q("[data-history-callout]").textContent = records.length > 1
      ? `前回も${current.venue || "水曜会"}で対局しています。今回で${records.length}回目です。`
      : "今回が初めての対局です。次の再会につながる一局として残ります。";
    const list = q("[data-history-list]");
    list.textContent = "";
    records.forEach((record, index) => {
      const card = document.createElement("article");
      const header = document.createElement("header");
      const title = document.createElement("h2");
      const time = document.createElement("time");
      const details = document.createElement("dl");
      title.textContent = index === 0 ? "今回の一局" : index === 1 ? "前回の一局" : `${records.length - index}回目の一局`;
      time.dateTime = record.date;
      time.textContent = formatDate(record.date);
      header.append(title, time);
      const rows = [["棋力", record.rank], ["置き石", record.handicap]];
      rows.filter(([, value]) => value).forEach(([label, value]) => {
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = label;
        dd.textContent = value;
        details.append(dt, dd);
      });
      card.className = "history-card";
      card.append(header, details);
      list.append(card);
    });
  };

  const renderReunion = (participantId) => {
    const records = participantRecords(participantId);
    if (records.length < 2) return showHistory(participantId);
    const current = records[0];
    const previous = records[1];
    q("[data-reunion-title]").textContent = `${current.participantName}さんと再会です`;
    q("[data-reunion-copy]").textContent = `前回も${previous.venue || "水曜会"}で対局しています`;
    q("[data-reunion-count]").textContent = `今回で${records.length}回目です`;
    const note = q("[data-reunion-previous]");
    note.textContent = "";
    const title = document.createElement("strong");
    const rank = document.createElement("span");
    const handicap = document.createElement("span");
    title.textContent = `前回：${formatDate(previous.date)}`;
    rank.textContent = previous.rank ? `棋力：${previous.rank}` : "棋力の記録なし";
    handicap.textContent = previous.handicap || "置き石の記録なし";
    note.append(title, rank, handicap);
  };

  const showView = (name) => {
    state.view = name;
    views.forEach((view) => { view.hidden = view.dataset.view !== name; });
    backButton.hidden = name === "cover";
    q("[data-open-about]").hidden = name === "about";
    if (name === "cover") renderCover();
    if (name === "today") renderToday();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showHistory = (participantId) => {
    state.participantId = participantId;
    renderHistory(participantId);
    showView("history");
  };

  q("[data-open-today]").addEventListener("click", () => showView("today"));
  q("[data-reunion-today]").addEventListener("click", () => showView("today"));
  q("[data-open-about]").addEventListener("click", () => {
    state.aboutReturnView = state.view === "about" ? "cover" : state.view;
    showView("about");
  });
  backButton.addEventListener("click", () => {
    if (state.view === "about") return showView(state.aboutReturnView);
    if (state.view === "history") return showView("today");
    if (state.view === "reunion") return showHistory(state.participantId);
    showView("cover");
  });

  Promise.resolve(session.getRecords({ teacherId: state.teacher.id }))
    .then((records) => {
      state.records = scopedRecords(Array.isArray(records) ? records : []);
      lock.hidden = true;
      book.hidden = false;
      const reunionParticipantId = safeText(params.get("participant"));
      if (reunionParticipantId && participantRecords(reunionParticipantId).length > 1) {
        state.participantId = reunionParticipantId;
        renderReunion(reunionParticipantId);
        showView("reunion");
      } else {
        showView("cover");
      }
    })
    .catch(() => {
      book.hidden = true;
      lock.hidden = false;
      lock.querySelector(".lock-note").textContent = "記録を安全に読み込めませんでした。先生専用の入口から、もう一度開いてください。";
    });
})();
