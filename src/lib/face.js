// ============================================================
// 해와 달 — 첫 화면의 두 얼굴
//
// 하타(haṭha)를 해(ha)와 달(tha)로 푸는 것은 하타요가 전통의 상징 해석이다.
// ⚠️ 산스크리트에서 haṭha의 문자 그대로의 뜻은 "힘·억셈"이다.
//    화면 문구에서 "하타는 해와 달이라는 뜻"이라고 단정하지 말 것.
//    요가 강사가 읽는다. "전통적으로 그렇게 풀이해 왔다"가 정확하다.
//
// 이 앱에는 이미 나디쇼다나(콧구멍 교대)가 있다. 이다(달·왼쪽)와
// 핑갈라(해·오른쪽)를 고르게 하는 수행이다. 문 앞에 세우는 해와 달은
// 장식이 아니라 앱이 이미 가르치는 것을 먼저 보여주는 것이다.
//
// 두 얼굴은 홈에서만 갈린다. 안으로 들어가면 하나가 된다 — 수슘나.
// ============================================================

const KEY = 'soomgil_face'
export const FACES = ['sun', 'moon']

// 해가 지고 뜨는 대략의 경계. 정확한 일출·일몰을 계산하지 않는다 —
// 위치 권한을 받아야 하고, 그 대가로 얻는 정확도가 이 목적에는 과하다.
const MOON_FROM = 18 // 저녁 6시부터
const MOON_TO = 6 // 아침 6시까지

export const faceByClock = (d = new Date()) => {
  const h = d.getHours()
  return h >= MOON_FROM || h < MOON_TO ? 'moon' : 'sun'
}

const readStored = () => {
  try {
    const v = localStorage.getItem(KEY)
    return FACES.includes(v) ? v : null
  } catch {
    return null
  }
}

/**
 * 어떤 얼굴로 열지 정한다. 앞선 것이 이긴다.
 *   1) 주소의 ?moon / ?sun      — nalsoom.com 이 여기로 넘어온다
 *   2) 사용자가 직접 고른 값
 *   3) 지금 시각
 *
 * 주소로 온 값은 저장한다. 달 문으로 들어온 사람이 다음에 낮에 와도
 * 그 사람이 아는 얼굴로 맞는 편이 낫다.
 */
/** 주소에 얼굴이 지정돼 있으면 그 값을, 없으면 null. */
export function faceInQuery(search = '') {
  const p = new URLSearchParams(search)
  return FACES.find((f) => p.has(f)) || null
}

export function resolveFace(search = '') {
  const fromUrl = faceInQuery(search)
  if (fromUrl) {
    storeFace(fromUrl)
    return fromUrl
  }
  return readStored() || faceByClock()
}

export function storeFace(face) {
  if (!FACES.includes(face)) return
  try {
    localStorage.setItem(KEY, face)
  } catch {
    /* noop */
  }
}
