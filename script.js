const STORAGE_KEY = "painel-fazenda-gta";
const SESSION_KEY = `${STORAGE_KEY}:sessionUserId`;
const LEGACY_STORAGE_KEYS = ["painel-farm-gta-rp", "painel-fazenda-gta-rp-v2"];
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
  farmTabView: document.getElementById("farmTabView"),
  routeTabView: document.getElementById("routeTabView"),
  farmTabButton: document.getElementById("farmTabButton"),
  routeTabButton: document.getElementById("routeTabButton"),
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
  routeHistoryBody: document.getElementById("routeHistoryBody"),
  routeHistorySummary: document.getElementById("routeHistorySummary"),
  routeRecordsBody: document.getElementById("routeRecordsBody"),
  routeRankingList: document.getElementById("routeRankingList"),
  exportFarmLastMonthButton: document.getElementById("exportFarmLastMonthButton"),
  resetFarmMonthButton: document.getElementById("resetFarmMonthButton"),
  exportRouteLastMonthButton: document.getElementById("exportRouteLastMonthButton"),
  resetRouteMonthButton: document.getElementById("resetRouteMonthButton"),
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
  els.exportFarmLastMonthButton.addEventListener("click", exportFarmLastMonthReport);
  els.resetFarmMonthButton.addEventListener("click", resetFarmCurrentMonth);
  els.exportRouteLastMonthButton.addEventListener("click", exportRouteLastMonthReport);
  els.resetRouteMonthButton.addEventListener("click", resetRouteCurrentMonth);
  els.logoutButton.addEventListener("click", logout);
  els.exportButton.addEventListener("click", exportData);
  els.closeModalButton.addEventListener("click", closeModal);
  els.imageModal.addEventListener("click", (e) => { if (e.target.dataset.close === "true") closeModal(); });
  els.farmTabButton.addEventListener("click", () => switchTab("farm"));
  els.routeTabButton.addEventListener("click", () => switchTab("route"));
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
  clearMessage(els.loginMessage);
  try {
    const user = await loginUser(els.loginUsername.value.trim().toLowerCase(), els.loginPassword.value.trim());
    if (!user) return showMessage(els.loginMessage, "Usuario ou senha invalidos.", "error");
    state.currentUser = user;
    sessionStorage.setItem(SESSION_KEY, user.id);
    els.loginForm.reset();
    await refreshData();
    renderApp();
  } catch (error) { showMessage(els.loginMessage, getErrorMessage(error), "error"); }
}

async function handleFarmSubmit(event) {
  event.preventDefault();
  clearMessage(els.farmMessage);
  const payload = {
    usuario: state.currentUser.id,
    farm: els.farmType.value.trim(),
    materiais: Number(els.materialsReceived.value),
    dinheiro: Number(els.dirtyMoney.value),
    restantes: Number(els.materialsRemaining.value),
    print: await fileToDataUrl(els.chestPrint.files[0]),
    data: new Date().toISOString(),
    status: "Entregue",
  };
  const err = validateFarmPayload(payload);
  if (err) return showMessage(els.farmMessage, err, "error");
  const existing = state.records.find((r) => String(r.usuario) === String(state.currentUser.id) && toDateKey(r.data) === getDateKey());
  await saveFarmRecord(existing?.id, payload);
  await refreshData();
  resetFarmForm();
  showMessage(els.farmMessage, existing ? "Entrega atualizada com sucesso." : "Entrega registrada com sucesso.", "success");
  renderApp();
}

async function handleRouteSubmit(event) {
  event.preventDefault();
  clearMessage(els.routeMessage);
  const produtos = collectRouteProducts();
  if (!produtos.length) return showMessage(els.routeMessage, "Selecione pelo menos um produto da rota.", "error");
  if (!els.routePrint.files[0]) return showMessage(els.routeMessage, "O print do bau e obrigatorio.", "error");
  const payload = {
    usuario: state.currentUser.id,
    produtos,
    total_entregues: produtos.reduce((t, p) => t + p.quantidade, 0),
    print: await fileToDataUrl(els.routePrint.files[0]),
    data: new Date().toISOString(),
    status: "Entregue",
  };
  const existing = state.routeRecords.find((r) => String(r.usuario) === String(state.currentUser.id) && toDateKey(r.data) === getDateKey());
  await saveRouteRecord(existing?.id, payload);
  await refreshData();
  resetRouteForm();
  showMessage(els.routeMessage, existing ? "Rota atualizada com sucesso." : "Rota registrada com sucesso.", "success");
  renderApp();
}

async function handleMemberSubmit(event) {
  event.preventDefault();
  clearMessage(els.memberMessage);
  if (!isAdmin()) return;
  const editingId = els.memberId.value.trim();
  const payload = { nome: els.memberName.value.trim(), usuario: els.memberUsername.value.trim().toLowerCase(), senha: els.memberPassword.value.trim(), tipo: els.memberRole.value };
  const duplicate = state.users.some((u) => u.usuario.toLowerCase() === payload.usuario && String(u.id) !== editingId);
  if (!payload.nome || !payload.usuario || !payload.senha || !payload.tipo) return showMessage(els.memberMessage, "Preencha todos os campos do membro.", "error");
  if (duplicate) return showMessage(els.memberMessage, "Ja existe um membro usando esse usuario.", "error");
  await saveMember(editingId, payload);
  await refreshData();
  resetMemberForm();
  showMessage(els.memberMessage, editingId ? "Membro atualizado com sucesso." : "Membro cadastrado com sucesso.", "success");
  renderApp();
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
  switchTab(state.activeTab, false);
  renderShell();
  renderFarm();
  renderRoute();
  els.adminSection.classList.toggle("hidden", !isAdmin());
  els.adminRouteSection.classList.toggle("hidden", !isAdmin());
}

function renderShell() {
  const user = state.currentUser;
  const today = new Date();
  const todayRecords = getTodayRecords();
  const weeklyRecords = getCurrentWeekRecords();
  const todayRouteRecords = getTodayRouteRecords();
  const weeklyRouteRecords = getCurrentWeekRouteRecords();
  const ranking = state.activeTab === "farm" ? computeRanking(weeklyRecords) : computeRouteRanking(weeklyRouteRecords);
  const topMember = ranking.find((i) => i.deliveries > 0);
  const pending = state.activeTab === "farm" ? getPendingMembers() : getPendingRouteMembers();
  els.sidebarDateLabel.textContent = `${formatDate(today)} - ${capitalize(getWeekdayLabel(today))}`;
  els.sidebarModeLabel.textContent = state.activeTab === "farm"
    ? (isRequiredDay(today) ? "Meta obrigatoria" : "Meta opcional")
    : (isRequiredDay(today) ? "Rota obrigatoria" : "Rota opcional");
  els.sidebarUserName.textContent = user.nome;
  els.sidebarUserRole.textContent = user.tipo === "admin" ? "Administrador" : "Membro";
  els.pageTitle.textContent = state.activeTab === "farm" ? (user.tipo === "admin" ? "Painel Administrativo" : "Painel do Membro") : "Farm de rota";
  els.pageSubtitle.textContent = state.activeTab === "farm" ? "Monitoramento em tempo real de farms, ranking e pendencias." : "Checklist de produtos da rota com print obrigatorio.";
  els.requiredBadge.textContent = isRequiredDay(today) ? "Obrigatorio hoje" : "Opcional hoje";
  els.deliveryBadge.textContent = state.activeTab === "farm" ? (hasDeliveredToday(user.id) ? "Sua entrega esta registrada" : "Sua entrega ainda esta pendente") : (hasRouteToday(user.id) ? "Sua rota esta registrada" : "Sua rota ainda esta pendente");
  els.miniDelivered.textContent = String(state.activeTab === "farm" ? todayRecords.length : todayRouteRecords.length);
  els.miniPending.textContent = String(pending.length);
  els.miniWeekly.textContent = String(state.activeTab === "farm" ? weeklyRecords.length : weeklyRouteRecords.length);
  els.heroObligation.textContent = state.activeTab === "farm"
    ? (isRequiredDay(today) ? "Entrega obrigatoria" : "Entrega opcional")
    : (isRequiredDay(today) ? "Rota obrigatoria" : "Rota opcional");
  els.heroObligationDescription.textContent = state.activeTab === "farm"
    ? (isRequiredDay(today) ? "Segunda a sexta os membros precisam enviar a meta diaria no banco." : "Fim de semana continua entrando no ranking, mas sem pendencia obrigatoria.")
    : (isRequiredDay(today) ? "A rota tambem possui controle proprio de entrega e pendencias." : "Fim de semana continua entrando no ranking da rota, sem pendencia obrigatoria.");
  els.heroDirtyMoney.textContent = state.activeTab === "farm" ? formatMoney(sumBy(todayRecords, "dinheiro")) : `${getTodayRouteTotal()} itens`;
  els.heroTopMember.textContent = topMember ? topMember.memberName : "Sem entregas";
  els.heroTopMemberDescription.textContent = state.activeTab === "farm"
    ? (topMember ? `${topMember.deliveries} entrega(s) registradas nesta semana.` : "O ranking semanal sera preenchido quando houver registros.")
    : (topMember ? `${topMember.deliveries} item(ns) entregues na rota nesta semana.` : "O ranking da rota sera preenchido quando houver registros.");
  els.heroMissedCount.textContent = String(pending.length);
  els.missingSummary.textContent = state.activeTab === "farm"
    ? (isRequiredDay(today) ? `${pending.length} pendencia(s) no dia` : "Fim de semana sem obrigatoriedade")
    : (isRequiredDay(today) ? `${pending.length} pendencia(s) de rota` : "Fim de semana sem obrigatoriedade");
}

function renderFarm() {
  els.farmMemberName.value = state.currentUser.nome;
  els.autoDate.textContent = formatDateTime(new Date());
  const rows = getDailyStatusRows();
  els.dailyStatusBody.innerHTML = rows.length ? rows.map((row) => `<tr><td>${escapeHtml(row.nome)}</td><td><span class="status-chip ${row.statusClass}">${escapeHtml(row.status)}</span></td><td>${escapeHtml(row.farm)}</td><td>${escapeHtml(row.data)}</td></tr>`).join("") : emptyRow(4, "Nenhum membro cadastrado.");
  const own = state.records.filter((r) => String(r.usuario) === String(state.currentUser.id)).sort((a, b) => new Date(b.data) - new Date(a.data));
  els.memberHistorySummary.textContent = `${own.filter((r) => isSameWeek(toDateKey(r.data), getWeekKey())).length} entrega(s) nesta semana`;
  els.memberHistoryBody.innerHTML = own.length ? own.map((r) => `<tr><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td><td>${escapeHtml(r.farm)}</td><td>${escapeHtml(formatMoney(r.dinheiro))}</td><td>${escapeHtml(String(r.restantes))}</td><td><button class="thumb-button" type="button" data-image="${encodeURIComponent(r.print)}">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td></tr>`).join("") : emptyRow(6, "Nenhuma entrega encontrada para esta conta.");
  renderAdminFarm();
}

function renderAdminFarm() {
  const records = [...state.records].sort((a, b) => new Date(b.data) - new Date(a.data));
  els.recordsBody.innerHTML = records.length ? records.map((r) => `<tr><td>${escapeHtml(getUserName(r.usuario))}</td><td>${escapeHtml(r.farm)}</td><td>${escapeHtml(formatMoney(r.dinheiro))}</td><td>${escapeHtml(String(r.restantes))}</td><td><button class="thumb-button" type="button" data-image="${encodeURIComponent(r.print)}">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td></tr>`).join("") : emptyRow(7, "Nenhum registro encontrado.");
  const ranking = computeRanking(getCurrentWeekRecords()).filter((i) => i.deliveries > 0);
  els.rankingList.innerHTML = ranking.length ? ranking.map((i, idx) => `<article class="stack-item ranking-row"><span class="ranking-position">${idx + 1}o</span><div><strong>${escapeHtml(i.memberName)}</strong><p>${i.deliveries} entrega(s) registradas na semana atual.</p></div></article>`).join("") : `<div class="empty-state">Ainda nao houve entregas nesta semana.</div>`;
  const missing = getPendingMembers();
  els.missingList.innerHTML = missing.length ? missing.map((u) => `<article class="stack-item"><strong>${escapeHtml(u.nome)}</strong><p>Ainda nao registrou a meta do dia.</p></article>`).join("") : `<div class="empty-state">${isRequiredDay() ? "Todos os membros entregaram hoje." : "Hoje nao ha pendencias obrigatorias."}</div>`;
  const users = [...state.users].sort((a, b) => a.nome.localeCompare(b.nome));
  els.memberCounter.textContent = `${users.length} membro(s)`;
  els.membersBody.innerHTML = users.map((u) => `<tr><td>${escapeHtml(u.nome)}</td><td>${escapeHtml(u.usuario)}</td><td>${escapeHtml(u.tipo === "admin" ? "Admin" : "Membro")}</td><td><div class="action-row"><button class="action-button" type="button" data-action="edit" data-user-id="${u.id}">Editar</button><button class="action-button" type="button" data-action="delete" data-user-id="${u.id}">Excluir</button></div></td></tr>`).join("");
  const archive = buildWeeklyArchive(state.records, "dinheiro");
  els.weeklyArchive.innerHTML = archive.length ? archive.map((w) => `<article class="archive-card"><strong>Semana de ${escapeHtml(formatWeekKey(w.weekKey))}</strong><p>Total de entregas: ${escapeHtml(String(w.totalDeliveries))}</p><p>Dinheiro sujo: ${escapeHtml(formatMoney(w.totalValue))}</p><p>Lider: ${escapeHtml(w.topMember)}</p></article>`).join("") : `<div class="empty-state">O historico semanal sera montado automaticamente conforme as semanas avancarem.</div>`;
}

function renderRoute() {
  els.routeMemberName.value = state.currentUser.nome;
  els.routeAutoDate.textContent = formatDateTime(new Date());
  renderRouteSummary();
  const routeRows = getRouteStatusRows();
  const routeMissing = getPendingRouteMembers();
  const own = state.routeRecords.filter((r) => String(r.usuario) === String(state.currentUser.id)).sort((a, b) => new Date(b.data) - new Date(a.data));
  els.routeMissingSummary.textContent = isRequiredDay() ? `${routeMissing.length} pendencia(s) no dia` : "Fim de semana sem obrigatoriedade";
  els.routeStatusBody.innerHTML = routeRows.length ? routeRows.map((row) => `<tr><td>${escapeHtml(row.nome)}</td><td><span class="status-chip ${row.statusClass}">${escapeHtml(row.status)}</span></td><td>${escapeHtml(row.produtos)}</td><td>${escapeHtml(row.data)}</td></tr>`).join("") : emptyRow(4, "Nenhum membro cadastrado.");
  els.routeMissingList.innerHTML = routeMissing.length ? routeMissing.map((u) => `<article class="stack-item"><strong>${escapeHtml(u.nome)}</strong><p>Ainda nao registrou a rota do dia.</p></article>`).join("") : `<div class="empty-state">${isRequiredDay() ? "Todos os membros entregaram a rota hoje." : "Hoje nao ha pendencias obrigatorias na rota."}</div>`;
  els.routeHistorySummary.textContent = `${own.filter((r) => isSameWeek(toDateKey(r.data), getWeekKey())).length} rota(s) nesta semana`;
  els.routeHistoryBody.innerHTML = own.length ? own.map((r) => `<tr><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td><td>${escapeHtml(formatRouteProducts(r.produtos))}</td><td>${escapeHtml(String(r.total_entregues || 0))}</td><td><button class="thumb-button" type="button" data-image="${encodeURIComponent(r.print)}">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td></tr>`).join("") : emptyRow(5, "Nenhuma rota encontrada para esta conta.");
  const routeRecords = [...state.routeRecords].sort((a, b) => new Date(b.data) - new Date(a.data));
  els.routeRecordsBody.innerHTML = routeRecords.length ? routeRecords.map((r) => `<tr><td>${escapeHtml(getUserName(r.usuario))}</td><td>${escapeHtml(formatRouteProducts(r.produtos))}</td><td>${escapeHtml(String(r.total_entregues || 0))}</td><td><button class="thumb-button" type="button" data-image="${encodeURIComponent(r.print)}">Ver print</button></td><td><span class="status-chip status-delivered">${escapeHtml(r.status)}</span></td><td>${escapeHtml(formatDateTime(new Date(r.data)))}</td></tr>`).join("") : emptyRow(6, "Nenhum registro de rota encontrado.");
  const ranking = computeRouteRanking(getCurrentWeekRouteRecords()).filter((i) => i.deliveries > 0);
  els.routeRankingList.innerHTML = ranking.length ? ranking.map((i, idx) => `<article class="stack-item ranking-row"><span class="ranking-position">${idx + 1}o</span><div><strong>${escapeHtml(i.memberName)}</strong><p>${i.deliveries} item(ns) entregues na rota esta semana.</p></div></article>`).join("") : `<div class="empty-state">Ainda nao houve entregas de rota nesta semana.</div>`;
}

function renderRouteSummary() {
  const produtos = collectRouteProducts();
  els.routeSummaryBadge.textContent = produtos.length ? `${produtos.length} produto(s)` : "Selecione produtos";
  els.routeSummaryList.innerHTML = produtos.length ? produtos.map((p) => `<article class="stack-item"><strong>${escapeHtml(p.nome)}</strong><p>${p.quantidade} unidade(s) marcadas para entrega.</p></article>`).join("") : `<div class="empty-state">Marque os produtos da rota e informe as quantidades.</div>`;
}

function switchTab(tab, rerender = true) {
  state.activeTab = tab;
  els.farmTabButton.classList.toggle("is-active", tab === "farm");
  els.routeTabButton.classList.toggle("is-active", tab === "route");
  els.farmTabView.classList.toggle("hidden", tab !== "farm");
  els.routeTabView.classList.toggle("hidden", tab !== "route");
  if (rerender) renderApp();
}

function collectRouteProducts() {
  return Array.from(document.querySelectorAll("[data-route-product]"))
    .map((checkbox) => ({ nome: checkbox.dataset.routeProduct, checked: checkbox.checked, quantidade: Number(document.querySelector(`[data-route-quantity="${checkbox.dataset.routeProduct}"]`)?.value || 0) }))
    .filter((item) => item.checked && item.quantidade > 0)
    .map(({ nome, quantidade }) => ({ nome, quantidade }));
}

async function fetchUsers() { return await supabaseSelect("usuarios", { select: "id,nome,usuario,senha,tipo,data_criacao", order: "nome.asc" }); }
async function fetchRecords() { return await supabaseSelect("registros", { select: "id,usuario,farm,materiais,dinheiro,restantes,print,data,status", order: "data.desc" }); }
async function fetchRouteRecords() { try { return await supabaseSelect("registros_rota", { select: "id,usuario,produtos,total_entregues,print,data,status", order: "data.desc" }); } catch { return []; } }
async function loginUser(usuario, senha) { const rows = await supabaseSelect("usuarios", { select: "id,nome,usuario,senha,tipo,data_criacao", filters: { usuario: `eq.${usuario}`, senha: `eq.${senha}` }, limit: 1 }); return rows[0] || null; }
async function getUserById(id) { const rows = await supabaseSelect("usuarios", { select: "id,nome,usuario,senha,tipo,data_criacao", filters: { id: `eq.${id}` }, limit: 1 }); return rows[0] || null; }
async function saveMember(editingId, payload) { if (editingId) return supabasePatch("usuarios", { id: `eq.${editingId}` }, payload); return supabaseInsert("usuarios", payload); }
async function saveFarmRecord(existingId, payload) { if (existingId) return supabasePatch("registros", { id: `eq.${existingId}` }, payload); return supabaseInsert("registros", payload); }
async function saveRouteRecord(existingId, payload) { if (existingId) return supabasePatch("registros_rota", { id: `eq.${existingId}` }, payload); return supabaseInsert("registros_rota", payload); }
async function deleteMember(userId) { await supabaseDelete("registros", { usuario: `eq.${userId}` }); try { await supabaseDelete("registros_rota", { usuario: `eq.${userId}` }); } catch {} await supabaseDelete("usuarios", { id: `eq.${userId}` }); }
async function ensureDefaultAdmin() { const users = await supabaseSelect("usuarios", { select: "id", limit: 1 }); if (!users.length) await supabaseInsert("usuarios", DEFAULT_ADMIN); }
async function deleteRecordsInMonth(table, startDate, endDate) { return await supabaseDeleteRange(table, "data", startDate.toISOString(), endDate.toISOString()); }

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
async function supabaseDeleteRange(table, field, fromIso, toIso) { const query = new URLSearchParams(); query.append(field, `gte.${fromIso}`); query.append(field, `lt.${toIso}`); return await supabaseRequest(`/rest/v1/${table}?${query.toString()}`, { method: "DELETE" }); }
async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${state.supabase.url}${path}`, { method: options.method || "GET", headers: { apikey: state.supabase.anonKey, Authorization: `Bearer ${state.supabase.anonKey}`, "Content-Type": "application/json", ...(options.headers || {}) }, body: options.body });
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return [];
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function isAdmin() { return state.currentUser?.tipo === "admin"; }
function logout() { state.currentUser = null; sessionStorage.removeItem(SESSION_KEY); resetFarmForm(); resetRouteForm(); resetMemberForm(); renderApp(); }
function resetFarmForm() { els.farmForm.reset(); els.materialsReceived.value = 200; els.fileLabel.textContent = "Nenhum arquivo selecionado"; }
function resetRouteForm() { els.routeForm.reset(); document.querySelectorAll("[data-route-quantity]").forEach((i) => { i.value = 0; }); els.routeFileLabel.textContent = "Nenhum arquivo selecionado"; renderRouteSummary(); }
function resetMemberForm() { els.memberForm.reset(); els.memberId.value = ""; els.memberRole.value = "membro"; els.memberFormMode.textContent = "Novo cadastro"; }
function validateFarmPayload(payload) { if (!payload.farm || !payload.materiais || !payload.print) return "Preencha o farm principal corretamente."; if (!Number.isFinite(payload.dinheiro) || payload.dinheiro < 0 || !Number.isFinite(payload.restantes) || payload.restantes < 0) return "Revise os campos do formulario."; return ""; }
function getTodayRecords() { return state.records.filter((r) => toDateKey(r.data) === getDateKey()); }
function getCurrentWeekRecords() { return state.records.filter((r) => isSameWeek(toDateKey(r.data), getWeekKey())); }
function getTodayRouteRecords() { return state.routeRecords.filter((r) => toDateKey(r.data) === getDateKey()); }
function getCurrentWeekRouteRecords() { return state.routeRecords.filter((r) => isSameWeek(toDateKey(r.data), getWeekKey())); }
function getPendingMembers() { if (!isRequiredDay()) return []; return state.users.filter((u) => u.tipo === "membro" && !state.records.some((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey())); }
function getPendingRouteMembers() { if (!isRequiredDay()) return []; return state.users.filter((u) => u.tipo === "membro" && !state.routeRecords.some((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey())); }
function hasDeliveredToday(userId) { return state.records.some((r) => String(r.usuario) === String(userId) && toDateKey(r.data) === getDateKey()); }
function hasRouteToday(userId) { return state.routeRecords.some((r) => String(r.usuario) === String(userId) && toDateKey(r.data) === getDateKey()); }
function getDailyStatusRows() { return state.users.filter((u) => u.tipo === "membro").sort((a, b) => a.nome.localeCompare(b.nome)).map((u) => { const record = state.records.find((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey()); if (record) return { nome: u.nome, status: "Entregue", statusClass: "status-delivered", farm: record.farm, data: formatDateTime(new Date(record.data)) }; return { nome: u.nome, status: isRequiredDay() ? "Nao entregou" : "Opcional", statusClass: isRequiredDay() ? "status-missed" : "status-optional", farm: "-", data: formatDate(new Date()) }; }); }
function getRouteStatusRows() { return state.users.filter((u) => u.tipo === "membro").sort((a, b) => a.nome.localeCompare(b.nome)).map((u) => { const record = state.routeRecords.find((r) => String(r.usuario) === String(u.id) && toDateKey(r.data) === getDateKey()); if (record) return { nome: u.nome, status: "Entregue", statusClass: "status-delivered", produtos: formatRouteProducts(record.produtos), data: formatDateTime(new Date(record.data)) }; return { nome: u.nome, status: isRequiredDay() ? "Nao entregou" : "Opcional", statusClass: isRequiredDay() ? "status-missed" : "status-optional", produtos: "-", data: formatDate(new Date()) }; }); }
function computeRanking(records) { return state.users.filter((u) => u.tipo === "membro").map((u) => ({ userId: u.id, memberName: u.nome, deliveries: records.filter((r) => String(r.usuario) === String(u.id)).length })).sort((a, b) => b.deliveries - a.deliveries || a.memberName.localeCompare(b.memberName)); }
function computeRouteRanking(records = getCurrentWeekRouteRecords()) { return state.users.filter((u) => u.tipo === "membro").map((u) => ({ userId: u.id, memberName: u.nome, deliveries: records.filter((r) => String(r.usuario) === String(u.id)).reduce((t, r) => t + Number(r.total_entregues || 0), 0) })).sort((a, b) => b.deliveries - a.deliveries || a.memberName.localeCompare(b.memberName)); }
function buildWeeklyArchive(records, valueField) { const grouped = new Map(); records.forEach((r) => { const key = getWeekKey(new Date(r.data)); if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(r); }); return Array.from(grouped.entries()).map(([weekKey, list]) => ({ weekKey, totalDeliveries: list.length, totalValue: list.reduce((t, r) => t + Number(r[valueField] || 0), 0), topMember: (computeRanking(list).find((i) => i.deliveries > 0)?.memberName || "Sem entregas") })).sort((a, b) => b.weekKey.localeCompare(a.weekKey)); }
function getTodayRouteTotal() { return state.routeRecords.filter((r) => toDateKey(r.data) === getDateKey()).reduce((t, r) => t + Number(r.total_entregues || 0), 0); }
function formatRouteProducts(produtos) { return Array.isArray(produtos) ? produtos.map((p) => `${p.nome} (${p.quantidade})`).join(", ") : "Sem produtos"; }
function exportData() { const payload = { generatedAt: new Date().toISOString(), users: state.users, records: state.records, routeRecords: state.routeRecords }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `painel-fazenda-backup-${getDateKey()}.json`; link.click(); URL.revokeObjectURL(url); }
function exportFarmLastMonthReport() {
  if (!isAdmin()) return;
  const month = getMonthRange(-1);
  const records = state.records.filter((record) => isDateInRange(record.data, month.start, month.end));
  if (!records.length) return window.alert("Nao ha registros da meta principal no ultimo mes.");
  const rows = [
    ["Data", "Nome", "Usuario", "Farm", "Materiais", "Dinheiro", "Restantes", "Status"],
    ...records.map((record) => {
      const user = state.users.find((item) => String(item.id) === String(record.usuario));
      return [
        formatDateTime(new Date(record.data)),
        user?.nome || "Usuario removido",
        user?.usuario || "-",
        record.farm || "-",
        record.materiais || 0,
        Number(record.dinheiro || 0).toFixed(2),
        record.restantes || 0,
        record.status || "-",
      ];
    }),
  ];
  downloadExcelCsv(`meta-principal-${month.label}.csv`, rows);
}

function exportRouteLastMonthReport() {
  if (!isAdmin()) return;
  const month = getMonthRange(-1);
  const records = state.routeRecords.filter((record) => isDateInRange(record.data, month.start, month.end));
  if (!records.length) return window.alert("Nao ha registros de rota no ultimo mes.");
  const rows = [
    ["Data", "Nome", "Usuario", "Produtos", "Total Entregue", "Status"],
    ...records.map((record) => {
      const user = state.users.find((item) => String(item.id) === String(record.usuario));
      return [
        formatDateTime(new Date(record.data)),
        user?.nome || "Usuario removido",
        user?.usuario || "-",
        formatRouteProducts(record.produtos),
        record.total_entregues || 0,
        record.status || "-",
      ];
    }),
  ];
  downloadExcelCsv(`farm-rota-${month.label}.csv`, rows);
}

async function resetFarmCurrentMonth() {
  if (!isAdmin()) return;
  const month = getMonthRange(0);
  const confirmed = window.confirm(`Limpar todos os registros da meta principal de ${month.prettyLabel}? Os membros permanecem cadastrados.`);
  if (!confirmed) return;
  await deleteRecordsInMonth("registros", month.start, month.end);
  await refreshData();
  renderApp();
}

async function resetRouteCurrentMonth() {
  if (!isAdmin()) return;
  const month = getMonthRange(0);
  const confirmed = window.confirm(`Limpar todos os registros da rota de ${month.prettyLabel}? Os membros permanecem cadastrados.`);
  if (!confirmed) return;
  await deleteRecordsInMonth("registros_rota", month.start, month.end);
  await refreshData();
  renderApp();
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
function getUserName(userId) { return state.users.find((u) => String(u.id) === String(userId))?.nome || "Usuario removido"; }
function updateFileLabel(input, target) { const file = input.files[0]; target.textContent = file ? file.name : "Nenhum arquivo selecionado"; }
function handleImageButtons(event) { const button = event.target.closest("[data-image]"); if (button) openModal(decodeURIComponent(button.dataset.image)); }
function openModal(src) { els.modalImage.src = src; els.imageModal.classList.remove("hidden"); }
function closeModal() { els.modalImage.src = ""; els.imageModal.classList.add("hidden"); }
function showMessage(element, message, type) { element.textContent = message; element.className = `form-message ${type}`; }
function clearMessage(element) { element.textContent = ""; element.className = "form-message"; }
function getErrorMessage(error) { const message = error?.message || ""; if (message.includes("relation") || message.includes("does not exist")) return "As tabelas do banco ainda nao existem. Execute o SQL inicial e a migracao de rota."; if (message.includes("Failed to fetch")) return "Falha de conexao com o Supabase."; return message || "Nao foi possivel concluir a operacao."; }
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
