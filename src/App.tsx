import Map from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState } from "react";

function App() {
  // 地図スタイルを保持するstate
  const [mapStyle, setMapStyle] = useState();

  // 1秒ごとにstyle.jsonが変化していないか確認してmapStyleを更新する
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("./style.json")
        .then((response) => response.json())
        .then((json) => {
          if (JSON.stringify(mapStyle) !== JSON.stringify(json)) {
            setMapStyle(json);
          }
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [mapStyle]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <Map
        initialViewState={{
          longitude: 139.7673068,
          latitude: 35.6809591,
          zoom: 6,
        }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        hash={false}
        mapStyle={mapStyle}
      />
    </div>
  );
}

export default App;
