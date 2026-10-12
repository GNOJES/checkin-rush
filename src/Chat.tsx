import { useEffect, useRef } from 'react';
import { Phone, Ellipsis, Paperclip } from 'lucide-react';
import { GameState } from './game';
import { replies } from './scenario';
import { Passport } from './shared';
import { Send } from './Mail';
export function Chat({
  s,
  send,
  onDocument,
}: {
  s: GameState;
  send: Send;
  onDocument: () => void;
}) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (s.asked.length)
      end.current?.scrollIntoView({ behavior: s.reduced ? 'instant' : 'smooth', block: 'nearest' });
  }, [s.asked.length, s.messages.length, s.reduced]);
  return (
    <>
      <div className="chat-title">
        <div className="friend-avatar">민</div>
        <div>
          <h2>민지</h2>
          <span>
            <i /> 온라인 · 예약 담당 친구
          </span>
        </div>
        <Phone size={18} />
        <Ellipsis size={21} />
      </div>
      <div className="chat-date">오늘 · 여행 가는 날</div>
      <div className="chat-thread">
        <div className="bubble incoming">예약 결제는 끝났어! ✈️</div>
        <div className="bubble incoming">
          메일에 적힌 큰 번호가 주문번호래. 항공사 번호는 예약 상세에 따로 있대.
        </div>
        <div className="bubble incoming">네 영문 이름 SEOJOON으로 적었는데 맞지?</div>
        <div className="bubble outgoing">이거 내 여행 서류야. 확인 부탁해!</div>
        <button className="document-attachment" aria-label="여행 서류 확대" onClick={onDocument}>
          <Passport />
          <span>
            <Paperclip size={14} /> 여행서류.svg <b>눌러서 확대 ↗</b>
          </span>
        </button>
        <span className="message-time">나 · 13:54 (공항 현지)</span>
        {s.asked.map((key) => (
          <div key={key}>
            <div className="bubble outgoing">{replies[key].question}</div>
            {s.messages.includes(key) ? (
              <div className="bubble incoming">{replies[key].answer}</div>
            ) : (
              <div className="bubble incoming typing" aria-label="민지 입력 중">
                민지가 입력 중<span>•••</span>
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="chat-options">
        <span>민지에게 물어보기</span>
        {Object.keys(replies).map((key, i) => (
          <button
            aria-label={['예약번호 물어보기', '영문 이름 확인하기', '마감 시각 물어보기'][i]}
            key={key}
            disabled={s.asked.includes(key)}
            onClick={() => send({ type: 'ASK', key })}
          >
            {['예약번호 물어보기', '영문 이름 확인하기', '마감 시각 물어보기'][i]}{' '}
            <span>{s.asked.includes(key) ? '✓' : '↗'}</span>
          </button>
        ))}
      </div>
      <p className="app-footnote">스크립트 대화 · 실제 메시지는 전송되지 않습니다.</p>
    </>
  );
}
