import { useClerkSupabaseClient } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';

const useAuthClient = () => {
    const { user } = useUser();
    const client = useClerkSupabaseClient();

  return { userId: user?.id ?? "", client}
}

export default useAuthClient;
