"use client";

import { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import Footer from "@/app/component/Footer/footer";

const mapContainerStyle = { width: "100%", height: "calc(100vh - 40px)" };

export default function MapWithSearch() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBAF3kQD_r7EvUGZMojMgKsWLMnyJ1G2PI",
    libraries: ["places"],
  });

  	const [currentPosition, setCurrentPosition] = useState(null);
	const [clickPosition, setClickPosition] = useState(null);
	const [mapCenter, setMapCenter] = useState(null);

	const mapRef = useRef(null);
	const inputRef = useRef(null);
	const autocompleteRef = useRef(null);
	const mapOptions = {
		mapTypeControl: false,        // 地図タイプ切替（Map/Satellite）
		fullscreenControl: false,     // 全画面表示ボタン
		streetViewControl: false,     // ストリートビューPegman（人形アイコン）
		zoomControl: false,           // 拡大縮小ボタン（＋−）
		rotateControl: false,     // 画面回転ボタン
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

  const handleMapClick = (e) => {
    setClickPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
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

        {/* クリック地点のOverlayView */}
        {clickPosition && (
          <OverlayView
            position={clickPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div>
              ランチ候補地点！
            </div>
          </OverlayView>
        )}

		<div
		onClick={() => {
			if (mapRef.current && currentPosition) {
			mapRef.current.setCenter(currentPosition); // 地図の中心を現在地へ
			}
		}}
		style={{
			position: "absolute",
			bottom: 20,
			right: 120,
			zIndex: 10,
			backgroundColor: "#fff",
			border: "1px solid #ccc",
			borderRadius: "50%",
			width: 48,
			height: 48,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
			cursor: "pointer",
		}}
		aria-label="現在地に戻る"
		>
		📍
		</div>

      </GoogleMap>

	  {/* フッター */}
	  <Footer />
    </>
  );
}
