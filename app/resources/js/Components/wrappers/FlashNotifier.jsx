import { useEffect, useState, useCallback, useRef } from 'react';
import useFlashStore from '@/Stores/useFlashStore';
import useFlashSync from '@/Hooks/useFlashSync';

/* ─── Keyframe animations ─────────────────────────────────────────────────── */
const ANIM_STYLES = `
@keyframes toast-in {
    0%   { transform: translateX(calc(100% + 32px)); opacity: 0; }
    60%  { transform: translateX(-10px); opacity: 1; }
    80%  { transform: translateX(4px); }
    100% { transform: translateX(0); }
}
@keyframes toast-out {
    0%   { transform: translateX(0); opacity: 1; max-height: 200px; margin-bottom: 0; }
    40%  { transform: translateX(calc(100% + 32px)); opacity: 0; max-height: 200px; }
    100% { transform: translateX(calc(100% + 32px)); opacity: 0; max-height: 0; margin-bottom: -12px; }
}
.toast-enter { animation: toast-in  0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.toast-exit  { animation: toast-out 0.35s ease-in forwards; }
`;

const EXIT_DURATION = 340;  // ms — must match toast-out duration
const DRAG_THRESHOLD = 90;   // px — how far right to trigger dismiss

/* ─── Icons / styles ─────────────────────────────────────────────────────── */
const ICONS = {
    success: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

const STYLES = {
    success: {
        wrapper: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
        icon: 'text-emerald-500',
        bar: 'bg-emerald-400',
        close: 'hover:bg-emerald-100 text-emerald-600',
    },
    error: {
        wrapper: 'bg-red-50 border border-red-200 text-red-800',
        icon: 'text-red-500',
        bar: 'bg-red-400',
        close: 'hover:bg-red-100 text-red-600',
    },
};

/* ─── Single Toast ───────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }) {
    const { id, type, message, duration } = toast;
    const style = STYLES[type] ?? STYLES.error;

    const [exiting, setExiting] = useState(false);
    const [dragX, setDragX] = useState(0);   // current drag offset (px)
    const [dragging, setDragging] = useState(false);
    const startXRef = useRef(0);

    // ── Dismiss helper ────────────────────────────────────────────────────
    const dismiss = useCallback(() => {
        if (exiting) return;
        setExiting(true);
        setTimeout(() => onDismiss(id), EXIT_DURATION);
    }, [exiting, id, onDismiss]);

    // ── Drag handlers (pointer events — works mouse + touch) ──────────────
    const onPointerDown = (e) => {
        if (exiting) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        startXRef.current = e.clientX;
        setDragging(true);
    };

    const onPointerMove = (e) => {
        if (!dragging) return;
        const delta = e.clientX - startXRef.current;
        // Allow free drag to the right; resist drag to the left (clamped at −30px)
        setDragX(delta < 0 ? Math.max(delta, -30) : delta);
    };

    const onPointerUp = () => {
        if (!dragging) return;
        setDragging(false);

        if (dragX >= DRAG_THRESHOLD) {
            // Swiped far enough → dismiss
            dismiss();
        } else {
            // Spring back
            setDragX(0);
        }
    };

    // ── Progress bar ──────────────────────────────────────────────────────
    const [progress, setProgress] = useState(100);
    useEffect(() => {
        const start = performance.now();
        let animId;
        const tick = (now) => {
            const pct = Math.max(0, 100 - ((now - start) / duration) * 100);
            setProgress(pct);
            if (pct > 0) animId = requestAnimationFrame(tick);
        };
        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, [duration]);

    // Opacity fades as drag approaches threshold
    const dragOpacity = dragging ? Math.max(0.3, 1 - dragX / (DRAG_THRESHOLD * 1.5)) : 1;

    const dragStyle = {
        transform: `translateX(${dragX}px)`,
        opacity: dragOpacity,
        transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
    };

    return (
        <div className={`toast-enter ${exiting ? 'toast-exit' : ''}`}>
            <div
                className={`relative flex items-start gap-3 w-80 max-w-full rounded-xl shadow-lg px-4 pt-4 pb-3 overflow-hidden ${style.wrapper}`}
                role="alert"
                style={dragStyle}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <span className={style.icon}>{ICONS[type]}</span>
                <p className="flex-1 text-sm font-medium leading-snug break-words">{message}</p>

                {/* Close button — stopPropagation so click doesn't interfere with drag */}
                <button
                    onClick={(e) => { e.stopPropagation(); dismiss(); }}
                    className={`ml-1 rounded-full p-0.5 transition-colors ${style.close}`}
                    aria-label="Tutup"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Drag hint label */}
                {dragging && dragX > 10 && (
                    <span
                        className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wide opacity-60 pointer-events-none"
                        style={{ color: 'currentColor' }}
                    >
                        Lepaskan untuk tutup →
                    </span>
                )}

                {/* Progress bar */}
                <div
                    className={`absolute bottom-0 left-0 h-0.5 ${style.bar}`}
                    style={{ width: `${progress}%`, transition: 'none' }}
                />
            </div>
        </div>
    );
}

/* ─── Main Notifier ──────────────────────────────────────────────────────── */
export default function FlashNotifier({ children }) {
    useFlashSync();

    const toasts = useFlashStore((s) => s.toasts);
    const removeToast = useFlashStore((s) => s.removeToast);

    return (
        <>
            <style>{ANIM_STYLES}</style>
            {children}

            <div
                className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
                aria-live="polite"
            >
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast toast={toast} onDismiss={removeToast} />
                    </div>
                ))}
            </div>
        </>
    );
}
