// ============================================================
// 자애 (사무량심) — 네 번째 갈래
//
// 왜 필요한가:
//   아나빠나사띠·위빠사나는 "관찰"이라 건조하다. 첫 회차부터 느껴지는 것이 적어
//   입문자가 이탈하기 쉽다. 자애는 감정적 보상이 즉각적이라 그 자리를 메운다.
//   그리고 경전이 자애 수행의 이익으로 숙면을 명시한다 — 한국 시장 최대 관문(수면)에
//   억지 마케팅 없이 정통 콘텐츠로 진입하는 경로다.
//
// 태도 축에서의 자리: '계발(cultivate)'.
//   조절(요가)·집중(사마타)·관찰(위빠사나)·수용(MBSR) 어디에도 속하지 않는다.
//   없던 마음을 의도적으로 키우는 것이라 별도 태도다. (docs/ARCHITECTURE.md)
//
// engine:
//  - 'phrases' : 대상을 옮겨가며 문구를 되뇐다. 대상 × 문구의 격자를 순회한다.
// ============================================================

export const METTA_INTRO = {
  title: '자애란?',
  pali: 'Mettā',
  meaning: '조건 없이 잘되기를 바라는 마음',
  summary:
    '자애는 나와 남이 편안하기를 바라는 마음을 의도적으로 키우는 수행입니다. ' +
    '감정을 억지로 짜내는 것이 아니라, 문구를 되뇌며 그 방향으로 마음을 기울이는 훈련이에요. ' +
    '느낌이 오지 않아도 괜찮습니다. 바라는 그 자체가 수행입니다.',

  // 관찰 수행과의 차이를 먼저 풀어준다
  vsObserve: {
    observe: { label: '있는 그대로 보기', pali: '위빠사나', desc: '일어나는 것을 고치지 않고 지켜본다' },
    metta: { label: '마음을 키우기', pali: '자애 · mettā', desc: '없던 마음을 의도적으로 일으킨다' },
    note:
      '관찰이 "손대지 않는" 수행이라면, 자애는 "일부러 심는" 수행입니다. ' +
      '방향이 반대라서 서로를 보완합니다 — 건조해질 때 자애가, 감상에 젖을 때 관찰이 균형을 잡아줍니다.',
  },

  // 사무량심 — 자애는 그중 첫째
  fourImmeasurables: [
    { label: '잘되기를 바람', pali: '자 · mettā', desc: '조건 없이 편안하기를 바라는 마음' },
    { label: '아픔이 덜하기를 바람', pali: '비 · karuṇā', desc: '괴로움 앞에서 함께 아파하는 마음' },
    { label: '잘된 것을 함께 기뻐함', pali: '희 · muditā', desc: '남의 좋은 일을 시샘 없이 기뻐하는 마음' },
    { label: '흔들리지 않음', pali: '사 · upekkhā', desc: '가깝고 먼 것에 치우치지 않는 고른 마음' },
  ],

  // 경전이 말하는 이익 — 수면이 첫머리에 있다
  benefits: [
    '편안히 잠들고, 편안히 깨어남',
    '나쁜 꿈을 꾸지 않음',
    '사람들이 편하게 대함',
    '마음이 쉽게 가라앉음',
    '얼굴이 맑아짐',
  ],

  safety: {
    title: '시작하기 전에',
    items: [
      '느낌이 오지 않아도 괜찮습니다. 감정을 만들어내려 애쓰지 마세요.',
      '자기 자신에게 바라는 것이 가장 어려울 수 있습니다. 어색하면 편한 사람부터 시작하세요.',
      '힘든 사람을 떠올릴 때 화가 올라오면 무리하지 말고 그 대상을 건너뜁니다.',
      '이 앱은 의료 행위가 아니며 특정한 치료 효과를 약속하지 않습니다.',
    ],
  },
}

// 전통적인 확장 순서 — 가장 쉬운 대상에서 가장 어려운 대상으로.
// 자기 자신을 먼저 두는 것이 정석이지만, 한국 정서에서 자기 축복이 어색한 경우가 많아
// "어려우면 편한 사람부터"라는 선택지를 안내에 넣었다.
export const TARGETS = [
  { key: 'self', label: '나 자신', hint: '가장 먼저, 그리고 가장 어려운 대상', pronoun: '내가' },
  { key: 'dear', label: '고마운 사람', hint: '떠올리면 마음이 편해지는 사람', pronoun: '그분이' },
  { key: 'neutral', label: '무심한 사람', hint: '자주 보지만 아무 감정 없는 사람', pronoun: '그 사람이' },
  { key: 'difficult', label: '불편한 사람', hint: '무리하지 마세요. 어려우면 건너뜁니다', pronoun: '그 사람이', optional: true },
  { key: 'all', label: '모든 존재', hint: '경계를 두지 않고 넓혀갑니다', pronoun: '모두가' },
]

// 되뇌는 문구. 주어만 바뀌고 뒤는 같다 — 리듬이 생겨야 마음이 얹힌다.
export const PHRASES = [
  '편안하기를',
  '아프지 않기를',
  '두렵지 않기를',
  '평온하기를',
]

export const PRACTICES = [
  {
    id: 'metta-basic',
    engine: 'phrases',
    title: '나와 남에게 잘되기를',
    context: '자애 · mettā',
    difficulty: '입문',
    goals: ['sleep', 'anxiety'],
    summary: '나 자신부터 시작해 고마운 사람, 무심한 사람, 모든 존재로 마음을 넓혀갑니다.',
    targets: ['self', 'dear', 'neutral', 'all'],
    durations: [5, 10, 15],
    how_steps: [
      '편안히 앉아 숨을 몇 번 지켜봅니다.',
      '대상을 한 사람 떠올립니다. 얼굴이 흐릿해도 괜찮습니다.',
      '문구를 속으로 천천히 되뇝니다 — "편안하기를".',
      '느낌이 오지 않으면 오지 않는 대로 둡니다. 바라는 방향만 유지합니다.',
      '안내에 따라 다음 대상으로 옮겨갑니다.',
    ],
    attitudes: {
      cultivate: { cue: '느낌을 만들지 말고, 바라는 방향만 유지합니다', closing: '그 마음이 오늘 하루를 따라갑니다' },
      accept: { cue: '떠오르는 것을 밀어내지 않고 그대로 둡니다', closing: '지금 이 순간으로 돌아옵니다' },
    },
  },
  {
    id: 'metta-sleep',
    engine: 'phrases',
    title: '잠들기 전 자애',
    context: '자애 · 수면',
    difficulty: '입문',
    goals: ['sleep'],
    summary:
      '누운 채로 합니다. 경전은 자애 수행의 첫 번째 이익으로 "편안히 잠듦"을 꼽습니다. ' +
      '대상을 적게 두고 문구를 길게 되뇝니다.',
    targets: ['self', 'dear', 'all'],
    durations: [10, 15, 20],
    how_steps: [
      '누워서 몸의 무게를 침대에 완전히 맡깁니다.',
      '눈을 감고 숨이 저절로 쉬어지도록 둡니다.',
      '문구를 아주 천천히 되뇝니다. 서두르지 않습니다.',
      '중간에 잠들어도 괜찮습니다 — 그것이 목적입니다.',
    ],
    attitudes: {
      cultivate: { cue: '서두르지 말고, 문구를 길게 늘여 되뇝니다', closing: '편안히 잠드시기를' },
      accept: { cue: '잠이 오지 않아도 괜찮습니다. 누워 있는 것만으로 충분합니다', closing: '편안히 쉬시기를' },
    },
  },
]

export const getTarget = (key) => TARGETS.find((t) => t.key === key)
export const getPractice = (id) => PRACTICES.find((p) => p.id === id)

/**
 * 대상 × 문구 격자를 시간에 맞춰 펼친다.
 * 각 대상에 같은 시간을 주고, 그 안에서 문구를 순환한다.
 */
export function buildMettaTimeline(practice, totalSec) {
  const targets = practice.targets.map(getTarget).filter(Boolean)
  const perTarget = totalSec / targets.length
  const perPhrase = perTarget / PHRASES.length

  const steps = []
  targets.forEach((t, ti) => {
    PHRASES.forEach((ph, pi) => {
      steps.push({
        target: t,
        phrase: ph,
        text: `${t.pronoun} ${ph}`,
        start: ti * perTarget + pi * perPhrase,
        dur: perPhrase,
        isFirstOfTarget: pi === 0,
      })
    })
  })
  return steps
}
