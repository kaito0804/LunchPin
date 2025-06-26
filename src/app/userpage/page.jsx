"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Footer     from "@/app/component/Footer/footer";

export default function UserPage() {

	

	return (
		<div>
			<div className="flex flex-col items-center justify-center py-[30px]">
				<div className="user-icon-box">
					<div className="user-icon" style={{ backgroundImage: "url('https://res.cloudinary.com/dnehmdy45/image/upload/v1750906560/user-gray_jprhj3.svg')" }}></div>
					<div className="change-icon"></div>
				</div>
				<p className="text-[14px] font-bold mt-[6px]">なまえ</p>
				<div className="flex justify-around items-center w-[100%] mt-[20px]">
					<div className="flex flex-col justify-center items-center gap-[2px] w-[33%]">
						<div className="font-bold">0</div>
						<div className="text-[14px] text-[#666]">フォロー</div>
					</div>
					<div className="flex flex-col justify-center items-center gap-[2px] w-[33%]">
						<div className="font-bold">0</div>
						<div className="text-[14px] text-[#666]">フォロワー</div>
					</div>
					<div className="flex flex-col justify-center items-center gap-[2px] w-[33%]">
						<div className="font-bold">0</div>
						<div className="text-[14px] text-[#666]">いいね</div>
					</div>
				</div>
				<div className="flex justify-center items-center w-[100%] mt-[20px]">
					<div className="flex justify-center items-center w-[160px] py-[8px] px-[5px] bg-[#e1e1e1] rounded-[10px] text-[14px] font-bold">プロフィールを編集</div>
				</div>
				<p className="flex justify-center items-center w-[80%] text-[13px] mt-[20px] mx-auto">自己紹介</p>
			</div>

			<div className="flex justify-around items-center w-[100%] h-[50px] bg-[#fff] border-b border-[#e1e1e1] py-[10px]">
				<div className="list-icon"></div>
				<div className="favorite-icon"></div>
			</div>

			<ul>
				<li></li>
			</ul>

			{/* フッター */}
			<Footer />
		</div>
	);
}