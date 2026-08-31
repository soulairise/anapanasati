import './BreathRule.css'

// ============================================================
// 호흡 눈금 — 이 서비스의 서명 요소
//
// 가로로 놓인 얇은 눈금. 들숨 구간은 채워지고 날숨은 비어 있다.
// 지금 기본 패턴(4-0-6-0)이 그대로 화면의 리듬 장치가 된다.
//
// ⚠️ 이건 장식이 아니라 정보다. 폭이 초에 비례하므로 패턴을 바꾸면
//    눈금도 바뀐다. 구분선을 그리고 싶어서 만든 게 아니라,
//    숨의 길이를 보여주려고 만든 것이 마침 구분선 역할을 한다.
//
// 근거: frontend-design 스킬 —
//   "구조 장치(번호·구분선·라벨)는 내용에 대해 참인 무언가를 담아야 하며
//    장식이어서는 안 된다"
// ============================================================

const NAMES = ['들숨', '멈춤', '날숨', '멈춤']

export default function BreathRule({ phases = [4, 0, 6, 0], labels = false }) {
  const total = phases.reduce((a, b) => a + b, 0) || 1

  return (
    <div className="brule" aria-hidden={!labels}>
      <div className="brule__track">
        {phases.map((sec, i) =>
          sec === 0 ? null : (
            <span
              key={i}
              className={`brule__seg brule__seg--${i === 0 ? 'in' : i === 2 ? 'out' : 'hold'}`}
              style={{ flexGrow: sec }}
            />
          ),
        )}
      </div>
      {labels && (
        <div className="brule__labels">
          {phases.map((sec, i) =>
            sec === 0 ? null : (
              <span key={i} className="brule__label" style={{ flexGrow: sec }}>
                {NAMES[i]} {sec}초
              </span>
            ),
          )}
          <span className="brule__total">
            한 호흡 {total}초 · 분당 {(60 / total).toFixed(1).replace(/\.0$/, '')}회
          </span>
        </div>
      )}
    </div>
  )
}
