import useAppBroadcast from '@/Hooks/useAppBroadcast';

export default function BroadcastListener({ children }) {
    useAppBroadcast();

    return <>{children}</>;
}
