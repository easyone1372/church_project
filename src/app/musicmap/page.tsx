"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/organisms/Header";
import { MOCK_RESULTS, SearchResultItem } from "@/data/sampleMockResults";
import { DUMMY_COORDS } from "@/data/MapdummyCoords";
import { CATEGORIES } from "@/data/Categories";
import { REGION_CENTERS } from "@/data/mapConstants";
import { buildClusters, coordsFromLocation, extractKeywords, CoordsMap } from "@/lib/mapUtils";
import MapPanel from "@/components/organisms/MapPanel";
import MapSearchBar from "@/components/molecules/MapSearchBar";
import WritePostModal from "@/components/organisms/WritePostModal";

declare global {
  interface Window {
    naver: any;
    __naverMapInit?: () => void;
  }
}

export default function MusicMapPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const coordsRef = useRef<CoordsMap>({ ...DUMMY_COORDS });

  const [customPosts, setCustomPosts] = useState<SearchResultItem[]>([]);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredItems, setFilteredItems] = useState<SearchResultItem[]>(MOCK_RESULTS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);

  const filteredItemsRef = useRef<SearchResultItem[]>(MOCK_RESULTS);
  filteredItemsRef.current = filteredItems;

  /* ── URL 필터 (레슨/마켓 페이지 리다이렉트 처리) ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    if (!filter) return;

    const allItems = [...MOCK_RESULTS, ...customPosts];
    const filtered = allItems.filter((item) => item.tags.includes(filter));
    if (filtered.length > 0) {
      setFilteredItems(filtered);
      filteredItemsRef.current = filtered;
    }
    const label = CATEGORIES.find((c) => c.id === filter)?.label;
    if (label) setSearchInput(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 마커 렌더링 ── */
  const renderMarkers = useCallback((items: SearchResultItem[], map: any) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const clusters = buildClusters(items, map.getZoom(), coordsRef.current);

    clusters.forEach((cluster) => {
      const isCluster = cluster.items.length > 1;
      const content = isCluster
        ? `<div style="background:#8DC53E;color:#fff;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;box-shadow:0 2px 10px rgba(0,0,0,0.25);border:3px solid #fff;cursor:pointer;">${cluster.items.length}</div>`
        : `<div style="background:#8DC53E;color:#fff;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;border:2px solid #fff;">${cluster.items[0].imageEmoji} ${cluster.items[0].price}</div>`;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(cluster.lat, cluster.lng),
        map,
        icon: { content, anchor: new window.naver.maps.Point(isCluster ? 22 : 0, isCluster ? 22 : 0) },
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        if (isCluster) {
          map.setCenter(new window.naver.maps.LatLng(cluster.lat, cluster.lng));
          map.setZoom(map.getZoom() + 3);
        } else {
          setSelectedItem(cluster.items[0]);
          setPanelOpen(true);
        }
      });

      markersRef.current.push(marker);
    });
  }, []);

  /* ── 지도 초기화 ── */
  const initMap = useCallback(() => {
    if (!mapRef.current || mapObjRef.current) return;
    if (!window.naver?.maps?.Map) { setTimeout(initMap, 100); return; }

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5563, 126.9236),
      zoom: 12,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
    });

    mapObjRef.current = map;
    renderMarkers(filteredItemsRef.current, map);
    window.naver.maps.Event.addListener(map, "zoom_changed", () => {
      renderMarkers(filteredItemsRef.current, map);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude: lat, longitude: lng } }) => {
          map.setCenter(new window.naver.maps.LatLng(lat, lng));
          map.setZoom(14);
          new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat, lng),
            map,
            icon: {
              content: `<div style="width:16px;height:16px;border-radius:50%;background:#4A90E2;border:3px solid #fff;box-shadow:0 0 0 4px rgba(74,144,226,0.3);"></div>`,
              anchor: new window.naver.maps.Point(8, 8),
            },
          });
        },
        () => {},
        { timeout: 5000 },
      );
    }
  }, [renderMarkers]);

  /* ── 네이버 지도 스크립트 로드 ── */
  useEffect(() => {
    window.__naverMapInit = () => initMap();
    if (document.getElementById("naver-map-script")) {
      if (window.naver?.maps) initMap();
      return;
    }
    const script = document.createElement("script");
    script.id = "naver-map-script";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}&submodules=geocoder&callback=__naverMapInit`;
    script.async = true;
    document.head.appendChild(script);
  }, [initMap]);

  /* ── 새 글 등록 ── */
  const handlePostSubmit = (item: Omit<SearchResultItem, "id">) => {
    const id = Date.now();
    const newPost: SearchResultItem = { ...item, id };

    const addToMap = (lat: number, lng: number) => {
      coordsRef.current[id] = { lat, lng };
      const updated = [...filteredItemsRef.current, newPost];
      setCustomPosts((prev) => [...prev, newPost]);
      setFilteredItems(updated);
      filteredItemsRef.current = updated;
      setPanelOpen(true);
      if (mapObjRef.current) {
        renderMarkers(updated, mapObjRef.current);
        mapObjRef.current.panTo(new window.naver.maps.LatLng(lat, lng));
      }
    };

    if (window.naver?.maps?.Service) {
      window.naver.maps.Service.geocode({ query: item.location }, (status: any, response: any) => {
        if (status === window.naver.maps.Service.Status.OK && response.v2.addresses.length > 0) {
          const { x, y } = response.v2.addresses[0];
          addToMap(parseFloat(y), parseFloat(x));
        } else {
          const approx = coordsFromLocation(item.location, id);
          addToMap(approx.lat, approx.lng);
        }
      });
    } else {
      const approx = coordsFromLocation(item.location, id);
      addToMap(approx.lat, approx.lng);
    }
  };

  /* ── 검색 ── */
  const handleSearch = () => {
    const q = searchInput.trim().toLowerCase();
    const allItems = [...MOCK_RESULTS, ...customPosts];
    const tokens = extractKeywords(q);

    const matchesToken = (item: SearchResultItem, token: string) =>
      item.title.toLowerCase().includes(token) ||
      item.category.toLowerCase().includes(token) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(token)) ||
      item.locationTags.some((lt) => lt.toLowerCase().includes(token));

    const result = tokens.length
      ? allItems.filter((item) => tokens.every((t) => matchesToken(item, t)))
      : allItems;

    setFilteredItems(result);
    filteredItemsRef.current = result;
    setSelectedItem(null);
    setPanelOpen(true);

    if (!mapObjRef.current) return;

    const regionKey = Object.keys(REGION_CENTERS).find(
      (key) => tokens.includes(key) || q.includes(key),
    );
    if (regionKey) {
      const { lat, lng, zoom } = REGION_CENTERS[regionKey];
      mapObjRef.current.setCenter(new window.naver.maps.LatLng(lat, lng));
      mapObjRef.current.setZoom(zoom);
      return;
    }

    if (window.naver?.maps?.Service) {
      window.naver.maps.Service.geocode({ query: searchInput.trim() }, (status: any, response: any) => {
        if (status === window.naver.maps.Service.Status.OK && response.v2.addresses.length > 0) {
          const { x, y } = response.v2.addresses[0];
          mapObjRef.current?.setCenter(new window.naver.maps.LatLng(parseFloat(y), parseFloat(x)));
          mapObjRef.current?.setZoom(14);
        }
      });
    } else {
      renderMarkers(result, mapObjRef.current);
    }
  };

  const handleClear = () => {
    const allItems = [...MOCK_RESULTS, ...customPosts];
    setSearchInput("");
    setFilteredItems(allItems);
    filteredItemsRef.current = allItems;
    setSelectedItem(null);
    setPanelOpen(false);
    if (mapObjRef.current) renderMarkers(allItems, mapObjRef.current);
  };

  const handleItemClick = (item: SearchResultItem) => {
    setSelectedItem(item);
    const coords = coordsRef.current[item.id];
    if (coords && mapObjRef.current) {
      mapObjRef.current.panTo(new window.naver.maps.LatLng(coords.lat, coords.lng));
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <div className="relative flex-1">
        <div ref={mapRef} className="w-full h-full" />

        <MapSearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        <button
          onClick={() => setWriteModalOpen(true)}
          className="absolute bottom-6 right-6 z-10 flex items-center gap-2 bg-brand text-white text-xs font-semibold px-4 rounded-full border-none cursor-pointer hover:opacity-85 transition-opacity shadow-search"
          style={{ height: "44px" }}
        >
          ✦ 글쓰기
        </button>

        <MapPanel
          isOpen={panelOpen}
          items={filteredItems}
          selectedItem={selectedItem}
          onItemClick={handleItemClick}
          onBackToList={() => setSelectedItem(null)}
          onClose={() => { setPanelOpen(false); setSelectedItem(null); }}
          onDetailClick={(item) => router.push(`/post/${item.id}`)}
        />
      </div>

      <WritePostModal
        isOpen={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        onSubmit={handlePostSubmit}
      />
    </div>
  );
}
