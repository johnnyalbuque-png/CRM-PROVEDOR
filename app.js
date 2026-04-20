'use strict';

const STORAGE_KEY = 'crm_leads';

// ── State ──────────────────────────────────────────────────────────────────
let leads = loadLeads();
let sortField = 'empresa';
let sortDir = 'asc';
let pendingDeleteId = null;

// ── Persistence ────────────────────────────────────────────────────────────
function loadLeads() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveLeads() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── DOM refs ───────────────────────────────────────────────────────────────
const leadsBody     = document.getElementById('leadsBody');
const emptyState    = document.getElementById('emptyState');
const totalLeads    = document.getElementById('totalLeads');
const searchInput   = document.getElementById('searchInput');
const filterEstado  = document.getElementById('filterEstado');
const modalOverlay  = document.getElementById('modalOverlay');
const deleteOverlay = document.getElementById('deleteOverlay');
const leadForm      = document.getElementById('leadForm');
const modalTitle    = document.getElementById('modalTitle');
const saveBtn       = document.getElementById('saveBtn');

// ── Filtering & sorting ────────────────────────────────────────────────────
function getVisible() {
  const q     = searchInput.value.trim().toLowerCase();
  const state = filterEstado.value;

  return leads
    .filter(l => {
      const matchQ = !q || [l.empresa, l.cargo, l.email, l.whatsapp]
        .some(v => v && v.toLowerCase().includes(q));
      const matchState = !state || l.estado === state;
      return matchQ && matchState;
    })
    .sort((a, b) => {
      const va = (a[sortField] || '').toLowerCase();
      const vb = (b[sortField] || '').toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  const visible = getVisible();

  totalLeads.textContent = `${leads.length} lead${leads.length !== 1 ? 's' : ''}`;

  if (visible.length === 0) {
    leadsBody.innerHTML = '';
    emptyState.classList.add('visible');
    return;
  }
  emptyState.classList.remove('visible');

  leadsBody.innerHTML = visible.map(l => {
    const wa = l.whatsapp ? formatWA(l.whatsapp) : '';
    return `
    <tr>
      <td class="cell-empresa">${esc(l.empresa)}</td>
      <td>${esc(l.cargo)}</td>
      <td class="cell-email">
        ${l.email ? `<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>` : '—'}
      </td>
      <td class="cell-whatsapp">
        ${wa
          ? `<a href="https://wa.me/55${wa}" target="_blank" rel="noopener">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
               ${esc(l.whatsapp)}
             </a>`
          : '—'}
      </td>
      <td><span class="badge-estado">${esc(l.estado)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="openEdit('${l.id}')" title="Editar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon delete" onclick="openDelete('${l.id}')" title="Excluir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatWA(raw) {
  return raw.replace(/\D/g, '');
}

// ── Sort headers ───────────────────────────────────────────────────────────
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (sortField === field) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDir = 'asc';
    }
    document.querySelectorAll('th[data-sort]').forEach(h => {
      h.classList.remove('sort-asc', 'sort-desc');
    });
    th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    render();
  });
});

// ── Modal helpers ──────────────────────────────────────────────────────────
function openModal() {
  modalOverlay.classList.add('open');
  document.getElementById('empresa').focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  leadForm.reset();
  document.getElementById('leadId').value = '';
  clearErrors();
  modalTitle.textContent = 'Novo Lead';
  saveBtn.textContent = 'Salvar Lead';
}

function openEdit(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  document.getElementById('leadId').value   = lead.id;
  document.getElementById('empresa').value  = lead.empresa;
  document.getElementById('cargo').value    = lead.cargo;
  document.getElementById('email').value    = lead.email;
  document.getElementById('whatsapp').value = lead.whatsapp || '';
  document.getElementById('estado').value   = lead.estado;
  modalTitle.textContent = 'Editar Lead';
  saveBtn.textContent = 'Atualizar Lead';
  openModal();
}

window.openEdit = openEdit;

function openDelete(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  pendingDeleteId = id;
  document.getElementById('deleteLeadName').textContent = lead.empresa;
  deleteOverlay.classList.add('open');
}

window.openDelete = openDelete;

// ── Validation ─────────────────────────────────────────────────────────────
function clearErrors() {
  ['empresa','cargo','email','estado'].forEach(f => {
    const el = document.getElementById(f);
    const err = document.getElementById(f + 'Error');
    if (el) el.classList.remove('error');
    if (err) err.textContent = '';
  });
}

function validate(data) {
  let ok = true;
  const set = (field, msg) => {
    document.getElementById(field).classList.add('error');
    document.getElementById(field + 'Error').textContent = msg;
    ok = false;
  };

  if (!data.empresa.trim()) set('empresa', 'Campo obrigatório');
  if (!data.cargo.trim())   set('cargo',   'Campo obrigatório');
  if (!data.email.trim()) {
    set('email', 'Campo obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    set('email', 'E-mail inválido');
  }
  if (!data.estado) set('estado', 'Selecione um estado');

  return ok;
}

// ── Form submit ────────────────────────────────────────────────────────────
leadForm.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();

  const data = {
    empresa:  document.getElementById('empresa').value.trim(),
    cargo:    document.getElementById('cargo').value.trim(),
    email:    document.getElementById('email').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    estado:   document.getElementById('estado').value,
  };

  if (!validate(data)) return;

  const id = document.getElementById('leadId').value;
  if (id) {
    const idx = leads.findIndex(l => l.id === id);
    if (idx !== -1) leads[idx] = { ...leads[idx], ...data };
  } else {
    leads.push({ id: generateId(), createdAt: Date.now(), ...data });
  }

  saveLeads();
  render();
  closeModal();
});

// ── Delete ─────────────────────────────────────────────────────────────────
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  leads = leads.filter(l => l.id !== pendingDeleteId);
  pendingDeleteId = null;
  saveLeads();
  render();
  deleteOverlay.classList.remove('open');
});

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
  pendingDeleteId = null;
  deleteOverlay.classList.remove('open');
});

// ── Search / filter ────────────────────────────────────────────────────────
searchInput.addEventListener('input', render);
filterEstado.addEventListener('change', render);

// ── Open / close modal ─────────────────────────────────────────────────────
document.getElementById('openModalBtn').addEventListener('click', openModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    deleteOverlay.classList.remove('open');
  }
});

// ── WhatsApp mask ──────────────────────────────────────────────────────────
document.getElementById('whatsapp').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6)      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length > 0) v = `(${v}`;
  this.value = v;
});

// ── Export CSV ─────────────────────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  const visible = getVisible();
  if (visible.length === 0) return alert('Nenhum lead para exportar.');

  const header = ['Empresa', 'Cargo', 'E-mail', 'WhatsApp', 'Estado'];
  const rows   = visible.map(l =>
    [l.empresa, l.cargo, l.email, l.whatsapp || '', l.estado]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );

  const csv  = [header.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `leads_${new Date().toISOString().slice(0,10)}.csv`,
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ── Init ───────────────────────────────────────────────────────────────────
render();
