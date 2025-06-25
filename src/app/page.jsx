"use client";
import { useState } from "react";
import AuthButtons from "@/app/component/NewRegAuth/newRegAuth";

export default function Home() {

	const [authBtn, setAuthBtn] = useState('');

	return (
		<div>
			<div onClick={() => setAuthBtn('')} className="flex flex-col justify-center items-center">

			<div className="flex flex-col justify-center items-center w-[100%] h-[100vh] bg-[#fffcfa]">
				<div className="absolute top-[calc(50%-120px)] flex flex-col justify-center items-center text-[#35b700]">
				<p className="font-bold text-[60px]">LunchMap</p>
				<p className="font-bold text-[18px]">ランチ探しを、もっとカンタンに</p>
				</div>
			</div>	
			
			<div onClick={(e) => e.stopPropagation()} className={`${authBtn ? 'bottom-[-100%]' : 'bottom-[80px]'} absolute flex flex-col justify-center items-center gap-[30px] transition-all duration-500`}>
				<div onClick={() => setAuthBtn('new_reg')} className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#35b700] text-white rounded-[100px] font-bold">新規アカウント作成</div>
				<div onClick={() => setAuthBtn('login')} className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#4363ff] text-white rounded-[100px] font-bold">ログイン</div>
			</div>
			</div>

			<AuthButtons authBtn={authBtn} setAuthBtn={setAuthBtn}/>	

		</div>
	);
}
