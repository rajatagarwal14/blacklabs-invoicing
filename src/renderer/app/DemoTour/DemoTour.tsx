/**
 * Guided demo player.
 *
 * Drives the real application through a scripted route, narrating each screen,
 * so someone can see how the tool works without being walked through it. Built
 * for BlackLabs sales demos and client onboarding.
 *
 * Only mounts when VITE_DEMO_TOUR is on, so a client's production instance
 * never ships it.
 *
 * The panel is deliberately non-modal and sits in a corner: the app stays
 * usable underneath, and a viewer can take over mid-tour, which is normally
 * the moment a demo becomes interesting.
 */
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { Box, IconButton, LinearProgress, Paper, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useState, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BRAND } from '../../shared/config/brand';
import { TOUR_STEPS } from './steps';

const DEFAULT_HOLD = 9000;
const TICK = 100;

export const DemoTour: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = TOUR_STEPS[index];
  const hold = step?.hold ?? DEFAULT_HOLD;

  const goTo = useCallback(
    (next: number) => {
      const target = TOUR_STEPS[next];
      if (!target) return;
      setIndex(next);
      setElapsed(0);
      // Navigating to the route already shown would remount the page and lose
      // any scroll position for no benefit.
      if (target.path !== location.pathname) navigate(target.path);
    },
    [navigate, location.pathname]
  );

  const start = useCallback(() => {
    setOpen(true);
    setFinished(false);
    setPlaying(true);
    setIndex(0);
    setElapsed(0);
    if (TOUR_STEPS[0].path !== location.pathname) navigate(TOUR_STEPS[0].path);
  }, [navigate, location.pathname]);

  const stop = useCallback(() => {
    setOpen(false);
    setPlaying(false);
    setElapsed(0);
  }, []);

  /**
   * Advance timer.
   *
   * The transition happens in the interval callback, never inside a state
   * updater: React treats updater functions as pure and may run or discard
   * them freely, so a setIndex() called from inside setElapsed() is silently
   * dropped and the tour never moves off its first step.
   *
   * Elapsed time is measured against a wall-clock start rather than
   * accumulated per tick, so a throttled background tab resumes at the right
   * place instead of drifting.
   */
  useEffect(() => {
    if (!open || !playing) return undefined;

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const passed = Date.now() - startedAt;

      if (passed < hold) {
        setElapsed(passed);
        return;
      }

      if (index >= TOUR_STEPS.length - 1) {
        // Hold on the closing step rather than looping, so an unattended demo
        // ends somewhere deliberate.
        setElapsed(hold);
        setPlaying(false);
        setFinished(true);
        return;
      }

      goTo(index + 1);
    }, TICK);

    return () => window.clearInterval(timer);
  }, [open, playing, index, hold, goTo]);

  // Escape exits, and the arrow keys step through — expected of anything that
  // behaves like a slideshow.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
      if (e.key === 'ArrowRight') goTo(Math.min(index + 1, TOUR_STEPS.length - 1));
      if (e.key === 'ArrowLeft') goTo(Math.max(index - 1, 0));
      if (e.key === ' ') {
        e.preventDefault();
        setPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, goTo, stop]);

  if (!open) {
    return (
      <Tooltip title="Play a guided walkthrough of the app">
        <Paper
          elevation={6}
          onClick={start}
          sx={{
            position: 'fixed',
            left: 16,
            bottom: 16,
            zIndex: 1300,
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            borderRadius: 6
          }}
        >
          <PlayArrowIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Play demo
          </Typography>
        </Paper>
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={12}
      sx={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 1300,
        width: { xs: 'calc(100vw - 32px)', sm: 400 },
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <LinearProgress variant="determinate" value={Math.min(100, (elapsed / hold) * 100)} sx={{ height: 3 }} />
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.12em' }}>
            {BRAND.name} · {index + 1} of {TOUR_STEPS.length}
          </Typography>
          <IconButton size="small" onClick={stop} aria-label="Exit demo">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          {step.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {step.body}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
          <IconButton size="small" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous">
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>

          {finished ? (
            <Tooltip title="Replay">
              <IconButton size="small" color="primary" onClick={start} aria-label="Replay">
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={playing ? 'Pause' : 'Play'}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => setPlaying(p => !p)}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            size="small"
            onClick={() => goTo(index + 1)}
            disabled={index === TOUR_STEPS.length - 1}
            aria-label="Next"
          >
            <NavigateNextIcon fontSize="small" />
          </IconButton>

          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            Space · ← → · Esc
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
