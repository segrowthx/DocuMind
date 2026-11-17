/*!
 * DocuMind chat widget.
 * Embed on any site (WordPress: Custom HTML block or footer) with:
 *   <script src="https://YOUR-APP.vercel.app/widget.js" defer
 *           data-color="#1C2A4A" data-position="right" data-label="Ask us"></script>
 */
(function () {
  if (window.__documindLoaded) return;
  window.__documindLoaded = true;

  var script = document.currentScript;
  var origin = new URL(script.src).origin;
  var color = script.getAttribute("data-color") || "#1C2A4A";
  var side = script.getAttribute("data-position") === "left" ? "left" : "right";
  var label = script.getAttribute("data-label") || "Ask a question";

  var css =
    ".dm-root{position:fixed;bottom:20px;" + side + ":20px;z-index:2147483000;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
    ".dm-btn{display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 18px 12px 14px;background:" + color + ";color:#fff;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 6px 20px rgba(28,42,74,.28)}" +
    ".dm-btn:focus-visible{outline:3px solid #FFE45C;outline-offset:2px}" +
    ".dm-btn svg{width:20px;height:20px}" +
    ".dm-panel{position:absolute;bottom:64px;" + side + ":0;width:380px;height:min(620px,calc(100vh - 110px));border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 18px 50px rgba(28,42,74,.3);border:1px solid #DCE0E7;opacity:0;transform:translateY(8px);transition:opacity .16s,transform .16s;pointer-events:none}" +
    ".dm-open .dm-panel{opacity:1;transform:none;pointer-events:auto}" +
    ".dm-panel iframe{width:100%;height:100%;border:0;display:block}" +
    "@media (max-width:480px){.dm-root.dm-open{inset:0}.dm-open .dm-btn{display:none}.dm-panel{position:fixed;inset:0;width:100%;height:100%;border-radius:0;border:0;bottom:0}}" +
    "@media (prefers-reduced-motion:reduce){.dm-panel{transition:none}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.className = "dm-root";

  var panel = document.createElement("div");
  panel.className = "dm-panel";
  panel.setAttribute("aria-hidden", "true");

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dm-btn";
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span></span>';
  btn.querySelector("span").textContent = label;

  var iframe = null;
  function setOpen(open) {
    if (open && !iframe) {
      iframe = document.createElement("iframe");
      iframe.src = origin + "/chat?embed=1";
      iframe.title = "Chat assistant";
      iframe.allow = "clipboard-write";
      panel.appendChild(iframe);
    }
    root.classList.toggle("dm-open", open);
    btn.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    if (!open) btn.focus();
  }

  btn.addEventListener("click", function () {
    setOpen(!root.classList.contains("dm-open"));
  });
  window.addEventListener("message", function (e) {
    if (e.origin === origin && e.data && e.data.type === "documind:close") setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("dm-open")) setOpen(false);
  });

  root.appendChild(panel);
  root.appendChild(btn);
  document.body.appendChild(root);
})();
