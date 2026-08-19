import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPractice, buildMettaTimeline } from '../data/metta'
import { getAudioContext } from '../lib/bowl'
import { playBell, playSoftChime, playClosingBell } from '../lib/vipassanaSound'
import { useWakeLock, wakeLockSupported } from '../lib/useWakeLock'
import './Metta.css'

const TICK_MS = 120

export default function MettaSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = getPractice(id)

  const [phase, setPhase] = useState('setup') // setup | running | done
  const [minutes, setMinutes] = useState(p?.durations?.[0] ?? 10)
  const [soundOn, setSoundOn] = useState(true)
  const [eyesClosedOn, setEyesClosedOn] = useState(true)
  const [dimmed, setDimmed] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const timerRef = useRef(null)
  const startedAtRef = useRef(0)
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn
  const lastTargetRef = useRef(-1)

  const totalSec = minutes * 60
  const timeline = useMemo(
    () => (p ? buildMettaTimeline(p, totalSec) : []),
    [p, totalSec],
  )

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }
  useEffect(() => cleanup, [])

  useWakeLock(phase === 'running')

  // 실습을 바꿔도 같은 라우트라 컴포넌트가 재사용된다 — 초기화 필수
  useEffect(() => {
    cleanup()
    setPhase('setup')
    setElapsed(0)
    setMinutes(p?.durations?.[0] ?? 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 30초 뒤 화면을 지운다. 자애는 눈을 감고 대상을 떠올리는 수행이라 특히 잘 맞는다.
  useEffect(() => {
    if (phase !== 'running' || !eyesClosedOn) {
      setDimmed(false)
      return
    }
    const t = setTimeout(() => setDimmed(true), 30000)
    return () => clearTimeout(t)
  }, [phase, eyesClosedOn])

  if (!p) {
    return (
      <div className="page container container--narrow text-center">
        <p>실습을 찾을 수 없습니다.</p>
        <Link to="/metta" className="btn btn--ghost">마음 나누기로</Link>
      </div>
    )
  }

  const idx = timelineIndexAt(timeline, elapsed)
  const step = timeline[idx]

  const peek = () => {
    if (!dimmed) return
    setDimmed(false)
    setTimeout(() => setDimmed(true), 3000)
  }

  const finish = () => {
    cleanup()
    if (soundOnRef.current) playClosingBell()
    setPhase('done')
  }

  const start = () => {
    getAudioContext()
    window.scrollTo({ top: 0, behavior: 'instant' })
    startedAtRef.current = Date.now()
    lastTargetRef.current = -1
    setElapsed(0)
    setPhase('running')
    if (soundOn) playBell()

    timerRef.current = setInterval(() => {
      const sec = (Date.now() - startedAtRef.current) / 1000
      setElapsed(sec)

      // 대상이 바뀔 때만 종을 울린다. 문구마다 울리면 되뇜을 끊는다.
      const i = timelineIndexAt(timeline, sec)
      const t = timeline[i]
      if (t && t.isFirstOfTarget) {
        const tk = t.target.key
        if (tk !== lastTargetRef.current) {
          if (lastTargetRef.current !== -1 && soundOnRef.current) playSoftChime()
          lastTargetRef.current = tk
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

  // ---------------- 준비 ----------------
  if (phase === 'setup') {
    return (
      <div className="page metta-theme">
        <div className="container container--narrow">
          <header className="page-head text-center">
            <p className="eyebrow">{p.context}</p>
            <h1 style={{ fontSize: '1.6rem' }}>{p.title}</h1>
          </header>

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

            <div className="setting-row" style={{ marginTop: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className={`sound-toggle ${soundOn ? '' : 'is-off'}`} onClick={() => setSoundOn((v) => !v)}>
                {soundOn ? '🔔 종소리 켜짐' : '🔕 종소리 꺼짐'}
              </button>
              <button className={`sound-toggle ${eyesClosedOn ? '' : 'is-off'}`} onClick={() => setEyesClosedOn((v) => !v)}>
                {eyesClosedOn ? '😌 눈감기 모드 켜짐' : '👀 화면 계속 보기'}
              </button>
            </div>

            <p className="faint" style={{ fontSize: '0.82rem', marginTop: '0.7rem', lineHeight: 1.7 }}>
              느낌이 오지 않아도 괜찮습니다. 바라는 방향만 유지하세요.
              {eyesClosedOn && !wakeLockSupported() && (
                <><br />이 기기는 화면 켜둠을 지원하지 않아요. 자동 잠금이 켜져 있으면 소리가 멈출 수 있습니다.</>
              )}
            </p>

            <div className="breathe-controls" style={{ marginTop: '1.2rem' }}>
              <button className="btn btn--primary" onClick={start}>시작하기</button>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '1.5rem' }}>
            <Link to={`/metta/${id}`} className="faint">← {p.title} 상세로</Link>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- 마무리 ----------------
  if (phase === 'done') {
    const closing = p.attitudes?.cultivate?.closing ?? ''
    return (
      <div className="page metta-theme">
        <div className="container container--narrow">
          <div className="mt-stage">
            <p className="mt-closing">{closing}</p>
            <p className="muted text-center" style={{ marginTop: '0.5rem' }}>
              {mmss(Math.min(elapsed, totalSec))} 함께하셨습니다.
            </p>
            <div className="breathe-controls" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn--ghost" onClick={() => setPhase('setup')}>한 번 더</button>
              <button
                className="btn btn--primary"
                onClick={() =>
                  navigate('/complete', {
                    state: {
                      track: 'metta',
                      practice: id,
                      duration_sec: Math.round(Math.min(elapsed, totalSec)),
                      breath_pattern: '',
                    },
                  })
                }
              >
                일지에 남기기
              </button>
            </div>
            <div className="text-center" style={{ marginTop: '0.9rem' }}>
              <button className="faint" onClick={() => navigate('/metta')}>기록하지 않고 나가기</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- 수행 중 ----------------
  return (
    <div className="page metta-theme">
      <div className="container container--narrow">
        <div className={`mt-stage ${dimmed ? 'is-dimmed' : ''}`} onClick={peek}>
          {/* 대상이 바뀌면 크게 알려준다 — 누구를 떠올릴지가 이 수행의 전부다 */}
          <div className="mt-heart" aria-hidden="true" />
          <p key={`t${step?.target.key}`} className="mt-target-label">{step?.target.label}</p>
          <p key={`p${idx}`} className="mt-phrase">{step?.text}</p>

          <div className="mt-progress">
            {p.targets.map((k) => (
              <span key={k} className={`mt-dot ${step?.target.key === k ? 'is-now' : ''}`} />
            ))}
          </div>

          <div className="breath-timer">
            {mmss(elapsed)} / {minutes}분
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

function timelineIndexAt(timeline, sec) {
  if (!timeline.length) return 0
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (sec >= timeline[i].start) return i
  }
  return 0
}
