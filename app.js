/* =============================================================
   app.js — ตรรกะทั้งหมดของเว็บ
   ข้อมูลคอร์สอยู่ใน data/courses.js แก้ที่ไฟล์นั้น
   ระบบชำระเงิน/สลิป เป็นต้นแบบจำลอง (เก็บใน localStorage)
   ============================================================= */

const STORE = 'lms_state_v1';
let state = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || { cart: [], orders: [], my: [] };
  } catch { return { cart: [], orders: [], my: [] }; }
}
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }

/* ---------- utilities ---------- */
const baht = n => Number(n).toLocaleString('th-TH');
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden-x');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add('hidden-x'), 2600);
}

function closeModal() {
  $('modal').classList.add('hidden-x');
  $('modalBox').innerHTML = '';
}

function openModal(html) {
  $('modalBox').innerHTML = `<button onclick="closeModal()" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-lg z-10">✕</button>` + html;
  $('modal').classList.remove('hidden-x');
}

$('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------- init ---------- */
$('fCat').innerHTML = CATEGORIES.map(c => `<option>${c}</option>`).join('');
$('statCourses').textContent = COURSES.length;

/* ---------- render course grid ---------- */
function render() {
  const q = $('q').value.trim().toLowerCase();
  const cat = $('fCat').value;
  const lvl = $('fLevel').value;
  const maxP = Number($('fPrice').value);
  const sort = $('fSort').value;

  let list = COURSES.filter(c => {
    if (q && !(c.title + ' ' + c.desc).toLowerCase().includes(q)) return false;
    if (cat !== 'ทั้งหมด' && c.category !== cat) return false;
    if (lvl !== 'ทั้งหมด' && c.level !== lvl) return false;
    if (c.price > maxP) return false;
    return true;
  });

  const by = {
    pop:    (a, b) => b.students - a.students,
    low:    (a, b) => a.price - b.price,
    high:   (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    new:    (a, b) => a.id.localeCompare(b.id),
  };
  list.sort(by[sort]);

  $('resultCount').textContent = `พบ ${list.length} คอร์ส จากทั้งหมด ${COURSES.length} คอร์ส`;

  $('grid').innerHTML = list.length ? list.map(c => `
    <article class="card bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm flex flex-col">
      <div class="h-32 bg-gradient-to-br ${c.cover} grid place-items-center text-5xl cursor-pointer" onclick="viewCourse('${c.id}')">${c.icon}</div>
      <div class="p-5 flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">${esc(c.category)}</span>
          <span class="text-xs border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full">${esc(c.level)}</span>
        </div>
        <h3 class="font-bold text-lg text-emerald-900 mb-1 cursor-pointer hover:text-emerald-600" onclick="viewCourse('${c.id}')">${esc(c.title)}</h3>
        <p class="text-sm text-emerald-700 mb-3 line-clamp-2">${esc(c.desc)}</p>
        <div class="text-xs text-emerald-600 mb-3">${c.lessons} บทเรียน · ${c.hours} ชม. · Tier ${c.tier} · ${c.credits} เครดิต</div>
        <div class="mt-auto flex items-center justify-between">
          <div>
            <div class="text-2xl font-extrabold text-emerald-600">${baht(c.price)}฿</div>
            <div class="text-xs text-amber-500">★ ${c.rating} (${baht(c.students)})</div>
          </div>
          <div class="flex gap-1.5">
            <button onclick="addCart('${c.id}')" class="px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm hover:bg-emerald-50">+ ตะกร้า</button>
            <button onclick="buyNow('${c.id}')" class="px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600">ซื้อ</button>
          </div>
        </div>
      </div>
    </article>`).join('')
    : `<div class="col-span-full text-center py-16 text-emerald-600">
         <div class="text-5xl mb-3">🍃</div>
         <p>ไม่พบคอร์สที่ตรงกับเงื่อนไข</p>
         <button onclick="resetFilter()" class="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm">ล้างตัวกรอง</button>
       </div>`;
}

function resetFilter() {
  $('q').value = ''; $('fCat').value = 'ทั้งหมด'; $('fLevel').value = 'ทั้งหมด';
  $('fPrice').value = 2000; $('priceLbl').textContent = '2000'; render();
}

/* ---------- course detail ---------- */
function viewCourse(id) {
  const c = COURSES.find(x => x.id === id);
  if (!c) return;
  const owned = state.my.find(m => m.courseId === id);

  openModal(`
    <div class="h-40 bg-gradient-to-br ${c.cover} grid place-items-center text-6xl">${c.icon}</div>
    <div class="p-6">
      <div class="flex flex-wrap gap-2 mb-3">
        <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">${esc(c.category)}</span>
        <span class="text-xs border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full">${esc(c.level)}</span>
        <span class="text-xs border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full">Tier ${c.tier}</span>
        <span class="text-xs border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full">${c.credits} เครดิต</span>
        ${c.certificate ? '<span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">มีใบประกาศ</span>' : ''}
        ${c.lifetime ? '<span class="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">ตลอดชีพ</span>' : ''}
      </div>
      <h2 class="text-2xl font-extrabold text-emerald-900 mb-2">${esc(c.title)}</h2>
      <p class="text-emerald-700 mb-4">${esc(c.desc)}</p>

      <div class="grid grid-cols-3 gap-3 mb-5 text-center">
        <div class="bg-emerald-50 rounded-xl py-3"><div class="text-xl font-extrabold text-emerald-700">${c.lessons}</div><div class="text-xs text-emerald-600">บทเรียน</div></div>
        <div class="bg-emerald-50 rounded-xl py-3"><div class="text-xl font-extrabold text-emerald-700">${c.hours}</div><div class="text-xs text-emerald-600">ชั่วโมง</div></div>
        <div class="bg-emerald-50 rounded-xl py-3"><div class="text-xl font-extrabold text-emerald-700">${baht(c.students)}</div><div class="text-xs text-emerald-600">ผู้เรียน</div></div>
      </div>

      <h3 class="font-bold text-emerald-800 mb-2">สิ่งที่คุณจะได้เรียน</h3>
      <ul class="grid sm:grid-cols-2 gap-1.5 mb-5 text-sm text-emerald-700">
        ${c.topics.map(t => `<li>✓ ${esc(t)}</li>`).join('')}
      </ul>

      <h3 class="font-bold text-emerald-800 mb-2">หลักสูตร (${c.syllabus.length} บท)</h3>
      <ol class="space-y-1.5 mb-5 max-h-56 overflow-y-auto pr-1">
        ${c.syllabus.map(s => `
          <li class="flex items-center gap-3 bg-emerald-50/60 rounded-lg px-3 py-2 text-sm">
            <span class="w-6 h-6 shrink-0 rounded-full bg-emerald-500 text-white grid place-items-center text-xs font-bold">${s.n}</span>
            <span class="flex-1 text-emerald-800">${esc(s.title)}</span>
            <span class="text-xs text-emerald-500">${esc(s.duration)}</span>
          </li>`).join('')}
      </ol>

      <h3 class="font-bold text-emerald-800 mb-2">ไฟล์ประกอบ (${c.files.length})</h3>
      <ul class="space-y-1.5 mb-5">
        ${c.files.map(f => `
          <li class="flex items-center gap-3 border border-emerald-100 rounded-lg px-3 py-2 text-sm">
            <span class="w-8 h-8 shrink-0 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center text-xs font-bold">${esc(f.type)}</span>
            <span class="flex-1 text-emerald-800">${esc(f.name)}</span>
            <span class="text-xs text-emerald-500">${esc(f.size)}</span>
          </li>`).join('')}
      </ul>

      <div class="flex items-center gap-3 bg-emerald-50 rounded-xl p-4 mb-5">
        <div class="text-3xl">${c.instructor.avatar}</div>
        <div class="flex-1">
          <div class="font-bold text-emerald-900">${esc(c.instructor.name)}</div>
          <div class="text-xs text-emerald-600">${esc(c.instructor.title)} · ประสบการณ์ ${esc(c.instructor.experience)} · สอน ${baht(c.instructor.students)} คน</div>
        </div>
      </div>

      ${owned
        ? `<button onclick="closeModal();document.getElementById('mycourses').scrollIntoView()" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold">✓ คุณมีคอร์สนี้แล้ว — ไปเรียนต่อ</button>`
        : `<div class="flex gap-3">
             <button onclick="addCart('${c.id}');toast('เพิ่มลงตะกร้าแล้ว')" class="flex-1 py-3 rounded-xl border-2 border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50">เพิ่มลงตะกร้า</button>
             <button onclick="buyNow('${c.id}')" class="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">ซื้อ ${baht(c.price)} ฿</button>
           </div>`}
    </div>`);
}

/* ---------- cart ---------- */
function addCart(id) {
  if (state.cart.some(x => x.id === id)) return toast('คอร์สนี้อยู่ในตะกร้าแล้ว');
  state.cart.push({ id, qty: 1 });
  save(); cartCount(); toast('เพิ่มลงตะกร้าแล้ว');
}
function cartCount() {
  const n = state.cart.reduce((s, x) => s + x.qty, 0);
  const el = $('cartCount');
  el.textContent = n;
  el.classList.toggle('hidden-x', n === 0);
}
function chQty(id, d) {
  const it = state.cart.find(x => x.id === id);
  if (!it) return;
  it.qty += d;
  if (it.qty <= 0) state.cart = state.cart.filter(x => x.id !== id);
  save(); cartCount(); openCart();
}
function rmCart(id) {
  state.cart = state.cart.filter(x => x.id !== id);
  save(); cartCount(); openCart();
}
function cartTotal() {
  return state.cart.reduce((s, x) => {
    const c = COURSES.find(y => y.id === x.id);
    return s + (c ? c.price * x.qty : 0);
  }, 0);
}

function openCart() {
  if (!state.cart.length) {
    return openModal(`
      <div class="p-10 text-center">
        <div class="text-5xl mb-3">🛒</div>
        <p class="text-emerald-700 mb-4">ตะกร้าว่างอยู่</p>
        <button onclick="closeModal();document.getElementById('courses').scrollIntoView()" class="px-5 py-2 rounded-lg bg-emerald-500 text-white text-sm">ไปดูคอร์ส</button>
      </div>`);
  }
  const rows = state.cart.map(x => {
    const c = COURSES.find(y => y.id === x.id);
    if (!c) return '';
    return `
      <div class="flex items-center gap-3 border border-emerald-100 rounded-xl p-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${c.cover} grid place-items-center text-2xl shrink-0">${c.icon}</div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-emerald-900 truncate">${esc(c.title)}</div>
          <div class="text-xs text-emerald-600">${baht(c.price)} ฿ / ชุด</div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="chQty('${c.id}',-1)" class="w-8 h-8 rounded-lg border border-emerald-200 hover:bg-emerald-50">−</button>
          <span class="w-6 text-center font-bold">${x.qty}</span>
          <button onclick="chQty('${c.id}',1)" class="w-8 h-8 rounded-lg border border-emerald-200 hover:bg-emerald-50">+</button>
        </div>
        <div class="font-bold text-emerald-600 w-24 text-right">${baht(c.price * x.qty)} ฿</div>
        <button onclick="rmCart('${c.id}')" class="text-emerald-400 hover:text-red-500 px-1">✕</button>
      </div>`;
  }).join('');

  openModal(`
    <div class="p-6">
      <h2 class="text-xl font-extrabold text-emerald-900 mb-4">ตะกร้าสินค้า (${state.cart.length} รายการ)</h2>
      <div class="space-y-2 max-h-80 overflow-y-auto mb-4">${rows}</div>
      <div class="border-t border-emerald-100 pt-4 flex items-center justify-between">
        <span class="font-bold text-emerald-800">รวม</span>
        <span class="text-2xl font-extrabold text-emerald-600">${baht(cartTotal())} ฿</span>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="closeModal()" class="flex-1 py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 font-semibold">เลิก</button>
        <button onclick="checkout()" class="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">ชำระเงิน</button>
      </div>
    </div>`);
}

/* ---------- order / payment (จำลอง) ---------- */
let currentOrder = null;

function buyNow(id) { state.cart = [{ id, qty: 1 }]; save(); cartCount(); checkout(); }

function checkout() {
  if (!state.cart.length) return;
  const total = cartTotal();
  // เศษสตางค์เฉพาะออเดอร์ ช่วยจับคู่สลิป
  const cents = Math.floor(Math.random() * 99) + 1;
  const code = 'ORD-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 9000) + 1000);

  currentOrder = { code, total: total + cents / 100, base: total, cents, createdAt: Date.now() };
  state.orders.push(currentOrder);
  save();

  const exp = new Date(Date.now() + 30 * 60000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  openModal(`
    <div class="p-6">
      <h2 class="text-xl font-extrabold text-emerald-900 mb-1">ชำระเงิน</h2>
      <p class="text-xs text-emerald-600 mb-5">เลขที่ออเดอร์ <span class="font-mono font-bold text-emerald-800">${code}</span> · หมดอายุ ${exp}</p>

      <div class="bg-emerald-50 rounded-2xl p-5 mb-5 text-center">
        <div class="text-xs text-emerald-700 mb-3">สแกน QR เพื่อชำระเงิน</div>
        <div id="qr" class="mx-auto mb-3"></div>
        <div class="text-3xl font-extrabold text-emerald-700">${baht(currentOrder.total)} ฿</div>
        <div class="text-xs text-emerald-600 mt-2">${esc(BANK.name)}<br>เลขบัญชี ${esc(BANK.account)}<br>พร้อมเพย์ ${esc(BANK.promptpay)}</div>
      </div>

      <div class="text-xs text-emerald-700 mb-2 font-semibold">1. โอนเงินตามยอดข้างบน (มีเศษสตางค์เฉพาะออเดอร์)</div>
      <div class="text-xs text-emerald-700 mb-4 font-semibold">2. อัปโหลดสลิปเพื่อให้ระบบตรวจสอบ</div>

      <label class="block border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center cursor-pointer hover:bg-emerald-50">
        <input type="file" accept="image/*" class="hidden" onchange="uploadSlip(this)">
        <div id="slipLabel" class="text-emerald-600 text-sm">📎 คลิกเพื่อเลือกรูปสลิป (JPG / PNG)</div>
      </label>

      <button onclick="fakeApprove()" class="mt-4 w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
        ⚙️ จำลองระบบอนุมัติอัตโนมัติ (สำหรับทดสอบ)
      </button>
    </div>`);

  drawQR('https://promptpay.io/' + currentOrder.total.toFixed(2));
}

function drawQR(text) {
  // QR จำลอง: โหลดไลบรารีจริงผ่าน CDN
  const box = $('qr');
  if (!box) return;
  if (window.QRCode) { box.innerHTML = ''; new QRCode(box, { text, width: 168, height: 168, colorDark: '#14532d', colorLight: '#ffffff' }); return; }
  box.innerHTML = '<div class="w-[168px] h-[168px] mx-auto grid place-items-center bg-white border-2 border-emerald-200 rounded-lg text-xs text-emerald-700 text-center px-2">QR<br>' + baht(currentOrder.total) + ' ฿</div>';
}

function uploadSlip(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  if (f.size > 5 * 1024 * 1024) return toast('ไฟล์ใหญ่เกิน 5 MB');
  $('slipLabel').innerHTML = '✅ ' + esc(f.name) + ' (' + (f.size / 1024).toFixed(0) + ' KB)<br><span class="text-xs">กำลังตรวจสอบสลิป...</span>';
  setTimeout(fakeApprove, 1400);
}

function fakeApprove() {
  if (!currentOrder) return;
  $('slipLabel') && ($('slipLabel').innerHTML = '⏳ กำลังตรวจสอบกับธนาคาร...');
  setTimeout(() => {
    for (const it of state.cart) grantCourse(it.id, 'ซื้อเดี่ยว');
    const total = currentOrder.total;
    state.cart = [];
    save(); cartCount(); renderMy();

    openModal(`
      <div class="p-8 text-center">
        <div class="text-6xl mb-3">🎉</div>
        <h2 class="text-2xl font-extrabold text-emerald-800 mb-2">ชำระเงินสำเร็จ</h2>
        <p class="text-emerald-700 mb-1">ยอด ${baht(total)} ฿ · ${esc(currentOrder.code)}</p>
        <p class="text-sm text-emerald-600 mb-6">คุณได้รับสิทธิ์เข้าเรียนแล้ว</p>
        <button onclick="closeModal();document.getElementById('mycourses').scrollIntoView()" class="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold">ไปที่คอร์สของฉัน</button>
      </div>`);
    currentOrder = null;
  }, 1200);
}

/* ---------- grant / my courses ---------- */
function grantCourse(courseId, source) {
  if (state.my.find(m => m.courseId === courseId)) return;
  state.my.push({ courseId, source, progress: 0, lastLesson: 1, at: Date.now() });
  save();
}
function redeem(courseId) {
  const c = COURSES.find(x => x.id === courseId);
  const plan = PLANS[1]; // สมมติเป็นสมาชิก Pro
  if (!c) return;
  if (c.tier > plan.maxTier) return toast(`คอร์สนี้เป็น Tier ${c.tier} — ต้องเป็นสมาชิกระดับสูงกว่า`);
  grantCourse(courseId, 'สมาชิก Pro');
  renderMy(); toast('แลกเครดิตสำเร็จ — เข้าเรียนได้เลย');
}
function continueLesson(courseId) {
  const m = state.my.find(x => x.courseId === courseId);
  const c = COURSES.find(x => x.id === courseId);
  if (!m || !c) return;
  const next = Math.min(m.lastLesson + 1, c.syllabus.length);
  m.lastLesson = next;
  m.progress = Math.round((next / c.syllabus.length) * 100);
  save(); renderMy();
  const lesson = c.syllabus[next - 1];
  openModal(`
    <div class="p-6">
      <div class="text-xs text-emerald-600 mb-1">${esc(c.title)}</div>
      <h2 class="text-xl font-extrabold text-emerald-900 mb-4">บทที่ ${lesson.n}: ${esc(lesson.title)}</h2>
      <div class="aspect-video bg-emerald-900 rounded-xl grid place-items-center mb-4">
        <div class="text-center text-emerald-300">
          <div class="text-5xl mb-2">▶</div>
          <div class="text-xs">เครื่องเล่นวิดีโอ (ต้นแบบ) — ${esc(lesson.duration)}</div>
        </div>
      </div>
      <div class="h-2 bg-emerald-100 rounded-full mb-2"><div class="h-2 bg-emerald-500 rounded-full" style="width:${m.progress}%"></div></div>
      <div class="flex justify-between text-xs text-emerald-600 mb-4"><span>ความคืบหน้า ${m.progress}%</span><span>${next}/${c.syllabus.length} บท</span></div>
      <div class="flex gap-3">
        <button onclick="closeModal();renderMy()" class="flex-1 py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 font-semibold">ปิด</button>
        <button onclick="continueLesson('${courseId}')" class="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold">บทถัดไป →</button>
      </div>
    </div>`);
}

function renderMy() {
  const g = $('myGrid');
  const items = state.my.map(m => ({ m, c: COURSES.find(x => x.id === m.courseId) })).filter(x => x.c);

  if (!items.length) {
    g.innerHTML = `<div class="col-span-full text-center py-14 bg-white rounded-2xl border border-emerald-100">
      <div class="text-5xl mb-3">📚</div>
      <p class="text-emerald-700 mb-1">ยังไม่มีคอร์สในคลังของคุณ</p>
      <p class="text-sm text-emerald-500 mb-5">ลองซื้อคอร์ส หรือแลกเครดิตจากแพ็กเกจ Pro ดู</p>
      <div class="flex gap-2 justify-center flex-wrap">
        <button onclick="document.getElementById('courses').scrollIntoView()" class="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm">ดูคอร์สทั้งหมด</button>
        <button onclick="redeem('c07')" class="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm">ลองแลกเครดิต (React · Tier 2)</button>
      </div>
    </div>`;
    return;
  }

  g.innerHTML = items.map(({ m, c }) => `
    <div class="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex items-center gap-4">
      <div class="w-16 h-16 rounded-xl bg-gradient-to-br ${c.cover} grid place-items-center text-3xl shrink-0">${c.icon}</div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-emerald-900 truncate">${esc(c.title)}</div>
        <div class="text-xs text-emerald-500 mb-2">ได้รับจาก: ${esc(m.source)} · Tier ${c.tier}</div>
        <div class="h-2 bg-emerald-100 rounded-full"><div class="h-2 bg-emerald-500 rounded-full" style="width:${m.progress}%"></div></div>
        <div class="text-xs text-emerald-600 mt-1">ความคืบหน้า ${m.progress}%</div>
      </div>
      <button onclick="continueLesson('${c.id}')" class="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 shrink-0">เรียนต่อ</button>
    </div>`).join('');
}

/* ---------- plans ---------- */
function renderPlans() {
  $('planGrid').innerHTML = PLANS.map((p, i) => {
    const hot = i === 1;
    return hot
      ? `<div class="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-2xl p-7 shadow-xl relative">
           <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-800 px-4 py-1 rounded-full text-xs">คุ้มค่าที่สุด</span>
           <h3 class="text-xl font-bold">${p.name}</h3>
           <div class="text-3xl font-extrabold my-2">${baht(p.price)}<span class="text-sm font-normal text-emerald-100">/ปี</span></div>
           <ul class="space-y-1.5 mb-5 text-sm">${p.feats.map(f => `<li>✓ ${esc(f)}</li>`).join('')}</ul>
           <button onclick="buyPlan('${p.code}')" class="w-full py-3 rounded-lg bg-white text-emerald-700 font-bold hover:bg-emerald-50">เลือก ${p.name}</button>
         </div>`
      : `<div class="bg-white rounded-2xl border-2 border-emerald-100 p-7 shadow-sm">
           <h3 class="text-xl font-bold text-emerald-800">${p.name}</h3>
           <div class="text-3xl font-extrabold text-emerald-600 my-2">${baht(p.price)}<span class="text-sm font-normal text-emerald-400">/ปี</span></div>
           <ul class="space-y-1.5 mb-5 text-sm text-emerald-700">${p.feats.map(f => `<li class="flex gap-2"><span class="text-emerald-500">✓</span>${esc(f)}</li>`).join('')}</ul>
           <button onclick="buyPlan('${p.code}')" class="w-full py-3 rounded-lg bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200">เลือก ${p.name}</button>
         </div>`;
  }).join('');
}

function buyPlan(code) {
  const p = PLANS.find(x => x.code === code);
  if (!p) return;
  openModal(`
    <div class="p-6">
      <h2 class="text-xl font-extrabold text-emerald-900 mb-4">ชำระแพ็กเกจ ${esc(p.name)}</h2>
      <div class="bg-emerald-50 rounded-2xl p-5 mb-4 text-center">
        <div id="qr2" class="mx-auto mb-3"></div>
        <div class="text-2xl font-extrabold text-emerald-700">${baht(p.price)} ฿</div>
      </div>
      <ul class="text-sm text-emerald-700 space-y-1 mb-4">${p.feats.map(f => `<li>✓ ${esc(f)}</li>`).join('')}</ul>
      <div class="border-2 border-dashed border-emerald-300 rounded-xl p-5 text-center mb-4">
        <input type="file" accept="image/*" class="hidden" id="planSlip" onchange="this.nextElementSibling.innerHTML='✅ ได้รับสลิปแล้ว กำลังตรวจสอบ...'">
        <label for="planSlip" class="cursor-pointer text-emerald-600 text-sm">📎 อัปโหลดสลิปเพื่อยืนยันการสมัครสมาชิก</label>
        <div class="text-xs text-emerald-500 mt-2"></div>
      </div>
      <button onclick="approvePlan('${p.code}')" class="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold">ยืนยันการชำระเงิน</button>
    </div>`);
  drawQR2('https://promptpay.io/' + p.price);
}
function drawQR2(text) {
  const box = $('qr2'); if (!box) return;
  if (window.QRCode) { box.innerHTML = ''; new QRCode(box, { text, width: 152, height: 152, colorDark: '#14532d', colorLight: '#fff' }); return; }
  box.innerHTML = '<div class="w-[152px] h-[152px] mx-auto grid place-items-center bg-white border-2 border-emerald-200 rounded-lg text-xs text-emerald-700">QR</div>';
}
function approvePlan(code) {
  const p = PLANS.find(x => x.code === code);
  setTimeout(() => {
    openModal(`
      <div class="p-8 text-center">
        <div class="text-6xl mb-3">🌟</div>
        <h2 class="text-2xl font-extrabold text-emerald-800 mb-2">สมัครสมาชิก ${esc(p.name)} สำเร็จ</h2>
        <p class="text-emerald-700 mb-6">คุณมีสิทธิ์แลกเครดิต ${p.quota === -1 ? 'ไม่จำกัด' : p.quota + ' คอร์ส'} และเข้าถึง Tier ${p.maxTier}</p>
        <button onclick="closeModal();document.getElementById('mycourses').scrollIntoView()" class="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold">ไปที่คอร์สของฉัน</button>
      </div>`);
  }, 900);
}

/* ---------- boot ---------- */
render();
renderPlans();
renderMy();
cartCount();
