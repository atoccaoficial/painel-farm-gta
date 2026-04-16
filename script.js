const STORAGE_KEY = "painel-fazenda-gta";
const SESSION_KEY = `${STORAGE_KEY}:sessionUserId`;
const LEGACY_STORAGE_KEYS = ["painel-farm-gta-rp", "painel-fazenda-gta-rp-v2"];
const PRINT_BUCKET = "farm-prints";
const DEFAULT_SUPABASE_CONFIG = {
  url: "https://leypzjulxksqhxzuzjjb.supabase.co",
  anonKey: "sb_publishable_KFdDoU5eXIwtU5wAIK_MOg_qVKqSlfs",
};
const DEFAULT_ADMIN = { nome: "Administrador", usuario: "admin", senha: "123456", tipo: "admin" };

const state = { supabase: null, users: [], records: [], routeRecords: [], currentUser: null, isConfigured: false, loading: false, activeTab: "farm" };

const els = {
  authView: document.getElementById("authView"),
  appView: document.getElementById("appView"),
  adminSection: document.getElementById("adminSection"),
  adminRouteSection: document.getElementById("adminRouteSection"),
  reportsSection: document.getElementById("reportsSection"),
  farmTabView: document.getElementById("farmTabView"),
  routeTabView: document.getElementById("routeTabView"),
  reportsTabView: document.getElementById("reportsTabView"),
  farmTabButton: document.getElementById("farmTabButton"),
  routeTabButton: document.getElementById("routeTabButton"),
  reportsTabButton: document.getElementById("reportsTabButton"),
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
  heroObligationCard: document.getElementById("heroObligationCard"),
  heroObligation: document.getElementById("heroObligation"),
  heroObligationDescription: document.getElementById("heroObligationDescription"),
  heroDirtyMoneyLabel: document.getElementById("heroDirtyMoneyLabel"),
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
  memberHistorySection: document.getElementById("memberHistorySection"),
  dailyStatusBody: document.getElementById("dailyStatusBody"),
  memberHistoryBody: document.getElementById("memberHistoryBody"),
  memberHistorySummary: document.getElementById("memberHistorySummary"),
  recordsBody: document.getElementById("recordsBody"),
  rankingList: document.getElementById("rankingList"),
  missingList: document.getElementById("missingList"),
  missingSummary: document.getElementById("missingSummary"),
  routeForm: document.getElementById("routeForm"),
  routeMemberName: document.getElementById("routeMemberName"),
  routePrint: document.getElementById("routePrint"),
  routeFileLabel: document.getElementById("routeFileLabel"),
  routeAutoDate: document.getElementById("routeAutoDate"),
  routeMessage: document.getElementById("routeMessage"),
  clearRouteFormButton: document.getElementById("clearRouteFormButton"),
  routeSummaryBadge: document.getElementById("routeSummaryBadge"),
  routeSummaryList: document.getElementById("routeSummaryList"),
  routeMissingSummary: document.getElementById("routeMissingSummary"),
  routeStatusBody: document.getElementById("routeStatusBody"),
  routeMissingList: document.getElementById("routeMissingList"),
  routeHistorySection: document.getElementById("routeHistorySection"),
  routeHistoryBody: document.getElementById("routeHistoryBody"),
  routeHistorySummary: document.getElementById("routeHistorySummary"),
  routeRecordsBody: document.getElementById("routeRecordsBody"),
  routeRankingList: document.getElementById("routeRankingList"),
  farmExportStart: document.getElementById("farmExportStart"),
  farmExportEnd: document.getElementById("farmExportEnd"),
  farmExportMember: document.getElementById("farmExportMember"),
  exportFarmPeriodButton: document.getElementById("exportFarmPeriodButton"),
  resetFarmMonthButton: document.getElementById("resetFarmMonthButton"),
  routeExportStart: document.getElementById("routeExportStart"),
  routeExportEnd: document.getElementById("routeExportEnd"),
  routeExportMember: document.getElementById("routeExportMember"),
  exportRoutePeriodButton: document.getElementById("exportRoutePeriodButton"),
  resetRouteMonthButton: document.getElementById("resetRouteMonthButton"),
  cleanupScope: document.getElementById("cleanupScope"),
  cleanupStart: document.getElementById("cleanupStart"),
  cleanupEnd: document.getElementById("cleanupEnd"),
  cleanupPeriodButton: document.getElementById("cleanupPeriodButton"),
  cleanupAllButton: document.getElementById("cleanupAllButton"),
  cleanupMessage: document.getElementById("cleanupMessage"),
  migrateLegacyPrintsButton: document.getElementById("migrateLegacyPrintsButton"),
  migrationMessage: document.getElementById("migrationMessage"),
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
  exportMembersExcelButton: document.getElementById("exportMembersExcelButton"),
  weeklyArchive: document.getElementById("weeklyArchive"),
  exportButton: document.getElementById("exportButton"),
  logoutButton: document.getElementById("logoutButton"),
  logoutTopButton: document.getElementById("logoutTopButton"),
  imageModal: document.getElementById("imageModal"),
  modalImage: document.getElementById("modalImage"),
  closeModalButton: document.getElementById("closeModalButton"),
  noticeModal: document.getElementById("noticeModal"),
  noticeModalTitle: document.getElementById("noticeModalTitle"),
  noticeModalText: document.getElementById("noticeModalText"),
  closeNoticeModalButton: document.getElementById("closeNoticeModalButton"),
  confirmNoticeModalButton: document.getElementById("confirmNoticeModalButton"),
};

initialize();

async function initialize() {
  bindEvents();
  LEGACY_STORAGE_KEYS.forEach((k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch {} });
  setupSupabase();
  if (!state.isConfigured) return showMessage(els.loginMessage, "Configure o Supabase antes de usar.", "error");
  try {
    await ensureDefaultAdmin();
    await restoreSession();
    await refreshData();
    clearMessage(els.loginMessage);
  } catch (error) {
    showMessage(els.loginMessage, getErrorMessage(error), "error");
  }
  renderApp();
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.farmForm.addEventListener("submit", handleFarmSubmit);
  els.routeForm.addEventListener("submit", handleRouteSubmit);
  els.memberForm.addEventListener("submit", handleMemberSubmit);
  els.clearFarmFormButton.addEventListener("click", resetFarmForm);
  els.clearRouteFormButton.addEventListener("click", resetRouteForm);
  els.cancelEditMemberButton.addEventListener("click", resetMemberForm);
  els.chestPrint.addEventListener("change", () => updateFileLabel(els.chestPrint, els.fileLabel));
  els.routePrint.addEventListener("change", () => updateFileLabel(els.routePrint, els.routeFileLabel));
  els.membersBody.addEventListener("click", handleMemberActions);
  els.recordsBody.addEventListener("click", handleImageButtons);
  els.memberHistoryBody.addEventListener("click", handleImageButtons);
  els.routeHistoryBody.addEventListener("click", handleImageButtons);
  els.routeRecordsBody.addEventListener("click", handleImageButtons);
  els.exportFarmPeriodButton.addEventListener("click", exportFarmPeriodReport);
  els.resetFarmMonthButton.addEventListener("click", resetFarmCurrentMonth);
  els.exportRoutePeriodButton.addEventListener("click", exportRoutePeriodReport);
  els.resetRouteMonthButton.addEventListener("click", resetRouteCurrentMonth);
  els.cleanupPeriodButton.addEventListener("click", cleanupSelectedPeriod);
  els.cleanupAllButton.addEventListener("click", cleanupAllHistory);
  els.migrateLegacyPrintsButton.addEventListener("click", migrateLegacyPrints);
  els.exportMembersExcelButton.addEventListener("click", exportMembersExcel);
  els.logoutButton.addEventListener("click", logout);
  els.logoutTopButton.addEventListener("click", logout);
  els.exportButton.addEventListener("click", exportData);
  els.closeModalButton.addEventListener("click", closeModal);
  els.imageModal.addEventListener("click", (e) => { if (e.target.dataset.close === "true") closeModal(); });
  els.closeNoticeModalButton.addEventListener("click", closeNoticeModal);
  els.confirmNoticeModalButton.addEventListener("click", closeNoticeModal);
  els.noticeModal.addEventListener("click", (e) => { if (e.target.dataset.noticeClose === "true") closeNoticeModal(); });
  els.farmTabButton.addEventListener("click", () => switchTab("farm"));
  els.routeTabButton.addEventListener("click", () => switchTab("route"));
  els.reportsTabButton.addEventListener("click", () => switchTab("reports"));
  document.querySelectorAll("[data-route-product],[data-route-quantity]").forEach((el) => el.addEventListener("input", renderRouteSummary));
}

function setupSupabase() {
  const cfg = window.SUPABASE_CONFIG || DEFAULT_SUPABASE_CONFIG;
  const url = String(cfg.url || "").trim();
  const anonKey = String(cfg.anonKey || "").trim();
  state.isConfigured = Boolean(url && anonKey);
  if (state.isConfigured) state.supabase = { url, anonKey };
}

async function handleLogin(event) {
  event.preventDefault();
  if (state.loading) return;
  clearMessage(els.loginMessage);
  try {
    setLoading(true);
    const user = await loginUser(els.loginUsername.value.trim().toLowerCase(), els.loginPassword.value.trim());
    if (!user) return showMessage(els.loginMessage, "Usuario ou senha invalidos.", "error");
    state.currentUser = user;
    sessionStorage.setItem(SESSION_KEY, user.id);
    els.loginForm.reset();
    await refreshData();
    renderApp();
  } catch (error) { showMessage(els.loginMessage, getErrorMessage(error), "error"); }
  finally { setLoading(false); }
}

async function handleFarmSubmit(event) {
  event.preventDefault();
  if (state.loading) return;
  clearMessage(els.farmMessage);
  try {
    setLoading(true);
    const uploadedPrint = await uploadPrintFile(els.chestPrint.files[0], "meta", state.currentUser.id);
    const payload = {
      usuario: state.currentUser.id,
      farm: els.farmType.value.trim(),
      materiais: Number(els.materialsReceived.value),
      dinheiro: Number(els.dirtyMoney.value),
      restantes: Number(els.materialsRemaining.value),
      print: uploadedPrint,
      data: new Date().toISOString(),
      status: "Entregue",
    };
    const err = validateFarmPayload(payload);
    if (err) return showMessage(els.farmMessage, err, "error");
    const existing = getCanonicalFarmRecords().find((r) => String(r.usuario) === String(state.currentUser.id) && toDateKey(r.data) === getDateKey());
    if (existing) {
      openNoticeModal("Meta ja enviada hoje", "Esse membro ja registrou a meta principal hoje. Um novo envio so podera ser feito no proximo dia.");
      return;
    }
    await saveFarmRecord(null, payload);
    await refreshData();
    resetFarmForm();
    showMessage(els.farmMessage, existing ? "Entrega atualizada com sucesso." : "Entrega registrada com sucesso.", "success");
    renderApp();
  } catch (error) {
    showMessage(els.farmMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

async function handleRouteSubmit(event) {
  event.preventDefault();
  if (state.loading) return;
  clearMessage(els.routeMessage);
  try {
    setLoading(true);
    const produtos = collectRouteProducts();
    if (!produtos.length) return showMessage(els.routeMessage, "Selecione pelo menos um produto da rota.", "error");
    if (!els.routePrint.files[0]) return showMessage(els.routeMessage, "O print do bau e obrigatorio.", "error");
    const uploadedPrint = await uploadPrintFile(els.routePrint.files[0], "rota", state.currentUser.id);
    const payload = {
      usuario: state.currentUser.id,
      produtos,
      total_entregues: produtos.reduce((t, p) => t + p.quantidade, 0),
      print: uploadedPrint,
      data: new Date().toISOString(),
      status: "Entregue",
    };
    const existing = getCanonicalRouteRecords().find((r) => String(r.usuario) === String(state.currentUser.id) && toDateKey(r.data) === getDateKey());
    if (existing) {
      openNoticeModal("Rota ja enviada hoje", "Esse membro ja registrou a farm de rota hoje. Um novo envio so podera ser feito no proximo dia.");
      return;
    }
    await saveRouteRecord(null, payload);
    await refreshData();
    resetRouteForm();
    showMessage(els.routeMessage, existing ? "Rota atualizada com sucesso." : "Rota registrada com sucesso.", "success");
    renderApp();
  } catch (error) {
    showMessage(els.routeMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

async function handleMemberSubmit(event) {
  event.preventDefault();
  if (state.loading) return;
  clearMessage(els.memberMessage);
  if (!isAdmin()) return;
  const editingId = els.memberId.value.trim();
  const payload = { nome: els.memberName.value.trim(), usuario: els.memberUsername.value.trim().toLowerCase(), senha: els.memberPassword.value.trim(), tipo: els.memberRole.value };
  const duplicate = state.users.some((u) => u.usuario.toLowerCase() === payload.usuario && String(u.id) !== editingId);
  if (!payload.nome || !payload.usuario || !payload.senha || !payload.tipo) return showMessage(els.memberMessage, "Preencha todos os campos do membro.", "error");
  if (duplicate) return showMessage(els.memberMessage, "Ja existe um membro usando esse usuario.", "error");
  try {
    setLoading(true);
    await saveMember(editingId, payload);
    await refreshData();
    resetMemberForm();
    showMessage(els.memberMessage, editingId ? "Membro atualizado com sucesso." : "Membro cadastrado com sucesso.", "success");
    renderApp();
  } catch (error) {
    showMessage(els.memberMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

async function handleMemberActions(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn || !isAdmin()) return;
  const user = state.users.find((u) => String(u.id) === String(btn.dataset.userId));
  if (!user) return;
  if (btn.dataset.action === "edit") {
    els.memberId.value = user.id; els.memberName.value = user.nome; els.memberUsername.value = user.usuario; els.memberPassword.value = user.senha; els.memberRole.value = user.tipo; els.memberFormMode.textContent = `Editando ${user.nome}`; return;
  }
  if (String(user.id) === String(state.currentUser.id)) return showMessage(els.memberMessage, "Nao e permitido excluir a conta em uso.", "error");
  await deleteMember(user.id);
  await refreshData();
  renderApp();
}

async function refreshData() {
  const [users, records, routeRecords] = await Promise.all([fetchUsers(), fetchRecords(), fetchRouteRecords()]);
  state.users = users;
  state.records = records;
  state.routeRecords = routeRecords;
  if (state.currentUser) state.currentUser = users.find((u) => String(u.id) === String(state.currentUser.id)) || null;
  syncExportFilters();
}

async function restoreSession() {
  const sessionUserId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionUserId) return;
  state.currentUser = await getUserById(sessionUserId);
}

function renderApp() {
  const loggedIn = Boolean(state.currentUser);
  els.authView.classList.toggle("hidden", loggedIn);
  els.appView.classList.toggle("hidden", !loggedIn);
  if (!loggedIn) return;
  if (state.activeTab === "reports" && !isAdmin()) state.activeTab = "farm";
  switchTab(state.activeTab, false);
  renderShell();
  renderFarm();
  renderRoute();
  els.adminSection.classList.toggle("hidden", !isAdmin());
  els.adminRouteSection.classList.toggle("hidden", !isAdmin());
  els.reportsSection.classList.toggle("hidden", !isAdmin());
  els.reportsTabButton.classList.toggle("hidden", !isAdmin());
  els.exportMembersExcelButton.classList.toggle("hidden", !isAdmin());
}

function renderShell() {
  const user = state.currentUser;
  const today = new Date();
  const requiredToday = isRequiredDay(today);
  const isRouteTab = state.activeTab === "route";
  const isReportsTab = state.activeTab === "reports";
  const todayRecords = getTodayRecords();
  const weeklyRecords = getCurrentWeekRecords();
  const todayRouteRecords = getTodayRouteRecords();
  const weeklyRouteRecords = getCurrentWeekRouteRecords();
  const ranking = isRouteTab ? computeRouteRanking(weeklyRouteRecords) : computeRanking(weeklyRecords);
  const topMember = ranking.find((i) => i.deliveries > 0);
  const pending = isReportsTab ? [] : (isRouteTab ? getPendingRouteMembers() : getPendingMembers());
  const totalFactionMoney = sumBy(state.records, "dinheiro");
  els.heroObligationCard.classList.toggle("hero-card-alert", requiredToday);
  els.heroObligationCard.classList.toggle("hero-card-weekend", !requiredToday);
  els.sidebarDateLabel.textContent = `${formatDate(today)} - ${capitalize(getWeekdayLabel(today))}`;
  els.sidebarModeLabel.textContent = isReportsTab
    ? "Modo relatorios"
    : (isRouteTab ? (requiredToday ? "Rota obrigatoria" : "Rota opcional") : (requiredToday ? "Meta obrigatoria" : "Meta opcional"));
  els.sidebarUserName.textContent = user.nome;
  els.sidebarUserRole.textContent = user.tipo === "admin" ? "Administrador" : "Membro";
  els.pageTitle.textContent = isReportsTab ? "Relatorios" : (isRouteTab ? "Farm de rota" : (user.tipo === "admin" ? "Painel Administrativo" : "Painel do Membro"));
  els.pageSubtitle.textContent = isReportsTab ? "Exportacoes administrativas em Excel com foto dos prints." : (isRouteTab ? "Checklist de produtos da rota com print obrigatorio." : "Monitoramento em tempo real de farms, ranking e pendencias.");
  els.requiredBadge.textContent = isReportsTab ? "Somente adm" : (requiredToday ? "Obrigatorio hoje" : "Opcional hoje");
  els.deliveryBadge.textContent = isReportsTab ? "2 exportacoes disponiveis" : (!isRouteTab ? (hasDeliveredToday(user.id) ? "Sua entrega esta registrada" : "Sua entrega ainda esta pendente") : (hasRouteToday(user.id) ? "Sua rota esta registrada" : "Sua rota ainda esta pendente"));
  els.miniDelivered.textContent = String(isRouteTab ? todayRouteRecords.length : todayRecords.length);
  els.miniPending.textContent = String(pending.length);
  els.miniWeekly.textContent = String(isRouteTab ? weeklyRouteRecords.length : weeklyRecords.length);
  els.heroDirtyMoneyLabel.textContent = isReportsTab ? "Registros totais" : (!isRouteTab ? "Dinheiro sujo FAC" : "Itens rota hoje");
  els.heroObligation.textContent = isReportsTab ? "Exportacao liberada" : (!isRouteTab ? (requiredToday ? "Entrega obrigatoria" : "Entrega opcional") : (requiredToday ? "Rota obrigatoria" : "Rota opcional"));
  els.heroObligationDescription.textContent = isReportsTab
    ? "Use a aba de relatorios para baixar Excel da farm principal e da farm de rota com foto."
    : (!isRouteTab ? (requiredToday ? "Segunda a sexta os membros precisam enviar a meta diaria no banco." : "Fim de semana continua entrando no ranking, mas sem pendencia obrigatoria.") : (requiredToday ? "A rota tambem possui controle proprio de entrega e pendencias." : "Fim de semana continua entrando no ranking da rota, sem pendencia obrigatoria."));
  els.heroDirtyMoney.textContent = isReportsTab ? `${state.records.length + state.routeRecords.length} registros` : (!isRouteTab ? formatMoney(totalFactionMoney) : `${getTodayRouteTotal()} itens`);
  els.heroTopMember.textContent = topMember ? topMember.memberName : "Sem entregas";
  els.heroTopMemberDescription.textContent = isReportsTab
    ? "Relatorios usam o periodo e o membro selecionados na nova aba administrativa."
    : (!isRouteTab ? (topMember ? `${topMember.deliveries} dia(s) de entrega registrados nesta semana.` : "O ranking semanal sera preenchido quando houver registros.") : (topMember ? `${topMember.deliveries} item(ns) entregues na rota nesta semana.` : "O ranking da rota sera preenchido quando houver registros."));
  els.heroMissedCount.textContent = String(pending.length);
  els.missingSummary.textContent = isReportsTab ? "Sem pendencias" : (!isRouteTab ? (requiredToday ? `${pending.length} pendencia(s) no dia` : "Fim de semana sem obrigatoriedade") : (requiredToday ? `${pending.length} pendencia(s) de rota` : "Fim de semana sem obrigatoriedade"));
}

function renderFarm() {
  const isMember = state.currentUser.tipo === "membro";
  els.farmForm.closest(".card").classList.toggle("hidden", !isMember);
  els.memberHistorySection.classList.toggle("hidden", !isMember);
  if (!isMember) {
    renderAdminFarm();
    return;
  }
  els.farmMemberName.value = state.currentUser.nome;
  els.autoDate.textContent = formatDateTime(new Date());
  const rows = getDailyStatusRows();
  els.dailyStatusBody.innerHTML = rows.length ? rows.map((row) => `<tr><td>${escapeHtml(row.nome)}</td><td><span class="status-chip ${row.statusClass}">${escapeHtml(row.status)}</span></td><td>${escapeHtml(row.farm)}</td><td>${escapeHtml(row.data)}</td></tr>`).join("") : emptyRow(4, "Nenhum membro cadastrado.");
  const own = getLastThirtyDaysRecords(getCanonicalFarmRecords().filter((r) => String(r.usuario) === String(state.currentUser.id))).sort((a, b) => new Date(b.data) - new Date(a.data));
  const ownEquivalentDays = own.reduce((total, record) => total + getFarmDeliveryEquivalent(record), 0);
  els.memberHistorySummary.textContent = `${ownEquivalentDays} dia(s) de entrega nos ultimos 30 dias`;
  els.memberHistoryBody.innerHTML = own.length ? own.map((r) => `<tr><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td><td>${escapeHtml(r.farm)}</td><td>${escapeHtml(formatMoney(r.dinheiro))}</td><td>${escapeHtml(String(r.restantes))}</td><td><button class="thumb-button" type="button" data-record-id="${escapeHtml(String(r.id))}" data-record-table="registros">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td></tr>`).join("") : emptyRow(6, "Nenhuma entrega encontrada nos ultimos 30 dias.");
  renderAdminFarm();
}

function renderAdminFarm() {
  const records = [...getCanonicalFarmRecords()].sort((a, b) => new Date(b.data) - new Date(a.data));
  els.recordsBody.innerHTML = records.length ? records.map((r) => `<tr><td>${escapeHtml(getUserName(r.usuario))}</td><td>${escapeHtml(r.farm)}</td><td>${escapeHtml(formatMoney(r.dinheiro))}</td><td>${escapeHtml(String(r.restantes))}</td><td><button class="thumb-button" type="button" data-record-id="${escapeHtml(String(r.id))}" data-record-table="registros">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td></tr>`).join("") : emptyRow(7, "Nenhum registro encontrado.");
  const ranking = computeRanking(getCurrentWeekRecords()).filter((i) => i.deliveries > 0);
  els.rankingList.innerHTML = ranking.length ? ranking.map((i, idx) => `<article class="stack-item ranking-row"><span class="ranking-position">${idx + 1}o</span><div><strong>${escapeHtml(i.memberName)}</strong><p>${i.deliveries} dia(s) de entrega registrados na semana atual.</p></div></article>`).join("") : `<div class="empty-state">Ainda nao houve entregas nesta semana.</div>`;
  const missing = getPendingMembers();
  els.missingList.innerHTML = missing.length ? missing.map((u) => `<article class="stack-item"><strong>${escapeHtml(u.nome)}</strong><p>Ainda nao registrou a meta do dia.</p></article>`).join("") : `<div class="empty-state">${isRequiredDay() ? "Todos os membros entregaram hoje." : "Hoje nao ha pendencias obrigatorias."}</div>`;
  const users = [...state.users].sort((a, b) => a.nome.localeCompare(b.nome));
  els.memberCounter.textContent = `${users.length} membro(s)`;
  els.membersBody.innerHTML = users.map((u) => `<tr><td>${escapeHtml(u.nome)}</td><td>${escapeHtml(u.usuario)}</td><td>${escapeHtml(u.tipo === "admin" ? "Admin" : "Membro")}</td><td><div class="action-row"><button class="action-button" type="button" data-action="edit" data-user-id="${u.id}">Editar</button><button class="action-button" type="button" data-action="delete" data-user-id="${u.id}">Excluir</button></div></td></tr>`).join("");
  const archive = buildWeeklyArchive(getCanonicalFarmRecords(), "dinheiro");
  els.weeklyArchive.innerHTML = archive.length ? archive.map((w) => `<article class="archive-card"><strong>Semana de ${escapeHtml(formatWeekKey(w.weekKey))}</strong><p>Total de entregas: ${escapeHtml(String(w.totalDeliveries))}</p><p>Dinheiro sujo: ${escapeHtml(formatMoney(w.totalValue))}</p><p>Lider: ${escapeHtml(w.topMember)}</p></article>`).join("") : `<div class="empty-state">O historico semanal sera montado automaticamente conforme as semanas avancarem.</div>`;
}

function renderRoute() {
  const isMember = state.currentUser.tipo === "membro";
  els.routeForm.closest(".card").classList.toggle("hidden", !isMember);
  els.routeHistorySection.classList.toggle("hidden", !isMember);
  els.routeMemberName.value = state.currentUser.nome;
  els.routeAutoDate.textContent = formatDateTime(new Date());
  renderRouteSummary();
  const routeRows = getRouteStatusRows();
  const routeMissing = getPendingRouteMembers();
  const own = getLastThirtyDaysRecords(getCanonicalRouteRecords().filter((r) => String(r.usuario) === String(state.currentUser.id))).sort((a, b) => new Date(b.data) - new Date(a.data));
  els.routeMissingSummary.textContent = isRequiredDay() ? `${routeMissing.length} pendencia(s) no dia` : "Fim de semana sem obrigatoriedade";
  els.routeStatusBody.innerHTML = routeRows.length ? routeRows.map((row) => `<tr><td>${escapeHtml(row.nome)}</td><td><span class="status-chip ${row.statusClass}">${escapeHtml(row.status)}</span></td><td>${escapeHtml(row.produtos)}</td><td>${escapeHtml(row.data)}</td></tr>`).join("") : emptyRow(4, "Nenhum membro cadastrado.");
  els.routeMissingList.innerHTML = routeMissing.length ? routeMissing.map((u) => `<article class="stack-item"><strong>${escapeHtml(u.nome)}</strong><p>Ainda nao registrou a rota do dia.</p></article>`).join("") : `<div class="empty-state">${isRequiredDay() ? "Todos os membros entregaram a rota hoje." : "Hoje nao ha pendencias obrigatorias na rota."}</div>`;
  els.routeHistorySummary.textContent = `${own.length} rota(s) nos ultimos 30 dias`;
  els.routeHistoryBody.innerHTML = own.length ? own.map((r) => `<tr><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td><td>${escapeHtml(formatRouteProducts(r.produtos))}</td><td>${escapeHtml(String(r.total_entregues || 0))}</td><td><button class="thumb-button" type="button" data-record-id="${escapeHtml(String(r.id))}" data-record-table="registros_rota">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td></tr>`).join("") : emptyRow(5, "Nenhuma rota encontrada nos ultimos 30 dias.");
  const routeRecords = [...getCanonicalRouteRecords()].sort((a, b) => new Date(b.data) - new Date(a.data));
  els.routeRecordsBody.innerHTML = routeRecords.length ? routeRecords.map((r) => `<tr><td>${escapeHtml(getUserName(r.usuario))}</td><td>${escapeHtml(formatRouteProducts(r.produtos))}</td><td>${escapeHtml(String(r.total_entregues || 0))}</td><td><button class="thumb-button" type="button" data-record-id="${escapeHtml(String(r.id))}" data-record-table="registros_rota">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td></tr>`).join("") : emptyRow(6, "Nenhum registro de rota encontrado.");
  const ranking = computeRouteRanking(getCurrentWeekRouteRecords()).filter((i) => i.deliveries > 0);
  els.routeRankingList.innerHTML = ranking.length ? ranking.map((i, idx) => `<article class="stack-item ranking-row"><span class="ranking-position">${idx + 1}o</span><div><strong>${escapeHtml(i.memberName)}</strong><p>${i.deliveries} item(ns) entregues na rota esta semana.</p></div></article>`).join("") : `<div class="empty-state">Ainda nao houve entregas de rota nesta semana.</div>`;
}

function renderRouteSummary() {
  const produtos = collectRouteProducts();
  els.routeSummaryBadge.textContent = produtos.length ? `${produtos.length} produto(s)` : "Selecione produtos";
  els.routeSummaryList.innerHTML = produtos.length ? produtos.map((p) => `<article class="stack-item"><strong>${escapeHtml(p.nome)}</strong><p>${p.quantidade} unidade(s) marcadas para entrega.</p></article>`).join("") : `<div class="empty-state">Marque os produtos da rota e informe as quantidades.</div>`;
}

function syncExportFilters() {
  const members = state.users.filter((user) => user.tipo === "membro").sort((left, right) => left.nome.localeCompare(right.nome));
  const currentFarmMember = els.farmExportMember.value || "all";
  const currentRouteMember = els.routeExportMember.value || "all";
  const options = [`<option value="all">Todos os membros</option>`]
    .concat(members.map((user) => `<option value="${escapeHtml(String(user.id))}">${escapeHtml(user.nome)}</option>`))
    .join("");

  els.farmExportMember.innerHTML = options;
  els.routeExportMember.innerHTML = options;
  els.farmExportMember.value = members.some((user) => String(user.id) === currentFarmMember) ? currentFarmMember : "all";
  els.routeExportMember.value = members.some((user) => String(user.id) === currentRouteMember) ? currentRouteMember : "all";

  if (!els.farmExportStart.value || !els.farmExportEnd.value || !els.routeExportStart.value || !els.routeExportEnd.value) {
    const defaults = getLastThirtyDaysRange();
    if (!els.farmExportStart.value) els.farmExportStart.value = defaults.startKey;
    if (!els.farmExportEnd.value) els.farmExportEnd.value = defaults.endKey;
    if (!els.routeExportStart.value) els.routeExportStart.value = defaults.startKey;
    if (!els.routeExportEnd.value) els.routeExportEnd.value = defaults.endKey;
    if (!els.cleanupStart.value) els.cleanupStart.value = defaults.startKey;
    if (!els.cleanupEnd.value) els.cleanupEnd.value = defaults.endKey;
  }
}

function switchTab(tab, rerender = true) {
  state.activeTab = tab;
  els.farmTabButton.classList.toggle("is-active", tab === "farm");
  els.routeTabButton.classList.toggle("is-active", tab === "route");
  els.reportsTabButton.classList.toggle("is-active", tab === "reports");
  els.farmTabView.classList.toggle("hidden", tab !== "farm");
  els.routeTabView.classList.toggle("hidden", tab !== "route");
  els.reportsTabView.classList.toggle("hidden", tab !== "reports");
  if (rerender) renderApp();
}

function collectRouteProducts() {
  return Array.from(document.querySelectorAll("[data-route-product]"))
    .map((checkbox) => ({ nome: checkbox.dataset.routeProduct, checked: checkbox.checked, quantidade: Number(document.querySelector(`[data-route-quantity="${checkbox.dataset.routeProduct}"]`)?.value || 0) }))
    .filter((item) => item.checked && item.quantidade > 0)
    .map(({ nome, quantidade }) => ({ nome, quantidade }));
}

async function fetchUsers() { return await supabaseSelect("usuarios", { select: "id,nome,usuario,senha,tipo,data_criacao", order: "nome.asc" }); }
async function fetchRecords() { return await supabaseSelect("registros", { select: "id,usuario,farm,materiais,dinheiro,restantes,data,status", order: "data.desc" }); }
async function fetchRouteRecords() { try { return await supabaseSelect("registros_rota", { select: "id,usuario,produtos,total_entregues,data,status", order: "data.desc" }); } catch { return []; } }
async function fetchRecordPrint(table, id) {
  const rows = await supabaseSelect(table, {
    select: "id,usuario,data,print",
    filters: { id: `eq.${id}` },
    limit: 1,
  });
  return rows[0] || null;
}
async function loginUser(usuario, senha) { const rows = await supabaseSelect("usuarios", { select: "id,nome,usuario,senha,tipo,data_criacao", filters: { usuario: `eq.${usuario}`, senha: `eq.${senha}` }, limit: 1 }); return rows[0] || null; }
async function getUserById(id) { const rows = await supabaseSelect("usuarios", { select: "id,nome,usuario,senha,tipo,data_criacao", filters: { id: `eq.${id}` }, limit: 1 }); return rows[0] || null; }
async function saveMember(editingId, payload) { if (editingId) return supabasePatch("usuarios", { id: `eq.${editingId}` }, payload); return supabaseInsert("usuarios", payload); }
async function saveFarmRecord(existingId, payload) { if (existingId) return supabasePatch("registros", { id: `eq.${existingId}` }, payload); return supabaseInsert("registros", payload); }
async function saveRouteRecord(existingId, payload) { if (existingId) return supabasePatch("registros_rota", { id: `eq.${existingId}` }, payload); return supabaseInsert("registros_rota", payload); }
async function deleteMember(userId) { await supabaseDelete("registros", { usuario: `eq.${userId}` }); try { await supabaseDelete("registros_rota", { usuario: `eq.${userId}` }); } catch {} await supabaseDelete("usuarios", { id: `eq.${userId}` }); }
async function ensureDefaultAdmin() { const users = await supabaseSelect("usuarios", { select: "id", limit: 1 }); if (!users.length) await supabaseInsert("usuarios", DEFAULT_ADMIN); }
async function deleteRecordsInMonth(table, startDate, endDate) { return await supabaseDeleteRange(table, "data", startDate.toISOString(), endDate.toISOString()); }
async function deleteRecordsByIds(table, ids) {
  for (const chunk of chunkArray(ids, 100)) {
    if (!chunk.length) continue;
    await supabaseDeleteIn(table, "id", chunk);
  }
}

async function supabaseSelect(table, options = {}) {
  const query = new URLSearchParams({ select: options.select || "*" });
  if (options.order) query.set("order", options.order);
  if (options.limit) query.set("limit", String(options.limit));
  Object.entries(options.filters || {}).forEach(([k, v]) => query.set(k, v));
  return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, { method: "GET" });
}

async function supabaseInsert(table, payload) { return await supabaseRequest(`/rest/v1/${table}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); }
async function supabasePatch(table, filters, payload) { const query = new URLSearchParams(); Object.entries(filters).forEach(([k, v]) => query.set(k, v)); return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); }
async function supabaseDelete(table, filters) { const query = new URLSearchParams(); Object.entries(filters).forEach(([k, v]) => query.set(k, v)); return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, { method: "DELETE" }); }
async function supabaseDeleteIn(table, field, values) {
  const query = new URLSearchParams();
  query.set(field, `in.(${values.join(",")})`);
  return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, { method: "DELETE" });
}
async function supabaseDeleteRange(table, field, fromIso, toIso) { const query = new URLSearchParams(); query.append(field, `gte.${fromIso}`); query.append(field, `lt.${toIso}`); return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, { method: "DELETE" }); }
async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${state.supabase.url}${path}`, { method: options.method || "GET", headers: { apikey: state.supabase.anonKey, Authorization: `Bearer ${state.supabase.anonKey}`, "Content-Type": "application/json", ...(options.headers || {}) }, body: options.body });
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return [];
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replaceAll(".", "");
}

function isAdmin() {
  const role = normalizeRole(state.currentUser?.tipo);
  return role === "admin" || role === "adm";
}
function logout() { state.currentUser = null; sessionStorage.removeItem(SESSION_KEY); resetFarmForm(); resetRouteForm(); resetMemberForm(); renderApp(); }
function resetFarmForm() { els.farmForm.reset(); els.materialsReceived.value = 200; els.fileLabel.textContent = "Nenhum arquivo selecionado"; }
function resetRouteForm() { els.routeForm.reset(); document.querySelectorAll("[data-route-quantity]").forEach((i) => { i.value = 0; }); els.routeFileLabel.textContent = "Nenhum arquivo selecionado"; renderRouteSummary(); }
function resetMemberForm() { els.memberForm.reset(); els.memberId.value = ""; els.memberRole.value = "membro"; els.memberFormMode.textContent = "Novo cadastro"; }
function validateFarmPayload(payload) { if (!payload.farm || !payload.materiais || !payload.print) return "Preencha o farm principal corretamente."; if (!Number.isFinite(payload.dinheiro) || payload.dinheiro < 0 || !Number.isFinite(payload.restantes) || payload.restantes < 0) return "Revise os campos do formulario."; return ""; }
function getCanonicalFarmRecords() { return dedupeRecordsByUserAndDay(state.records); }
function getCanonicalRouteRecords() { return dedupeRecordsByUserAndDay(state.routeRecords); }
function getTodayRecords() { return getCanonicalFarmRecords().filter((r) => toDateKey(r.data) === getDateKey()); }
function getCurrentWeekRecords() { return getCanonicalFarmRecords().filter((r) => isSameWeek(toDateKey(r.data), getWeekKey())); }
function getTodayRouteRecords() { return getCanonicalRouteRecords().filter((r) => toDateKey(r.data) === getDateKey()); }
function getCurrentWeekRouteRecords() { return getCanonicalRouteRecords().filter((r) => isSameWeek(toDateKey(r.data), getWeekKey())); }
function getPendingMembers() { if (!isRequiredDay()) return []; const records = getCanonicalFarmRecords(); return state.users.filter((u) => u.tipo === "membro" && !records.some((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey())); }
function getPendingRouteMembers() { if (!isRequiredDay()) return []; const records = getCanonicalRouteRecords(); return state.users.filter((u) => u.tipo === "membro" && !records.some((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey())); }
function hasDeliveredToday(userId) { return getCanonicalFarmRecords().some((r) => String(r.usuario) === String(userId) && toDateKey(r.data) === getDateKey()); }
function hasRouteToday(userId) { return getCanonicalRouteRecords().some((r) => String(r.usuario) === String(userId) && toDateKey(r.data) === getDateKey()); }
function getDailyStatusRows() { const records = getCanonicalFarmRecords(); return state.users.filter((u) => u.tipo === "membro").sort((a, b) => a.nome.localeCompare(b.nome)).map((u) => { const record = records.find((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey()); if (record) return { nome: u.nome, status: "Entregue", statusClass: "status-delivered", farm: record.farm, data: formatDateTime(new Date(record.data)) }; return { nome: u.nome, status: isRequiredDay() ? "Nao entregou" : "Opcional", statusClass: isRequiredDay() ? "status-missed" : "status-optional", farm: "-", data: formatDate(new Date()) }; }); }
function getRouteStatusRows() { const records = getCanonicalRouteRecords(); return state.users.filter((u) => u.tipo === "membro").sort((a, b) => a.nome.localeCompare(b.nome)).map((u) => { const record = records.find((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey()); if (record) return { nome: u.nome, status: "Entregue", statusClass: "status-delivered", produtos: formatRouteProducts(record.produtos), data: formatDateTime(new Date(record.data)) }; return { nome: u.nome, status: isRequiredDay() ? "Nao entregou" : "Opcional", statusClass: isRequiredDay() ? "status-missed" : "status-optional", produtos: "-", data: formatDate(new Date()) }; }); }
function computeRanking(records) { return state.users.filter((u) => u.tipo === "membro").map((u) => ({ userId: u.id, memberName: u.nome, deliveries: records.filter((r) => String(r.usuario) === String(u.id)).reduce((total, record) => total + getFarmDeliveryEquivalent(record), 0) })).sort((a, b) => b.deliveries - a.deliveries || a.memberName.localeCompare(b.memberName)); }
function computeRouteRanking(records = getCurrentWeekRouteRecords()) { return state.users.filter((u) => u.tipo === "membro").map((u) => ({ userId: u.id, memberName: u.nome, deliveries: records.filter((r) => String(r.usuario) === String(u.id)).reduce((t, r) => t + Number(r.total_entregues || 0), 0) })).sort((a, b) => b.deliveries - a.deliveries || a.memberName.localeCompare(b.memberName)); }
function buildWeeklyArchive(records, valueField) { const grouped = new Map(); records.forEach((r) => { const key = getWeekKey(new Date(r.data)); if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(r); }); return Array.from(grouped.entries()).map(([weekKey, list]) => ({ weekKey, totalDeliveries: list.reduce((total, record) => total + getFarmDeliveryEquivalent(record), 0), totalValue: list.reduce((t, r) => t + Number(r[valueField] || 0), 0), topMember: (computeRanking(list).find((i) => i.deliveries > 0)?.memberName || "Sem entregas") })).sort((a, b) => b.weekKey.localeCompare(a.weekKey)); }
function getTodayRouteTotal() { return state.routeRecords.filter((r) => toDateKey(r.data) === getDateKey()).reduce((t, r) => t + Number(r.total_entregues || 0), 0); }
function formatRouteProducts(produtos) { return Array.isArray(produtos) ? produtos.map((p) => `${p.nome} (${p.quantidade})`).join(", ") : "Sem produtos"; }
function getFarmDeliveryEquivalent(record) {
  if (!record) return 0;
  const farmType = String(record.farm || "").trim().toLowerCase();
  const materials = Number(record.materiais || 0);
  if (farmType !== "drogas") return 1;
  return Math.max(1, Math.floor(materials / 200) || 0);
}

function dedupeRecordsByUserAndDay(records) {
  const unique = new Map();
  records.forEach((record) => {
    const key = `${record.usuario}:${toDateKey(record.data)}`;
    const existing = unique.get(key);
    if (!existing || new Date(record.data) > new Date(existing.data)) {
      unique.set(key, record);
    }
  });
  return Array.from(unique.values());
}

function isLegacyBase64Print(printValue) {
  return String(printValue || "").startsWith("data:image/");
}

async function migrateSingleLegacyPrint(record, category) {
  const blob = dataUrlToBlob(record.print);
  const optimized = await optimizeImageBlob(blob);
  const userId = record.usuario || "sem-usuario";
  const path = `${category}/${toDateKey(record.data)}/${userId}-${record.id}.jpg`;
  await storageUpload(path, optimized, "image/jpeg");
  return getStoragePublicUrl(path);
}

function dataUrlToBlob(dataUrl) {
  const [meta, content] = String(dataUrl || "").split(",");
  if (!meta || !content) throw new Error("Print antigo invalido para migracao.");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || "image/jpeg";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

async function uploadPrintFile(file, category, userId) {
  if (!file) throw new Error("Selecione um print antes de enviar.");
  const optimized = await optimizeImageFile(file);
  const extension = "jpg";
  const path = `${category}/${getDateKey()}/${userId}-${Date.now()}.${extension}`;
  await storageUpload(path, optimized, "image/jpeg");
  return getStoragePublicUrl(path);
}

async function storageUpload(path, blob, contentType) {
  await fetch(`${state.supabase.url}/storage/v1/object/${PRINT_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: state.supabase.anonKey,
      Authorization: `Bearer ${state.supabase.anonKey}`,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: blob,
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text());
  });
}

async function storageDelete(paths) {
  const validPaths = paths.filter(Boolean);
  for (const chunk of chunkArray(validPaths, 100)) {
    if (!chunk.length) continue;
    await fetch(`${state.supabase.url}/storage/v1/object/${PRINT_BUCKET}`, {
      method: "DELETE",
      headers: {
        apikey: state.supabase.anonKey,
        Authorization: `Bearer ${state.supabase.anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: chunk }),
    }).then(async (response) => {
      if (!response.ok) throw new Error(await response.text());
    });
  }
}

function getStoragePublicUrl(path) {
  return `${state.supabase.url}/storage/v1/object/public/${PRINT_BUCKET}/${path}`;
}

function getStoragePathFromPrintValue(printValue) {
  const value = String(printValue || "");
  const marker = `/storage/v1/object/public/${PRINT_BUCKET}/`;
  const index = value.indexOf(marker);
  if (index === -1) return null;
  return value.slice(index + marker.length);
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function optimizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = reader.result; };
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    image.onload = () => {
      const maxWidth = 1600;
      const maxHeight = 1600;
      let { width, height } = image;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Falha ao preparar a imagem."));
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Falha ao otimizar a imagem."));
        resolve(blob);
      }, "image/jpeg", 0.82);
    };
    image.onerror = () => reject(new Error("Falha ao processar a imagem."));
    reader.readAsDataURL(file);
  });
}

function optimizeImageBlob(blob) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      const maxWidth = 1600;
      const maxHeight = 1600;
      let { width, height } = image;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return reject(new Error("Falha ao preparar a imagem da migracao."));
      }
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((optimized) => {
        URL.revokeObjectURL(url);
        if (!optimized) return reject(new Error("Falha ao otimizar a imagem da migracao."));
        resolve(optimized);
      }, "image/jpeg", 0.82);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar o print antigo para migracao."));
    };
    image.src = url;
  });
}

function setLoading(isLoading) {
  state.loading = Boolean(isLoading);
  [
    els.loginUsername,
    els.loginPassword,
    els.farmType,
    els.materialsReceived,
    els.dirtyMoney,
    els.materialsRemaining,
    els.chestPrint,
    els.routePrint,
    els.memberName,
    els.memberUsername,
    els.memberPassword,
    els.memberRole,
    els.exportButton,
    els.exportFarmPeriodButton,
    els.exportRoutePeriodButton,
    els.resetFarmMonthButton,
    els.resetRouteMonthButton,
    els.cleanupPeriodButton,
    els.cleanupAllButton,
    els.migrateLegacyPrintsButton,
    els.logoutButton,
    els.logoutTopButton,
  ].forEach((element) => {
    if (element) element.disabled = state.loading;
  });
}

function getLastThirtyDaysRecords(records) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 29);
  return records.filter((record) => new Date(record.data) >= start);
}

function exportData() { const payload = { generatedAt: new Date().toISOString(), users: state.users, records: state.records, routeRecords: state.routeRecords }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `painel-fazenda-backup-${getDateKey()}.json`; link.click(); URL.revokeObjectURL(url); }
function exportFarmPeriodReport() {
  if (!isAdmin()) return;
  const range = getExportRange(els.farmExportStart.value, els.farmExportEnd.value);
  if (!range) return window.alert("Informe um periodo valido para exportar a meta principal.");
  const members = getExportMembers(els.farmExportMember.value);
  const rows = [
    ["Data", "Nome", "Usuario", "Status do dia", "Farm", "Materiais", "Dinheiro", "Restantes", "Referencia do print", "Observacao"],
    ...buildFarmExportRows(members, range.start, range.end),
  ];
  downloadExcelCsv(`meta-principal-${range.label}.csv`, rows);
}

function exportRoutePeriodReport() {
  if (!isAdmin()) return;
  const range = getExportRange(els.routeExportStart.value, els.routeExportEnd.value);
  if (!range) return window.alert("Informe um periodo valido para exportar a farm de rota.");
  const members = getExportMembers(els.routeExportMember.value);
  const rows = [
    ["Data", "Nome", "Usuario", "Status do dia", "Produtos", "Total Entregue", "Foto do print", "Referencia do print", "Observacao"],
    ...buildRouteExportExcelRows(members, range.start, range.end),
  ];
  downloadExcelRichTable(`farm-rota-${range.label}.xls`, rows, "Farm de rota");
}

function exportMembersExcel() {
  if (!isAdmin()) return;
  const users = [...state.users].sort((a, b) => a.nome.localeCompare(b.nome));
  const rows = [
    ["Nome", "Usuario", "Senha"],
    ...users.map((user) => [user.nome, user.usuario, user.senha]),
  ];
  downloadExcelTable(`membros-${getDateKey()}.xls`, rows, "Membros");
}

async function resetFarmCurrentMonth() {
  if (!isAdmin()) return;
  const month = getMonthRange(0);
  await cleanupHistory("farm", month.start, month.end, `Limpar todos os registros da meta principal de ${month.prettyLabel}? Os membros permanecem cadastrados.`);
}

async function resetRouteCurrentMonth() {
  if (!isAdmin()) return;
  const month = getMonthRange(0);
  await cleanupHistory("route", month.start, month.end, `Limpar todos os registros da rota de ${month.prettyLabel}? Os membros permanecem cadastrados.`);
}

async function cleanupSelectedPeriod() {
  if (!isAdmin()) return;
  clearMessage(els.cleanupMessage);
  const range = getExportRange(els.cleanupStart.value, els.cleanupEnd.value);
  if (!range) return showMessage(els.cleanupMessage, "Informe um periodo valido para limpeza.", "error");
  const scope = els.cleanupScope.value;
  const confirmed = window.confirm(`Limpar o historico selecionado de ${range.label.replaceAll("_", " ")}? Os membros cadastrados permanecem intactos.`);
  if (!confirmed) return;
  await cleanupHistory(scope, range.start, range.end);
}

async function cleanupAllHistory() {
  if (!isAdmin()) return;
  clearMessage(els.cleanupMessage);
  const scope = els.cleanupScope.value;
  const confirmed = window.confirm("Limpar todo o historico do escopo selecionado? Os membros cadastrados nao serao excluidos.");
  if (!confirmed) return;
  await cleanupHistory(scope, null, null);
}

async function migrateLegacyPrints() {
  if (!isAdmin()) return;
  clearMessage(els.migrationMessage);
  try {
    setLoading(true);
    const farmCandidates = state.records.map((record) => ({ id: record.id, table: "registros", category: "meta" }));
    const routeCandidates = state.routeRecords.map((record) => ({ id: record.id, table: "registros_rota", category: "rota" }));
    const candidates = [...farmCandidates, ...routeCandidates];
    if (!candidates.length) return showMessage(els.migrationMessage, "Nao ha registros para verificar na migracao.", "error");

    const confirmed = window.confirm(`Verificar e migrar prints antigos para o Storage? Esse processo pode levar alguns minutos.`);
    if (!confirmed) return;

    let migrated = 0;
    let checked = 0;
    for (const candidate of candidates) {
      checked += 1;
      showMessage(els.migrationMessage, `Verificando prints antigos... ${checked}/${candidates.length}`, "success");
      const record = await fetchRecordPrint(candidate.table, candidate.id);
      if (!record || !isLegacyBase64Print(record.print)) continue;
      const url = await migrateSingleLegacyPrint(record, candidate.category);
      await supabasePatch(candidate.table, { id: `eq.${record.id}` }, { print: url });
      migrated += 1;
      showMessage(els.migrationMessage, `Migrados ${migrated} print(s). Verificados ${checked}/${candidates.length}.`, "success");
    }
    await refreshData();
    showMessage(els.migrationMessage, migrated ? `${migrated} print(s) antigo(s) migrado(s) para o Storage com sucesso.` : "Nao havia prints antigos em base64 para migrar.", "success");
    renderApp();
  } catch (error) {
    showMessage(els.migrationMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

async function cleanupHistory(scope, start, end, confirmationMessage = "") {
  try {
    setLoading(true);
    if (confirmationMessage) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) return;
    }
    const targets = getCleanupTargets(scope, start, end);
    if (!targets.length) return showMessage(els.cleanupMessage, "Nao ha registros para limpar nesse filtro.", "error");
    const storagePaths = targets.map((record) => getStoragePathFromPrintValue(record.print)).filter(Boolean);
    if (storagePaths.length) await storageDelete(storagePaths);
    const farmIds = targets.filter((record) => record.__scope === "farm").map((record) => record.id);
    const routeIds = targets.filter((record) => record.__scope === "route").map((record) => record.id);
    if (farmIds.length) await deleteRecordsByIds("registros", farmIds);
    if (routeIds.length) await deleteRecordsByIds("registros_rota", routeIds);
    await refreshData();
    showMessage(els.cleanupMessage, "Historico limpo com sucesso. Os membros cadastrados foram preservados.", "success");
    renderApp();
  } catch (error) {
    showMessage(els.cleanupMessage, getErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

function getCleanupTargets(scope, start, end) {
  const items = [];
  if (scope === "farm" || scope === "all") {
    items.push(...state.records.filter((record) => isWithinOptionalRange(record.data, start, end)).map((record) => ({ ...record, __scope: "farm" })));
  }
  if (scope === "route" || scope === "all") {
    items.push(...state.routeRecords.filter((record) => isWithinOptionalRange(record.data, start, end)).map((record) => ({ ...record, __scope: "route" })));
  }
  return items;
}

function downloadExcelCsv(filename, rows) {
  const csv = rows.map((row) => row.map(toCsvCell).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadExcelTable(filename, rows, sheetName) {
  const tableRows = rows.map((row, index) => {
    const tag = index === 0 ? "th" : "td";
    const cells = row.map((value) => `<${tag}>${escapeHtml(String(value ?? ""))}</${tag}>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHtml(sheetName)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
<table>${tableRows}</table>
</body>
</html>`;
  const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadExcelRichTable(filename, rows, sheetName) {
  const tableRows = rows.map((row, rowIndex) => {
    const tag = rowIndex === 0 ? "th" : "td";
    const cells = row.map((cell) => renderExcelCell(cell, tag)).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="utf-8">
<style>
table { border-collapse: collapse; }
th, td { border: 1px solid #cfcfcf; padding: 8px; vertical-align: middle; }
img { display: block; max-width: 120px; max-height: 120px; object-fit: contain; }
</style>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHtml(sheetName)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
<table>${tableRows}</table>
</body>
</html>`;
  const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function renderExcelCell(cell, tag) {
  if (cell && typeof cell === "object" && "html" in cell) {
    return `<${tag}>${cell.html}</${tag}>`;
  }
  return `<${tag}>${escapeHtml(String(cell ?? ""))}</${tag}>`;
}

function toCsvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function getMonthRange(offset) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() + offset, 1, 0, 0, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 1, 0, 0, 0, 0);
  return {
    start,
    end,
    label: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    prettyLabel: start.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
  };
}

function isDateInRange(value, start, end) {
  const date = new Date(value);
  return date >= start && date < end;
}
function isWithinOptionalRange(value, start, end) {
  if (!start || !end) return true;
  const dateKey = toDateKey(value);
  return dateKey >= getDateKey(start) && dateKey <= getDateKey(end);
}
function getLastThirtyDaysRange() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { startKey: getDateKey(start), endKey: getDateKey(end) };
}

function getExportRange(startValue, endValue) {
  if (!startValue || !endValue) return null;
  const start = new Date(`${startValue}T00:00:00`);
  const end = new Date(`${endValue}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;
  return {
    start,
    end,
    label: `${startValue}_ate_${endValue}`,
  };
}

function getExportMembers(memberId) {
  const members = state.users.filter((user) => user.tipo === "membro");
  if (memberId === "all") return members;
  return members.filter((user) => String(user.id) === String(memberId));
}

function buildFarmExportRows(members, start, end) {
  const rows = [];
  for (const user of members) {
    for (const date of iterateDates(start, end)) {
      const dateKey = getDateKey(date);
      const record = state.records.find((item) => String(item.usuario) === String(user.id) && toDateKey(item.data) === dateKey);
      const optional = !isRequiredDay(date);
      rows.push([
        formatDate(date),
        user.nome,
        user.usuario,
        record ? "Entregue" : (optional ? "Opcional" : "Nao entregou"),
        record?.farm || "-",
        record?.materiais ?? "-",
        record ? Number(record.dinheiro || 0).toFixed(2) : "-",
        record?.restantes ?? "-",
        buildPrintReference(record),
        record ? "Cumpriu e ganhou" : (optional ? "Dia opcional" : "Sem entrega no periodo"),
      ]);
    }
  }
  return rows;
}

function buildFarmExportExcelRows(members, start, end) {
  const rows = [];
  for (const user of members) {
    for (const date of iterateDates(start, end)) {
      const dateKey = getDateKey(date);
      const record = state.records.find((item) => String(item.usuario) === String(user.id) && toDateKey(item.data) === dateKey);
      const optional = !isRequiredDay(date);
      rows.push([
        formatDate(date),
        user.nome,
        user.usuario,
        record ? "Entregue" : (optional ? "Opcional" : "Nao entregou"),
        record?.farm || "-",
        record?.materiais ?? "-",
        record ? Number(record.dinheiro || 0).toFixed(2) : "-",
        record?.restantes ?? "-",
        buildPrintImageCell(record),
        buildPrintReference(record),
        record ? "Cumpriu e ganhou" : (optional ? "Dia opcional" : "Sem entrega no periodo"),
      ]);
    }
  }
  return rows;
}

function buildRouteExportRows(members, start, end) {
  const rows = [];
  for (const user of members) {
    for (const date of iterateDates(start, end)) {
      const dateKey = getDateKey(date);
      const record = state.routeRecords.find((item) => String(item.usuario) === String(user.id) && toDateKey(item.data) === dateKey);
      const optional = !isRequiredDay(date);
      rows.push([
        formatDate(date),
        user.nome,
        user.usuario,
        record ? "Entregue" : (optional ? "Opcional" : "Nao entregou"),
        record ? formatRouteProducts(record.produtos) : "-",
        record?.total_entregues ?? "-",
        buildPrintReference(record),
        record ? "Cumpriu a rota" : (optional ? "Dia opcional" : "Sem entrega no periodo"),
      ]);
    }
  }
  return rows;
}

function buildRouteExportExcelRows(members, start, end) {
  const rows = [];
  for (const user of members) {
    for (const date of iterateDates(start, end)) {
      const dateKey = getDateKey(date);
      const record = state.routeRecords.find((item) => String(item.usuario) === String(user.id) && toDateKey(item.data) === dateKey);
      const optional = !isRequiredDay(date);
      rows.push([
        formatDate(date),
        user.nome,
        user.usuario,
        record ? "Entregue" : (optional ? "Opcional" : "Nao entregou"),
        record ? formatRouteProducts(record.produtos) : "-",
        record?.total_entregues ?? "-",
        buildPrintImageCell(record),
        buildPrintReference(record),
        record ? "Cumpriu a rota" : (optional ? "Dia opcional" : "Sem entrega no periodo"),
      ]);
    }
  }
  return rows;
}

function buildPrintReference(record) {
  if (!record?.print) return "Sem print";
  const when = record.data ? formatDateTime(new Date(record.data)) : "data indisponivel";
  return `Painel > Ver print | Registro ${record.id || "-"} | ${when}`;
}

function buildPrintImageCell(record) {
  if (!record?.print) return "Sem print";
  return {
    html: `<img src="${escapeHtml(record.print)}" alt="Print do registro ${escapeHtml(String(record.id || ""))}" />`,
  };
}

function iterateDates(start, end) {
  const dates = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endAt = new Date(end);
  endAt.setHours(0, 0, 0, 0);
  while (current <= endAt) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
function getUserName(userId) { return state.users.find((u) => String(u.id) === String(userId))?.nome || "Usuario removido"; }
function updateFileLabel(input, target) { const file = input.files[0]; target.textContent = file ? file.name : "Nenhum arquivo selecionado"; }
async function handleImageButtons(event) {
  const imageButton = event.target.closest("[data-image]");
  if (imageButton) return openModal(decodeURIComponent(imageButton.dataset.image));

  const recordButton = event.target.closest("[data-record-id]");
  if (!recordButton) return;

  try {
    setLoading(true);
    const printUrl = await fetchRecordPrint(recordButton.dataset.recordTable, recordButton.dataset.recordId);
    if (!printUrl) {
      openNoticeModal("Print indisponivel", "Esse registro nao possui print disponivel para visualizacao.");
      return;
    }
    openModal(printUrl);
  } catch (error) {
    openNoticeModal("Falha ao abrir print", getErrorMessage(error));
  } finally {
    setLoading(false);
  }
}
function openModal(src) { els.modalImage.src = src; els.imageModal.classList.remove("hidden"); }
function closeModal() { els.modalImage.src = ""; els.imageModal.classList.add("hidden"); }
function openNoticeModal(title, text) { els.noticeModalTitle.textContent = title; els.noticeModalText.textContent = text; els.noticeModal.classList.remove("hidden"); }
function closeNoticeModal() { els.noticeModal.classList.add("hidden"); }
function showMessage(element, message, type) { element.textContent = message; element.className = `form-message ${type}`; }
function clearMessage(element) { element.textContent = ""; element.className = "form-message"; }
function getErrorMessage(error) {
  const message = error?.message || "";
  if (message.includes("relation") || message.includes("does not exist")) return "As tabelas do banco ainda nao existem. Execute o SQL inicial e a migracao de rota.";
  if (message.includes("Failed to fetch")) return "Falha de conexao com o Supabase.";
  if (message.includes("Bucket not found") || message.includes("The resource was not found")) return "O bucket de imagens ainda nao existe. Rode o novo SQL do Storage no Supabase.";
  if (message.includes("row-level security")) return "As permissoes do Storage ainda nao foram configuradas. Rode o novo SQL completo no Supabase.";
  return message || "Nao foi possivel concluir a operacao.";
}
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("Falha ao processar a imagem.")); reader.readAsDataURL(file); }); }
function formatDate(date) { return date.toLocaleDateString("pt-BR"); }
function formatDateTime(date) { return date.toLocaleString("pt-BR"); }
function formatMoney(value) { return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function getDateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function toDateKey(value) { return getDateKey(new Date(value)); }
function getWeekKey(date = new Date()) { const current = new Date(date); const diff = current.getDay() === 0 ? -6 : 1 - current.getDay(); current.setDate(current.getDate() + diff); current.setHours(0, 0, 0, 0); return getDateKey(current); }
function isSameWeek(dateKey, weekKey) { return getWeekKey(new Date(`${dateKey}T00:00:00`)) === weekKey; }
function isRequiredDay(date = new Date()) { const day = date.getDay(); return day >= 1 && day <= 5; }
function getWeekdayLabel(date) { return date.toLocaleDateString("pt-BR", { weekday: "long" }); }
function formatWeekKey(weekKey) { return formatDate(new Date(`${weekKey}T00:00:00`)); }
function sumBy(items, field) { return items.reduce((t, i) => t + Number(i[field] || 0), 0); }
function emptyRow(columns, message) { return `<tr><td colspan="${columns}"><div class="empty-state">${escapeHtml(message)}</div></td></tr>`; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function capitalize(text) { return text ? text.charAt(0).toUpperCase() + text.slice(1) : ""; }
