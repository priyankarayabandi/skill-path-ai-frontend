/**
 * SkillPath AI — Main Application Orchestrator & Router
 * Pure Vanilla JavaScript DOM Architecture (Strict zero .html files constraint)
 */
(function () {
  "use strict";

  const { el, showAuthModal, showToast } = window.SkillPathUI;
  const api = window.SkillPathAPI;
  const studentViews = window.SkillPathStudentViews;
  const adminViews = window.SkillPathAdminViews;

  let currentRoute = "home"; // 'home' | 'student' | 'assessment' | 'admin' | 'resources'

  function initApp() {
    const root = document.getElementById("skillpath-root");
    if (!root) return;

    window.SkillPathEvents.on("nav:go", (route) => navigateTo(route));
    window.SkillPathEvents.on("auth:change", () => {
      renderSidebar();
      renderTopNav();
      renderMainContent();
    });

    renderShell(root);
    navigateTo(currentRoute);
  }

  function renderShell(root) {
    root.innerHTML = "";

    const sidebar = el("aside", { className: "sidebar", id: "app-sidebar" });
    const mainWrapper = el("div", { className: "main-wrapper" }, [
      el("header", { className: "top-navbar", id: "top-navbar" }),
      el("main", { className: "content-body", id: "content-body" })
    ]);

    root.appendChild(sidebar);
    root.appendChild(mainWrapper);

    renderSidebar();
    renderTopNav();
  }

  function renderSidebar() {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;
    sidebar.innerHTML = "";

    // Brand Header
    const brand = el("div", { className: "sidebar-header" }, [
      el("div", { className: "brand-logo-icon", text: "⚡" }),
      el("div", { className: "brand-text-wrap" }, [
        el("span", { className: "brand-logo-title", text: "SkillPath AI" }),
        el("span", { className: "brand-logo-sub", text: "Career Roadmap Engine" })
      ])
    ]);
    sidebar.appendChild(brand);

    // Nav Links
    const user = api.auth.getUser();
    const navMenu = el("nav", { className: "sidebar-menu" });

    const navItems = [
      { id: "home", icon: "🏠", label: "Home Landing" },
      { id: "student", icon: "🎓", label: "Student Dashboard" },
      { id: "assessment", icon: "🎯", label: "Career Assessment" },
      { id: "resources", icon: "📚", label: "Learning Materials" },
      { id: "admin", icon: "🛡️", label: "Admin Portal", badge: api.auth.isAdmin() ? "ADMIN" : "LOCKED" }
    ];

    navMenu.appendChild(el("div", { className: "menu-section-label", text: "Navigation" }));

    navItems.forEach((item) => {
      const link = el("button", {
        className: `sidebar-link ${currentRoute === item.id ? "active" : ""}`,
        events: {
          click: () => navigateTo(item.id)
        }
      }, [
        el("span", { className: "sidebar-icon", text: item.icon }),
        el("span", { text: item.label }),
        item.badge ? el("span", { className: "sidebar-badge", text: item.badge }) : null
      ]);
      navMenu.appendChild(link);
    });

    sidebar.appendChild(navMenu);

    // Sidebar Footer Profile
    const footer = el("div", { className: "sidebar-footer" });
    if (user) {
      footer.appendChild(
        el("div", { className: "user-mini-avatar", text: user.name.charAt(0).toUpperCase() })
      );
      footer.appendChild(
        el("div", { className: "user-mini-info" }, [
          el("div", { className: "user-mini-name", text: user.name }),
          el("div", { className: "user-mini-role", text: user.role })
        ])
      );
      footer.appendChild(
        el("button", {
          className: "btn btn-secondary btn-sm",
          attrs: { title: "Sign Out" },
          text: "Log Out",
          events: {
            click: () => {
              api.auth.clearSession();
              showToast("Signed out successfully.", "info");
              window.SkillPathEvents.emit("auth:change");
              navigateTo("home");
            }
          }
        })
      );
    } else {
      footer.appendChild(
        el("button", {
          className: "btn btn-primary btn-sm",
          attrs: { style: "width: 100%; justify-content: center;" },
          text: "🔑 Sign In / Register",
          events: {
            click: () => showAuthModal("login", () => { })
          }
        })
      );
    }

    sidebar.appendChild(footer);
  }

  function renderTopNav() {
    const topNav = document.getElementById("top-navbar");
    if (!topNav) return;
    topNav.innerHTML = "";

    const titles = {
      home: "Platform Overview",
      student: "Student Learning Dashboard",
      assessment: "AI Career Assessment Engine",
      resources: "Curated Learning Catalog",
      admin: "Administrator Governance Center"
    };

    const titleWrap = el("div", { className: "page-title-wrap" }, [
      el("h2", { text: titles[currentRoute] || "SkillPath AI" })
    ]);

    const actionsWrap = el("div", { className: "top-nav-actions" }, [
      el("div", { className: "status-pill" }, [
        el("div", { className: "status-dot" }),
        el("span", { text: "Spring Boot + MySQL Online" })
      ])
    ]);

    topNav.appendChild(titleWrap);
    topNav.appendChild(actionsWrap);
  }

  function navigateTo(route) {
    currentRoute = route;
    renderSidebar();
    renderTopNav();
    renderMainContent();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderMainContent() {
    const content = document.getElementById("content-body");
    if (!content) return;
    content.innerHTML = "";

    switch (currentRoute) {
      case "home":
        renderHome(content);
        break;
      case "student":
        const user = api.auth.getUser();
        if (!user) {
          content.appendChild(
            el("div", { className: "hero-banner", attrs: { style: "text-align: center;" } }, [
              el("span", { className: "badge badge-blue", text: "Student Portal" }),
              el("h1", { className: "hero-title", text: "Please Sign In to Access Your Dashboard", attrs: { style: "margin-top: 0.5rem;" } }),
              el("p", { className: "hero-desc", text: "Track personal competencies, milestone completions, and career gap analyses.", attrs: { style: "margin: 0.5rem auto 1.5rem auto;" } }),
              el("button", {
                className: "btn btn-primary",
                text: "Sign In as Student",
                events: {
                  click: () => showAuthModal("login", () => renderMainContent())
                }
              })
            ])
          );
        } else {
          studentViews.renderDashboard(content, user.studentId || 1);
        }
        break;
      case "assessment":
        studentViews.renderAssessment(content);
        break;
      case "admin":
        adminViews.renderDashboard(content);
        break;
      case "resources":
        renderResourcesCatalog(content);
        break;
    }
  }

  // ==========================================
  // 1. Home Landing Page
  // ==========================================
  async function renderHome(container) {
    const hero = el("div", { className: "hero-banner" }, [
      el("span", { className: "badge badge-blue", text: "Industry Ready In 2026" }),
      el("h1", { className: "hero-title", text: "Master In-Demand Tech Careers with AI-Guided Roadmaps" }),
      el("p", { className: "hero-desc", text: "SkillPath AI bridges the academia-industry gap. Assess current competencies, generate personalized weekly learning milestones, and follow step-by-step career tracks modeled for modern engineering roles." }),
      el("div", { attrs: { style: "display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;" } }, [
        el("button", {
          className: "btn btn-primary",
          text: "🚀 Start Free Career Assessment",
          events: { click: () => navigateTo("assessment") }
        }),
        el("button", {
          className: "btn btn-secondary",
          text: "🎓 Access Student Portal",
          events: { click: () => navigateTo("student") }
        }),
        el("button", {
          className: "btn btn-secondary",
          text: "🛡️ Admin Studio",
          events: { click: () => navigateTo("admin") }
        })
      ])
    ]);
    container.appendChild(hero);

    // 4 Key Pillars
    const pillars = [
      { icon: "🎯", title: "AI Skill Gap Engine", desc: "Compare current student proficiencies against target market roles and identify exact missing core requirements." },
      { icon: "🗺️", title: "Milestone-Driven Roadmaps", desc: "Step-by-step structured stages with actionable weekly tasks, deliverables, and estimated study hours." },
      { icon: "⚡", title: "Live Progress Tracking", desc: "Interactive completion checkboxes and notes to visualize career readiness percentage in real time." },
      { icon: "🛡️", title: "Enterprise Admin Governance", desc: "Secure Spring Security role-based access control protecting all CRUD endpoints for careers, skills, and resources." }
    ];

    const pillarsGrid = el("div", { className: "features-grid" },
      pillars.map((p) =>
        el("div", { className: "feature-box" }, [
          el("div", { className: "feature-icon", text: p.icon }),
          el("h3", { className: "feature-title", text: p.title }),
          el("p", { className: "feature-text", text: p.desc })
        ])
      )
    );
    container.appendChild(pillarsGrid);

    // Career Tracks Preview Grid
    try {
      const careers = await api.getCareers();
      const careersSection = el("div", { className: "card" }, [
        el("div", { className: "card-header" }, [
          el("div", {}, [
            el("h3", { className: "card-title", text: "Featured Career Tracks" }),
            el("p", { attrs: { style: "font-size: 0.82rem; color: var(--slate-400); margin-top: 0.2rem;" }, text: "Pre-configured comprehensive learning tracks tailored for industry hiring standards." })
          ]),
          el("button", {
            className: "btn btn-secondary btn-sm",
            text: "Take Assessment For These Roles →",
            events: { click: () => navigateTo("assessment") }
          })
        ]),
        el("div", { className: "card-body" }, [
          el("div", { className: "card-grid" },
            careers.map((c) =>
              el("div", {
                attrs: {
                  style: "background: rgba(10, 25, 47, 0.8); border: 1px solid var(--surface-border); border-radius: var(--radius-sm); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;"
                }
              }, [
                el("div", { attrs: { style: "display: flex; justify-content: space-between; align-items: flex-start;" } }, [
                  el("h4", { text: c.title, attrs: { style: "font-size: 1.1rem; color: var(--white); font-weight: 700;" } }),
                  el("span", { className: "badge badge-green", text: c.demandLevel })
                ]),
                el("div", { text: `Category: ${c.category}`, attrs: { style: "font-size: 0.8rem; color: var(--light-blue-300);" } }),
                el("p", { text: c.description, attrs: { style: "font-size: 0.85rem; color: var(--slate-300); line-height: 1.5;" } }),
                el("div", { attrs: { style: "display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--surface-border);" } }, [
                  el("span", { text: c.salaryRange, attrs: { style: "font-weight: 700; color: #38bdf8; font-size: 0.88rem;" } }),
                  el("button", {
                    className: "btn btn-primary btn-sm",
                    text: "Select Track",
                    events: {
                      click: () => navigateTo("assessment")
                    }
                  })
                ])
              ])
            )
          )
        ])
      ]);
      container.appendChild(careersSection);
    } catch (e) { }
  }

  // ==========================================
  // 2. Learning Resources Catalog (Public View)
  // ==========================================
  async function renderResourcesCatalog(container) {
    container.innerHTML = "";
    const loader = el("div", { className: "card", attrs: { style: "padding: 2rem; text-align: center; color: var(--slate-300);" }, text: "Loading curated learning resources catalog..." });
    container.appendChild(loader);

    try {
      const resources = await api.getResources();
      container.innerHTML = "";

      const banner = el("div", { className: "hero-banner" }, [
        el("span", { className: "badge badge-blue", text: "Knowledge Vault" }),
        el("h1", { className: "hero-title", text: "Curated Learning Resources & Documentation" }),
        el("p", { className: "hero-desc", text: "High-yield industry courses, official documentation, interactive labs, and guides mapped directly to career roadmap milestones." })
      ]);
      container.appendChild(banner);

      const card = el("div", { className: "card" }, [
        el("div", { className: "card-header" }, [
          el("h3", { className: "card-title", text: `Available Resources (${resources.length})` })
        ]),
        el("div", { className: "card-body" }, [
          el("div", { className: "card-grid" },
            resources.map((r) =>
              el("div", {
                attrs: {
                  style: "background: rgba(10, 25, 47, 0.8); border: 1px solid var(--surface-border); border-radius: var(--radius-sm); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem;"
                }
              }, [
                el("div", { attrs: { style: "display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;" } }, [
                  el("h4", { text: r.title, attrs: { style: "font-size: 1.05rem; color: var(--white); font-weight: 700;" } }),
                  el("span", { className: "badge badge-blue", text: r.resourceType })
                ]),
                el("div", { text: `Provider: ${r.provider} • Category: ${r.category}`, attrs: { style: "font-size: 0.8rem; color: var(--light-blue-300);" } }),
                el("p", { text: r.description, attrs: { style: "font-size: 0.85rem; color: var(--slate-300); line-height: 1.5;" } }),
                el("div", { attrs: { style: "display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--surface-border);" } }, [
                  el("span", { className: "badge badge-green", text: r.difficulty }),
                  el("a", {
                    className: "btn btn-primary btn-sm",
                    attrs: { href: r.url, target: "_blank", rel: "noreferrer" },
                    text: "Access Material ↗"
                  })
                ])
              ])
            )
          )
        ])
      ]);
      container.appendChild(card);

    } catch (err) {
      container.innerHTML = "";
      container.appendChild(el("div", { className: "card", attrs: { style: "padding: 2rem; color: #f87171;" }, text: err.message }));
    }
  }

  // Bootstrap when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
