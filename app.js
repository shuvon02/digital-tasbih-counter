/**
 * ============================================================================
 * TASBIH PRO - ADVANCED DIGITAL COUNTER & DHIKR ENGINE
 * Physical Beads, Auto-Chain Mode, Sound Profiles, Streaks & Zen Mode
 * ============================================================================
 */

class TasbihApp {
  constructor() {
    // --- Application State ---
    this.count = 0;
    this.target = 33;
    this.round = 1;
    this.isTargetLocked = true;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;

    // Mode: 'single' | 'chain'
    this.mode = 'chain'; // Default to famous 33-33-34 chain
    this.chainStep = 1; // 1: SubhanAllah (33), 2: Alhamdulillah (33), 3: Allahu Akbar (34)
    this.currentPhraseKey = 'subhanallah';

    // Dhikr Library
    this.phrases = {
      subhanallah: {
        name: 'SubhanAllah',
        arabic: 'سُبْحَانَ ٱللَّٰهِ',
        trans: 'Subḥān Allāh',
        meaning: 'Glory be to Allah',
        defaultTarget: 33
      },
      alhamdulillah: {
        name: 'Alhamdulillah',
        arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
        trans: 'Al-ḥamdu lillāh',
        meaning: 'All praise is due to Allah',
        defaultTarget: 33
      },
      allahuakbar: {
        name: 'Allahu Akbar',
        arabic: 'ٱللَّٰهُ أَكْبَرُ',
        trans: 'Allāhu Akbar',
        meaning: 'Allah is the Greatest',
        defaultTarget: 34
      },
      astaghfirullah: {
        name: 'Astaghfirullah',
        arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
        trans: 'Astaghfirullāh',
        meaning: 'I seek forgiveness from Allah',
        defaultTarget: 100
      },
      lailahaillallah: {
        name: 'La ilaha illallah',
        arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
        trans: 'Lā ilāha illallāh',
        meaning: 'There is no god but Allah',
        defaultTarget: 100
      },
      durood: {
        name: 'Durood / Salawat',
        arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
        trans: 'Allāhumma ṣalli \'alā Muḥammad',
        meaning: 'Blessings upon Prophet Muhammad ﷺ',
        defaultTarget: 100
      },
      custom: {
        name: 'Custom Counter',
        arabic: 'ذِكْرُ ٱللَّٰهِ',
        trans: 'Dhikrullah',
        meaning: 'Remembrance of Allah',
        defaultTarget: 33
      }
    };

    // Preferences & Settings
    this.soundProfile = 'wood'; // 'wood' | 'water' | 'mechanical' | 'synth' | 'mute'
    this.hapticEnabled = true;
    this.theme = 'emerald';
    this.themes = ['emerald', 'midnight', 'gold', 'pearl'];
    this.isZenMode = false;

    // Daily History & Stats
    this.history = {
      todayDate: this.getTodayDateString(),
      todayTotal: 0,
      lifetimeTotal: 0,
      streak: 1,
      lastActiveDate: this.getTodayDateString(),
      todayBreakdown: {}
    };

    // Audio Context (lazily initialized)
    this.audioCtx = null;

    // DOM Elements Cache
    this.dom = {
      app: document.getElementById('app'),
      appHeader: document.getElementById('appHeader'),
      statusBadge: document.getElementById('statusBadge'),
      dhikrPickerBtn: document.getElementById('dhikrPickerBtn'),
      soundProfileBtn: document.getElementById('soundProfileBtn'),
      soundHeaderIcon: document.getElementById('soundHeaderIcon'),
      historyDrawerBtn: document.getElementById('historyDrawerBtn'),
      zenModeBtn: document.getElementById('zenModeBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      ambientPulse: document.getElementById('ambientPulse'),

      // Auto-Chain Banner
      chainBanner: document.getElementById('chainBanner'),
      chainStepText: document.getElementById('chainStepText'),
      dot1: document.getElementById('dot1'),
      dot2: document.getElementById('dot2'),
      dot3: document.getElementById('dot3'),
      chipChainMode: document.getElementById('chipChainMode'),

      // Arabic Calligraphy Display
      phraseDisplay: document.getElementById('phraseDisplay'),
      arabicText: document.getElementById('arabicText'),
      transliterationText: document.getElementById('transliterationText'),
      meaningText: document.getElementById('meaningText'),

      // Tap Zone & Beads
      tapZone: document.getElementById('tapZone'),
      particleContainer: document.getElementById('particleContainer'),
      displayContainer: document.getElementById('displayContainer'),
      progressCircle: document.getElementById('progressCircle'),
      beadsGroup: document.getElementById('beadsGroup'),
      counterValue: document.getElementById('counterValue'),
      counterLabel: document.getElementById('counterLabel'),
      targetValueDisplay: document.getElementById('targetValueDisplay'),
      progressBadge: document.getElementById('progressBadge'),
      percentText: document.getElementById('percentText'),
      tapHint: document.getElementById('tapHint'),
      tapHintText: document.getElementById('tapHintText'),
      exitZenBtn: document.getElementById('exitZenBtn'),

      // Control Card & Form
      controlCardWrapper: document.getElementById('controlCardWrapper'),
      controlCard: document.getElementById('controlCard'),
      targetForm: document.getElementById('targetForm'),
      targetInput: document.getElementById('targetInput'),
      clearInputBtn: document.getElementById('clearInputBtn'),
      setTargetBtn: document.getElementById('setTargetBtn'),
      resetBtn: document.getElementById('resetBtn'),
      presetChips: document.querySelectorAll('.chip-btn:not(#chipChainMode)'),

      // Modals
      dhikrModal: document.getElementById('dhikrModal'),
      closeDhikrModalBtn: document.getElementById('closeDhikrModalBtn'),
      dhikrCards: document.querySelectorAll('.dhikr-card'),

      soundProfileModal: document.getElementById('soundProfileModal'),
      closeSoundModalBtn: document.getElementById('closeSoundModalBtn'),
      soundOptionBtns: document.querySelectorAll('.sound-option-btn'),
      hapticCheckbox: document.getElementById('hapticCheckbox'),

      historyDrawer: document.getElementById('historyDrawer'),
      closeHistoryDrawerBtn: document.getElementById('closeHistoryDrawerBtn'),
      metricStreak: document.getElementById('metricStreak'),
      metricToday: document.getElementById('metricToday'),
      metricLifetime: document.getElementById('metricLifetime'),
      historyBreakdownList: document.getElementById('historyBreakdownList'),
      clearHistoryBtn: document.getElementById('clearHistoryBtn'),

      targetRequiredModal: document.getElementById('targetRequiredModal'),
      focusTargetBtn: document.getElementById('focusTargetBtn'),
      modalQuickChips: document.querySelectorAll('.quick-pick-btn'),

      resetConfirmModal: document.getElementById('resetConfirmModal'),
      resetModalDesc: document.getElementById('resetModalDesc'),
      resetCurrentCountNum: document.getElementById('resetCurrentCountNum'),
      cancelResetBtn: document.getElementById('cancelResetBtn'),
      confirmResetBtn: document.getElementById('confirmResetBtn'),

      celebrationModal: document.getElementById('celebrationModal'),
      celebrateTargetNum: document.getElementById('celebrateTargetNum'),
      statCompletedNum: document.getElementById('statCompletedNum'),
      statLapNum: document.getElementById('statLapNum'),
      nextRoundBtn: document.getElementById('nextRoundBtn'),
      continueCountBtn: document.getElementById('continueCountBtn'),
      newTargetFromGoalBtn: document.getElementById('newTargetFromGoalBtn'),

      // Toast & Confetti
      toastContainer: document.getElementById('toastContainer'),
      confettiCanvas: document.getElementById('confettiCanvas'),
    };

    // Circular Progress Constants (2 * PI * r, where r = 136)
    this.ringCircumference = 2 * Math.PI * 136; // ≈ 854.513

    // Confetti Engine Instance
    this.confetti = new ConfettiEngine(this.dom.confettiCanvas);

    // Initialize App
    this.init();
  }

  /**
   * Initialize state, event listeners, beads, and UI
   */
  init() {
    this.purgeStaleCaches();
    this.loadState();
    this.checkStreakDay();
    this.setupProgressRing();
    this.renderPhysicalBeads();
    this.bindEvents();
    this.applyTheme(this.theme);
    this.updateSoundUI();
    this.updateUI();
    this.registerServiceWorker();
  }

  purgeStaleCaches() {
    // If running in Capacitor Android Native app, unregister any service worker
    // and wipe cache storage so fresh native assets are always used!
    const isCapacitor = Boolean(
      window.Capacitor ||
      (window.location.hostname === 'localhost' && window.location.protocol === 'https:') ||
      navigator.userAgent.includes('wv')
    );

    if (isCapacitor && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (isCapacitor || key !== 'tasbih-pro-v2') {
            caches.delete(key);
          }
        });
      });
    }
  }

  /**
   * Helper: YYYY-MM-DD date string
   */
  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Check and update streak logic
   */
  checkStreakDay() {
    const today = this.getTodayDateString();
    if (this.history.todayDate !== today) {
      // Calculate day difference
      const last = new Date(this.history.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day! Keep streak
      } else if (diffDays > 1) {
        // Missed a day -> reset streak to 1
        this.history.streak = 1;
      }

      this.history.todayDate = today;
      this.history.todayTotal = 0;
      this.history.todayBreakdown = {};
      this.saveState();
    }
  }

  /**
   * Prepare SVG ring stroke dash properties
   */
  setupProgressRing() {
    if (this.dom.progressCircle) {
      this.dom.progressCircle.style.strokeDasharray = `${this.ringCircumference}`;
      this.dom.progressCircle.style.strokeDashoffset = `${this.ringCircumference}`;
    }
  }

  /**
   * Render 33 physical bead notches along the SVG circle radius r=136 centered at (160, 160)
   */
  renderPhysicalBeads() {
    if (!this.dom.beadsGroup) return;
    this.dom.beadsGroup.innerHTML = '';

    const totalBeads = 33;
    const r = 136;
    const cx = 160;
    const cy = 160;

    for (let i = 0; i < totalBeads; i++) {
      // Distribute evenly starting from top (-PI/2)
      const angle = (i / totalBeads) * 2 * Math.PI - Math.PI / 2;
      const bx = cx + r * Math.cos(angle);
      const by = cy + r * Math.sin(angle);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', bx.toFixed(2));
      circle.setAttribute('cy', by.toFixed(2));
      circle.setAttribute('r', '4.2');
      circle.setAttribute('class', 'bead-dot');
      circle.setAttribute('data-bead-index', i);

      this.dom.beadsGroup.appendChild(circle);
    }
  }

  /**
   * Update active bead highlights based on current count
   */
  updateBeadsHighlight() {
    const beads = this.dom.beadsGroup.querySelectorAll('.bead-dot');
    if (!beads.length) return;

    const activeIndex = this.count % 33;
    const hasCompletedAtLeastOneRound = this.count >= 33;

    beads.forEach((bead, idx) => {
      bead.classList.remove('counted', 'current');
      if (idx < activeIndex || (hasCompletedAtLeastOneRound && activeIndex === 0 && this.count > 0)) {
        bead.classList.add('counted');
      }
      if (idx === activeIndex && this.count > 0 && !this.isGoalReached) {
        bead.classList.add('current');
      }
    });
  }

  /**
   * Bind all user interaction events with strict propagation control
   */
  bindEvents() {
    // 1. Full Screen Tap Zone (PointerDown for instant sub-millisecond mobile response)
    this.dom.tapZone.addEventListener('pointerdown', (e) => this.handleTapZone(e));

    // Keyboard & Hardware Volume button listener
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Prevent taps on controls, header, and modals from triggering the counter
    const stopPropagationElements = [
      this.dom.appHeader,
      this.dom.chainBanner,
      this.dom.controlCardWrapper,
      this.dom.dhikrModal,
      this.dom.soundProfileModal,
      this.dom.historyDrawer,
      this.dom.targetRequiredModal,
      this.dom.resetConfirmModal,
      this.dom.celebrationModal,
      this.dom.toastContainer,
      this.dom.exitZenBtn,
    ];

    stopPropagationElements.forEach((el) => {
      if (el) {
        el.addEventListener('pointerdown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => e.stopPropagation());
      }
    });

    // 2. Dhikr Picker Modal Events
    this.dom.dhikrPickerBtn.addEventListener('click', () => {
      this.openModal(this.dom.dhikrModal);
    });

    this.dom.closeDhikrModalBtn.addEventListener('click', () => {
      this.closeModal(this.dom.dhikrModal);
    });

    this.dom.dhikrCards.forEach((card) => {
      card.addEventListener('click', () => {
        const mode = card.getAttribute('data-mode');
        if (mode === 'chain') {
          this.activateChainMode();
        } else {
          const phraseKey = card.getAttribute('data-phrase');
          const target = parseInt(card.getAttribute('data-target'), 10);
          this.activateSinglePhrase(phraseKey, target);
        }
        this.closeModal(this.dom.dhikrModal);
      });
    });

    // 3. Sound Profiles Modal Events
    this.dom.soundProfileBtn.addEventListener('click', () => {
      this.openModal(this.dom.soundProfileModal);
    });

    this.dom.closeSoundModalBtn.addEventListener('click', () => {
      this.closeModal(this.dom.soundProfileModal);
    });

    this.dom.soundOptionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const profile = btn.getAttribute('data-sound');
        this.setSoundProfile(profile);
      });
    });

    this.dom.hapticCheckbox.addEventListener('change', (e) => {
      this.hapticEnabled = e.target.checked;
      if (this.hapticEnabled) this.triggerHaptic(25);
      this.saveState();
    });

    // 4. Daily History & Streaks Drawer
    this.dom.historyDrawerBtn.addEventListener('click', () => {
      this.renderHistoryDrawer();
      this.openModal(this.dom.historyDrawer);
    });

    this.dom.closeHistoryDrawerBtn.addEventListener('click', () => {
      this.closeModal(this.dom.historyDrawer);
    });

    this.dom.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all your saved history and streaks?')) {
        this.clearHistoryData();
      }
    });

    // 5. Zen Focus Mode
    this.dom.zenModeBtn.addEventListener('click', () => {
      this.toggleZenMode(true);
    });

    this.dom.exitZenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleZenMode(false);
    });

    // 6. Target Form Actions
    this.dom.setTargetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleSetTarget();
    });

    this.dom.targetInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSetTarget();
      }
    });

    this.dom.targetInput.addEventListener('input', () => {
      const val = this.dom.targetInput.value;
      if (val) {
        this.dom.clearInputBtn.classList.remove('hidden');
      } else {
        this.dom.clearInputBtn.classList.add('hidden');
      }
      this.highlightPresetChip(parseInt(val, 10));
    });

    this.dom.clearInputBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dom.targetInput.value = '';
      this.dom.clearInputBtn.classList.add('hidden');
      this.dom.targetInput.focus();
      this.highlightPresetChip(null);
    });

    // Quick chips
    this.dom.presetChips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetVal = parseInt(chip.getAttribute('data-target'), 10);
        this.mode = 'single';
        this.target = targetVal;
        this.dom.targetInput.value = targetVal;
        this.dom.clearInputBtn.classList.remove('hidden');
        this.highlightPresetChip(targetVal);
        this.handleSetTarget();
      });
    });

    this.dom.chipChainMode.addEventListener('click', (e) => {
      e.stopPropagation();
      this.activateChainMode();
    });

    // 7. Reset Button and Confirmation Modal
    this.dom.resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openResetConfirmation();
    });

    this.dom.cancelResetBtn.addEventListener('click', () => {
      this.closeModal(this.dom.resetConfirmModal);
    });

    this.dom.confirmResetBtn.addEventListener('click', () => {
      this.performReset();
      this.closeModal(this.dom.resetConfirmModal);
    });

    // 8. Target Required Modal Interactions
    this.dom.focusTargetBtn.addEventListener('click', () => {
      this.closeModal(this.dom.targetRequiredModal);
      this.focusTargetInput();
    });

    this.dom.modalQuickChips.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.dom.targetInput.value = val;
        this.closeModal(this.dom.targetRequiredModal);
        this.handleSetTarget();
      });
    });

    // 9. Goal Celebration Modal Actions
    this.dom.nextRoundBtn.addEventListener('click', () => {
      this.closeModal(this.dom.celebrationModal);
      this.startNextRound();
    });

    this.dom.continueCountBtn.addEventListener('click', () => {
      this.allowOverflowCounting = true;
      this.closeModal(this.dom.celebrationModal);
      this.showToast('Continuing count beyond target goal', 'info');
      this.updateUI();
    });

    this.dom.newTargetFromGoalBtn.addEventListener('click', () => {
      this.closeModal(this.dom.celebrationModal);
      this.openModal(this.dom.dhikrModal);
    });

    // 10. Theme Cycle
    this.dom.themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cycleTheme();
    });

    // Backdrop clicks to close modals
    [
      this.dom.dhikrModal,
      this.dom.soundProfileModal,
      this.dom.historyDrawer,
      this.dom.targetRequiredModal,
      this.dom.resetConfirmModal,
      this.dom.celebrationModal
    ].forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });
  }

  /**
   * Handle Main Screen Tap Zone Interaction
   * Strict Validation Guard + Auto-Chain Automation
   */
  handleTapZone(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Check if target is valid and locked
    if (!this.isTargetLocked || !this.target || this.target <= 0) {
      this.triggerTargetRequiredAction();
      return;
    }

    // Check if goal was reached and overflow is not allowed yet
    if (this.count >= this.target && !this.allowOverflowCounting) {
      this.openModal(this.dom.celebrationModal);
      this.playGoalSound();
      return;
    }

    // Valid Tap -> Increment counter
    this.count += 1;

    // Record in history stats
    this.recordTapInHistory();

    // Visual feedback
    this.createRipple(e.clientX, e.clientY);
    this.createFloatingParticle(e.clientX, e.clientY);
    this.triggerAmbientPulse();
    this.triggerNumberPop();
    this.triggerArabicShimmer();

    // Haptic and Audio
    this.triggerHaptic(20);
    this.playSelectedSound();

    // Auto-Chain Logic check
    if (this.mode === 'chain') {
      this.handleChainProgress();
    } else {
      // Normal single goal check
      if (this.count === this.target) {
        this.onGoalReached();
      }
    }

    this.updateUI();
    this.saveState();
  }

  /**
   * Auto-Chain (Tasbih of Fatimah) Progress Logic:
   * 33 SubhanAllah ➔ 33 Alhamdulillah ➔ 34 Allahu Akbar
   */
  handleChainProgress() {
    if (this.chainStep === 1 && this.count >= 33) {
      // Completed Step 1 -> Move to Alhamdulillah
      this.chainStep = 2;
      this.count = 0;
      this.target = 33;
      this.currentPhraseKey = 'alhamdulillah';
      this.triggerHaptic([40, 50, 80]);
      this.playStepTransitionSound();
      this.showToast('Step 1/3 Complete! Now reciting: Alhamdulillah (33)', 'success');
    } else if (this.chainStep === 2 && this.count >= 33) {
      // Completed Step 2 -> Move to Allahu Akbar
      this.chainStep = 3;
      this.count = 0;
      this.target = 34;
      this.currentPhraseKey = 'allahuakbar';
      this.triggerHaptic([40, 50, 80]);
      this.playStepTransitionSound();
      this.showToast('Step 2/3 Complete! Now reciting: Allahu Akbar (34)', 'success');
    } else if (this.chainStep === 3 && this.count >= 34) {
      // Completed Full Chain (100 counts)!
      this.onGoalReached(true);
    }
  }

  /**
   * Switch to Tasbih of Fatimah Auto-Chain
   */
  activateChainMode() {
    this.mode = 'chain';
    this.chainStep = 1;
    this.count = 0;
    this.target = 33;
    this.currentPhraseKey = 'subhanallah';
    this.isTargetLocked = true;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;

    this.dom.chipChainMode.classList.add('selected');
    this.highlightPresetChip(null);
    this.triggerHaptic(30);
    this.playStepTransitionSound();
    this.showToast('Auto-Chain Active: 33 SubhanAllah ➔ 33 Alhamdulillah ➔ 34 Allahu Akbar', 'success');
    this.updateUI();
    this.saveState();
  }

  /**
   * Switch to a single Dhikr phrase
   */
  activateSinglePhrase(phraseKey, targetVal) {
    this.mode = 'single';
    this.currentPhraseKey = phraseKey;
    this.count = 0;
    this.target = targetVal || 33;
    this.isTargetLocked = true;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;

    this.dom.chipChainMode.classList.remove('selected');
    this.highlightPresetChip(this.target);
    this.triggerHaptic(30);
    this.playStepTransitionSound();

    const info = this.phrases[phraseKey] || this.phrases.subhanallah;
    this.showToast(`Selected: ${info.name} (Goal: ${this.target})`, 'success');
    this.updateUI();
    this.saveState();
  }

  /**
   * Record tap in Daily History & Streaks
   */
  recordTapInHistory() {
    const today = this.getTodayDateString();
    if (this.history.todayDate !== today) {
      this.checkStreakDay();
    }

    this.history.todayTotal += 1;
    this.history.lifetimeTotal += 1;
    this.history.lastActiveDate = today;

    const phraseInfo = this.phrases[this.currentPhraseKey];
    const phraseName = phraseInfo ? phraseInfo.name : 'Counter';
    this.history.todayBreakdown[phraseName] = (this.history.todayBreakdown[phraseName] || 0) + 1;
  }

  /**
   * Render History & Streaks in Drawer
   */
  renderHistoryDrawer() {
    this.checkStreakDay();
    this.dom.metricStreak.textContent = `${this.history.streak} ${this.history.streak === 1 ? 'Day' : 'Days'}`;
    this.dom.metricToday.textContent = this.history.todayTotal.toLocaleString();
    this.dom.metricLifetime.textContent = this.history.lifetimeTotal.toLocaleString();

    const list = this.dom.historyBreakdownList;
    list.innerHTML = '';

    const entries = Object.entries(this.history.todayBreakdown);
    if (!entries.length || this.history.todayTotal === 0) {
      list.innerHTML = '<div class="empty-history-text">No recitations recorded yet today. Begin counting!</div>';
      return;
    }

    entries.forEach(([name, count]) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <span class="history-item-name">${name}</span>
        <span class="history-item-count">${count.toLocaleString()}</span>
      `;
      list.appendChild(item);
    });
  }

  clearHistoryData() {
    this.history = {
      todayDate: this.getTodayDateString(),
      todayTotal: 0,
      lifetimeTotal: 0,
      streak: 1,
      lastActiveDate: this.getTodayDateString(),
      todayBreakdown: {}
    };
    this.renderHistoryDrawer();
    this.saveState();
    this.showToast('History data reset.', 'info');
  }

  /**
   * Zen / Focus Mode Toggle
   */
  toggleZenMode(enable) {
    this.isZenMode = enable;
    if (enable) {
      this.dom.app.classList.add('zen-active');
      this.dom.exitZenBtn.classList.remove('hidden');
      this.showToast('Entered Focus Mode. Tap exit button anytime to leave.', 'info');
    } else {
      this.dom.app.classList.remove('zen-active');
      this.dom.exitZenBtn.classList.add('hidden');
    }
  }

  /**
   * Sound Profile Configuration
   */
  setSoundProfile(profile) {
    this.soundProfile = profile;
    this.dom.soundOptionBtns.forEach((btn) => {
      const isSelected = btn.getAttribute('data-sound') === profile;
      btn.classList.toggle('selected', isSelected);
      const check = btn.querySelector('.sound-check');
      if (check) check.textContent = isSelected ? '✓' : '';
    });
    this.updateSoundUI();
    this.playSelectedSound();
    this.saveState();
  }

  updateSoundUI() {
    if (this.soundProfile === 'mute') {
      this.dom.soundProfileBtn.classList.remove('active');
    } else {
      this.dom.soundProfileBtn.classList.add('active');
    }
  }

  /**
   * Handles keyboard & hardware volume keys
   */
  handleKeyboard(e) {
    if (document.activeElement === this.dom.targetInput) {
      if (e.key === 'Escape') this.dom.targetInput.blur();
      return;
    }

    // Hardware volume or space or arrow keys
    if (
      e.code === 'Space' ||
      e.key === 'VolumeUp' ||
      e.key === 'VolumeDown' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown'
    ) {
      e.preventDefault();
      const rect = this.dom.displayContainer.getBoundingClientRect();
      const clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.height / 2;
      this.handleTapZone({ clientX, clientY, pointerType: 'touch' });
    } else if (e.key === 'r' || e.key === 'R') {
      this.openResetConfirmation();
    } else if (e.key === 'z' || e.key === 'Z') {
      this.toggleZenMode(!this.isZenMode);
    } else if (e.key === 'Escape') {
      if (this.isZenMode) this.toggleZenMode(false);
      this.closeModal(this.dom.dhikrModal);
      this.closeModal(this.dom.soundProfileModal);
      this.closeModal(this.dom.historyDrawer);
      this.closeModal(this.dom.targetRequiredModal);
      this.closeModal(this.dom.resetConfirmModal);
      this.closeModal(this.dom.celebrationModal);
    }
  }

  /**
   * Action when tapping without a target set
   */
  triggerTargetRequiredAction() {
    this.triggerHaptic([40, 60, 40]);
    this.playWarningSound();
    this.openModal(this.dom.targetRequiredModal);
    this.showToast('Please set a target goal first to begin counting!', 'warning');
  }

  /**
   * Set and Lock Target
   */
  handleSetTarget() {
    const rawVal = this.dom.targetInput.value.trim();
    const parsed = parseInt(rawVal, 10);

    if (isNaN(parsed) || parsed <= 0) {
      this.showToast('Please enter a valid positive number (e.g. 33, 100)', 'warning');
      this.focusTargetInput();
      return;
    }

    this.target = parsed;
    this.mode = 'single';
    this.isTargetLocked = true;
    this.allowOverflowCounting = false;
    this.isGoalReached = this.count >= this.target;

    this.dom.chipChainMode.classList.remove('selected');
    this.triggerHaptic(30);
    this.playStepTransitionSound();
    this.showToast(`Target goal set to ${this.target}`, 'success');

    this.highlightPresetChip(this.target);
    this.dom.targetInput.blur();
    this.updateUI();
    this.saveState();
  }

  /**
   * Goal Reached Celebration
   */
  onGoalReached(isFullChain = false) {
    this.isGoalReached = true;
    this.confetti.burst(180);
    this.triggerHaptic([60, 50, 100, 50, 200, 100, 300]);
    this.playGoalSound();

    if (isFullChain) {
      this.dom.celebrateTargetNum.textContent = '100 (Full Chain)';
      this.dom.statCompletedNum.textContent = '100';
    } else {
      this.dom.celebrateTargetNum.textContent = this.target;
      this.dom.statCompletedNum.textContent = this.target;
    }

    this.dom.statLapNum.textContent = `#${this.round}`;

    setTimeout(() => {
      this.openModal(this.dom.celebrationModal);
    }, 280);
  }

  /**
   * Start Next Round
   */
  startNextRound() {
    this.round += 1;
    this.count = 0;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;

    if (this.mode === 'chain') {
      this.chainStep = 1;
      this.target = 33;
      this.currentPhraseKey = 'subhanallah';
    }

    this.triggerHaptic(35);
    this.playStepTransitionSound();
    this.showToast(`Round #${this.round} started!`, 'success');
    this.updateUI();
    this.saveState();
  }

  openResetConfirmation() {
    this.dom.resetCurrentCountNum.textContent = this.count;
    this.openModal(this.dom.resetConfirmModal);
  }

  performReset() {
    this.count = 0;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;
    this.round = 1;

    if (this.mode === 'chain') {
      this.chainStep = 1;
      this.target = 33;
      this.currentPhraseKey = 'subhanallah';
    }

    this.triggerHaptic([50, 50]);
    this.showToast('Counter has been reset to 0.', 'info');
    this.updateUI();
    this.saveState();
  }

  /**
   * Update all UI elements based on state
   */
  updateUI() {
    // 1. Counter Display
    this.dom.counterValue.textContent = this.count.toLocaleString();

    // 2. Phrase Display (Arabic & English)
    const phrase = this.phrases[this.currentPhraseKey] || this.phrases.subhanallah;
    this.dom.arabicText.textContent = phrase.arabic;
    this.dom.transliterationText.textContent = phrase.trans;
    this.dom.meaningText.textContent = `"${phrase.meaning}"`;

    // 3. Auto-Chain Banner
    if (this.mode === 'chain') {
      this.dom.chainBanner.classList.remove('hidden');
      this.dom.statusBadge.textContent = 'Auto-Chain Active';
      this.dom.statusBadge.className = 'brand-subtitle';

      if (this.chainStep === 1) {
        this.dom.chainStepText.textContent = 'Step 1/3: SubhanAllah (33)';
        this.dom.dot1.className = 'chain-dot active';
        this.dom.dot2.className = 'chain-dot';
        this.dom.dot3.className = 'chain-dot';
      } else if (this.chainStep === 2) {
        this.dom.chainStepText.textContent = 'Step 2/3: Alhamdulillah (33)';
        this.dom.dot1.className = 'chain-dot completed';
        this.dom.dot2.className = 'chain-dot active';
        this.dom.dot3.className = 'chain-dot';
      } else {
        this.dom.chainStepText.textContent = 'Step 3/3: Allahu Akbar (34)';
        this.dom.dot1.className = 'chain-dot completed';
        this.dom.dot2.className = 'chain-dot completed';
        this.dom.dot3.className = 'chain-dot active';
      }
      this.dom.tapHintText.textContent = `Reciting: ${phrase.name} (${this.count}/${this.target})`;
    } else {
      this.dom.chainBanner.classList.add('hidden');
      this.dom.statusBadge.textContent = `Goal: ${this.target}`;
      this.dom.tapHintText.textContent = `Tap anywhere to count (Goal: ${this.target})`;
    }

    // 4. Target & Percentage Display
    this.dom.targetValueDisplay.textContent = this.target.toLocaleString();
    this.dom.targetInput.value = this.target;

    const ratio = Math.min(this.count / this.target, 1);
    const offset = this.ringCircumference * (1 - ratio);
    this.dom.progressCircle.style.strokeDashoffset = `${offset}`;

    const pct = Math.round((this.count / this.target) * 100);
    this.dom.percentText.textContent = `${pct}%`;

    if (this.count >= this.target) {
      this.dom.progressBadge.classList.add('goal-achieved');
    } else {
      this.dom.progressBadge.classList.remove('goal-achieved');
    }

    // 5. Update Physical Bead Notches
    this.updateBeadsHighlight();
  }

  triggerNumberPop() {
    this.dom.counterValue.classList.remove('pulse-number');
    void this.dom.counterValue.offsetWidth;
    this.dom.counterValue.classList.add('pulse-number');
  }

  triggerArabicShimmer() {
    this.dom.arabicText.classList.remove('pop-arabic');
    void this.dom.arabicText.offsetWidth;
    this.dom.arabicText.classList.add('pop-arabic');
  }

  triggerAmbientPulse() {
    if (!this.dom.ambientPulse) return;
    this.dom.ambientPulse.classList.remove('pulse-active');
    void this.dom.ambientPulse.offsetWidth;
    this.dom.ambientPulse.classList.add('pulse-active');
  }

  createRipple(x, y) {
    if (!x || !y) {
      const rect = this.dom.tapZone.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const ripple = document.createElement('div');
    ripple.className = 'tap-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '120px';
    ripple.style.height = '120px';

    this.dom.tapZone.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  createFloatingParticle(x, y) {
    if (!x || !y) return;

    const particle = document.createElement('span');
    particle.className = 'floating-plus-one';
    particle.textContent = '+1';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    this.dom.particleContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }

  focusTargetInput() {
    this.dom.targetInput.focus();
    this.dom.controlCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  highlightPresetChip(val) {
    this.dom.presetChips.forEach((chip) => {
      const chipVal = parseInt(chip.getAttribute('data-target'), 10);
      chip.classList.toggle('selected', chipVal === val);
    });
  }

  openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('hidden');
    document.body.style.overflow = '';
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-msg">${message}</span>`;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  triggerHaptic(pattern) {
    if (!this.hapticEnabled) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {}
    }
  }

  /**
   * ==========================================================================
   * MULTI-SOUND SYNTHESIZER (100% Offline via Web Audio API)
   * Profiles: 'wood', 'water', 'mechanical', 'synth', 'mute'
   * ==========================================================================
   */
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSelectedSound() {
    if (this.soundProfile === 'mute') return;
    this.initAudio();
    if (!this.audioCtx) return;

    switch (this.soundProfile) {
      case 'wood':
        this.synthWoodenBead();
        break;
      case 'water':
        this.synthWaterDroplet();
        break;
      case 'mechanical':
        this.synthMechanicalClick();
        break;
      case 'synth':
      default:
        this.synthGentleTone();
        break;
    }
  }

  // 1. Realistic Wooden Bead Click
  synthWoodenBead() {
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.038);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // 2. Zen Water Droplet / Pebble Sound
  synthWaterDroplet() {
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(940, now + 0.045);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.065);
  }

  // 3. Tactile Mechanical Tally Click
  synthMechanicalClick() {
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.028);
  }

  // 4. Gentle Sine Tone
  synthGentleTone() {
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  // Step Transition chime (for Auto-Chain stage completion)
  playStepTransitionSound() {
    if (this.soundProfile === 'mute') return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const now = this.audioCtx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.19);
      });
    } catch (e) {}
  }

  playWarningSound() {
    if (this.soundProfile === 'mute') return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  playGoalSound() {
    if (this.soundProfile === 'mute') return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const now = this.audioCtx.currentTime + idx * 0.1;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch (e) {}
  }

  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.theme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.applyTheme(this.themes[nextIndex]);
    this.showToast(`Theme: ${this.theme.toUpperCase()}`, 'info');
    this.saveState();
  }

  applyTheme(themeName) {
    this.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const colors = {
        emerald: '#071512',
        midnight: '#090a0f',
        gold: '#120e09',
        pearl: '#f8fafc',
      };
      themeColorMeta.setAttribute('content', colors[themeName] || '#071512');
    }
  }

  /**
   * Persistence via LocalStorage
   */
  saveState() {
    try {
      const state = {
        count: this.count,
        target: this.target,
        round: this.round,
        mode: this.mode,
        chainStep: this.chainStep,
        currentPhraseKey: this.currentPhraseKey,
        isTargetLocked: this.isTargetLocked,
        soundProfile: this.soundProfile,
        hapticEnabled: this.hapticEnabled,
        theme: this.theme,
        history: this.history,
      };
      localStorage.setItem('tasbih_pro_advanced_state', JSON.stringify(state));
    } catch (e) {}
  }

  loadState() {
    try {
      const saved = localStorage.getItem('tasbih_pro_advanced_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.count = typeof state.count === 'number' ? state.count : 0;
        this.target = typeof state.target === 'number' && state.target > 0 ? state.target : 33;
        this.round = typeof state.round === 'number' ? state.round : 1;
        this.mode = state.mode || 'chain';
        this.chainStep = state.chainStep || 1;
        this.currentPhraseKey = state.currentPhraseKey || 'subhanallah';
        this.isTargetLocked = state.isTargetLocked !== undefined ? state.isTargetLocked : true;
        this.soundProfile = state.soundProfile || 'wood';
        this.hapticEnabled = state.hapticEnabled !== undefined ? state.hapticEnabled : true;
        if (state.theme && this.themes.includes(state.theme)) {
          this.theme = state.theme;
        }
        if (state.history) {
          this.history = Object.assign(this.history, state.history);
        }
      }
    } catch (e) {}
  }

  registerServiceWorker() {
    const isCapacitor = Boolean(
      window.Capacitor ||
      (window.location.hostname === 'localhost' && window.location.protocol === 'https:') ||
      navigator.userAgent.includes('wv')
    );
    if (isCapacitor) return;

    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          reg.update();
        })
        .catch(() => {});
    }
  }
}

/**
 * Lightweight Canvas Confetti Engine
 */
class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.colors = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#6366f1', '#38bdf8', '#ec4899', '#ffffff'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 140) {
    this.resize();
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 6;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: Math.random() * 8 + 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 60 + 80,
      });
    }

    if (!this.animationId) {
      this.render();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(1 - p.life / p.maxLife, 0);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();

      if (p.life >= p.maxLife || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.render());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationId = null;
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new TasbihApp();
});
