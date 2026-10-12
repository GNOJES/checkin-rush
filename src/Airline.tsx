import { useState } from 'react';
import {
  Plane,
  Search,
  UserRound,
  Clock,
  MapPin,
  Ticket,
  Headphones,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { GameState } from './game';
import { scenario, puzzles } from './scenario';
import { Back, SectionHeading, DoneMark } from './shared';
import { Send } from './Mail';
const menu = [
  { id: 'lookup', label: '예약 조회', sub: '항공사 예약번호로 내 여행 찾기', icon: Search, p: 0 },
  { id: 'booking', label: '예약 정보', sub: '승객과 항공편 상세 정보', icon: Plane },
  { id: 'name', label: '이름 정정', sub: '여행 서류와 영문 이름 맞추기', icon: UserRound, p: 1 },
  { id: 'time', label: '출발 시간 확인', sub: '공항 현지 시각으로 마감 확인', icon: Clock, p: 2 },
  { id: 'gate', label: '탑승구 확인', sub: '최신 안내로 탑승구 확인', icon: MapPin, p: 3 },
  { id: 'issue', label: '탑승권 발급', sub: '모든 확인을 마치고 출발 준비', icon: Ticket },
  { id: 'help', label: '고객센터', sub: '가상 항공사의 이용 안내', icon: Headphones },
];
export function Airline({ s, send }: { s: GameState; send: Send }) {
  const [freeInfo, setFreeInfo] = useState(false);
  const screen = s.airScreen;
  const input = (key: string) => ({
    value: s.inputs[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      send({ type: 'INPUT', key, value: e.target.value }),
    autoComplete: 'off',
    autoCapitalize: 'characters',
    spellCheck: false,
  });
  const go = (screen: string) => send({ type: 'SCREEN', screen });
  const ready = s.done.every(Boolean);
  return (
    <>
      <div className="air-brand">
        <Plane size={24} />
        <strong>
          moa<span>airlines</span>
        </strong>
        <small>모아항공</small>
      </div>
      {screen === 'menu' ? (
        <>
          <div className="air-hero">
            <span className="eyebrow">YOUR JOURNEY STARTS HERE</span>
            <h2>곧, 서울에서 만나요.</h2>
            <div>
              <span>TPE</span>
              <Plane size={20} />
              <span>SEL</span>
              <small>MA204</small>
            </div>
          </div>
          <div className="air-menu">
            {menu.map((m) => (
              <button key={m.id} aria-label={m.label} onClick={() => go(m.id)}>
                <span className="menu-icon">
                  <m.icon size={21} />
                </span>
                <span>
                  <strong>{m.label}</strong>
                  <small>{m.sub}</small>
                </span>
                {m.p !== undefined ? <DoneMark done={s.done[m.p]} /> : <ChevronRight size={17} />}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <Back label="항공사 메뉴로" onClick={() => go('menu')} />
          {screen === 'lookup' && (
            <>
              <SectionHeading
                eyebrow="01 / FIND YOUR BOOKING"
                title="내 예약 찾기"
                desc="이메일에 있는 항공사 예약번호와 승객의 영문 성을 입력하세요."
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send({ type: 'LOOKUP', code: s.inputs.code, surname: s.inputs.surname });
                }}
              >
                <label className="field">
                  항공사 예약번호
                  <input {...input('code')} placeholder="영문·숫자 6자리" />
                </label>
                <label className="field">
                  성 (Surname)
                  <input {...input('surname')} placeholder="여행 서류의 영문 성" />
                </label>
                <button className="primary wide" type="submit">
                  예약 찾기 <Search size={18} />
                </button>
              </form>
              <div className="service-card">
                <span className="eyebrow">OPTIONAL SERVICE</span>
                <h3>예약을 찾기 어려우신가요?</h3>
                <p>
                  예약 복구 대행 서비스를 접수할 수 있습니다. 예약번호 확인은 별도로 필요합니다.
                </p>
                <button className="service-button" onClick={() => send({ type: 'RECOVERY' })}>
                  예약 복구 대행 · ₩9,900
                </button>
                <small>선택 서비스 · 게임 내 비용만 기록 · 무료 조회 가능</small>
              </div>
            </>
          )}
          {screen === 'booking' &&
            (s.done[0] ? (
              <>
                <SectionHeading eyebrow="BOOKING DETAILS" title="예약을 찾았어요." />
                <div className="booking-card">
                  <span className="eyebrow">모아항공 · MA204</span>
                  <h3>타이베이 → 서울</h3>
                  <dl className="details">
                    <dt>예약번호</dt>
                    <dd>{scenario.code}</dd>
                    <dt>승객 이름</dt>
                    <dd>{s.done[1] ? scenario.name : scenario.wrongName}</dd>
                    <dt>좌석</dt>
                    <dd>12A</dd>
                    <dt>출발 예정</dt>
                    <dd>14:35 · 현지 UTC+8</dd>
                  </dl>
                </div>
                {!s.done[1] ? (
                  <div className="warning">
                    <Info size={20} />
                    <p>여행 서류와 이름이 일치하지 않아 탑승권을 발급할 수 없습니다.</p>
                  </div>
                ) : (
                  <div className="success-note">
                    <ShieldCheck size={18} /> 여행 서류와 이름이 일치합니다.
                  </div>
                )}
                <button className="primary wide" onClick={() => go(s.done[1] ? 'time' : 'name')}>
                  {s.done[1] ? '출발 시간 확인하기' : '이름 정정하기'}
                  <ChevronRight size={18} />
                </button>
              </>
            ) : (
              <>
                <SectionHeading eyebrow="BOOKING DETAILS" title="예약 조회가 필요해요." />
                <button className="primary wide" onClick={() => go('lookup')}>
                  예약 조회로 이동
                </button>
              </>
            ))}
          {screen === 'name' && (
            <>
              <SectionHeading
                eyebrow="02 / MATCH YOUR NAME"
                title="영문 이름 정정"
                desc="예약 이름과 여행 서류의 이름을 비교해 주세요."
              />
              <div className="name-compare">
                <small>현재 예약 이름</small>
                <strong>{s.done[1] ? scenario.name : scenario.wrongName}</strong>
                <span>메신저에 첨부된 여행 서류를 확인하세요.</span>
              </div>
              {!s.done[0] ? (
                <div className="warning">먼저 예약 조회를 완료해 주세요.</div>
              ) : (
                <>
                  <button className="expand" onClick={() => setFreeInfo(!freeInfo)}>
                    무료 정정 안내 읽기 <ChevronRight size={17} />
                  </button>
                  {freeInfo && (
                    <div className="free-info">
                      <b>무료로 직접 정정할 수 있어요.</b>
                      <p>
                        이 가상 게임에서는 여행 서류와 같은 성·이름을 입력하면 무료 정정이
                        가능합니다. 실제 항공사의 정책과 무관한 게임 규칙입니다.
                      </p>
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      send({ type: 'NAME', surname: s.inputs.nameSurname, given: s.inputs.given });
                    }}
                  >
                    <label className="field">
                      성 (Surname)
                      <input {...input('nameSurname')} placeholder="영문 성" />
                    </label>
                    <label className="field">
                      이름 (Given name)
                      <input {...input('given')} placeholder="영문 이름" />
                    </label>
                    <button className="primary wide" type="submit">
                      무료로 직접 정정 <ShieldCheck size={18} />
                    </button>
                    <button
                      type="button"
                      className="service-button wide"
                      onClick={() =>
                        send({
                          type: 'NAME',
                          surname: s.inputs.nameSurname,
                          given: s.inputs.given,
                          paid: true,
                        })
                      }
                    >
                      빠른 정정 · ₩19,900
                    </button>
                    <p className="app-footnote">
                      빠른 정정은 정확한 이름 입력 후 적용됩니다.
                      <br />
                      영문 이름 빠른 정정 서비스 · 선택 시 게임 내 비용 기록
                    </p>
                  </form>
                </>
              )}
            </>
          )}
          {screen === 'time' && (
            <>
              <SectionHeading
                eyebrow="03 / KNOW YOUR TIME"
                title="마감 시각 확인"
                desc="공항 현지 시각 기준, 탑승권 발급 마감은 언제인가요?"
              />
              <div className="timezone-card">
                <div>
                  <span>공항 현지</span>
                  <strong>UTC+8</strong>
                </div>
                <span>−1h</span>
                <div>
                  <span>휴대폰 · 한국</span>
                  <strong>UTC+9</strong>
                </div>
              </div>
              <p className="guide-copy">
                출발 안내 메일을 확인하세요. 출발 시각과 탑승권 발급 마감은 다릅니다.
              </p>
              <div className="choices">
                {['14:05', '15:05', '14:35'].map((v) => (
                  <button key={v} onClick={() => send({ type: 'TIME', value: v })}>
                    {v}
                    <ChevronRight size={19} />
                  </button>
                ))}
              </div>
              {s.done[2] && (
                <div className="success-note">
                  <ShieldCheck size={18} /> 공항 현지 마감 14:05 확인 완료
                </div>
              )}
            </>
          )}
          {screen === 'gate' && (
            <>
              <SectionHeading
                eyebrow="04 / FIND YOUR GATE"
                title="어느 탑승구로 갈까요?"
                desc="MA204의 최신 탑승구를 확인해 주세요."
              />
              <div className="gate-illustration">
                <MapPin size={38} />
                <span>FOLLOW THE LATEST UPDATE</span>
              </div>
              <p className="guide-copy">
                메일마다 발송 시각이 달라요. 가장 최근의 변경 안내가 현재 탑승구입니다.
              </p>
              <div className="choices gate-choices">
                {['B12', 'C08'].map((v) => (
                  <button key={v} onClick={() => send({ type: 'GATE', value: v })}>
                    {v}
                    <ChevronRight size={19} />
                  </button>
                ))}
              </div>
              {s.done[3] && (
                <div className="success-note">
                  <ShieldCheck size={18} /> 최신 탑승구 C08 확인 완료
                </div>
              )}
            </>
          )}
          {screen === 'issue' && (
            <>
              <SectionHeading
                eyebrow="READY TO GO?"
                title="탑승권 발급"
                desc="출발 전 네 가지 확인을 마쳐 주세요."
              />
              <div className="checklist">
                {puzzles.map((p, i) => (
                  <button key={p} onClick={() => go(['lookup', 'name', 'time', 'gate'][i])}>
                    <DoneMark done={s.done[i]} />
                    <span>{p}</span>
                    <small>{s.done[i] ? '확인 완료' : '확인 필요'}</small>
                  </button>
                ))}
              </div>
              <button className="primary wide" onClick={() => send({ type: 'ISSUE' })}>
                탑승권 발급하기 <Ticket size={20} />
              </button>
              <p className="app-footnote">
                {ready
                  ? '모든 준비가 끝났습니다. 즐거운 여행 되세요!'
                  : '미완료 항목을 눌러 해당 화면으로 이동하세요.'}
              </p>
            </>
          )}
          {screen === 'help' && (
            <>
              <SectionHeading eyebrow="MOA HELP DESK" title="무엇을 도와드릴까요?" />
              {[
                [
                  '예약번호가 맞는데 조회가 안 돼요',
                  '여행사 주문번호와 항공사 예약번호는 다릅니다. 결제 메일의 예약 상세에서 6자리 항공사 번호를 확인하세요.',
                ],
                [
                  '이름을 무료로 고칠 수 있나요?',
                  '이 게임의 이름 정정 메뉴에서 여행 서류와 일치하는 성·이름을 입력하면 무료로 정정할 수 있습니다. 유료 서비스는 선택사항입니다.',
                ],
                [
                  '시간은 어디 기준인가요?',
                  '항공사 안내는 공항 현지 UTC+8 기준입니다. 휴대폰은 한국 UTC+9로 1시간 빠릅니다.',
                ],
                ['탑승구 안내가 서로 달라요', '더 최근에 발송된 변경 메일을 확인해 주세요.'],
                [
                  '실제 서비스인가요?',
                  '모든 예약·서류·비용은 게임용 가상 데이터입니다. 로그인, 결제, 외부 연결은 없습니다.',
                ],
              ].map(([q, a]) => (
                <details className="faq" key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </>
          )}
        </>
      )}
      {s.notice && (
        <div className="notice" role="status">
          {s.notice}
        </div>
      )}
      <p className="app-footnote">가상의 항공사 · 실제 예약 서비스가 아닙니다.</p>
    </>
  );
}
