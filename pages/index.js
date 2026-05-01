import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: `Bonjour. 🤍

Je m'appelle Léa, je suis l'assistante du Cercle.

Mon rôle est simple : apprendre à te connaître — vraiment — pour te trouver **un match qui te correspond en profondeur.** Pas quelqu'un qui a l'air bien sur une photo. Quelqu'un avec qui quelque chose peut vraiment se passer.

Voilà comment ça marche : on discute un peu toi et moi, je construis ton profil en silence, et quand je trouve quelqu'un qui vibre au même rythme que toi… je te le propose. **Un seul profil. Choisi pour toi.**

Si vous dites oui tous les deux — je partage vos contacts. Et c'est parti.

Aucune app à télécharger. Aucun scroll infini. Juste une rencontre qui a du sens.

---

Première question, et elle est importante :

**Comment tu t'appelles ?**`
};

function formatMessage(text) {
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/\n\n---\n\n/g, "<hr/>");
  text = text.replace(/\n/g, "<br/>");
  return text;
}

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function Home() {
  const [messages, setMessages] = useState([{ ...WELCOME_MESSAGE, time: getTime() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text, time: getTime() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, time: getTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Une erreur est survenue. Réessaie. 🤍", time: getTime() }]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <Head>
        <title>Le Cercle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0a0a0a; }
        hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 8px 0; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSplash {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bubble { animation: fadeIn 0.3s ease; }
        .splash-inner { animation: fadeInSplash 0.8s ease; }
        .send-btn:hover { transform: scale(1.05); }
        .start-btn:hover { transform: scale(1.02); opacity: 0.95; }
        input::placeholder { color: rgba(245,240,232,0.3); }
        input:focus { outline: none; border-color: rgba(201,169,110,0.4) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.2); border-radius: 2px; }
      `}</style>

      {!started ? (
        <div style={styles.splash}>
          <div className="splash-inner" style={styles.splashInner}>
            <div style={styles.logo}>◎</div>
            <h1 style={styles.title}>Le Cercle</h1>
            <p style={styles.subtitle}>Une conversation. Une connexion. Une chance.</p>
            <button className="start-btn" style={styles.startBtn} onClick={() => setStarted(true)}>
              Commencer
            </button>
            <p style={styles.note}>Aucune app · 100% privé · Un seul match à la fois</p>
          </div>
        </div>
      ) : (
        <div style={styles.app}>
          <div style={styles.header}>
            <div style={styles.avatar}>L</div>
            <div>
              <div style={styles.headerName}>Léa · Le Cercle</div>
              <div style={styles.headerStatus}>en ligne</div>
            </div>
          </div>

          <div style={styles.messages}>
            <div style={styles.dateChip}>Aujourd'hui</div>

            {messages.map((msg, i) => (
              <div key={i} className="bubble" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 6 }}>
                <div style={msg.role === "user" ? styles.bubbleUser : styles.bubbleBot}>
                  <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} style={styles.bubbleText} />
                  <span style={styles.time}>{msg.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 6 }}>
                <div style={styles.bubbleBot}>
                  <div style={styles.typing}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span key={i} style={{ ...styles.dot, animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="Écris un message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
            <button
              className="send-btn"
              style={{ ...styles.sendBtn, opacity: input.trim() && !loading ? 1 : 0.4 }}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  splash: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0d1f12 0%, #0a0a0a 50%, #1a0f0a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
  },
  splashInner: {
    textAlign: "center",
    padding: "40px 24px",
  },
  logo: {
    fontSize: 72,
    color: "#c9a96e",
    marginBottom: 16,
    lineHeight: 1,
    fontWeight: 300,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 48,
    fontWeight: 400,
    color: "#f5f0e8",
    letterSpacing: "0.02em",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(245,240,232,0.45)",
    fontWeight: 300,
    marginBottom: 52,
    fontStyle: "italic",
    fontFamily: "'Playfair Display', serif",
  },
  startBtn: {
    background: "linear-gradient(135deg, #c9a96e, #a07840)",
    border: "none",
    borderRadius: 50,
    color: "#0a0a0a",
    fontSize: 17,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    padding: "17px 52px",
    cursor: "pointer",
    letterSpacing: "0.05em",
    marginBottom: 24,
    display: "block",
    margin: "0 auto 24px",
    transition: "transform 0.2s, opacity 0.2s",
  },
  note: {
    fontSize: 12,
    color: "rgba(245,240,232,0.2)",
    letterSpacing: "0.04em",
    marginTop: 24,
  },
  app: {
    height: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    background: "#111b13",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    background: "#1f2f21",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid rgba(201,169,110,0.15)",
    flexShrink: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c9a96e, #a07840)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0a0a0a",
    fontWeight: 700,
    fontSize: 19,
    flexShrink: 0,
  },
  headerName: {
    color: "#f5f0e8",
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 2,
  },
  headerStatus: {
    color: "#c9a96e",
    fontSize: 12,
  },
  messages: {
    flex: 1,
    padding: "16px 12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    backgroundImage: "radial-gradient(circle at 20% 80%, rgba(201,169,110,0.03) 0%, transparent 50%)",
  },
  dateChip: {
    alignSelf: "center",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(245,240,232,0.35)",
    fontSize: 11,
    padding: "4px 14px",
    borderRadius: 10,
    marginBottom: 14,
    letterSpacing: "0.05em",
  },
  bubbleBot: {
    background: "#1f2f21",
    borderRadius: "4px 16px 16px 16px",
    padding: "10px 14px",
    maxWidth: "78%",
    border: "1px solid rgba(201,169,110,0.1)",
  },
  bubbleUser: {
    background: "linear-gradient(135deg, #2d5a30, #1e3d21)",
    borderRadius: "16px 4px 16px 16px",
    padding: "10px 14px",
    maxWidth: "78%",
  },
  bubbleText: {
    color: "#f5f0e8",
    fontSize: 14.5,
    lineHeight: 1.65,
    fontWeight: 300,
    display: "block",
    marginBottom: 4,
  },
  time: {
    color: "rgba(245,240,232,0.25)",
    fontSize: 10,
    display: "block",
    textAlign: "right",
  },
  typing: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    padding: "3px 2px",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#c9a96e",
    display: "inline-block",
    animation: "bounce 1.2s infinite",
  },
  inputArea: {
    background: "#1f2f21",
    padding: "10px 12px",
    display: "flex",
    gap: 10,
    alignItems: "center",
    borderTop: "1px solid rgba(201,169,110,0.1)",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "#2a3d2c",
    border: "1px solid rgba(201,169,110,0.15)",
    borderRadius: 24,
    padding: "11px 18px",
    color: "#f5f0e8",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c9a96e, #a07840)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "opacity 0.2s, transform 0.15s",
  },
};
