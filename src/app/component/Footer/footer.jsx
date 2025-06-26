import Link from 'next/link';

export default function Footer({DialogOpen}) {
	return (
		<div className='w-[100%]'>
			<ul className='fixed bottom-0 left-0 w-[100%] h-[40px] mb-[8px] flex justify-around items-center bg-[#fff]'>
				<li className='w-[33%] h-[100%] relative flex justify-center items-center footer-icon-home'><Link href="/top" className="w-[100%] h-[100%] text-center"></Link></li>
				<li onClick={DialogOpen} className='h-[100%] relative flex justify-center items-center footer-icon-center'></li>
				<li className='w-[33%] h-[100%] relative flex justify-center items-center footer-icon-my'><Link href="/userpage" className="w-[100%] h-[100%] text-center"></Link></li>
			</ul>
		</div>
	);
}
