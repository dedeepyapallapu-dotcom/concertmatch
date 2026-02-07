import React, { useEffect, useMemo, useState } from 'react';
import { Card, Container, Row, Col, Badge, Spinner, Button } from 'react-bootstrap';
import '../shared-styling.css';

export default function Projects() {
  const cityQuery = 'Austin,TX';

  const [page, setPage] = useState(1); // 1-based
  const [events, setEvents] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [endReached, setEndReached] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // cache pages so back/forward feels instant
  const [pageCache, setPageCache] = useState({}); // { [pageNumber]: { events, hasMore, endReached } }

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
    // cached?
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

      // Backend sends has_more, but we also treat "no events" as end.
      const more = !!data.has_more && normalized.length > 0;
      const end = !more; // if there isn't more, we reached end

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

  // Preload next page so Next click feels instant — but only if we have more
  useEffect(() => {
    const next = page + 1;
    if (!hasMore || pageCache[next]) return;

    fetch(`/api/concerts?city=${encodeURIComponent(cityQuery)}&page=${next}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.events)) return;
        const normalized = normalizeEvents(data.events);
        const more = !!data.has_more && normalized.length > 0;
        const end = !more;

        setPageCache((prev) => ({
          ...prev,
          [next]: { events: normalized, hasMore: more, endReached: end },
        }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore]);

  const cards = useMemo(() => events, [events]);

  const canPrev = page > 1;
  const canNext = hasMore && !endReached && !loading;

  const goPrev = () => {
    if (canPrev && !loading) setPage((p) => p - 1);
  };
  const goNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  // Page numbers underneath (windowed)
  const pageButtons = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = page + 2;
    const window = [];

    for (let p = start; p <= end; p++) {
      if (p <= page) window.push(p);
      else {
        // show future pages if we know they exist
        if (p === page + 1 && hasMore && !endReached) window.push(p);
        else if (pageCache[p]) window.push(p);
      }
    }
    return Array.from(new Set(window));
  }, [page, hasMore, endReached, pageCache]);

  return (
    <div className="page-styling concerts-page">
      <Container fluid className="py-5">
        <h1 className="mb-4 text-center">Concerts in Austin</h1>

        {loading && (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        )}

        {!loading && errorMsg && (
          <div className="text-center" style={{ color: '#282c34' }}>
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && cards.length === 0 && (
          <div className="text-center" style={{ color: '#282c34' }}>
            No concerts found.
          </div>
        )}

        {/* ARROWS + ROW WRAPPER */}
        {!loading && cards.length > 0 && (
          <div className="concerts-row-shell">
            <button
              type="button"
              className="concerts-arrow concerts-arrow-left"
              onClick={goPrev}
              disabled={!canPrev || loading}
              aria-label="Previous page"
            >
              ‹
            </button>

            <div className="concerts-row-inner">
              <Row className="g-4">
                {cards.map((c) => (
                  <Col key={c.key} className="col-5-per-row">
                    <Card className="concert-card h-100">
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
                            <a href={c.link} target="_blank" rel="noreferrer" className="concert-title-link">
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
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <button
              type="button"
              className="concerts-arrow concerts-arrow-right"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}

        {/* Page numbers underneath */}
        {!loading && cards.length > 0 && (
          <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
            <Button variant="light" onClick={goPrev} disabled={!canPrev}>
              Prev
            </Button>

            {pageButtons.map((p) => (
              <Button key={p} variant={p === page ? 'dark' : 'light'} onClick={() => setPage(p)}>
                {p}
              </Button>
            ))}

            <Button variant="light" onClick={goNext} disabled={!canNext}>
              Next
            </Button>
          </div>
        )}

        {/* End indicator */}
        {!loading && cards.length > 0 && endReached && (
          <div className="text-center mt-3" style={{ color: '#282c34', opacity: 0.8 }}>
            You’ve reached the end.
          </div>
        )}
      </Container>
    </div>
  );
}
