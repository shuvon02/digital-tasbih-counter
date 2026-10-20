/**
 * ============================================================================
 * TASBIH PRO - DIGITAL COUNTER ENGINE
 * Mobile-First, Accessible, PWA-Ready Application
 * ============================================================================
 */

class TasbihApp {
  constructor() {
    // --- Application State ---
    this.count = 0;
    this.target = null; // null or positive integer
    this.round = 1;
    this.isTargetLocked = false;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;

    // Preferences & Settings
    this.soundEnabled = true;
    this.hapticEnabled = true;
    this.theme = 'emerald';
    this.themes = ['emerald', 'midnight', 'gold', 'pearl'];

    // Audio Context (lazily initialized on first user interaction)
    this.audioCtx = null;

    // DOM Elements Cache
    this.dom = {
      app: document.getElementById('app'),
      appHeader: document.getElementById('appHeader'),
      statusBadge: document.getElementById('statusBadge'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundOnIcon: document.getElementById('soundOnIcon'),
      soundOffIcon: document.getElementById('soundOffIcon'),
      hapticToggleBtn: document.getElementById('hapticToggleBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),

      // Tap Zone
      tapZone: document.getElementById('tapZone'),
      particleContainer: document.getElementById('particleContainer'),
      displayContainer: document.getElementById('displayContainer'),
      progressCircle: document.getElementById('progressCircle'),
      counterValue: document.getElementById('counterValue'),
      counterLabel: document.getElementById('counterLabel'),
      targetValueDisplay: document.getElementById('targetValueDisplay'),
      progressBadge: document.getElementById('progressBadge'),
      percentText: document.getElementById('percentText'),
      tapHint: document.getElementById('tapHint'),
      tapHintText: document.getElementById('tapHintText'),

      // Control Card & Form
      controlCardWrapper: document.getElementById('controlCardWrapper'),
      controlCard: document.getElementById('controlCard'),
      targetForm: document.getElementById('targetForm'),
      targetInput: document.getElementById('targetInput'),
      clearInputBtn: document.getElementById('clearInputBtn'),
      setTargetBtn: document.getElementById('setTargetBtn'),
      resetBtn: document.getElementById('resetBtn'),
      presetChips: document.querySelectorAll('.chip-btn'),

      // Modals
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
   * Initialize state, event listeners, and UI
   */
  init() {
    this.loadState();
    this.setupProgressRing();
    this.bindEvents();
    this.applyTheme(this.theme);
    this.updateUI();
    this.registerServiceWorker();
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
   * Bind all user interaction events with strict propagation control
   */
  bindEvents() {
    // 1. Full Screen Tap Zone (PointerDown for instant sub-millisecond mobile response)
    this.dom.tapZone.addEventListener('pointerdown', (e) => this.handleTapZone(e));

    // Keyboard support for desktop accessibility
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Prevent tap on controls and header from triggering counter
    const stopPropagationElements = [
      this.dom.appHeader,
      this.dom.controlCardWrapper,
      this.dom.targetRequiredModal,
      this.dom.resetConfirmModal,
      this.dom.celebrationModal,
      this.dom.toastContainer,
    ];

    stopPropagationElements.forEach((el) => {
      if (el) {
        el.addEventListener('pointerdown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => e.stopPropagation());
      }
    });

    // 2. Target Control Form
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

    // Quick Preset Chips in control card
    this.dom.presetChips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetVal = parseInt(chip.getAttribute('data-target'), 10);
        this.dom.targetInput.value = targetVal;
        this.dom.clearInputBtn.classList.remove('hidden');
        this.highlightPresetChip(targetVal);
        this.handleSetTarget();
      });
    });

    // 3. Reset Button and Confirmation Modal
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

    // 4. Target Required Modal Interactions
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

    // 5. Goal Celebration Modal Actions
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
      this.focusTargetInput();
    });

    // 6. Header Action Controls
    this.dom.soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSound();
    });

    this.dom.hapticToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleHaptic();
    });

    this.dom.themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cycleTheme();
    });

    // Close modals on clicking backdrops
    [this.dom.targetRequiredModal, this.dom.resetConfirmModal, this.dom.celebrationModal].forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });
  }

  /**
   * Handle Main Screen Tap Zone Interaction
   * Crucial Validation Requirement #3:
   * - If no valid positive target is set: MUST NOT increment, show modal/toast and focus input!
   */
  handleTapZone(e) {
    // Prevent mouse down default to prevent focus shift
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

    // Trigger visual feedback
    this.createRipple(e.clientX, e.clientY);
    this.createFloatingParticle(e.clientX, e.clientY);
    this.triggerNumberPop();

    // Trigger Haptic and Audio
    this.triggerHaptic(20);
    this.playClickSound();

    // Check if target goal is reached
    if (this.count === this.target) {
      this.onGoalReached();
    }

    this.updateUI();
    this.saveState();
  }

  /**
   * Handles keyboard shortcuts for accessibility
   */
  handleKeyboard(e) {
    // If active element is input, do not intercept typing
    if (document.activeElement === this.dom.targetInput) {
      if (e.key === 'Escape') {
        this.dom.targetInput.blur();
      }
      return;
    }

    // Spacebar to count
    if (e.code === 'Space') {
      e.preventDefault();
      const rect = this.dom.displayContainer.getBoundingClientRect();
      const clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.height / 2;
      this.handleTapZone({ clientX, clientY, pointerType: 'touch' });
    } else if (e.key === 'r' || e.key === 'R') {
      this.openResetConfirmation();
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      this.focusTargetInput();
    } else if (e.key === 'Escape') {
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

    // Show modern modal
    this.openModal(this.dom.targetRequiredModal);

    // Apply shake animation to modal card
    const card = this.dom.targetRequiredModal.querySelector('.modal-card');
    if (card) {
      card.classList.remove('shake-warning');
      void card.offsetWidth; // Trigger reflow
      card.classList.add('shake-warning');
    }

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
    this.isTargetLocked = true;
    this.allowOverflowCounting = false;
    this.isGoalReached = this.count >= this.target;

    this.triggerHaptic(30);
    this.playSuccessSound();
    this.showToast(`Target goal set to ${this.target}`, 'success');

    this.highlightPresetChip(this.target);
    this.dom.targetInput.blur();
    this.updateUI();
    this.saveState();
  }

  /**
   * Goal Reached Celebration
   */
  onGoalReached() {
    this.isGoalReached = true;

    // Confetti celebration
    this.confetti.burst(160);

    // Multi-beat celebratory haptic pattern
    this.triggerHaptic([60, 50, 100, 50, 200, 100, 300]);

    // Celebratory victory chords
    this.playGoalSound();

    // Populate modal stats
    this.dom.celebrateTargetNum.textContent = this.target;
    this.dom.statCompletedNum.textContent = this.target;
    this.dom.statLapNum.textContent = `#${this.round}`;

    // Open celebration modal after slight micro-delay for smooth anticipation
    setTimeout(() => {
      this.openModal(this.dom.celebrationModal);
    }, 280);
  }

  /**
   * Start Next Round (keep target, increment lap, reset count to 0)
   */
  startNextRound() {
    this.round += 1;
    this.count = 0;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;

    this.triggerHaptic(35);
    this.playSuccessSound();
    this.showToast(`Round #${this.round} started! Target is ${this.target}`, 'success');

    this.updateUI();
    this.saveState();
  }

  /**
   * Open Reset Confirmation
   */
  openResetConfirmation() {
    this.dom.resetCurrentCountNum.textContent = this.count;
    this.openModal(this.dom.resetConfirmModal);
  }

  /**
   * Clear Count, Clear Target, and Restore Empty State
   */
  performReset() {
    this.count = 0;
    this.target = null;
    this.isTargetLocked = false;
    this.isGoalReached = false;
    this.allowOverflowCounting = false;
    this.round = 1;

    this.dom.targetInput.value = '';
    this.dom.clearInputBtn.classList.add('hidden');
    this.highlightPresetChip(null);

    this.triggerHaptic([50, 50]);
    this.playClickSound(300);
    this.showToast('Counter and target have been reset.', 'info');

    this.updateUI();
    this.saveState();
  }

  /**
   * Update all UI elements based on current state
   */
  updateUI() {
    // 1. Counter Display
    this.dom.counterValue.textContent = this.count.toLocaleString();

    // 2. Target Display
    if (this.isTargetLocked && this.target) {
      this.dom.targetValueDisplay.textContent = this.target.toLocaleString();
      this.dom.statusBadge.textContent = `Goal: ${this.target}`;
      this.dom.statusBadge.className = 'brand-subtitle active';
      this.dom.tapHintText.textContent = `Tap anywhere to count (Goal: ${this.target})`;
      this.dom.targetInput.value = this.target;
    } else {
      this.dom.targetValueDisplay.textContent = 'NOT SET';
      this.dom.statusBadge.textContent = 'Goal Inactive';
      this.dom.statusBadge.className = 'brand-subtitle';
      this.dom.tapHintText.textContent = 'Set a target goal to unlock tap counter';
    }

    // 3. Circular Progress Ring
    if (this.target && this.target > 0) {
      const ratio = Math.min(this.count / this.target, 1);
      const offset = this.ringCircumference * (1 - ratio);
      this.dom.progressCircle.style.strokeDashoffset = `${offset}`;

      const pct = Math.round((this.count / this.target) * 100);
      this.dom.percentText.textContent = `${pct}%`;

      if (this.count >= this.target) {
        this.dom.progressBadge.classList.add('goal-achieved');
        this.dom.statusBadge.className = 'brand-subtitle goal-met';
        this.dom.statusBadge.textContent = 'Goal Completed ★';
      } else {
        this.dom.progressBadge.classList.remove('goal-achieved');
      }
    } else {
      this.dom.progressCircle.style.strokeDashoffset = `${this.ringCircumference}`;
      this.dom.percentText.textContent = '0%';
      this.dom.progressBadge.classList.remove('goal-achieved');
    }

    // 4. Update Header Icon States
    if (this.soundEnabled) {
      this.dom.soundOnIcon.classList.remove('hidden');
      this.dom.soundOffIcon.classList.add('hidden');
      this.dom.soundToggleBtn.classList.add('active');
    } else {
      this.dom.soundOnIcon.classList.add('hidden');
      this.dom.soundOffIcon.classList.remove('hidden');
      this.dom.soundToggleBtn.classList.remove('active');
    }

    if (this.hapticEnabled) {
      this.dom.hapticToggleBtn.classList.add('active');
    } else {
      this.dom.hapticToggleBtn.classList.remove('active');
    }
  }

  /**
   * Micro-animation: Counter number pop
   */
  triggerNumberPop() {
    this.dom.counterValue.classList.remove('pulse-number');
    void this.dom.counterValue.offsetWidth;
    this.dom.counterValue.classList.add('pulse-number');
  }

  /**
   * Visual Ripple originating from tap coordinate
   */
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

    setTimeout(() => {
      ripple.remove();
    }, 700);
  }

  /**
   * Floating +1 particle rising from tap coordinate
   */
  createFloatingParticle(x, y) {
    if (!x || !y) return;

    const particle = document.createElement('span');
    particle.className = 'floating-plus-one';
    particle.textContent = '+1';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    this.dom.particleContainer.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 800);
  }

  /**
   * Focus target input with smooth highlight
   */
  focusTargetInput() {
    this.dom.targetInput.focus();
    this.dom.controlCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  /**
   * Highlight selected quick preset chip
   */
  highlightPresetChip(val) {
    this.dom.presetChips.forEach((chip) => {
      const chipVal = parseInt(chip.getAttribute('data-target'), 10);
      if (chipVal === val) {
        chip.classList.add('selected');
      } else {
        chip.classList.remove('selected');
      }
    });
  }

  /**
   * Modal Management
   */
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

  /**
   * Toast notification system
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'warning') {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
    } else if (type === 'success') {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `${iconSvg}<span class="toast-msg">${message}</span>`;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /**
   * Haptic vibration
   */
  triggerHaptic(pattern) {
    if (!this.hapticEnabled) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        // Safe fallback for restricted permissions
      }
    }
  }

  /**
   * Web Audio API Synthesizer (Zero external dependencies, 100% offline)
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

  playClickSound(frequency = 520) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.045);
    } catch (e) {}
  }

  playSuccessSound() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const notes = [440, 659.25];
      notes.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + i * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + i * 0.08);
        osc.stop(this.audioCtx.currentTime + i * 0.08 + 0.16);
      });
    } catch (e) {}
  }

  playWarningSound() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(180, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.19);
    } catch (e) {}
  }

  playGoalSound() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      // Ascending celebratory arpeggio: C5, E5, G5, C6
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.22, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.1);
        osc.stop(this.audioCtx.currentTime + idx * 0.1 + 0.36);
      });
    } catch (e) {}
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.showToast(this.soundEnabled ? 'Audio feedback enabled' : 'Audio muted', 'info');
    this.updateUI();
    this.saveState();
  }

  toggleHaptic() {
    this.hapticEnabled = !this.hapticEnabled;
    if (this.hapticEnabled) {
      this.triggerHaptic(30);
    }
    this.showToast(this.hapticEnabled ? 'Vibration feedback enabled' : 'Vibration disabled', 'info');
    this.updateUI();
    this.saveState();
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
        isTargetLocked: this.isTargetLocked,
        soundEnabled: this.soundEnabled,
        hapticEnabled: this.hapticEnabled,
        theme: this.theme,
      };
      localStorage.setItem('tasbih_pro_state', JSON.stringify(state));
    } catch (e) {}
  }

  loadState() {
    try {
      const saved = localStorage.getItem('tasbih_pro_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.count = typeof state.count === 'number' ? state.count : 0;
        this.target = typeof state.target === 'number' && state.target > 0 ? state.target : null;
        this.round = typeof state.round === 'number' ? state.round : 1;
        this.isTargetLocked = Boolean(state.isTargetLocked && this.target);
        this.soundEnabled = state.soundEnabled !== undefined ? state.soundEnabled : true;
        this.hapticEnabled = state.hapticEnabled !== undefined ? state.hapticEnabled : true;
        if (state.theme && this.themes.includes(state.theme)) {
          this.theme = state.theme;
        }
      }
    } catch (e) {}
  }

  /**
   * PWA Service Worker Registration
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker
        .register('./sw.js')
        .then(() => console.log('ServiceWorker registered'))
        .catch((err) => console.log('ServiceWorker registration error:', err));
    }
  }
}

/**
 * ============================================================================
 * HIGH PERFORMANCE CANVAS CONFETTI ENGINE (Zero External Dependencies)
 * ============================================================================
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
      p.vy += 0.38; // gravity
      p.vx *= 0.98; // air resistance
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
