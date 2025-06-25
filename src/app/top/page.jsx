"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import {
GoogleMap,
Marker,
OverlayView,
useJsApiLoader,
} from "@react-google-maps/api";
import PostDialog from "@/app/component/PostDialog/postDialog"
import Footer     from "@/app/component/Footer/footer";

const mapContainerStyle = { width: "100%", height: "calc(100vh - 40px)" };

export default function MapWithSearch() {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: "AIzaSyBAF3kQD_r7EvUGZMojMgKsWLMnyJ1G2PI",
		libraries: ["places"],
		language: "ja",
	});

	const [currentPosition, setCurrentPosition] = useState(null);
	const [allPosts, setAllPosts] = useState([]);
	const [clickPosition, setClickPosition]     = useState(null);
	const [placeName, setPlaceName]             = useState(""); 
	const [mapCenter, setMapCenter]             = useState(null);
	const [isDialogOpen, setIsDialogOpen]       = useState(false);
	const mapRef                                = useRef(null);
	const inputRef                              = useRef(null);
	const autocompleteRef                       = useRef(null);
	const mapOptions                            = {
		disableDefaultUI: true, 
	};

	// 現在地リアルタイム監視（上記で説明したwatchPosition）
	useEffect(() => {
		if (!navigator.geolocation) return;

		const watchId = navigator.geolocation.watchPosition(
			(position) => {
			const newPos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};
			setCurrentPosition(newPos);
			setMapCenter(newPos); // 初期の中心を現在地に
			},
			(error) => console.error(error),
			{ enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, []);

	// Google Maps API読み込み完了後にAutocompleteセットアップ
	useEffect(() => {
		if (isLoaded && window.google && inputRef.current) {
			autocompleteRef.current = new window.google.maps.places.Autocomplete(
				inputRef.current,
				{
					// types: ["establishment"], // 必要に応じて絞り込み
					// componentRestrictions: { country: "jp" }, // 日本国内に絞る場合
				}
			);

			autocompleteRef.current.addListener("place_changed", () => {
				const place = autocompleteRef.current.getPlace();
				if (!place.geometry || !place.geometry.location) {
					alert("検索結果に場所が見つかりませんでした");
					return;
				}

				const location = {
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng(),
				};
				setMapCenter(location);
				// クリック位置もリセット
				setClickPosition(null);
			});
		}	
	}, [isLoaded]);

	useEffect(() => {
		const fetchPosts = async () => {
			const { data, error } = await supabase.from("posts").select("*");
			if (error) {
			console.error("投稿データ取得エラー:", error);
			} else {
			setAllPosts(data);
			}
		};

		fetchPosts();
	}, []);


	// 店舗名を取得する関数
	const getPlaceName = async (latLng) => {
		// mapRefがない場合は即座にデフォルトを返す
		if (!mapRef.current) {
			return "ランチ候補地点！";
		}
		
		try {
			const service = new window.google.maps.places.PlacesService(mapRef.current);
			
			return new Promise((resolve) => {
				// まず近くの店舗を検索（範囲を少し大きくして検索精度を上げる）
				const request = {
					location: latLng,
					radius: 100, // 100m以内の店舗を検索
					type: ['restaurant', 'store', 'establishment', 'food', 'cafe'] // より多くのタイプを検索
				};

				service.nearbySearch(request, (results, status) => {
					try {
						console.log('nearbySearch status:', status, 'results:', results); // デバッグ用
						
						if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
							// クリック位置に最も近い店舗を見つける
							let closestPlace = results[0];
							let minDistance = calculateDistance(latLng, results[0].geometry.location);
							
							for (let i = 1; i < results.length; i++) {
								const distance = calculateDistance(latLng, results[i].geometry.location);
								if (distance < minDistance) {
									minDistance = distance;
									closestPlace = results[i];
								}
							}
							
							// 距離が50m以内の場合のみ店舗名を使用
							if (minDistance < 50) {
								console.log('Found nearby place:', closestPlace.name); // デバッグ用
								resolve(closestPlace.name);
								return;
							}
						}
						
						// 店舗が見つからない場合、エラーの場合、または距離が離れている場合
						console.log('No nearby places found, using default'); // デバッグ用
						resolve("ランチ候補地点！");
					} catch (error) {
						console.error('Error in nearbySearch callback:', error);
						resolve("ランチ候補地点！");
					}
				});
			});
		} catch (error) {
			console.error('Error in getPlaceName:', error);
			return "ランチ候補地点！";
		}
	};

	// 2つの座標間の距離を計算する関数（メートル単位）
	const calculateDistance = (pos1, pos2) => {
		const lat1 = pos1.lat;
		const lng1 = pos1.lng;
		const lat2 = pos2.lat();
		const lng2 = pos2.lng();
		
		const R = 6371e3; // 地球の半径（メートル）
		const φ1 = lat1 * Math.PI/180;
		const φ2 = lat2 * Math.PI/180;
		const Δφ = (lat2-lat1) * Math.PI/180;
		const Δλ = (lng2-lng1) * Math.PI/180;

		const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
				Math.cos(φ1) * Math.cos(φ2) *
				Math.sin(Δλ/2) * Math.sin(Δλ/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		return R * c;
	};

	const handleMapClick = async (e) => {
		const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
		setClickPosition(latLng);
		
		// 新しい場所をクリックした際に、まず前の名前をクリア
		setPlaceName("");
		
		// まずplaceIdが取得できるかチェック
		if (e.placeId) {
			// Place IDがある場合は、Place Details APIを使用
			const service = new window.google.maps.places.PlacesService(mapRef.current);
			const request = {
				placeId: e.placeId,
				fields: ['name', 'formatted_address', 'types']
			};
			
			service.getDetails(request, (place, status) => {
				if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
					setPlaceName(place.name || place.formatted_address);
				} else {
					// Place Detailsが取得できない場合は従来の方法
					getPlaceNameFallback(latLng);
				}
			});
		} else {
			// Place IDがない場合は従来の方法
			getPlaceNameFallback(latLng);
		}
	};

	// フォールバック用の店舗名取得関数
	const getPlaceNameFallback = async (latLng) => {
		try {
			// 3秒のタイムアウト処理
			const timeoutPromise = new Promise((resolve) => 
				setTimeout(() => resolve("ランチ候補地点！"), 3000)
			);
			
			const name = await Promise.race([getPlaceName(latLng), timeoutPromise]);
			setPlaceName(name);
		} catch (error) {
			console.error('Error getting place name:', error);
			setPlaceName("ランチ候補地点！");
		}
	};

	if (!isLoaded) return <div>マップを読み込み中...</div>;
	if (!currentPosition) return <div>現在地を取得中...</div>;

	return (
		<>
			{/* 検索ボックス */}
			<input
			ref={inputRef}
			type="text"
			placeholder="場所を検索"
			className="absolute top-[10px] left-[calc(50%-160px)] bg-[#fff] w-[320px] h-[40px] px-[20px] text-[14px] rounded-[100px] shadow-md z-10"
			/>

			<GoogleMap
			center={mapCenter}
			zoom={15}
			mapContainerStyle={mapContainerStyle}
			onClick={handleMapClick}
			onLoad={(map) => (mapRef.current = map)}
			options={mapOptions}
			>
				{/* 現在地のマーカー */}
				<Marker position={currentPosition} label="" />

				{/* 投稿のマーカー */}
				{allPosts.map((post) => (
					<OverlayView
						key={post.id}
						position={{ lat: post.lat, lng: post.lng }}
						mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
					>
						<div className="post-marker">
							<div className="post-image" style={{backgroundImage: `url(${post.images})`}}></div>
						</div>
					</OverlayView>
				))}


				{/* クリック地点のOverlayView */}
				{clickPosition && (
				<OverlayView
					position={clickPosition}
					mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
					clickPosition={clickPosition}
					>
					<div>
						📍 {placeName || "読み込み中..."}
					</div>
					</OverlayView>
				)}

				<div
				onClick={() => {
					if (mapRef.current && currentPosition) {
					mapRef.current.setCenter(currentPosition); // 地図の中心を現在地へ
					}
				}}
				className="now-location-button"
				>
				</div>

			</GoogleMap>

			{/* 投稿ダイアログ */}
			<PostDialog isDialogOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} clickPosition={clickPosition} placeName={placeName}/>

			{/* フッター */}
			<Footer DialogOpen={() => setIsDialogOpen(true)} />
		</>
	);
}