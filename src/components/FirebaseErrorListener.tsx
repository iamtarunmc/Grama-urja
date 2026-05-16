'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Listens for Firebase-related errors emitted via the global error emitter
 * and displays them as toast notifications to the user.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      toast({
        variant: 'destructive',
        title: 'Database Permission Error',
        description: `Failed to ${error.context.operation} at ${error.context.path}. Please verify your access levels.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    
    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
