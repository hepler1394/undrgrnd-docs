let initializeApp;
let GoogleAuthProvider;
let createUserWithEmailAndPassword;
let getAuth;
let onAuthStateChanged;
let sendEmailVerification;
let signInWithEmailAndPassword;
let signInWithPopup;
let signOut;
let addDoc;
let collection;
let doc;
let getDoc;
let getFirestore;
let onSnapshot;
let query;
let serverTimestamp;
let setDoc;
let updateDoc;
let where;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'undrgrnd-docs.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'undrgrnd-docs',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || 'coryh2014@gmail.com').toLowerCase();
const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId);
let provider = null;

let auth = null;
let db = null;
let currentUser = null;
let isAdmin = false;
let publishedContentRecords = [];
let contentRecords = [];
let leadRecords = [];
let applicationRecords = [];
let unsubscribeAdminData = [];
const dialogFocusOrigins = new WeakMap();

window.platformUser = null;
window.platformIsAdmin = false;
window.platformConfigured = configured;

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message, kind = 'success') {
  const toast = byId('platform-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 4600);
}
window.platformToast = showToast;

function friendlyAuthError(error) {
  const code = error?.code || '';
  const messages = {
    'auth/email-already-in-use': 'That email already has an account. Try logging in.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/weak-password': 'Use a password with at least six characters.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/missing-password': 'Enter your password.',
    'auth/network-request-failed': 'The sign-in service could not be reached. Check your connection and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  };
  return messages[code] || error?.message || 'Authentication failed. Please try again.';
}

function authModal() {
  const modal = byId('auth-modal');
  if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);
  return modal;
}

function openDialog(modal, initialFocus) {
  if (!modal) return;
  dialogFocusOrigins.set(modal, document.activeElement);
  modal.style.display = 'flex';
  modal.dataset.open = 'true';
  modal.removeAttribute('aria-hidden');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => initialFocus?.focus());
}

function closeDialog(modal) {
  if (!modal) return;
  modal.style.display = 'none';
  modal.dataset.open = 'false';
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-scrim[data-open="true"]')) document.body.classList.remove('modal-open');
  const origin = dialogFocusOrigins.get(modal);
  if (origin instanceof HTMLElement && origin.isConnected) origin.focus();
}

function setAuthBusy(busy) {
  const form = authModal()?.querySelector('form');
  form?.setAttribute('aria-busy', String(busy));
  form?.querySelectorAll('[data-auth-action]').forEach((button) => { button.disabled = busy; });
}

document.addEventListener('keydown', (event) => {
  const openModal = [...document.querySelectorAll('.modal-scrim[data-open="true"]')].at(-1);
  if (!openModal) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (openModal.id === 'auth-modal') window.cancelAuthModal();
    else window.closeOutreachModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...openModal.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.getClientRects().length);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement) || !event.target.classList.contains('modal-scrim')) return;
  if (event.target.id === 'auth-modal') window.cancelAuthModal();
  else window.closeOutreachModal();
});

window.openAuthModal = function openAuthModal(reason = 'Sign in to continue') {
  const modal = authModal();
  if (!modal) return;
  const reasonEl = byId('auth-reason');
  if (reasonEl) reasonEl.textContent = reason;
  const errorEl = byId('auth-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }
  openDialog(modal, byId('auth-email'));
};

window.closeAuthModal = function closeAuthModal() {
  const modal = authModal();
  closeDialog(modal);
};

window.cancelAuthModal = function cancelAuthModal() {
  window.pendingDocumentaryId = null;
  window.closeAuthModal();
};

window.checkPlatformAuthForPlayback = function checkPlatformAuthForPlayback(documentary) {
  if (documentary?.freeToWatch) return true;
  if (currentUser) return true;
  window.pendingDocumentaryId = documentary?.id;
  window.openAuthModal('Create a free account or sign in to watch.');
  return false;
};

async function saveViewerProfile(user) {
  if (!db || !user) return;
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    provider: user.providerData?.[0]?.providerId || 'password',
    emailVerified: Boolean(user.emailVerified),
    lastSeenAt: serverTimestamp(),
  }, { merge: true });
}

function updateAccountUi() {
  const accountButton = byId('auth-nav-button');
  if (accountButton) {
    accountButton.textContent = currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0] || 'Account') : 'Sign in';
    accountButton.classList.toggle('signed-in', Boolean(currentUser));
  }
  const adminLink = byId('nav-admin');
  if (adminLink) adminLink.hidden = !isAdmin;
  const creatorStatus = byId('creator-login-status');
  if (creatorStatus) {
    creatorStatus.textContent = currentUser
      ? `Applying as ${currentUser.email}`
      : 'Sign in before sending an application.';
  }
  const creatorEmail = byId('creator-email');
  if (creatorEmail && currentUser?.email) creatorEmail.value = currentUser.email;
}

async function token() {
  if (!currentUser) throw new Error('Sign in is required.');
  return currentUser.getIdToken();
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${await token()}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

window.handleAuth = async function handleAuth(action, event) {
  event?.preventDefault();
  if (!auth) return showToast('Firebase is still being connected.', 'error');
  const email = byId('auth-email')?.value.trim();
  const password = byId('auth-password')?.value || '';
  const errorEl = byId('auth-error');
  if (errorEl) errorEl.hidden = true;
  if (!email || !byId('auth-email')?.checkValidity()) {
    byId('auth-email')?.focus();
    byId('auth-email')?.reportValidity();
    return;
  }
  if (password.length < 6) {
    byId('auth-password')?.focus();
    byId('auth-password')?.reportValidity();
    return;
  }
  setAuthBusy(true);
  try {
    if (action === 'signup') {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(credential.user);
      showToast('Account created. We sent an email verification link.');
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Welcome back.');
    }
    window.closeAuthModal();
  } catch (error) {
    if (errorEl) {
      errorEl.textContent = friendlyAuthError(error);
      errorEl.hidden = false;
    }
  } finally {
    setAuthBusy(false);
  }
};

window.signInWithGoogle = async function signInWithGoogle() {
  if (!auth) return showToast('Firebase is still being connected.', 'error');
  setAuthBusy(true);
  try {
    await signInWithPopup(auth, provider);
    showToast('Signed in with Google.');
    window.closeAuthModal();
  } catch (error) {
    const errorEl = byId('auth-error');
    if (errorEl) {
      errorEl.textContent = friendlyAuthError(error);
      errorEl.hidden = false;
    }
  } finally {
    setAuthBusy(false);
  }
};

window.handleLogout = async function handleLogout() {
  if (auth) await signOut(auth);
  showToast('Signed out.');
  if (typeof window.showView === 'function') window.showView('main');
};

function mergePublishedContent(snapshot) {
  publishedContentRecords = snapshot.docs.map((record) => ({ firebaseId: record.id, ...record.data() }));
  const catalog = window.UNDRGRNDDocs;
  if (!Array.isArray(catalog)) return;
  for (let index = catalog.length - 1; index >= 0; index -= 1) {
    if (catalog[index].firebaseManaged) catalog.splice(index, 1);
  }
  for (const record of publishedContentRecords.filter((item) => item.videoUrl)) {
    catalog.push({
      id: `firebase-${record.firebaseId}`,
      firebaseManaged: true,
      title: record.title || 'Untitled documentary',
      creator: record.creator || 'Independent creator',
      desc: record.description || '',
      video: record.videoUrl,
      poster: record.posterUrl || '/og-image.jpg',
      year: String(record.year || new Date().getFullYear()),
      runtime: record.runtime || '—',
      genre: record.genre || 'Documentary',
      license: record.rights || 'Licensed by creator',
    });
  }
  if (typeof window.renderRows === 'function') window.renderRows();
}

function subscribePublicContent() {
  if (!db) return;
  const publishedContent = query(collection(db, 'content'), where('status', '==', 'published'));
  onSnapshot(publishedContent, mergePublishedContent, () => {
    showToast('The live catalog could not refresh. Existing films are still available.', 'error');
  });
}

function clearAdminSubscriptions() {
  unsubscribeAdminData.forEach((unsubscribe) => unsubscribe());
  unsubscribeAdminData = [];
}

function subscribeAdminData() {
  clearAdminSubscriptions();
  if (!db || !isAdmin) return;
  unsubscribeAdminData.push(onSnapshot(collection(db, 'content'), (snapshot) => {
    contentRecords = snapshot.docs.map((record) => ({ firebaseId: record.id, ...record.data() }));
    renderAdminContent();
  }));
  unsubscribeAdminData.push(onSnapshot(collection(db, 'creatorLeads'), (snapshot) => {
    leadRecords = snapshot.docs.map((record) => ({ id: record.id, ...record.data() }));
    renderCreatorLeads();
  }));
  unsubscribeAdminData.push(onSnapshot(collection(db, 'creatorApplications'), (snapshot) => {
    applicationRecords = snapshot.docs.map((record) => ({ id: record.id, ...record.data() }));
    renderApplications();
  }));
  loadConfigStatus();
}

window.switchAdminPanel = function switchAdminPanel(panel) {
  document.querySelectorAll('.admin-panel').forEach((element) => {
    element.classList.remove('active');
    element.hidden = true;
  });
  document.querySelectorAll('.admin-tab').forEach((element) => {
    element.classList.remove('active');
    element.setAttribute('aria-selected', 'false');
    element.tabIndex = -1;
  });
  const activePanel = byId(`admin-panel-${panel}`);
  const activeTab = document.querySelector(`.admin-tab[data-panel="${panel}"]`);
  if (activePanel) {
    activePanel.hidden = false;
    activePanel.classList.add('active');
  }
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    activeTab.tabIndex = 0;
  }
};

document.querySelector('.admin-tabs')?.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...document.querySelectorAll('.admin-tab')];
  const current = Math.max(0, tabs.indexOf(document.activeElement));
  const next = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? tabs.length - 1
      : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  const tab = tabs[next];
  window.switchAdminPanel(tab.dataset.panel);
  tab.focus();
});

window.switchAdminPanel('content');

function renderAdminContent() {
  const target = byId('admin-content-list');
  if (!target) return;
  byId('admin-content-count').textContent = String(contentRecords.length);
  if (!contentRecords.length) {
    target.innerHTML = '<div class="admin-empty">No Firebase-managed releases yet. Add the first one with the form.</div>';
    return;
  }
  target.innerHTML = contentRecords
    .sort((a, b) => String(a.title).localeCompare(String(b.title)))
    .map((record) => `
      <article class="admin-list-row">
        <img src="${escapeHtml(record.posterUrl || '/og-image.jpg')}" alt="">
        <div><strong>${escapeHtml(record.title)}</strong><span>${escapeHtml(record.creator || 'Unknown creator')} · ${escapeHtml(record.status || 'draft')}</span></div>
        <div class="admin-row-actions">
          <button class="btn-outline admin-edit-content" type="button" data-id="${escapeHtml(record.firebaseId)}">Edit</button>
          <button class="btn-outline admin-archive-content" type="button" data-id="${escapeHtml(record.firebaseId)}">${record.status === 'archived' ? 'Restore draft' : 'Archive'}</button>
        </div>
      </article>`)
    .join('');
  target.querySelectorAll('.admin-edit-content').forEach((button) => button.addEventListener('click', () => editContent(button.dataset.id)));
  target.querySelectorAll('.admin-archive-content').forEach((button) => button.addEventListener('click', () => archiveContent(button.dataset.id)));
}

function editContent(id) {
  const record = contentRecords.find((item) => item.firebaseId === id);
  if (!record) return;
  byId('admin-content-id').value = id;
  const fields = ['title', 'creator', 'year', 'runtime', 'genre', 'status', 'videoUrl', 'posterUrl', 'rights'];
  for (const field of fields) if (byId(`admin-${field}`)) byId(`admin-${field}`).value = record[field] || '';
  byId('admin-description').value = record.description || '';
  byId('admin-content-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function archiveContent(id) {
  const record = contentRecords.find((item) => item.firebaseId === id);
  if (!record) return;
  await updateDoc(doc(db, 'content', id), {
    status: record.status === 'archived' ? 'draft' : 'archived',
    updatedAt: serverTimestamp(),
  });
  showToast(record.status === 'archived' ? 'Release restored to draft.' : 'Release archived.');
}

function uploadFile(file, progressElement) {
  return new Promise(async (resolve, reject) => {
    try {
      const signed = await api('/api/r2-upload-url', {
        method: 'POST',
        body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
      });
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signed.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && progressElement) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          progressElement.textContent = `Uploading ${file.name}: ${percentage}%`;
        }
      };
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300
        ? resolve(signed.publicUrl)
        : reject(new Error(`Media upload failed (${xhr.status}).`));
      xhr.onerror = () => reject(new Error('The media upload lost its connection.'));
      xhr.send(file);
    } catch (error) {
      reject(error);
    }
  });
}

function requireSafeHostedUrl(value, label) {
  if (!value) return '';
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a complete URL.`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`${label} must use HTTPS.`);
  return parsed.href;
}

window.saveAdminContent = async function saveAdminContent(event) {
  event?.preventDefault();
  if (!isAdmin || !db) return showToast('Administrator access is required.', 'error');
  const submit = byId('admin-content-submit');
  const progress = byId('admin-upload-progress');
  submit.disabled = true;
  progress.textContent = 'Preparing release…';
  try {
    const videoFile = byId('admin-video-file').files?.[0];
    const posterFile = byId('admin-poster-file').files?.[0];
    if (videoFile?.size > 10 * 1024 ** 3) throw new Error('Video files must be 10 GB or smaller.');
    if (posterFile?.size > 25 * 1024 ** 2) throw new Error('Poster images must be 25 MB or smaller.');
    if (posterFile && !['image/jpeg', 'image/png', 'image/webp'].includes(posterFile.type)) {
      throw new Error('Poster images must be JPEG, PNG or WebP.');
    }
    let videoUrl = requireSafeHostedUrl(byId('admin-videoUrl').value.trim(), 'Video URL');
    let posterUrl = requireSafeHostedUrl(byId('admin-posterUrl').value.trim(), 'Poster URL');
    if (videoFile) videoUrl = await uploadFile(videoFile, progress);
    if (posterFile) posterUrl = await uploadFile(posterFile, progress);
    if (!videoUrl) throw new Error('Add a video file or hosted video URL.');

    const payload = {
      title: byId('admin-title').value.trim(),
      creator: byId('admin-creator').value.trim(),
      year: byId('admin-year').value.trim(),
      runtime: byId('admin-runtime').value.trim(),
      genre: byId('admin-genre').value.trim(),
      status: byId('admin-status').value,
      description: byId('admin-description').value.trim(),
      rights: byId('admin-rights').value.trim(),
      videoUrl,
      posterUrl,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.email,
    };
    if (!payload.title || !payload.creator) throw new Error('Title and creator are required.');
    const id = byId('admin-content-id').value;
    if (id) {
      await updateDoc(doc(db, 'content', id), payload);
      showToast('Release updated.');
    } else {
      await addDoc(collection(db, 'content'), { ...payload, createdAt: serverTimestamp() });
      showToast(payload.status === 'published' ? 'Release published.' : 'Draft saved.');
    }
    byId('admin-content-form').reset();
    byId('admin-content-id').value = '';
    progress.textContent = '';
  } catch (error) {
    progress.textContent = error.message;
    showToast(error.message, 'error');
  } finally {
    submit.disabled = false;
  }
};

function formatSubscribers(value) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0);
}

function safeExternalUrl(value) {
  try {
    const parsed = new URL(String(value || ''));
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
  } catch {
    return '#';
  }
}

function renderCreatorLeads() {
  const target = byId('creator-lead-list');
  if (!target) return;
  byId('admin-lead-count').textContent = String(leadRecords.length);
  if (!leadRecords.length) {
    target.innerHTML = '<div class="admin-empty">No prospects yet. Run a scan to find smaller independent channels.</div>';
    return;
  }
  target.innerHTML = leadRecords
    .sort((a, b) => {
      const rank = { new: 0, contacted: 1, replied: 2, do_not_contact: 3 };
      return (rank[a.status] ?? 2) - (rank[b.status] ?? 2)
        || String(a.name || '').localeCompare(String(b.name || ''));
    })
    .map((lead) => `
      <article class="lead-row">
        <img src="${escapeHtml(lead.thumbnail || '/icon-192.png')}" alt="">
        <div class="lead-main">
          <a href="${escapeHtml(safeExternalUrl(lead.channelUrl))}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(lead.name)}</strong></a>
          <span>${formatSubscribers(lead.subscribers)} subscribers · ${escapeHtml(lead.status || 'new')}</span>
        </div>
        <input class="form-input lead-email" data-id="${escapeHtml(lead.id)}" type="email" value="${escapeHtml(lead.email || '')}" placeholder="Public contact email" aria-label="Public business email for ${escapeHtml(lead.name)}">
        <button class="btn-outline lead-compose" type="button" data-id="${escapeHtml(lead.id)}" ${lead.status === 'do_not_contact' ? 'disabled' : ''}>Compose</button>
        <button class="text-button lead-suppress" type="button" data-id="${escapeHtml(lead.id)}">${lead.status === 'do_not_contact' ? 'Unsuppress' : 'Do not contact'}</button>
      </article>`)
    .join('');
  target.querySelectorAll('.lead-email').forEach((input) => input.addEventListener('change', async () => {
    await updateDoc(doc(db, 'creatorLeads', input.dataset.id), { email: input.value.trim(), updatedAt: serverTimestamp() });
  }));
  target.querySelectorAll('.lead-compose').forEach((button) => button.addEventListener('click', () => openOutreach(button.dataset.id)));
  target.querySelectorAll('.lead-suppress').forEach((button) => button.addEventListener('click', async () => {
    const lead = leadRecords.find((item) => item.id === button.dataset.id);
    await updateDoc(doc(db, 'creatorLeads', button.dataset.id), {
      status: lead.status === 'do_not_contact' ? 'new' : 'do_not_contact',
      updatedAt: serverTimestamp(),
    });
  }));
}

window.scanCreatorCandidates = async function scanCreatorCandidates() {
  const button = byId('creator-scan-button');
  button.disabled = true;
  button.textContent = 'Scanning…';
  try {
    const queryText = byId('creator-search-queries').value;
    const queries = queryText.split('\n').map((item) => item.trim()).filter(Boolean);
    const result = await api('/api/discover-creators', {
      method: 'POST',
      body: JSON.stringify({ queries, minSubscribers: 1_000, maxSubscribers: 100_000 }),
    });
    for (const creator of result.creators) {
      const leadRef = doc(db, 'creatorLeads', creator.channelId);
      const existing = await getDoc(leadRef);
      const refreshedLead = {
        ...creator,
        updatedAt: serverTimestamp(),
      };
      if (!existing.exists()) {
        refreshedLead.status = 'new';
        refreshedLead.email = '';
      }
      await setDoc(leadRef, refreshedLead, { merge: true });
    }
    showToast(`Added or refreshed ${result.creators.length} creator prospects.`);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Scan YouTube';
  }
};

function openOutreach(id) {
  const lead = leadRecords.find((item) => item.id === id);
  if (!lead?.email) return showToast('Add the creator’s public business email first.', 'error');
  byId('outreach-lead-id').value = id;
  byId('outreach-recipient').value = lead.email;
  byId('outreach-creator-name').value = lead.name;
  byId('outreach-subject').value = `Would ${lead.name} fit UNDRGRND Docs?`;
  byId('outreach-message').value = `Hi ${lead.name},\n\nI run UNDRGRND Docs, a new subscriber-supported home for independent documentaries and field reporting. I found your public channel while looking for emerging creators whose work deserves a direct audience relationship.\n\nWe are inviting a small first group to discuss publishing complete films and reports with creator-controlled rights. I would be glad to show you the platform and hear what a fair deal would look like for you.\n\nBest,\nCory\nUNDRGRND Docs`;
  openDialog(byId('outreach-modal'), byId('outreach-subject'));
}

window.closeOutreachModal = function closeOutreachModal() {
  closeDialog(byId('outreach-modal'));
};

window.sendCreatorOutreach = async function sendCreatorOutreach(event) {
  event?.preventDefault();
  const email = byId('outreach-recipient').value.trim();
  const creatorName = byId('outreach-creator-name').value.trim();
  const subject = byId('outreach-subject').value.trim();
  const message = byId('outreach-message').value.trim();
  if (!window.confirm(`Send this outreach email to ${email}?`)) return;
  const button = byId('outreach-send-button');
  button.disabled = true;
  try {
    const result = await api('/api/send-outreach', {
      method: 'POST',
      body: JSON.stringify({ email, creatorName, subject, message, leadId: byId('outreach-lead-id').value, idempotencyKey: crypto.randomUUID() }),
    });
    const leadId = byId('outreach-lead-id').value;
    await updateDoc(doc(db, 'creatorLeads', leadId), {
      status: 'contacted',
      lastContactedAt: serverTimestamp(),
      lastEmailId: result.id || '',
    });
    await addDoc(collection(db, 'outreachLog'), {
      leadId,
      email,
      subject,
      providerId: result.id || '',
      sentBy: currentUser.email,
      sentAt: serverTimestamp(),
    });
    showToast('Creator outreach sent.');
    window.closeOutreachModal();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    button.disabled = false;
  }
};

function renderApplications() {
  const target = byId('creator-application-list');
  if (!target) return;
  if (!applicationRecords.length) {
    target.innerHTML = '<div class="admin-empty">No creator applications yet.</div>';
    return;
  }
  target.innerHTML = applicationRecords.map((application) => `
    <article class="application-card">
      <div><strong>${escapeHtml(application.name || application.channelName)}</strong><span>${escapeHtml(application.email)} · ${escapeHtml(application.status || 'new')}</span></div>
      <a href="${escapeHtml(safeExternalUrl(application.channelUrl))}" target="_blank" rel="noopener noreferrer">Review work</a>
      <p>${escapeHtml(application.pitch || '')}</p>
    </article>`).join('');
}

window.submitCreatorApplication = async function submitCreatorApplication(event) {
  event.preventDefault();
  if (!currentUser) {
    window.openAuthModal('Sign in before applying to publish.');
    return;
  }
  const name = byId('creator-name').value.trim();
  const channelName = byId('creator-channel-name').value.trim();
  const channelUrl = byId('creator-channel-url').value.trim();
  const audienceSize = byId('creator-audience').value.trim();
  const pitch = byId('creator-pitch').value.trim();
  if (!event.target.reportValidity()) return;
  if (pitch.length < 40) return showToast('Tell us a little more about the reporting project.', 'error');
  try {
    await addDoc(collection(db, 'creatorApplications'), {
      uid: currentUser.uid,
      email: currentUser.email,
      name,
      channelName,
      channelUrl,
      audienceSize,
      pitch,
      rightsConfirmed: byId('creator-rights').checked,
      status: 'new',
      createdAt: serverTimestamp(),
    });
    event.target.reset();
    byId('creator-email').value = currentUser.email || '';
    showToast('Application received. We will review your work and reply by email.');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

async function loadConfigStatus() {
  try {
    const status = await api('/api/config-status');
    const mapping = { email: 'admin-email-status', youtube: 'admin-youtube-status', media: 'admin-media-status', firebase: 'admin-firebase-status' };
    for (const [key, id] of Object.entries(mapping)) {
      const element = byId(id);
      if (!element) continue;
      element.textContent = status[key] ? 'Connected' : 'Needs setup';
      element.dataset.ready = String(status[key]);
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function initializeFirebasePlatform() {
  const [appSdk, authSdk, firestoreSdk] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  ({ initializeApp } = appSdk);
  ({
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
  } = authSdk);
  ({
    addDoc,
    collection,
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
  } = firestoreSdk);

  provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  subscribePublicContent();
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    isAdmin = Boolean(user?.emailVerified && user.email?.toLowerCase() === adminEmail);
    window.platformUser = user;
    window.platformIsAdmin = isAdmin;
    updateAccountUi();
    if (user) {
      await saveViewerProfile(user).catch(() => {});
      window.closeAuthModal();
    }
    subscribeAdminData();
    if (user && window.pendingDocumentaryId != null) {
      const pending = window.pendingDocumentaryId;
      window.pendingDocumentaryId = null;
      const documentary = window.UNDRGRNDDocs?.find((item) => String(item.id) === String(pending));
      if (documentary && typeof window.openDetail === 'function') window.openDetail(documentary);
    }
  });
  return { configured: true };
}

authModal();
updateAccountUi();
if (!configured) {
  document.documentElement.dataset.firebase = 'missing';
  window.platformReady = Promise.resolve({ configured: false });
} else {
  window.platformReady = initializeFirebasePlatform().catch((error) => {
    document.documentElement.dataset.firebase = 'error';
    showToast('Account services could not start. Refresh and try again.', 'error');
    console.error('Firebase initialization failed.', error);
    return { configured: false, error };
  });
}
