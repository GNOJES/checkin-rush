import { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import {
  Plane,
  Mail as MailIcon,
  MessageCircle,
  Home,
  Lightbulb,
  Settings,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Check,
  Wifi,
  BatteryFull,
  X,
  Clock,
  Copy,
  RotateCcw,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { reducer, initialState, formatTime, airportTime, Action } from './game';
import { puzzles, hints, scenario } from './scenario';
import { Mail, Send } from './Mail';
import { Chat } from './Chat';
import { Airline } from './Airline';
import { RouteArt, Passport, BoardingPass } from './shared';
import { sound } from './sound';
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div className="modal-shade" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Tab') {
            const elements = Array.from(
              ref.current!.querySelectorAll<HTMLElement>(
                'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
              ),
            ).filter((element) => element.getClientRects().length > 0);
            const first = elements[0],
              last = elements.at(-1);
            if (document.activeElement === ref.current) {
              e.preventDefault();
              (e.shiftKey ? last : first)?.focus();
            } else if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="닫기" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export default function App() {
  const [s, dispatch] = useReducer(reducer, initialState);
  const [modal, setModal] = useState<'hints' | 'settings' | 'passport' | null>(null);
  const [banner, setBanner] = useState<'mail' | 'chat' | null>(null);
  const [copied, setCopied] = useState(false);
  const [hintPuzzle, setHintPuzzle] = useState(0);
  const scroll = useRef<HTMLDivElement>(null);
  const userActivated = useRef(false);
  const send: Send = useCallback(
    (a) => {
      if (a.type !== 'TICK' && a.type !== 'MESSAGE') {
        userActivated.current = true;
        sound('tap', s.muted);
      }
      dispatch({ ...a, now: Date.now(), session: a.session ?? s.session } as Action);
    },
    [s.session, s.muted],
  );
  const start = (mode: string) => {
    setModal(null);
    setCopied(false);
    send({ type: 'START', mode });
  };
  useEffect(() => {
    if (s.status !== 'playing') return;
    const timer = window.setInterval(
      () => dispatch({ type: 'TICK', now: Date.now(), session: s.session }),
      250,
    );
    const visible = () => dispatch({ type: 'TICK', now: Date.now(), session: s.session });
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [s.status, s.session]);
  useEffect(() => {
    setModal(null);
    if (s.status === 'playing') {
      setBanner('mail');
      sound('notify', s.muted);
      const t = setTimeout(() => setBanner(null), 6500);
      return () => clearTimeout(t);
    }
    if (userActivated.current && (s.status === 'success' || s.status === 'failure'))
      sound(s.status, s.muted);
  }, [s.status, s.session]);
  useEffect(() => {
    scroll.current?.scrollTo(0, 0);
  }, [s.app, s.mail, s.airScreen, s.status]);
  const pendingMessages = s.asked.filter((k) => !s.messages.includes(k)).join(',');
  useEffect(() => {
    if (s.status !== 'playing' || !pendingMessages) return;
    const session = s.session;
    const timers = pendingMessages
      .split(',')
      .map((key) =>
        setTimeout(() => dispatch({ type: 'MESSAGE', key, now: Date.now(), session }), 750),
      );
    return () => timers.forEach(clearTimeout);
  }, [pendingMessages, s.session, s.status]);
  useEffect(() => {
    if (s.messages.length && s.status === 'playing') {
      sound('notify', s.muted);
      if (s.app !== 'chat') {
        setBanner('chat');
        const timer = setTimeout(() => setBanner(null), 4500);
        return () => clearTimeout(timer);
      }
    }
  }, [s.messages.length, s.session]);
  const unreadClues = ['gate', 'departure', 'payment'].filter((id) => !s.read.includes(id)).length;
  const progress = s.done.filter(Boolean).length;
  const remaining = Math.max(0, 300 - s.elapsed);
  const current = Math.max(
    0,
    s.done.findIndex((v) => !v),
  );
  const summary = `체크인까지 5분 · ${s.status === 'success' ? (s.cost ? '돈으로 해결한 여행자' : '침착한 여행자') : '공항 카페 단골'}\n${s.mode === 'practice' ? '연습 모드' : '제한시간 모드'} · 소요 ${formatTime(s.elapsed)} · 완료 ${progress}/4\n추가 지출 ₩${s.cost.toLocaleString()} · 힌트 ${s.hints.length}회 · 오답 ${s.wrong}회`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
      setModal('settings');
    }
  };
  return (
    <div className={'desktop ' + (s.reduced ? 'reduced' : '')}>
      <aside className="desktop-intro">
        <div className="wordmark">
          <Plane size={23} /> FIVE MINUTES TO CHECK IN
        </div>
        <div className="side-copy">
          <span className="eyebrow">A SMALL TRAVEL MYSTERY</span>
          <h1>
            여행은 늘,
            <br />
            예상 밖에서
            <br />
            <em>시작되니까.</em>
          </h1>
          <p>
            예약은 했고, 공항에도 왔다.
            <br />
            이제 남은 건 탑승권 한 장.
          </p>
          <div className="side-route">
            <span>TAIPEI</span>
            <div />
            <Plane size={20} />
            <div />
            <span>SEOUL</span>
          </div>
        </div>
        <small className="side-footer">
          체크인까지 5분 <span>LOCAL SINGLE-PLAYER PUZZLE</span>
        </small>
      </aside>
      <main className="phone">
        <div className="system-bar">
          <span>{airportTime(s.elapsed, 60)}</span>
          <div>
            <span>KR</span>
            <Wifi size={14} />
            <BatteryFull size={19} />
          </div>
        </div>
        {s.status === 'intro' ? (
          <div className="intro-screen">
            <div className="intro-top">
              <span className="pill">
                <span /> 인터랙티브 여행 퍼즐
              </span>
              <button
                aria-label="설정 열기"
                className="icon-button"
                onClick={() => setModal('settings')}
              >
                <Settings size={20} />
              </button>
            </div>
            <span className="eyebrow intro-eyebrow">BOARDING STARTS WITH A CLUE</span>
            <h1>
              체크인까지
              <br />
              <span>5분.</span>
            </h1>
            <p className="intro-lead">
              공항에는 도착했다.
              <br />
              그런데, 내 예약이 사라졌다?
            </p>
            <RouteArt />
            <div className="opening-note">
              <span className="small-label">14:00 · 타이베이 하늘공항</span>
              <p>
                탑승권 발급 마감까지 5분.
                <br />
                앱에는 “예약을 찾을 수 없습니다.”
                <br />
                친구는 분명 결제가 끝났다고 한다.
              </p>
            </div>
            <div className="intro-actions">
              <button className="primary wide" onClick={() => start('timed')}>
                5분 도전 시작 <ArrowUpRight size={21} />
              </button>
              <button className="secondary wide" onClick={() => start('practice')}>
                연습 모드로 둘러보기
              </button>
              <p>
                세 개의 앱. 네 개의 단서. 탑승권 한 장.
                <br />
                <span>가상 여행 게임 · 실제 결제나 예약 없음</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            <header
              className={'game-header ' + (s.mode === 'timed' && remaining <= 60 ? 'urgent' : '')}
            >
              <div>
                <Clock size={17} />
                <strong>
                  {s.mode === 'practice' ? '연습 중' : formatTime(Math.ceil(remaining))}
                </strong>
                <span>{s.mode === 'practice' ? '시간 제한 없음' : '탑승권 발급까지'}</span>
              </div>
              <span className="progress-count">{progress}/4</span>
            </header>
            <div className="progress-track">
              <div style={{ width: `${progress * 25}%` }} />
            </div>
            <div ref={scroll} className={'screen-content ' + s.app}>
              {s.status === 'playing' && (
                <>
                  {s.app === 'home' && (
                    <>
                      <div className="home-heading">
                        <span className="eyebrow">LET'S GET YOU HOME</span>
                        <h2>서울행, 준비됐나요?</h2>
                        <p>흩어진 단서를 찾아 체크인을 마치세요.</p>
                      </div>
                      <div className="home-flight">
                        <div className="home-flight-top">
                          <span>
                            <Plane size={17} /> MOA AIRLINES
                          </span>
                          <span>MA204</span>
                        </div>
                        <div className="home-route">
                          <div>
                            <strong>TPE</strong>
                            <small>타이베이</small>
                          </div>
                          <div className="plane-path">
                            <span />
                            <Plane size={24} />
                            <span />
                          </div>
                          <div>
                            <strong>SEL</strong>
                            <small>서울</small>
                          </div>
                        </div>
                        <div className="home-flight-bottom">
                          <span>
                            출발 <b>14:35</b>
                            <small>현지 UTC+8</small>
                          </span>
                          <span className="booking-status">
                            {s.done[0] ? '예약 확인 완료' : '예약 확인 필요'} <span>●</span>
                          </span>
                        </div>
                      </div>
                      <div className="local-clock">
                        <MapPin size={15} />
                        <span>
                          공항 현지 <b>{airportTime(s.elapsed)}</b> · UTC+8
                        </span>
                        <small>휴대폰보다 1시간 느려요</small>
                      </div>
                      <div className="apps-section">
                        <div className="small-heading">
                          여행 앱 <span>단서는 이 안에 있어요</span>
                        </div>
                        <div className="app-grid">
                          <button
                            aria-label="이메일 앱 열기"
                            onClick={() => send({ type: 'APP', app: 'mail' })}
                          >
                            <span className="app-icon mail-icon">
                              <MailIcon size={31} />
                              {unreadClues > 0 && <i>{unreadClues}</i>}
                            </span>
                            <b>이메일</b>
                            <small>예약과 출발 안내</small>
                          </button>
                          <button
                            aria-label="메신저 앱 열기"
                            onClick={() => send({ type: 'APP', app: 'chat' })}
                          >
                            <span className="app-icon chat-icon">
                              <MessageCircle size={31} />
                              {s.chatUnread && <i>1</i>}
                            </span>
                            <b>메신저</b>
                            <small>민지와의 대화</small>
                          </button>
                          <button
                            aria-label="모아항공 앱 열기"
                            onClick={() => send({ type: 'APP', app: 'airline' })}
                          >
                            <span className="app-icon airline-icon">
                              <Plane size={32} />
                            </span>
                            <b>모아항공</b>
                            <small>체크인 시작하기</small>
                          </button>
                        </div>
                      </div>
                      <div className="mission-card">
                        <div className="small-heading">
                          출발 전 체크리스트 <span>{progress} / 4</span>
                        </div>
                        {puzzles.map((p, i) => (
                          <button
                            key={p}
                            onClick={() => {
                              send({ type: 'APP', app: 'airline' });
                              send({
                                type: 'SCREEN',
                                screen: ['lookup', 'name', 'time', 'gate'][i],
                              });
                            }}
                          >
                            <span className={'step-number ' + (s.done[i] ? 'checked' : '')}>
                              {s.done[i] ? <Check size={14} /> : String(i + 1).padStart(2, '0')}
                            </span>
                            <span>{p}</span>
                            <small>{s.done[i] ? '완료' : '확인 필요'}</small>
                            <ChevronRight size={15} />
                          </button>
                        ))}
                      </div>
                      <div className="home-tip">
                        <Lightbulb size={19} />
                        <p>
                          막막할 땐 힌트를 열어 보세요.
                          <br />
                          <span>천천히 관찰하면 답은 모두 가까이에 있어요.</span>
                        </p>
                      </div>
                    </>
                  )}
                  {s.app === 'mail' && <Mail s={s} send={send} />}
                  {s.app === 'chat' && (
                    <Chat s={s} send={send} onDocument={() => setModal('passport')} />
                  )}
                  {s.app === 'airline' && <Airline s={s} send={send} />}
                </>
              )}
              {(s.status === 'success' || s.status === 'failure') && (
                <div className="result">
                  <span className="result-stamp">
                    {s.status === 'success' ? <Check size={25} /> : <Clock size={25} />}
                  </span>
                  <span className="eyebrow">
                    {s.status === 'success' ? 'YOU MADE IT' : 'BETTER LUCK NEXT FLIGHT'}
                  </span>
                  <h2>{s.status === 'success' ? '탑승권 발급 완료' : '탑승권 발급 마감'}</h2>
                  <p className="ending">
                    {s.status === 'success'
                      ? s.cost
                        ? '돈으로 해결한 여행자'
                        : '침착한 여행자'
                      : '공항 카페 단골'}
                  </p>
                  <p className="result-story">
                    {s.status === 'success'
                      ? '민지: “이제 진짜 끝이지? 기념품은 잊지 마!”'
                      : '민지: “일단 커피 한 잔? 다음엔 같이 확인하자.”'}
                  </p>
                  {s.status === 'success' ? (
                    <BoardingPass />
                  ) : (
                    <div className="failure-card">
                      <strong>완료한 퍼즐 {progress}/4</strong>
                      <p>놓친 단계</p>
                      {puzzles
                        .filter((_, i) => !s.done[i])
                        .map((p) => (
                          <span key={p}>{p}</span>
                        ))}
                      {progress === 4 && <span>마지막 탑승권 발급 버튼</span>}
                      <small>연습 모드에서 단서를 여유롭게 확인해 보세요.</small>
                    </div>
                  )}
                  <div className="result-stats">
                    <div>
                      <small>소요 시간</small>
                      <b>{formatTime(s.elapsed)}</b>
                    </div>
                    <div>
                      <small>추가 지출</small>
                      <b>₩{s.cost.toLocaleString()}</b>
                    </div>
                    <div>
                      <small>힌트 사용</small>
                      <b>{s.hints.length}회</b>
                    </div>
                    <div>
                      <small>오답</small>
                      <b>{s.wrong}회</b>
                    </div>
                  </div>
                  <span className="mode-label">
                    {s.mode === 'practice' ? '연습 모드' : '제한시간 모드'}
                  </span>
                  <button className="primary wide" onClick={() => start('timed')}>
                    다시 도전 <RotateCcw size={18} />
                  </button>
                  <div className="result-buttons">
                    <button className="secondary" onClick={() => start('practice')}>
                      연습 모드
                    </button>
                    <button className="secondary" onClick={copy}>
                      <Copy size={15} />
                      {copied ? '복사 완료' : '결과 요약 복사'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {s.status === 'playing' && (
              <nav className="bottom-nav">
                <button
                  className={s.app === 'home' ? 'active' : ''}
                  aria-label="홈으로"
                  onClick={() => send({ type: 'APP', app: 'home' })}
                >
                  <Home size={20} />
                  <span>홈</span>
                </button>
                <button
                  aria-label="힌트 열기"
                  onClick={() => {
                    setHintPuzzle(current);
                    setModal('hints');
                  }}
                >
                  <Lightbulb size={20} />
                  <span>힌트</span>
                </button>
                <button aria-label="음소거 전환" onClick={() => send({ type: 'MUTE' })}>
                  {s.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  <span>{s.muted ? '음소거' : '소리 켜짐'}</span>
                </button>
                <button aria-label="설정 열기" onClick={() => setModal('settings')}>
                  <Settings size={20} />
                  <span>설정</span>
                </button>
              </nav>
            )}
            {banner && s.status === 'playing' && (
              <button
                className="notification"
                onClick={() => {
                  setBanner(null);
                  send({ type: 'APP', app: banner === 'mail' ? 'mail' : 'chat' });
                  if (banner === 'mail') send({ type: 'MAIL', key: 'gate' });
                }}
              >
                <span className="notification-icon">
                  <MailIcon size={17} />
                </span>
                <span>
                  <b>{banner === 'mail' ? '모아항공 · 새 메일' : '민지 · 새 메시지'}</b>
                  <small>
                    {banner === 'mail'
                      ? 'MA204 탑승구 변경 안내가 도착했어요.'
                      : '민지가 답장을 보냈어요. 메신저에서 확인하세요.'}
                  </small>
                </span>
                <ChevronRight size={16} />
              </button>
            )}
          </>
        )}
        {modal && (
          <Modal
            title={
              modal === 'hints'
                ? '여행자를 위한 힌트'
                : modal === 'passport'
                  ? '여행 서류 확인'
                  : '설정'
            }
            onClose={() => setModal(null)}
          >
            {modal === 'passport' && (
              <div className="document-zoom">
                <Passport />
                <p>
                  이름을 예약 정보와 비교해 보세요.
                  <br />
                  가상의 여행 서류이며 실제 개인정보가 아닙니다.
                </p>
              </div>
            )}
            {modal === 'hints' && (
              <>
                <p className="modal-copy">
                  힌트를 보는 동안에도 제한시간은 진행됩니다.
                  <br />
                  열어 본 단계는 다시 읽어도 추가 집계되지 않아요.
                </p>
                <div className="hint-tabs">
                  {puzzles.map((p, i) => (
                    <button
                      className={hintPuzzle === i ? 'selected' : ''}
                      key={p}
                      onClick={() => setHintPuzzle(i)}
                    >
                      {i + 1}. {p}
                    </button>
                  ))}
                </div>
                {hints[hintPuzzle].map((hint, i) => {
                  const opened = s.hints.includes(`${hintPuzzle}-${i}`);
                  const disabled = i > 0 && !s.hints.includes(`${hintPuzzle}-${i - 1}`);
                  return (
                    <div className="hint-step" key={i}>
                      <button
                        aria-label={`${i + 1}단계 힌트`}
                        disabled={disabled}
                        onClick={() => send({ type: 'HINT', puzzle: hintPuzzle, level: i })}
                      >
                        <b>{i + 1}단계</b>
                        <span>
                          {['어디를 볼까요?', '무엇을 비교할까요?', '정답을 알려 주세요'][i]}
                        </span>
                        {opened ? <Check size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {opened && <p>{hint}</p>}
                    </div>
                  );
                })}
                <small className="app-footnote">열어 본 힌트 {s.hints.length}개</small>
              </>
            )}
            {modal === 'settings' && (
              <>
                <p className="modal-copy">내 속도에 맞춰 여행을 준비하세요.</p>
                <button className="setting-row" onClick={() => send({ type: 'MUTE' })}>
                  <span>효과음</span>
                  <b>{s.muted ? '꺼짐' : '켜짐'}</b>
                </button>
                <button className="setting-row" onClick={() => send({ type: 'REDUCE' })}>
                  <span>동작 줄이기</span>
                  <b>{s.reduced ? '켜짐' : '꺼짐'}</b>
                </button>
                {s.status === 'playing' && (
                  <>
                    <button className="secondary wide" onClick={() => start('practice')}>
                      연습 모드로 새로 시작
                    </button>
                    <small>현재 진행은 초기화됩니다.</small>
                  </>
                )}
                <p className="app-footnote">
                  가상 공항·항공사에서 진행되는 로컬 게임.
                  <br />
                  실제 로그인·결제·외부 전송이 없습니다.
                </p>
                {(s.status === 'success' || s.status === 'failure') && (
                  <label className="field">
                    복사가 안 되면 아래 내용을 직접 복사하세요.
                    <textarea readOnly value={summary} />
                  </label>
                )}
              </>
            )}
          </Modal>
        )}
      </main>
    </div>
  );
}
