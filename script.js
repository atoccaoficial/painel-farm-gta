const STORAGE_KEY = "painel-farm-gta-rp";
const membros = [
  "Nome1",
  "Nome2",
  "Nome3",
  "Nome4",
  "Nome5",
];

const state = loadState();

const els = {
  currentDateLabel: document.getElementById("currentDateLabel"),
  currentDayMode: document.getElementById("currentDayMode"),
  sidebarDelivered: document.getElementById("sidebarDelivered"),
  sidebarPending: document.getElementById("sidebarPending"),
  sidebarWeeklyTotal: document.getElementById("sidebarWeeklyTotal"),
  memberListSidebar: document.getElementById("memberListSidebar"),
  heroObligation: document.getElementById("heroObligation"),
  heroObligationDescription: document.getElementById("heroObligationDescription"),
  heroDirtyMoney: document.getElementById("heroDirtyMoney"),
  heroMaterialsReceived: document.getElementById("heroMaterialsReceived"),
  heroTopMember: document.getElementById("heroTopMember"),
  heroTopMemberDescription: document.getElementById("heroTopMemberDescription"),
  memberName: document.getElementById("memberName"),
  farmType: document.getElementById("farmType"),
  materialsReceived: document.getElementById("materialsReceived"),
  dirtyMoney: document.getElementById("dirtyMoney"),
  materialsRemaining: document.getElementById("materialsRemaining"),
  chestPrint: document.getElementById("chestPrint"),
  fileStatus: document.getElementById("fileStatus"),
  autoDateField: document.getElementById("autoDateField"),
  farmForm: document.getElementById("farmForm"),
  clearFormButton: document.getElementById("clearFormButton"),
  formMessage: document.getElementById("formMessage"),
  requiredTag: document.getElementById("requiredTag"),
  dailyStatusTable: document.getElementById("dailyStatusTable"),
  recordsTable: document.getElementById("recordsTable"),
  rankingList: document.getElementById("rankingList"),
  weeklyInsights: document.getElementById("weeklyInsights"),
  historyGrid: document.getElementById("historyGrid"),
  exportButton: document.getElementById("exportButton"),
  resetButton: document.getElementById("resetButton"),
  imageModal: document.getElementById("imageModal"),
  modalImage: document.getElementById("modalImage"),
  closeModalButton: document.getElementById("closeModalButton"),
};

initialize();

function initialize() {
  seedMembers();
  syncDayState();
  renderMemberOptions();
  bindEvents();
  render();
}

function loadState() {
  const fallback = {
    members: [...membros],
    recordsByDate: {},
    weeklyHistory: {},
    lastKnownDate: "",
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return fallback;

    return {
      members: Array.isArray(saved.members) && saved.members.length ? saved.members : [...membros],
      recordsByDate: saved.recordsByDate && typeof saved.recordsByDate === "object" ? saved.recordsByDate : {},
      weeklyHistory: saved.weeklyHistory && typeof saved.weeklyHistory === "object" ? saved.weeklyHistory : {},
      lastKnownDate: typeof saved.lastKnownDate === "string" ? saved.lastKnownDate : "",
    };
  } catch (error) {
    console.error("Falha ao carregar dados do painel:", error);
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seedMembers() {
  const uniqueMembers = [...new Set([...membros, ...(state.members || [])])];
  state.members = uniqueMembers;
  saveState();
}

function getNow() {
  return new Date();
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

function getDateKey(date = getNow()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date = getNow()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekKey(date = getNow()) {
  return getDateKey(getStartOfWeek(date));
}

function getDayLabel(date = getNow()) {
  return date.toLocaleDateString("pt-BR", { weekday: "long" });
}

function isRequiredDay(date = getNow()) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function getDayModeText(date = getNow()) {
  return isRequiredDay(date) ? "Meta obrigatoria" : "Meta opcional";
}

function syncDayState() {
  const today = getNow();
  const todayKey = getDateKey(today);

  if (state.lastKnownDate && state.lastKnownDate !== todayKey) {
    archiveCompletedWeeks(today);
  }

  state.lastKnownDate = todayKey;
  ensureDateBucket(todayKey);
  ensureWeeklyHistorySlot(getWeekKey(today));
  saveState();
}

function archiveCompletedWeeks(referenceDate) {
  const activeWeekKey = getWeekKey(referenceDate);
  const grouped = groupRecordsByWeek();

  Object.entries(grouped).forEach(([weekKey, records]) => {
    if (weekKey === activeWeekKey) return;
    if (!state.weeklyHistory[weekKey]) {
      state.weeklyHistory[weekKey] = buildWeekSnapshot(weekKey, records);
    }
  });
}

function groupRecordsByWeek() {
  return Object.entries(state.recordsByDate).reduce((accumulator, [dateKey, records]) => {
    const weekKey = getWeekKey(new Date(`${dateKey}T00:00:00`));
    if (!accumulator[weekKey]) accumulator[weekKey] = [];
    accumulator[weekKey].push(...records);
    return accumulator;
  }, {});
}

function ensureDateBucket(dateKey) {
  if (!state.recordsByDate[dateKey]) {
    state.recordsByDate[dateKey] = [];
  }
}

function ensureWeeklyHistorySlot(weekKey) {
  if (!state.weeklyHistory[weekKey]) {
    state.weeklyHistory[weekKey] = buildWeekSnapshot(weekKey, getCurrentWeekRecords());
  }
}

function buildWeekSnapshot(weekKey, records) {
  const ranking = computeRanking(records);
  const dirtyMoney = records.reduce((total, record) => total + Number(record.dirtyMoney || 0), 0);
  const totalDeliveries = records.length;

  return {
    weekKey,
    ranking,
    dirtyMoney,
    totalDeliveries,
    updatedAt: new Date().toISOString(),
  };
}

function getCurrentWeekRecords() {
  const currentWeekKey = getWeekKey();
  return Object.entries(state.recordsByDate)
    .filter(([dateKey]) => getWeekKey(new Date(`${dateKey}T00:00:00`)) === currentWeekKey)
    .flatMap(([, records]) => records);
}

function computeRanking(records) {
  const counter = state.members.reduce((accumulator, member) => {
    accumulator[member] = 0;
    return accumulator;
  }, {});

  records.forEach((record) => {
    counter[record.memberName] = (counter[record.memberName] || 0) + 1;
  });

  return Object.entries(counter)
    .map(([member, deliveries]) => ({ member, deliveries }))
    .sort((left, right) => right.deliveries - left.deliveries || left.member.localeCompare(right.member));
}

function getTodayRecords() {
  return state.recordsByDate[getDateKey()] || [];
}

function getDailyStatuses() {
  const records = getTodayRecords();
  const dateLabel = formatDate(getNow());
  const required = isRequiredDay();

  return state.members.map((member) => {
    const record = records.find((item) => item.memberName === member);

    if (record) {
      return {
        member,
        status: "Entregue",
        statusClass: "status-delivered",
        farmType: record.farmType,
        date: record.dateLabel,
      };
    }

    if (!required) {
      return {
        member,
        status: "Opcional",
        statusClass: "status-optional",
        farmType: "-",
        date: dateLabel,
      };
    }

    return {
      member,
      status: "Nao entregou",
      statusClass: "status-missed",
      farmType: "-",
      date: dateLabel,
    };
  });
}

function renderMemberOptions() {
  els.memberName.innerHTML = ['<option value="">Selecione</option>']
    .concat(state.members.map((member) => `<option value="${escapeHtml(member)}">${escapeHtml(member)}</option>`))
    .join("");

  els.memberListSidebar.innerHTML = state.members
    .map((member) => `<span class="member-pill">${escapeHtml(member)}</span>`)
    .join("");
}

function render() {
  syncDayState();
  renderHeaderInfo();
  renderDailyStatuses();
  renderRecordsTable();
  renderRanking();
  renderWeeklyInsights();
  renderHistory();
  updateWeeklySnapshot();
}

function renderHeaderInfo() {
  const now = getNow();
  const todayRecords = getTodayRecords();
  const dailyStatuses = getDailyStatuses();
  const currentWeekRecords = getCurrentWeekRecords();
  const ranking = computeRanking(currentWeekRecords);
  const topMember = ranking.find((entry) => entry.deliveries > 0);

  els.currentDateLabel.textContent = `${formatDate(now)} · ${capitalize(getDayLabel(now))}`;
  els.currentDayMode.textContent = getDayModeText(now);
  els.autoDateField.textContent = formatDateTime(now);
  els.requiredTag.textContent = isRequiredDay(now) ? "Obrigatorio" : "Opcional";
  els.heroObligation.textContent = isRequiredDay(now) ? "Obrigatorio" : "Opcional";
  els.heroObligationDescription.textContent = isRequiredDay(now)
    ? "Hoje exige entrega com print do bau e status automatico."
    : "Hoje o registro e opcional, mas segue contabilizando no ranking.";

  els.sidebarDelivered.textContent = String(todayRecords.length);
  els.sidebarPending.textContent = String(dailyStatuses.filter((status) => status.status === "Nao entregou").length);
  els.sidebarWeeklyTotal.textContent = String(currentWeekRecords.length);

  els.heroDirtyMoney.textContent = formatMoney(
    todayRecords.reduce((total, record) => total + Number(record.dirtyMoney || 0), 0),
  );
  els.heroMaterialsReceived.textContent = String(
    todayRecords.reduce((total, record) => total + Number(record.materialsReceived || 0), 0),
  );

  els.heroTopMember.textContent = topMember ? topMember.member : "Sem entregas";
  els.heroTopMemberDescription.textContent = topMember
    ? `${topMember.deliveries} entrega(s) registradas nesta semana.`
    : "O ranking semanal sera atualizado automaticamente.";
}

function renderDailyStatuses() {
  const rows = getDailyStatuses();

  els.dailyStatusTable.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.member)}</td>
          <td><span class="status-chip ${row.statusClass}">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.farmType)}</td>
          <td>${escapeHtml(row.date)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderRecordsTable() {
  const records = [...getCurrentWeekRecords()].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  if (!records.length) {
    els.recordsTable.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">Nenhuma entrega registrada na semana atual.</div>
        </td>
      </tr>
    `;
    return;
  }

  els.recordsTable.innerHTML = records
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.memberName)}</td>
          <td>${escapeHtml(record.farmType)}</td>
          <td>${formatMoney(record.dirtyMoney)}</td>
          <td>${escapeHtml(String(record.materialsRemaining))}</td>
          <td>
            <button class="thumb-button" type="button" data-image="${encodeURIComponent(record.imageData)}">
              Ver print
            </button>
          </td>
          <td><span class="status-chip status-delivered">${escapeHtml(record.status)}</span></td>
          <td>${escapeHtml(record.dateLabel)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderRanking() {
  const ranking = computeRanking(getCurrentWeekRecords());
  const hasDeliveries = ranking.some((entry) => entry.deliveries > 0);

  if (!hasDeliveries) {
    els.rankingList.innerHTML = `<div class="ranking-empty">Ainda nao houve entregas nesta semana.</div>`;
    return;
  }

  els.rankingList.innerHTML = ranking
    .filter((entry) => entry.deliveries > 0)
    .map(
      (entry, index) => `
        <article class="ranking-item">
          <span class="ranking-position">${index + 1}º</span>
          <div>
            <strong>${escapeHtml(entry.member)}</strong>
            <div class="insight-note">${entry.deliveries} entrega(s) contabilizadas</div>
          </div>
          <div class="ranking-meta">
            <strong>${entry.deliveries}</strong>
            <div class="insight-note">na semana</div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderWeeklyInsights() {
  const records = getCurrentWeekRecords();
  const totalDirtyMoney = records.reduce((total, record) => total + Number(record.dirtyMoney || 0), 0);
  const totalMaterialsRemaining = records.reduce((total, record) => total + Number(record.materialsRemaining || 0), 0);
  const mostCommonFarm = getMostCommonFarm(records);
  const requiredDaysCount = countRequiredDaysPassedThisWeek();

  const items = [
    {
      title: `${records.length} entrega(s)`,
      body: "Total registrado na semana atual, com atualizacao automatica a cada novo envio.",
    },
    {
      title: formatMoney(totalDirtyMoney),
      body: "Soma do dinheiro sujo arrecadado nos farms entregues durante a semana.",
    },
    {
      title: `${totalMaterialsRemaining} restantes`,
      body: "Acumulado dos materiais restantes informados pelos membros nos registros.",
    },
    {
      title: mostCommonFarm || "Sem destaque",
      body: `Tipo de farm mais recorrente na semana. Dias obrigatorios decorridos: ${requiredDaysCount}.`,
    },
  ];

  els.weeklyInsights.innerHTML = items
    .map(
      (item) => `
        <article class="insight-item">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `,
    )
    .join("");
}

function renderHistory() {
  const archivedWeeks = buildHistoryCards();

  if (!archivedWeeks.length) {
    els.historyGrid.innerHTML = `<div class="empty-state">O historico semanal aparecera automaticamente conforme novas semanas forem concluídas.</div>`;
    return;
  }

  els.historyGrid.innerHTML = archivedWeeks
    .map(
      (week) => `
        <article class="history-card">
          <span class="history-period">Semana iniciada em ${escapeHtml(formatWeekKey(week.weekKey))}</span>
          <strong>${week.topMember ? `${escapeHtml(week.topMember.member)} liderou` : "Sem entregas registradas"}</strong>
          <p>Total de entregas: ${escapeHtml(String(week.totalDeliveries))}</p>
          <p>Dinheiro sujo: ${escapeHtml(formatMoney(week.dirtyMoney))}</p>
          <p>Atualizado em: ${escapeHtml(week.updatedAtLabel)}</p>
        </article>
      `,
    )
    .join("");
}

function buildHistoryCards() {
  const currentWeekKey = getWeekKey();
  const snapshots = [];

  Object.entries(state.weeklyHistory).forEach(([weekKey, snapshot]) => {
    if (weekKey === currentWeekKey) {
      snapshot = buildWeekSnapshot(weekKey, getCurrentWeekRecords());
    }

    snapshots.push({
      weekKey,
      totalDeliveries: snapshot.totalDeliveries || 0,
      dirtyMoney: snapshot.dirtyMoney || 0,
      updatedAtLabel: formatDateTime(new Date(snapshot.updatedAt || new Date().toISOString())),
      topMember: Array.isArray(snapshot.ranking) ? snapshot.ranking.find((entry) => entry.deliveries > 0) : null,
    });
  });

  return snapshots.sort((left, right) => right.weekKey.localeCompare(left.weekKey));
}

function updateWeeklySnapshot() {
  const weekKey = getWeekKey();
  state.weeklyHistory[weekKey] = buildWeekSnapshot(weekKey, getCurrentWeekRecords());
  saveState();
}

function bindEvents() {
  els.farmForm.addEventListener("submit", handleSubmit);
  els.clearFormButton.addEventListener("click", clearForm);
  els.chestPrint.addEventListener("change", handleFilePreview);
  els.exportButton.addEventListener("click", exportData);
  els.resetButton.addEventListener("click", resetSystem);
  els.recordsTable.addEventListener("click", handleRecordsTableClick);
  els.closeModalButton.addEventListener("click", closeModal);
  els.imageModal.addEventListener("click", (event) => {
    if (event.target.dataset.closeModal === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  window.setInterval(() => {
    const currentDateKey = getDateKey();
    if (currentDateKey !== state.lastKnownDate) {
      syncDayState();
      render();
      clearFormMessage();
    } else {
      renderHeaderInfo();
    }
  }, 60000);
}

async function handleSubmit(event) {
  event.preventDefault();
  clearFormMessage();

  const payload = getFormValues();
  const validationError = validateForm(payload);

  if (validationError) {
    showFormMessage(validationError, "error");
    return;
  }

  const todayKey = getDateKey();
  ensureDateBucket(todayKey);

  try {
    const imageData = await fileToDataUrl(payload.file);
    const now = getNow();
    const existingIndex = state.recordsByDate[todayKey].findIndex((record) => record.memberName === payload.memberName);
    const record = {
      id: typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${todayKey}-${payload.memberName}-${Date.now()}`,
      memberName: payload.memberName,
      farmType: payload.farmType,
      materialsReceived: payload.materialsReceived,
      dirtyMoney: payload.dirtyMoney,
      materialsRemaining: payload.materialsRemaining,
      imageData,
      status: "Entregue",
      createdAt: now.toISOString(),
      dateKey: todayKey,
      dateLabel: formatDateTime(now),
    };

    if (existingIndex >= 0) {
      state.recordsByDate[todayKey][existingIndex] = record;
      showFormMessage("Entrega atualizada com sucesso para o membro selecionado.", "success");
    } else {
      state.recordsByDate[todayKey].push(record);
      showFormMessage("Entrega registrada com sucesso e contabilizada no ranking semanal.", "success");
    }

    updateWeeklySnapshot();
    saveState();
    clearForm();
    render();
  } catch (error) {
    console.error(error);
    showFormMessage("Nao foi possivel processar a imagem enviada. Tente novamente.", "error");
  }
}

function getFormValues() {
  return {
    memberName: els.memberName.value.trim(),
    farmType: els.farmType.value.trim(),
    materialsReceived: Number(els.materialsReceived.value),
    dirtyMoney: Number(els.dirtyMoney.value),
    materialsRemaining: Number(els.materialsRemaining.value),
    file: els.chestPrint.files[0],
  };
}

function validateForm(payload) {
  if (!payload.memberName) return "Selecione o nome do membro.";
  if (!payload.farmType) return "Selecione o tipo de farm.";
  if (!Number.isFinite(payload.materialsReceived) || payload.materialsReceived <= 0) return "Informe materiais recebidos validos.";
  if (!Number.isFinite(payload.dirtyMoney) || payload.dirtyMoney < 0) return "Informe um valor valido para o dinheiro sujo.";
  if (!Number.isFinite(payload.materialsRemaining) || payload.materialsRemaining < 0) return "Informe os materiais restantes corretamente.";
  if (!payload.file) return "O print do bau e obrigatorio para concluir o registro.";
  if (!payload.file.type.startsWith("image/")) return "Envie um arquivo de imagem valido.";
  return "";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao ler a imagem selecionada."));
    reader.readAsDataURL(file);
  });
}

function handleFilePreview() {
  const file = els.chestPrint.files[0];
  els.fileStatus.textContent = file ? file.name : "Nenhum arquivo selecionado";
}

function clearForm() {
  els.farmForm.reset();
  els.materialsReceived.value = 200;
  els.fileStatus.textContent = "Nenhum arquivo selecionado";
}

function showFormMessage(message, type) {
  els.formMessage.textContent = message;
  els.formMessage.className = `toast-message ${type}`;
}

function clearFormMessage() {
  els.formMessage.textContent = "";
  els.formMessage.className = "toast-message";
}

function handleRecordsTableClick(event) {
  const button = event.target.closest("[data-image]");
  if (!button) return;

  const imageData = decodeURIComponent(button.dataset.image);
  openModal(imageData);
}

function openModal(imageSrc) {
  els.modalImage.src = imageSrc;
  els.imageModal.classList.add("is-open");
  els.imageModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  els.imageModal.classList.remove("is-open");
  els.imageModal.setAttribute("aria-hidden", "true");
  els.modalImage.src = "";
}

function exportData() {
  const payload = {
    generatedAt: new Date().toISOString(),
    currentWeekKey: getWeekKey(),
    members: state.members,
    recordsByDate: state.recordsByDate,
    weeklyHistory: state.weeklyHistory,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `painel-farm-backup-${getDateKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetSystem() {
  const confirmed = window.confirm("Tem certeza que deseja limpar todos os registros e historicos salvos neste navegador?");
  if (!confirmed) return;

  state.recordsByDate = {};
  state.weeklyHistory = {};
  state.lastKnownDate = "";
  clearForm();
  clearFormMessage();
  syncDayState();
  saveState();
  render();
}

function getMostCommonFarm(records) {
  if (!records.length) return "";

  const counts = records.reduce((accumulator, record) => {
    accumulator[record.farmType] = (accumulator[record.farmType] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0];
}

function countRequiredDaysPassedThisWeek() {
  const start = getStartOfWeek();
  const today = getNow();
  let total = 0;

  for (let date = new Date(start); date <= today; date.setDate(date.getDate() + 1)) {
    if (isRequiredDay(date)) total += 1;
  }

  return total;
}

function formatWeekKey(weekKey) {
  return formatDate(new Date(`${weekKey}T00:00:00`));
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
