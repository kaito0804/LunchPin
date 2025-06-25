"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import { uploadToCloudinary } from "@/app/utils/cloudinary/cloudinary";
import { getUserId } from "@/app/utils/getUserId";

export default function PostDialog({ isDialogOpen, onClose, clickPosition, placeName }) {
	const [storeName, setStoreName] = useState("");
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [images, setImages] = useState([
		{ file: null, preview: null },
		{ file: null, preview: null }
	]);
	const [isLoading, setIsLoading] = useState(false);


	// placeName が変更されたら更新
	useEffect(() => {
		if (placeName) setStoreName(placeName);
	}, [placeName]);

	const handleImageChange = (e, index) => {
		const file = e.target.files[0];
		if (!file) return;

		const newImages = [...images];
		newImages[index] = {
		file,
		preview: URL.createObjectURL(file)
		};
		setImages(newImages);
	};

	const handleSubmit = async () => {
		try {
			setIsLoading(true);

			const userId = await getUserId(); 
			if (!userId) {
				alert("ユーザー情報が取得できませんでした");
				return;
			}
			const uploadedUrls = [];

			for (let img of images) {
			if (!img.file) continue;
			const url = await uploadToCloudinary(img.file);
			uploadedUrls.push(url);
			}

			const { error } = await supabase.from("posts").insert({
				user_id: userId,
				store_name: storeName,
				rating,
				comment,
				images: uploadedUrls,
				lat: clickPosition?.lat || null,  // 緯度
				lng: clickPosition?.lng || null,  // 経度
				created_at: new Date().toISOString(),
			});

			if (error) {
				alert("投稿失敗: " + error.message);
			} else {
				alert("投稿成功！");
				setStoreName("");
				setRating(0);
				setComment("");
				setImages([
					{ file: null, preview: null },
					{ file: null, preview: null },
				]);
				onClose();
			}
		} catch (err) {
			console.error(err);
			alert("アップロード中にエラーが発生しました");
		} finally {
			setIsLoading(false); // ← 成功・失敗問わずローディング解除
		}
	};

	
	return (
		<div className="fixed left-0 flex flex-col items-center w-[100%] h-[100dvh] bg-[#fff] text-[#333] transition-all duration-300 overflow-scroll z-50"
				 style={{
					bottom: isDialogOpen ? "0" : "-100%",
				 }}
			>

			{isLoading && (
				<div className="loading-overlay">
					<div className="loading-icon">投稿中...</div>
				</div>
			)}

			<div className="flex flex-col items-center w-[100%] pb-[40px]">

				<div onClick={onClose} className="close-icon"></div>

				<div className="flex flex-col items-center w-[100%] py-[20px] bg-[#fafff7]">
					<p className="text-[20px] font-bold">LunchPin</p>
					<div className="post-icon"></div>
					<p className="text-[14px]">MyLunchに追加する</p>
				</div>
				<div className="flex flex-col items-center w-[100%] p-[20px] gap-[20px]">

					<div className="flex flex-col w-[100%]">
						<p>店舗名</p>
						<textarea
						className   = "w-[100%] border rounded-[6px] px-[8px] py-[4px]"
						rows        = {1}
						placeholder = "店舗名を入力"
						value       = {storeName}
						onChange    = {(e) => setStoreName(e.target.value)} // ← 編集可能にする
						/>
					</div>

					<div className="flex flex-col w-[100%]">
						<p>評価</p>
						<div className="flex items-center mt-[6px] gap-[10px]">
							{
								[1, 2, 3, 4, 5].map((_, star) => (
									 <span
										key={star}
										onClick={() => setRating(star)}
										className={`cursor-pointer ${
											star <= rating ? "star-active" : "star-inactive"
										}`}
									>
										
									</span>
								))
							}
						</div>
					</div>
					<div className="flex flex-col w-[100%]">
						<p>画像</p>
						<div className="flex flex-wrap mt-[6px] gap-[15px]">
						{images.map((img, index) => (
								<div key={index}>
									<input type="file" accept="image/*" onChange={(e) => handleImageChange(e, index)} id={`post_image_${index}`} className="hidden"/>
									{img.preview ? (
										<img src={img.preview} alt={`preview-${index}`} className="w-[100%] object-cover rounded"/>
									) : (
										<label htmlFor={`post_image_${index}`} className="post-image-icon"></label>
									)}
								</div>
							))
						}
						</div>
					</div>
					<div className="flex flex-col w-[100%]">
						<p>コメント</p>
						<textarea
						className="w-[100%] h-[100px] border rounded-[6px] p-[10px]"
						placeholder="コメントを入力"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						></textarea>
					</div>
				</div>

				<div onClick={handleSubmit} className="rounded-btn">登録する</div>
			</div>
		</div>
	);
}
