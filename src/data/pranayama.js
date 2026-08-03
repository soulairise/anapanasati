// 요가 호흡법(프라나야마) — 개념 + 5단계 + 기법별 콘텐츠·타이머 설정
// 초보자 친화: 산스크리트는 병기하되 쉬운 뜻풀이 우선. 아나빠나사띠(stages.js)는 별개로 보존.
//
// timer.mode:
//  - 'paced'     : phases 배열을 순환 (들숨/멈춤/날숨/멈춤 등, sec 0이면 건너뜀)
//  - 'alternate' : 콧구멍 교대(나디쇼다나) — steps 배열 순환, nostril 표시
//  - 'pulsed'    : 강한 반복 호흡(카팔라바티/바스트리카) — pulses×rounds, 라운드 사이 rest

export const PRANAYAMA_INTRO = {
  title: '요가 호흡법이란?',
  sanskrit: 'Prāṇāyāma',
  meaning: '프라나(생명에너지) + 아야마(확장·조절)',
  summary:
    '프라나야마는 호흡을 의도적으로 다스려 몸과 마음, 그리고 생명에너지의 흐름을 조절하는 요가 수련입니다. ' +
    '숨을 "있는 그대로 관찰"하는 아나빠나사띠와 달리, 프라나야마는 숨의 길이·리듬·멈춤·소리를 "적극적으로 조절"해요.',
  vsAnapanasati: {
    anapanasati: '호흡을 조작 없이 관찰 (알아차림·통찰)',
    pranayama: '호흡을 의도적으로 조절 (안정·집중·활력)',
  },
  elements: [
    { name: '뿌라카', sanskrit: 'Pūraka', meaning: '들숨' },
    { name: '레차카', sanskrit: 'Rechaka', meaning: '날숨' },
    { name: '안타라 쿰바카', sanskrit: 'Antara Kumbhaka', meaning: '들숨 후 멈춤' },
    { name: '바히야 쿰바카', sanskrit: 'Bāhya Kumbhaka', meaning: '날숨 후 멈춤' },
  ],
  posture: [
    '척추를 곧게 세운 편안한 앉은 자세(의자·바닥 모두 좋아요)',
    '어깨·턱·얼굴의 힘을 빼기',
    '지시가 없으면 코로 호흡',
    '멈춤은 무리하지 않기 — 답답하면 바로 자연호흡으로',
    '어지럽거나 불편하면 즉시 멈추고 편히 숨쉬기',
  ],
}

export const LEVELS = {
  1: { id: 1, name: '기초 이해', subtitle: '개념·자세·안전' },
  2: { id: 2, name: '토대 호흡', subtitle: '몸으로 호흡 익히기' },
  3: { id: 3, name: '균형·집중', subtitle: '리듬을 고르고 모으기' },
  4: { id: 4, name: '진정', subtitle: '신경을 가라앉히기' },
  5: { id: 5, name: '활력 (고급·주의)', subtitle: '에너지를 끌어올리기' },
}

export const TECHNIQUES = [
  // ---------- 2단계 · 토대 호흡 ----------
  {
    id: 'abdominal',
    level: 2,
    name_ko: '복식호흡',
    name_sanskrit: 'Diaphragmatic',
    difficulty: '입문',
    summary: '배로 부드럽게 숨쉬는 가장 기본이 되는 호흡. 몸의 긴장을 풀어줍니다.',
    benefits: ['긴장 완화', '부교감신경 활성(진정)', '깊은 호흡 습관의 토대'],
    how_steps: [
      '한 손은 가슴, 한 손은 배 위에 둡니다.',
      '코로 천천히 들이쉬며 배가 풍선처럼 부풀게 합니다(가슴은 거의 그대로).',
      '코로 천천히 내쉬며 배가 부드럽게 꺼지게 합니다.',
      '날숨을 들숨보다 조금 더 길게 이어갑니다.',
    ],
    ratio: '자연스럽게 (날숨을 조금 길게)',
    timer: {
      mode: 'paced',
      phases: [
        { key: 'inhale', label: '들이쉬기', sec: 4, cue: '배가 부풀도록' },
        { key: 'exhale', label: '내쉬기', sec: 6, cue: '배가 꺼지도록' },
      ],
    },
    cautions: ['특별한 금기 없음 — 누구나 안전한 기초 호흡'],
    contraindications: [],
  },
  {
    id: 'dirgha',
    level: 2,
    name_ko: '완전요가호흡',
    name_sanskrit: 'Dīrgha (3-part)',
    difficulty: '입문',
    summary: '배 → 갈비뼈 → 가슴 윗부분 순서로 폐를 가득 채우는 세 단계 깊은 호흡.',
    benefits: ['폐활량 향상', '깊은 이완', '호흡 근육 인식'],
    how_steps: [
      '들숨: 먼저 배를 채우고 → 갈비뼈(옆구리) → 가슴 윗부분까지 순서대로 채웁니다.',
      '잠시 편안히 머문 뒤,',
      '날숨: 가슴 윗부분 → 갈비뼈 → 배 순으로 천천히 비웁니다.',
      '억지로 채우지 말고 부드럽게 이어갑니다.',
    ],
    ratio: '긴 들숨 · 긴 날숨',
    timer: {
      mode: 'paced',
      phases: [
        { key: 'inhale', label: '들이쉬기', sec: 6, cue: '배→갈비→가슴 순으로' },
        { key: 'hold', label: '잠시 멈춤', sec: 2, cue: '편안히' },
        { key: 'exhale', label: '내쉬기', sec: 6, cue: '가슴→갈비→배 순으로' },
      ],
    },
    cautions: ['어지러우면 멈추고 자연호흡'],
    contraindications: [],
  },

  // ---------- 3단계 · 균형·집중 ----------
  {
    id: 'sama-vritti',
    level: 3,
    name_ko: '사마브리티 (박스호흡)',
    name_sanskrit: 'Sama Vṛtti',
    difficulty: '입문',
    summary: '들숨·멈춤·날숨·멈춤을 같은 길이로 맞추는 사각형 리듬. 마음을 고르게 합니다.',
    benefits: ['정서 안정', '집중력', '스트레스 완화'],
    how_steps: [
      '4초 들이쉬기',
      '4초 멈추기',
      '4초 내쉬기',
      '4초 멈추기 — 이 사각 리듬을 반복합니다.',
    ],
    ratio: '4-4-4-4',
    timer: {
      mode: 'paced',
      phases: [
        { key: 'inhale', label: '들이쉬기', sec: 4 },
        { key: 'hold', label: '멈추기', sec: 4 },
        { key: 'exhale', label: '내쉬기', sec: 4 },
        { key: 'hold', label: '멈추기', sec: 4 },
      ],
    },
    cautions: ['멈춤이 답답하면 시간을 줄이세요(예: 3-3-3-3)'],
    contraindications: ['고혈압·심장질환은 멈춤을 짧게 또는 생략'],
  },
  {
    id: 'nadi-shodhana',
    level: 3,
    name_ko: '나디쇼다나 (콧구멍 교대 호흡)',
    name_sanskrit: 'Nāḍī Śodhana',
    difficulty: '중급',
    summary: '한쪽 콧구멍을 막고 좌우를 번갈아 호흡해 몸의 좌우 균형을 맞춥니다.',
    benefits: ['좌우 신경 균형', '마음 안정', '집중 준비'],
    how_steps: [
      '오른손 엄지로 오른쪽 콧구멍, 약지로 왼쪽 콧구멍을 막을 준비를 합니다.',
      '오른쪽을 막고 → 왼쪽으로 들이쉽니다.',
      '양쪽 잠깐 막아 멈춘 뒤, 왼쪽을 막고 → 오른쪽으로 내쉽니다.',
      '오른쪽으로 들이쉬고 → 멈춘 뒤 → 왼쪽으로 내쉽니다. (이것이 한 사이클)',
    ],
    ratio: '4-4-4 (좌우 교대)',
    timer: {
      mode: 'alternate',
      steps: [
        { action: 'inhale', nostril: 'left', sec: 4, label: '왼쪽 들숨' },
        { action: 'hold', nostril: 'both', sec: 4, label: '멈춤' },
        { action: 'exhale', nostril: 'right', sec: 4, label: '오른쪽 날숨' },
        { action: 'inhale', nostril: 'right', sec: 4, label: '오른쪽 들숨' },
        { action: 'hold', nostril: 'both', sec: 4, label: '멈춤' },
        { action: 'exhale', nostril: 'left', sec: 4, label: '왼쪽 날숨' },
      ],
    },
    cautions: ['코가 막혔을 때는 무리하지 않기'],
    contraindications: ['멈춤이 힘들면 4-0-4로 멈춤 없이'],
  },
  {
    id: 'ujjayi',
    level: 3,
    name_ko: '웃자이 (바다소리 호흡)',
    name_sanskrit: 'Ujjāyī',
    difficulty: '중급',
    summary: '목 안쪽을 살짝 좁혀 "쏴아" 하는 파도 소리를 내며 하는 호흡. 집중과 온기를 줍니다.',
    benefits: ['집중력', '몸의 온기', '자율신경 안정'],
    how_steps: [
      '입을 다물고 코로 호흡합니다.',
      '목 안쪽(성문)을 아주 살짝 좁혀, 숨이 지나갈 때 "쏴아" 파도 같은 소리가 나게 합니다.',
      '들숨·날숨 모두 같은 소리를 유지하며 고르게 이어갑니다.',
    ],
    ratio: '5-5 (고르게)',
    timer: {
      mode: 'paced',
      phases: [
        { key: 'inhale', label: '들이쉬기', sec: 5, cue: '목에서 바다소리' },
        { key: 'exhale', label: '내쉬기', sec: 5, cue: '바다소리 유지' },
      ],
    },
    cautions: ['목에 힘을 너무 주지 않기'],
    contraindications: [],
  },

  // ---------- 4단계 · 진정 ----------
  {
    id: 'bhramari',
    level: 4,
    name_ko: '브라마리 (벌소리 호흡)',
    name_sanskrit: 'Bhrāmarī',
    difficulty: '입문',
    summary: '날숨에 "음~" 하는 벌 소리를 내며 하는 호흡. 불안과 긴장을 가라앉힙니다.',
    benefits: ['불안·긴장 완화', '마음 진정', '수면 도움'],
    how_steps: [
      '편안히 앉아 눈을 감습니다. (원하면 손가락으로 귀를 살짝 막습니다)',
      '코로 부드럽게 들이쉽니다.',
      '내쉬며 낮은 "음~~" 소리를 벌처럼 길게 냅니다.',
      '소리의 진동이 머리·가슴에 퍼지는 것을 느낍니다.',
    ],
    ratio: '4-길게 (허밍 날숨)',
    timer: {
      mode: 'paced',
      phases: [
        { key: 'inhale', label: '들이쉬기', sec: 4, cue: '부드럽게' },
        { key: 'exhale', label: '내쉬기 (음~)', sec: 8, cue: '벌소리 허밍' },
      ],
    },
    cautions: ['귀에 통증이 있으면 귀를 막지 않기'],
    contraindications: [],
  },
  {
    id: 'sheetali',
    level: 4,
    name_ko: '시탈리 (냉각 호흡)',
    name_sanskrit: 'Śītalī',
    difficulty: '입문',
    summary: '혀를 말아 입으로 시원하게 들이쉬고 코로 내쉬는 호흡. 열을 식히고 진정시킵니다.',
    benefits: ['몸의 열 식힘', '진정·이완', '갈증·긴장 완화'],
    how_steps: [
      '혀를 통처럼 살짝 말아 입 밖으로 내밉니다. (말리지 않으면 이 사이로 — 시트카리)',
      '말린 혀 사이로 시원한 공기를 천천히 들이쉽니다.',
      '입을 다물고 코로 천천히 내쉽니다.',
    ],
    ratio: '4-6 (입들숨·코날숨)',
    timer: {
      mode: 'paced',
      phases: [
        { key: 'inhale', label: '들이쉬기 (입)', sec: 4, cue: '혀 말아 시원하게' },
        { key: 'exhale', label: '내쉬기 (코)', sec: 6, cue: '천천히' },
      ],
    },
    cautions: ['추운 환경·감기·저혈압일 때는 피하기'],
    contraindications: ['저혈압', '호흡기 감염'],
  },

  // ---------- 5단계 · 활력 (고급·주의) ----------
  {
    id: 'kapalabhati',
    level: 5,
    name_ko: '카팔라바티 (정뇌 호흡)',
    name_sanskrit: 'Kapālabhāti',
    difficulty: '고급',
    summary: '배를 빠르게 수축하며 강하게 "훅" 내쉬고, 들숨은 저절로 들어오게 하는 활력 호흡.',
    benefits: ['머리 맑음·각성', '복부 활력', '에너지 상승'],
    how_steps: [
      '편안히 앉아 배에 손을 얹습니다.',
      '배를 안으로 빠르게 당기며 코로 "훅" 강하게 내쉽니다.',
      '내쉰 뒤 힘을 풀면 들숨은 저절로 들어옵니다(수동적).',
      '1초에 한 번 정도의 리듬으로 반복하고, 라운드 사이엔 자연호흡으로 쉽니다.',
    ],
    ratio: '강한 날숨 20회 × 3라운드 (사이 휴식)',
    timer: {
      mode: 'pulsed',
      pulseSec: 1,
      pulses: 20,
      rounds: 3,
      restSec: 20,
      requireConsent: true,
    },
    cautions: ['공복(식후 2시간 이후)에, 어지러우면 즉시 중단'],
    contraindications: ['임신', '고혈압', '심장질환', '녹내장', '최근 복부 수술', '생리 중', '위장 질환'],
  },
  {
    id: 'bhastrika',
    level: 5,
    name_ko: '바스트리카 (풀무 호흡)',
    name_sanskrit: 'Bhastrikā',
    difficulty: '고급',
    summary: '풀무질처럼 들숨과 날숨을 모두 강하고 빠르게 반복하는 강력한 활력 호흡.',
    benefits: ['강한 활력·열', '폐 자극', '정신 각성'],
    how_steps: [
      '편안히 앉아 척추를 세웁니다.',
      '코로 강하게 들이쉬고, 코로 강하게 내쉽니다(둘 다 힘있게).',
      '풀무질하듯 일정한 리듬으로 반복합니다.',
      '한 라운드 뒤 자연호흡으로 충분히 쉬고 다음 라운드로.',
    ],
    ratio: '강한 들숨·날숨 15회 × 3라운드 (사이 휴식)',
    timer: {
      mode: 'pulsed',
      pulseSec: 1.2,
      pulses: 15,
      rounds: 3,
      restSec: 25,
      requireConsent: true,
    },
    cautions: ['카팔라바티보다 강하므로 무리 금물, 어지러우면 즉시 중단'],
    contraindications: ['임신', '고혈압', '심장질환', '녹내장', '최근 수술', '생리 중', '호흡기 질환'],
  },
]

export const getTechnique = (id) => TECHNIQUES.find((t) => t.id === id)
export const getTechniquesByLevel = (level) => TECHNIQUES.filter((t) => t.level === level)
