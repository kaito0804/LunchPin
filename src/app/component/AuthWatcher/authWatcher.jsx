'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabaseClient';

export default function AuthWatcher() {
	const router   = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const checkSession = async () => {
			const { data: { session } } = await supabase.auth.getSession();

			if (session) {
				//ユーザー初回登録チェック＆登録（SIGNED_INでも同様にやるので、ここは省略してもOK）
				await ensureUserProfile(session.user);

				if (pathname === '/') {
					router.push('/top');
				}
			} else {
				router.push('/');
			}
		};

		checkSession();

		const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_IN' && session?.user) {
				await ensureUserProfile(session.user); //プロフィール登録
				if (pathname === '/') {
					router.push('/top');
				}
			}
		});

		return () => {
			listener?.subscription.unsubscribe();
		};
	}, [router, pathname]);

	return null;
}

// 🔧 プロフィール情報がなければ登録
// ensureUserProfile.ts
export async function ensureUserProfile(user, router) {
	const { data: existingUser, error: fetchError } = await supabase
		.from('users')
		.select('id')
		.eq('id', user.id)
		.single();

	if (!existingUser) {
		const { error: insertError } = await supabase.from('users').insert({
			id: user.id,
			name: user.user_metadata?.name || '未設定',
			profile_image: null,
			bio: '',
		});

		if (insertError) {
			console.error('プロフィール登録失敗:', insertError.message);
			router.push('/');
		}
	}
}

