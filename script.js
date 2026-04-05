const STORAGE_KEY = "painel-fazenda-gta";
const SESSION_KEY = `${STORAGE_KEY}:sessionUserId`;
const LEGACY_STORAGE_KEYS = ["painel-farm-gta-rp", "painel-fazenda-gta-rp-v2"];
const DEFAULT_SUPABASE_CONFIG = {
  url: "https://leypzjulxskqhxzuizjb.supabase.co",
  anonKey: "sb_publishable_KFdDoU5eXIwtU5wAIK_MOg_qVKqSlfs",
};
const DEFAULT_ADMIN = {
  nome: "Administrador",
  usuario: "admin",
  senha: "123456",
  tipo: "admin",
};

const state = {
  supabase: null,
  users: [],
  records: [],
  currentUser: null,
  isConfigured: false,
  loading: false,
};

const els = {
  authView: document.getElementById("authView"),
  appView: document.getElementById("appView"),
  adminSection: document.getElementById("adminSection"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginMessage: document.getElementById("loginMessage"),
  sidebarDateLabel: document.getElementById("sidebarDateLabel"),
  sidebarModeLabel: document.getElementById("sidebarModeLabel"),
  sidebarUserName: document.getElementById("sidebarUserName"),
  sidebarUserRole: document.getElementById("sidebarUserRole"),
  miniDelivered: document.getElementById("miniDelivered"),
  miniPending: document.getElementById("miniPending"),
  miniWeekly: document.getElementById("miniWeekly"),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  requiredBadge: document.getElementById("requiredBadge"),
  deliveryBadge: document.getElementById("deliveryBadge"),
  heroObligation: document.getElementById("heroObligation"),
  heroObligationDescription: document.getElementById("heroObligationDescription"),
  heroDirtyMoney: document.getElementById("heroDirtyMoney"),
  heroTopMember: document.getElementById("heroTopMember"),
  heroTopMemberDescription: document.getElementById("heroTopMemberDescription"),
  heroMissedCount: document.getElementById("heroMissedCount"),
  farmForm: document.getElementById("farmForm"),
  farmMemberName: document.getElementById("farmMemberName"),
  farmType: document.getElementById("farmType"),
  materialsReceived: document.getElementById("materialsReceived"),
  dirtyMoney: document.getElementById("dirtyMoney"),
  materialsRemaining: document.getElementById("materialsRemaining"),
  chestPrint: document.getElementById("chestPrint"),
  fileLabel: document.getElementById("fileLabel"),
  autoDate: document.getElementById("autoDate"),
  farmMessage: document.getElementById("farmMessage"),
  clearFarmFormButton: document.getElementById("clearFarmFormButton"),
  dailyStatusBody: document.getElementById("dailyStatusBody"),
  memberHistoryBody: document.getElementById("memberHistoryBody"),
  memberHistorySummary: document.getElementById("memberHistorySummary"),
  recordsBody: document.getElementById("recordsBody"),
  rankingList: document.getElementById("rankingList"),
  missingList: document.getElementById("missingList"),
  missingSummary: document.getElementById("missingSummary"),
  memberForm: document.getElementById("memberForm"),
  memberId: document.getElementById("memberId"),
  memberName: document.getElementById("memberName"),
  memberUsername: document.getElementById("memberUsername"),
  memberPassword: document.getElementById("memberPassword"),
  memberRole: document.getElementById("memberRole"),
  memberMessage: document.getElementById("memberMessage"),
  memberFormMode: document.getElementById("memberFormMode"),
  cancelEditMemberButton: document.getElementById("cancelEditMemberButton"),
  membersBody: document.getElementById("membersBody"),
  memberCounter: document.getElementById("memberCounter"),
  weeklyArchive: document.getElementById("weeklyArchive"),
  exportButton: document.getElementById("exportButton"),
  logoutButton: document.getElementById("logoutButton"),
  imageModal: document.getElementById("imageModal"),
  modalImage: document.getElementById("modalImage"),
  closeModalButton: document.getElementById("closeModalButton"),
};

initialize();

async function initialize() {
  bindEvents();
  migrateLegacyBrowserStorage();
  setupSupabase();

  if (!state.isConfigured) {
    showMessage(
      els.loginMessage,
      "Configure o arquivo supabase-config.js com a URL e a chave anon do seu projeto.",
      "error",
    );
    renderApp();
    return;
  }

  try {
    await ensureDefaultAdmin();
    await restoreSession();
    await refreshData();
  } catch (error) {
    console.error(error);
    showMessage(els.loginMessage, getErrorMessage(error), "error");
  }

  renderApp();
}

function migrateLegacyBrowserStorage() {
  LEGACY_STORAGE_KEYS.forEach((legacyKey) => {
    try {
      localStorage.removeItem(legacyKey);
      sessionStorage.removeItem(legacyKey);
    } catch (error) {
      console.error("Falha ao limpar chave legada:", legacyKey, error);
    }
  });
}

function setupSupabase() {
  const config = window.SUPABASE_CONFIG || DEFAULT_SUPABASE_CONFIG;
  const url = String(config.url || "").trim();
  const anonKey = String(config.anonKey || "").trim();

  state.isConfigured = Boolean(url && anonKey);
  if (!state.isConfigured) return;

  state.supabase = { url, anonKey };
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.farmForm.addEventListener("submit", handleFarmSubmit);
  els.memberForm.addEventListener("submit", handleMemberSubmit);
  els.clearFarmFormButton.addEventListener("click", resetFarmForm);
  els.cancelEditMemberButton.addEventListener("click", resetMemberForm);
  els.chestPrint.addEventListener("change", handleFileLabel);
  els.membersBody.addEventListener("click", handleMemberActions);
  els.recordsBody.addEventListener("click", handleImageButtons);
  els.memberHistoryBody.addEventListener("click", handleImageButtons);
  els.logoutButton.addEventListener("click", logout);
  els.exportButton.addEventListener("click", exportData);
  els.closeModalButton.addEventListener("click", closeModal);
  els.imageModal.addEventListener("click", (event) => {
    if (event.target.dataset.close === "true") closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  window.setInterval(async () => {
    if (!state.currentUser || state.loading) return;
    try {
      await refreshData();
      renderApp();
    } catch (error) {
      console.error(error);
    }
  }, 60000);
}

async function handleLogin(event) {
  event.preventDefault();
  clearMessage(els.loginMessage);

  if (!state.isConfigured) {
    showMessage(els.loginMessage, "Supabase nao configurado.", "error");
    return;
  }

  const usuario = els.loginUsername.value.trim().toLowerCase();
  const senha = els.loginPassword.value.trim();

  if (!usuario || !senha) {
    showMessage(els.loginMessage, "Informe usuario e senha.", "error");
    return;
  }

  try {
    setLoading(true);
    const user = await loginUser(usuario, senha);

    if (!user) {
      showMessage(els.loginMessage, "Usuario ou senha invalidos.", "error");
      return;
    }

    state.currentUser = user;
    sessionStorage.setItem(SESSION_KEY, user.id);
    els.loginForm.reset();
    await refreshData();
    renderApp();
  } catch (error) {
    console.error(error);
    showMessage(els.loginMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

async function handleFarmSubmit(event) {
  event.preventDefault();
  clearMessage(els.farmMessage);

  if (!state.currentUser) {
    logout();
    return;
  }

  const payload = {
    farm: els.farmType.value.trim(),
    materiais: Number(els.materialsReceived.value),
    dinheiro: Number(els.dirtyMoney.value),
    restantes: Number(els.materialsRemaining.value),
    file: els.chestPrint.files[0],
  };

  const validationError = validateFarmPayload(payload);
  if (validationError) {
    showMessage(els.farmMessage, validationError, "error");
    return;
  }

  try {
    setLoading(true);
    const printValue = await fileToDataUrl(payload.file);
    const todayKey = getDateKey();
    const existingRecord = state.records.find(
      (record) => String(record.usuario) === String(state.currentUser.id) && toDateKey(record.data) === todayKey,
    );

    const recordPayload = {
      usuario: state.currentUser.id,
      farm: payload.farm,
      materiais: payload.materiais,
      dinheiro: payload.dinheiro,
      restantes: payload.restantes,
      print: printValue,
      data: new Date().toISOString(),
      status: "Entregue",
    };

    await saveFarmRecord(existingRecord?.id, recordPayload);
    await refreshData();
    resetFarmForm();
    showMessage(els.farmMessage, existingRecord ? "Entrega atualizada com sucesso." : "Entrega registrada com sucesso.", "success");
    renderApp();
  } catch (error) {
    console.error(error);
    showMessage(els.farmMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

async function handleMemberSubmit(event) {
  event.preventDefault();
  clearMessage(els.memberMessage);

  if (!isAdmin()) return;

  const editingId = els.memberId.value.trim();
  const payload = {
    nome: els.memberName.value.trim(),
    usuario: els.memberUsername.value.trim().toLowerCase(),
    senha: els.memberPassword.value.trim(),
    tipo: els.memberRole.value,
  };

  const validationError = validateMemberPayload(payload, editingId);
  if (validationError) {
    showMessage(els.memberMessage, validationError, "error");
    return;
  }

  try {
    setLoading(true);
    await saveMember(editingId, payload);
    await refreshData();
    resetMemberForm();
    showMessage(
      els.memberMessage,
      editingId ? "Membro atualizado com sucesso." : "Membro cadastrado com sucesso.",
      "success",
    );
    renderApp();
  } catch (error) {
    console.error(error);
    showMessage(els.memberMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

async function handleMemberActions(event) {
  if (!isAdmin()) return;

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const userId = actionButton.dataset.userId;
  const user = state.users.find((item) => String(item.id) === String(userId));
  if (!user) return;

  if (actionButton.dataset.action === "edit") {
    els.memberId.value = user.id;
    els.memberName.value = user.nome;
    els.memberUsername.value = user.usuario;
    els.memberPassword.value = user.senha;
    els.memberRole.value = user.tipo;
    els.memberFormMode.textContent = `Editando ${user.nome}`;
    clearMessage(els.memberMessage);
    return;
  }

  if (actionButton.dataset.action === "delete") {
    if (String(user.id) === String(state.currentUser?.id)) {
      showMessage(els.memberMessage, "Nao e permitido excluir a conta em uso.", "error");
      return;
    }

    const adminCount = state.users.filter((item) => item.tipo === "admin").length;
    if (user.tipo === "admin" && adminCount <= 1) {
      showMessage(els.memberMessage, "Mantenha pelo menos um administrador ativo.", "error");
      return;
    }

    const confirmed = window.confirm(`Excluir o membro ${user.nome} e os registros dele?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteMember(user.id);
      await refreshData();
      resetMemberForm();
      showMessage(els.memberMessage, "Membro excluido com sucesso.", "success");
      renderApp();
    } catch (error) {
      console.error(error);
      showMessage(els.memberMessage, getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }
}

function handleImageButtons(event) {
  const button = event.target.closest("[data-image]");
  if (!button) return;
  openModal(decodeURIComponent(button.dataset.image));
}

function handleFileLabel() {
  const file = els.chestPrint.files[0];
  els.fileLabel.textContent = file ? file.name : "Nenhum arquivo selecionado";
}

async function restoreSession() {
  const sessionUserId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionUserId) return;

  const user = await getUserById(sessionUserId);
  if (user) {
    state.currentUser = user;
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

async function refreshData() {
  const [users, records] = await Promise.all([fetchUsers(), fetchRecords()]);
  state.users = users;
  state.records = records;

  if (state.currentUser) {
    state.currentUser = state.users.find((user) => String(user.id) === String(state.currentUser.id)) || null;
  }
}

function renderApp() {
  const loggedIn = Boolean(state.currentUser);

  els.authView.classList.toggle("hidden", loggedIn);
  els.appView.classList.toggle("hidden", !loggedIn);

  if (!loggedIn) return;

  renderShell(state.currentUser);
  renderFarmForm(state.currentUser);
  renderDailyStatus();
  renderMemberHistory(state.currentUser);

  if (state.currentUser.tipo === "admin") {
    els.adminSection.classList.remove("hidden");
    renderAdminArea();
  } else {
    els.adminSection.classList.add("hidden");
  }
}

function renderShell(user) {
  const today = new Date();
  const todayRecords = getTodayRecords();
  const weeklyRecords = getCurrentWeekRecords();
  const ranking = computeRanking(weeklyRecords);
  const topMember = ranking.find((item) => item.deliveries > 0);
  const pending = getPendingMembers();
  const deliveredToday = hasDeliveredToday(user.id);

  els.sidebarDateLabel.textContent = `${formatDate(today)} - ${capitalize(getWeekdayLabel(today))}`;
  els.sidebarModeLabel.textContent = isRequiredDay(today) ? "Meta obrigatoria" : "Meta opcional";
  els.sidebarUserName.textContent = user.nome;
  els.sidebarUserRole.textContent = user.tipo === "admin" ? "Administrador" : "Membro";
  els.pageTitle.textContent = user.tipo === "admin" ? "Painel Administrativo" : "Painel do Membro";
  els.pageSubtitle.textContent = user.tipo === "admin"
    ? "Usuarios e registros persistidos no banco Supabase com leitura centralizada."
    : "Registre sua meta diaria, envie o print e acompanhe seu historico persistente.";

  els.requiredBadge.textContent = isRequiredDay(today) ? "Obrigatorio hoje" : "Opcional hoje";
  els.deliveryBadge.textContent = deliveredToday ? "Sua entrega esta registrada" : "Sua entrega ainda esta pendente";

  els.miniDelivered.textContent = String(todayRecords.length);
  els.miniPending.textContent = String(pending.length);
  els.miniWeekly.textContent = String(weeklyRecords.length);

  els.heroObligation.textContent = isRequiredDay(today) ? "Entrega obrigatoria" : "Entrega opcional";
  els.heroObligationDescription.textContent = isRequiredDay(today)
    ? "Segunda a sexta os membros precisam enviar a meta diaria no banco."
    : "Fim de semana continua entrando no ranking, mas sem pendencia obrigatoria.";
  els.heroDirtyMoney.textContent = formatMoney(sumBy(todayRecords, "dinheiro"));
  els.heroTopMember.textContent = topMember ? topMember.memberName : "Sem entregas";
  els.heroTopMemberDescription.textContent = topMember
    ? `${topMember.deliveries} entrega(s) registradas nesta semana.`
    : "O ranking semanal sera preenchido quando houver registros.";
  els.heroMissedCount.textContent = String(pending.length);
  els.missingSummary.textContent = isRequiredDay(today)
    ? `${pending.length} pendencia(s) no dia`
    : "Fim de semana sem obrigatoriedade";
}

function renderFarmForm(user) {
  els.farmMemberName.value = user.nome;
  els.autoDate.textContent = formatDateTime(new Date());
}

function renderDailyStatus() {
  const rows = getDailyStatusRows();

  if (!rows.length) {
    els.dailyStatusBody.innerHTML = emptyRow(4, "Nenhum membro cadastrado.");
    return;
  }

  els.dailyStatusBody.innerHTML = rows
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.nome)}</td>
        <td><span class="status-chip ${row.statusClass}">${escapeHtml(row.status)}</span></td>
        <td>${escapeHtml(row.farm)}</td>
        <td>${escapeHtml(row.data)}</td>
      </tr>
    `)
    .join("");
}

function renderMemberHistory(user) {
  const ownRecords = state.records
    .filter((record) => String(record.usuario) === String(user.id))
    .sort((left, right) => new Date(right.data).getTime() - new Date(left.data).getTime());

  const weeklyCount = ownRecords.filter((record) => isSameWeek(toDateKey(record.data), getWeekKey())).length;
  els.memberHistorySummary.textContent = `${weeklyCount} entrega(s) nesta semana`;

  if (!ownRecords.length) {
    els.memberHistoryBody.innerHTML = emptyRow(6, "Nenhuma entrega encontrada para esta conta.");
    return;
  }

  els.memberHistoryBody.innerHTML = ownRecords
    .map((record) => `
      <tr>
        <td>${escapeHtml(formatDateTime(new Date(record.data)))}</td>
        <td>${escapeHtml(record.farm)}</td>
        <td>${escapeHtml(formatMoney(record.dinheiro))}</td>
        <td>${escapeHtml(String(record.restantes))}</td>
        <td>
          <button class="thumb-button" type="button" data-image="${encodeURIComponent(record.print)}">
            Ver print
          </button>
        </td>
        <td><span class="status-chip status-delivered">${escapeHtml(record.status)}</span></td>
      </tr>
    `)
    .join("");
}

function renderAdminArea() {
  renderAdminRecords();
  renderRanking();
  renderMissingList();
  renderMembersTable();
  renderWeeklyArchive();
}

function renderAdminRecords() {
  const records = [...state.records].sort((left, right) => new Date(right.data).getTime() - new Date(left.data).getTime());

  if (!records.length) {
    els.recordsBody.innerHTML = emptyRow(7, "Nenhum registro encontrado.");
    return;
  }

  els.recordsBody.innerHTML = records
    .map((record) => `
      <tr>
        <td>${escapeHtml(getUserName(record.usuario))}</td>
        <td>${escapeHtml(record.farm)}</td>
        <td>${escapeHtml(formatMoney(record.dinheiro))}</td>
        <td>${escapeHtml(String(record.restantes))}</td>
        <td>
          <button class="thumb-button" type="button" data-image="${encodeURIComponent(record.print)}">
            Ver print
          </button>
        </td>
        <td><span class="status-chip status-delivered">${escapeHtml(record.status)}</span></td>
        <td>${escapeHtml(formatDateTime(new Date(record.data)))}</td>
      </tr>
    `)
    .join("");
}

function renderRanking() {
  const ranking = computeRanking(getCurrentWeekRecords()).filter((item) => item.deliveries > 0);

  if (!ranking.length) {
    els.rankingList.innerHTML = `<div class="empty-state">Ainda nao houve entregas nesta semana.</div>`;
    return;
  }

  els.rankingList.innerHTML = ranking
    .map((item, index) => `
      <article class="stack-item ranking-row">
        <span class="ranking-position">${index + 1}o</span>
        <div>
          <strong>${escapeHtml(item.memberName)}</strong>
          <p>${item.deliveries} entrega(s) registradas na semana atual.</p>
        </div>
      </article>
    `)
    .join("");
}

function renderMissingList() {
  const missing = getPendingMembers();

  if (!missing.length) {
    els.missingList.innerHTML = `<div class="empty-state">${
      isRequiredDay() ? "Todos os membros entregaram hoje." : "Hoje nao ha pendencias obrigatorias."
    }</div>`;
    return;
  }

  els.missingList.innerHTML = missing
    .map((user) => `
      <article class="stack-item">
        <strong>${escapeHtml(user.nome)}</strong>
        <p>${isRequiredDay() ? "Ainda nao registrou a meta do dia." : "Sem entrega registrada, mas hoje e opcional."}</p>
      </article>
    `)
    .join("");
}

function renderMembersTable() {
  const users = [...state.users].sort((left, right) => left.nome.localeCompare(right.nome));
  els.memberCounter.textContent = `${users.length} membro(s)`;

  els.membersBody.innerHTML = users
    .map((user) => `
      <tr>
        <td>${escapeHtml(user.nome)}</td>
        <td>${escapeHtml(user.usuario)}</td>
        <td>${escapeHtml(user.tipo === "admin" ? "Admin" : "Membro")}</td>
        <td>
          <div class="action-row">
            <button class="action-button" type="button" data-action="edit" data-user-id="${user.id}">Editar</button>
            <button class="action-button" type="button" data-action="delete" data-user-id="${user.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderWeeklyArchive() {
  const archive = buildWeeklyArchive();

  if (!archive.length) {
    els.weeklyArchive.innerHTML = `<div class="empty-state">O historico semanal sera montado automaticamente conforme as semanas avancarem.</div>`;
    return;
  }

  els.weeklyArchive.innerHTML = archive
    .map((week) => `
      <article class="archive-card">
        <strong>Semana de ${escapeHtml(formatWeekKey(week.weekKey))}</strong>
        <p>Total de entregas: ${escapeHtml(String(week.totalDeliveries))}</p>
        <p>Dinheiro sujo: ${escapeHtml(formatMoney(week.totalDirtyMoney))}</p>
        <p>Lider: ${escapeHtml(week.topMember)}</p>
      </article>
    `)
    .join("");
}

async function fetchUsers() {
  return await supabaseSelect("usuarios", {
    select: "id,nome,usuario,senha,tipo,data_criacao",
    order: "nome.asc",
  });
}

async function fetchRecords() {
  return await supabaseSelect("registros", {
    select: "id,usuario,farm,materiais,dinheiro,restantes,print,data,status",
    order: "data.desc",
  });
}

async function loginUser(usuario, senha) {
  const rows = await supabaseSelect("usuarios", {
    select: "id,nome,usuario,senha,tipo,data_criacao",
    filters: {
      usuario: `eq.${usuario}`,
      senha: `eq.${senha}`,
    },
    limit: 1,
  });
  return rows[0] || null;
}

async function getUserById(id) {
  const rows = await supabaseSelect("usuarios", {
    select: "id,nome,usuario,senha,tipo,data_criacao",
    filters: { id: `eq.${id}` },
    limit: 1,
  });
  return rows[0] || null;
}

async function saveMember(editingId, payload) {
  if (editingId) {
    await supabasePatch("usuarios", { id: `eq.${editingId}` }, {
      nome: payload.nome,
      usuario: payload.usuario,
      senha: payload.senha,
      tipo: payload.tipo,
    });
    return;
  }

  await supabaseInsert("usuarios", {
    nome: payload.nome,
    usuario: payload.usuario,
    senha: payload.senha,
    tipo: payload.tipo,
  });
}

async function saveFarmRecord(existingId, payload) {
  if (existingId) {
    await supabasePatch("registros", { id: `eq.${existingId}` }, payload);
    return;
  }

  await supabaseInsert("registros", payload);
}

async function deleteMember(userId) {
  await supabaseDelete("registros", { usuario: `eq.${userId}` });
  await supabaseDelete("usuarios", { id: `eq.${userId}` });
}

async function ensureDefaultAdmin() {
  const users = await supabaseSelect("usuarios", {
    select: "id",
    limit: 1,
  });
  if (users.length > 0) return;
  await supabaseInsert("usuarios", DEFAULT_ADMIN);
}

async function supabaseSelect(table, options = {}) {
  const query = new URLSearchParams();
  query.set("select", options.select || "*");

  if (options.order) query.set("order", options.order);
  if (options.limit) query.set("limit", String(options.limit));

  Object.entries(options.filters || {}).forEach(([key, value]) => {
    query.set(key, value);
  });

  return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, {
    method: "GET",
  });
}

async function supabaseInsert(table, payload) {
  return await supabaseRequest(`/rest/v1/${table}`, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
}

async function supabasePatch(table, filters, payload) {
  const query = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    query.set(key, value);
  });

  return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
}

async function supabaseDelete(table, filters) {
  const query = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    query.set(key, value);
  });

  return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, {
    method: "DELETE",
  });
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${state.supabase.url}${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: state.supabase.anonKey,
      Authorization: `Bearer ${state.supabase.anonKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha na comunicacao com o Supabase.");
  }

  if (response.status === 204) return [];

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function isAdmin() {
  return state.currentUser?.tipo === "admin";
}

function logout() {
  state.currentUser = null;
  sessionStorage.removeItem(SESSION_KEY);
  clearMessage(els.loginMessage);
  clearMessage(els.farmMessage);
  clearMessage(els.memberMessage);
  resetFarmForm();
  resetMemberForm();
  renderApp();
}

function resetFarmForm() {
  els.farmForm.reset();
  els.materialsReceived.value = 200;
  els.fileLabel.textContent = "Nenhum arquivo selecionado";
}

function resetMemberForm() {
  els.memberForm.reset();
  els.memberId.value = "";
  els.memberRole.value = "membro";
  els.memberFormMode.textContent = "Novo cadastro";
}

function validateFarmPayload(payload) {
  if (!payload.farm) return "Selecione o tipo de farm.";
  if (!Number.isFinite(payload.materiais) || payload.materiais <= 0) return "Informe os materiais corretamente.";
  if (!Number.isFinite(payload.dinheiro) || payload.dinheiro < 0) return "Informe o dinheiro corretamente.";
  if (!Number.isFinite(payload.restantes) || payload.restantes < 0) return "Informe os restantes corretamente.";
  if (!payload.file) return "O print do bau e obrigatorio.";
  if (!payload.file.type.startsWith("image/")) return "Envie um arquivo de imagem valido.";
  return "";
}

function validateMemberPayload(payload, editingId) {
  if (!payload.nome) return "Informe o nome do membro.";
  if (!payload.usuario) return "Informe o usuario da conta.";
  if (!payload.senha) return "Informe a senha da conta.";
  if (!payload.tipo) return "Selecione o tipo de conta.";

  const duplicate = state.users.some(
    (user) => user.usuario.toLowerCase() === payload.usuario.toLowerCase() && String(user.id) !== String(editingId),
  );

  if (duplicate) return "Ja existe um membro usando esse usuario.";
  return "";
}

function getTodayRecords() {
  const todayKey = getDateKey();
  return state.records.filter((record) => toDateKey(record.data) === todayKey);
}

function getCurrentWeekRecords() {
  const currentWeekKey = getWeekKey();
  return state.records.filter((record) => isSameWeek(toDateKey(record.data), currentWeekKey));
}

function getPendingMembers() {
  if (!isRequiredDay()) return [];

  const todayKey = getDateKey();
  return state.users.filter((user) => {
    if (user.tipo !== "membro") return false;
    return !state.records.some(
      (record) => String(record.usuario) === String(user.id) && toDateKey(record.data) === todayKey,
    );
  });
}

function hasDeliveredToday(userId) {
  const todayKey = getDateKey();
  return state.records.some(
    (record) => String(record.usuario) === String(userId) && toDateKey(record.data) === todayKey,
  );
}

function getDailyStatusRows() {
  const todayLabel = formatDate(new Date());
  return state.users
    .filter((user) => user.tipo === "membro")
    .sort((left, right) => left.nome.localeCompare(right.nome))
    .map((user) => {
      const record = state.records.find(
        (item) => String(item.usuario) === String(user.id) && toDateKey(item.data) === getDateKey(),
      );

      if (record) {
        return {
          nome: user.nome,
          status: "Entregue",
          statusClass: "status-delivered",
          farm: record.farm,
          data: formatDateTime(new Date(record.data)),
        };
      }

      if (!isRequiredDay()) {
        return {
          nome: user.nome,
          status: "Opcional",
          statusClass: "status-optional",
          farm: "-",
          data: todayLabel,
        };
      }

      return {
        nome: user.nome,
        status: "Nao entregou",
        statusClass: "status-missed",
        farm: "-",
        data: todayLabel,
      };
    });
}

function computeRanking(records) {
  const members = state.users.filter((user) => user.tipo === "membro");
  const counter = members.map((user) => ({
    userId: user.id,
    memberName: user.nome,
    deliveries: 0,
  }));

  records.forEach((record) => {
    const entry = counter.find((item) => String(item.userId) === String(record.usuario));
    if (entry) entry.deliveries += 1;
  });

  return counter.sort(
    (left, right) => right.deliveries - left.deliveries || left.memberName.localeCompare(right.memberName),
  );
}

function buildWeeklyArchive() {
  const grouped = new Map();

  state.records.forEach((record) => {
    const weekKey = getWeekKey(new Date(record.data));
    if (!grouped.has(weekKey)) grouped.set(weekKey, []);
    grouped.get(weekKey).push(record);
  });

  return Array.from(grouped.entries())
    .map(([weekKey, records]) => {
      const ranking = computeRanking(records);
      const topMember = ranking.find((item) => item.deliveries > 0);
      return {
        weekKey,
        totalDeliveries: records.length,
        totalDirtyMoney: sumBy(records, "dinheiro"),
        topMember: topMember ? `${topMember.memberName} (${topMember.deliveries})` : "Sem entregas",
      };
    })
    .sort((left, right) => right.weekKey.localeCompare(left.weekKey));
}

function exportData() {
  const payload = {
    generatedAt: new Date().toISOString(),
    system: "Painel Fazenda GTA RP",
    users: state.users,
    records: state.records,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `painel-fazenda-backup-${getDateKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function getUserName(userId) {
  return state.users.find((user) => String(user.id) === String(userId))?.nome || "Usuario removido";
}

function openModal(imageSrc) {
  els.modalImage.src = imageSrc;
  els.imageModal.classList.remove("hidden");
  els.imageModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  els.modalImage.src = "";
  els.imageModal.classList.add("hidden");
  els.imageModal.setAttribute("aria-hidden", "true");
}

function setLoading(isLoading) {
  state.loading = isLoading;
  const disabled = Boolean(isLoading);
  [
    els.loginUsername,
    els.loginPassword,
    els.farmType,
    els.materialsReceived,
    els.dirtyMoney,
    els.materialsRemaining,
    els.chestPrint,
    els.memberName,
    els.memberUsername,
    els.memberPassword,
    els.memberRole,
  ].forEach((element) => {
    if (element) element.disabled = disabled;
  });
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "form-message";
}

function getErrorMessage(error) {
  const message = error?.message || "";

  if (message.includes("Failed to fetch") || message.includes("ERR_NAME_NOT_RESOLVED")) {
    return "Falha de conexao com o Supabase. Verifique a URL do projeto e tente novo deploy.";
  }

  if (message.includes("relation") || message.includes("does not exist")) {
    return "As tabelas do banco ainda nao existem. Execute o arquivo supabase-schema.sql no SQL Editor do Supabase.";
  }

  if (message.includes("JWT") || message.includes("apikey") || message.includes("Invalid API key")) {
    return "Chave publishable invalida. Confira a anon key do projeto no Supabase.";
  }

  return message || "Nao foi possivel concluir a operacao no banco.";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao processar a imagem."));
    reader.readAsDataURL(file);
  });
}

function formatDate(date) {
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(date) {
  return date.toLocaleString("pt-BR");
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateKey(value) {
  return getDateKey(new Date(value));
}

function getWeekKey(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  current.setHours(0, 0, 0, 0);
  return getDateKey(current);
}

function isSameWeek(dateKey, weekKey) {
  return getWeekKey(new Date(`${dateKey}T00:00:00`)) === weekKey;
}

function isRequiredDay(date = new Date()) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function getWeekdayLabel(date) {
  return date.toLocaleDateString("pt-BR", { weekday: "long" });
}

function formatWeekKey(weekKey) {
  return formatDate(new Date(`${weekKey}T00:00:00`));
}

function sumBy(items, field) {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0);
}

function emptyRow(columns, message) {
  return `
    <tr>
      <td colspan="${columns}">
        <div class="empty-state">${escapeHtml(message)}</div>
      </td>
    </tr>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}
