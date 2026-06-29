import type { CSSProperties } from "react";

// Deterministic firefly/star positions (seeded) so SSR and client markup match.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Dot = { fly: boolean; left: number; top: number; size: number; delay: number };

function genStars(seed: number, n: number, flies: number): Dot[] {
  const r = mulberry32(seed);
  const out: Dot[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ fly: false, left: r() * 100, top: r() * 100, size: r() * 1.6 + 1, delay: r() * 3 });
  }
  for (let i = 0; i < flies; i++) {
    out.push({ fly: true, left: r() * 100, top: r() * 88, size: r() * 3 + 3, delay: r() * 3 });
  }
  return out;
}

const HERO_STARS = genStars(1, 45, 22);
const FOOT_STARS = genStars(2, 30, 14);

function Stars({ dots }: { dots: Dot[] }) {
  return (
    <div className="stars" aria-hidden>
      {dots.map((d, i) => (
        <i
          key={i}
          className={d.fly ? "fly" : undefined}
          style={
            {
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              animationDelay: `${d.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

const features = [
  { icon: "/images/assets/5.png", title: "Học tập đa dạng", desc: "Đầy đủ các môn học theo chương trình tiểu học." },
  { icon: "/images/assets/6.png", title: "Học mà chơi", desc: "Bài học sinh động, trò chơi thú vị, tăng hứng thú học tập." },
  { icon: "/images/assets/7.png", title: "Tiến bộ mỗi ngày", desc: "Theo dõi tiến độ, nhận huy hiệu và phần thưởng xứng đáng." },
  { icon: "/images/assets/8.png", title: "An toàn – Lành mạnh", desc: "Môi trường học tập an toàn, nội dung được kiểm duyệt kỹ càng." },
  { icon: "/images/assets/9.png", title: "Kết nối phụ huynh", desc: "Phụ huynh dễ dàng theo dõi và đồng hành cùng con mỗi ngày." },
];

const subjects = [
  { name: "Toán học", c: "c-blue" },
  { name: "Tiếng Việt", c: "c-green" },
  { name: "Tiếng Anh", c: "c-orange" },
  { name: "Khoa học", c: "c-purple" },
  { name: "Lịch sử & Địa lý", c: "c-pink" },
  { name: "Kỹ năng sống", c: "c-teal" },
];

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GooglePlayIcon = () => (
  <svg viewBox="0 0 512 512">
    <path fill="#00d3ff" d="M48 32l232 224L48 480c-9-4-16-14-16-26V58c0-12 7-22 16-26z" />
    <path fill="#ffce00" d="M392 200l-112 56 64 64 80-48c20-12 20-60-32-72z" />
    <path fill="#ff3d3d" d="M280 256L48 32c2-1 5-1 8 0l288 168z" />
    <path fill="#00e676" d="M280 256L56 480c-3 1-6 1-8 0l296-160z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512">
    <path
      fill="currentColor"
      d="M318 268c-1-50 41-74 43-75-23-34-59-39-72-39-31-3-60 18-75 18-16 0-39-18-64-17-33 0-63 19-80 49-34 59-9 147 25 195 16 23 36 49 62 48 25-1 34-16 64-16 30 0 38 16 64 15 27 0 43-23 59-47 19-27 26-53 27-54-1-1-52-20-53-80zM267 86c14-17 23-40 21-63-20 1-45 13-59 30-13 15-25 39-22 62 22 2 45-11 60-29z"
    />
  </svg>
);

export default function HomePage() {
  return (
    <div className="ld-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header>
        <div className="wrap nav">
          <a className="brand" href="/">
            <img src="/images/assets/2.png" alt="Đồi đom đóm" />
            <span>Đồi đom đóm</span>
          </a>
          <ul className="menu">
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#features">Tính năng</a></li>
            <li><a href="#subjects">Lợi ích</a></li>
            <li><a href="#parent">Phụ huynh</a></li>
            <li><a href="#cta">Giới thiệu</a></li>
          </ul>
          <a href="#cta" className="pill">Tải ứng dụng</a>
          <details className="ham">
            <summary aria-label="Mở menu">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                <g stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </g>
              </svg>
            </summary>
            <div className="ham__drop">
              <a href="#">Trang chủ</a>
              <a href="#features">Tính năng</a>
              <a href="#subjects">Lợi ích</a>
              <a href="#parent">Phụ huynh</a>
              <a href="#cta">Giới thiệu</a>
            </div>
          </details>
        </div>
      </header>

      <section className="hero">
        <Stars dots={HERO_STARS} />
        <div className="moon" />
        <div className="wrap hero-grid">
          <div>
            <h1>
              Học vui mỗi ngày
              <br />
              Sáng tỏ <span className="accent">tương lai</span>
            </h1>
            <p className="lead">
              Đồi đom đóm là ứng dụng học tập toàn diện dành cho học sinh tiểu học, giúp các em học vui – hiểu sâu – nhớ lâu mỗi ngày.
            </p>
            <div className="store-row">
              <a className="store store--light" href="#">
                <span className="ic"><GooglePlayIcon /></span>
                <span><small>Tải trên</small><strong>Google Play</strong></span>
              </a>
              <a className="store store--light" href="#">
                <span className="ic"><AppleIcon /></span>
                <span><small>Tải trên</small><strong>App Store</strong></span>
              </a>
            </div>
          </div>
          <div className="hero-art">
            <img className="hero-bee" src="/images/assets/3.png" alt="Linh vật Đồi đom đóm" />
          </div>
        </div>
        <div className="wave-top">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,50 C240,90 480,90 720,60 C960,30 1200,10 1440,40 L1440,90 L0,90 Z" />
          </svg>
        </div>
      </section>

      <section className="features" id="features">
        <div className="wrap">
          <div className="feature-grid">
            {features.map((f) => (
              <div className="fcard" key={f.title}>
                <img className="ico" src={f.icon} alt="" />
                <div className="fcard__txt">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="subjects" id="subjects">
        <div className="wrap subjects-grid">
          <div>
            <span className="badge">Học tập toàn diện</span>
            <h2>
              Đầy đủ môn học
              <br />
              cho tiểu học
            </h2>
            <ul className="subj-list">
              {subjects.map((s) => (
                <li key={s.name}>
                  <span className={`check ${s.c}`}><Check /></span>
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="devices">
            <img className="tablet" src="/images/assets/10.png" alt="Giao diện máy tính bảng" />
            <img className="phone" src="/images/assets/11.png" alt="Giao diện điện thoại" />
            <img className="books" src="/images/assets/1.png" alt="" />
            <img className="bee" src="/images/assets/2.png" alt="" />
            <svg className="star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1.8l3 6.2 6.8.9-5 4.7 1.3 6.8L12 18l-6.1 3.1 1.3-6.8-5-4.7 6.8-.9z" fill="#ffd23d" stroke="#f0ad1f" strokeWidth={1.1} strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <section className="parent" id="parent">
        <div className="wrap">
          <div className="parent-card">
            <img className="family" src="/images/assets/12.png" alt="Gia đình học cùng con" />
            <div>
              <span className="badge">Dành cho phụ huynh</span>
              <h2>Đồng hành cùng con trên hành trình học tập</h2>
              <div className="pgrid">
                <div className="pitem">
                  <div className="pic">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3" stroke="#3b6bff" strokeWidth={2} strokeLinecap="round" /></svg>
                  </div>
                  <h4>Theo dõi tiến độ học tập</h4>
                  <p>Nắm rõ khả năng học tập của con mỗi ngày.</p>
                </div>
                <div className="pitem">
                  <div className="pic">
                    <svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#3b6bff" strokeWidth={2} /><path d="M8 8h8M8 12h8M8 16h5" stroke="#3b6bff" strokeWidth={2} strokeLinecap="round" /></svg>
                  </div>
                  <h4>Báo cáo chi tiết</h4>
                  <p>Báo cáo trực quan, dễ hiểu theo từng môn học.</p>
                </div>
                <div className="pitem">
                  <div className="pic">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" stroke="#3b6bff" strokeWidth={2} strokeLinejoin="round" /><path d="M10 21a2 2 0 004 0" stroke="#3b6bff" strokeWidth={2} strokeLinecap="round" /></svg>
                  </div>
                  <h4>Nhận thông báo</h4>
                  <p>Cập nhật kịp thời hoạt động và thành tích của con.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="download" id="cta">
        <div className="wrap dl-row">
          <div>
            <h2>Tải <span className="accent">Đồi đom đóm</span> ngay hôm nay!</h2>
            <p>Học vui – Hiểu sâu – Nhớ lâu</p>
          </div>
          <div className="store-row">
            <a className="store store--dark" href="#">
              <span className="ic"><GooglePlayIcon /></span>
              <span><small>Tải trên</small><strong>Google Play</strong></span>
            </a>
            <a className="store store--dark" href="#">
              <span className="ic"><AppleIcon /></span>
              <span><small>Tải trên</small><strong>App Store</strong></span>
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="foot-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#2b50c8" d="M0,32 C220,4 420,4 640,28 C880,54 1080,60 1440,20 L1440,60 L0,60 Z" />
          </svg>
        </div>
        <Stars dots={FOOT_STARS} />
        <div className="wrap foot-row">
          <div className="brand">
            <img src="/images/assets/2.png" alt="" />
            <span>Đồi đom đóm</span>
            <span className="copy">&nbsp;&nbsp;© 2024 Đồi đom đóm. All rights reserved.</span>
          </div>
          <div className="flinks">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
.ld-root{--ink:#1c2a5e;--muted:#6b7a9c;--yellow:#ffd23d;--green:#36c75f;--card-radius:22px;--shadow:0 18px 40px rgba(20,33,90,.10);
  font-family:'Be Vietnam Pro',system-ui,sans-serif;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased;overflow-x:clip;}
.ld-root *{margin:0;padding:0;box-sizing:border-box}
.ld-root img{display:block;max-width:100%}
.ld-root a{text-decoration:none;color:inherit}
.ld-root .wrap{max-width:1180px;margin:0 auto;padding:0 28px}

.ld-root .store-row{display:flex;gap:14px;flex-wrap:wrap}
.ld-root .store{display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:14px;min-width:170px;transition:transform .15s ease, box-shadow .15s ease}
.ld-root .store:hover{transform:translateY(-3px)}
.ld-root .store .ic{font-size:26px;line-height:1;width:26px;height:26px;display:grid;place-items:center}
.ld-root .store .ic svg{width:24px;height:24px}
.ld-root .store small{display:block;font-size:10px;letter-spacing:.06em;text-transform:uppercase;opacity:.8;font-weight:500}
.ld-root .store strong{display:block;font-size:17px;font-weight:700;line-height:1.1}
.ld-root .store--light{background:#fff;color:#16224d;box-shadow:0 8px 20px rgba(0,0,0,.12)}
.ld-root .store--dark{background:#10182f;color:#fff;box-shadow:0 8px 20px rgba(0,0,0,.25)}
.ld-root .pill{display:inline-block;background:linear-gradient(180deg,#ffd95b,#fcc01f);color:#5a3d00;font-weight:700;padding:11px 24px;border-radius:30px;box-shadow:0 8px 18px rgba(251,191,36,.45);transition:transform .15s ease}
.ld-root .pill:hover{transform:translateY(-2px)}
.ld-root .badge{display:inline-block;background:#f6ecca;color:#b8902c;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:8px 18px;border-radius:20px}

.ld-root header{position:absolute;top:0;left:0;right:0;z-index:30}
.ld-root .nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0}
.ld-root .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:22px;color:#fff}
.ld-root .brand img{width:38px;height:38px;object-fit:contain;filter:drop-shadow(0 3px 6px rgba(0,0,0,.3))}
.ld-root .menu{display:flex;gap:30px;list-style:none}
.ld-root .menu a{color:rgba(255,255,255,.82);font-weight:500;font-size:15px;transition:color .15s}
.ld-root .menu a:hover{color:#fff}
.ld-root .ham{display:none;position:relative}
.ld-root .ham>summary{list-style:none;cursor:pointer;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.12)}
.ld-root .ham>summary::-webkit-details-marker{display:none}
.ld-root .ham__drop{position:absolute;right:0;top:54px;background:#fff;border-radius:14px;box-shadow:0 18px 40px rgba(10,20,60,.25);padding:8px;display:grid;min-width:190px;z-index:50}
.ld-root .ham__drop a{padding:11px 14px;color:#1c2a5e;font-weight:600;font-size:15px;border-radius:9px}
.ld-root .ham__drop a:hover{background:#f1f5ff}

.ld-root .hero{position:relative;background:radial-gradient(880px 580px at 74% 64%, #25399c 0%, rgba(20,40,130,0) 58%),radial-gradient(900px 520px at 16% 26%, rgba(40,66,170,.45), transparent 60%),linear-gradient(180deg,#0d2160 0%, #112a70 52%, #0c2061 100%);padding:140px 0 200px;overflow:clip}
.ld-root .stars{position:absolute;inset:0;pointer-events:none}
.ld-root .stars i{position:absolute;background:#fff;border-radius:50%;opacity:.8;animation:ld-tw 3s infinite ease-in-out}
.ld-root .stars i.fly{background:#ffe07a;box-shadow:0 0 8px 2px rgba(255,221,90,.85);animation:ld-tw 2.6s infinite ease-in-out}
@keyframes ld-tw{0%,100%{opacity:.2}50%{opacity:1}}
.ld-root .moon{position:absolute;top:54px;right:9%;width:50px;height:50px;border-radius:50%;box-shadow:13px 9px 0 0 #ffe79a;opacity:.95;z-index:4}
.ld-root .hero-grid{position:relative;z-index:5;display:grid;grid-template-columns:1fr 1fr;gap:30px;align-items:center}
.ld-root .hero h1{font-size:52px;line-height:1.12;font-weight:800;color:#fff;letter-spacing:-.5px}
.ld-root .hero h1 .accent{color:var(--yellow);position:relative;white-space:nowrap}
.ld-root .hero h1 .accent::after{content:"";position:absolute;right:-30px;top:-10px;width:30px;height:34px;background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 34"><g stroke="%23ffd23d" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M7 19 L2 27"/><path d="M16 13 L16 2"/><path d="M25 19 L29 12"/></g></svg>') no-repeat center/contain}
.ld-root .hero p.lead{margin:24px 0 32px;color:rgba(225,232,255,.85);font-size:16px;line-height:1.7;max-width:440px}
.ld-root .hero-art{position:relative;height:440px;display:grid;place-items:center}
.ld-root .hero-bee{width:400px;max-width:100%;z-index:5;filter:drop-shadow(0 26px 44px rgba(0,0,0,.5));animation:ld-float 5s ease-in-out infinite}
@keyframes ld-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
.ld-root .wave-top{position:absolute;left:0;right:0;bottom:-1px;z-index:8;line-height:0}
.ld-root .wave-top svg{width:100%;height:90px;display:block}

.ld-root .features{background:#fff;padding:30px 0 24px;position:relative}
.ld-root .feature-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;margin-top:-130px;position:relative;z-index:10}
.ld-root .fcard{background:#fff;border-radius:var(--card-radius);padding:26px 18px;text-align:center;box-shadow:var(--shadow);transition:transform .2s ease, box-shadow .2s ease}
.ld-root .fcard:hover{transform:translateY(-8px);box-shadow:0 26px 50px rgba(20,33,90,.16)}
.ld-root .fcard .ico{width:66px;height:66px;margin:0 auto 16px;object-fit:contain}
.ld-root .fcard h3{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:8px}
.ld-root .fcard p{font-size:13px;color:var(--muted);line-height:1.55}

.ld-root .subjects{background:#fff;padding:14px 0 20px;position:relative;overflow:visible}
.ld-root .subjects-grid{display:grid;grid-template-columns:.66fr 1.34fr;gap:24px;align-items:center}
.ld-root .subjects h2{font-size:38px;font-weight:800;line-height:1.18;margin:16px 0 26px;color:var(--ink)}
.ld-root .subj-list{list-style:none;display:grid;gap:14px}
.ld-root .subj-list li{display:flex;align-items:center;gap:12px;font-size:17px;font-weight:600;color:#2c3a6b}
.ld-root .check{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;flex:0 0 28px;box-shadow:0 4px 10px rgba(20,33,90,.18)}
.ld-root .check svg{width:15px;height:15px}
.ld-root .c-blue{background:#3b82f6}.ld-root .c-green{background:#22c55e}.ld-root .c-orange{background:#f5a623}
.ld-root .c-purple{background:#a259e6}.ld-root .c-pink{background:#ff5d8f}.ld-root .c-teal{background:#2f80ed}
.ld-root .devices{position:relative;height:480px}
.ld-root .devices .tablet{position:absolute;right:0;top:24px;width:560px;z-index:2;filter:drop-shadow(0 26px 30px rgba(20,33,90,.26))}
.ld-root .devices .phone{position:absolute;left:40px;bottom:6px;width:238px;z-index:3;filter:drop-shadow(0 22px 26px rgba(20,33,90,.3))}
.ld-root .devices .books{position:absolute;left:-16px;bottom:-8px;width:120px;z-index:4;filter:drop-shadow(0 12px 20px rgba(20,33,90,.18))}
.ld-root .devices .bee{position:absolute;right:-52px;bottom:40px;width:174px;z-index:5;filter:drop-shadow(0 16px 26px rgba(0,0,0,.18));animation:ld-float 5s ease-in-out infinite}
.ld-root .devices .star{position:absolute;right:-22px;bottom:-24px;width:58px;z-index:6;filter:drop-shadow(0 8px 14px rgba(244,180,0,.45))}

.ld-root .parent{padding:24px 0 40px}
.ld-root .parent-card{background:linear-gradient(120deg,#fff6e0 0%, #fff9ec 100%);border-radius:30px;padding:14px 44px 14px 14px;display:grid;grid-template-columns:.8fr 1.2fr;gap:30px;align-items:center;box-shadow:0 16px 40px rgba(180,150,60,.14)}
.ld-root .parent-card .family{width:100%;border-radius:22px}
.ld-root .parent h2{font-size:32px;font-weight:800;line-height:1.2;margin:14px 0 26px;color:var(--ink)}
.ld-root .pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.ld-root .pitem .pic{width:40px;height:40px;border-radius:12px;background:#eaf1ff;display:grid;place-items:center;margin-bottom:12px}
.ld-root .pitem .pic svg{width:20px;height:20px}
.ld-root .pitem h4{font-size:16px;font-weight:700;margin-bottom:6px;color:var(--ink)}
.ld-root .pitem p{font-size:13.5px;color:var(--muted);line-height:1.55}

.ld-root .download{position:relative;background:#fff;padding:54px 0 64px;overflow:clip}
.ld-root .dl-row{display:flex;align-items:center;justify-content:space-between;gap:30px;flex-wrap:wrap;position:relative;z-index:5}
.ld-root .download h2{font-size:34px;font-weight:800;color:var(--ink)}
.ld-root .download h2 .accent{color:#3b6bff}
.ld-root .download p{color:#3b6bff;font-weight:600;margin-top:10px;font-size:17px}

.ld-root .site-footer{position:relative;background:linear-gradient(180deg,#2b50c8 0%, #1f3aa6 100%);color:#fff;padding:40px 0 26px;margin-top:64px}
.ld-root .site-footer .foot-wave{position:absolute;left:0;right:0;top:-58px;width:100%;height:60px;display:block}
.ld-root .site-footer .foot-wave svg{width:100%;height:100%;display:block}
.ld-root .foot-row{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;position:relative;z-index:5}
.ld-root .site-footer .brand{font-size:18px}
.ld-root .site-footer .brand img{width:30px;height:30px}
.ld-root .copy{color:rgba(255,255,255,.6);font-size:13px}
.ld-root .flinks{display:flex;gap:26px}
.ld-root .flinks a{color:rgba(255,255,255,.78);font-size:14px}
.ld-root .flinks a:hover{color:#fff}

@media(max-width:900px){
  /* header: hamburger thay cho menu + nút pill */
  .ld-root .menu{display:none}
  .ld-root .pill{display:none}
  .ld-root .ham{display:block}

  /* hero */
  .ld-root .hero{padding:104px 0 92px}
  .ld-root .hero-grid{grid-template-columns:1fr}
  .ld-root .hero h1{font-size:36px}
  .ld-root .hero p.lead{font-size:15px}
  .ld-root .hero-art{height:290px;margin-top:6px}
  .ld-root .moon{right:6%}

  /* features: hàng ngang gọn, có mũi tên ">" */
  .ld-root .feature-grid{grid-template-columns:1fr;gap:12px;margin-top:-62px}
  .ld-root .fcard{display:flex;align-items:center;gap:14px;text-align:left;padding:15px 16px}
  .ld-root .fcard .ico{width:48px;height:48px;margin:0;flex:0 0 48px}
  .ld-root .fcard__txt{flex:1;min-width:0}
  .ld-root .fcard h3{font-size:15.5px;margin-bottom:3px}
  .ld-root .fcard p{font-size:12.5px}
  .ld-root .fcard::after{content:"";width:9px;height:9px;border-right:2.5px solid #c4cde2;border-bottom:2.5px solid #c4cde2;transform:rotate(-45deg);flex:0 0 auto;margin-left:4px}

  /* subjects: chỉ một thiết bị */
  .ld-root .subjects-grid{grid-template-columns:1fr}
  .ld-root .subjects h2{font-size:30px}
  .ld-root .devices{height:auto;position:relative;margin-top:18px;padding-bottom:22px}
  .ld-root .devices .tablet{position:relative;right:auto;top:auto;width:100%;display:block}
  .ld-root .devices .phone{display:none}
  .ld-root .devices .books{left:-4px;bottom:-6px;width:82px}
  .ld-root .devices .bee{right:-8px;bottom:22px;width:102px}
  .ld-root .devices .star{right:0;bottom:-12px;width:42px}

  /* parent: bỏ grid, xếp khối dọc để không tràn ngang */
  .ld-root .parent-card{display:block;padding:18px}
  .ld-root .parent-card .family{margin-bottom:18px}
  .ld-root .parent h2{font-size:24px;overflow-wrap:break-word}
  .ld-root .pgrid{grid-template-columns:1fr;gap:16px}

  /* CTA: thẻ xanh bo tròn */
  .ld-root .download{padding:24px 0}
  .ld-root .dl-row{flex-direction:column;align-items:flex-start;gap:18px;background:linear-gradient(135deg,#1f3aa6,#2b50c8);border-radius:24px;padding:26px 22px}
  .ld-root .download h2{color:#fff;font-size:25px}
  .ld-root .download h2 .accent{color:var(--yellow)}
  .ld-root .download p{color:rgba(255,255,255,.85)}
  .ld-root .dl-row .store--dark{background:#fff;color:#16224d;box-shadow:0 8px 18px rgba(0,0,0,.18)}

  /* footer xuống dòng */
  .ld-root .foot-row{flex-direction:column;align-items:flex-start;gap:14px}
}
`;
