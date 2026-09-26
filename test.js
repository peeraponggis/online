/* test.js — ทดสอบ logic โดยไม่ต้องเปิด browser
 * รัน:  node test.js     (ต้อง exit code 0)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
const ok = (n, c, x = '') => c ? (pass++, console.log('  PASS  ' + n)) : (fail++, console.log('  FAIL  ' + n + '  ' + x));
const eq = (n, a, b) => ok(n, JSON.stringify(a) === JSON.stringify(b), `got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);

/* ---- fake DOM ---- */
const store = {};
const mkEl = (id) => ({
  id, value: '', textContent: '', innerHTML: '', className: '',
  style: {}, dataset: {}, files: null,
  classList: {
    _s: new Set(),
    add(...c) { c.forEach(x => this._s.add(x)); },
    remove(...c) { c.forEach(x => this._s.delete(x)); },
    toggle(c, on) { on === undefined ? (this._s.has(c) ? this._s.delete(c) : this._s.add(c)) : (on ? this._s.add(c) : this._s.delete(c)); },
    contains(c) { return this._s.has(c); },
  },
  addEventListener() {}, scrollIntoView() {}, appendChild() {},
  setAttribute() {}, getAttribute() { return null; },
});
const els = {};
const getEl = id => els[id] || (els[id] = mkEl(id));
['q','fCat','fLevel','fPrice','fSort','priceLbl','grid','planGrid','myGrid',
 'resultCount','statCourses','cartCount','modal','modalBox','toast','qr','qr2','slipLabel']
  .forEach(getEl);
els.fCat.value = 'ทั้งหมด';
els.fLevel.value = 'ทั้งหมด';
els.fPrice.value = 2000;

const sandbox = {
  console,
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  },
  document: { getElementById: getEl, createElement: mkEl, addEventListener() {} },
  window: {},
  setTimeout: f => { try { f(); } catch (e) {} },
  clearTimeout: () => {},
  Math, Date, JSON, Number, String, Array, Object, Set, Map, RegExp, Intl,
  parseInt, parseFloat, isNaN, encodeURIComponent,
  alert() {},
  QRCode: function () {},
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
// const/let ใน vm.runInContext เป็น script-scoped ไม่ติด global
// จึงต้องรวมไฟล์เป็น script เดียว แล้วค่อยอ่านค่าจาก sandbox
const SRC = ['data/courses.js', 'app.js'].map(f =>
  fs.readFileSync(path.join(__dirname, f), 'utf8')
).join('\n;\n');

const boot = () => vm.runInContext(SRC + '\n;({ COURSES, PLANS, CATEGORIES, INSTRUCTORS, BANK, render, viewCourse, addCart, chQty, rmCart, cartTotal, openCart, checkout, fakeApprove, grantCourse, redeem, continueLesson, renderMy, resetFilter })', sandbox, { filename: 'bundle.js' });
let A = boot();
const D = A.COURSES, P = A.PLANS, CAT = A.CATEGORIES, INS = A.INSTRUCTORS;
const S = () => JSON.parse(store.lms_state_v1);
const nCards = () => (els.grid.innerHTML.match(/<article/g) || []).length;

console.log('\n=== TEST 1 : DATA ===');
eq('คอร์ส 12 คอร์ส', D.length, 12);
eq('แพ็กเกจ 3 ระดับ', P.length, 3);
ok('id ไม่ซ้ำ', new Set(D.map(c => c.id)).size === D.length);
ok('slug ไม่ซ้ำ', new Set(D.map(c => c.slug)).size === D.length);
ok('category อยู่ในรายการ', D.every(c => CAT.includes(c.category)), D.filter(c => !CAT.includes(c.category)).map(c => c.id).join(','));
ok('level ถูกต้อง', D.every(c => ['ง่าย','ปานกลาง','ยาก'].includes(c.level)));
ok('tier ∈ {1,2,3}', D.every(c => [1,2,3].includes(c.tier)));
ok('price เป็นตัวเลข > 0', D.every(c => typeof c.price === 'number' && c.price > 0));
ok('instructor อยู่ใน INSTRUCTORS', D.every(c => Object.values(INS).includes(c.instructor)));
ok('syllabus ไม่ว่าง', D.every(c => Array.isArray(c.syllabus) && c.syllabus.length));
ok('topics ไม่ว่าง', D.every(c => Array.isArray(c.topics) && c.topics.length));
ok('maxTier ครอบคลุม tier สูงสุด', Math.max(...P.map(p => p.maxTier)) >= Math.max(...D.map(c => c.tier)));
eq('Basic quota = 3', P[0].quota, 3);
eq('Premium quota = -1', P[2].quota, -1);

console.log('\n=== TEST 2 : RENDER / FILTER ===');
eq('boot แสดงการ์ด 12 ใบ', nCards(), 12);
eq('สถิติจำนวนคอร์ส', els.statCourses.textContent, 12);
eq('แสดงแพ็กเกจ 3 ใบ', (els.planGrid.innerHTML.match(/เลือก /g) || []).length, 3);
eq('dropdown หมวดหมู่ 7 รายการ', (els.fCat.innerHTML.match(/<option>/g) || []).length, 7);
ok('dropdown มี AI & Data', els.fCat.innerHTML.includes('AI &amp; Data') || els.fCat.innerHTML.includes('AI & Data'));

els.q.value = 'python'; A.render();
eq('ค้นหา "python" ได้ 2 (c01 + c06)', nCards(), 2);
els.q.value = 'zzzไม่มีจริง'; A.render();
ok('ค้นหาไม่พบ -> empty state', els.grid.innerHTML.includes('ไม่พบคอร์ส'));
els.q.value = ''; A.render();

els.fCat.value = 'Web'; A.render();
eq('กรอง Web ได้ 2', nCards(), 2);
els.fCat.value = 'AI & Data'; A.render();
eq('กรอง AI & Data ได้ 4', nCards(), 4);
els.fCat.value = 'ทั้งหมด';
els.fLevel.value = 'ยาก'; A.render();
eq('กรองระดับยากได้ 5', nCards(), 5);
els.fLevel.value = 'ทั้งหมด';
els.fPrice.value = 500; A.render();
const cheap = nCards();
eq('กรองราคา ≤500 ได้ 4', cheap, 4);
els.fPrice.value = 2000; A.render();
eq('คืนค่าเดิม 12', nCards(), 12);

const pricesOf = () => [...els.grid.innerHTML.matchAll(/text-2xl font-extrabold text-emerald-600">([\d,]+)฿/g)]
  .map(m => Number(m[1].replace(/,/g, '')));
els.fSort.value = 'low'; A.render();
const lo = pricesOf();
ok('เรียงราคา ต่ำ→สูง', lo.every((v, i) => i === 0 || lo[i - 1] <= v), JSON.stringify(lo));
els.fSort.value = 'high'; A.render();
const hi = pricesOf();
ok('เรียงราคา สูง→ต่ำ', hi.every((v, i) => i === 0 || hi[i - 1] >= v), JSON.stringify(hi));
els.fSort.value = 'pop'; A.render();

console.log('\n=== TEST 3 : CART ===');
A.addCart('c01');
eq('เพิ่มตะกร้า 1', S().cart.length, 1);
A.addCart('c01');
eq('เพิ่มซ้ำไม่ได้', S().cart.length, 1);
A.addCart('c02');
eq('เพิ่มอีก 1', S().cart.length, 2);
eq('รวม 390+590', A.cartTotal(), 980);
A.chQty('c01', 1);
eq('เพิ่มจำนวน qty=2', S().cart.find(x => x.id === 'c01').qty, 2);
eq('รวม 780+590', A.cartTotal(), 1370);
A.chQty('c01', -5);
ok('ลดจนติดลบ = ลบออก', !S().cart.some(x => x.id === 'c01'));
eq('รวมเหลือ 590', A.cartTotal(), 590);
eq('badge แสดง 1', els.cartCount.textContent, 1);
ok('badge มองเห็น', !els.cartCount.classList.contains('hidden-x'));

console.log('\n=== TEST 4 : CHECKOUT ===');
const before = S().orders.length;
A.checkout();
eq('เพิ่มออเดอร์ใน state', S().orders.length, before + 1);
const ord = S().orders[S().orders.length - 1];
ok('เลขออเดอร์ขึ้น ORD-', String(ord.code).startsWith('ORD-'), ord.code);
ok('ยอดรวม = 590 + เศษสตางค์ (0.01-0.99)',
   ord.total > 590 && ord.total < 591, String(ord.total));
ok('เก็บเศษสตางค์แยกไว้', typeof ord.cents === 'number' && ord.cents >= 1 && ord.cents <= 99, String(ord.cents));
ok('modal ชำระเงินเปิดแล้ว', !els.modal.classList.contains('hidden-x'));
ok('แสดงเลขออเดอร์ใน modal', els.modalBox.innerHTML.includes(ord.code));
ok('แสดง QR ใน modal', els.qr.innerHTML.length > 0);
A.fakeApprove();
eq('ตะกร้าว่างหลังชำระ', S().cart.length, 0);
eq('ได้สิทธิ์ 1 คอร์ส', S().my.length, 1);
eq('ได้คอร์ส c02', S().my[0].courseId, 'c02');
eq('ที่มา = ซื้อเดี่ยว', S().my[0].source, 'ซื้อเดี่ยว');
A.grantCourse('c02', 'ซื้อเดี่ยว');
eq('ซื้อซ้ำไม่เพิ่มสิทธิ์', S().my.length, 1);

console.log('\n=== TEST 5 : SUBSCRIPTION / TIER ===');
A.redeem('c07');
ok('แลกเครดิต Tier 2 ได้', S().my.some(m => m.courseId === 'c07'));
eq('ที่มา = สมาชิก Pro', S().my.find(m => m.courseId === 'c07').source, 'สมาชิก Pro');
A.redeem('c09');
ok('Tier 3 แลกเครดิตไม่ได้ (Pro ถึง Tier 2)', !S().my.some(m => m.courseId === 'c09'));

console.log('\n=== TEST 6 : PROGRESS / PERSIST ===');
A.continueLesson('c02');
eq('เลื่อนไปบทที่ 2', S().my.find(m => m.courseId === 'c02').lastLesson, 2);
ok('ความคืบหน้าเพิ่ม', S().my.find(m => m.courseId === 'c02').progress > 0);
A.renderMy();
eq('My Courses แสดง 2 คอร์ส', (els.myGrid.innerHTML.match(/เรียนต่อ/g) || []).length, 2);
ok('เขียน localStorage', !!store.lms_state_v1);
ok('state parse ได้', (() => { try { JSON.parse(store.lms_state_v1); return true; } catch { return false; } })());

console.log('\n=== TEST 7 : XSS ===');
A.COURSES.push({ ...D[0], id: 'x1', title: '<img src=x onerror=alert(1)>' });
A.render();
ok('escape HTML แล้ว', !els.grid.innerHTML.includes('<img src=x'));

console.log('\n=== TEST 8 : REGRESSION (encoding + ลิงก์เสีย) ===');
const readRoot = f => {
  const p = path.isAbsolute(f) ? f : path.join(__dirname, f);
  return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
};
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

const appFiles = walk(path.join(__dirname, 'app')).filter(f => /\.(tsx?|css)$/.test(f));
const cjk = /[\u3000-\u9FFF\uAC00-\uD7AF]/;
const badEncoding = appFiles.filter(f => cjk.test(readRoot(f)));
ok('ไม่มีอักษรจีน/ญี่ปุ่น/เกาหลีปนใน app/ (' + appFiles.length + ' ไฟล์)', badEncoding.length === 0, badEncoding.join(', '));

const idx = readRoot('index.html');
ok('index.html ไม่ลิงก์ไป IMPORT_GUIDE.md', !idx.includes('IMPORT_GUIDE.md'));
ok('index.html ลิงก์ไป IMPORT_GUIDE.html', idx.includes('IMPORT_GUIDE.html'));
ok('index.html ไม่ hardcode 5,000+', !idx.includes('5,000+'));
ok('index.html โหลด courses.js ก่อน app.js', idx.indexOf('data/courses.js') < idx.indexOf('src="app.js"'));
ok('index.html ยังโหลด qrcodejs CDN', idx.includes('qrcode.min.js'));

const layout = readRoot(path.join('app', 'layout.tsx'));
ok('layout.tsx import globals.css', /import\s+['"]\.\/globals\.css['"]/.test(layout));
ok('layout.tsx ไม่ import Home จาก ./page', !layout.includes("from './page'"));
ok('layout.tsx render {children}', layout.includes('{children}'));

const page = readRoot(path.join('app', 'page.tsx'));
ok('page.tsx import จาก ./components/', /from\s+'\.\/components\//.test(page));
ok('page.tsx ไม่ hardcode ราคาแพ็กเกจ', !/2,490|4,990/.test(page));

const grid = readRoot(path.join('app', 'components', 'CourseGrid.tsx'));
ok('CourseGrid.tsx ไม่ hardcode คอร์ส', !/const courses\s*=\s*\[/.test(grid));
ok('CourseGrid.tsx อ่านจาก lib/data', grid.includes("../lib/data"));

ok('postcss.config.mjs มีอยู่', fs.existsSync(path.join(__dirname, 'postcss.config.mjs')));
ok('.gitignore มีอยู่', fs.existsSync(path.join(__dirname, '.gitignore')));

const jsonSafe = f => { try { JSON.parse(readRoot(f)); return true; } catch { return false; } };
ok('package.json parse ได้ (ไม่มี BOM)', jsonSafe('package.json'));
ok('tsconfig.json parse ได้ (ไม่มี BOM)', jsonSafe('tsconfig.json'));

const pkg = JSON.parse(readRoot('package.json'));
ok('package.json มี devDependencies', !!pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0);
ok('tailwindcss ถูก pin เป็น v3', /^[\^~]?3\./.test(pkg.devDependencies.tailwindcss || ''));
ok('package.json ไม่มี type: module (ต้องเป็น CommonJS)', pkg.type !== 'module');
ok('tailwind.config.ts ใช้ export default', /export\s+default/.test(readRoot('tailwind.config.ts')));
ok('tailwind content ครอบคลุม data/', /\.\/data\//.test(readRoot('tailwind.config.ts')));

const cssDir = path.join(__dirname, '.next', 'static', 'css');
if (fs.existsSync(cssDir) && fs.readdirSync(cssDir).length) {
  const cssFile = fs.readdirSync(cssDir)[0];
  const css = fs.readFileSync(path.join(cssDir, cssFile), 'utf8');
  const coverParts = [...new Set(D.map(c => c.cover).flatMap(s => s.split(' ')))];
  const missing = coverParts.filter(c => !css.includes('.' + c));
  ok('Tailwind generate gradient จาก data/ ครบ (' + coverParts.length + ' class)', missing.length === 0, missing.join(', '));
} else {
  console.log('  SKIP  ตรวจ CSS ที่ build แล้ว — ยังไม่ได้รัน npm run build');
}

console.log('\n=== TEST 9 : HTTP (server.js จริง) ===');
const http = require('http');
const { spawn } = require('child_process');
const PORT = 18099;

const ask = (p, method = 'GET') => new Promise(resolve => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method }, resp => {
    const status = resp.statusCode;
    const nosniff = resp.headers['x-content-type-options'];
    let bytes = 0;
    resp.on('data', c => { bytes += c.length; });
    resp.on('end', () => resolve({ status, nosniff, bytes }));
  });
  r.on('error', e => resolve({ error: e.message }));
  r.end();
});

const waitReady = child => new Promise(resolve => {
  const t = setTimeout(() => resolve(false), 8000);
  child.stdout.on('data', d => {
    if (String(d).includes('READY')) { clearTimeout(t); resolve(true); }
  });
  child.on('error', () => { clearTimeout(t); resolve(false); });
});

(async () => {
  const child = spawn(process.execPath, [path.join(__dirname, 'server.js'), String(PORT)], {
    cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ready = await waitReady(child);
  if (!ready) {
    ok('server.js สตาร์ทได้', false, 'ไม่ได้เห็น READY ภายใน 8 วินาที');
  } else {
    ok('server.js สตาร์ทได้', true);

    const r1 = await ask('/');
    ok('GET / -> 200', r1.status === 200, String(r1.status));
    ok('GET / ส่งเนื้อหา HTML', r1.bytes > 1000, String(r1.bytes));
    ok('ทุก response มี nosniff', r1.nosniff === 'nosniff', String(r1.nosniff));

    const r2 = await ask('/app.js');
    ok('GET /app.js -> 200', r2.status === 200, String(r2.status));

    const r3 = await ask('/data/courses.js');
    ok('GET /data/courses.js -> 200', r3.status === 200, String(r3.status));

    const r4 = await ask('/IMPORT_GUIDE.html');
    ok('GET /IMPORT_GUIDE.html -> 200 (ลิงก์ใน footer ใช้ได้จริง)', r4.status === 200, String(r4.status));

    const r5 = await ask('/nope.txt');
    ok('GET /nope.txt -> 404', r5.status === 404, String(r5.status));

    const r6 = await ask('/%');
    ok('GET /% -> 400 และไม่ crash', r6.status === 400, String(r6.status));

    const r7 = await ask('/', 'POST');
    ok('POST / -> 405', r7.status === 405, String(r7.status));

    const r8 = await ask('/%2e%2e%5c%2e%2e%5cWindows%2fwin.ini');
    ok('path traversal -> 403', r8.status === 403, String(r8.status));

    const r9 = await ask('/%00');
    ok('NUL byte -> 400 (ไม่ throw)', r9.status === 400, String(r9.status));

    const r10 = await ask('/', 'HEAD');
    ok('HEAD / -> 200', r10.status === 200, String(r10.status));

    const r11 = await ask('/');
    ok('server ยังทำงานหลังผ่าน request พิสูจน์', r11.status === 200, String(r11.status));
  }

  child.kill();
  await new Promise(r => child.on('exit', r));

  console.log('\n' + '='.repeat(46));
  console.log(`  ผ่าน ${pass}  |  ไม่ผ่าน ${fail}`);
  console.log('='.repeat(46));
  process.exit(fail ? 1 : 0);
})();
