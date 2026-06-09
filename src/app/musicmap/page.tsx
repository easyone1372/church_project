"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/organisms/Header";
import type { SearchResultItem, PostDraft } from "@/data/sampleMockResults";
import { CATEGORIES, CATEGORY_TAG_MAP } from "@/data/Categories";
import { REGION_CENTERS } from "@/data/mapConstants";
import {
  buildClusters,
  coordsFromLocation,
  extractKeywords,
  CoordsMap,
} from "@/lib/mapUtils";
import MapPanel from "@/components/organisms/MapPanel";
import MapSearchBar from "@/components/molecules/MapSearchBar";
import WritePostModal from "@/components/organisms/WritePostModal";
import FilterChip from "@/components/atom/FilterChip";

declare global {
  interface Window {
    naver: any;
    __naverMapInit?: () => void;
  }
}

export default function MusicMapPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const coordsRef = useRef<CoordsMap>({});

  const [allPosts, setAllPosts] = useState<SearchResultItem[]>([]);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredItems, setFilteredItems] = useState<SearchResultItem[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);
  const [chipFilter, setChipFilter] = useState("all");

  const filteredItemsRef = useRef<SearchResultItem[]>([]);
  filteredItemsRef.current = filteredItems;

  /* ── DB에서 게시글 로드 ── */
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((posts: SearchResultItem[]) => {
        if (!Array.isArray(posts)) return;
        // 좌표 맵 초기화
        const coords: CoordsMap = {};
        posts.forEach((post) => {
          if (post.lat && post.lng) {
            coords[post.id] = { lat: post.lat, lng: post.lng };
          } else {
            // 좌표 없으면 위치명으로 추정
            coords[post.id] = coordsFromLocation(post.location, post.id);
          }
        });
        coordsRef.current = coords;
        setAllPosts(posts);
        setFilteredItems(posts);
        filteredItemsRef.current = posts;
        if (mapObjRef.current) renderMarkers(posts, mapObjRef.current);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── URL 필터 ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    if (!filter || allPosts.length === 0) return;

    const filtered = allPosts.filter((item) => item.tags.includes(filter));
    if (filtered.length > 0) {
      setFilteredItems(filtered);
      filteredItemsRef.current = filtered;
    }
    const label = CATEGORIES.find((c) => c.id === filter)?.label;
    if (label) setSearchInput(label);
  }, [allPosts]);

  /* ── 마커 렌더링 ── */
  const renderMarkers = useCallback((items: SearchResultItem[], map: any) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const clusters = buildClusters(items, map.getZoom(), coordsRef.current);

    clusters.forEach((cluster) => {
      const isCluster = cluster.items.length > 1;
      const content = isCluster
        ? `<div style="background:#8F4BC6;color:#fff;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;box-shadow:0 2px 10px rgba(0,0,0,0.25);border:3px solid #fff;cursor:pointer;">${cluster.items.length}</div>`
        : `<div style="background:#8F4BC6;color:#fff;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;border:2px solid #fff;">${cluster.items[0].imageEmoji} ${cluster.items[0].price}</div>`;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(cluster.lat, cluster.lng),
        map,
        icon: {
          content,
          anchor: new window.naver.maps.Point(isCluster ? 22 : 0, isCluster ? 22 : 0),
        },
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

  /* ── 새 글 등록 (DB 저장) ── */
  const handlePostSubmit = (draft: PostDraft) => {
    const savePost = async (lat: number, lng: number) => {
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, lat, lng }),
        });
        if (!res.ok) return;
        const newPost: SearchResultItem = await res.json();

        coordsRef.current[newPost.id] = { lat, lng };
        const updated = [...filteredItemsRef.current, newPost];
        setAllPosts((prev) => [...prev, newPost]);
        setFilteredItems(updated);
        filteredItemsRef.current = updated;
        setPanelOpen(true);
        if (mapObjRef.current) {
          renderMarkers(updated, mapObjRef.current);
          mapObjRef.current.panTo(new window.naver.maps.LatLng(lat, lng));
        }
      } catch {}
    };

    if (draft.lat && draft.lng) {
      savePost(draft.lat, draft.lng);
      return;
    }

    if (window.naver?.maps?.Service) {
      window.naver.maps.Service.geocode(
        { query: draft.location },
        (status: any, response: any) => {
          if (
            status === window.naver.maps.Service.Status.OK &&
            response.v2.addresses.length > 0
          ) {
            const { x, y } = response.v2.addresses[0];
            savePost(parseFloat(y), parseFloat(x));
          } else {
            const approx = coordsFromLocation(draft.location, Date.now());
            savePost(approx.lat, approx.lng);
          }
        },
      );
    } else {
      const approx = coordsFromLocation(draft.location, Date.now());
      savePost(approx.lat, approx.lng);
    }
  };

  /* ── 칩 필터 ── */
  const applyChipFilter = (items: SearchResultItem[], chip: string) =>
    chip === "all"
      ? items
      : items.filter((item) =>
          (CATEGORY_TAG_MAP[chip] ?? []).some((tag) => item.tags.includes(tag)),
        );

  const handleChipFilter = (categoryId: string) => {
    setChipFilter(categoryId);
    const result = applyChipFilter(allPosts, categoryId);
    setFilteredItems(result);
    filteredItemsRef.current = result;
    setSelectedItem(null);
    if (mapObjRef.current) renderMarkers(result, mapObjRef.current);
  };

  /* ── 검색 ── */
  const handleSearch = () => {
    const q = searchInput.trim().toLowerCase();
    const base = applyChipFilter(allPosts, chipFilter);
    const tokens = extractKeywords(q);

    const matchesToken = (item: SearchResultItem, token: string) =>
      item.title.toLowerCase().includes(token) ||
      item.category.toLowerCase().includes(token) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(token)) ||
      item.locationTags.some((lt) => lt.toLowerCase().includes(token));

    const result = tokens.length
      ? base.filter((item) => tokens.every((t) => matchesToken(item, t)))
      : base;

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
      window.naver.maps.Service.geocode(
        { query: searchInput.trim() },
        (status: any, response: any) => {
          if (
            status === window.naver.maps.Service.Status.OK &&
            response.v2.addresses.length > 0
          ) {
            const { x, y } = response.v2.addresses[0];
            mapObjRef.current?.setCenter(new window.naver.maps.LatLng(parseFloat(y), parseFloat(x)));
            mapObjRef.current?.setZoom(14);
          }
        },
      );
    } else {
      renderMarkers(result, mapObjRef.current);
    }
  };

  const handleClear = () => {
    const result = applyChipFilter(allPosts, chipFilter);
    setSearchInput("");
    setFilteredItems(result);
    filteredItemsRef.current = result;
    setSelectedItem(null);
    setPanelOpen(false);
    if (mapObjRef.current) renderMarkers(result, mapObjRef.current);
  };

  const handleItemClick = (item: SearchResultItem) => {
    setSelectedItem(item);
    const coords = coordsRef.current[item.id];
    if (coords && mapObjRef.current) {
      mapObjRef.current.panTo(new window.naver.maps.LatLng(coords.lat, coords.lng));
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />
      <div className="relative flex-1">
        <div ref={mapRef} className="w-full h-full" />

        <MapSearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* 카테고리 필터 칩 바 */}
        <div
          className="absolute z-10 left-4 right-16 md:right-auto flex gap-1.5 overflow-x-auto"
          style={{ top: "72px", scrollbarWidth: "none" }}
        >
          {[
            { id: "all",        label: "전체" },
            { id: "lesson",     label: "레슨" },
            { id: "band",       label: "밴드/합주" },
            { id: "instrument", label: "악기거래" },
          ].map(({ id, label }) => (
            <FilterChip key={id} active={chipFilter === id} onClick={() => handleChipFilter(id)}>
              {label}
            </FilterChip>
          ))}
        </div>

        {/* 내 위치로 이동 */}
        <button
          onClick={() => {
            if (!navigator.geolocation || !mapObjRef.current) return;
            navigator.geolocation.getCurrentPosition(
              ({ coords: { latitude: lat, longitude: lng } }) => {
                mapObjRef.current.panTo(new window.naver.maps.LatLng(lat, lng));
                mapObjRef.current.setZoom(15);
              },
              () => {},
              { timeout: 5000 },
            );
          }}
          title="내 위치로 이동"
          className="absolute bottom-20 right-6 z-10 w-11 h-11 rounded-full bg-white text-text-body flex items-center justify-center border-none cursor-pointer hover:bg-surface-card transition-colors shadow-search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" strokeOpacity="0.2" />
          </svg>
        </button>

        <button
          onClick={() => {
            if (authStatus !== "authenticated") {
              alert("글을 작성하려면 로그인이 필요해요.");
              return;
            }
            setWriteModalOpen(true);
          }}
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
