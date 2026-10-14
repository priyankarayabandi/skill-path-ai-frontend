/**
 * SkillPath AI — Student Views (Dashboard, Roadmap Tracker & Assessment Engine)
 */
(function (window) {
    "use strict";

    const { el, showToast, confirmDialog } = window.SkillPathUI;
    const api = window.SkillPathAPI;

    async function renderDashboard(container, studentId) {
        container.innerHTML = "";
        const loader = el("div", { className: "card", attrs: { style: "padding: 2rem; text-align: center; color: var(--slate-300);" }, text: "Loading personalized roadmap and progress..." });
        container.appendChild(loader);

        try {
            const profile = await api.getStudentProfile(studentId);
            const targetCareerId = profile.student.targetCareerId || 1;
            const roadmap = await api.getStudentRoadmap(studentId, targetCareerId);
            const gap = await api.getGapAnalysis(studentId, targetCareerId);
            const allSkills = await api.getSkills();

            container.innerHTML = "";

            // 1. Student Header Banner
            const readiness = gap.readinessScore || profile.readinessScore || 0;
            const banner = el("div", { className: "hero-banner" }, [
                el("div", { attrs: { style: "display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;" } }, [
                    el("div", {}, [
                        el("span", { className: "badge badge-blue", attrs: { style: "margin-bottom: 0.5rem;" }, text: "Student Portal" }),
                        el("h1", { className: "hero-title", text: profile.student.name }),
                        el("p", { className: "hero-desc", text: `${profile.student.major} • ${profile.student.university} (${profile.student.yearOfStudy})` }),
                        el("p", { attrs: { style: "color: var(--light-blue-300); font-size: 0.88rem; margin-top: 0.35rem;" }, text: `🎯 Target Track: ${profile.targetCareerTitle}` })
                    ]),
                    el("div", { attrs: { style: "min-width: 200px;" } }, [
                        el("div", { className: "progress-container" }, [
                            el("div", { className: "progress-header" }, [
                                el("span", { text: "Career Readiness Score" }),
                                el("span", { text: `${readiness}%`, attrs: { style: "font-weight: 800; color: var(--light-blue-400);" } })
                            ]),
                            el("div", { className: "progress-track" }, [
                                el("div", { className: "progress-fill", attrs: { style: `width: ${readiness}%;` } })
                            ]),
                            el("span", { className: "badge badge-green", attrs: { style: "margin-top: 0.5rem; align-self: flex-start;" }, text: gap.readinessLevel || "On Track" })
                        ])
                    ])
                ])
            ]);
            container.appendChild(banner);

            // 2. Overview Stats Grid
            const statsGrid = el("div", { className: "stats-grid" }, [
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "🗺️" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: `${roadmap.completedMilestones}/${roadmap.totalMilestones}` }),
                        el("div", { className: "stat-label", text: "Milestones Completed" })
                    ])
                ]),
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "⚡" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: (profile.skills || []).length }),
                        el("div", { className: "stat-label", text: "Verified Skills" })
                    ])
                ]),
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "💼" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: roadmap.salaryRange || "$95,000" }),
                        el("div", { className: "stat-label", text: "Market Salary Potential" })
                    ])
                ]),
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "🔥" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: roadmap.demandLevel || "Very High" }),
                        el("div", { className: "stat-label", text: "Industry Demand" })
                    ])
                ])
            ]);
            container.appendChild(statsGrid);

            // 3. Skills Matrix & AI Recommendations Grid
            const twoCol = el("div", { attrs: { style: "display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;" } }, [
                // Left: My Skills
                el("div", { className: "card" }, [
                    el("div", { className: "card-header" }, [
                        el("h3", { className: "card-title", text: "My Technical Competencies" }),
                        el("button", {
                            className: "btn btn-primary btn-sm",
                            text: "+ Add Skill",
                            events: {
                                click: () => showAddSkillModal(studentId, allSkills, () => renderDashboard(container, studentId))
                            }
                        })
                    ]),
                    el("div", { className: "card-body" }, [
                        (profile.skills || []).length === 0
                            ? el("p", { attrs: { style: "color: var(--slate-400); font-size: 0.9rem;" }, text: "No skills assigned yet. Add competencies to calculate readiness score!" })
                            : el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 0.75rem;" } },
                                (profile.skills || []).map((ss) =>
                                    el("div", {
                                        attrs: {
                                            style: "display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: rgba(10, 25, 47, 0.7); border: 1px solid var(--surface-border); border-radius: var(--radius-sm);"
                                        }
                                    }, [
                                        el("div", { attrs: { style: "display: flex; align-items: center; gap: 0.6rem;" } }, [
                                            el("span", { text: ss.icon || "⚡", attrs: { style: "font-size: 1.2rem;" } }),
                                            el("div", {}, [
                                                el("div", { text: ss.skillName, attrs: { style: "font-weight: 700; font-size: 0.9rem;" } }),
                                                el("div", { text: ss.category, attrs: { style: "font-size: 0.75rem; color: var(--slate-400);" } })
                                            ])
                                        ]),
                                        el("div", { attrs: { style: "display: flex; align-items: center; gap: 0.6rem;" } }, [
                                            el("span", { className: "badge badge-blue", text: `Level ${ss.proficiencyLevel}/5` }),
                                            ss.verified ? el("span", { className: "badge badge-green", text: "Verified ✓" }) : null,
                                            el("button", {
                                                className: "btn btn-danger btn-sm",
                                                text: "×",
                                                attrs: { title: "Remove Skill" },
                                                events: {
                                                    click: () => {
                                                        confirmDialog("Remove Skill", `Remove ${ss.skillName} from your profile?`, async () => {
                                                            await api.removeStudentSkill(studentId, ss.skillId);
                                                            showToast(`Removed ${ss.skillName}`, "info");
                                                            renderDashboard(container, studentId);
                                                        });
                                                    }
                                                }
                                            })
                                        ])
                                    ])
                                )
                            )
                    ])
                ]),

                // Right: AI Recommendations & Skill Gap
                el("div", { className: "card" }, [
                    el("div", { className: "card-header" }, [
                        el("h3", { className: "card-title", text: "AI Recommendations & Skill Gaps" }),
                        el("span", { className: "badge badge-amber", text: `${gap.missingSkills ? gap.missingSkills.length : 0} Missing` })
                    ]),
                    el("div", { className: "card-body" }, [
                        el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 0.6rem;" } },
                            (gap.recommendedNextActions || []).map((rec) =>
                                el("div", {
                                    attrs: {
                                        style: "display: flex; gap: 0.6rem; font-size: 0.88rem; color: var(--slate-200); background: rgba(56, 189, 248, 0.05); padding: 0.6rem 0.85rem; border-radius: var(--radius-xs); border-left: 3px solid var(--light-blue-400);"
                                    }
                                }, [
                                    el("span", { text: "💡", attrs: { style: "flex-shrink: 0;" } }),
                                    el("span", { text: rec })
                                ])
                            )
                        )
                    ])
                ])
            ]);
            container.appendChild(twoCol);

            // 4. Personalized Learning Roadmap & Weekly Milestones
            const roadmapSection = el("div", { className: "card" }, [
                el("div", { className: "card-header" }, [
                    el("div", {}, [
                        el("h3", { className: "card-title", text: "Personalized Roadmap & Milestone Tracker" }),
                        el("p", { attrs: { style: "font-size: 0.8rem; color: var(--slate-400); margin-top: 0.2rem;" }, text: "Complete weekly tasks and deliverables to advance your career readiness." })
                    ]),
                    el("div", { attrs: { style: "display: flex; align-items: center; gap: 0.75rem;" } }, [
                        el("span", { className: "badge badge-blue", text: `${roadmap.progressPercentage}% Completed` })
                    ])
                ]),
                el("div", { className: "card-body" }, [
                    el("div", { className: "progress-container", attrs: { style: "margin-bottom: 1.5rem;" } }, [
                        el("div", { className: "progress-track" }, [
                            el("div", { className: "progress-fill", attrs: { style: `width: ${roadmap.progressPercentage}%;` } })
                        ])
                    ]),
                    el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 1.5rem;" } },
                        roadmap.stages.map((stage) =>
                            el("div", { className: "roadmap-stage" }, [
                                el("div", { className: "roadmap-stage-head" }, [
                                    el("div", {}, [
                                        el("span", { className: "badge badge-blue", text: `Stage ${stage.stageNumber}` }),
                                        el("h4", { text: stage.title, attrs: { style: "font-size: 1.1rem; font-weight: 700; margin-top: 0.35rem;" } }),
                                        el("p", { text: stage.description, attrs: { style: "font-size: 0.84rem; color: var(--slate-300); margin-top: 0.2rem;" } })
                                    ]),
                                    el("span", { className: "badge badge-purple", text: `${stage.durationWeeks} Weeks` })
                                ]),
                                el("div", { className: "milestones-list" },
                                    stage.milestones.map((m) => {
                                        const isDone = m.status === "COMPLETED";
                                        const isProgress = m.status === "IN_PROGRESS";

                                        const statusSelect = el("select", { className: "milestone-status-select" }, [
                                            el("option", { text: "Not Started", attrs: { value: "NOT_STARTED", selected: m.status === "NOT_STARTED" ? "true" : "" } }),
                                            el("option", { text: "In Progress", attrs: { value: "IN_PROGRESS", selected: isProgress ? "true" : "" } }),
                                            el("option", { text: "Completed ✓", attrs: { value: "COMPLETED", selected: isDone ? "true" : "" } })
                                        ]);

                                        const notesInput = el("input", {
                                            className: "form-input",
                                            attrs: {
                                                placeholder: "Deliverable note / GitHub URL / completion summary",
                                                value: m.notes || "",
                                                style: "font-size: 0.82rem; padding: 0.4rem 0.65rem;"
                                            }
                                        });

                                        return el("div", { className: `milestone-item ${isDone ? "completed" : ""}` }, [
                                            el("div", {
                                                attrs: {
                                                    style: "width: 28px; height: 28px; border-radius: 50%; background: " + (isDone ? "var(--success)" : "rgba(56, 189, 248, 0.2)") + "; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.82rem; flex-shrink: 0;"
                                                },
                                                text: isDone ? "✓" : `${m.sequenceOrder}`
                                            }),
                                            el("div", { attrs: { style: "flex: 1; display: flex; flex-direction: column; gap: 0.45rem;" } }, [
                                                el("div", { attrs: { style: "display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;" } }, [
                                                    el("span", { text: m.title, attrs: { style: "font-weight: 700; font-size: 0.95rem; color: var(--white);" } }),
                                                    el("span", { className: "badge badge-amber", text: `⏱ ~${m.estimatedHours} hrs` })
                                                ]),
                                                el("p", { text: m.description, attrs: { style: "font-size: 0.84rem; color: var(--slate-300);" } }),
                                                m.deliverable ? el("div", { attrs: { style: "font-size: 0.8rem; color: var(--light-blue-300);" }, text: `📦 Deliverable: ${m.deliverable}` }) : null,
                                                m.resourceLinks ? el("div", {}, [
                                                    el("a", {
                                                        className: "btn btn-secondary btn-sm",
                                                        attrs: { href: m.resourceLinks, target: "_blank", rel: "noreferrer", style: "font-size: 0.75rem; padding: 0.25rem 0.6rem;" },
                                                        text: "📖 View Guide / Resource ↗"
                                                    })
                                                ]) : null,
                                                el("div", { attrs: { style: "display: flex; gap: 0.5rem; align-items: center; margin-top: 0.4rem; flex-wrap: wrap;" } }, [
                                                    statusSelect,
                                                    notesInput,
                                                    el("button", {
                                                        className: "btn btn-primary btn-sm",
                                                        text: "Save Status",
                                                        events: {
                                                            click: async () => {
                                                                try {
                                                                    await api.updateMilestoneProgress(studentId, m.milestoneId, statusSelect.value, notesInput.value.trim());
                                                                    showToast(`Saved progress for "${m.title}"`, "success");
                                                                    renderDashboard(container, studentId);
                                                                } catch (err) {
                                                                    showToast(err.message, "error");
                                                                }
                                                            }
                                                        }
                                                    })
                                                ])
                                            ])
                                        ]);
                                    })
                                )
                            ])
                        )
                    )
                ])
            ]);
            container.appendChild(roadmapSection);

        } catch (err) {
            container.innerHTML = "";
            container.appendChild(
                el("div", { className: "card", attrs: { style: "padding: 2rem; text-align: center; color: #f87171;" } }, [
                    el("h3", { text: "Unable to load student dashboard" }),
                    el("p", { text: err.message, attrs: { style: "margin-top: 0.5rem;" } })
                ])
            );
        }
    }

    function showAddSkillModal(studentId, allSkills, onSuccess) {
        const skillSelect = el("select", { className: "form-select" },
            allSkills.map((s) => el("option", { text: `${s.icon || "⚡"} ${s.name} (${s.category})`, attrs: { value: s.id } }))
        );
        const levelSelect = el("select", { className: "form-select" }, [
            el("option", { text: "Level 1 — Novice / Basics", attrs: { value: 1 } }),
            el("option", { text: "Level 2 — Advanced Beginner", attrs: { value: 2 } }),
            el("option", { text: "Level 3 — Intermediate Working Knowledge", attrs: { value: 3, selected: "true" } }),
            el("option", { text: "Level 4 — Proficient / Independent", attrs: { value: 4 } }),
            el("option", { text: "Level 5 — Expert Mastery", attrs: { value: 5 } })
        ]);

        const modalBody = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 1rem;" } }, [
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Select Skill" }), skillSelect]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Your Current Proficiency" }), levelSelect])
        ]);

        const buttons = [
            el("button", { className: "btn btn-secondary", text: "Cancel", events: { click: window.SkillPathUI.closeModal } }),
            el("button", {
                className: "btn btn-primary",
                text: "Save Competency",
                events: {
                    click: async () => {
                        try {
                            await api.addStudentSkill(studentId, parseInt(skillSelect.value), parseInt(levelSelect.value), false);
                            showToast("Skill added to profile!", "success");
                            window.SkillPathUI.closeModal();
                            if (onSuccess) onSuccess();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    }
                }
            })
        ];

        window.SkillPathUI.showModal("Add Technical Skill", modalBody, buttons);
    }

    // ==========================================
    // Career Assessment Interactive Engine
    // ==========================================
    async function renderAssessment(container) {
        container.innerHTML = "";
        const loader = el("div", { className: "card", attrs: { style: "padding: 2rem; text-align: center; color: var(--slate-300);" }, text: "Preparing Career Assessment Studio..." });
        container.appendChild(loader);

        try {
            const careers = await api.getCareers();
            const allSkills = await api.getSkills();

            container.innerHTML = "";

            const banner = el("div", { className: "hero-banner" }, [
                el("span", { className: "badge badge-blue", text: "AI Assessment Engine" }),
                el("h1", { className: "hero-title", text: "Career Track & Competency Assessment" }),
                el("p", { className: "hero-desc", text: "Select your target career, self-evaluate current technical proficiencies, and obtain an instant AI skill-gap breakdown and personalized learning trajectory." })
            ]);
            container.appendChild(banner);

            let selectedCareerId = careers[0]?.id || 1;
            const skillRatings = {};

            const assessmentCard = el("div", { className: "card" }, [
                el("div", { className: "card-header" }, [
                    el("h3", { className: "card-title", text: "Step 1: Choose Your Target Career Track" })
                ]),
                el("div", { className: "card-body" }, [
                    el("div", { className: "form-group" }, [
                        el("label", { className: "form-label", text: "Engineering Track" }),
                        el("select", {
                            className: "form-select",
                            events: {
                                change: (e) => {
                                    selectedCareerId = parseInt(e.target.value);
                                    updateRequiredSkillsView();
                                }
                            }
                        }, careers.map((c) => el("option", { text: `${c.title} (${c.category}) — ${c.salaryRange}`, attrs: { value: c.id } })))
                    ])
                ])
            ]);
            container.appendChild(assessmentCard);

            const skillsContainer = el("div", { className: "card" });
            container.appendChild(skillsContainer);

            async function updateRequiredSkillsView() {
                skillsContainer.innerHTML = "";
                const skillsHeader = el("div", { className: "card-header" }, [
                    el("h3", { className: "card-title", text: "Step 2: Rate Your Technical Proficiencies" }),
                    el("span", { className: "badge badge-blue", text: "Scale: 1 (Novice) to 5 (Expert)" })
                ]);
                skillsContainer.appendChild(skillsHeader);

                const cardBody = el("div", { className: "card-body" });
                const requiredSkills = await api.getCareerSkills(selectedCareerId);

                if (requiredSkills.length === 0) {
                    cardBody.appendChild(el("p", { text: "No prerequisites defined yet.", attrs: { style: "color: var(--slate-400);" } }));
                } else {
                    requiredSkills.forEach((cs) => {
                        skillRatings[cs.skill.id] = skillRatings[cs.skill.id] || 2;
                        const slider = el("input", {
                            attrs: { type: "range", min: "1", max: "5", value: `${skillRatings[cs.skill.id]}`, style: "flex: 1;" },
                            events: {
                                input: (e) => {
                                    const val = parseInt(e.target.value);
                                    skillRatings[cs.skill.id] = val;
                                    labelVal.textContent = `Level ${val}/5`;
                                }
                            }
                        });
                        const labelVal = el("span", { className: "badge badge-blue", text: `Level ${skillRatings[cs.skill.id]}/5` });

                        cardBody.appendChild(
                            el("div", {
                                attrs: {
                                    style: "display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; background: rgba(10, 25, 47, 0.7); border: 1px solid var(--surface-border); border-radius: var(--radius-sm); margin-bottom: 0.5rem;"
                                }
                            }, [
                                el("div", { attrs: { style: "width: 220px;" } }, [
                                    el("div", { text: cs.skill.name, attrs: { style: "font-weight: 700; font-size: 0.95rem;" } }),
                                    el("div", { text: `Target Req: Level ${cs.requiredLevel}`, attrs: { style: "font-size: 0.75rem; color: var(--light-blue-300);" } })
                                ]),
                                slider,
                                labelVal
                            ])
                        );
                    });
                }

                const submitBtn = el("button", {
                    className: "btn btn-primary",
                    attrs: { style: "margin-top: 1rem; align-self: flex-start;" },
                    text: "🚀 Generate AI Gap Analysis & Readiness Trajectory",
                    events: {
                        click: () => runAssessmentCalculation(selectedCareerId, skillRatings, requiredSkills)
                    }
                });
                cardBody.appendChild(submitBtn);
                skillsContainer.appendChild(cardBody);
            }

            await updateRequiredSkillsView();

            const resultsContainer = el("div", { id: "assessment-results-area" });
            container.appendChild(resultsContainer);

            function runAssessmentCalculation(careerId, ratings, reqSkills) {
                resultsContainer.innerHTML = "";
                let totalScore = 0;
                let maxScore = 0;
                const matched = [];
                const missing = [];

                reqSkills.forEach((cs) => {
                    const userLevel = ratings[cs.skill.id] || 0;
                    const reqLevel = cs.requiredLevel || 3;
                    maxScore += reqLevel;
                    totalScore += Math.min(userLevel, reqLevel);

                    if (userLevel >= reqLevel) {
                        matched.push(cs.skill.name);
                    } else {
                        missing.push(`${cs.skill.name} (Need Level ${reqLevel}, currently ${userLevel})`);
                    }
                });

                const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 50;

                const resultsCard = el("div", { className: "card", attrs: { style: "border: 1px solid var(--light-blue-400);" } }, [
                    el("div", { className: "card-header" }, [
                        el("h3", { className: "card-title", text: "📊 AI Assessment Evaluation Result" }),
                        el("span", { className: "badge badge-green", text: `${scorePercent}% Alignment` })
                    ]),
                    el("div", { className: "card-body" }, [
                        el("div", { className: "progress-container" }, [
                            el("div", { className: "progress-header" }, [
                                el("span", { text: "Overall Alignment with Target Track" }),
                                el("span", { text: `${scorePercent}%` })
                            ]),
                            el("div", { className: "progress-track" }, [
                                el("div", { className: "progress-fill success", attrs: { style: `width: ${scorePercent}%;` } })
                            ])
                        ]),
                        el("div", { attrs: { style: "display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;" } }, [
                            el("div", { attrs: { style: "background: rgba(16, 185, 129, 0.08); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.2);" } }, [
                                el("h4", { text: `✓ Matched Competencies (${matched.length})`, attrs: { style: "color: #34d399; margin-bottom: 0.5rem;" } }),
                                matched.length === 0 ? el("p", { text: "No competencies met yet." }) : el("ul", { attrs: { style: "padding-left: 1.2rem; font-size: 0.88rem;" } }, matched.map((m) => el("li", { text: m })))
                            ]),
                            el("div", { attrs: { style: "background: rgba(239, 68, 68, 0.08); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(239, 68, 68, 0.2);" } }, [
                                el("h4", { text: `⚡ Focus Gaps to Bridge (${missing.length})`, attrs: { style: "color: #f87171; margin-bottom: 0.5rem;" } }),
                                missing.length === 0 ? el("p", { text: "All core competencies met! You are industry ready." }) : el("ul", { attrs: { style: "padding-left: 1.2rem; font-size: 0.88rem;" } }, missing.map((m) => el("li", { text: m })))
                            ])
                        ]),
                        el("div", { attrs: { style: "margin-top: 1.5rem;" } }, [
                            el("button", {
                                className: "btn btn-primary",
                                text: "📌 Apply Track to My Student Profile",
                                events: {
                                    click: async () => {
                                        const user = api.auth.getUser();
                                        if (!user || !user.studentId) {
                                            window.SkillPathUI.showAuthModal("login", () => renderAssessment(container));
                                            return;
                                        }
                                        try {
                                            const prof = await api.getStudentProfile(user.studentId);
                                            const s = prof.student;
                                            s.targetCareerId = careerId;
                                            await fetch(`http://localhost:8080/api/students/${user.studentId}`, {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify(s)
                                            });
                                            showToast("Target Career Track updated successfully!", "success");
                                            window.SkillPathEvents.emit("nav:go", "student");
                                        } catch (e) {
                                            showToast(e.message, "error");
                                        }
                                    }
                                }
                            })
                        ])
                    ])
                ]);

                resultsContainer.appendChild(resultsCard);
                resultsCard.scrollIntoView({ behavior: "smooth" });
            }

        } catch (err) {
            container.innerHTML = "";
            container.appendChild(el("div", { className: "card", attrs: { style: "padding: 2rem; color: #f87171;" }, text: err.message }));
        }
    }

    window.SkillPathStudentViews = {
        renderDashboard,
        renderAssessment
    };
})(window);
