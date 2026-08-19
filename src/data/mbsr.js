// ============================================================
// MBSR 8주 — 전통이 아니라 "프로그램"이다
//
// 구조상의 자리 (docs/ARCHITECTURE.md):
//   MBSR의 핵심 실습 대부분은 빌려온 것이다 — 바디스캔은 고엔카 위빠사나,
//   정좌명상은 사념처, 걷기는 경행, 마음챙김 요가는 하타 요가.
//   그래서 다섯 번째 전통으로 만들면 바디스캔·경행을 세 번 구현하게 된다.
//   대신 **시간축을 가진 커리큘럼**으로 두고, 기존 실습을 accept 태도로 빌려 쓴다.
//   고유한 것은 건포도 명상·3분 호흡 공간·7가지 태도·8주 구조뿐이다.
//
// ⚠️ 표기 원칙: 정식 MBSR은 인증 지도자의 8주 대면 프로그램이다.
//   이 앱은 "MBSR 과정"이 아니라 **"MBSR에 기반한 자율 실습"**이다. 절대 혼동시키지 않는다.
// ============================================================

export const MBSR_INTRO = {
  title: '8주 마음챙김',
  en: 'MBSR · Mindfulness-Based Stress Reduction',
  origin: '1979년 존 카밧진이 매사추세츠 의대에서 시작',
  summary:
    '불교 수행에서 종교적 맥락을 걷어내고, 스트레스를 다루는 8주 훈련으로 정리한 프로그램입니다. ' +
    '매주 주제가 있고, 그 주에 반복할 실습이 정해져 있어요. 순서대로 걸으면 됩니다.',

  // 가장 먼저 밝혀야 할 것
  // JSX는 마크다운을 렌더하지 않는다. 강조는 별표가 아니라 화면에서 처리한다.
  disclaimer:
    '정식 MBSR은 인증 지도자와 함께하는 8주 대면 과정입니다. 이 앱은 그 구조를 참고한 ' +
    '자율 실습 안내이며, 과정 수료나 자격을 대신하지 않습니다. ' +
    '치료가 필요한 상태라면 전문가와 상의해 주세요.',
  disclaimerHighlight: '자율 실습 안내',

  // 다른 갈래와의 관계 — 왜 실습이 겹쳐 보이는지 먼저 설명한다
  relation:
    '여기 나오는 바디스캔·걷기·열린 알아차림은 관찰 수행에 있는 것과 같은 실습입니다. ' +
    '다만 안내가 다릅니다 — 관찰 수행이 “머물지 않음을 본다”면, 여기서는 ' +
    '“좋다 나쁘다 판단하지 않는다”에 무게를 둡니다. 같은 동작, 다른 태도입니다.',

  weeklyRhythm: [
    '주 6일, 하루 한 번 정해진 실습',
    '3주차부터는 하루 세 번 3분 호흡 공간',
    '한 주를 다 못 채워도 다음 주로 넘어가도 됩니다',
  ],
}

// 7가지 태도 — MBSR이 가장 고유하게 기여한 부분
export const SEVEN_ATTITUDES = [
  { ko: '판단하지 않기', en: 'Non-judging', desc: '좋다 나쁘다 딱지를 붙이는 습관을 알아차립니다. 판단을 없애는 게 아니라 판단하는 줄 아는 것입니다.' },
  { ko: '참고 기다리기', en: 'Patience', desc: '나비가 되려고 고치를 억지로 열 수는 없습니다. 마음에도 제 시간이 있습니다.' },
  { ko: '처음처럼 보기', en: "Beginner's Mind", desc: '안다고 여기는 순간 보이지 않습니다. 매번 처음 보는 것처럼 대합니다.' },
  { ko: '나를 믿기', en: 'Trust', desc: '남의 지시보다 내 몸과 마음이 보내는 신호를 먼저 믿습니다.' },
  { ko: '애쓰지 않기', en: 'Non-striving', desc: '어딘가에 도달하려 하지 않습니다. 명상은 목표가 없는 유일한 활동입니다.' },
  { ko: '있는 대로 두기', en: 'Acceptance', desc: '체념이 아닙니다. 지금 이런 상태라는 것을 먼저 인정해야 무엇이든 바뀝니다.' },
  { ko: '내려놓기', en: 'Letting Go', desc: '붙잡고 싶은 것도, 밀어내고 싶은 것도 그냥 두고 봅니다.' },
]

// 실습 참조 — 새로 만들지 않고 기존 실습을 accept 태도로 연다.
// program=mbsr을 붙여야 수행일지에 MBSR로 기록된다.
const ref = (id, label, mins) => ({
  id,
  label,
  mins,
  to: `/vipassana/${id}/practice?attitude=accept&program=mbsr`,
})
const yogaRef = (id, label, mins) => ({ id, label, mins, to: `/yoga/${id}/practice` })

export const WEEKS = [
  {
    n: 1,
    theme: '자동조종에서 깨어나기',
    focus:
      '우리는 하루의 대부분을 자동으로 삽니다. 먹으면서 딴생각하고, 걸으면서 계획합니다. ' +
      '첫 주는 그 자동조종이 돌아가고 있다는 것을 알아차리는 데서 시작합니다.',
    attitude: 0, // 판단하지 않기
    practices: [ref('raisin', '건포도 한 알', 10), ref('body-scan', '바디스캔', 15)],
    homework: ['매일 바디스캔 한 번', '하루 한 끼는 첫 세 입만이라도 알아차리며 먹기'],
  },
  {
    n: 2,
    theme: '머리가 아니라 몸으로',
    focus:
      '생각은 사실이 아닙니다. 같은 일도 어떻게 지각하느냐에 따라 전혀 다른 사건이 됩니다. ' +
      '몸은 생각보다 정직해서, 몸으로 돌아오는 연습을 합니다.',
    attitude: 1, // 참고 기다리기
    practices: [ref('body-scan', '바디스캔', 15), ref('breath-noting', '호흡 알아차림', 10)],
    homework: ['매일 바디스캔', '즐거웠던 일 하나를 매일 기록하기'],
  },
  {
    n: 3,
    theme: '몸에 머물기',
    focus:
      '움직임 속에서도 알아차림이 유지되는지 봅니다. 그리고 이번 주부터 하루 세 번, ' +
      '3분 호흡 공간을 씁니다 — 긴 수행을 일상으로 옮기는 다리입니다.',
    attitude: 2, // 처음처럼 보기
    practices: [
      yogaRef('abdominal', '마음챙김 호흡 (요가)', 5),
      ref('walking', '걷기 명상', 10),
      ref('breathing-space', '3분 호흡 공간', 3),
    ],
    homework: ['하루 세 번 3분 호흡 공간 (정해진 시각에)', '불쾌했던 일 하나를 매일 기록하기'],
  },
  {
    n: 4,
    theme: '스트레스가 일어나는 자리',
    focus:
      '스트레스는 사건이 아니라 반응입니다. 몸에서 어떻게 시작되는지, 어디서 굳는지를 봅니다. ' +
      '보이면 그 앞에 틈이 생깁니다.',
    attitude: 3, // 나를 믿기
    practices: [ref('feeling-tone', '유쾌·불쾌 알아차리기', 15), ref('breathing-space', '3분 호흡 공간', 3)],
    homework: ['앉기 명상 매일', '스트레스가 올라온 순간 3분 호흡 공간 쓰기'],
  },
  {
    n: 5,
    theme: '반응 대신 대응',
    focus:
      '어려운 것을 밀어내지 않고 곁에 두는 연습입니다. 밀어낼수록 커지고, ' +
      '곁에 두면 대개 스스로 지나갑니다.',
    attitude: 5, // 있는 대로 두기
    practices: [ref('mind-states', '생각을 생각으로 보기', 15), ref('breathing-space', '3분 호흡 공간', 3)],
    homework: ['어려운 것이 올라올 때 몸 어디가 반응하는지 보기'],
  },
  {
    n: 6,
    theme: '마음챙김으로 관계 맺기',
    focus:
      '알아차림을 사람 사이로 넓힙니다. 말하기 전에 한 박자, 듣는 동안 딴 준비를 하지 않기.',
    attitude: 4, // 애쓰지 않기
    practices: [ref('open-awareness', '선택 없는 알아차림', 15), ref('breathing-space', '3분 호흡 공간', 3)],
    homework: ['어려운 대화 한 번을 관찰해 기록하기', '듣는 동안 대답을 준비하지 않아보기'],
    note: '정식 과정에서는 이 무렵 하루 종일 침묵 수련을 합니다. 반나절이라도 혼자 조용히 보내보세요.',
  },
  {
    n: 7,
    theme: '나를 돌보는 방식',
    focus:
      '무엇이 나를 채우고 무엇이 소모시키는지 봅니다. 그리고 이번 주는 안내 없이 ' +
      '스스로 실습을 골라 조합해 봅니다.',
    attitude: 6, // 내려놓기
    practices: [
      ref('body-scan', '바디스캔', 15),
      ref('open-awareness', '선택 없는 알아차림', 15),
      ref('breathing-space', '3분 호흡 공간', 3),
    ],
    homework: ['안내 없이 스스로 조합해 매일 수행', '나를 채우는 일 / 소모시키는 일 적어보기'],
  },
  {
    n: 8,
    theme: '이어가기',
    focus:
      '8주는 끝이 아니라 시작점입니다. 앞으로 무엇을, 얼마나, 언제 할지를 스스로 정합니다. ' +
      '거창한 계획보다 지킬 수 있는 작은 약속이 낫습니다.',
    attitude: 4, // 애쓰지 않기
    practices: [ref('body-scan', '바디스캔', 15), ref('breath-noting', '호흡 알아차림', 10)],
    homework: ['앞으로의 수행 계획을 한 문장으로 적기', '8주 동안 무엇이 달라졌는지 돌아보기'],
    closing: '8주를 걸으셨습니다. 여기서 멈춰도, 다시 1주로 돌아가도 좋습니다.',
  },
]

export const getWeek = (n) => WEEKS.find((w) => w.n === Number(n))

// 진도는 로그인 없이도 이어져야 한다(8주는 길고, 중간에 로그인할 수도 있다)
const KEY = 'soomgil_mbsr_progress'

export function readProgress() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { current: Number(v.current) || 1, doneWeeks: Array.isArray(v.doneWeeks) ? v.doneWeeks : [] }
  } catch {
    return { current: 1, doneWeeks: [] }
  }
}

export function setCurrentWeek(n) {
  const p = readProgress()
  localStorage.setItem(KEY, JSON.stringify({ ...p, current: Math.min(8, Math.max(1, n)) }))
}

export function toggleWeekDone(n) {
  const p = readProgress()
  const has = p.doneWeeks.includes(n)
  const doneWeeks = has ? p.doneWeeks.filter((w) => w !== n) : [...p.doneWeeks, n]
  const next = has ? p.current : Math.min(8, n + 1)
  localStorage.setItem(KEY, JSON.stringify({ current: next, doneWeeks }))
  return { current: next, doneWeeks }
}
