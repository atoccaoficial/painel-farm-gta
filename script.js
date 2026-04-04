const STORAGE_KEY = "painel-fazenda-gta-rp-v2";
const DEFAULT_ADMIN = {
  id: "seed-admin",
  name: "Administrador",
  username: "admin",
  password: "123456",
  role: "admin",
  createdAt: new Date().toISOString(),
};

const state = loadState();

const els = {
  authView: document.getElementById("authView"),
  appView: document.getElementById("appView"),
  adminSection: document.getElementById("adminSection"),
  memberHistorySection: document.getElementById("memberHistorySection"),
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

function initialize() {
  runMaintenance();
  bindEvents();
  renderApp();
}

function loadState() {
  const fallback = {
    users: [DEFAULT_ADMIN],
    records: [],
    sessionUserId: "",
    metadata: {
      initializedAt: new Date().toISOString(),
      lastActiveDate: "",
    },
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return fallback;

    return {
      users: Array.isArray(saved.users) && saved.users.length ? saved.users : [DEFAULT_ADMIN],
      records: Array.isArray(saved.records) ? saved.records : [],
      sessionUserId: typeof saved.sessionUserId === "string" ? saved.sessionUserId : "",
      metadata: saved.metadata && typeof saved.metadata === "object"
        ? saved.metadata
        : fallback.metadata,
    };
  } catch (error) {
    console.error("Falha ao carregar dados do sistema:", error);
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function runMaintenance() {
  ensureSeedAdmin();
  removeRecordsWithoutUsers();
  state.metadata.lastActiveDate = getDateKey();
  saveState();
}

function ensureSeedAdmin() {
  const hasAdmin = state.users.some((user) => user.role === "admin");
  if (!hasAdmin) {
    state.users.unshift({
      ...DEFAULT_ADMIN,
      id: cryptoSafeId("admin"),
      createdAt: new Date().toISOString(),
    });
  }
}

function removeRecordsWithoutUsers() {
  const validIds = new Set(state.users.map((user) => user.id));
  state.records = state.records.filter((record) => validIds.has(record.userId));
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

  window.setInterval(() => {
    runMaintenance();
    renderApp();
  }, 60000);
}

function handleLogin(event) {
  event.preventDefault();
  clearMessage(els.loginMessage);

  const username = els.loginUsername.value.trim().toLowerCase();
  const password = els.loginPassword.value.trim();
  const user = state.users.find(
    (item) => item.username.toLowerCase() === username && item.password === password,
  );

  if (!user) {
    showMessage(els.loginMessage, "Usuario ou senha invalidos.", "error");
    return;
  }

  state.sessionUserId = user.id;
  saveState();
  els.loginForm.reset();
  renderApp();
}

async function handleFarmSubmit(event) {
  event.preventDefault();
  clearMessage(els.farmMessage);

  const user = getCurrentUser();
  if (!user) {
    logout();
    return;
  }

  const payload = {
    farmType: els.farmType.value.trim(),
    materialsReceived: Number(els.materialsReceived.value),
    dirtyMoney: Number(els.dirtyMoney.value),
    materialsRemaining: Number(els.materialsRemaining.value),
    file: els.chestPrint.files[0],
  };

  const validationError = validateFarmPayload(payload);
  if (validationError) {
    showMessage(els.farmMessage, validationError, "error");
    return;
  }

  try {
    const now = new Date();
    const imageData = await fileToDataUrl(payload.file);
    const dateKey = getDateKey(now);
    const recordId = getRecordIdForDate(user.id, dateKey);
    const newRecord = {
      id: recordId || cryptoSafeId("record"),
      userId: user.id,
      memberName: user.name,
      farmType: payload.farmType,
      materialsReceived: payload.materialsReceived,
      dirtyMoney: payload.dirtyMoney,
      materialsRemaining: payload.materialsRemaining,
      imageData,
      status: "Entregue",
      dateKey,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const existingIndex = state.records.findIndex((record) => record.id === recordId);
    if (existingIndex >= 0) {
      state.records[existingIndex] = newRecord;
      showMessage(els.farmMessage, "Entrega atualizada com sucesso.", "success");
    } else {
      state.records.push(newRecord);
      showMessage(els.farmMessage, "Entrega registrada com sucesso.", "success");
    }

    saveState();
    resetFarmForm();
    renderApp();
  } catch (error) {
    console.error(error);
    showMessage(els.farmMessage, "Nao foi possivel processar a imagem enviada.", "error");
  }
}

function handleMemberSubmit(event) {
  event.preventDefault();
  if (!isAdmin()) return;

  clearMessage(els.memberMessage);

  const editingId = els.memberId.value.trim();
  const payload = {
    name: els.memberName.value.trim(),
    username: els.memberUsername.value.trim(),
    password: els.memberPassword.value.trim(),
    role: els.memberRole.value,
  };

  const validationError = validateMemberPayload(payload, editingId);
  if (validationError) {
    showMessage(els.memberMessage, validationError, "error");
    return;
  }

  if (editingId) {
    const user = state.users.find((item) => item.id === editingId);
    if (!user) {
      showMessage(els.memberMessage, "Membro nao encontrado para edicao.", "error");
      return;
    }

    user.name = payload.name;
    user.username = payload.username;
    user.password = payload.password;
    user.role = payload.role;
    syncRecordNames(user.id, user.name);
    showMessage(els.memberMessage, "Membro atualizado com sucesso.", "success");
  } else {
    state.users.push({
      id: cryptoSafeId("user"),
      name: payload.name,
      username: payload.username,
      password: payload.password,
      role: payload.role,
      createdAt: new Date().toISOString(),
    });
    showMessage(els.memberMessage, "Membro cadastrado com sucesso.", "success");
  }

  saveState();
  resetMemberForm();
  renderApp();
}

function handleMemberActions(event) {
  if (!isAdmin()) return;

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const userId = actionButton.dataset.userId;
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;

  if (action === "edit") {
    els.memberId.value = user.id;
    els.memberName.value = user.name;
    els.memberUsername.value = user.username;
    els.memberPassword.value = user.password;
    els.memberRole.value = user.role;
    els.memberFormMode.textContent = `Editando ${user.name}`;
    clearMessage(els.memberMessage);
    return;
  }

  if (action === "delete") {
    if (user.id === getCurrentUser()?.id) {
      showMessage(els.memberMessage, "Nao e permitido excluir a conta em uso.", "error");
      return;
    }

    const adminCount = state.users.filter((item) => item.role === "admin").length;
    if (user.role === "admin" && adminCount <= 1) {
      showMessage(els.memberMessage, "Mantenha pelo menos um administrador ativo.", "error");
      return;
    }

    const confirmed = window.confirm(`Excluir o membro ${user.name} e todos os registros dele?`);
    if (!confirmed) return;

    state.users = state.users.filter((item) => item.id !== user.id);
    state.records = state.records.filter((record) => record.userId !== user.id);
    saveState();
    resetMemberForm();
    showMessage(els.memberMessage, "Membro excluido com sucesso.", "success");
    renderApp();
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

function renderApp() {
  const user = getCurrentUser();
  const loggedIn = Boolean(user);

  els.authView.classList.toggle("hidden", loggedIn);
  els.appView.classList.toggle("hidden", !loggedIn);

  if (!loggedIn) return;

  renderShell(user);
  renderFarmForm(user);
  renderDailyStatus();
  renderMemberHistory(user);

  if (user.role === "admin") {
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
  const memberDeliveredToday = hasDeliveredToday(user.id);

  els.sidebarDateLabel.textContent = `${formatDate(today)} · ${capitalize(getWeekdayLabel(today))}`;
  els.sidebarModeLabel.textContent = isRequiredDay(today) ? "Meta obrigatoria" : "Meta opcional";
  els.sidebarUserName.textContent = user.name;
  els.sidebarUserRole.textContent = user.role === "admin" ? "Administrador" : "Membro";
  els.pageTitle.textContent = user.role === "admin" ? "Painel Administrativo" : "Painel do Membro";
  els.pageSubtitle.textContent = user.role === "admin"
    ? "Visao completa de registros, ranking semanal, pendencias e gestao de membros."
    : "Registre sua meta diaria, envie o print do bau e acompanhe seu proprio historico.";

  els.requiredBadge.textContent = isRequiredDay(today) ? "Obrigatorio hoje" : "Opcional hoje";
  els.deliveryBadge.textContent = memberDeliveredToday ? "Sua entrega esta registrada" : "Sua entrega ainda esta pendente";

  els.miniDelivered.textContent = String(todayRecords.length);
  els.miniPending.textContent = String(pending.length);
  els.miniWeekly.textContent = String(weeklyRecords.length);

  els.heroObligation.textContent = isRequiredDay(today) ? "Entrega obrigatoria" : "Entrega opcional";
  els.heroObligationDescription.textContent = isRequiredDay(today)
    ? "Segunda a sexta todos os membros precisam registrar a meta do dia."
    : "Sabado e domingo continuam contando no ranking, mas nao geram pendencia.";

  els.heroDirtyMoney.textContent = formatMoney(sumBy(todayRecords, "dirtyMoney"));
  els.heroTopMember.textContent = topMember ? topMember.memberName : "Sem entregas";
  els.heroTopMemberDescription.textContent = topMember
    ? `${topMember.deliveries} entrega(s) na semana atual.`
    : "O ranking sera preenchido assim que os registros forem enviados.";
  els.heroMissedCount.textContent = String(pending.length);
  els.missingSummary.textContent = isRequiredDay(today)
    ? `${pending.length} pendencia(s) no dia`
    : "Fim de semana sem obrigatoriedade";
}

function renderFarmForm(user) {
  els.farmMemberName.value = user.name;
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
        <td>${escapeHtml(row.name)}</td>
        <td><span class="status-chip ${row.statusClass}">${escapeHtml(row.status)}</span></td>
        <td>${escapeHtml(row.farmType)}</td>
        <td>${escapeHtml(row.dateLabel)}</td>
      </tr>
    `)
    .join("");
}

function renderMemberHistory(user) {
  const ownRecords = state.records
    .filter((record) => record.userId === user.id)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  const weeklyCount = ownRecords.filter((record) => isSameWeek(record.dateKey, getWeekKey())).length;
  els.memberHistorySummary.textContent = `${weeklyCount} entrega(s) nesta semana`;

  if (!ownRecords.length) {
    els.memberHistoryBody.innerHTML = emptyRow(6, "Nenhuma entrega encontrada para esta conta.");
    return;
  }

  els.memberHistoryBody.innerHTML = ownRecords
    .map((record) => `
      <tr>
        <td>${escapeHtml(formatDateTime(new Date(record.updatedAt)))}</td>
        <td>${escapeHtml(record.farmType)}</td>
        <td>${escapeHtml(formatMoney(record.dirtyMoney))}</td>
        <td>${escapeHtml(String(record.materialsRemaining))}</td>
        <td>
          <button class="thumb-button" type="button" data-image="${encodeURIComponent(record.imageData)}">
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
  const records = [...state.records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

  if (!records.length) {
    els.recordsBody.innerHTML = emptyRow(7, "Nenhum registro encontrado.");
    return;
  }

  els.recordsBody.innerHTML = records
    .map((record) => `
      <tr>
        <td>${escapeHtml(record.memberName)}</td>
        <td>${escapeHtml(record.farmType)}</td>
        <td>${escapeHtml(formatMoney(record.dirtyMoney))}</td>
        <td>${escapeHtml(String(record.materialsRemaining))}</td>
        <td>
          <button class="thumb-button" type="button" data-image="${encodeURIComponent(record.imageData)}">
            Ver print
          </button>
        </td>
        <td><span class="status-chip status-delivered">${escapeHtml(record.status)}</span></td>
        <td>${escapeHtml(formatDateTime(new Date(record.updatedAt)))}</td>
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
        <span class="ranking-position">${index + 1}º</span>
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
        <strong>${escapeHtml(user.name)}</strong>
        <p>${isRequiredDay() ? "Ainda nao registrou a meta do dia." : "Sem entrega registrada, mas hoje e opcional."}</p>
      </article>
    `)
    .join("");
}

function renderMembersTable() {
  const users = [...state.users].sort((left, right) => left.name.localeCompare(right.name));
  els.memberCounter.textContent = `${users.length} membro(s)`;

  els.membersBody.innerHTML = users
    .map((user) => `
      <tr>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.username)}</td>
        <td>${escapeHtml(user.role === "admin" ? "Admin" : "Membro")}</td>
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

function getCurrentUser() {
  return state.users.find((user) => user.id === state.sessionUserId) || null;
}

function isAdmin() {
  return getCurrentUser()?.role === "admin";
}

function logout() {
  state.sessionUserId = "";
  saveState();
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
  els.memberRole.value = "member";
  els.memberFormMode.textContent = "Novo cadastro";
}

function validateFarmPayload(payload) {
  if (!payload.farmType) return "Selecione o tipo de farm.";
  if (!Number.isFinite(payload.materialsReceived) || payload.materialsReceived <= 0) {
    return "Informe os materiais recebidos corretamente.";
  }
  if (!Number.isFinite(payload.dirtyMoney) || payload.dirtyMoney < 0) {
    return "Informe o valor do dinheiro sujo.";
  }
  if (!Number.isFinite(payload.materialsRemaining) || payload.materialsRemaining < 0) {
    return "Informe os materiais restantes corretamente.";
  }
  if (!payload.file) return "O print do bau e obrigatorio.";
  if (!payload.file.type.startsWith("image/")) return "Envie uma imagem valida para o print.";
  return "";
}

function validateMemberPayload(payload, editingId) {
  if (!payload.name) return "Informe o nome do membro.";
  if (!payload.username) return "Informe o usuario da conta.";
  if (!payload.password) return "Informe a senha da conta.";
  if (!payload.role) return "Selecione o tipo de conta.";

  const usernameTaken = state.users.some(
    (user) => user.username.toLowerCase() === payload.username.toLowerCase() && user.id !== editingId,
  );

  if (usernameTaken) return "Ja existe um membro usando esse usuario.";
  return "";
}

function syncRecordNames(userId, newName) {
  state.records.forEach((record) => {
    if (record.userId === userId) record.memberName = newName;
  });
}

function getRecordIdForDate(userId, dateKey) {
  return state.records.find((record) => record.userId === userId && record.dateKey === dateKey)?.id || "";
}

function hasDeliveredToday(userId) {
  const todayKey = getDateKey();
  return state.records.some((record) => record.userId === userId && record.dateKey === todayKey);
}

function getTodayRecords() {
  const todayKey = getDateKey();
  return state.records.filter((record) => record.dateKey === todayKey);
}

function getCurrentWeekRecords() {
  const currentWeekKey = getWeekKey();
  return state.records.filter((record) => isSameWeek(record.dateKey, currentWeekKey));
}

function getPendingMembers() {
  if (!isRequiredDay()) return [];

  const todayKey = getDateKey();
  return state.users.filter((user) => {
    if (user.role !== "member") return false;
    return !state.records.some((record) => record.userId === user.id && record.dateKey === todayKey);
  });
}

function getDailyStatusRows() {
  const dateLabel = formatDate(new Date());
  return state.users
    .filter((user) => user.role === "member")
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((user) => {
      const record = state.records.find((item) => item.userId === user.id && item.dateKey === getDateKey());
      if (record) {
        return {
          name: user.name,
          status: "Entregue",
          statusClass: "status-delivered",
          farmType: record.farmType,
          dateLabel: formatDateTime(new Date(record.updatedAt)),
        };
      }

      if (!isRequiredDay()) {
        return {
          name: user.name,
          status: "Opcional",
          statusClass: "status-optional",
          farmType: "-",
          dateLabel,
        };
      }

      return {
        name: user.name,
        status: "Nao entregou",
        statusClass: "status-missed",
        farmType: "-",
        dateLabel,
      };
    });
}

function computeRanking(records) {
  const members = state.users.filter((user) => user.role === "member");
  const counter = members.map((user) => ({
    userId: user.id,
    memberName: user.name,
    deliveries: 0,
  }));

  records.forEach((record) => {
    const entry = counter.find((item) => item.userId === record.userId);
    if (entry) entry.deliveries += 1;
  });

  return counter.sort(
    (left, right) => right.deliveries - left.deliveries || left.memberName.localeCompare(right.memberName),
  );
}

function buildWeeklyArchive() {
  const grouped = new Map();

  state.records.forEach((record) => {
    const weekKey = getWeekKey(new Date(`${record.dateKey}T00:00:00`));
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
        totalDirtyMoney: sumBy(records, "dirtyMoney"),
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

function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "form-message";
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

function cryptoSafeId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
