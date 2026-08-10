import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTechnique } from '../data/pranayama'
import { playYogaBreath, playYogaPulse } from '../lib/yogaSound'
import { getAudioContext } from '../lib/bowl'
import './Yoga.css'

const DURATIONS = [2, 3, 5]

// 요가 장르 색 — 따뜻한 차크라 느낌 (들숨 앰버 → 멈춤 로즈 → 날숨 인디고)
const PHASE_COLOR = {
  inhale: '#e0a15c',
  hold: '#d38aa0',
  exhale: '#7f86c2',
}
const PULSE_COLOR = '#e0955c'

// 은은한 연꽃 만다라 (천천히 회전)
function Mandala() {
  const petals = Array.from({ length: 12 })
  return (
    <svg className="yoga-mandala" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {petals.map((_, i) => (
        <ellipse
          key={i}
          cx="100"
          cy="100"
          rx="18"
          ry="60"
          fill="none"
          stroke="var(--sage-deep)"
          strokeWidth="0.8"
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="26" fill="none" stroke="var(--sage-deep)" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="var(--sage-deep)" strokeWidth="0.8" />
    </svg>
  )
}

export default function YogaPractice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = getTechnique(id)

  const [minutes, setMinutes] = useState(3)
  const [running, setRunning] = useState(false)
  const [consented, setConsented] = useState(false)
  const [soundOn, setSoundOn] = useState(true)

  const [label, setLabel] = useState('')
  const [cue, setCue] = useState('')
  const [count, setCount] = useState(0)
  const [nostril, setNostril] = useState(null)
  const [orbScale, setOrbScale] = useState(0.7)
  const [phaseColor, setPhaseColor] = useState(PHASE_COLOR.exhale)
  const [phaseDur, setPhaseDur] = useState(4)
  const [phaseKind, setPhaseKind] = useState('') // 'inhale'|'exhale' (배경 강약)
  const [elapsed, setElapsed] = useState(0)
  const [pulsePhase, setPulsePhase] = useState('')
  const [ripples, setRipples] = useState([])

  const timerRef = useRef(null)
  const stoppedRef = useRef(false)
  const soundRef = useRef(null)
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn
  const rippleId = useRef(0)

  const clearTimers = () => {
    stoppedRef.current = true
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }
  const stopSound = () => {
    if (soundRef.current) {
      soundRef.current.stop(0.3)
      soundRef.current = null
    }
  }
  useEffect(() => () => {
    clearTimers()
    stopSound()
  }, [])

  if (!t) {
    return (
      <div className="page container container--narrow text-center">
        <p>기법을 찾을 수 없습니다.</p>
        <Link to="/yoga" className="btn btn--ghost">요가 호흡법으로</Link>
      </div>
    )
  }

  const mode = t.timer.mode
  const needConsent = t.timer.requireConsent && !consented

  const spawnRipple = (color) => {
    const rid = ++rippleId.current
    setRipples((rs) => [...rs, { id: rid, color }])
    setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== rid)), 5000)
  }

  const start = () => {
    stoppedRef.current = false
    getAudioContext() // 제스처 시점 오디오 활성화
    setRunning(true)
    setElapsed(0)
    if (mode === 'pulsed') runPulsed()
    else runPaced()
  }

  const stop = () => {
    clearTimers()
    stopSound()
    setRunning(false)
    setLabel('')
    setNostril(null)
    setPulsePhase('')
  }

  const finish = () => {
    stop()
    navigate(`/yoga/${id}`)
  }

  const toggleSound = () => {
    setSoundOn((v) => {
      if (v) stopSound()
      return !v
    })
  }

  // ---------- paced / alternate ----------
  const runPaced = () => {
    const seq =
      mode === 'alternate'
        ? t.timer.steps.map((s) => ({ label: s.label, sec: s.sec, action: s.action, nostril: s.nostril }))
        : t.timer.phases
            .filter((p) => p.sec > 0)
            .map((p) => ({ label: p.label, sec: p.sec, action: p.key, cue: p.cue }))

    let idx = 0
    let remain = seq[0].sec
    let elapsedLocal = 0

    const applyStep = (step) => {
      setLabel(step.label)
      setCue(step.cue || '')
      setNostril(step.nostril || null)
      setPhaseDur(step.sec)
      const color = PHASE_COLOR[step.action] || PHASE_COLOR.hold
      setPhaseColor(color)
      setPhaseKind(step.action === 'inhale' || step.action === 'exhale' ? step.action : '')
      if (step.action === 'inhale') setOrbScale(1.35)
      else if (step.action === 'exhale') setOrbScale(0.6)
      // 사운드 + 물결
      stopSound()
      if (step.action === 'inhale' || step.action === 'exhale') spawnRipple(color)
      if (soundOnRef.current && (step.action === 'inhale' || step.action === 'exhale' || step.action === 'hold')) {
        soundRef.current = playYogaBreath(step.action, step.sec)
      }
    }

    applyStep(seq[0])
    setCount(remain)

    timerRef.current = setInterval(() => {
      if (stoppedRef.current) return
      remain -= 1
      elapsedLocal += 1
      setElapsed(elapsedLocal)
      if (remain <= 0) {
        idx = (idx + 1) % seq.length
        remain = seq[idx].sec
        applyStep(seq[idx])
      }
      setCount(remain)
      if (elapsedLocal >= minutes * 60) finish()
    }, 1000)
  }

  // ---------- pulsed ----------
  const runPulsed = () => {
    const { pulseSec, pulses, rounds, restSec } = t.timer
    setPhaseColor(PULSE_COLOR)
    setPhaseKind('inhale')

    const runRound = (r) => {
      if (stoppedRef.current) return
      setPulsePhase('pulsing')
      setLabel(`${r}라운드 · 강한 호흡`)
      setPhaseDur(pulseSec)
      let c = 0
      const pulse = () => {
        if (stoppedRef.current) return
        c += 1
        setCount(c)
        setOrbScale((s) => (s > 1 ? 0.6 : 1.3))
        if (soundOnRef.current) playYogaPulse()
        if (c < pulses) timerRef.current = setTimeout(pulse, pulseSec * 1000)
        else if (r < rounds) startRest(r)
        else {
          setLabel('완료 🙏')
          setPulsePhase('done')
          setOrbScale(0.9)
        }
      }
      pulse()
    }

    const startRest = (r) => {
      setPulsePhase('resting')
      setLabel(`${r}라운드 완료 · 자연호흡으로 쉬기`)
      setPhaseColor(PHASE_COLOR.exhale)
      setPhaseKind('exhale')
      setOrbScale(0.9)
      let sec = restSec
      setCount(sec)
      const tick = () => {
        if (stoppedRef.current) return
        sec -= 1
        setCount(sec)
        if (sec > 0) timerRef.current = setTimeout(tick, 1000)
        else {
          setPhaseColor(PULSE_COLOR)
          setPhaseKind('inhale')
          runRound(r + 1)
        }
      }
      timerRef.current = setTimeout(tick, 1000)
    }

    runRound(1)
  }

  const stageVars = {
    '--phase-color': phaseColor,
    '--phase-dur': `${Math.max(phaseDur, 0.4)}s`,
  }

  return (
    <div className="page yoga-theme">
      {running && (
        <div
          className={`yoga-breath-bg ${phaseKind === 'inhale' ? 'is-inhale' : ''} ${phaseKind === 'exhale' ? 'is-exhale' : ''}`}
          style={stageVars}
        />
      )}

      <div className="container container--narrow yoga-practice">
        <header className="page-head text-center">
          <p className="eyebrow">{t.name_sanskrit}</p>
          <h1 style={{ fontSize: '1.6rem' }}>{t.name_ko}</h1>
        </header>

        {!running ? (
          <div className="text-center">
            {needConsent ? (
              <div className="warn-box" style={{ textAlign: 'left' }}>
                <p className="warn-box__title">⚠️ 시작 전 확인</p>
                <p>이런 분은 피하세요: {t.contraindications.join(' · ')}</p>
                <button className="btn btn--ghost" style={{ marginTop: '0.8rem' }} onClick={() => setConsented(true)}>
                  해당사항 없어요, 계속하기
                </button>
              </div>
            ) : (
              <>
                <p className="muted" style={{ marginBottom: '1.2rem' }}>{t.summary}</p>

                {mode !== 'pulsed' && (
                  <>
                    <p className="eyebrow">수행 시간</p>
                    <div className="pattern-picker">
                      {DURATIONS.map((m) => (
                        <button key={m} className={`pattern-chip ${minutes === m ? 'active' : ''}`} onClick={() => setMinutes(m)}>
                          {m}분
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {mode === 'pulsed' && (
                  <p className="muted">{t.timer.pulses}회 × {t.timer.rounds}라운드 (라운드 사이 {t.timer.restSec}초 휴식)</p>
                )}

                <div className="setting-row" style={{ marginTop: '1.2rem' }}>
                  <button className={`sound-toggle ${soundOn ? '' : 'is-off'}`} onClick={() => setSoundOn((v) => !v)}>
                    {soundOn ? '🔊 숨결 소리 켜짐' : '🔇 숨결 소리 꺼짐'}
                  </button>
                </div>

                <div className="breathe-controls" style={{ marginTop: '1.2rem' }}>
                  <button className="btn btn--primary" onClick={start}>호흡 시작하기</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="yoga-practice__stage">
            {nostril && nostril !== 'both' && (
              <div className="nostril-guide">
                {nostril === 'left' ? '왼쪽 콧구멍으로' : '오른쪽 콧구멍으로'}
                <span className="nostril-close">({nostril === 'left' ? '오른쪽' : '왼쪽'} 콧구멍 막기)</span>
              </div>
            )}
            {nostril === 'both' && <div className="nostril-guide">양쪽 잠시 멈춤</div>}

            {/* 만다라·물결·오브를 한 홀더에 담아 중심을 일치시킨다 */}
            <div className="yoga-orb-holder">
              <Mandala />

              <div className="yoga-ripple-layer">
                {ripples.map((r) => (
                  <div key={r.id} className="yoga-ripple" style={{ '--ripple-color': r.color }}>
                    <span /><span /><span />
                  </div>
                ))}
              </div>

              <div className="yoga-orb" style={{ ...stageVars, transform: `scale(${orbScale})` }}>
                <span>{count}</span>
              </div>
            </div>

            <div className="yoga-phase-label">{label}</div>
            {cue && <div className="yoga-cue">{cue}</div>}
            {mode === 'pulsed' && pulsePhase === 'pulsing' && (
              <div className="breath-timer">{count} / {t.timer.pulses}회</div>
            )}
            {mode !== 'pulsed' && (
              <div className="breath-timer">{Math.floor(elapsed / 60)}분 {elapsed % 60}초 / {minutes}분</div>
            )}

            <div className="breathe-controls" style={{ marginTop: '1.5rem' }}>
              <button className={`sound-toggle ${soundOn ? '' : 'is-off'}`} onClick={toggleSound}>
                {soundOn ? '🔊' : '🔇'}
              </button>
              <button className="btn btn--ghost" onClick={stop}>멈추기</button>
              <button className="btn btn--primary" onClick={finish}>마치기</button>
            </div>
          </div>
        )}

        <div className="text-center" style={{ marginTop: '1.5rem' }}>
          <Link to={`/yoga/${id}`} className="faint">← {t.name_ko} 상세로</Link>
        </div>
      </div>
    </div>
  )
}
