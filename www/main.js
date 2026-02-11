const HAIR_METAL_TRACK = "Forces Join (80s Hair Metal).mp3";
const LOFI_TRACK = "Forces Join (LoFi).mp3";
const HIP_HOP_TRACK = "Forces Join (Hip Hop).mp3";
const ACT_TWO_TRACK = HIP_HOP_TRACK;
window.GSS_ACT_TWO_TRACK = ACT_TWO_TRACK;
const baseTracks = [
  "Forces Join (Trance).mp3",
  "Forces Join (Trip Hop).mp3",
  "Forces Join (Badass Orchestral).mp3",
  "Forces Join (Girl PowerPop Country).mp3",
  "Forces Join - Dubstep.mp3",
  "Forces Join - Holy Shit.mp3",
  "Forces Join - OG.mp3",
  "Forces Join (Prog Rock).mp3",
];
const shuffleTracks = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const actTwoAlternates = [LOFI_TRACK, HIP_HOP_TRACK].filter(
  (track) => track !== ACT_TWO_TRACK
);
const tracks = [
  HAIR_METAL_TRACK,
  ACT_TWO_TRACK,
  ...shuffleTracks([...baseTracks, ...actTwoAlternates]),
];

const WAITLIST_FORM_ID = "waitlist-form";
const WAITLIST_STATUS_CLASS = "waitlist-status";
const WAITLIST_ENDPOINT =
  window.GSS_RUNTIME_CONFIG?.waitlistEndpoint ||
  window.GSS_WAITLIST_ENDPOINT ||
  "";

const ENABLE_DEBUG_CONTROLS = false;
const ENABLE_KEYBOARD_CONTROLS = false;

const audio = document.getElementById("bg-audio");
const toggleButton = document.getElementById("audio-toggle");
const nextTrackButton = document.getElementById("next-track-button");
const trackLabel = document.getElementById("track-label");
const waitlistButton = document.getElementById("waitlist-button");
const waitlistPanel = document.getElementById("waitlist-panel");
const waitlistForm = document.getElementById(WAITLIST_FORM_ID);
const waitlistForms = document.querySelectorAll(".waitlist-form");
const waitlistMedia = document.getElementById("waitlist-media");
const staffVideo = document.getElementById("staff-video");
const actTwoSection = document.getElementById("act-two");
const worldbuilderAvatarVideo = document.getElementById(
  "worldbuilder-avatar-video"
);
const lazyAvatarVideos = Array.from(
  document.querySelectorAll(".agent-avatar__video--lazy")
);
const heroTitle = document.querySelector(".hero-title");
const lyricsPanel = document.getElementById("lyrics-panel");
const lyricsLine = document.getElementById("lyrics-line");
const sharePrompt = document.getElementById("share-prompt");
const sharePromptMessage = document.getElementById(
  "share-prompt-message"
);
const shareButton = document.getElementById("share-button");
const shareStatus = document.getElementById("share-status");
const shareToast = document.getElementById("share-toast");
const actTwoSharePrompt = document.getElementById(
  "act-two-share-prompt"
);
const actTwoShareButton = document.getElementById(
  "act-two-share-button"
);
const actTwoShareStatus = document.getElementById(
  "act-two-share-status"
);
const actTwoShareToast = document.getElementById(
  "act-two-share-toast"
);
const shareModal = document.getElementById("share-modal");
const shareModalBackdrop = document.getElementById(
  "share-modal-backdrop"
);
const shareModalCloseButton = document.getElementById(
  "share-modal-close"
);
const shareModalUrl = document.getElementById("share-modal-url");
const shareModalCopyButton = document.getElementById(
  "share-modal-copy-button"
);
const shareModalStatus = document.getElementById(
  "share-modal-status"
);
const debugSeek = document.getElementById("debug-seek");
const seekSlider = document.getElementById("seek-slider");
const seekTime = document.getElementById("seek-time");
const desktopQuery = window.matchMedia("(min-width: 780px)");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
const fxCanvas = document.getElementById("fx-canvas");
const fxContext = fxCanvas?.getContext("2d");

const trackWaitlistClick = () => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "select_content", {
      content_type: "button",
      item_id: "I Have a Game Idea",
    });
  }
};

let currentIndex = 0;
let isPlaying = false;
let fxBursts = 0;
let fxParticles = [];
let fxAnimating = false;
let fxOccasionalTimer = null;
let lyricsFrame = null;
let currentWordIndex = -1;
let currentLineIndex = -1;
let lineClearTimer = null;
let currentLineWords = [];
let isScrubbing = false;
let finalGssBurstTriggered = false;
let bgMotionFrame = null;
let bgMotionStart = 0;
let bgMotionActive = false;
let actTwoTriggered = false;
let actTwoActive = false;
let worldbuilderAvatarInViewTimer = null;
let worldbuilderAvatarObserver = null;
let worldbuilderAvatarPlayed = false;
let lazyAvatarObserver = null;
let actTwoRevealTimer = null;
let actOneFadeTimer = null;
let actOneCleanupTimer = null;
let actOneShareShown = false;
let actTwoShareShown = false;
let actTwoShareArmed = false;
let shareModalHideTimer = null;
let waitlistButtonLatched = false;
let waitlistButtonPointerId = null;
let waitlistButtonSuppressClick = false;
let bgHoverActive = false;
let bgHoverCleanupTimer = null;
let bgMotionStartTimer = null;
let bgReturnBeforeMotionRequested = false;
const BG_RETURN_DURATION = 1400;
const BG_RETURN_SETTLE_BUFFER = 120;
const BG_HOVER_TRAVEL_DURATION = 520;
const BG_HOVER_RETURN_DURATION = 1700;
const BG_HOVER_POST_RESET_DELAY = 200;
const BG_HOVER_SETTLE_BUFFER = 70;
const BG_HOVER_EASING = "cubic-bezier(0.2, 0.85, 0.3, 1)";
const BG_HOVER_RETURN_EASING = "cubic-bezier(0.16, 0.9, 0.22, 1)";
const ACT_ONE_EXIT_DURATION = 360;
const ACT_ONE_SHARE_DELAY_AFTER_LYRICS_DISAPPEAR_MS = 1000;
const ACT_ONE_STAY_TUNED_MESSAGE = "Stay tuned for more info…";
const ACT_ONE_STAY_TUNED_RESUME_PREFIX = "Resume & ";
const WORLDBUILDER_INITIAL_VISIBLE_DELAY = 8000;
const WORLDBUILDER_SCROLL_INTO_VIEW_DELAY = 2000;
const WORLDBUILDER_VISIBILITY_THRESHOLD = 0.35;
const LAZY_AVATAR_VISIBILITY_THRESHOLD = 0.15;
const LAZY_AVATAR_ROOT_MARGIN = "120px 0px";
const FIREWORK_BURST_COUNT = 32;
const MOBILE_FIREWORK_BURST_SCALE = 0.5;

const backgroundPatches = [
  {
    x: 20,
    y: 15,
    ampX: 22,
    ampY: 18,
    speedX: 1.4,
    speedY: 1.1,
    phase: 0.6,
  },
  {
    x: 85,
    y: 10,
    ampX: 26,
    ampY: 20,
    speedX: 1.2,
    speedY: 1.5,
    phase: 1.7,
  },
  {
    x: 80,
    y: 85,
    ampX: 18,
    ampY: 24,
    speedX: 1.6,
    speedY: 1.3,
    phase: 2.5,
  },
];
const hairMetalLyricLines = [
  {
    words: ["Game", "Studio", "Simulator"],
    times: [0.93, 1.15, 1.4],
  },
  {
    words: ["Forces", "join", "to", "make", "you", "a", "world", "creator"],
    times: [3.02, 1.44, 0.45, 0.2, 0.45, 0.34, 0.31, 0.40],
  },
  {
    words: ["Live", "and", "breathe", "the", "game", "of", "your", "dreams"],
    times: [1.81, 0.2, 0.29, 0.39, 0.29, 0.39, 0.09, 0.29],
  },
  {
    words: ["You’re", "the", "boss", "of", "your", "own", "team"],
    times: [0.9, 0.4, 0.37, 0.29, 0.25, 0.39, 0.37],
  },
  {
    words: ["Game", "Studio", "Simulator"],
    times: [1.63, 1.3, 1.42],
  },
  {
    words: [""],
    times: [8.5]
  }
];

const FINAL_GSS_LINE_INDEX = (() => {
  for (let i = hairMetalLyricLines.length - 1; i >= 0; i -= 1) {
    const words = hairMetalLyricLines[i]?.words || [];
    if (
      words.join(" ").trim().toLowerCase() ===
      "game studio simulator"
    ) {
      return i;
    }
  }
  return -1;
})();

const hairMetalTimeline = (() => {
  let cursor = 0;
  return hairMetalLyricLines.flatMap((line, lineIndex) => {
    return line.words.map((word, wordIndex) => {
      cursor += line.times[wordIndex] ?? 0;
      return {
        t: cursor,
        word,
        lineIndex,
        wordIndex,
      };
    });
  });
})();
const hairMetalLineMeta = (() => {
  const meta = hairMetalLyricLines.map(() => ({
    start: null,
    end: null,
    firstWordIndex: null,
    lastWordIndex: null,
    gapFromPrev: null,
  }));
  hairMetalTimeline.forEach((entry, index) => {
    const line = meta[entry.lineIndex];
    if (entry.wordIndex === 0 && line.start === null) {
      line.start = entry.t;
      line.firstWordIndex = index;
    }
    line.end = entry.t;
    line.lastWordIndex = index;
  });
  meta.forEach((line, index) => {
    if (line.start === null) {
      return;
    }
    const prev = meta[index - 1];
    if (prev && prev.end !== null) {
      line.gapFromPrev = line.start - prev.end;
    }
  });
  return meta;
})();
const FINAL_GSS_WORD_INDEX = (() => {
  if (FINAL_GSS_LINE_INDEX < 0) {
    return -1;
  }
  return hairMetalTimeline.findIndex(
    (entry) =>
      entry.lineIndex === FINAL_GSS_LINE_INDEX && entry.wordIndex === 0
  );
})();
const FINAL_GSS_WORD_TIME =
  FINAL_GSS_WORD_INDEX >= 0
    ? hairMetalTimeline[FINAL_GSS_WORD_INDEX]?.t ?? null
    : null;
const LAST_LYRIC_WORD_INDEX = (() => {
  for (let i = hairMetalTimeline.length - 1; i >= 0; i -= 1) {
    const word = hairMetalTimeline[i]?.word || "";
    if (word.trim().length > 0) {
      return i;
    }
  }
  return -1;
})();
const LAST_LYRIC_WORD_TIME =
  LAST_LYRIC_WORD_INDEX >= 0
    ? hairMetalTimeline[LAST_LYRIC_WORD_INDEX]?.t ?? null
    : null;
const FIRST_EMPTY_LYRIC_WORD_INDEX = (() => {
  if (LAST_LYRIC_WORD_INDEX < 0) {
    return -1;
  }
  for (
    let i = LAST_LYRIC_WORD_INDEX + 1;
    i < hairMetalTimeline.length;
    i += 1
  ) {
    const word = hairMetalTimeline[i]?.word || "";
    if (word.trim().length === 0) {
      return i;
    }
  }
  return -1;
})();
const LYRICS_DISAPPEAR_TIME =
  FIRST_EMPTY_LYRIC_WORD_INDEX >= 0
    ? hairMetalTimeline[FIRST_EMPTY_LYRIC_WORD_INDEX]?.t ?? null
    : LAST_LYRIC_WORD_TIME;
const ACT_ONE_SHARE_TRIGGER_TIME =
  LYRICS_DISAPPEAR_TIME === null
    ? null
    : LYRICS_DISAPPEAR_TIME +
      ACT_ONE_SHARE_DELAY_AFTER_LYRICS_DISAPPEAR_MS / 1000;

const setTrack = (index) => {
  const name = tracks[index];
  audio.src = `snd/${encodeURIComponent(name)}`;
  trackLabel.textContent = name.replace(/\.mp3$/i, "");
  resetLyrics();
};

const pickInitialTrack = () => {
  currentIndex = 0;
  setTrack(currentIndex);
};

const pickNextTrack = () => {
  if (tracks.length <= 1) {
    return;
  }
  currentIndex = (currentIndex + 1) % tracks.length;
  setTrack(currentIndex);
};

const setAudioToggleUi = (playing) => {
  toggleButton.dataset.state = playing ? "pause" : "play";
  toggleButton.textContent = playing ? "⏸" : "▶";
  toggleButton.setAttribute(
    "aria-label",
    playing ? "Pause soundtrack" : "Start soundtrack"
  );
};

const revealNextTrackButton = () => {
  if (!nextTrackButton) {
    return;
  }
  nextTrackButton.disabled = false;
  nextTrackButton.classList.add("is-visible");
};

const setShareStatus = (statusEl, message, isError = false) => {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
};

const setShareModalStatus = (message, isError = false) => {
  if (!shareModalStatus) {
    return;
  }
  shareModalStatus.textContent = message;
  shareModalStatus.classList.toggle("is-error", isError);
};

const openShareModal = (url) => {
  if (!shareModal || !shareModalUrl) {
    return;
  }
  if (shareModalHideTimer) {
    window.clearTimeout(shareModalHideTimer);
    shareModalHideTimer = null;
  }
  shareModalUrl.value = url;
  setShareModalStatus("");
  shareModal.hidden = false;
  window.requestAnimationFrame(() => {
    shareModal.classList.add("is-visible");
  });
  shareModalUrl.focus();
  shareModalUrl.select();
};

const closeShareModal = () => {
  if (!shareModal || shareModal.hidden) {
    return;
  }
  shareModal.classList.remove("is-visible");
  if (shareModalHideTimer) {
    window.clearTimeout(shareModalHideTimer);
  }
  shareModalHideTimer = window.setTimeout(() => {
    shareModal.hidden = true;
    shareModalHideTimer = null;
  }, 200);
};

const shareToastTimers = new WeakMap();

const hideShareToast = (toastEl) => {
  if (!toastEl) {
    return;
  }
  const existingTimer = shareToastTimers.get(toastEl);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
    shareToastTimers.delete(toastEl);
  }
  toastEl.classList.remove("is-visible");
  toastEl.hidden = true;
};

const showShareToast = (
  toastEl,
  message = "Copied URL to clipboard."
) => {
  if (!toastEl) {
    return;
  }
  const existingTimer = shareToastTimers.get(toastEl);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }
  toastEl.textContent = message;
  toastEl.hidden = false;
  window.requestAnimationFrame(() => {
    toastEl.classList.add("is-visible");
  });
  const timer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
    window.setTimeout(() => {
      if (!toastEl.classList.contains("is-visible")) {
        toastEl.hidden = true;
      }
    }, 200);
    shareToastTimers.delete(toastEl);
  }, 2200);
  shareToastTimers.set(toastEl, timer);
};

const setShareMessage = (message = "") => {
  if (!sharePromptMessage) {
    return;
  }
  const nextMessage = message.trim();
  if (!nextMessage) {
    sharePromptMessage.textContent = "";
    sharePromptMessage.hidden = true;
    return;
  }
  sharePromptMessage.textContent = nextMessage;
  sharePromptMessage.hidden = false;
};

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fall through to legacy copy fallback.
    }
  }
  const copyTarget = document.createElement("textarea");
  copyTarget.value = text;
  copyTarget.setAttribute("readonly", "");
  copyTarget.setAttribute("aria-hidden", "true");
  copyTarget.style.position = "absolute";
  copyTarget.style.left = "-9999px";
  copyTarget.style.top = "0";
  copyTarget.style.opacity = "0";
  document.body.appendChild(copyTarget);
  copyTarget.focus();
  copyTarget.select();
  copyTarget.setSelectionRange(0, copyTarget.value.length);
  let didCopy = false;
  try {
    didCopy = document.execCommand("copy");
  } catch (error) {
    didCopy = false;
  }
  document.body.removeChild(copyTarget);
  return didCopy;
};

const handleShareClick = async ({ statusEl, toastEl }) => {
  setShareStatus(statusEl, "");
  hideShareToast(toastEl);
  const shareUrl = window.location.href;
  const shareData = {
    title: document.title,
    text: "Game Studio Simulator",
    url: shareUrl,
  };
  if (typeof navigator.share === "function") {
    try {
      const result = await navigator.share(shareData);
      if (result === false) {
        openShareModal(shareUrl);
      }
      return;
    } catch (error) {
      openShareModal(shareUrl);
      return;
    }
  }
  openShareModal(shareUrl);
};

const showSharePrompt = ({ message = "" } = {}) => {
  if (!sharePrompt || !lyricsPanel) {
    return;
  }
  setShareStatus(shareStatus, "");
  setShareMessage(message);
  lyricsPanel.style.display = "block";
  lyricsPanel.classList.remove("is-fading");
  lyricsPanel.classList.add("is-share-mode");
  sharePrompt.hidden = false;
  window.requestAnimationFrame(() => {
    sharePrompt.classList.add("is-visible");
  });
};

const hideSharePrompt = () => {
  if (!sharePrompt || !lyricsPanel) {
    return;
  }
  hideShareToast(shareToast);
  setShareStatus(shareStatus, "");
  setShareMessage("");
  sharePrompt.classList.remove("is-visible");
  sharePrompt.hidden = true;
  lyricsPanel.classList.remove("is-share-mode");
};

const resetActOneSharePrompt = () => {
  actOneShareShown = false;
  hideSharePrompt();
};

const maybeShowActOneSharePrompt = (time) => {
  if (
    actOneShareShown ||
    !isHairMetalTrack() ||
    actTwoTriggered ||
    ACT_ONE_SHARE_TRIGGER_TIME === null ||
    time < ACT_ONE_SHARE_TRIGGER_TIME
  ) {
    return;
  }
  actOneShareShown = true;
  showSharePrompt({
    message: ACT_ONE_STAY_TUNED_MESSAGE,
  });
};

const shouldKeepActOneSharePromptWhilePlaying = () => {
  if (
    !actOneShareShown ||
    !isHairMetalTrack() ||
    actTwoTriggered ||
    ACT_ONE_SHARE_TRIGGER_TIME === null
  ) {
    return false;
  }
  return (audio.currentTime || 0) >= ACT_ONE_SHARE_TRIGGER_TIME;
};

const showActTwoSharePrompt = () => {
  if (actTwoShareShown || !actTwoSharePrompt) {
    return;
  }
  actTwoShareShown = true;
  setShareStatus(actTwoShareStatus, "");
  actTwoSharePrompt.hidden = false;
  window.requestAnimationFrame(() => {
    actTwoSharePrompt.classList.add("is-visible");
  });
};

const resizeFxCanvas = () => {
  if (!fxCanvas) {
    return;
  }
  const pixelRatio = window.devicePixelRatio || 1;
  fxCanvas.width = window.innerWidth * pixelRatio;
  fxCanvas.height = window.innerHeight * pixelRatio;
  fxCanvas.style.width = `${window.innerWidth}px`;
  fxCanvas.style.height = `${window.innerHeight}px`;
  if (fxContext) {
    fxContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
};

const reflect = (value, min, max) => {
  const range = max - min;
  if (range <= 0) {
    return min;
  }
  let normalized = (value - min) % (range * 2);
  if (normalized < 0) {
    normalized += range * 2;
  }
  return normalized <= range
    ? min + normalized
    : max - (normalized - range);
};

const clampPatchPercent = (value) => {
  return Math.min(98, Math.max(2, value));
};

const clearBgHoverCleanupTimer = () => {
  if (!bgHoverCleanupTimer) {
    return;
  }
  window.clearTimeout(bgHoverCleanupTimer);
  bgHoverCleanupTimer = null;
};

const clearBgMotionStartTimer = () => {
  if (!bgMotionStartTimer) {
    return;
  }
  window.clearTimeout(bgMotionStartTimer);
  bgMotionStartTimer = null;
};

const setPatchTransition = (durationMs, easing) => {
  document.body.style.setProperty(
    "--patch-transition-duration",
    `${durationMs}ms`
  );
  document.body.style.setProperty(
    "--patch-transition-easing",
    easing
  );
};

const clearPatchTransition = () => {
  document.body.style.removeProperty("--patch-transition-duration");
  document.body.style.removeProperty("--patch-transition-easing");
};

const clearBackgroundHoverState = () => {
  bgHoverActive = false;
  clearBgHoverCleanupTimer();
  document.body.classList.remove("is-bg-hovering");
  clearPatchTransition();
};

const setPatchPosition = (index, x, y) => {
  document.body.style.setProperty(`--patch-${index}-x`, `${x}%`);
  document.body.style.setProperty(`--patch-${index}-y`, `${y}%`);
};

const resetPatchPositions = () => {
  backgroundPatches.forEach((patch, index) => {
    setPatchPosition(index + 1, patch.x, patch.y);
  });
};

const getWaitlistButtonPatchTargets = () => {
  const rect = waitlistButton?.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return null;
  }
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return null;
  }
  const centerX =
    ((rect.left + rect.width / 2) / viewportWidth) * 100;
  const centerY =
    ((rect.top + rect.height / 2) / viewportHeight) * 100;
  return [
    {
      x: clampPatchPercent(centerX - 14),
      y: clampPatchPercent(centerY - 16),
    },
    {
      x: clampPatchPercent(centerX + 16),
      y: clampPatchPercent(centerY - 10),
    },
    {
      x: clampPatchPercent(centerX + 3),
      y: clampPatchPercent(centerY + 18),
    },
  ];
};

const animateBackgroundTowardWaitlistButton = () => {
  if (
    prefersReducedMotion.matches ||
    bgMotionActive ||
    actTwoActive ||
    waitlistButtonLatched
  ) {
    return;
  }
  const targets = getWaitlistButtonPatchTargets();
  if (!targets) {
    return;
  }
  clearBgMotionStartTimer();
  clearBgHoverCleanupTimer();
  document.body.classList.remove("is-bg-returning");
  setPatchTransition(BG_HOVER_TRAVEL_DURATION, BG_HOVER_EASING);
  document.body.classList.add("is-bg-hovering");
  targets.forEach((target, index) => {
    setPatchPosition(index + 1, target.x, target.y);
  });
  bgHoverActive = true;
};

const animateBackgroundBackToStart = ({
  durationMs = BG_HOVER_TRAVEL_DURATION,
  easing = BG_HOVER_EASING,
} = {}) => {
  if (prefersReducedMotion.matches || bgMotionActive || actTwoActive) {
    clearBackgroundHoverState();
    resetPatchPositions();
    return;
  }
  clearBgHoverCleanupTimer();
  setPatchTransition(durationMs, easing);
  document.body.classList.add("is-bg-hovering");
  resetPatchPositions();
  bgHoverActive = false;
  bgHoverCleanupTimer = window.setTimeout(() => {
    bgHoverCleanupTimer = null;
    document.body.classList.remove("is-bg-hovering");
    clearPatchTransition();
  }, durationMs + BG_HOVER_SETTLE_BUFFER);
};

const queueBackgroundReturnBeforeActOneMotion = () => {
  if (!bgHoverActive || prefersReducedMotion.matches) {
    return;
  }
  bgReturnBeforeMotionRequested = true;
  animateBackgroundBackToStart({
    durationMs: BG_HOVER_RETURN_DURATION,
    easing: BG_HOVER_RETURN_EASING,
  });
  startBackgroundMotion();
};

const isPointerInsideElement = (event, element) => {
  const rect = element?.getBoundingClientRect();
  if (!rect) {
    return false;
  }
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
};

const updatePatchPositions = (timestamp) => {
  if (!bgMotionActive) {
    return;
  }
  const time = (timestamp - bgMotionStart) / 1000;
  backgroundPatches.forEach((patch, index) => {
    const baseX =
      Math.sin(patch.phase) * patch.ampX +
      Math.sin(patch.phase * 1.3) * (patch.ampX * 0.35);
    const baseY =
      Math.cos(patch.phase) * patch.ampY +
      Math.cos(patch.phase * 1.7) * (patch.ampY * 0.35);
    const driftX =
      Math.sin(time * patch.speedX + patch.phase) * patch.ampX +
      Math.sin(time * patch.speedY * 0.7 + patch.phase * 1.3) *
        (patch.ampX * 0.35) -
      baseX;
    const driftY =
      Math.cos(time * patch.speedY + patch.phase) * patch.ampY +
      Math.cos(time * patch.speedX * 0.9 + patch.phase * 1.7) *
        (patch.ampY * 0.35) -
      baseY;
    const x = reflect(patch.x + driftX, 2, 98);
    const y = reflect(patch.y + driftY, 2, 98);
    setPatchPosition(index + 1, x, y);
  });
  bgMotionFrame = window.requestAnimationFrame(updatePatchPositions);
};

const startBackgroundMotion = () => {
  if (
    prefersReducedMotion.matches ||
    bgMotionActive ||
    actTwoActive ||
    bgMotionStartTimer
  ) {
    return;
  }
  if (bgReturnBeforeMotionRequested) {
    bgReturnBeforeMotionRequested = false;
    clearBgMotionStartTimer();
    bgMotionStartTimer = window.setTimeout(() => {
      bgMotionStartTimer = null;
      startBackgroundMotion();
    }, BG_HOVER_RETURN_DURATION + BG_HOVER_POST_RESET_DELAY);
    return;
  }
  clearBgMotionStartTimer();
  clearBackgroundHoverState();
  document.body.classList.remove("is-bg-returning");
  bgMotionActive = true;
  bgMotionStart = performance.now();
  bgMotionFrame = window.requestAnimationFrame(updatePatchPositions);
};

const stopBackgroundMotion = ({ reset = true } = {}) => {
  clearBgMotionStartTimer();
  bgReturnBeforeMotionRequested = false;
  clearBackgroundHoverState();
  if (!bgMotionActive) {
    if (reset) {
      resetPatchPositions();
    }
    return;
  }
  bgMotionActive = false;
  if (bgMotionFrame) {
    window.cancelAnimationFrame(bgMotionFrame);
    bgMotionFrame = null;
  }
  if (reset) {
    resetPatchPositions();
  }
};

const animateBackgroundReturn = () => {
  if (prefersReducedMotion.matches) {
    stopBackgroundMotion();
    return;
  }
  stopBackgroundMotion({ reset: false });
  document.body.classList.add("is-bg-returning");
  window.requestAnimationFrame(() => {
    resetPatchPositions();
  });
  window.setTimeout(() => {
    document.body.classList.remove("is-bg-returning");
  }, BG_RETURN_DURATION + BG_RETURN_SETTLE_BUFFER);
};

const clearActOneTransitionTimers = () => {
  if (actOneFadeTimer) {
    window.clearTimeout(actOneFadeTimer);
    actOneFadeTimer = null;
  }
  if (actOneCleanupTimer) {
    window.clearTimeout(actOneCleanupTimer);
    actOneCleanupTimer = null;
  }
};

const startActOneFadeOut = () => {
  if (lyricsPanel && lyricsPanel.style.display !== "none") {
    lyricsPanel.classList.add("is-fading");
  }
  hideSharePrompt();
  if (!waitlistMedia || waitlistMedia.classList.contains("is-hidden")) {
    return;
  }
  waitlistMedia.classList.remove("is-active");
};

const hideActOneElements = () => {
  if (lyricsPanel) {
    lyricsPanel.classList.remove("is-fading");
    lyricsPanel.style.display = "none";
  }
  resetActOneSharePrompt();
  if (
    waitlistMedia &&
    !waitlistMedia.classList.contains("is-hidden")
  ) {
    waitlistMedia.classList.add("is-hidden");
  }
};

const scheduleActOneExit = (revealDelay) => {
  clearActOneTransitionTimers();
  if (revealDelay <= 0 || prefersReducedMotion.matches) {
    hideActOneElements();
    return;
  }
  const fadeStartDelay = Math.max(
    revealDelay - ACT_ONE_EXIT_DURATION,
    0
  );
  if (fadeStartDelay === 0) {
    startActOneFadeOut();
  } else {
    actOneFadeTimer = window.setTimeout(() => {
      actOneFadeTimer = null;
      startActOneFadeOut();
    }, fadeStartDelay);
  }
  actOneCleanupTimer = window.setTimeout(() => {
    actOneCleanupTimer = null;
    hideActOneElements();
  }, revealDelay);
};

const revealActTwoItems = () => {
  if (!actTwoSection) {
    return;
  }
  const items = Array.from(
    actTwoSection.querySelectorAll(".reveal-item")
  );
  items.forEach((item, index) => {
    window.setTimeout(() => {
      item.classList.add("is-visible");
    }, 220 + index * 240);
  });
};

const clearActTwoRevealTimer = () => {
  if (!actTwoRevealTimer) {
    return;
  }
  window.clearTimeout(actTwoRevealTimer);
  actTwoRevealTimer = null;
};

const revealActTwoSection = () => {
  clearActOneTransitionTimers();
  hideActOneElements();
  clearActTwoRevealTimer();
  if (actTwoSection) {
    actTwoSection.classList.add("is-active");
    actTwoSection.removeAttribute("hidden");
    actTwoSection.setAttribute("aria-hidden", "false");
  }
  revealActTwoItems();
  scheduleWorldbuilderAvatarVideo();
  scheduleLazyAvatarVideos();
};

const freezeWorldbuilderAvatarVideo = () => {
  if (!worldbuilderAvatarVideo) {
    return;
  }
  worldbuilderAvatarVideo.pause();
  if (
    Number.isFinite(worldbuilderAvatarVideo.duration) &&
    worldbuilderAvatarVideo.duration > 0
  ) {
    worldbuilderAvatarVideo.currentTime = Math.max(
      worldbuilderAvatarVideo.duration - 0.04,
      0
    );
  }
  worldbuilderAvatarVideo.classList.add("is-visible");
};

const clearWorldbuilderAvatarInViewTimer = () => {
  if (!worldbuilderAvatarInViewTimer) {
    return;
  }
  window.clearTimeout(worldbuilderAvatarInViewTimer);
  worldbuilderAvatarInViewTimer = null;
};

const disconnectWorldbuilderAvatarObserver = () => {
  if (!worldbuilderAvatarObserver) {
    return;
  }
  worldbuilderAvatarObserver.disconnect();
  worldbuilderAvatarObserver = null;
};

const clearWorldbuilderAvatarPlaybackTriggers = () => {
  clearWorldbuilderAvatarInViewTimer();
  disconnectWorldbuilderAvatarObserver();
};

const playWorldbuilderAvatarVideo = async () => {
  if (!worldbuilderAvatarVideo || worldbuilderAvatarPlayed) {
    return;
  }
  worldbuilderAvatarPlayed = true;
  worldbuilderAvatarVideo.classList.add("is-visible");
  worldbuilderAvatarVideo.currentTime = 0;
  try {
    await worldbuilderAvatarVideo.play();
    clearWorldbuilderAvatarPlaybackTriggers();
  } catch (error) {
    worldbuilderAvatarPlayed = false;
    worldbuilderAvatarVideo.classList.remove("is-visible");
  }
};

const scheduleWorldbuilderAvatarInViewPlayback = (delayMs) => {
  if (worldbuilderAvatarInViewTimer || worldbuilderAvatarPlayed) {
    return;
  }
  worldbuilderAvatarInViewTimer = window.setTimeout(() => {
    worldbuilderAvatarInViewTimer = null;
    if (!actTwoActive) {
      return;
    }
    playWorldbuilderAvatarVideo();
  }, delayMs);
};

const handleWorldbuilderAvatarIntersection = (entries) => {
  if (!actTwoActive || worldbuilderAvatarPlayed) {
    return;
  }
  const isVisible = entries.some(
    (entry) =>
      entry.isIntersecting &&
      entry.intersectionRatio >= WORLDBUILDER_VISIBILITY_THRESHOLD
  );
  if (isVisible) {
    scheduleWorldbuilderAvatarInViewPlayback(
      WORLDBUILDER_SCROLL_INTO_VIEW_DELAY
    );
    return;
  }
  clearWorldbuilderAvatarInViewTimer();
};

const checkWorldbuilderAvatarVisibility = () => {
  if (!worldbuilderAvatarVideo || worldbuilderAvatarPlayed) {
    return;
  }
  const rect = worldbuilderAvatarVideo.getBoundingClientRect();
  const width = window.innerWidth || document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;
  const visibleWidth =
    Math.max(0, Math.min(rect.right, width) - Math.max(rect.left, 0));
  const visibleHeight =
    Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, 0));
  const area = Math.max(rect.width * rect.height, 0);
  const visibleArea = visibleWidth * visibleHeight;
  const visibilityRatio = area > 0 ? visibleArea / area : 0;
  if (visibilityRatio >= WORLDBUILDER_VISIBILITY_THRESHOLD) {
    scheduleWorldbuilderAvatarInViewPlayback(
      WORLDBUILDER_INITIAL_VISIBLE_DELAY
    );
    return;
  }
  clearWorldbuilderAvatarInViewTimer();
};

const observeWorldbuilderAvatarVisibility = () => {
  if (
    !worldbuilderAvatarVideo ||
    worldbuilderAvatarObserver ||
    typeof IntersectionObserver !== "function"
  ) {
    return;
  }
  worldbuilderAvatarObserver = new IntersectionObserver(
    handleWorldbuilderAvatarIntersection,
    {
      threshold: [
        0,
        WORLDBUILDER_VISIBILITY_THRESHOLD,
        1,
      ],
    }
  );
  worldbuilderAvatarObserver.observe(worldbuilderAvatarVideo);
};

const scheduleWorldbuilderAvatarVideo = () => {
  if (!worldbuilderAvatarVideo || worldbuilderAvatarPlayed) {
    return;
  }
  observeWorldbuilderAvatarVisibility();
  checkWorldbuilderAvatarVisibility();
};

const loadLazyAvatarVideo = async (video) => {
  if (!video) {
    return;
  }
  const source = video.dataset.src;
  if (!source) {
    return;
  }
  if (video.dataset.loaded !== "true") {
    video.src = source;
    video.dataset.loaded = "true";
    video.load();
  }
  try {
    await video.play();
    video.classList.add("is-visible");
  } catch (error) {
    // Keep the static avatar image as fallback if autoplay is blocked.
  }
};

const handleLazyAvatarIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (
      !entry.isIntersecting ||
      entry.intersectionRatio < LAZY_AVATAR_VISIBILITY_THRESHOLD
    ) {
      return;
    }
    observer.unobserve(entry.target);
    loadLazyAvatarVideo(entry.target);
  });
};

const scheduleLazyAvatarVideos = () => {
  if (!actTwoActive || lazyAvatarVideos.length === 0) {
    return;
  }
  if (typeof IntersectionObserver !== "function") {
    lazyAvatarVideos.forEach((video) => {
      loadLazyAvatarVideo(video);
    });
    return;
  }
  if (!lazyAvatarObserver) {
    lazyAvatarObserver = new IntersectionObserver(
      handleLazyAvatarIntersection,
      {
        threshold: [0, LAZY_AVATAR_VISIBILITY_THRESHOLD, 1],
        rootMargin: LAZY_AVATAR_ROOT_MARGIN,
      }
    );
  }
  lazyAvatarVideos.forEach((video) => {
    if (video.dataset.loaded === "true") {
      return;
    }
    lazyAvatarObserver.observe(video);
  });
};

const triggerActTwoSequence = () => {
  if (actTwoTriggered) {
    return;
  }
  actTwoTriggered = true;
  actTwoActive = true;
  actTwoShareArmed = true;
  document.body.classList.add("is-still");
  animateBackgroundReturn();
  stopFireworks();
  stopLyrics({ hidePanel: false });

  if (staffVideo) {
    staffVideo.pause();
    staffVideo.currentTime = 0;
  }
  const revealDelay = prefersReducedMotion.matches
    ? 0
    : BG_RETURN_DURATION + BG_RETURN_SETTLE_BUFFER;
  scheduleActOneExit(revealDelay);
  if (revealDelay <= 0) {
    revealActTwoSection();
    return;
  }
  actTwoRevealTimer = window.setTimeout(() => {
    revealActTwoSection();
  }, revealDelay);
};

const spawnBurst = (originX, originY) => {
  if (!heroTitle || !fxContext) {
    return;
  }
  fxBursts += 1;
  resizeFxCanvas();
  const rect = heroTitle.getBoundingClientRect();
  const burstX =
    typeof originX === "number"
      ? originX
      : rect.left + rect.width * (0.05 + Math.random() * 0.9);
  const burstY =
    typeof originY === "number"
      ? originY
      : rect.top + rect.height * (0.3 + Math.random() * 0.4);
  const colors = ["#ff2aa1", "#35f1ff", "#ffe24b", "#ff7a00"];
  const count = 42;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 3.5;
    fxParticles.push({
      x: burstX,
      y: burstY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 1.2 + 0.5),
      life: 60 + Math.random() * 20,
      color: colors[i % colors.length],
      size: 2 + Math.random() * 2,
    });
  }
  if (!fxAnimating) {
    fxAnimating = true;
    requestAnimationFrame(updateFireworks);
  }
};

const scheduleOccasionalFireworks = () => {
  if (fxOccasionalTimer) {
    clearTimeout(fxOccasionalTimer);
  }
  const delay = 2800 + Math.random() * 5200;
  fxOccasionalTimer = setTimeout(() => {
    spawnBurst();
    scheduleOccasionalFireworks();
  }, delay);
};

const triggerFireworks = () => {
  if (actTwoActive) {
    return;
  }
  const burstsToRun = desktopQuery.matches
    ? FIREWORK_BURST_COUNT
    : Math.max(
        1,
        Math.floor(
          FIREWORK_BURST_COUNT * MOBILE_FIREWORK_BURST_SCALE
        )
      );
  if (heroTitle && fxContext) {
    const rect = heroTitle.getBoundingClientRect();
    const originY = rect.top + rect.height * 0.55;
    for (let i = 0; i < burstsToRun; i += 1) {
      const originX =
        rect.left + rect.width * ((i + 0.5) / burstsToRun);
      const jitterY = (Math.random() - 0.5) * 40;
      spawnBurst(originX, originY + jitterY);
    }
  }
  scheduleOccasionalFireworks();
};

const updateFireworks = () => {
  if (!fxContext) {
    fxAnimating = false;
    return;
  }
  if (actTwoActive) {
    fxParticles = [];
    fxAnimating = false;
    fxContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    return;
  }
  fxContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  fxParticles = fxParticles.filter((particle) => particle.life > 0);
  fxParticles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.04;
    particle.life -= 1;
    fxContext.globalAlpha = Math.max(particle.life / 80, 0);
    fxContext.fillStyle = particle.color;
    fxContext.beginPath();
    fxContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    fxContext.fill();
  });
  fxContext.globalAlpha = 1;
  if (fxParticles.length > 0) {
    requestAnimationFrame(updateFireworks);
  } else {
    fxAnimating = false;
  }
};

const stopFireworks = () => {
  if (fxOccasionalTimer) {
    clearTimeout(fxOccasionalTimer);
    fxOccasionalTimer = null;
  }
  fxParticles = [];
  fxAnimating = false;
  if (fxContext) {
    fxContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
};

const resizeHeroTitle = () => {
  if (!heroTitle) {
    return;
  }
  if (heroTitle.classList.contains("hero-title--image")) {
    heroTitle.style.fontSize = "";
    return;
  }
  if (!desktopQuery.matches) {
    heroTitle.style.fontSize = "";
    return;
  }
  const page = heroTitle.closest(".page");
  if (!page) {
    return;
  }
  const pageStyles = window.getComputedStyle(page);
  const paddingLeft = parseFloat(pageStyles.paddingLeft) || 0;
  const paddingRight = parseFloat(pageStyles.paddingRight) || 0;
  const availableWidth = page.clientWidth - paddingLeft - paddingRight;
  if (availableWidth <= 0) {
    return;
  }
  heroTitle.style.fontSize = "";
  const baseSize = parseFloat(
    window.getComputedStyle(heroTitle).fontSize
  );
  const textWidth = heroTitle.scrollWidth;
  if (textWidth > availableWidth) {
    const ratio = availableWidth / textWidth;
    heroTitle.style.fontSize = `${Math.max(28, baseSize * ratio)}px`;
  }
};

const playAudio = async () => {
  try {
    if (!audio.src) {
      setTrack(currentIndex);
    }
    await audio.play();
    isPlaying = true;
    if (isHairMetalTrack()) {
      if (shouldKeepActOneSharePromptWhilePlaying()) {
        showSharePrompt({ message: ACT_ONE_STAY_TUNED_MESSAGE });
      } else {
        hideSharePrompt();
      }
    }
    startBackgroundMotion();
    setAudioToggleUi(true);
    toggleButton.classList.add("is-playing");
    startLyrics();
    if (waitlistMedia && !actTwoActive) {
      waitlistMedia.classList.add("is-active");
    }
    if (staffVideo && !actTwoActive) {
      staffVideo.play().catch(() => {});
    }
  } catch (error) {
    setAudioToggleUi(false);
  }
};

const pauseAudio = () => {
  audio.pause();
  isPlaying = false;
  setAudioToggleUi(false);
  toggleButton.classList.remove("is-playing");
  stopLyrics();
  if (waitlistMedia) {
    waitlistMedia.classList.remove("is-active");
  }
  if (staffVideo) {
    staffVideo.pause();
  }
  if (tracks[currentIndex] === HAIR_METAL_TRACK && !actTwoActive) {
    showSharePrompt({
      message: `${ACT_ONE_STAY_TUNED_RESUME_PREFIX}${ACT_ONE_STAY_TUNED_MESSAGE}`,
    });
  }
  stopBackgroundMotion();
  if (fxOccasionalTimer) {
    clearTimeout(fxOccasionalTimer);
    fxOccasionalTimer = null;
  }
};

toggleButton.addEventListener("click", () => {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
});

if (nextTrackButton) {
  nextTrackButton.addEventListener("click", () => {
    const shouldAutoplay = isPlaying;
    pickNextTrack();
    if (shouldAutoplay) {
      playAudio();
    }
  });
}

waitlistButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType !== "mouse") {
    return;
  }
  animateBackgroundTowardWaitlistButton();
});

waitlistButton.addEventListener("pointerleave", (event) => {
  if (event.pointerType !== "mouse" || waitlistButtonLatched) {
    return;
  }
  animateBackgroundBackToStart();
});

waitlistButton.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) {
    return;
  }
  waitlistButtonSuppressClick = false;
  waitlistButtonPointerId = event.pointerId;
  waitlistButton.classList.remove("is-press-cancelled");
  if (!waitlistButtonLatched) {
    waitlistButton.classList.add("is-pressed");
  }
  if (typeof waitlistButton.setPointerCapture === "function") {
    waitlistButton.setPointerCapture(event.pointerId);
  }
});

waitlistButton.addEventListener("pointermove", (event) => {
  if (
    event.pointerId !== waitlistButtonPointerId ||
    waitlistButtonLatched
  ) {
    return;
  }
  const pointerInside = isPointerInsideElement(event, waitlistButton);
  waitlistButton.classList.toggle("is-pressed", pointerInside);
  waitlistButton.classList.toggle("is-press-cancelled", !pointerInside);
  if (event.pointerType === "mouse") {
    if (pointerInside && !bgHoverActive) {
      animateBackgroundTowardWaitlistButton();
    } else if (bgHoverActive) {
      animateBackgroundBackToStart();
    }
  }
});

waitlistButton.addEventListener("pointerup", (event) => {
  if (event.pointerId !== waitlistButtonPointerId) {
    return;
  }
  const releasedInside = isPointerInsideElement(event, waitlistButton);
  waitlistButtonSuppressClick = !releasedInside;
  if (!releasedInside && !waitlistButtonLatched) {
    waitlistButton.classList.remove("is-pressed");
  }
  waitlistButton.classList.remove("is-press-cancelled");
  if (
    typeof waitlistButton.hasPointerCapture === "function" &&
    waitlistButton.hasPointerCapture(event.pointerId)
  ) {
    waitlistButton.releasePointerCapture(event.pointerId);
  }
  waitlistButtonPointerId = null;
});

waitlistButton.addEventListener("pointercancel", (event) => {
  if (event.pointerId !== waitlistButtonPointerId) {
    return;
  }
  waitlistButtonSuppressClick = true;
  if (!waitlistButtonLatched) {
    waitlistButton.classList.remove("is-pressed");
  }
  waitlistButton.classList.remove("is-press-cancelled");
  waitlistButtonPointerId = null;
});

waitlistButton.addEventListener("click", (event) => {
  if (waitlistButtonSuppressClick && event.detail > 0) {
    waitlistButtonSuppressClick = false;
    waitlistButton.classList.remove("is-press-cancelled");
    return;
  }
  waitlistButtonSuppressClick = false;
  waitlistButton.classList.remove("is-press-cancelled");
  queueBackgroundReturnBeforeActOneMotion();
  waitlistButtonLatched = true;
  waitlistButton.classList.add("is-pressed");
  trackWaitlistClick();
  document.body.classList.add("is-act-one-live");
  waitlistPanel.classList.remove("is-hidden");
  waitlistPanel.classList.add("is-visible");
  if (waitlistMedia && !actTwoActive) {
    waitlistMedia.classList.remove("is-hidden");
  }
  const emailInput = waitlistForm?.querySelector("input[type='email']");
  if (emailInput && desktopQuery.matches) {
    emailInput.focus();
  }
  playAudio();
  triggerFireworks();
});

if (shareButton) {
  shareButton.addEventListener("click", () => {
    handleShareClick({
      statusEl: shareStatus,
      toastEl: shareToast,
    });
  });
}

if (actTwoShareButton) {
  actTwoShareButton.addEventListener("click", () => {
    handleShareClick({
      statusEl: actTwoShareStatus,
      toastEl: actTwoShareToast,
    });
  });
}

if (shareModalCopyButton) {
  shareModalCopyButton.addEventListener("click", async () => {
    const url = shareModalUrl?.value || window.location.href;
    const copied = await copyTextToClipboard(url);
    if (copied) {
      setShareModalStatus("Copied to clipboard.");
      return;
    }
    setShareModalStatus(
      "Copy was blocked. Select the URL and copy manually.",
      true
    );
    if (shareModalUrl) {
      shareModalUrl.focus();
      shareModalUrl.select();
    }
  });
}

if (shareModalCloseButton) {
  shareModalCloseButton.addEventListener("click", () => {
    closeShareModal();
  });
}

if (shareModalBackdrop) {
  shareModalBackdrop.addEventListener("click", () => {
    closeShareModal();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && shareModal && !shareModal.hidden) {
    closeShareModal();
  }
});

const bindWaitlistForm = (form) => {
  const submitButton = form.querySelector("button[type='submit']");
  const statusEl = form.querySelector(`.${WAITLIST_STATUS_CLASS}`);
  const submitFull = submitButton?.querySelector(".waitlist-submit__full");
  const submitShort =
    submitButton?.querySelector(".waitlist-submit__short");
  const emailInput = form.querySelector("input[type='email']");

  const setSubmitLabel = (label, shortLabel = label) => {
    if (submitFull) {
      submitFull.textContent = label;
    }
    if (submitShort) {
      submitShort.textContent = shortLabel;
    }
    if (!submitFull && !submitShort && submitButton) {
      submitButton.textContent = label;
    }
  };

  const setStatus = (message, isError = false) => {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.dataset.state = isError ? "error" : "ok";
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput?.value?.trim() || "";
    if (!email) {
      setStatus("Please enter your email.", true);
      return;
    }
    if (!WAITLIST_ENDPOINT) {
      setStatus("Waitlist is not configured yet. Please try again soon.", true);
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      setSubmitLabel("Sending...");
    }

    try {
      const response = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.error || "Something went wrong. Please try again."
        );
      }
      setStatus("Thanks! We have your email.");
      form.reset();
      if (submitButton) {
        setSubmitLabel("Joined");
      }
    } catch (error) {
      setStatus(error.message || "Something went wrong. Please try again.", true);
      if (submitButton) {
        submitButton.disabled = false;
        setSubmitLabel("Join the waitlist", "Join");
      }
    }
  });
};

if (waitlistForms.length > 0) {
  waitlistForms.forEach((form) => bindWaitlistForm(form));
}

if (ENABLE_DEBUG_CONTROLS) {
  if (seekSlider) {
    seekSlider.addEventListener("input", (event) => {
      const value = Number(event.target.value || 0);
      isScrubbing = true;
      audio.currentTime = value;
      updateSeekUi(value);
      syncLyricsToTime(value);
    });

    seekSlider.addEventListener("change", (event) => {
      const value = Number(event.target.value || 0);
      audio.currentTime = value;
      updateSeekUi(value);
      syncLyricsToTime(value);
      isScrubbing = false;
    });
  }

  audio.addEventListener("loadedmetadata", () => {
    if (seekSlider && Number.isFinite(audio.duration)) {
      seekSlider.max = `${audio.duration}`;
      seekSlider.value = `${audio.currentTime || 0}`;
    }
    updateSeekUi(audio.currentTime || 0);
  });

  audio.addEventListener("timeupdate", () => {
    if (!seekSlider || isScrubbing) {
      return;
    }
    updateSeekUi(audio.currentTime || 0);
  });
} else if (debugSeek) {
  debugSeek.style.display = "none";
}

if (ENABLE_KEYBOARD_CONTROLS) {
  window.addEventListener("keydown", (event) => {
    if (event.repeat) {
      return;
    }
    const target = event.target;
    if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) {
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
      return;
    }
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      event.preventDefault();
      const direction = event.code === "ArrowLeft" ? -1 : 1;
      const baseTime = audio.currentTime || 0;
      const duration = Number.isFinite(audio.duration)
        ? audio.duration
        : baseTime;
      const nextTime = Math.min(
        Math.max(baseTime + direction, 0),
        duration
      );
      audio.currentTime = nextTime;
      updateSeekUi(nextTime);
      syncLyricsToTime(nextTime);
    }
  });
}

const isHairMetalTrack = () =>
  tracks[currentIndex] === HAIR_METAL_TRACK && !actTwoActive;

const renderLyricLine = (lineIndex, wordIndex, clearFirst = false) => {
  if (!lyricsLine) {
    return;
  }
  if (lineClearTimer) {
    clearTimeout(lineClearTimer);
    lineClearTimer = null;
  }
  const writeLine = () => {
    lyricsLine.innerHTML = "";
    currentLineWords = [];
    const line = hairMetalLyricLines[lineIndex];
    if (!line) {
      return;
    }
    line.words.forEach((word) => {
      const span = document.createElement("span");
      span.className = "lyrics-word";
      span.textContent = word;
      lyricsLine.appendChild(span);
      currentLineWords.push(span);
    });
    updateWordClasses(wordIndex);
    lyricsLine.style.opacity = "1";
  };
  if (clearFirst) {
    lyricsLine.style.opacity = "0";
    lyricsLine.textContent = "";
    lineClearTimer = window.setTimeout(writeLine, 90);
  } else {
    writeLine();
  }
};

const updateWordClasses = (wordIndex) => {
  currentLineWords.forEach((el, index) => {
    el.classList.toggle("is-active", index === wordIndex);
    el.classList.toggle("is-past", index < wordIndex);
  });
};

const resetLyricFireworks = () => {
  finalGssBurstTriggered = false;
};

const handleLyricCue = (entry) => {
  if (
    finalGssBurstTriggered ||
    FINAL_GSS_LINE_INDEX < 0 ||
    !entry
  ) {
    return;
  }
  if (
    entry.lineIndex === FINAL_GSS_LINE_INDEX &&
    entry.wordIndex === 0 &&
    entry.word?.toLowerCase() === "game"
  ) {
    finalGssBurstTriggered = true;
    triggerFireworks();
  }
};

const startLyrics = () => {
  if (!lyricsPanel || !lyricsLine) {
    return;
  }
  if (actTwoTriggered) {
    stopLyrics({ hidePanel: false });
    return;
  }
  if (!isHairMetalTrack()) {
    lyricsPanel.style.display = "none";
    stopLyrics();
    return;
  }
  stopLyrics();
  resetLyricFireworks();
  lyricsPanel.classList.remove("is-fading");
  lyricsPanel.style.display = "block";
  currentWordIndex = -1;
  currentLineIndex = 0;
  renderLyricLine(currentLineIndex, -1);
  lyricsFrame = window.requestAnimationFrame(updateLyrics);
};

const stopLyrics = ({ hidePanel = true } = {}) => {
  if (lyricsFrame) {
    window.cancelAnimationFrame(lyricsFrame);
    lyricsFrame = null;
  }
  if (lineClearTimer) {
    clearTimeout(lineClearTimer);
    lineClearTimer = null;
  }
  if (lyricsPanel && hidePanel) {
    lyricsPanel.classList.remove("is-fading");
    lyricsPanel.style.display = "none";
  }
};

const formatSeekTime = (seconds) => {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

const updateSeekUi = (time) => {
  if (seekSlider) {
    seekSlider.value = `${time}`;
  }
  if (seekTime) {
    seekTime.textContent = formatSeekTime(time);
  }
};

const syncLyricsToTime = (time) => {
  if (!lyricsPanel || !lyricsLine || !isHairMetalTrack()) {
    return;
  }
  if (!hairMetalTimeline.length) {
    return;
  }
  if (
    FINAL_GSS_WORD_TIME !== null &&
    time < FINAL_GSS_WORD_TIME
  ) {
    finalGssBurstTriggered = false;
  }
  if (
    ACT_ONE_SHARE_TRIGGER_TIME !== null &&
    time < ACT_ONE_SHARE_TRIGGER_TIME
  ) {
    resetActOneSharePrompt();
  } else {
    maybeShowActOneSharePrompt(time);
  }
  lyricsPanel.style.display = "block";
  lyricsPanel.classList.remove("is-fading");
  let lastIndex = -1;
  for (let i = 0; i < hairMetalTimeline.length; i += 1) {
    if (time >= hairMetalTimeline[i].t) {
      lastIndex = i;
    } else {
      break;
    }
  }
  const lastLineIndex =
    lastIndex >= 0 ? hairMetalTimeline[lastIndex].lineIndex : -1;
  const nextLineIndex =
    lastLineIndex < 0
      ? 0
      : Math.min(lastLineIndex + 1, hairMetalLineMeta.length - 1);
  const nextLine = hairMetalLineMeta[nextLineIndex];
  const canPreload =
    nextLine &&
    nextLine.gapFromPrev !== null &&
    nextLine.gapFromPrev > 1;
  if (
    nextLine &&
    nextLine.start !== null &&
    canPreload &&
    time >= nextLine.start - 1 &&
    time < nextLine.start
  ) {
    currentLineIndex = nextLineIndex;
    currentWordIndex = (nextLine.firstWordIndex ?? 0) - 1;
    renderLyricLine(currentLineIndex, -1);
    return;
  }
  if (lastIndex < 0) {
    currentLineIndex = 0;
    currentWordIndex = -1;
    renderLyricLine(currentLineIndex, -1);
    return;
  }
  const entry = hairMetalTimeline[lastIndex];
  currentWordIndex = lastIndex;
  if (entry.lineIndex !== currentLineIndex) {
    currentLineIndex = entry.lineIndex;
    renderLyricLine(currentLineIndex, entry.wordIndex);
  } else {
    updateWordClasses(entry.wordIndex);
  }
};

const resetLyrics = () => {
  if (!lyricsPanel || !lyricsLine) {
    return;
  }
  resetActOneSharePrompt();
  if (actTwoTriggered) {
    return;
  }
  stopLyrics();
  resetLyricFireworks();
  currentWordIndex = -1;
  currentLineIndex = -1;
  if (isHairMetalTrack() && isPlaying) {
    lyricsPanel.classList.remove("is-fading");
    lyricsPanel.style.display = "block";
    currentLineIndex = 0;
    renderLyricLine(currentLineIndex, -1);
  } else {
    lyricsPanel.classList.remove("is-fading");
    lyricsPanel.style.display = "none";
  }
};

const updateLyrics = () => {
  if (!isPlaying || !isHairMetalTrack() || !lyricsPanel) {
    stopLyrics();
    return;
  }
  const time = audio.currentTime || 0;
  if (
    currentWordIndex >= 0 &&
    time < hairMetalTimeline[currentWordIndex]?.t
  ) {
    syncLyricsToTime(time);
    lyricsFrame = window.requestAnimationFrame(updateLyrics);
    return;
  }
  const nextLineIndex =
    currentLineIndex < 0
      ? 0
      : Math.min(
          currentLineIndex + 1,
          hairMetalLineMeta.length - 1
        );
  const nextLine = hairMetalLineMeta[nextLineIndex];
  const canPreload =
    nextLine &&
    nextLine.gapFromPrev !== null &&
    nextLine.gapFromPrev > 1;
  if (
    nextLine &&
    nextLine.start !== null &&
    canPreload &&
    time >= nextLine.start - 1 &&
    time < nextLine.start &&
    currentLineIndex !== nextLineIndex
  ) {
    currentLineIndex = nextLineIndex;
    currentWordIndex = (nextLine.firstWordIndex ?? 0) - 1;
    renderLyricLine(currentLineIndex, -1, true);
  }
  while (
    currentWordIndex + 1 < hairMetalTimeline.length &&
    time >= hairMetalTimeline[currentWordIndex + 1].t
  ) {
    currentWordIndex += 1;
    const nextWord = hairMetalTimeline[currentWordIndex];
    handleLyricCue(nextWord);
    if (nextWord.lineIndex !== currentLineIndex) {
      currentLineIndex = nextWord.lineIndex;
      renderLyricLine(currentLineIndex, nextWord.wordIndex, true);
    } else {
      updateWordClasses(nextWord.wordIndex);
    }
  }
  maybeShowActOneSharePrompt(time);
  lyricsFrame = window.requestAnimationFrame(updateLyrics);
};

if (worldbuilderAvatarVideo) {
  worldbuilderAvatarVideo.addEventListener("ended", () => {
    freezeWorldbuilderAvatarVideo();
  });
}

audio.addEventListener("ended", () => {
  const wasFirstTrack = currentIndex === 0;
  if (wasFirstTrack) {
    triggerActTwoSequence();
    revealNextTrackButton();
  }
  if (actTwoShareArmed && !actTwoShareShown) {
    actTwoShareArmed = false;
    showActTwoSharePrompt();
  }
  pickNextTrack();
  playAudio();
});

pickInitialTrack();
setAudioToggleUi(false);
resetLyrics();
resetPatchPositions();
resizeHeroTitle();
resizeFxCanvas();
window.addEventListener("resize", () => {
  window.requestAnimationFrame(resizeHeroTitle);
  window.requestAnimationFrame(resizeFxCanvas);
});
desktopQuery.addEventListener("change", resizeHeroTitle);
if (document.fonts?.ready) {
  document.fonts.ready.then(resizeHeroTitle);
}
prefersReducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    stopBackgroundMotion();
  } else if (isPlaying) {
    startBackgroundMotion();
  }
});
