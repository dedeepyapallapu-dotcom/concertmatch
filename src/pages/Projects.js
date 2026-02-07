import React, { useEffect, useMemo, useState } from 'react';
import { Card, Container, Row, Col, Badge, Spinner, Button } from 'react-bootstrap';
import '../shared-styling.css';

export default function Projects() {
  const cityQuery = 'Austin,TX';

  // --- templated users (fake for now) ---
  const demoUsers = [
    { name: 'Alex M.', campus: 'UT Austin', tags: ['Indie', 'Chill'], match: 94 },
    { name: 'Jordan K.', campus: 'UT Austin', tags: ['Hip-hop', 'Extrovert'], match: 89 },
    { name: 'Sam T.', campus: 'UT Austin', tags: ['R&B', 'Vibes'], match: 86 },
    { name: 'Riley P.', campus: 'UT Austin', tags: ['Pop', 'Adventurous'], match: 82 },
    { name: 'Casey W.', campus: 'UT Austin', tags: ['Electronic', 'Introvert'], match: 79 },
  ];

  // --- concerts state ---
  const [page, setPage] = useState(1); // 1-based
  const [events, setEvents] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [endReached, setEndReached] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [pageCache, setPageCache] = useState({});

  const safeText = (v) => {
    if (!v) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (Array.isArray(v)) return v.filter(Boolean).join(', ');
    if (typeof v === 'object') {
      if (v.when) return String(v.when);
      if (v.start_date) return String(v.start_date);
      if (v.start_time) return String(v.start_time);
      if (v.name) return String(v.name);
      if (v.formatted_address) return String(v.formatted_address);
      if (v.address) return safeText(v.address);
      return '';
    }
    return '';
  };

  const pickWhen = (ev) => safeText(ev?.date) || safeText(ev?.when) || '';
  const pickVenue = (ev) => safeText(ev?.venue);
  const pickLocation = (ev) =>
    safeText(ev?.address) || safeText(ev?.location) || safeText(ev?.event_location) || '';
  const pickImage = (ev) => ev?.thumbnail || ev?.image || '';
  const pickLink = (ev) => {
    if (typeof ev?.link === 'string') return ev.link;
    if (Array.isArray(ev?.ticket_info) && ev.ticket_info[0]?.link) return ev.ticket_info[0].link;
    return '';
  };

  const normalizeEvents = (rawEvents) => {
    return (rawEvents || []).map((ev, idx) => {
      const title = safeText(ev?.title) || 'Concert';
      return {
        key: `${title}-${pickWhen(ev)}-${pickVenue(ev)}-${idx}`,
        title,
        when: pickWhen(ev),
        venue: pickVenue(ev),
        location: pickLocation(ev),
        image: pickImage(ev),
        link: pickLink(ev),
      };
    });
  };

  const fetchPage = async (p) => {
    if (pageCache[p]) {
      setEvents(pageCache[p].events);
      setHasMore(pageCache[p].hasMore);
      setEndReached(pageCache[p].endReached);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const resp = await fetch(`/api/concerts?city=${encodeURIComponent(cityQuery)}&page=${p}`);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Request failed: ${resp.status}`);
      }

      const data = await resp.json();
      const normalized = normalizeEvents(data.events);

      const more = !!data.has_more && normalized.length > 0;
      const end = !more;

      setEvents(normalized);
      setHasMore(more);
      setEndReached(end);

      setPageCache((prev) => ({
        ...prev,
        [p]: { events: normalized, hasMore: more, endReached: end },
      }));
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to load concerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const cards = useMemo(() => events, [events]);

  const canPrev = page > 1;
  const canNext = hasMore && !endReached && !loading;

  const goPrev = () => { if (canPrev && !loading) setPage((p) => p - 1); };
  const goNext = () => { if (canNext) setPage((p) => p + 1); };

  return (
    <div className="page-styling concerts-page">
      <Container className="py-5 concerts-wrap">
        {/* Top hero card */}
        <div className="dash-hero">
          <div className="dash-hero-left">
            <div className="pill">● LIVE MATCHING</div>
            <h1 className="dash-title">Don&apos;t have a +1?<br />We&apos;ll find you one.</h1>
            <p className="dash-sub">
              Take a quick personality quiz and get matched with people who vibe the same way.
              Because music&apos;s better together.
            </p>
            <button className="dash-cta">Take the Vibe Check</button>
          </div>
          <div className="dash-hero-right" />
        </div>

        {/* Profile banner */}
        <div className="dash-banner">
          <div className="banner-icon">♪</div>
          <div className="banner-text">
            <div className="banner-title">Complete your Personality Profile</div>
            <div className="banner-sub">Answer quick questions so we can pair you with your ideal concert buddy.</div>
          </div>
          <div className="banner-arrow">→</div>
        </div>

        {/* People row (templated) */}
        <div className="dash-section-head">
          <div className="dash-section-title">People looking for a +1</div>
          <div className="dash-section-link">See all →</div>
        </div>

        <div className="people-row">
          {demoUsers.map((u) => (
            <div className="person-card" key={u.name}>
              <div className="person-avatar">{u.name[0]}</div>
              <div className="person-name">{u.name}</div>
              <div className="person-campus">{u.campus}</div>
              <div className="person-tags">
                {u.tags.map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
              <div className="person-match">{u.match}%</div>
              <div className="person-match-sub">VIBE MATCH</div>
            </div>
          ))}
        </div>

        {/* Upcoming concerts */}
        <div className="dash-section-head" style={{ marginTop: '32px' }}>
          <div className="dash-section-title">Upcoming concerts</div>
          <div className="dash-section-link">Browse all →</div>
        </div>

        {loading && (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        )}

        {!loading && errorMsg && (
          <div className="text-center" style={{ color: 'white', opacity: 0.85 }}>
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && cards.length === 0 && (
          <div className="text-center" style={{ color: 'white', opacity: 0.85 }}>
            No concerts found.
          </div>
        )}

        {!loading && cards.length > 0 && (
          <div className="concerts-row-shell dark-shell">
            <button
              type="button"
              className="concerts-arrow dark-arrow"
              onClick={goPrev}
              disabled={!canPrev || loading}
              aria-label="Previous page"
            >
              ‹
            </button>

            <div className="concerts-row-inner dark-inner">
              <Row className="g-4">
                {cards.map((c) => (
                  <Col key={c.key} className="col-3-per-row">
                    <Card className="concert-card dark-card h-100">
                      {c.image ? (
                        <Card.Img
                          variant="top"
                          src={c.image}
                          alt={c.title}
                          className="concert-card-img"
                        />
                      ) : (
                        <div className="concert-card-img placeholder" />
                      )}

                      <Card.Body className="concert-card-body">
                        <Card.Title className="concert-title">
                          {c.link ? (
                            <a href={c.link} target="_blank" rel="noreferrer" className="concert-title-link dark-link">
                              {c.title}
                            </a>
                          ) : (
                            c.title
                          )}
                        </Card.Title>

                        {c.when && (
                          <div className="concert-badge-row">
                            <Badge bg="secondary">{c.when}</Badge>
                          </div>
                        )}

                        {c.venue && (
                          <Card.Text className="concert-venue">
                            <strong>{c.venue}</strong>
                          </Card.Text>
                        )}

                        {c.location && <Card.Text className="concert-location">{c.location}</Card.Text>}

                        <div style={{ marginTop: '14px' }}>
                          <button className="find-btn">Find a +1</button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <button
              type="button"
              className="concerts-arrow dark-arrow"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}

        {!loading && cards.length > 0 && (
          <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
            <Button variant="outline-light" onClick={goPrev} disabled={!canPrev}>
              Prev
            </Button>

            <Button variant="outline-light" disabled>
              Page {page}
            </Button>

            <Button variant="outline-light" onClick={goNext} disabled={!canNext}>
              Next
            </Button>
          </div>
        )}

        {!loading && cards.length > 0 && endReached && (
          <div className="text-center mt-3" style={{ color: 'white', opacity: 0.75 }}>
            You&apos;ve reached the end.
          </div>
        )}
      </Container>
    </div>
  );
}
