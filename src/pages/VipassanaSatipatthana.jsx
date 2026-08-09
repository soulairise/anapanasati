import { Link } from 'react-router-dom'
import { SATIPATTHANA } from '../data/vipassana'
import './Vipassana.css'

export default function VipassanaSatipatthana() {
  return (
    <div className="page vipassana-theme">
      <div className="container container--narrow">
        <header className="page-head">
          <p className="eyebrow">Satipaṭṭhāna · 사념처</p>
          <h1>무엇을 관찰하는가</h1>
          <p>
            관찰할 대상을 네 자리로 나눕니다. 순서에는 이유가 있어요 —
            가장 붙잡기 쉬운 몸에서 시작해, 점점 미세한 쪽으로 갑니다.
          </p>
        </header>

        {SATIPATTHANA.map((s) => (
          <section key={s.id} className="card vp-sati-item">
            <h3>{s.id}. {s.title}</h3>
            <span className="vp-sati-pali">{s.pali} · {s.hint}</span>
            <p>{s.desc}</p>

            <p className="eyebrow" style={{ marginTop: '1rem' }}>예를 들면</p>
            <ul className="vp-sati-ex">
              {s.examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>

            <span className="vp-sati-map">{s.tetrad}에 대응</span>
          </section>
        ))}

        <div className="tip-box" style={{ marginTop: 'var(--sp-4)' }}>
          <p className="eyebrow">이미 걷고 있던 길</p>
          <p>
            아나빠나사띠 16단계도 이 네 자리를 그대로 따라갑니다.
            호흡이라는 하나의 대상으로 네 자리를 모두 지나가도록 짜여 있어요.
            그래서 <Link to="/learn" style={{ borderBottom: '1px solid var(--sage)' }}>16일 여정</Link>을
            걸어오셨다면 이미 관찰 수행의 절반을 해오신 셈입니다.
          </p>
        </div>

        <div className="text-center" style={{ marginTop: 'var(--sp-4)' }}>
          <Link to="/vipassana" className="faint">← 관찰 수행으로</Link>
        </div>
      </div>
    </div>
  )
}
