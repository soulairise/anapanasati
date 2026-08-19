import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getPractice,
  getAttitude,
  buildGuidedTimeline,
  buildScanSequence,
} from '../data/vipassana'
import { getAudioContext } from '../lib/bowl'
import { playBell, playSoftChime, playClosingBell, playStepTick } from '../lib/vipassanaSound'
import './Vipassana.css'

const TICK_MS = 100

/* 몸 실루엣 — 해부학적 정밀함보다 "어디쯤인지" 읽히는 것이 목적 */
function BodyFigure({ y }) {
  return (
    <div className="vp-body">
      <svg viewBox="0 0 120 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="vpGlow">
            <stop offset="0%" stopColor="var(--sage)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--sage)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="vp-body__silhouette">
          <circle cx="60" cy="32" r="19" />
          <rect x="54" y="47" width="12" height="16" rx="5" />
          <path d="M40 60 h40 a10 10 0 0 1 10 10 v52 a8 8 0 0 1 -8 8 h-44 a8 8 0 0 1 -8 -8 v-52 a10 10 0 0 1 10 -10 z" />
          <rect x="24" y="66" width="13" height="74" rx="6.5" />
          <rect x="83" y="66" width="13" height="74" rx="6.5" />
          <rect x="44" y="126" width="15" height="154" rx="7.5" />
          <rect x="61" y="126" width="15" height="154" rx="7.5" />
        </g>

        <g className="vp-body__glow" transform={`translate(0, ${y - 150})`}>
          <ellipse cx="60" cy="150" rx="60" ry="26" fill="url(#vpGlow)" />
        </g>
      </svg>
    </div>
  )
}

export default function VipassanaSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = getPractice(id)

  const [phase, setPhase] = useState('setup') // setup | running | done
  const [consented, setConsented] = useState(false)
  const [minutes, setMinutes] = useState(p?.durations?.[0] ?? 10)
  const [speedKey, setSpeedKey] = useState(p?.speeds?.[1]?.key ?? 'normal')
  const [bellMin, setBellMin] = useState(p?.bellIntervals?.[1] ?? 3)
  const [soundOn, setSoundOn] = useState(true)
  const [notingOn, setNotingOn] = useState(false)

  const [elapsed, setElapsed] = useState(0) // 초

  // 브레스 카운팅 채점.
  // Levinson et al. 2014: 1~8은 A, 9는 B. 9에서 A가 정확히 8번이었으면 맞은 묶음.
  // 핵심은 오류를 둘로 나누는 것 — 모르고 틀린 것(주의 실패)과
  // 스스로 알아채고 다시 시작한 것(마음방황을 알아차림)은 의미가 정반대다.
  const [tally, setTally] = useState({ correct: 0, miss: 0, caught: 0 })
  const cycleRef = useRef(0) // 현재 묶음에서 ○를 누른 횟수
  const [pulse, setPulse] = useState(null) // 눌렀다는 최소한의 피드백
  const [ripples, setRipples] = useState([])
  const [bellFlash, setBellFlash] = useState(false)

  const timerRef = useRef(null)
  const rippleRef = useRef(null)
  const startedAtRef = useRef(0)
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn
  const lastMarkRef = useRef(-1) // 구간·박자·종 중복 재생 방지
  const rippleId = useRef(0)

  const totalSec = minutes * 60

  // 선택값에 의존하는 시퀀스는 러닝 중 재계산되지 않도록 메모
  const timeline = useMemo(
    () => (p?.engine === 'guided' ? buildGuidedTimeline(p.script, totalSec) : null),
    [p, totalSec],
  )
  const scanSeq = useMemo(
    () => (p?.engine === 'scan' ? buildScanSequence(p.segments, p.roundTrip) : null),
    [p],
  )
  const speed = p?.speeds?.find((s) => s.key === speedKey) ?? p?.speeds?.[0]

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (rippleRef.current) {
      clearInterval(rippleRef.current)
      rippleRef.current = null
    }
  }
  useEffect(() => cleanup, [])

  // 같은 라우트 패턴(/vipassana/:id/practice)이라 실습을 바꿔도 컴포넌트가 재사용된다.
  // 초기화하지 않으면 이전 세션의 타이머가 계속 돌고, 선택값도 새 실습과 어긋난다.
  useEffect(() => {
    cleanup()
    setPhase('setup')
    setElapsed(0)
    setTally({ correct: 0, miss: 0, caught: 0 })
    cycleRef.current = 0
    setConsented(false)
    setMinutes(p?.durations?.[0] ?? 10)
    setSpeedKey(p?.speeds?.[1]?.key ?? 'normal')
    setBellMin(p?.bellIntervals?.[1] ?? 3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!p) {
    return (
      <div className="page container container--narrow text-center">
        <p>실습을 찾을 수 없습니다.</p>
        <Link to="/vipassana" className="btn btn--ghost">관찰 수행으로</Link>
      </div>
    )
  }

  const attitude = getAttitude(p, 'observe')
  const needConsent = p.requireConsent && !consented

  const spawnRipple = () => {
    const rid = ++rippleId.current
    setRipples((rs) => [...rs, rid])
    setTimeout(() => setRipples((rs) => rs.filter((r) => r !== rid)), 9000)
  }

  const finish = () => {
    cleanup()
    if (soundOnRef.current) playClosingBell()
    setPhase('done')
  }

  // 마무리 화면에서 기록으로. 관찰 수행은 "마쳤다"는 여운이 중요해서
  // 곧바로 기록 화면으로 밀지 않고, 마무리 문구를 본 뒤 선택하게 한다.
  const goRecord = () => {
    navigate('/complete', {
      state: {
        track: 'vipassana',
        practice: id,
        duration_sec: Math.round(Math.min(elapsed, totalSec)),
        // 카운팅은 숫자가 곧 결과다. 일지에서 추이를 볼 수 있게 요약을 실어 보낸다.
        breath_pattern: p.engine === 'counting' ? summaryText(countSummary()) : '',
      },
    })
  }

  // ---- 브레스 카운팅 입력 ----
  const flash = (kind) => {
    setPulse(kind)
    setTimeout(() => setPulse(null), 260)
  }
  const tapLow = () => {
    cycleRef.current += 1
    flash('low')
  }
  const tapNine = () => {
    const ok = cycleRef.current === 8
    setTally((t) => ({ ...t, correct: t.correct + (ok ? 1 : 0), miss: t.miss + (ok ? 0 : 1) }))
    cycleRef.current = 0
    flash(ok ? 'nine' : 'nine')
  }
  const tapReset = () => {
    // 세다 놓친 걸 알아차린 것. 실패가 아니라 알아차림이므로 따로 센다.
    setTally((t) => ({ ...t, caught: t.caught + 1 }))
    cycleRef.current = 0
    flash('reset')
  }

  const countSummary = () => {
    const total = tally.correct + tally.miss
    const acc = total ? Math.round((tally.correct / total) * 100) : null
    return { ...tally, total, acc }
  }

  const start = () => {
    getAudioContext() // 사용자 제스처 시점에 오디오 활성화
    // 이전 화면의 스크롤이 남아 수행 화면이 잘려 보이지 않도록.
    // index.css의 전역 scroll-behavior:smooth를 그대로 두면 애니메이션이 끼어들어
    // 시작 순간이 어수선해지므로 즉시 이동시킨다.
    window.scrollTo({ top: 0, behavior: 'instant' })
    lastMarkRef.current = -1
    startedAtRef.current = Date.now()
    setElapsed(0)
    setTally({ correct: 0, miss: 0, caught: 0 })
    cycleRef.current = 0
    setPhase('running')
    if (soundOn) playBell()
    spawnRipple()

    // 파문은 호흡과 무관하게 스스로 일어나고 사라진다
    rippleRef.current = setInterval(spawnRipple, 6000)

    timerRef.current = setInterval(() => {
      const sec = (Date.now() - startedAtRef.current) / 1000
      setElapsed(sec)

      // ---- 구간·박자 전환 시점의 소리 ----
      if (p.engine === 'guided') {
        const idx = timelineIndexAt(timeline, sec)
        if (idx !== lastMarkRef.current) {
          if (lastMarkRef.current >= 0 && soundOnRef.current) playSoftChime()
          lastMarkRef.current = idx
        }
      } else if (p.engine === 'walking') {
        const beatIdx = Math.floor(sec / speed.sec)
        if (beatIdx !== lastMarkRef.current) {
          if (soundOnRef.current) playStepTick()
          lastMarkRef.current = beatIdx
        }
      } else if (p.engine === 'open') {
        const bellIdx = Math.floor(sec / (bellMin * 60))
        if (bellIdx !== lastMarkRef.current) {
          if (lastMarkRef.current >= 0) {
            if (soundOnRef.current) playBell()
            setBellFlash(true)
            setTimeout(() => setBellFlash(false), 4000)
          }
          lastMarkRef.current = bellIdx
        }
      }

      if (sec >= totalSec) finish()
    }, TICK_MS)
  }

  const stop = () => {
    cleanup()
    setPhase('setup')
    setElapsed(0)
  }

  const mmss = (s) => `${Math.floor(s / 60)}분 ${String(Math.floor(s % 60)).padStart(2, '0')}초`

  // ---------------- 준비 화면 ----------------
  if (phase === 'setup') {
    return (
      <div className="page vipassana-theme">
        <div className="container container--narrow vp-session">
          <header className="page-head text-center">
            <p className="eyebrow">{p.context}</p>
            <h1 style={{ fontSize: '1.6rem' }}>{p.title}</h1>
          </header>

          {needConsent ? (
            <div className="vp-safety">
              <p className="vp-safety__title">⚠️ 시작 전 확인</p>
              <ul>
                {p.cautions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
                <li>버겁게 느껴지면 즉시 멈추고 눈을 뜬 뒤, 발바닥이 바닥에 닿은 감각으로 돌아옵니다.</li>
              </ul>
              <div className="text-center" style={{ marginTop: 'var(--sp-2)' }}>
                <button className="btn btn--ghost" onClick={() => setConsented(true)}>
                  확인했어요, 계속하기
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="muted" style={{ marginBottom: '1.4rem' }}>{p.summary}</p>

              <p className="eyebrow">수행 시간</p>
              <div className="pattern-picker">
                {p.durations.map((m) => (
                  <button
                    key={m}
                    className={`pattern-chip ${minutes === m ? 'active' : ''}`}
                    onClick={() => setMinutes(m)}
                  >
                    {m}분
                  </button>
                ))}
              </div>

              {p.engine === 'walking' && (
                <>
                  <p className="eyebrow" style={{ marginTop: '1.3rem' }}>걷는 속도</p>
                  <div className="pattern-picker">
                    {p.speeds.map((s) => (
                      <button
                        key={s.key}
                        className={`pattern-chip ${speedKey === s.key ? 'active' : ''}`}
                        onClick={() => setSpeedKey(s.key)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {p.engine === 'open' && (
                <>
                  <p className="eyebrow" style={{ marginTop: '1.3rem' }}>종소리 간격</p>
                  <div className="pattern-picker">
                    {p.bellIntervals.map((b) => (
                      <button
                        key={b}
                        className={`pattern-chip ${bellMin === b ? 'active' : ''}`}
                        onClick={() => setBellMin(b)}
                      >
                        {b}분마다
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="setting-row" style={{ marginTop: '1.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className={`sound-toggle ${soundOn ? '' : 'is-off'}`} onClick={() => setSoundOn((v) => !v)}>
                  {soundOn ? '🔔 종소리 켜짐' : '🔕 종소리 꺼짐'}
                </button>
                <button className={`sound-toggle ${notingOn ? '' : 'is-off'}`} onClick={() => setNotingOn((v) => !v)}>
                  {notingOn ? '🏷️ 이름표 보임' : '🏷️ 이름표 숨김'}
                </button>
              </div>

              <p className="faint" style={{ marginTop: '1rem', fontSize: '0.85rem', lineHeight: 1.7 }}>
                숨은 조절하지 마세요. 화면은 호흡의 박자를 알려주지 않습니다.
              </p>

              <div className="breathe-controls" style={{ marginTop: '1.2rem' }}>
                <button className="btn btn--primary" onClick={start}>시작하기</button>
              </div>
            </div>
          )}

          <div className="text-center" style={{ marginTop: '1.5rem' }}>
            <Link to={`/vipassana/${id}`} className="faint">← {p.title} 상세로</Link>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- 마무리 화면 ----------------
  if (phase === 'done') {
    return (
      <div className="page vipassana-theme">
        <div className="container container--narrow vp-session">
          <div className="vp-stage">
            <p className="vp-closing">{attitude.closing}</p>
            <p className="muted text-center" style={{ marginTop: '0.5rem' }}>
              {mmss(Math.min(elapsed, totalSec))} 앉으셨습니다.
            </p>

            {p.engine === 'counting' && <CountResult s={countSummary()} />}
            <div className="breathe-controls" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn--ghost" onClick={() => setPhase('setup')}>한 번 더</button>
              <button className="btn btn--primary" onClick={goRecord}>일지에 남기기</button>
            </div>
            <div className="text-center" style={{ marginTop: '0.9rem' }}>
              <button className="faint" onClick={() => navigate('/vipassana')}>
                기록하지 않고 나가기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- 수행 중 ----------------
  const remain = Math.max(0, totalSec - elapsed)

  return (
    <div className="page vipassana-theme">
      <div className="vp-water" />
      <div className="container container--narrow vp-session">
        <div className="vp-stage">
          {/* 오브와 물결을 한 홀더에 담아 중심을 일치시킨다.
              홀더 없이 stage 기준 50%로 두면 아래 텍스트 때문에 중심이 어긋난다.
              파문은 볼 것이 오브뿐인 모드에서만 — 몸 훑기·경행에는 실루엣·발이 있어
              겹치면 산만해진다. */}
          {(p.engine === 'guided' || p.engine === 'open') && (
            <div className="vp-orb-holder">
              <div className="vp-ripples">
                {ripples.map((r) => (
                  <div key={r} className="vp-ripple" />
                ))}
              </div>
              <div className="vp-orb" style={p.engine === 'open' ? { opacity: 0.55 } : undefined} />
            </div>
          )}

          {p.engine === 'guided' && <GuidedText timeline={timeline} elapsed={elapsed} />}
          {p.engine === 'open' && <OpenText flash={bellFlash} cue={attitude.cue} />}
          {p.engine === 'counting' && (
            <CountingStage pulse={pulse} onLow={tapLow} onNine={tapNine} onReset={tapReset} />
          )}
          {p.engine === 'scan' && <ScanStage seq={scanSeq} elapsed={elapsed} totalSec={totalSec} cue={attitude.cue} />}
          {p.engine === 'walking' && <WalkingStage practice={p} elapsed={elapsed} beatSec={speed.sec} />}

          {notingOn && (
            <div className="vp-noting">
              {p.noting.map((n) => (
                <span key={n} className="vp-noting-chip">{n}</span>
              ))}
            </div>
          )}

          <div className="vp-elapsed">
            {mmss(elapsed)} / {minutes}분 · 남은 시간 {mmss(remain)}
          </div>

          <div className="breathe-controls" style={{ marginTop: '1.2rem' }}>
            <button className={`sound-toggle ${soundOn ? '' : 'is-off'}`} onClick={() => setSoundOn((v) => !v)}>
              {soundOn ? '🔔' : '🔕'}
            </button>
            <button className="btn btn--ghost" onClick={stop}>멈추기</button>
            <button className="btn btn--primary" onClick={finish}>마치기</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- 엔진별 화면 ---------- */

function timelineIndexAt(timeline, sec) {
  if (!timeline) return 0
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (sec >= timeline[i].start) return i
  }
  return 0
}

/* 오브는 홀더가 그리므로 여기서는 안내문만 */
function GuidedText({ timeline, elapsed }) {
  const idx = timelineIndexAt(timeline, elapsed)
  return <p key={idx} className="vp-guide">{timeline[idx].text}</p>
}

function ScanStage({ seq, elapsed, totalSec, cue }) {
  const per = totalSec / seq.length
  const idx = Math.min(seq.length - 1, Math.floor(elapsed / per))
  const seg = seq[idx]
  const percent = Math.round(((idx + 1) / seq.length) * 100)
  return (
    <>
      <BodyFigure y={seg.y} />
      <p className="vp-part">{seg.name}</p>
      <div className="vp-scan-progress">
        <div style={{ width: `${percent}%` }} />
      </div>
      <p className="vp-guide" style={{ fontSize: '1rem', minHeight: '2.4rem' }}>{cue}</p>
    </>
  )
}

function WalkingStage({ practice, elapsed, beatSec }) {
  const beatIdx = Math.floor(elapsed / beatSec)
  const beat = practice.beats[beatIdx % 3]
  const rightFoot = Math.floor(beatIdx / 3) % 2 === 1
  return (
    <>
      <div className="vp-feet">
        <div className={`vp-foot ${!rightFoot ? `is-active beat-${beat.key}` : ''}`} />
        <div className={`vp-foot ${rightFoot ? `is-active beat-${beat.key}` : ''}`} />
      </div>
      <p className="vp-beat">{beat.label}</p>
      <p className="vp-beat-hint">{beat.hint}</p>
      <p className="faint" style={{ fontSize: '0.85rem' }}>
        {rightFoot ? '오른발' : '왼발'}
      </p>
    </>
  )
}

function OpenText({ flash, cue }) {
  return flash ? (
    <p className="vp-bell-flash">지금 무엇이 알아차려지고 있나요?</p>
  ) : (
    <p className="vp-open-hint">{cue}</p>
  )
}

/* ---------- 브레스 카운팅 ---------- */

// 화면에 숫자를 띄우지 않는다. 세는 일은 사용자 마음이 해야 하고,
// 화면이 세어주면 측정 자체가 무의미해진다. 눌렀다는 최소한의 반응만 준다.
function CountingStage({ pulse, onLow, onNine, onReset }) {
  return (
    <div className="vp-count">
      <button
        type="button"
        className={`vp-count__low ${pulse === 'low' ? 'is-tap' : ''}`}
        onClick={onLow}
        aria-label="하나에서 여덟"
      >
        <span className="vp-count__mark">○</span>
        <span className="vp-count__hint">하나 ~ 여덟</span>
      </button>

      <button
        type="button"
        className={`vp-count__nine ${pulse === 'nine' ? 'is-tap' : ''}`}
        onClick={onNine}
        aria-label="아홉"
      >
        <span className="vp-count__mark">●</span>
        <span className="vp-count__hint">아홉</span>
      </button>

      <button
        type="button"
        className={`vp-count__reset ${pulse === 'reset' ? 'is-tap' : ''}`}
        onClick={onReset}
      >
        놓쳤어요 · 다시 １부터
      </button>
    </div>
  )
}

// 일지에 남길 한 줄
function summaryText(s) {
  if (!s.total) return '세어보기'
  return `정확도 ${s.acc}% · ${s.correct}/${s.total}묶음 · 스스로 알아챔 ${s.caught}회`
}

function CountResult({ s }) {
  if (!s.total) {
    return (
      <p className="vp-count-result__empty">
        아직 한 묶음도 마치지 않으셨네요. 다음엔 아홉까지 한 번 세어보세요.
      </p>
    )
  }
  return (
    <div className="vp-count-result">
      <div className="vp-count-result__acc">
        <b>{s.acc}%</b>
        <span>정확도</span>
      </div>
      <div className="vp-count-result__rows">
        <div><span>맞은 묶음</span><b>{s.correct}</b></div>
        <div><span>모르고 틀림</span><b>{s.miss}</b></div>
        <div className="is-good"><span>스스로 알아챔</span><b>{s.caught}</b></div>
      </div>
      <p className="vp-count-result__note">
        {s.caught > 0
          ? `딴생각을 ${s.caught}번 스스로 잡아내셨습니다. 그 알아차림이 수행입니다.`
          : '숫자를 잘 맞히는 것이 목적이 아닙니다. 놓친 것을 알아차리는 순간이 수행입니다.'}
      </p>
    </div>
  )
}
