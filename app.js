/* =========================================================
   Moonlit - React front end (demo, no back end yet)
   Everything is saved in the browser's localStorage, so you
   can refresh the page and keep your profile, likes and chats.
   ========================================================= */

const { useState, useEffect, useRef } = React;

const STORE_KEY = "moonlit-v1";

const INTEREST_OPTIONS = [
  "Music", "Movies", "Travel", "Food", "Coffee", "Books",
  "Fitness", "Art", "Gaming", "Hiking", "Photography", "Cricket",
];

/* Sample people for the demo. "likesYou" decides who matches back. */
const PROFILES = [
  { id: 1, name: "Aarthi",  age: 26, city: "Chennai",    emoji: "🌸", hue: 330, likesYou: true,  interests: ["Music", "Coffee", "Travel"],       bio: "Filter coffee, old Tamil songs and long beach walks. I'm looking for someone who laughs easily." },
  { id: 2, name: "Karthik", age: 28, city: "Coimbatore", emoji: "📷", hue: 20,  likesYou: false, interests: ["Photography", "Hiking", "Food"],   bio: "Weekend photographer. I know the best sunrise spots in the Western Ghats." },
  { id: 3, name: "Meera",   age: 25, city: "Madurai",    emoji: "📚", hue: 280, likesYou: true,  interests: ["Books", "Art", "Coffee"],           bio: "Always carrying a book. Ask me about my current favourite and I will talk for an hour." },
  { id: 4, name: "Vikram",  age: 29, city: "Bengaluru",  emoji: "🎸", hue: 350, likesYou: true,  interests: ["Music", "Movies", "Gaming"],        bio: "Plays guitar badly, cooks biryani well. Let's trade playlists." },
  { id: 5, name: "Divya",   age: 27, city: "Hyderabad",  emoji: "🎨", hue: 300, likesYou: false, interests: ["Art", "Food", "Travel"],            bio: "I paint, I travel, and I try every street food stall at least once." },
  { id: 6, name: "Arjun",   age: 30, city: "Kochi",      emoji: "🍜", hue: 35,  likesYou: true,  interests: ["Food", "Cricket", "Fitness"],       bio: "Software engineer by day, noodle hunter by night. Gym on weekends." },
  { id: 7, name: "Nisha",   age: 24, city: "Pune",       emoji: "🎬", hue: 320, likesYou: false, interests: ["Movies", "Books", "Gaming"],        bio: "Film student. Tell me your most overrated movie and I'll tell you mine." },
  { id: 8, name: "Rahul",   age: 27, city: "Mumbai",     emoji: "🏏", hue: 10,  likesYou: true,  interests: ["Cricket", "Fitness", "Travel"],     bio: "Cricket fan, early riser, terrible at replying slowly. Let's meet for chai." },
];

const REPLIES = [
  "Haha, I like that 😄",
  "Tell me more about that!",
  "That sounds lovely. What's your favourite way to spend a weekend?",
  "Same here! We should talk about it over a coffee sometime ☕",
  "You seem fun. What was the best part of your week?",
  "Okay, now I'm curious. What else are you into?",
];

const avatarBg = (hue) =>
  `linear-gradient(155deg, hsl(${hue} 75% 68%) 0%, hsl(${(hue + 40) % 360} 55% 30%) 100%)`;

const findProfile = (id) => PROFILES.find((p) => p.id === id);
const timeOf = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const emptyState = { me: null, liked: [], passed: [], matches: [], chats: {} };

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || emptyState;
  } catch (e) {
    return emptyState;
  }
}

/* ---------- small icon set (inline SVG) ---------- */
const ICONS = {
  discover: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
};

function Icon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/* ---------- decorations ---------- */
function Petals() {
  const petals = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 73) % 100,
    delay: (i * 1.7) % 12,
    dur: 12 + (i % 5) * 3,
    size: 10 + (i % 4) * 5,
  }));
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p, i) => (
        <span key={i} className="petal"
          style={{ left: p.left + "%", animationDelay: `-${p.delay}s`, animationDuration: p.dur + "s", width: p.size, height: p.size * 0.8 }} />
      ))}
    </div>
  );
}

function Logo({ size = 44, hero = false }) {
  return (
    <img
      className={"logo" + (hero ? " logo-hero" : "")}
      src="images/logo.png"
      alt="Moonlit logo: a couple in silhouette in front of a glowing moon"
      width={hero ? undefined : size}
      height={hero ? undefined : size}
    />
  );
}

/* =========================================================
   Welcome / sign up
   ========================================================= */
function Welcome({ onJoin }) {
  const [form, setForm] = useState({ name: "", age: "", city: "", interests: [], agree: false });
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleInterest = (item) =>
    setForm((f) => {
      if (f.interests.includes(item)) return { ...f, interests: f.interests.filter((x) => x !== item) };
      if (f.interests.length >= 5) return f;
      return { ...f, interests: [...f.interests, item] };
    });

  const submit = (e) => {
    e.preventDefault();
    const age = parseInt(form.age, 10);
    if (!form.name.trim()) return setError("Please tell us your first name.");
    if (!age || age < 18) return setError("Moonlit is for adults. You must be 18 or older to join.");
    if (age > 99) return setError("Please enter a valid age.");
    if (!form.city.trim()) return setError("Please add your city.");
    if (!form.agree) return setError("Please confirm you are 18+ and agree to be respectful.");
    onJoin({ name: form.name.trim(), age, city: form.city.trim(), bio: "", interests: form.interests });
  };

  return (
    <div className="welcome">
      <section className="welcome-hero">
        <Logo hero />
        <h1>Meet someone new,<br /><span>under the same moon.</span></h1>
        <p>Moonlit introduces you to kind, curious strangers. Swipe, match and start a conversation.</p>
      </section>

      <form className="welcome-card" onSubmit={submit} noValidate>
        <h2>Create your profile</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="name">First name</label>
            <input id="name" value={form.name} onChange={update("name")} placeholder="Kowsika" autoComplete="given-name" />
          </div>
          <div className="field">
            <label htmlFor="age">Age</label>
            <input id="age" type="number" inputMode="numeric" min="18" max="99" value={form.age} onChange={update("age")} placeholder="18+" />
          </div>
          <div className="field full">
            <label htmlFor="city">City</label>
            <input id="city" value={form.city} onChange={update("city")} placeholder="Chennai" autoComplete="address-level2" />
          </div>
        </div>

        <div className="field">
          <span className="label">Your interests (pick up to 5)</span>
          <div className="chips">
            {INTEREST_OPTIONS.map((i) => (
              <button type="button" key={i} className={"chip" + (form.interests.includes(i) ? " on" : "")}
                aria-pressed={form.interests.includes(i)} onClick={() => toggleInterest(i)}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <label className="check">
          <input type="checkbox" checked={form.agree} onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))} />
          <span>I am 18 or older and I will treat everyone with respect.</span>
        </label>

        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit">Start meeting people</button>
      </form>
    </div>
  );
}

/* =========================================================
   Discover: swipe cards
   ========================================================= */
function SwipeCard({ p, me, role, exit, onSwipe }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, on: false });
  const origin = useRef(null);
  const isTop = role === "top";

  const down = (e) => {
    if (!isTop || exit) return;
    origin.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, on: true });
  };
  const move = (e) => {
    if (!origin.current) return;
    setDrag({ x: e.clientX - origin.current.x, y: (e.clientY - origin.current.y) * 0.3, on: true });
  };
  const up = () => {
    if (!origin.current) return;
    const dx = drag.x;
    origin.current = null;
    setDrag((d) => ({ ...d, on: false }));
    if (dx > 110) onSwipe("like");
    else if (dx < -110) onSwipe("pass");
    else setDrag({ x: 0, y: 0, on: false });
  };

  let transform;
  if (exit === "like") transform = "translate(720px, -40px) rotate(24deg)";
  else if (exit === "pass") transform = "translate(-720px, -40px) rotate(-24deg)";
  else transform = `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`;

  const likeOpacity = exit === "like" ? 1 : Math.min(Math.max(drag.x / 110, 0), 1);
  const nopeOpacity = exit === "pass" ? 1 : Math.min(Math.max(-drag.x / 110, 0), 1);
  const shared = (item) => me.interests.includes(item);

  return (
    <article
      className={"card " + (isTop ? "top" : "behind") + (drag.on ? " dragging" : "")}
      style={isTop ? { transform } : undefined}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
    >
      <div className="card-art" style={{ background: avatarBg(p.hue) }} aria-hidden="true">{p.emoji}</div>
      <span className="stamp like" style={{ opacity: likeOpacity }}>LIKE</span>
      <span className="stamp nope" style={{ opacity: nopeOpacity }}>PASS</span>
      <div className="card-info">
        <h3>{p.name}, <small>{p.age}</small></h3>
        <span className="card-city">📍 {p.city}</span>
        <p className="card-bio">{p.bio}</p>
        <div className="chips">
          {p.interests.map((i) => (
            <span key={i} className={"chip small" + (shared(i) ? " shared" : "")}>{shared(i) ? "★ " : ""}{i}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Discover({ state, setState, onMatch }) {
  const [leaving, setLeaving] = useState(null);
  const queue = PROFILES.filter((p) => !state.liked.includes(p.id) && !state.passed.includes(p.id));
  const current = queue[0];

  const commit = (dir, person) => {
    setState((s) => {
      if (dir === "pass") return { ...s, passed: [...s.passed, person.id] };
      const next = { ...s, liked: [...s.liked, person.id] };
      if (person.likesYou) {
        next.matches = [...s.matches, person.id];
        next.chats = {
          ...s.chats,
          [person.id]: [{ from: "them", text: "Hi! Looks like we matched 🌙", t: Date.now() }],
        };
      }
      return next;
    });
    if (dir === "like" && person.likesYou) onMatch(person);
  };

  const request = (dir) => {
    if (!current || leaving) return;
    const person = current;
    setLeaving(dir);
    setTimeout(() => {
      commit(dir, person);
      setLeaving(null);
    }, 280);
  };

  /* laptop shortcuts: left arrow = pass, right arrow = like */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches && e.target.matches("input, textarea")) return;
      if (e.key === "ArrowRight") request("like");
      if (e.key === "ArrowLeft") request("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const resetDeck = () => setState((s) => ({ ...s, liked: [], passed: [], matches: [], chats: {} }));

  return (
    <div>
      <h1 className="page-title">Discover</h1>
      <p className="page-sub">Swipe right to like, left to pass.</p>

      <div className="discover">
        <div className="discover-main">
          {current ? (
            <>
              <div className="stack">
                {queue.slice(0, 2).reverse().map((p, i, arr) => {
                  const isTop = i === arr.length - 1;
                  return (
                    <SwipeCard key={p.id} p={p} me={state.me} role={isTop ? "top" : "behind"}
                      exit={isTop ? leaving : null} onSwipe={request} />
                  );
                })}
              </div>
              <div className="actions">
                <button className="round-btn pass" onClick={() => request("pass")} aria-label="Pass"><Icon name="x" size={30} /></button>
                <button className="round-btn like" onClick={() => request("like")} aria-label="Like"><Icon name="heart" size={32} /></button>
              </div>
              <p className="hint keys">Tip: use the ← and → arrow keys on your keyboard.</p>
            </>
          ) : (
            <div className="empty">
              <div className="big">🌙</div>
              <h2>You've met everyone nearby</h2>
              <p>New people join all the time. Check your matches, or start the demo again.</p>
              <button className="btn btn-primary" onClick={resetDeck}>Start over</button>
            </div>
          )}
        </div>

        <aside className="tips">
          <div className="tip-card">
            <h3>Meeting strangers safely</h3>
            <ul>
              <li>Chat in the app first. Keep your phone number and address private.</li>
              <li>Meet in a busy public place, and tell a friend where you are going.</li>
              <li>Trust your instincts. You can always stop a conversation.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   Matches
   ========================================================= */
function Matches({ state, openChat }) {
  const matched = state.matches.map(findProfile).filter(Boolean);
  const waiting = state.liked.filter((id) => !state.matches.includes(id)).map(findProfile).filter(Boolean);

  return (
    <div>
      <h1 className="page-title">Matches</h1>
      <p className="page-sub">People who liked you back.</p>

      {matched.length === 0 ? (
        <div className="empty">
          <div className="big">💫</div>
          <p>No matches yet. Keep swiping on Discover, your first match is waiting.</p>
        </div>
      ) : (
        <div className="grid">
          {matched.map((p) => (
            <div className="person" key={p.id} style={{ background: avatarBg(p.hue) }}>
              <div className="emoji" aria-hidden="true">{p.emoji}</div>
              <div className="person-info">
                <strong>{p.name}, {p.age}</strong>
                <span>📍 {p.city}</span>
                <button className="btn btn-primary" onClick={() => openChat(p.id)}>Say hi</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {waiting.length > 0 && (
        <>
          <h2 className="section-title">Waiting to hear back</h2>
          <div className="grid">
            {waiting.map((p) => (
              <div className="person waiting" key={p.id} style={{ background: avatarBg(p.hue) }}>
                <span className="pending-tag">Pending</span>
                <div className="emoji" aria-hidden="true">{p.emoji}</div>
                <div className="person-info">
                  <strong>{p.name}, {p.age}</strong>
                  <span>📍 {p.city}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   Chat
   ========================================================= */
function Chat({ state, setState, active, setActive }) {
  const matches = state.matches.map(findProfile).filter(Boolean);
  const current = matches.find((p) => p.id === active) || null;
  const msgs = current ? state.chats[current.id] || [] : [];

  const [text, setText] = useState("");
  const [typingId, setTypingId] = useState(null);
  const listRef = useRef(null);

  /* on a laptop, open the first conversation automatically */
  useEffect(() => {
    if (!active && matches.length && window.matchMedia("(min-width: 860px)").matches) {
      setActive(matches[0].id);
    }
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs.length, typingId, active]);

  const addMessage = (id, msg) =>
    setState((s) => ({ ...s, chats: { ...s.chats, [id]: [...(s.chats[id] || []), msg] } }));

  const send = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !current) return;
    const id = current.id;
    addMessage(id, { from: "me", text: value, t: Date.now() });
    setText("");
    setTypingId(id);
    setTimeout(() => {
      setTypingId(null);
      addMessage(id, { from: "them", text: REPLIES[Math.floor(Math.random() * REPLIES.length)], t: Date.now() });
    }, 1300);
  };

  if (matches.length === 0) {
    return (
      <div>
        <h1 className="page-title">Chat</h1>
        <div className="empty">
          <div className="big">💬</div>
          <p>Your conversations will appear here once you have a match.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Chat</h1>
      <p className="page-sub">Say something kind and be yourself.</p>

      <div className={"chat-layout" + (current ? " has-active" : "")}>
        <div className="chat-list">
          {matches.map((p) => {
            const last = (state.chats[p.id] || []).slice(-1)[0];
            return (
              <button key={p.id} className={"chat-item" + (p.id === active ? " active" : "")} onClick={() => setActive(p.id)}>
                <span className="avatar" style={{ background: avatarBg(p.hue) }}>{p.emoji}</span>
                <span className="meta">
                  <strong>{p.name}</strong>
                  <span>{last ? last.text : "Say hello!"}</span>
                </span>
              </button>
            );
          })}
        </div>

        <section className="chat-window">
          {current ? (
            <>
              <div className="chat-head">
                <button className="back" onClick={() => setActive(null)} aria-label="Back to conversations"><Icon name="back" /></button>
                <span className="avatar" style={{ background: avatarBg(current.hue) }}>{current.emoji}</span>
                <div><strong>{current.name}, {current.age}</strong><br /><small style={{ color: "var(--muted)" }}>📍 {current.city}</small></div>
              </div>

              <div className="messages" ref={listRef}>
                {msgs.map((m, i) => (
                  <div key={i} className={"bubble " + m.from}>
                    {m.text}
                    <small>{timeOf(m.t)}</small>
                  </div>
                ))}
                {typingId === current.id && <div className="typing">{current.name} is typing…</div>}
              </div>

              <p className="demo-note">Demo chat: replies are automatic for now.</p>
              <form className="chat-input" onSubmit={send}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" aria-label="Message" />
                <button type="submit" aria-label="Send message"><Icon name="send" size={20} /></button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">
              <div className="big">💬</div>
              <p>Pick a conversation to start chatting.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   Profile
   ========================================================= */
function Profile({ state, setState, onLogout }) {
  const [draft, setDraft] = useState(state.me);
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => { setSaved(false); setDraft((d) => ({ ...d, [key]: e.target.value })); };
  const toggle = (item) => {
    setSaved(false);
    setDraft((d) => {
      if (d.interests.includes(item)) return { ...d, interests: d.interests.filter((x) => x !== item) };
      if (d.interests.length >= 5) return d;
      return { ...d, interests: [...d.interests, item] };
    });
  };

  const save = (e) => {
    e.preventDefault();
    const age = Math.max(18, Math.min(99, parseInt(draft.age, 10) || 18));
    setState((s) => ({ ...s, me: { ...draft, age, name: draft.name.trim() || s.me.name } }));
    setSaved(true);
  };

  return (
    <div>
      <h1 className="page-title">Your profile</h1>
      <p className="page-sub">This is what other people see.</p>

      <form className="profile-card" onSubmit={save}>
        <div className="profile-top">
          <span className="avatar">{draft.name.slice(0, 1).toUpperCase()}</span>
          <div><h2>{draft.name}, {draft.age}</h2><span style={{ color: "var(--muted)" }}>📍 {draft.city}</span></div>
        </div>

        <div className="row">
          <div className="field"><label htmlFor="p-name">First name</label><input id="p-name" value={draft.name} onChange={set("name")} /></div>
          <div className="field"><label htmlFor="p-age">Age</label><input id="p-age" type="number" min="18" max="99" value={draft.age} onChange={set("age")} /></div>
          <div className="field full"><label htmlFor="p-city">City</label><input id="p-city" value={draft.city} onChange={set("city")} /></div>
          <div className="field full">
            <label htmlFor="p-bio">About me</label>
            <textarea id="p-bio" maxLength={200} value={draft.bio} onChange={set("bio")} placeholder="Write a few friendly lines about yourself" />
          </div>
        </div>

        <div className="field">
          <span className="label">Interests (up to 5)</span>
          <div className="chips">
            {INTEREST_OPTIONS.map((i) => (
              <button type="button" key={i} className={"chip" + (draft.interests.includes(i) ? " on" : "")} onClick={() => toggle(i)}>{i}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" type="submit">Save profile</button>
          {saved && <span className="saved">Saved ✓</span>}
        </div>
      </form>

      <div className="danger-zone">
        <button className="btn btn-ghost" onClick={() => setState((s) => ({ ...s, liked: [], passed: [], matches: [], chats: {} }))}>Reset demo people</button>
        <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}

/* =========================================================
   Match popup
   ========================================================= */
function MatchModal({ person, me, onChat, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="It's a match" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>It's a match!</h2>
        <div className="avatars">
          <span className="avatar" style={{ background: "var(--grad)", color: "#3a1230", fontFamily: "var(--font-display)", fontWeight: 700 }}>{me.name.slice(0, 1).toUpperCase()}</span>
          <span className="avatar" style={{ background: avatarBg(person.hue) }}>{person.emoji}</span>
        </div>
        <p>You and {person.name} liked each other.</p>
        <button className="btn btn-primary btn-block" onClick={onChat}>Say hello</button>
        <button className="btn btn-ghost btn-block" onClick={onClose}>Keep swiping</button>
      </div>
    </div>
  );
}

/* =========================================================
   App shell: sidebar on laptop, top bar + tab bar on phone
   ========================================================= */
const TABS = [
  { id: "discover", label: "Discover", icon: "discover" },
  { id: "matches", label: "Matches", icon: "heart" },
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "profile", label: "Profile", icon: "user" },
];

function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState("discover");
  const [activeChat, setActiveChat] = useState(null);
  const [matchPerson, setMatchPerson] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage may be blocked */ }
  }, [state]);

  const openChat = (id) => { setActiveChat(id); setTab("chat"); setMatchPerson(null); };
  const logout = () => { setState(emptyState); setTab("discover"); setActiveChat(null); };

  if (!state.me) {
    return (
      <>
        <Petals />
        <Welcome onJoin={(me) => setState({ ...emptyState, me })} />
      </>
    );
  }

  const badgeFor = (id) => (id === "matches" || id === "chat") && state.matches.length > 0 ? state.matches.length : null;

  return (
    <>
      <Petals />
      <div className="shell">
        <aside className="sidebar">
          <div className="brand"><Logo size={48} /><span className="wordmark">Moonlit</span></div>
          {TABS.map((t) => (
            <button key={t.id} className={"nav-btn" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={22} /> {t.label}
              {badgeFor(t.id) && <span className="badge">{badgeFor(t.id)}</span>}
            </button>
          ))}
          <div className="me-mini">
            <span className="avatar">{state.me.name.slice(0, 1).toUpperCase()}</span>
            <div><strong>{state.me.name}</strong><span>{state.me.city}</span></div>
          </div>
        </aside>

        <header className="mobilebar"><Logo size={34} /><span className="wordmark">Moonlit</span></header>

        <main className="main">
          {tab === "discover" && <Discover state={state} setState={setState} onMatch={setMatchPerson} />}
          {tab === "matches" && <Matches state={state} openChat={openChat} />}
          {tab === "chat" && <Chat state={state} setState={setState} active={activeChat} setActive={setActiveChat} />}
          {tab === "profile" && <Profile state={state} setState={setState} onLogout={logout} />}
        </main>

        <nav className="tabbar" aria-label="Main">
          {TABS.map((t) => (
            <button key={t.id} className={"tab-btn" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={24} />
              <span>{t.label}</span>
              {badgeFor(t.id) && <span className="badge">{badgeFor(t.id)}</span>}
            </button>
          ))}
        </nav>
      </div>

      {matchPerson && (
        <MatchModal person={matchPerson} me={state.me} onChat={() => openChat(matchPerson.id)} onClose={() => setMatchPerson(null)} />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
