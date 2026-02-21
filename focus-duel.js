window.addEventListener("DOMContentLoaded", () => {
  // Хранилище БД (несколько наборов)
  const LS_DB = "focus_duel_db_v1";
  const LS_STATS = "focus_duel_wordstats_v1";
  const LS_THEME = "focus_duel_theme_v1";
  const LS_TEACHER = "focus_duel_teacher_on_v1";
  const TEACHER_PIN_DEFAULT = "1234";

  const $ = (id) => document.getElementById(id);

  const ui = {
    // top
    btnOpenSetup: $("btnOpenSetup"),
    btnTeacher: $("btnTeacher"),
    btnSetupScroll: $("btnSetupScroll"),
    setupBody: $("setupBody"),
    teacherModal: $("teacherModal"),
    teacherBackdrop: $("teacherBackdrop"),
    btnCloseTeacher: $("btnCloseTeacher"),
    inpTeacherPin: $("inpTeacherPin"),
    btnTeacherOn: $("btnTeacherOn"),
    btnTeacherOff: $("btnTeacherOff"),
    btnEditor: $("btnEditor"),
    btnReset: $("btnReset"),

    // arena
    scoreA: $("scoreA"),
    scoreB: $("scoreB"),
    teamA: $("teamA"),
    teamB: $("teamB"),
    metaA: $("metaA"),
    metaB: $("metaB"),
    msgA: $("msgA"),
    msgB: $("msgB"),
    streakA: $("streakA"),
    streakB: $("streakB"),

    pillMode: $("pillMode"),
    pillLevel: $("pillLevel"),
    pillSet: $("pillSet"),

    qPrompt: $("qPrompt"),
    qHint: $("qHint"),
    btnStartNow: $("btnStartNow"),
    btnOpenSetup2: $("btnOpenSetup2"),
    btnTheme: $("btnTheme"),
    selTopic: $("selTopic"),
    inpRounds: $("inpRounds"),
    edCat: $("edCat"),
    edCat2: $("edCat2"),
    answers: $("answers"),
    status: $("status"),

    duelGrid: $("duelGrid"),
    choicesA: $("choicesA"),
    choicesB: $("choicesB"),

    badgeInfo: $("badgeInfo"),
    roundNum: $("roundNum"),
    leaderText: $("leaderText"),
    turnInfo: $("turnInfo"),

    progressFill: $("progressFill"),
    timerFill: $("timerFill"),
    timeLeft: $("timeLeft"),

    // setup modal
    setupModal: $("setupModal"),
    setupBackdrop: $("setupBackdrop"),
    btnCloseSetup: $("btnCloseSetup"),
    btnConfirmStart: $("btnConfirmStart"),
    btnOnlyConfirm: $("btnOnlyConfirm"),

    selMode: $("selMode"),
    selLevel: $("selLevel"),
    inpTime: $("inpTime"),
    selSpeed: $("selSpeed"),

    // sets
    selSet: $("selSet"),
    inpSetName: $("inpSetName"),
    btnNewSet: $("btnNewSet"),
    btnRenameSet: $("btnRenameSet"),
    btnDeleteSet: $("btnDeleteSet"),

    // quick add (setup)
    edLevel: $("edLevel"),
    edType: $("edType"),
    edMain: $("edMain"),
    edCorrect: $("edCorrect"),
    edHint: $("edHint"),
    edOptions: $("edOptions"),
    wrapOptions: $("wrapOptions"),
    lblMain: $("lblMain"),
    btnAdd: $("btnAdd"),
    btnOpenFullEditor: $("btnOpenFullEditor"),

    // drawer editor
    drawer: $("drawer"),
    btnCloseEditor: $("btnCloseEditor"),
    edList: $("edList"),
    ioBox: $("ioBox"),
    btnExport: $("btnExport"),
    btnImport: $("btnImport"),
    btnImportAdd: $("btnImportAdd"),

    edLevel2: $("edLevel2"),
    edType2: $("edType2"),
    edMain2: $("edMain2"),
    edCorrect2: $("edCorrect2"),
    edHint2: $("edHint2"),
    edOptions2: $("edOptions2"),
    wrapOptions2: $("wrapOptions2"),
    lblMain2: $("lblMain2"),
    btnAdd2: $("btnAdd2"),
    btnClear2: $("btnClear2"),

    // win modal
    winModal: $("winModal"),
    winBackdrop: $("winBackdrop"),
    winTitle: $("winTitle"),
    winSub: $("winSub"),
    btnPlayAgain: $("btnPlayAgain"),
    btnCloseWin: $("btnCloseWin"),
  };

  // ---------- UTIL ----------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

  function safeJSONParse(raw, fallback){
    try{ return JSON.parse(raw); }catch{ return fallback; }
  }

  // ---------- DB (Sets) ----------
  function defaultDB(){
    return {
      activeSetId: "default",
      sets: [{
        id: "default",
        name: "Базовый набор",
        data: structuredClone(window.FD_DEFAULT_SETS),
      }]
    };
  }

  function loadDB(){
    const raw = localStorage.getItem(LS_DB);
    if (!raw) return defaultDB();
    const parsed = safeJSONParse(raw, null);
    if (!parsed || !parsed.sets || !Array.isArray(parsed.sets)) return defaultDB();
    if (!parsed.activeSetId) parsed.activeSetId = parsed.sets[0]?.id || "default";
    return parsed;
  }

  function saveDB(db){
    localStorage.setItem(LS_DB, JSON.stringify(db));
  }

  // ---------- STATS ----------
  function loadStats(){
    const raw = localStorage.getItem(LS_STATS);
    if (!raw) return {};
    return safeJSONParse(raw, {});
  }

  function saveStats(stats){
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
  }

  // ---------- THEME ----------
  function loadTheme(){
    return localStorage.getItem(LS_THEME) || "dark";
  }

  function saveTheme(t){
    localStorage.setItem(LS_THEME, t);
  }

  function applyTheme(t){
    // simple: toggle class on body
    document.body.dataset.theme = t;
  }

  function setTeacherMode(on){
    document.body.classList.toggle("teacher-on", !!on);
    if(on) localStorage.setItem(LS_TEACHER,"1"); else localStorage.removeItem(LS_TEACHER);
  }
  function loadTeacherMode(){
    return localStorage.getItem(LS_TEACHER)==="1";
  }

  function openModal(el){
    if(!el) return;
    el.setAttribute("aria-hidden","false");
    document.body.classList.add("modalOpen");
  }
  function closeModal(el){
    if(!el) return;
    el.setAttribute("aria-hidden","true");
    // if no other open modals
    const anyOpen = [...document.querySelectorAll(".modal")].some(m=>m.getAttribute("aria-hidden")==="false");
    if(!anyOpen) document.body.classList.remove("modalOpen");
  }

  function updateSetupScrollHint(){
    const body = ui.setupBody;
    const card = ui.setupModal?.querySelector?.(".modalCard") || null;
    if(!body || !card) return;
    const scrollable = body.scrollHeight - body.clientHeight > 6;
    card.classList.toggle("is-scrollable", scrollable);
  }

  // ---------- GAME STATE ----------
  const state = {
    mode: "duel",      // duel | solo
    level: "basic",    // basic | hard | expert
    topic: "all",
    rounds: 10,
    timeSec: 8,
    speedBonus: true,

    setId: "default",

    // runtime
    round: 0,
    turn: "A",
    locked: false,

    scoreA: 0,
    scoreB: 0,
    streakA: 0,
    streakB: 0,

    activeQ: null,
    timerT: 0,
    timerMax: 0,
    timerRAF: 0,

    db: null,
    stats: null,
  };

  function getActiveSet(){
    const s = state.db.sets.find(x => x.id === state.db.activeSetId) || state.db.sets[0];
    return s;
  }

  function getActivePool(){
    const setObj = getActiveSet();
    const data = setObj.data || {};
    const arr = data[state.level] || [];
    return Array.isArray(arr) ? arr : [];
  }

  function normalizeQuestion(q){
    const out = { ...q };
    out.id = out.id || uid();
    out.type = (out.type || "article").toLowerCase();
    out.main = (out.main ?? "").toString();
    out.correct = (out.correct ?? "").toString().trim();
    out.hint = (out.hint ?? "").toString();
    out.cat = (out.cat ?? "").toString().trim();
    if (out.options && Array.isArray(out.options)) {
      out.options = out.options.map(x => (x ?? "").toString().trim()).filter(Boolean);
    } else {
      out.options = null;
    }

    // быстрый ввод "der Tisch" / "die Katze" / "das Kind"
    // если correct пустой, а main начинается с артикля
    if (!out.correct) {
      const m = out.main.trim().match(/^(der|die|das)\s+(.+)$/i);
      if (m) {
        out.correct = m[1].toLowerCase();
        out.main = m[2].trim();
        out.type = "article";
      }
    }
    return out;
  }

  function collectTopics(){
    const pool = getActivePool();
    const set = new Set(["all"]);
    pool.forEach(q => {
      const cat = (q.cat || "other").toString().trim() || "other";
      set.add(cat);
    });
    return Array.from(set);
  }

  function fillTopicSelect(){
    if (!ui.selTopic) return;
    const topics = collectTopics();
    const cur = state.topic || "all";
    ui.selTopic.innerHTML = "";
    topics.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = (t === "all") ? "Всё" : t;
      ui.selTopic.appendChild(opt);
    });
    ui.selTopic.value = topics.includes(cur) ? cur : "all";
    state.topic = ui.selTopic.value;
  }

  function getErrorWeight(q){
    const st = state.stats[q.id];
    if (!st) return 1;
    const wrong = st.wrong || 0;
    // чем больше ошибок, тем чаще встречается
    return 1 + Math.min(6, wrong);
  }

  function pickQuestion(){
    const pool = getActivePool().map(normalizeQuestion);
    if (!pool.length) return null;

    // фильтр по теме
    const filtered = pool.filter(q => {
      if (state.topic === "all") return true;
      const cat = q.cat || "other";
      return cat === state.topic;
    });
    const base = filtered.length ? filtered : pool;

    // умное повторение: чаще те, где больше ошибок
    const weighted = [];
    base.forEach(q => {
      const w = getErrorWeight(q);
      for (let i=0;i<w;i++) weighted.push(q);
    });
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  function getOptionsFor(q){
    // если options явно задан
    if (q.options && q.options.length) {
      const opts = Array.from(new Set([...q.options, q.correct]));
      return shuffle(opts).slice(0, 6);
    }

    // типы по умолчанию
    if (q.type === "article") return shuffle(["der","die","das"]);
    if (q.type === "case") return shuffle(["dem","den","der","des","die","das"]).slice(0, 3);
    if (q.type === "verb") return q.options && q.options.length ? q.options : shuffle(["bin","bist","ist","sind","seid"]).slice(0,3);

    return shuffle(["A","B","C"]);
  }

  function shuffle(arr){
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  // ---------- UI HELPERS ----------
  function setText(el, text){
    if (!el) return;
    el.textContent = text;
  }

  function setBadge(text){
    setText(ui.badgeInfo, text);
  }

  function showModal(modalEl, on){
    if (!modalEl) return;
    modalEl.classList.toggle("show", !!on);
    modalEl.setAttribute("aria-hidden", on ? "false" : "true");
    document.body.classList.toggle("modalOpen", [...document.querySelectorAll(".modal")].some(m=>m.getAttribute("aria-hidden")==="false"));
    if(on && modalEl===ui.setupModal){
      // ensure scroll hint state
      requestAnimationFrame(() => updateSetupScrollHint());
    }
  }

  function openSetup(open){
    showModal(ui.setupModal, open);
  }

  function openWin(open){
    showModal(ui.winModal, open);
  }

  function openDrawer(open){
    if (!ui.drawer) return;
    ui.drawer.classList.toggle("show", !!open);
    ui.drawer.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function openTeacher(open){
    showModal(ui.teacherModal, open);
    if(open){
      if(ui.inpTeacherPin) ui.inpTeacherPin.value = "";
      requestAnimationFrame(() => ui.inpTeacherPin?.focus());
    }
  }

  function renderPills(){
    const setObj = getActiveSet();
    setText(ui.pillMode, state.mode.toUpperCase());
    setText(ui.pillLevel, state.level.toUpperCase());
    setText(ui.pillSet, setObj?.name || "Набор");
  }

  function renderScores(){
    setText(ui.scoreA, String(state.scoreA));
    setText(ui.scoreB, String(state.scoreB));
    setText(ui.streakA, String(state.streakA));
    setText(ui.streakB, String(state.streakB));
  }

  function renderRound(){
    setText(ui.roundNum, String(state.round));
  }

  function renderTurn(){
    setText(ui.turnInfo, `Ход: ${state.turn}`);
  }

  function renderLeader(){
    if (state.scoreA === state.scoreB) setText(ui.leaderText, "ничья");
    else if (state.scoreA > state.scoreB) setText(ui.leaderText, "A лидирует");
    else setText(ui.leaderText, "B лидирует");
  }

  function setStatus(text){
    setText(ui.status, text || "");
  }

  // ---------- TIMER ----------
  function stopTimer(){
    if (state.timerRAF) cancelAnimationFrame(state.timerRAF);
    state.timerRAF = 0;
  }

  function startTimer(){
    stopTimer();
    state.timerMax = state.timeSec * 1000;
    state.timerT = performance.now();

    const tick = (now) => {
      const dt = now - state.timerT;
      const left = clamp(state.timerMax - dt, 0, state.timerMax);
      const p = (left / state.timerMax) * 100;

      if (ui.progressFill) ui.progressFill.style.width = `${p}%`;
      if (ui.timerFill) ui.timerFill.style.width = `${p}%`;
      if (ui.timeLeft) ui.timeLeft.textContent = (left/1000).toFixed(1);

      if (left <= 0){
        state.timerRAF = 0;
        onTimeUp();
        return;
      }
      state.timerRAF = requestAnimationFrame(tick);
    };

    state.timerRAF = requestAnimationFrame(tick);
  }

  function onTimeUp(){
    if (state.locked) return;
    state.locked = true;
    setBadge("Время!");
    setStatus("Время вышло.");
    // засчитываем как ошибку текущему игроку/команде
    if (state.mode === "duel") {
      applyWrong(state.turn);
      nextTurn();
    } else {
      applyWrong("solo");
      nextRound();
    }
  }

  // ---------- GAME LOGIC ----------
  function resetMatch(){
    stopTimer();
    state.round = 0;
    state.turn = "A";
    state.locked = false;
    state.scoreA = 0;
    state.scoreB = 0;
    state.streakA = 0;
    state.streakB = 0;
    state.activeQ = null;

    if (ui.progressFill) ui.progressFill.style.width = "0%";
    if (ui.timerFill) ui.timerFill.style.width = "0%";
    if (ui.timeLeft) ui.timeLeft.textContent = "0.0";

    setBadge("Готов");
    setStatus("");
    renderScores();
    renderRound();
    renderTurn();
    renderLeader();
    setText(ui.qPrompt, "Нажми «Старт», чтобы начать");
    setText(ui.qHint, "");
    clearAnswers();
    clearChoices();
  }

  function clearAnswers(){
    if (ui.answers) ui.answers.innerHTML = "";
  }

  function clearChoices(){
    if (ui.choicesA) ui.choicesA.innerHTML = "";
    if (ui.choicesB) ui.choicesB.innerHTML = "";
  }

  function applyCorrect(side){
    if (side === "A"){
      state.scoreA += 1;
      state.streakA += 1;
      state.streakB = 0;
    } else if (side === "B"){
      state.scoreB += 1;
      state.streakB += 1;
      state.streakA = 0;
    } else {
      // solo
      state.scoreA += 1;
      state.streakA += 1;
    }
    renderScores();
    renderLeader();
  }

  function applyWrong(side){
    if (side === "A"){
      state.streakA = 0;
    } else if (side === "B"){
      state.streakB = 0;
    } else {
      state.streakA = 0;
    }
    renderScores();
    renderLeader();
  }

  function bumpStats(q, ok){
    if (!q || !q.id) return;
    const st = state.stats[q.id] || { right:0, wrong:0 };
    if (ok) st.right += 1;
    else st.wrong += 1;
    state.stats[q.id] = st;
    saveStats(state.stats);
  }

  function showQuestion(){
    state.activeQ = pickQuestion();
    if (!state.activeQ){
      setBadge("Пусто");
      setStatus("В этом уровне нет вопросов. Добавь их через редактор.");
      setText(ui.qPrompt, "Нет вопросов");
      clearAnswers();
      clearChoices();
      stopTimer();
      return;
    }

    state.locked = false;
    setBadge("Вперёд");
    setStatus("");

    const q = state.activeQ;
    setText(ui.qPrompt, q.main);
    setText(ui.qHint, q.hint || "");

    const opts = getOptionsFor(q);

    if (state.mode === "duel"){
      renderDuelOptions(opts);
      if (ui.answers) ui.answers.innerHTML = ""; // solo area not needed
    } else {
      renderSoloOptions(opts);
      clearChoices();
    }

    startTimer();
  }

  function renderSoloOptions(opts){
    if (!ui.answers) return;
    ui.answers.innerHTML = "";
    opts.forEach(o => {
      const b = document.createElement("button");
      b.className = "answerBtn";
      b.textContent = o;
      b.addEventListener("click", () => handleAnswer("solo", o, b));
      ui.answers.appendChild(b);
    });
  }

  function renderDuelOptions(opts){
    const makeBtn = (side, o) => {
      const b = document.createElement("button");
      b.className = "sideChoiceBtn";
      b.textContent = o;
      b.addEventListener("click", () => handleAnswer(side, o, b));
      return b;
    };

    if (ui.choicesA){
      ui.choicesA.innerHTML = "";
      opts.forEach(o => ui.choicesA.appendChild(makeBtn("A", o)));
    }
    if (ui.choicesB){
      ui.choicesB.innerHTML = "";
      opts.forEach(o => ui.choicesB.appendChild(makeBtn("B", o)));
    }
  }

  function lockButtons(){
    document.querySelectorAll(".answerBtn,.sideChoiceBtn").forEach(b => {
      b.disabled = true;
    });
  }

  function markButtons(correct){
    document.querySelectorAll(".answerBtn,.sideChoiceBtn").forEach(b => {
      const val = (b.textContent || "").trim().toLowerCase();
      if (val === String(correct).trim().toLowerCase()) b.classList.add("good");
    });
  }

  function handleAnswer(side, answer, btnEl){
    if (state.locked) return;
    state.locked = true;
    stopTimer();

    const q = state.activeQ;
    const ok = String(answer).trim().toLowerCase() === String(q.correct).trim().toLowerCase();

    lockButtons();
    markButtons(q.correct);

    if (btnEl) btnEl.classList.add(ok ? "good" : "bad");

    bumpStats(q, ok);

    if (ok){
      setBadge("Верно!");
      applyCorrect(side);
      setStatus("Правильно ✅");
    } else {
      setBadge("Ошибка");
      applyWrong(side);
      setStatus(`Неверно ❌ (правильно: ${q.correct})`);
    }

    if (state.mode === "duel"){
      nextTurn();
    } else {
      nextRound();
    }
  }

  function nextTurn(){
    // в дуэли каждый ответ = смена хода, раунд увеличиваем когда B сходил
    if (state.turn === "A") state.turn = "B";
    else {
      state.turn = "A";
      state.round += 1;
    }

    renderTurn();
    renderRound();

    if (state.round >= state.rounds){
      endMatch();
      return;
    }

    setTimeout(showQuestion, 450);
  }

  function nextRound(){
    state.round += 1;
    renderRound();

    if (state.round >= state.rounds){
      endMatch();
      return;
    }

    setTimeout(showQuestion, 450);
  }

  function endMatch(){
    stopTimer();
    state.locked = true;

    if (state.mode === "solo"){
      setText(ui.winTitle, "Результат (Соло)");
      setText(ui.winSub, `Очки: ${state.scoreA} • Серия: ${state.streakA}`);
      openWin(true);
      return;
    }

    let winner = "Ничья";
    if (state.scoreA > state.scoreB) winner = "Команда A победила";
    else if (state.scoreB > state.scoreA) winner = "Команда B победила";

    setText(ui.winTitle, winner);
    setText(ui.winSub, `Счёт: ${state.scoreA} : ${state.scoreB}`);
    openWin(true);
  }

  // ---------- SETS UI ----------
  function rebuildSetSelect(){
    if (!ui.selSet) return;
    ui.selSet.innerHTML = "";
    state.db.sets.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      ui.selSet.appendChild(opt);
    });
    ui.selSet.value = state.db.activeSetId;
  }

  function setActiveSet(id){
    const exists = state.db.sets.some(s => s.id === id);
    if (!exists) return;
    state.db.activeSetId = id;
    saveDB(state.db);
    renderPills();
    fillTopicSelect();
  }

  function createSet(){
    const name = (ui.inpSetName?.value || "").trim() || "Новый набор";
    const newSet = {
      id: uid(),
      name,
      data: structuredClone(window.FD_DEFAULT_SETS || { basic:[], hard:[], expert:[] }),
    };
    state.db.sets.push(newSet);
    state.db.activeSetId = newSet.id;
    saveDB(state.db);
    rebuildSetSelect();
    renderPills();
    fillTopicSelect();
  }

  function renameSet(){
    const setObj = getActiveSet();
    const name = (ui.inpSetName?.value || "").trim();
    if (!name) return;
    setObj.name = name;
    saveDB(state.db);
    rebuildSetSelect();
    renderPills();
  }

  function deleteSet(){
    if (state.db.sets.length <= 1) return;
    const id = state.db.activeSetId;
    state.db.sets = state.db.sets.filter(s => s.id !== id);
    state.db.activeSetId = state.db.sets[0].id;
    saveDB(state.db);
    rebuildSetSelect();
    renderPills();
    fillTopicSelect();
  }

  // ---------- EDITOR LIST ----------
  function renderList(){
    if (!ui.edList) return;
    const pool = getActivePool().map(normalizeQuestion);
    ui.edList.innerHTML = "";
    pool.forEach((q, idx) => {
      const item = document.createElement("div");
      item.className = "item";

      const top = document.createElement("div");
      top.className = "itemTop";

      const main = document.createElement("div");
      main.className = "itemMain";
      main.textContent = q.main;

      const sub = document.createElement("div");
      sub.className = "itemSub";
      sub.textContent = `${q.type} • ${q.correct}${q.cat ? " • " + q.cat : ""}`;

      top.appendChild(main);
      top.appendChild(sub);
      item.appendChild(top);

      const actions = document.createElement("div");
      actions.className = "itemActions";

      const btnDel = document.createElement("button");
      btnDel.className = "btn danger";
      btnDel.textContent = "Удалить";
      btnDel.addEventListener("click", () => {
        const setObj = getActiveSet();
        const arr = setObj.data[state.level] || [];
        setObj.data[state.level] = arr.filter(x => (x.id || "") !== q.id);
        saveDB(state.db);
        renderList();
        fillTopicSelect();
      });

      actions.appendChild(btnDel);
      item.appendChild(actions);

      ui.edList.appendChild(item);
    });
  }

  // ---------- ADD QUESTION ----------
  function addFromFields(prefix){
    // prefix: "" (setup) or "2" (drawer)
    const edCat = ui[prefix ? "edCat2" : "edCat"];
    const edType = ui[prefix ? "edType2" : "edType"];
    const edLevel = ui[prefix ? "edLevel2" : "edLevel"];
    const edMain = ui[prefix ? "edMain2" : "edMain"];
    const edCorrect = ui[prefix ? "edCorrect2" : "edCorrect"];
    const edHint = ui[prefix ? "edHint2" : "edHint"];
    const edOptions = ui[prefix ? "edOptions2" : "edOptions"];

    const cat = (edCat?.value || "").trim();
    const type = (edType?.value || "article").trim();
    const level = (edLevel?.value || state.level).trim();
    const mainRaw = (edMain?.value || "").trim();
    const correctRaw = (edCorrect?.value || "").trim();
    const hint = (edHint?.value || "").trim();
    const optionsRaw = (edOptions?.value || "").trim();

    if (!mainRaw) return { ok:false, msg:"Заполни слово/фразу" };

    let q = {
      id: uid(),
      type,
      cat,
      main: mainRaw,
      correct: correctRaw,
      hint,
    };

    // поддержка "der Tisch"
    q = normalizeQuestion(q);

    // варианты
    if (optionsRaw){
      q.options = optionsRaw.split(",").map(s => s.trim()).filter(Boolean);
    }

    // валидация
    if (!q.correct) return { ok:false, msg:"Нужен правильный ответ (или введи 'der Tisch')" };

    const setObj = getActiveSet();
    if (!setObj.data[level]) setObj.data[level] = [];
    setObj.data[level].push(q);
    saveDB(state.db);

    fillTopicSelect();
    renderList();

    return { ok:true, msg:"Добавлено" };
  }

  // ---------- IMPORT/EXPORT ----------
  function exportLevel(){
    if (!ui.ioBox) return;
    const pool = getActivePool().map(normalizeQuestion);
    ui.ioBox.value = JSON.stringify(pool, null, 2);
    setBadge("Экспорт");
  }

  function importLevel(replace){
    if (!ui.ioBox) return;
    const raw = ui.ioBox.value.trim();
    if (!raw) return;
    const arr = safeJSONParse(raw, null);
    if (!Array.isArray(arr)) {
      setBadge("Ошибка");
      setStatus("Импорт: нужен массив JSON");
      return;
    }
    const setObj = getActiveSet();
    const cleaned = arr.map(normalizeQuestion).filter(q => q.main && q.correct);

    if (replace) setObj.data[state.level] = cleaned;
    else setObj.data[state.level] = [...(setObj.data[state.level] || []), ...cleaned];

    saveDB(state.db);
    fillTopicSelect();
    renderList();
    setBadge("Импорт");
    setStatus(`Импортировано: ${cleaned.length}`);
  }

  // ---------- BIND ----------
  function bind(){
    ui.btnOpenSetup?.addEventListener("click", () => openSetup(true));
    ui.btnSetupScroll?.addEventListener("click", () => {
      const b = ui.setupBody;
      if(!b) return;
      b.scrollTo({ top: Math.min(b.scrollTop + b.clientHeight*0.85, b.scrollHeight), behavior: "smooth" });
    });
    ui.setupBody?.addEventListener("scroll", () => updateSetupScrollHint());
    window.addEventListener("resize", () => updateSetupScrollHint());

    ui.btnTeacher?.addEventListener("click", () => openTeacher(true));
    ui.teacherBackdrop?.addEventListener("click", () => openTeacher(false));
    ui.btnCloseTeacher?.addEventListener("click", () => openTeacher(false));
    ui.btnTeacherOff?.addEventListener("click", () => { setTeacherMode(false); openTeacher(false); setBadge("Режим учителя: выкл"); });
    ui.btnTeacherOn?.addEventListener("click", () => {
      const pin = (ui.inpTeacherPin?.value || "").trim();
      if(pin === TEACHER_PIN_DEFAULT){
        setTeacherMode(true);
        openTeacher(false);
        setBadge("Режим учителя: вкл");
      } else {
        setBadge("Неверный PIN");
      }
    });
    ui.inpTeacherPin?.addEventListener("keydown", (e) => {
      if(e.key === "Enter") ui.btnTeacherOn?.click();
    });
    ui.btnOpenSetup2?.addEventListener("click", () => openSetup(true));
    ui.btnCloseSetup?.addEventListener("click", () => openSetup(false));
    ui.setupBackdrop?.addEventListener("click", () => openSetup(false));

    ui.btnCloseEditor?.addEventListener("click", () => openDrawer(false));
    ui.btnEditor?.addEventListener("click", () => { openDrawer(true); renderList(); });

    ui.btnReset?.addEventListener("click", () => resetMatch());

    ui.btnTheme?.addEventListener("click", () => {
      const cur = loadTheme();
      const next = cur === "dark" ? "light" : "dark";
      saveTheme(next);
      applyTheme(next);
      setBadge(next === "dark" ? "Тёмная тема" : "Светлая тема");
    });

    ui.selTopic?.addEventListener("change", () => {
      state.topic = ui.selTopic.value;
      setBadge("Тема");
      setStatus("");
    });

    ui.inpRounds?.addEventListener("change", () => {
      state.rounds = clamp(parseInt(ui.inpRounds.value || "10", 10) || 10, 1, 100);
      ui.inpRounds.value = String(state.rounds);
    });

    ui.inpTime?.addEventListener("change", () => {
      state.timeSec = clamp(parseInt(ui.inpTime.value || "8", 10) || 8, 3, 30);
      ui.inpTime.value = String(state.timeSec);
    });

    ui.btnStartNow?.addEventListener("click", () => {
      resetMatch();
      showQuestion();
    });

    ui.btnConfirmStart?.addEventListener("click", () => {
      readSetupIntoState();
      openSetup(false);
      resetMatch();
      showQuestion();
    });

    ui.btnOnlyConfirm?.addEventListener("click", () => {
      readSetupIntoState();
      openSetup(false);
      renderPills();
      fillTopicSelect();
      setBadge("Сохранено");
    });

    ui.selMode?.addEventListener("change", () => { state.mode = ui.selMode.value; renderPills(); });
    ui.selLevel?.addEventListener("change", () => { state.level = ui.selLevel.value; fillTopicSelect(); renderPills(); renderList(); });

    ui.selSpeed?.addEventListener("change", () => { state.speedBonus = ui.selSpeed.value === "1"; });

    ui.selSet?.addEventListener("change", () => {
      setActiveSet(ui.selSet.value);
      // обновим имя в поле
      const s = getActiveSet();
      if (ui.inpSetName) ui.inpSetName.value = s.name;
      renderList();
    });

    ui.btnNewSet?.addEventListener("click", () => createSet());
    ui.btnRenameSet?.addEventListener("click", () => renameSet());
    ui.btnDeleteSet?.addEventListener("click", () => deleteSet());

    ui.btnAdd?.addEventListener("click", () => {
      const r = addFromFields("");
      setBadge(r.ok ? "OK" : "Ошибка");
      setStatus(r.msg);
    });

    ui.btnAdd2?.addEventListener("click", () => {
      const r = addFromFields("2");
      setBadge(r.ok ? "OK" : "Ошибка");
      setStatus(r.msg);
    });

    ui.btnClear2?.addEventListener("click", () => {
      ["edCat2","edMain2","edCorrect2","edHint2","edOptions2"].forEach(k => { if (ui[k]) ui[k].value = ""; });
      setBadge("Очищено");
      setStatus("");
    });

    ui.btnOpenFullEditor?.addEventListener("click", () => { openSetup(false); openDrawer(true); renderList(); });

    ui.btnExport?.addEventListener("click", () => exportLevel());
    ui.btnImport?.addEventListener("click", () => importLevel(true));
    ui.btnImportAdd?.addEventListener("click", () => importLevel(false));

    ui.btnCloseWin?.addEventListener("click", () => openWin(false));
    ui.winBackdrop?.addEventListener("click", () => openWin(false));
    ui.btnPlayAgain?.addEventListener("click", () => {
      openWin(false);
      resetMatch();
      showQuestion();
    });
  }

  function readSetupIntoState(){
    if (ui.selMode) state.mode = ui.selMode.value;
    if (ui.selLevel) state.level = ui.selLevel.value;
    if (ui.inpTime) state.timeSec = clamp(parseInt(ui.inpTime.value || "8", 10) || 8, 3, 30);
    if (ui.selSpeed) state.speedBonus = ui.selSpeed.value === "1";
    if (ui.inpRounds) state.rounds = clamp(parseInt(ui.inpRounds.value || "10", 10) || 10, 1, 100);
    renderPills();
  }

  // ---------- INIT ----------
  function init(){
    state.db = loadDB();
    state.stats = loadStats();

    state.setId = state.db.activeSetId;

    const theme = loadTheme();
    applyTheme(theme);
    setTeacherMode(loadTeacherMode());

    rebuildSetSelect();
    const s = getActiveSet();
    if (ui.inpSetName) ui.inpSetName.value = s.name;

    renderPills();
    fillTopicSelect();

    // sync inputs
    if (ui.selMode) ui.selMode.value = state.mode;
    if (ui.selLevel) ui.selLevel.value = state.level;
    if (ui.selSpeed) ui.selSpeed.value = state.speedBonus ? "1" : "0";
    if (ui.inpRounds) ui.inpRounds.value = String(state.rounds);
    if (ui.inpTime) ui.inpTime.value = String(state.timeSec);

    resetMatch();
  }

  bind();
  init();
});