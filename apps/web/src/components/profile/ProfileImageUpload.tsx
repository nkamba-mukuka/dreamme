import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ProfileImageUploadProps {
    userId: string;
    currentPhotoURL?: string;
    onUploadComplete: (url: string) => void;
}

export function ProfileImageUpload({ userId, currentPhotoURL, onUploadComplete }: ProfileImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            // Upload image to Firebase Storage
            const storage = getStorage();
            const imageRef = ref(storage, `profile-images/${userId}/${file.name}`);
            await uploadBytes(imageRef, file);

            // Get download URL
            const downloadURL = await getDownloadURL(imageRef);

            // Update user profile in Firestore
            await updateDoc(doc(db, 'profiles', userId), {
                photoURL: downloadURL,
                updatedAt: new Date()
            });

            onUploadComplete(downloadURL);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
                {currentPhotoURL ? (
                    <img
                        src={currentPhotoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            isLoading={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Change Photo'}
                        </Button>
                    </label>
                </div>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
} 