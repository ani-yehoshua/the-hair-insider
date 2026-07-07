// @ts-nocheck
/* Workbook interactive logic; runs client-side only, called from useEffect */

export function initWorkbook(): () => void {
    const KEY = 'hairinsider-workbook-v1';
    const VKEY = 'hairinsider-workbook-visits-v1';

    /* ---------- storage helpers ---------- */
    function loadAll() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || {};
        } catch (e) {
            return {};
        }
    }
    function saveAll(d) {
        try {
            localStorage.setItem(KEY, JSON.stringify(d));
        } catch (e) {}
    }
    const state = loadAll();
    const persist = (() => {
        let t;
        return () => {
            clearTimeout(t);
            t = setTimeout(() => {
                saveAll(state);
                updateDashboard();
                updateTocChecks();
                checkMilestones();
            }, 200);
        };
    })();
    function set(path, val) {
        const parts = path.split('.');
        let cur = state;
        for (let i = 0; i < parts.length - 1; i++) {
            cur[parts[i]] = cur[parts[i]] || {};
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = val;
        persist();
    }
    function get(path, fallback) {
        const parts = path.split('.');
        let cur = state;
        for (const p of parts) {
            if (cur == null) return fallback;
            cur = cur[p];
        }
        return cur == null ? fallback : cur;
    }

    /* ---------- visit tracking ---------- */
    function todayISO() {
        const d = new Date();
        return (
            d.getFullYear() +
            '-' +
            String(d.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(d.getDate()).padStart(2, '0')
        );
    }
    function trackVisit() {
        let v;
        try {
            v = JSON.parse(localStorage.getItem(VKEY)) || {};
        } catch (e) {
            v = {};
        }
        v.days = v.days || {};
        const t = todayISO();
        v.days[t] = true;
        let streak = 0;
        let cur = new Date();
        while (true) {
            const iso =
                cur.getFullYear() +
                '-' +
                String(cur.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(cur.getDate()).padStart(2, '0');
            if (v.days[iso]) {
                streak++;
                cur.setDate(cur.getDate() - 1);
            } else break;
        }
        v.streak = streak;
        v.totalDays = Object.keys(v.days).length;
        localStorage.setItem(VKEY, JSON.stringify(v));
        return v;
    }
    const visits = trackVisit();

    /* ---------- TOC build ---------- */
    const tocList = document.getElementById('tocList');
    const sections = document.querySelectorAll('main section');
    sections.forEach(sec => {
        const id = sec.id,
            title = sec.dataset.title;
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${id}"><span>${title}</span><span class="toc-check" data-toc="${sec.dataset.section}"></span></a>`;
        tocList.appendChild(li);
    });
    function openToc() {
        document.getElementById('tocDrawer').classList.add('open');
        document.getElementById('scrim').classList.add('open');
    }
    function closeToc() {
        document.getElementById('tocDrawer').classList.remove('open');
        document.getElementById('scrim').classList.remove('open');
    }
    document.getElementById('tocOpen').addEventListener('click', openToc);
    document.getElementById('tocClose').addEventListener('click', closeToc);
    document.getElementById('scrim').addEventListener('click', closeToc);
    tocList.addEventListener('click', e => {
        if (e.target.closest('a')) closeToc();
    });

    /* ---------- reveal on scroll ---------- */
    const io = new IntersectionObserver(
        entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: '-40px 0px' },
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* ---------- toast ---------- */
    const toastEl = document.getElementById('toast');
    let toastT;
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastT);
        toastT = setTimeout(() => toastEl.classList.remove('show'), 2400);
    }

    /* ---------- checklists ---------- */
    function initChecklists() {
        document.querySelectorAll('[data-checklist]').forEach(group => {
            const ns = group.dataset.checklist;
            state.checks = state.checks || {};
            state.checks[ns] = state.checks[ns] || {};
            group.querySelectorAll('.check-row').forEach(row => {
                const id = row.dataset.id;
                if (state.checks[ns][id]) row.classList.add('checked');
                row.addEventListener('click', () => {
                    row.classList.toggle('checked');
                    state.checks[ns][id] = row.classList.contains('checked');
                    persist();
                });
            });
        });
    }
    function countChecks(prefix) {
        state.checks = state.checks || {};
        let total = 0,
            done = 0;
        document.querySelectorAll('[data-checklist]').forEach(g => {
            if (!g.dataset.checklist.startsWith(prefix)) return;
            g.querySelectorAll('.check-row').forEach(r => {
                total++;
                if (
                    state.checks[g.dataset.checklist] &&
                    state.checks[g.dataset.checklist][r.dataset.id]
                )
                    done++;
            });
        });
        return {
            total,
            done,
            pct: total ? Math.round((done / total) * 100) : 0,
        };
    }

    /* ---------- choice groups ---------- */
    function initChoiceGroup(scopeAttr, scopeKey) {
        document
            .querySelectorAll(
                `[${scopeAttr}="${scopeKey}"] [data-choice-group]`,
            )
            .forEach(grp => {
                const groupKey = grp.dataset.choiceGroup;
                const saved = get(`${scopeKey}.${groupKey}`);
                grp.querySelectorAll('.choice').forEach(btn => {
                    if (btn.dataset.val === saved) btn.classList.add('on');
                    btn.addEventListener('click', () => {
                        grp.querySelectorAll('.choice').forEach(b =>
                            b.classList.remove('on'),
                        );
                        btn.classList.add('on');
                        set(`${scopeKey}.${groupKey}`, btn.dataset.val);
                    });
                });
            });
    }
    initChecklists();
    initChoiceGroup('data-profile', 'know');

    /* ---------- DAILY JOURNAL ---------- */
    const journalDate = document.getElementById('journalDate');
    state.journal = state.journal || {};
    function currentJournalDate() {
        return journalDate.value || todayISO();
    }
    function loadJournal(dateStr) {
        const entry = state.journal[dateStr] || {};
        document
            .querySelectorAll('[data-journal]')
            .forEach(el => (el.value = entry[el.dataset.journal] || ''));
        const cups = entry.water || 0;
        document.querySelectorAll('.water-cup').forEach(c => {
            c.classList.toggle('on', parseInt(c.dataset.cup) <= cups);
        });
        document.getElementById('waterCount').textContent = cups;
        document
            .querySelectorAll('[data-choice-group="silk"] .choice')
            .forEach(b =>
                b.classList.toggle('on', b.dataset.val === entry.silk),
            );
        document
            .querySelectorAll('[data-mood] .mood-btn')
            .forEach(b =>
                b.classList.toggle('on', b.dataset.moodVal === entry.mood),
            );
    }
    function saveJournalField(field, val) {
        const d = currentJournalDate();
        state.journal[d] = state.journal[d] || {};
        state.journal[d][field] = val;
        persist();
        updateDailyCount();
    }
    function updateDailyCount() {
        const count = Object.keys(state.journal).filter(d => {
            const e = state.journal[d];
            if (!e) return false;
            return Object.values(e).some(
                v => v && (typeof v !== 'string' || v.trim()),
            );
        }).length;
        document.getElementById('dailyChipCount').textContent = count;
    }
    journalDate.value = todayISO();
    loadJournal(journalDate.value);
    journalDate.addEventListener('change', () =>
        loadJournal(journalDate.value),
    );
    document.getElementById('journalPrev').addEventListener('click', () => {
        const d = new Date(currentJournalDate());
        d.setDate(d.getDate() - 1);
        journalDate.value = d.toISOString().slice(0, 10);
        loadJournal(journalDate.value);
    });
    document.getElementById('journalNext').addEventListener('click', () => {
        const d = new Date(currentJournalDate());
        d.setDate(d.getDate() + 1);
        journalDate.value = d.toISOString().slice(0, 10);
        loadJournal(journalDate.value);
    });
    document.querySelectorAll('[data-journal]').forEach(el => {
        el.addEventListener('input', () =>
            saveJournalField(el.dataset.journal, el.value),
        );
    });
    document.querySelectorAll('.water-cup').forEach(cup => {
        cup.addEventListener('click', () => {
            const d = currentJournalDate();
            state.journal[d] = state.journal[d] || {};
            const idx = parseInt(cup.dataset.cup);
            const current = state.journal[d].water || 0;
            state.journal[d].water = current === idx ? idx - 1 : idx;
            persist();
            loadJournal(d);
        });
    });
    document
        .querySelectorAll('[data-choice-group="silk"] .choice')
        .forEach(btn => {
            btn.addEventListener('click', () =>
                saveJournalField('silk', btn.dataset.val),
            );
        });
    document.querySelectorAll('[data-mood] .mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cur = (state.journal[currentJournalDate()] || {}).mood;
            saveJournalField(
                'mood',
                cur === btn.dataset.moodVal ? '' : btn.dataset.moodVal,
            );
            loadJournal(currentJournalDate());
        });
    });
    updateDailyCount();

    /* ---------- SMART goals ---------- */
    state.smart = state.smart || {};
    document.querySelectorAll('[data-smart]').forEach(el => {
        el.value = state.smart[el.dataset.smart] || '';
        el.addEventListener('input', () => {
            state.smart[el.dataset.smart] = el.value;
            persist();
        });
    });

    /* ---------- WHEEL OF ALIGNMENT ---------- */
    const wheelCats = [
        { key: 'health', label: 'Health' },
        { key: 'friends', label: 'Friends' },
        { key: 'family', label: 'Family' },
        { key: 'recreation', label: 'Recreation' },
        { key: 'spirituality', label: 'Spirit' },
        { key: 'career', label: 'Career' },
        { key: 'finance', label: 'Finance' },
        { key: 'growth', label: 'Growth' },
    ];
    state.wheel = state.wheel || {};
    function renderWheel() {
        const cx = 160,
            cy = 160,
            R = 120;
        const slices = document.getElementById('wheelSlices');
        const fillG = document.getElementById('wheelFill');
        const labels = document.getElementById('wheelLabels');
        const rings = document.getElementById('wheelRings');
        slices.innerHTML = '';
        fillG.innerHTML = '';
        labels.innerHTML = '';
        rings.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            rings.innerHTML += `<circle cx="${cx}" cy="${cy}" r="${(R * i) / 10}" fill="none" stroke="rgba(143,147,121,0.15)" stroke-width="0.5"/>`;
        }
        const N = wheelCats.length;
        for (let i = 0; i < N; i++) {
            const a1 = (i / N) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
            const x1 = cx + Math.cos(a1) * R,
                y1 = cy + Math.sin(a1) * R;
            const x2 = cx + Math.cos(a2) * R,
                y2 = cy + Math.sin(a2) * R;
            slices.innerHTML += `<path class="wheel-slice" d="M${cx},${cy} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z"/>`;
            const v = state.wheel[wheelCats[i].key] || 0;
            if (v > 0) {
                const r = (R * v) / 10;
                const fx1 = cx + Math.cos(a1) * r,
                    fy1 = cy + Math.sin(a1) * r;
                const fx2 = cx + Math.cos(a2) * r,
                    fy2 = cy + Math.sin(a2) * r;
                fillG.innerHTML += `<path class="wheel-fill" d="M${cx},${cy} L${fx1},${fy1} A${r},${r} 0 0,1 ${fx2},${fy2} Z"/>`;
            }
            const mid = (a1 + a2) / 2;
            const lx = cx + Math.cos(mid) * (R + 18),
                ly = cy + Math.sin(mid) * (R + 18) + 4;
            labels.innerHTML += `<text class="wheel-label" x="${lx}" y="${ly}">${wheelCats[i].label}</text>`;
        }
    }
    const wheelControls = document.getElementById('wheelControls');
    wheelCats.forEach(cat => {
        const v = state.wheel[cat.key] || 0;
        const row = document.createElement('div');
        row.className = 'wheel-row';
        row.innerHTML = `<label>${cat.label}</label><div class="wheel-value" data-wheel-val="${cat.key}">${v}</div><input type="range" min="0" max="10" value="${v}" data-wheel-input="${cat.key}">`;
        wheelControls.appendChild(row);
    });
    wheelControls.addEventListener('input', e => {
        const inp = e.target.closest('[data-wheel-input]');
        if (!inp) return;
        const k = inp.dataset.wheelInput;
        state.wheel[k] = parseInt(inp.value);
        document.querySelector(`[data-wheel-val="${k}"]`).textContent =
            inp.value;
        persist();
        renderWheel();
    });
    renderWheel();

    /* ---------- HABIT TRACKER ---------- */
    const HABITS = [
        'Scalp massage',
        'Drink water',
        'Sleep on silk',
        'Detangle gently',
        'Take supplements',
        'Move my body',
        'Mindfulness moment',
        'Healthy meal',
        '7+ hours sleep',
        'Limit heat',
        'Read / learn',
        'Custom habit',
    ];
    state.habits = state.habits || {};
    function isoSunday(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().slice(0, 10);
    }
    let habitWeek = isoSunday(new Date());
    function fmtWeek(iso) {
        const d = new Date(iso);
        return (
            'Week of ' +
            d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
        );
    }
    function renderHabits() {
        document.getElementById('habitWeekLabel').textContent =
            fmtWeek(habitWeek);
        state.habits[habitWeek] = state.habits[habitWeek] || {
            names: {},
            marks: {},
            reflect: '',
        };
        const wk = state.habits[habitWeek];
        const body = document.getElementById('habitTableBody');
        body.innerHTML = '';
        HABITS.forEach((name, idx) => {
            const tr = document.createElement('tr');
            const nameVal = wk.names[idx] != null ? wk.names[idx] : name;
            tr.innerHTML =
                `<td><input class="habit-row-input" data-habit-name="${idx}" value="${nameVal.replace(/"/g, '&quot;')}"></td>` +
                [0, 1, 2, 3, 4, 5, 6]
                    .map(day => {
                        const on = wk.marks[idx + '-' + day] ? ' on' : '';
                        return `<td class="habit-cell${on}" data-habit-cell data-row="${idx}" data-day="${day}"><span class="habit-dot"></span></td>`;
                    })
                    .join('');
            body.appendChild(tr);
        });
        document.querySelector('[data-habit-reflect]').value = wk.reflect || '';
        updateHabitMeta();
    }
    function updateHabitMeta() {
        let total = 0;
        Object.values(state.habits).forEach(wk => {
            if (wk && wk.marks)
                Object.values(wk.marks).forEach(v => {
                    if (v) total++;
                });
        });
        document.getElementById('habitTotalDone').textContent = total;
        let streak = 0;
        let cur = new Date();
        cur.setHours(0, 0, 0, 0);
        for (let i = 0; i < 400; i++) {
            const w = isoSunday(cur);
            const day = cur.getDay();
            const wk = state.habits[w];
            let any = false;
            if (wk && wk.marks)
                HABITS.forEach((_, idx) => {
                    if (wk.marks[idx + '-' + day]) any = true;
                });
            if (any) {
                streak++;
                cur.setDate(cur.getDate() - 1);
            } else break;
        }
        document.getElementById('habitStreakNum').textContent = streak;
    }
    document.getElementById('habitPrev').addEventListener('click', () => {
        const d = new Date(habitWeek);
        d.setDate(d.getDate() - 7);
        habitWeek = isoSunday(d);
        renderHabits();
    });
    document.getElementById('habitNext').addEventListener('click', () => {
        const d = new Date(habitWeek);
        d.setDate(d.getDate() + 7);
        habitWeek = isoSunday(d);
        renderHabits();
    });
    document.getElementById('habitTableBody').addEventListener('click', e => {
        const cell = e.target.closest('[data-habit-cell]');
        if (!cell) return;
        const key = cell.dataset.row + '-' + cell.dataset.day;
        state.habits[habitWeek].marks[key] =
            !state.habits[habitWeek].marks[key];
        cell.classList.toggle('on');
        persist();
        updateHabitMeta();
    });
    document.getElementById('habitTableBody').addEventListener('input', e => {
        const inp = e.target.closest('[data-habit-name]');
        if (!inp) return;
        state.habits[habitWeek].names[inp.dataset.habitName] = inp.value;
        persist();
    });
    document
        .querySelector('[data-habit-reflect]')
        .addEventListener('input', e => {
            state.habits[habitWeek].reflect = e.target.value;
            persist();
        });
    renderHabits();

    /* ---------- LIFE GOALS ---------- */
    state.life = state.life || {};
    document.querySelectorAll('[data-life]').forEach(row => {
        const key = row.dataset.life;
        state.life[key] = state.life[key] || {};
        row.querySelectorAll('[data-life-field]').forEach(el => {
            el.value = state.life[key][el.dataset.lifeField] || '';
            el.addEventListener('input', () => {
                state.life[key][el.dataset.lifeField] = el.value;
                persist();
            });
        });
    });

    /* ---------- WEEKLY GROWTH TRACKER ---------- */
    const WEEK_DAYS = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];
    state.weekly = state.weekly || {};
    function isoMonday(date) {
        const d = new Date(date);
        const dow = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - dow);
        return d.toISOString().slice(0, 10);
    }
    let weeklyKey = isoMonday(new Date());
    function renderWeekly() {
        document.getElementById('weeklyLabel').textContent = fmtWeek(weeklyKey);
        state.weekly[weeklyKey] = state.weekly[weeklyKey] || {};
        const wk = state.weekly[weeklyKey];
        const body = document.getElementById('weeklyBody');
        body.innerHTML = '';
        WEEK_DAYS.forEach((day, i) => {
            wk[i] = wk[i] || { goals: '', feel: '', done: false };
            const row = document.createElement('div');
            row.className = 'weekly-day';
            row.innerHTML = `
              <div class="weekly-day-name">${day}</div>
              <div class="weekly-day-inputs">
                <textarea data-weekly-field="${i}.goals" placeholder="My goals…">${(wk[i].goals || '').replace(/</g, '&lt;')}</textarea>
                <textarea data-weekly-field="${i}.feel" placeholder="My feelings…">${(wk[i].feel || '').replace(/</g, '&lt;')}</textarea>
              </div>
              <button class="weekly-done${wk[i].done ? ' on' : ''}" data-weekly-done="${i}" aria-label="Mark done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></button>
            `;
            body.appendChild(row);
        });
    }
    document.getElementById('weeklyPrev').addEventListener('click', () => {
        const d = new Date(weeklyKey);
        d.setDate(d.getDate() - 7);
        weeklyKey = isoMonday(d);
        renderWeekly();
    });
    document.getElementById('weeklyNext').addEventListener('click', () => {
        const d = new Date(weeklyKey);
        d.setDate(d.getDate() + 7);
        weeklyKey = isoMonday(d);
        renderWeekly();
    });
    document.getElementById('weeklyBody').addEventListener('input', e => {
        const t = e.target.closest('[data-weekly-field]');
        if (!t) return;
        const [idx, f] = t.dataset.weeklyField.split('.');
        state.weekly[weeklyKey][idx][f] = t.value;
        persist();
    });
    document.getElementById('weeklyBody').addEventListener('click', e => {
        const btn = e.target.closest('[data-weekly-done]');
        if (!btn) return;
        const idx = btn.dataset.weeklyDone;
        state.weekly[weeklyKey][idx].done = !state.weekly[weeklyKey][idx].done;
        btn.classList.toggle('on');
        persist();
    });
    renderWeekly();

    /* ---------- 5 WHYS ---------- */
    state.why = state.why || {};
    document.querySelectorAll('[data-why]').forEach(el => {
        el.value = state.why[el.dataset.why] || '';
        el.addEventListener('input', () => {
            state.why[el.dataset.why] = el.value;
            persist();
        });
    });

    /* ---------- ACTION PRIORITY MATRIX ---------- */
    state.matrix = state.matrix || { items: [] };
    function renderMatrix() {
        ['quickWins', 'majorProjects', 'fillIns', 'thankless'].forEach(c => {
            const cell = document.querySelector(`[data-cell="${c}"]`);
            cell.querySelectorAll('.matrix-item').forEach(n => n.remove());
        });
        (state.matrix.items || []).forEach(item => {
            const cell = document.querySelector(
                `[data-cell="${item.cell || 'quickWins'}"]`,
            );
            if (!cell) return;
            const el = document.createElement('div');
            el.className = 'matrix-item';
            el.draggable = true;
            el.dataset.itemId = item.id;
            el.innerHTML = `<span>${item.text.replace(/</g, '&lt;')}</span><button data-matrix-del="${item.id}" aria-label="Remove">×</button>`;
            cell.appendChild(el);
        });
        document.getElementById('matrixCount').textContent = (
            state.matrix.items || []
        ).length;
    }
    document
        .getElementById('matrixAdd')
        .addEventListener('click', addMatrixItem);
    document.getElementById('matrixInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') addMatrixItem();
    });
    function addMatrixItem() {
        const inp = document.getElementById('matrixInput');
        const t = inp.value.trim();
        if (!t) return;
        state.matrix.items.push({
            id: 'm' + Date.now() + Math.floor(Math.random() * 999),
            text: t,
            cell: 'quickWins',
        });
        inp.value = '';
        persist();
        renderMatrix();
    }
    let selectedMatrix = null;
    document.getElementById('matrixGrid').addEventListener('click', e => {
        const del = e.target.closest('[data-matrix-del]');
        if (del) {
            const id = del.dataset.matrixDel;
            state.matrix.items = state.matrix.items.filter(i => i.id !== id);
            persist();
            renderMatrix();
            return;
        }
        const item = e.target.closest('.matrix-item');
        if (item) {
            if (selectedMatrix === item.dataset.itemId) {
                selectedMatrix = null;
                item.style.outline = '';
                return;
            }
            document
                .querySelectorAll('.matrix-item')
                .forEach(n => (n.style.outline = ''));
            selectedMatrix = item.dataset.itemId;
            item.style.outline = '2px solid var(--sage-deep)';
            item.style.outlineOffset = '2px';
            return;
        }
        const cell = e.target.closest('[data-cell]');
        if (cell && selectedMatrix) {
            const it = state.matrix.items.find(i => i.id === selectedMatrix);
            if (it) {
                it.cell = cell.dataset.cell;
                selectedMatrix = null;
                persist();
                renderMatrix();
            }
        }
    });
    let dragId = null;
    document.getElementById('matrixGrid').addEventListener('dragstart', e => {
        const it = e.target.closest('.matrix-item');
        if (!it) return;
        dragId = it.dataset.itemId;
        it.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    document.getElementById('matrixGrid').addEventListener('dragend', () => {
        document
            .querySelectorAll('.matrix-item')
            .forEach(n => n.classList.remove('dragging'));
        document
            .querySelectorAll('.matrix-cell')
            .forEach(c => c.classList.remove('drag-over'));
    });
    document.getElementById('matrixGrid').addEventListener('dragover', e => {
        const cell = e.target.closest('[data-cell]');
        if (!cell) return;
        e.preventDefault();
        cell.classList.add('drag-over');
    });
    document.getElementById('matrixGrid').addEventListener('dragleave', e => {
        const cell = e.target.closest('[data-cell]');
        if (cell) cell.classList.remove('drag-over');
    });
    document.getElementById('matrixGrid').addEventListener('drop', e => {
        const cell = e.target.closest('[data-cell]');
        if (!cell || !dragId) return;
        e.preventDefault();
        const it = state.matrix.items.find(i => i.id === dragId);
        if (it) {
            it.cell = cell.dataset.cell;
            persist();
            renderMatrix();
        }
        dragId = null;
    });
    renderMatrix();

    /* ---------- DASHBOARD ---------- */
    const sectionWeights = {
        essentials: () => countChecks('essentials').pct,
        know: () => {
            const ks = ['texture', 'density', 'porosity', 'scalp', 'damage'];
            const filled = ks.filter(k => get('know.' + k)).length;
            return Math.round((filled / ks.length) * 100);
        },
        daily: () => {
            const entries = Object.keys(state.journal || {}).filter(d => {
                const e = state.journal[d];
                return (
                    e &&
                    Object.values(e).some(
                        v => v && (typeof v !== 'string' || v.trim()),
                    )
                );
            }).length;
            return Math.min(100, entries * 10);
        },
        ritual: () => countChecks('ritual').pct,
        growth: () => countChecks('growth').pct,
        smart: () => {
            const ks = [
                'specific',
                'measurable',
                'achievable',
                'relevant',
                'timebound',
            ];
            const filled = ks.filter(
                k => (state.smart || {})[k] && state.smart[k].trim(),
            ).length;
            return Math.round((filled / ks.length) * 100);
        },
        matrix: () => Math.min(100, (state.matrix.items || []).length * 20),
        wheel: () => {
            const filled = wheelCats.filter(
                c => (state.wheel || {})[c.key],
            ).length;
            return Math.round((filled / wheelCats.length) * 100);
        },
        habits: () => {
            let any = false;
            Object.values(state.habits || {}).forEach(wk => {
                if (wk && wk.marks)
                    Object.values(wk.marks).forEach(v => {
                        if (v) any = true;
                    });
            });
            return any ? 100 : 0;
        },
        life: () => {
            const cats = [
                'family',
                'friends',
                'career',
                'body',
                'mental',
                'faith',
            ];
            const filled = cats.filter(
                c => (state.life || {})[c] && (state.life[c].goal || '').trim(),
            ).length;
            return Math.round((filled / cats.length) * 100);
        },
        weekly: () => {
            let filled = 0,
                total = 0;
            Object.values(state.weekly || {}).forEach(wk => {
                Object.values(wk).forEach(d => {
                    total++;
                    if ((d.goals || '').trim() || d.done) filled++;
                });
            });
            return total
                ? Math.min(100, Math.round((filled / total) * 100))
                : 0;
        },
        why: () => {
            const ks = ['goal', 'w1', 'w2', 'w3', 'w4', 'real'];
            const filled = ks.filter(
                k => (state.why || {})[k] && state.why[k].trim(),
            ).length;
            return Math.round((filled / ks.length) * 100);
        },
    };

    function updateDashboard() {
        const chips = {
            essentials: sectionWeights.essentials(),
            know: sectionWeights.know(),
            ritual: sectionWeights.ritual(),
            growth: sectionWeights.growth(),
            smart: sectionWeights.smart(),
            wheel: sectionWeights.wheel(),
            life: sectionWeights.life(),
            weekly: sectionWeights.weekly(),
            why: sectionWeights.why(),
        };
        Object.keys(chips).forEach(k => {
            const fill = document.querySelector(`[data-sec-chip="${k}"]`);
            if (fill) fill.style.width = chips[k] + '%';
            const txt = document.getElementById(k + 'ChipPct');
            if (txt) txt.textContent = chips[k] + '%';
        });
        const allSecs = [
            'essentials',
            'know',
            'daily',
            'ritual',
            'growth',
            'smart',
            'matrix',
            'wheel',
            'habits',
            'life',
            'weekly',
            'why',
        ];
        const sum = allSecs.reduce((a, k) => a + sectionWeights[k](), 0);
        const overall = Math.round(sum / allSecs.length);
        document.getElementById('dashFill').style.width = overall + '%';
        document.getElementById('dashPercent').textContent = overall + '%';
        document.getElementById('dashStreak').textContent = visits.streak;
        document.getElementById('dashDays').textContent = visits.totalDays;
    }

    function updateTocChecks() {
        document.querySelectorAll('[data-toc]').forEach(c => {
            const k = c.dataset.toc;
            const fn = sectionWeights[k];
            if (fn && fn() >= 80) c.classList.add('done');
            else c.classList.remove('done');
        });
    }

    updateDashboard();
    updateTocChecks();

    /* ---------- milestones ---------- */
    const MILE_KEY = 'hairinsider-workbook-mile';
    function checkMilestones() {
        let m;
        try {
            m = JSON.parse(localStorage.getItem(MILE_KEY)) || {};
        } catch (e) {
            m = {};
        }
        const overall = parseInt(
            document.getElementById('dashPercent').textContent,
        );
        [25, 50, 75, 100].forEach(t => {
            if (overall >= t && !m['p' + t]) {
                m['p' + t] = true;
                toast('You hit ' + t + '%, keep going.');
            }
        });
        if (visits.streak === 3 && !m.s3) {
            m.s3 = true;
            toast('Three day streak. Beautiful.');
        }
        if (visits.streak === 7 && !m.s7) {
            m.s7 = true;
            toast("A full week. You're building rhythm.");
        }
        localStorage.setItem(MILE_KEY, JSON.stringify(m));
    }
    setTimeout(checkMilestones, 1200);

    return () => {
        io.disconnect();
    };
}
