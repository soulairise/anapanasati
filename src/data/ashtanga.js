// 파탄잘리 요가수트라의 아쉬탕가(여덟 개의 가지) — 요가 수행 8단계
// 초보자가 큰 그림을 이해하도록 쉬운 말로 설명. 프라나야마(4번째)가 우리 요가호흡법.

export const ASHTANGA_INTRO = {
  title: '요가의 여덟 단계, 아쉬탕가',
  sanskrit: 'Aṣṭāṅga',
  summary:
    '약 2천 년 전 현자 파탄잘리가 정리한 『요가수트라』는 요가를 여덟 단계로 안내합니다. ' +
    '몸의 자세만이 아니라, 마음가짐부터 깊은 명상까지 이어지는 하나의 길이에요. ' +
    '우리가 배울 호흡법(프라나야마)은 이 여덟 단계 중 네 번째 가지입니다.',
}

export const ASHTANGA = [
  {
    id: 1,
    name_ko: '야마',
    name_sanskrit: 'Yama',
    short: '남과의 관계에서 지키는 도리 (금계)',
    desc: '해를 끼치지 않고 바르게 살아가는 다섯 가지 태도. 요가의 출발점은 매트 위가 아니라 일상의 마음가짐이에요.',
    items: [
      { name: '아힘사', sanskrit: 'Ahiṃsā', meaning: '비폭력 — 나와 남을 해치지 않기' },
      { name: '사티야', sanskrit: 'Satya', meaning: '정직 — 진실하게 말하고 행하기' },
      { name: '아스테야', sanskrit: 'Asteya', meaning: '훔치지 않음 — 남의 것을 탐하지 않기' },
      { name: '브라흐마차리야', sanskrit: 'Brahmacarya', meaning: '절제 — 에너지를 함부로 쓰지 않기' },
      { name: '아파리그라하', sanskrit: 'Aparigraha', meaning: '무소유 — 필요 이상 붙잡지 않기' },
    ],
  },
  {
    id: 2,
    name_ko: '니야마',
    name_sanskrit: 'Niyama',
    short: '나를 가꾸는 다섯 가지 습관 (권계)',
    desc: '스스로를 돌보고 다듬는 태도. 매일의 작은 실천이 수행의 토대가 됩니다.',
    items: [
      { name: '사우차', sanskrit: 'Śauca', meaning: '청정 — 몸과 마음을 깨끗이' },
      { name: '산토샤', sanskrit: 'Santoṣa', meaning: '만족 — 지금 가진 것에 감사' },
      { name: '타파스', sanskrit: 'Tapas', meaning: '수련 — 꾸준한 정성과 열의' },
      { name: '스와디야야', sanskrit: 'Svādhyāya', meaning: '자기성찰 — 나를 공부하고 돌아보기' },
      { name: '이슈와라 프라니다나', sanskrit: 'Īśvara Praṇidhāna', meaning: '내맡김 — 더 큰 흐름에 겸손히 맡기기' },
    ],
  },
  {
    id: 3,
    name_ko: '아사나',
    name_sanskrit: 'Āsana',
    short: '자세 — 흔히 아는 요가 동작',
    desc: '원래는 "오래 편안히 앉기 위한 안정된 자세"를 뜻해요. 몸을 고르게 해 호흡과 명상을 준비합니다.',
    items: [],
  },
  {
    id: 4,
    name_ko: '프라나야마',
    name_sanskrit: 'Prāṇāyāma',
    short: '호흡 조절 — 우리 앱의 요가 호흡법 ★',
    desc:
      '들숨·날숨·멈춤을 의도적으로 다스려 생명에너지(프라나)와 마음을 조절합니다. ' +
      '바로 이 단계가 "요가 호흡법" 학습·실습의 핵심이에요.',
    items: [],
    highlight: true,
  },
  {
    id: 5,
    name_ko: '프라티야하라',
    name_sanskrit: 'Pratyāhāra',
    short: '감각 거두기',
    desc: '바깥 자극(소리·시선 등)에서 주의를 거두어 안으로 향하게 합니다. 호흡에 머무르면 자연스럽게 시작돼요.',
    items: [],
  },
  {
    id: 6,
    name_ko: '다라나',
    name_sanskrit: 'Dhāraṇā',
    short: '집중',
    desc: '하나의 대상(호흡·소리·이미지 등)에 마음을 모으는 연습입니다.',
    items: [],
  },
  {
    id: 7,
    name_ko: '디야나',
    name_sanskrit: 'Dhyāna',
    short: '명상',
    desc: '집중이 끊기지 않고 물 흐르듯 이어지는 상태. 애쓰지 않아도 알아차림이 지속됩니다.',
    items: [],
  },
  {
    id: 8,
    name_ko: '사마디',
    name_sanskrit: 'Samādhi',
    short: '삼매 · 합일',
    desc: '보는 나와 보이는 대상의 경계가 옅어지는 깊은 몰입. 요가가 가리키는 궁극의 고요함이에요.',
    items: [],
  },
]

export const getLimb = (id) => ASHTANGA.find((l) => l.id === Number(id))
