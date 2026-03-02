import { useEffect, useState, useRef, useCallback } from 'react';

export default function useBroadcast(channelName, eventName, callback = null, type = 'public') {
    const [payload, setPayload] = useState(null);
    const [isListening, setIsListening] = useState(false);

    const callbackRef = useRef(callback);
    const channelRef = useRef(null);
    const listenerRef = useRef(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const detach = useCallback(() => {
        if (window.Echo && channelRef.current && listenerRef.current && isListening) {
            channelRef.current.stopListening(eventName, listenerRef.current);
            setIsListening(false);
        }
    }, [channelName, eventName, isListening]);

    useEffect(() => {
        if (!channelName || !eventName || typeof window === 'undefined' || !window.Echo) {
            return;
        }

        let channel;
        if (type === 'private') {
            channel = window.Echo.private(channelName);
        } else if (type === 'presence') {
            channel = window.Echo.join(channelName);
        } else {
            channel = window.Echo.channel(channelName);
        }

        channelRef.current = channel;

        const eventListener = (eventData) => {
            setPayload(eventData);
            if (callbackRef.current && typeof callbackRef.current === 'function') {
                callbackRef.current(eventData);
            }
        };

        listenerRef.current = eventListener;
        channel.listen(eventName, eventListener);
        setIsListening(true);

        // CLEANUP FUNCTION
        return () => {
            if (channelRef.current && listenerRef.current) {
                // 1. Lepaskan listener lokal
                channelRef.current.stopListening(eventName, listenerRef.current);

                // 2. Beritahu server untuk berhenti mengirim data ke channel INI
                // Karena sifat React closure, 'channelName' di sini adalah nama channel LAMA 
                // sebelum tenant diganti.
                if (window.Echo) {
                    console.log(`Leaving channel: ${channelName}`);
                    window.Echo.leave(channelName);
                }

                setIsListening(false);
            }
        };
    }, [channelName, eventName, type]);

    const clear = () => setPayload(null);

    return { payload, isListening, clear, detach };
}