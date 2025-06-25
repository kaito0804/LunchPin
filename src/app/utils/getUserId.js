import { supabase } from "@/app/utils/supabase/supabaseClient";

export async function getUserId() {
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		console.error("ユーザー情報の取得に失敗:", error.message);
		return null;
	}

  	return data?.user?.id ?? null;
}
