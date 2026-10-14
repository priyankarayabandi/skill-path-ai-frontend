# SkillPath AI — Frontend Foundation (Step 1)

This frontend module is built strictly with **Vanilla JavaScript (ES6+)** and **CSS3**, operating under the requirement that **no HTML files are created or manually written**.

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── js/
│   │   └── app.js         # Frontend entry point (builds DOM via JavaScript)
│   └── css/
│       └── styles.css     # CSS3 design system, layout, and theme tokens
└── README.md              # Frontend documentation and execution guide
```

---

## 🛠️ How It Works (Zero-HTML Architecture)

1. **Pure DOM Assembly**: The interface is programmatically generated in `app.js` using native DOM APIs (`document.createElement()`, `appendChild()`, `setAttribute()`, etc.).
2. **Dynamic Stylesheet Injection**: `app.js` attaches `src/css/styles.css` directly to `document.head` at runtime.
3. **REST API Client**: Native `fetch()` communicates with the Spring Boot backend (`http://localhost:8080/api/health`).

---

## 🚀 How to Open the Frontend in Your Browser

Because there are **no `.html` files**, choose any of the following methods to run the frontend in your browser:

### Method 1: Browser DevTools Console (Simplest)
1. Open any modern browser (Chrome, Edge, Firefox, Brave) to a blank tab: `about:blank`.
2. Open Developer Tools (`F12` or `Ctrl + Shift + I`) and switch to the **Console** tab.
3. Paste and run this one-line command (adjust path if needed):
   ```javascript
   const s = document.createElement('script'); s.src = 'file:///C:/Users/ADMIN/Desktop/java project/SkillPathAI/frontend/src/js/app.js'; document.head.appendChild(s);
   ```
4. The SkillPath AI interface will instantly mount and render into the tab.

---

### Method 2: Launch via PowerShell (Automated)
Run the following PowerShell command to open Edge directly pointing to the script via a data URI bootstrap:

```powershell
Start-Process msedge "data:text/html,<html><head><title>SkillPath AI</title><link rel='stylesheet' href='file:///C:/Users/ADMIN/Desktop/java project/SkillPathAI/frontend/src/css/styles.css'><script src='file:///C:/Users/ADMIN/Desktop/java project/SkillPathAI/frontend/src/js/app.js'></script></head><body></body></html>"
```

---

### Method 3: Bookmarklet (One-Click)
Create a new bookmark in your browser with the URL:
```javascript
javascript:(function(){const s=document.createElement('script');s.src='file:///C:/Users/ADMIN/Desktop/java project/SkillPathAI/frontend/src/js/app.js';document.head.appendChild(s);})();
```
Click the bookmark whenever you are on a blank browser page to load the platform.
