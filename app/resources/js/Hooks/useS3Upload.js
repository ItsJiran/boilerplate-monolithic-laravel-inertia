import { useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

export default function useS3Upload() {
    const { auth } = usePage().props;
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, signing, uploading, confirming, success, error
    const [error, setError] = useState(null);
    const [session, setSession] = useState(null);

    const uploadFile = async (file, tenantId) => {
        setUploadStatus('signing');
        setProgress(0);
        setError(null);

        try {
            // 1. Get Pre-signed URL
            const signResponse = await axios.post(route('marketing.customer-imports.sign-upload'), {
                tenant_id: tenantId,
                original_filename: file.name,
                file_size: file.size,
                content_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const { upload_url, session: newSession } = signResponse.data;
            setSession(newSession);

            // 2. Upload to S3 directly
            setUploadStatus('uploading');

            await axios.put(upload_url, file, {
                headers: {
                    'Content-Type': file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            // 3. Confirm Upload
            setUploadStatus('confirming');

            await axios.post(route('marketing.customer-imports.confirm-upload', { session: newSession.id }), {
                tenant_id: tenantId
            });

            setUploadStatus('success');
            return newSession;

        } catch (err) {
            console.error('Upload failed:', err);
            setUploadStatus('error');
            setError(err.response?.data?.message || err.message || 'Upload failed');
            return null;
        }
    };

    const reset = () => {
        setProgress(0);
        setUploadStatus('idle');
        setError(null);
        setSession(null);
    };

    return {
        uploadFile,
        progress,
        uploadStatus,
        error,
        session,
        reset
    };
}
