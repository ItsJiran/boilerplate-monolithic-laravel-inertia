import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import useFlashStore from '@/Stores/useFlashStore';

export default function useFlashSync() {
    const { props } = usePage();

    useEffect(() => {
        const handleFlash = () => {
            const flash = props.flash ?? {};
            if (flash.success) useFlashStore.getState().addToast('success', flash.success);
            if (flash.error) useFlashStore.getState().addToast('error', flash.error);
        };

        // router.on returns an unsubscribe function — must be called on cleanup
        // to prevent duplicate listeners accumulating on re-renders.
        const unsubFinish = router.on('finish', handleFlash);
        const unsubException = router.on('exception', handleFlash);

        return () => {
            unsubFinish();
            unsubException();
        };
        // Re-subscribe whenever props.flash changes so handleFlash closes over fresh data
    }, [props.flash]);
}
