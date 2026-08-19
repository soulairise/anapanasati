import { useMemo } from 'react'

// ============================================================
// 수행 추이 — 히트맵 + 브레스 카운팅 정확도
//
// 설계 원칙: 끊기면 0이 되는 연속기록은 쓰지 않는다.
//   streak 리셋은 "평화를 찾으러 온 사용자가 죄책감을 안고 떠나는" 구조라는
//   보고가 있다. 대신 누적 히트맵으로 "이번 달 앉은 날"만 보여준다 — 쌓이기만 하고
//   줄지 않는다. 이건 마케팅이 아니라 교리와도 맞는다(떠났으면 알아차리고 돌아온다).
// ============================================================

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const dayKey = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`
}

export default function JournalTrend({ sessions }) {
  const { cells, satDays, counting } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstWeekday = new Date(year, month, 1).getDay()

    const done = new Set(
      sessions
        .filter((s) => {
          const d = new Date(s.created_at)
          return d.getFullYear() === year && d.getMonth() === month
        })
        .map((s) => dayKey(s.created_at)),
    )

    const list = []
    for (let i = 0; i < firstWeekday; i++) list.push(null) // 앞쪽 빈칸
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${month + 1}-${d}`
      list.push({ day: d, done: done.has(key), future: d > now.getDate() })
    }

    // 브레스 카운팅 정확도 — 최근 것이 오른쪽으로
    const counts = sessions
      .filter((s) => s.metrics && s.metrics.kind === 'counting' && typeof s.metrics.acc === 'number')
      .slice(0, 12)
      .reverse()
      .map((s) => ({ acc: s.metrics.acc, caught: s.metrics.caught ?? 0, at: s.created_at }))

    return { cells: list, satDays: done.size, counting: counts }
  }, [sessions])

  const monthName = `${new Date().getMonth() + 1}월`

  return (
    <section className="trend">
      {/* 앉은 날 — 리셋 없는 누적 */}
      <div className="trend__block">
        <div className="trend__head">
          <h2>{monthName}에 앉은 날</h2>
          <b className="trend__num">{satDays}일</b>
        </div>
        <div className="trend__grid">
          {DAY_LABELS.map((d) => (
            <span key={d} className="trend__daylabel">{d}</span>
          ))}
          {cells.map((c, i) =>
            c === null ? (
              <span key={`e${i}`} />
            ) : (
              <span
                key={c.day}
                className={`trend__cell ${c.done ? 'is-done' : ''} ${c.future ? 'is-future' : ''}`}
                title={`${c.day}일${c.done ? ' · 앉음' : ''}`}
              />
            ),
          )}
        </div>
        <p className="trend__note">
          {satDays === 0
            ? '이번 달 첫 자리를 기다리고 있습니다.'
            : '빠진 날이 있어도 지워지지 않습니다. 쌓이기만 합니다.'}
        </p>
      </div>

      {/* 브레스 카운팅 정확도 */}
      {counting.length >= 2 && (
        <div className="trend__block">
          <div className="trend__head">
            <h2>세어보기 정확도</h2>
            <b className="trend__num">{counting[counting.length - 1].acc}%</b>
          </div>
          <div className="trend__bars">
            {counting.map((c, i) => (
              <div
                key={i}
                className="trend__bar"
                title={`${c.acc}% · 스스로 알아챔 ${c.caught}회`}
              >
                <div className="trend__bar-fill" style={{ height: `${Math.max(c.acc, 3)}%` }} />
              </div>
            ))}
          </div>
          <p className="trend__note">
            최근 {counting.length}회. 숫자를 잘 맞히는 것보다, 놓친 것을 알아차린 횟수가 늘고 있는지가 중요합니다.
          </p>
        </div>
      )}
    </section>
  )
}
