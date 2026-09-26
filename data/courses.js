/**
 * data/courses.js — แหล่งข้อมูลคอร์สทั้งหมด
 * ---------------------------------------------------------------
 * แก้ไฟล์นี้ไฟล์เดียว = เพิ่ม/ลบ/แก้คอร์สบนเว็บทันที
 * ดูรายละเอียดแต่ละฟิลด์ได้ที่ IMPORT_GUIDE.html
 *
 * ฟิลด์:
 *   id            string   รหัสเฉพาะ (ห้ามซ้ำ)
 *   slug          string   url สั้น ใช้เป็นลิงก์
 *   title         string   ชื่อคอร์ส
 *   desc          string   คำอธิบายสั้น
 *   category      string   หมวดหมู่  (ดู CATEGORIES)
 *   level         string   'ง่าย' | 'ปานกลาง' | 'ยาก'
 *   tier          number   1 | 2 | 3   (ระดับสิทธิ์เข้าถึงของสมาชิก)
 *   credits       number   ใช้กี่เครดิต (สมาชิกแลกคอร์สนี้)
 *   price         number   ราคาซื้อเดี่ยว (บาท)
 *   icon          string   emoji ไอคอน
 *   cover         string   สีพื้นหลังการ์ด (คลาส tailwind gradient)
 *   rating        number   0.0 - 5.0
 *   students      number   จำนวนผู้เรียน
 *   lessons       number   จำนวนบทเรียน
 *   hours         number   ชั่วโมงเรียน
 *   certificate   boolean  มีใบประกาศนียบัตรไหม
 *   lifetime      boolean  เข้าเรียนตลอดชีพไหม
 *   instructor    object   { name, title, experience, students, avatar }
 *   topics        string[] สิ่งที่จะได้เรียน
 *   syllabus      object[] { n, title, duration }
 *   files         object[] ไฟล์แนบตัวอย่างสำหรับทดสอบการนำเข้า
 */

const CATEGORIES = ['ทั้งหมด', 'เขียนโปรแกรม', 'Web', 'AI & Data', 'ดีไซน์', 'ธุรกิจ', 'มาร์เก็ติ้ง'];

const INSTRUCTORS = {
  somchai:  { name: 'อาจารย์สมชาย ใจดี',    title: 'Senior Software Engineer',   experience: '12 ปี', students: 48200, avatar: '👨‍💻' },
  napat:    { name: 'อาจารย์ณภัทร วงศ์ทอง',  title: 'Frontend Architect',         experience: '10 ปี', students: 31700, avatar: '👩‍💻' },
  chanya:   { name: 'ดร.ชัญญา พิทักษ์',      title: 'Data Scientist, PhD',        experience: '14 ปี', students: 22800, avatar: '👩‍🔬' },
  pip:      { name: 'อาจารย์พิพ ธนาวัฒน์',    title: 'Product Designer',           experience: '9 ปี',  students: 19400, avatar: '🎨' },
  kanya:    { name: 'คุณกัญญา ธีรพงษ์',     title: 'Digital Marketing Lead',      experience: '11 ปี', students: 26100, avatar: '📣' },
  somchit2: { name: 'ดร.สมชิต วงศ์ไพศาล',    title: 'Cloud & DevOps Architect',    experience: '15 ปี', students: 15300, avatar: '☁️' },
};

const COURSES = [
  {
    id: 'c01', slug: 'python-beginner', title: 'Python for Beginners',
    desc: 'เริ่มต้นเขียนโปรแกรม Python ตั้งแต่ศูนย์ ไม่ต้องมีพื้นฐาน',
    category: 'เขียนโปรแกรม', level: 'ง่าย', tier: 1, credits: 1, price: 390,
    icon: '🐍', cover: 'from-emerald-100 to-green-100', rating: 4.9, students: 1234,
    lessons: 18, hours: 12, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.somchai,
    topics: ['ติดตั้ง Python และเครื่องมือ', 'ตัวแปรและชนิดข้อมูล', 'เงื่อนไขและลูป', 'ฟังก์ชัน', 'อ่าน/เขียนไฟล์', 'โปรเจกต์ Web Scraper'],
    syllabus: [
      { n: 1, title: 'แนะนำ Python และการติดตั้ง', duration: '25 นาที' },
      { n: 2, title: 'ตัวแปรและชนิดข้อมูล', duration: '40 นาที' },
      { n: 3, title: 'เงื่อนไข if/else', duration: '35 นาที' },
      { n: 4, title: 'ลูป for / while', duration: '45 นาที' },
      { n: 5, title: 'ฟังก์ชันและพารามิเตอร์', duration: '50 นาที' },
      { n: 6, title: 'โครงสร้างข้อมูลแบบ List / Dict', duration: '55 นาที' },
      { n: 7, title: 'จัดการข้อผิดพลาด (Exception)', duration: '30 นาที' },
      { n: 8, title: 'อ่านและเขียนไฟล์', duration: '35 นาที' },
      { n: 9, title: 'โปรเจกต์จริง: Web Scraper', duration: '90 นาที' },
    ],
    files: [
      { name: 'slide-intro.pdf', size: '2.4 MB', type: 'PDF' },
      { name: 'exercise-01.zip', size: '1.1 MB', type: 'ZIP' },
      { name: 'cheatsheet-python.pdf', size: '680 KB', type: 'PDF' },
    ],
  },
  {
    id: 'c02', slug: 'web-development', title: 'Web Development ครบวงจร',
    desc: 'สร้างเว็บไซต์ครบวงจรด้วย HTML, CSS, JavaScript',
    category: 'Web', level: 'ปานกลาง', tier: 1, credits: 1, price: 590,
    icon: '🌐', cover: 'from-sky-100 to-blue-100', rating: 4.8, students: 890,
    lessons: 24, hours: 16, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.napat,
    topics: ['โครงสร้าง HTML เชิงความหมาย', 'CSS Flexbox และ Grid', 'JavaScript ES6+', 'Fetch API', 'พื้นฐาน Responsive Design', 'อัปโหลดขึ้น Hosting'],
    syllabus: [
      { n: 1, title: 'ติดตั้งเครื่องมือ', duration: '30 นาที' },
      { n: 2, title: 'HTML เชิงความหมาย', duration: '55 นาที' },
      { n: 3, title: 'CSS: ตัวเลือก กล่อง ระยะห่าง', duration: '60 นาที' },
      { n: 4, title: 'Flexbox และ CSS Grid', duration: '75 นาที' },
      { n: 5, title: 'JavaScript พื้นฐาน', duration: '80 นาที' },
      { n: 6, title: 'DOM Manipulation', duration: '70 นาที' },
      { n: 7, title: 'Fetch API เชื่อม API จริง', duration: '65 นาที' },
      { n: 8, title: 'ทำ Responsive ทุกขนาดจอ', duration: '50 นาที' },
      { n: 9, title: 'โปรเจกต์จริง: Portfolio Website', duration: '120 นาที' },
    ],
    files: [
      { name: 'starter-template.zip', size: '3.2 MB', type: 'ZIP' },
      { name: 'design-cheatsheet.pdf', size: '1.4 MB', type: 'PDF' },
    ],
  },
  {
    id: 'c03', slug: 'machine-learning', title: 'Machine Learning ฉบับเข้าใจง่าย',
    desc: 'เข้าใจ AI และการเรียนรู้ของเครื่อง ด้วยตัวอย่างจริง',
    category: 'AI & Data', level: 'ยาก', tier: 2, credits: 2, price: 790,
    icon: '🤖', cover: 'from-violet-100 to-purple-100', rating: 5.0, students: 567,
    lessons: 32, hours: 24, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.chanya,
    topics: ['Supervised vs Unsupervised', 'Linear Regression', 'Decision Tree', 'Random Forest', 'Neural Network', 'ประเมินโมเดล (Accuracy / F1)'],
    syllabus: [
      { n: 1, title: 'ML คืออะไร', duration: '35 นาที' },
      { n: 2, title: 'เตรียมข้อมูลและทำความสะอาด', duration: '70 นาที' },
      { n: 3, title: 'Linear Regression', duration: '80 นาที' },
      { n: 4, title: 'Classification และ Logistic Regression', duration: '85 นาที' },
      { n: 5, title: 'Decision Tree / Random Forest', duration: '90 นาที' },
      { n: 6, title: 'Neural Network พื้นฐาน', duration: '100 นาที' },
      { n: 7, title: 'ประเมินและปรับปรุงโมเดล', duration: '75 นาที' },
      { n: 8, title: 'โปรเจกต์จริง: ทำนายราคาบ้าน', duration: '150 นาที' },
    ],
    files: [
      { name: 'dataset-house.csv', size: '890 KB', type: 'CSV' },
      { name: 'notebook-lab.zip', size: '5.6 MB', type: 'ZIP' },
      { name: 'formula-reference.pdf', size: '1.1 MB', type: 'PDF' },
    ],
  },
  {
    id: 'c04', slug: 'ux-ui-design', title: 'UX/UI Design สำหรับมือใหม่',
    desc: 'ออกแบบประสบการณ์ใช้งานที่ดี ผ่านหลักการสากล',
    category: 'ดีไซน์', level: 'ปานกลาง', tier: 1, credits: 1, price: 490,
    icon: '🎨', cover: 'from-pink-100 to-rose-100', rating: 4.7, students: 345,
    lessons: 20, hours: 14, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.pip,
    topics: ['หลักการ UX 5 ข้อ', 'User Research', 'Wireframe', 'Design System', 'Figma พื้นฐาน', 'Prototype & Test'],
    syllabus: [
      { n: 1, title: 'UX คืออะไร', duration: '30 นาที' },
      { n: 2, title: 'วิจัยผู้ใช้ (User Research)', duration: '60 นาที' },
      { n: 3, title: 'Persona และ User Journey', duration: '55 นาที' },
      { n: 4, title: 'Wireframe ด้วย Figma', duration: '80 นาที' },
      { n: 5, title: 'Design System และ Component', duration: '75 นาที' },
      { n: 6, title: 'สี ตัวอักษร และ Typography', duration: '45 นาที' },
      { n: 7, title: 'ทำ Prototype และทดสอบ', duration: '65 นาที' },
    ],
    files: [
      { name: 'figma-starter.fig', size: '2.8 MB', type: 'FIG' },
      { name: 'ui-kit.pdf', size: '3.9 MB', type: 'PDF' },
    ],
  },
  {
    id: 'c05', slug: 'digital-marketing', title: 'Digital Marketing',
    desc: 'การตลาดดิจิทัลเพื่อเพิ่มยอดขายออนไลน์',
    category: 'มาร์เก็ติ้ง', level: 'ปานกลาง', tier: 1, credits: 1, price: 690,
    icon: '📊', cover: 'from-amber-100 to-orange-100', rating: 4.6, students: 789,
    lessons: 22, hours: 15, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.kanya,
    topics: ['SEO', 'Google Ads', 'Meta Ads', 'อีเมลมาร์เก็ติ้ง', 'Analytics', 'กลยุทธ์เนื้อหา'],
    syllabus: [
      { n: 1, title: 'ภาพรวม Digital Marketing', duration: '35 นาที' },
      { n: 2, title: 'SEO: คำสำคัญและโครงสร้างเว็บ', duration: '75 นาที' },
      { n: 3, title: 'Google Ads ตั้งแต่เริ่มจนได้คลิก', duration: '85 นาที' },
      { n: 4, title: 'Meta Ads และการทำแคมเปญ', duration: '70 นาที' },
      { n: 5, title: 'อีเมลมาร์เก็ติ้งและ Automation', duration: '60 นาที' },
      { n: 6, title: 'วิเคราะห์ผลด้วย Analytics', duration: '55 นาที' },
    ],
    files: [
      { name: 'ads-template.xlsx', size: '420 KB', type: 'XLSX' },
      { name: 'keyword-tool.csv', size: '180 KB', type: 'CSV' },
    ],
  },
  {
    id: 'c06', slug: 'data-science', title: 'Data Science ด้วย Python',
    desc: 'วิเคราะห์ข้อมูลด้วย Python, Pandas และ Matplotlib',
    category: 'AI & Data', level: 'ยาก', tier: 2, credits: 2, price: 890,
    icon: '📈', cover: 'from-teal-100 to-cyan-100', rating: 4.8, students: 456,
    lessons: 28, hours: 20, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.chanya,
    topics: ['Pandas', 'Matplotlib', 'Seaborn', 'Statistics เบื้องต้น', 'Data Cleaning', 'Dashboard'],
    syllabus: [
      { n: 1, title: 'เตรียมข้อมูลและ Pandas', duration: '70 นาที' },
      { n: 2, title: 'สถิติเบื้องต้น', duration: '65 นาที' },
      { n: 3, title: 'ทำความสะอาดข้อมูลจริง', duration: '80 นาที' },
      { n: 4, title: 'Matplotlib และ Seaborn', duration: '75 นาที' },
      { n: 5, title: 'สร้าง Dashboard', duration: '70 นาที' },
      { n: 6, title: 'โปรเจกต์จริง: รายงานยอดขาย', duration: '140 นาที' },
    ],
    files: [
      { name: 'sales-dataset.xlsx', size: '1.9 MB', type: 'XLSX' },
      { name: 'analysis-starter.zip', size: '4.4 MB', type: 'ZIP' },
    ],
  },
  {
    id: 'c07', slug: 'react-nextjs', title: 'React และ Next.js เต็มรูปแบบ',
    desc: 'สร้างเว็บแอปสมัยใหม่ด้วย React และ Next.js',
    category: 'Web', level: 'ยาก', tier: 2, credits: 2, price: 990,
    icon: '⚛️', cover: 'from-cyan-100 to-sky-100', rating: 4.9, students: 1102,
    lessons: 38, hours: 28, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.napat,
    topics: ['React Component', 'Hooks', 'Next.js App Router', 'Server Components', 'State Management', 'Deploy ขึ้น Cloud'],
    syllabus: [
      { n: 1, title: 'แนะนำ React และระบบ Component', duration: '60 นาที' },
      { n: 2, title: 'JSX และ Props', duration: '55 นาที' },
      { n: 3, title: 'Hooks: useState / useEffect', duration: '80 นาที' },
      { n: 4, title: 'Next.js App Router', duration: '90 นาที' },
      { n: 5, title: 'Server Components และ Data Fetching', duration: '85 นาที' },
      { n: 6, title: 'Styling และ Responsive', duration: '50 นาที' },
      { n: 7, title: 'Deploy ขึ้น Cloudflare / Vercel', duration: '40 นาที' },
      { n: 8, title: 'โปรเจกต์จริง: เว็บ SaaS', duration: '180 นาที' },
    ],
    files: [
      { name: 'nextjs-starter.zip', size: '6.2 MB', type: 'ZIP' },
      { name: 'component-library.zip', size: '3.3 MB', type: 'ZIP' },
      { name: 'cheatsheet-nextjs.pdf', size: '1.6 MB', type: 'PDF' },
    ],
  },
  {
    id: 'c08', slug: 'excel-advanced', title: 'Excel ขั้นสูงเพื่อการทำงาน',
    desc: 'สูตร ตาราง Pivot และรายงานอัตโนมัติ',
    category: 'ธุรกิจ', level: 'ง่าย', tier: 1, credits: 1, price: 390,
    icon: '📗', cover: 'from-lime-100 to-green-100', rating: 4.7, students: 2340,
    lessons: 16, hours: 10, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.kanya,
    topics: ['สูตรขั้นสูง', 'VLOOKUP / XLOOKUP', 'Conditional Formatting', 'Pivot Table', 'สร้างรายงานอัตโนมัติ'],
    syllabus: [
      { n: 1, title: 'ทบทวนพื้นฐาน', duration: '30 นาที' },
      { n: 2, title: 'สูตรสำคัญ (VLOOKUP, IF, SUMIFS)', duration: '50 นาที' },
      { n: 3, title: 'จัดรูปแบบข้อมูลอัตโนมัติ', duration: '45 นาที' },
      { n: 4, title: 'Pivot Table และกราฟ', duration: '60 นาที' },
      { n: 5, title: 'สร้าง Dashboard สำหรับผู้บริหาร', duration: '70 นาที' },
    ],
    files: [
      { name: 'template-dashboard.xlsx', size: '2.1 MB', type: 'XLSX' },
      { name: 'formula-list.pdf', size: '540 KB', type: 'PDF' },
    ],
  },
  {
    id: 'c09', slug: 'cloud-devops', title: 'Cloud และ DevOps',
    desc: 'ปล่อยเว็บขึ้น Cloud แบบอัตโนมัติ ไม่กลัวพัง',
    category: 'AI & Data', level: 'ยาก', tier: 3, credits: 3, price: 1490,
    icon: '☁️', cover: 'from-slate-100 to-gray-200', rating: 4.8, students: 218,
    lessons: 30, hours: 26, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.somchit2,
    topics: ['Docker', 'CI/CD', 'Cloudflare Workers', 'R2 / S3', 'Monitoring', 'Backup'],
    syllabus: [
      { n: 1, title: 'เข้าใจ Cloud และเลือกใช้', duration: '40 นาที' },
      { n: 2, title: 'Docker และ Container', duration: '90 นาที' },
      { n: 3, title: 'Cloudflare Workers + Pages', duration: '80 นาที' },
      { n: 4, title: 'Storage และ Signed URL', duration: '60 นาที' },
      { n: 5, title: 'ตั้ง CI/CD ด้วย GitHub Actions', duration: '75 นาที' },
      { n: 6, title: 'Monitoring และ Alert', duration: '55 นาที' },
      { n: 7, title: 'Backup และกู้คืน', duration: '50 นาที' },
    ],
    files: [
      { name: 'docker-compose.yml', size: '8 KB', type: 'YML' },
      { name: 'github-actions.zip', size: '1.2 MB', type: 'ZIP' },
      { name: 'production-checklist.pdf', size: '760 KB', type: 'PDF' },
    ],
  },
  {
    id: 'c10', slug: 'sql-database', title: 'SQL และการออกแบบฐานข้อมูล',
    desc: 'เขียน Query และออกแบบฐานข้อมูลที่ถูกต้อง',
    category: 'เขียนโปรแกรม', level: 'ปานกลาง', tier: 1, credits: 1, price: 590,
    icon: '🗄️', cover: 'from-indigo-100 to-blue-100', rating: 4.7, students: 1670,
    lessons: 21, hours: 14, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.somchai,
    topics: ['SELECT / JOIN / GROUP BY', 'Normalization', 'Index', 'Transaction', 'ออกแบบ ERD'],
    syllabus: [
      { n: 1, title: 'ฐานข้อมูลคืออะไร', duration: '25 นาที' },
      { n: 2, title: 'SELECT พื้นฐาน', duration: '50 นาที' },
      { n: 3, title: 'JOIN ทุกแบบ', duration: '70 นาที' },
      { n: 4, title: 'GROUP BY และ Aggregate', duration: '55 นาที' },
      { n: 5, title: 'Normalization 1NF ถึง 3NF', duration: '65 นาที' },
      { n: 6, title: 'Index และ Performance', duration: '45 นาที' },
      { n: 7, title: 'Transaction และ Lock', duration: '40 นาที' },
    ],
    files: [
      { name: 'schema-example.sql', size: '24 KB', type: 'SQL' },
      { name: 'practice-db.sqlite', size: '3.4 MB', type: 'DB' },
    ],
  },
  {
    id: 'c11', slug: 'figma-masterclass', title: 'Figma ระดับมืออาชีพ',
    desc: 'ออกแบบระบบ UI ที่ใช้งานได้จริงในทีม',
    category: 'ดีไซน์', level: 'ยาก', tier: 2, credits: 2, price: 690,
    icon: '🖌️', cover: 'from-fuchsia-100 to-pink-100', rating: 4.6, students: 980,
    lessons: 26, hours: 18, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.pip,
    topics: ['Auto Layout', 'Components และ Variants', 'Design Tokens', 'Interactive Prototype', 'ส่งงานให้ Dev'],
    syllabus: [
      { n: 1, title: 'เครื่องมือใน Figma', duration: '35 นาที' },
      { n: 2, title: 'Auto Layout อย่างมืออาชีพ', duration: '55 นาที' },
      { n: 3, title: 'Components และ Variants', duration: '70 นาที' },
      { n: 4, title: 'Design Tokens และธีมสี', duration: '50 นาที' },
      { n: 5, title: 'Prototype ที่โตโตได้', duration: '60 นาที' },
      { n: 6, title: 'Handoff ให้ Developer', duration: '40 นาที' },
    ],
    files: [
      { name: 'design-system.fig', size: '7.8 MB', type: 'FIG' },
      { name: 'icon-pack.zip', size: '2.6 MB', type: 'ZIP' },
    ],
  },
  {
    id: 'c12', slug: 'prompt-engineering', title: 'Prompt Engineering ใช้ AI อย่างมืออาชีพ',
    desc: 'เขียน Prompt ที่ได้ผลลัพธ์ตรงใจ ทุกครั้ง',
    category: 'AI & Data', level: 'ง่าย', tier: 1, credits: 1, price: 450,
    icon: '✨', cover: 'from-yellow-100 to-amber-100', rating: 4.9, students: 3210,
    lessons: 14, hours: 8, certificate: true, lifetime: true,
    instructor: INSTRUCTORS.chanya,
    topics: ['โครงสร้าง Prompt', 'Few-shot', 'Chain of Thought', 'ทำงานกับระบบ RAG', 'ป้องกัน AI หลอก'],
    syllabus: [
      { n: 1, title: 'Prompt คืออะไร', duration: '20 นาที' },
      { n: 2, title: 'โครงสร้าง Prompt ที่ได้ผล', duration: '40 นาที' },
      { n: 3, title: 'Few-shot และตัวอย่าง', duration: '35 นาที' },
      { n: 4, title: 'Chain of Thought', duration: '40 นาที' },
      { n: 5, title: 'ทำระบบ RAG แบบง่าย', duration: '55 นาที' },
      { n: 6, title: 'ตรวจสอบคำตอบ AI ไม่ให้เชื่อมั่นผิด', duration: '30 นาที' },
    ],
    files: [
      { name: 'prompt-library.pdf', size: '1.2 MB', type: 'PDF' },
      { name: 'prompt-template.docx', size: '180 KB', type: 'DOCX' },
    ],
  },
];

const PLANS = [
  { code: 'basic',   name: 'Basic',   price: 990,  quota: 3,       maxTier: 1, feats: ['3 คอร์สต่อปี', 'เข้าถึงคอร์ส Tier 1', 'ดูซ้ำได้ 1 ปี', 'ใบประกาศนียบัตร'] },
  { code: 'pro',     name: 'Pro',     price: 2490, quota: 10,      maxTier: 2, feats: ['10 คอร์สต่อปี', 'เข้าถึง Tier 1-2', 'ไฟล์ประกอบครบ', 'ใบประกาศนียบัตร', 'Live Q&A ทุกเดือน'] },
  { code: 'premium', name: 'Premium', price: 4990, quota: -1,      maxTier: 3, feats: ['ไม่จำกัดคอร์ส', 'เข้าถึง Tier 1-3', 'ไฟล์ประกอบครบ', 'ใบประกาศนียบัตร', 'Live Q&A และกลุ่มปิดส่วนตัว', 'ได้คอร์สใหม่ฟรี'] },
];

const BANK = {
  name: 'บริษัท คอร์สออนไลน์ จำกัด',
  account: '123-4-56789-012',
  promptpay: '0123456789',
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATEGORIES, INSTRUCTORS, COURSES, PLANS, BANK };
}
