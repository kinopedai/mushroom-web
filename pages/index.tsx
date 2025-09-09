import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, MapPin, Book, Plus, Menu, X, Navigation, Trash2, Eye, EyeOff, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import 'leaflet/dist/leaflet.css';
import type { MushroomRecord } from '@/modules/record/domain/types';
import type { MushroomRef } from '@/modules/encyclopedia/domain/types';

const mushroomDatabase: MushroomRef[] = [
  { id: '1', name: 'シイタケ', toxicityLevel: 0.0, season: '春-秋', limit: '制限なし', category: 'edible' },
  { id: '2', name: 'マイタケ', toxicityLevel: 0.0, season: '秋', limit: '制限なし', category: 'edible' },
  { id: '3', name: 'エノキタケ', toxicityLevel: 0.0, season: '冬-春', limit: '制限なし', category: 'edible' },
  { id: '4', name: 'ベニテングタケ', toxicityLevel: 0.8, season: '夏-秋', limit: '採取禁止', category: 'poisonous' },
  { id: '5', name: 'ドクツルタケ', toxicityLevel: 0.9, season: '夏-秋', limit: '採取禁止', category: 'poisonous' },
  { id: '6', name: 'レイシ', toxicityLevel: 0.0, season: '夏-秋', limit: '適量', category: 'medicinal' }
];

const databaseItems: MushroomRef[] = [
  { id: '1', name: 'シイタケ', toxicityLevel: 0.0, season: '春-秋', limit: '制限なし', category: 'edible' },
  { id: '2', name: 'マイタケ', toxicityLevel: 0.0, season: '秋', limit: '制限なし', category: 'edible' },
  { id: '3', name: 'エノキタケ', toxicityLevel: 0.0, season: '冬-春', limit: '制限なし', category: 'edible' },
  { id: '4', name: 'ベニテングタケ', toxicityLevel: 0.8, season: '夏-秋', limit: '採取禁止', category: 'poisonous' },
  { id: '5', name: 'ドクツルタケ', toxicityLevel: 0.9, season: '夏-秋', limit: '採取禁止', category: 'poisonous' },
  { id: '6', name: 'レイシ', toxicityLevel: 0.0, season: '夏-秋', limit: '適量', category: 'medicinal' }
];

export default function MushroomTracker() {
  const router = useRouter();
  // 大量のuseStateが連続定義（悪いパターン）
  const [activeTab, setActiveTab] = useState('record');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState<MushroomRecord[]>([]);
  
  // ログアウト処理
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    count: 1,
    toxicityLevel: 0,
    memo: ''
  });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MushroomRef[]>([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<MushroomRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [databaseTab, setDatabaseTab] = useState('mushroom');
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [tempMarker, setTempMarker] = useState<any>(null);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [locationSelectionMap, setLocationSelectionMap] = useState<any>(null);
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);
  const [clickedLocationId, setClickedLocationId] = useState<string | null>(null);
  const openLocationPicker = async () => {
    // Leaflet を未ロードならロード（効果側の初期化が動くようにだけ整える）
    if (!isMapLoaded) {
      try {
        if (typeof window !== 'undefined') {
          await import('leaflet');
          setIsMapLoaded(true);
        }
      } catch {}
    }

    // 前回のレイヤや一時マーカーを念のため掃除（常にピンは1つ）
    try { selectionLayerRef.current?.clearLayers?.(); } catch {}
    try { tempMarker?.remove?.(); } catch {}

    setShowLocationMap(true);
  };
  const closeLocationPicker = () => {
    setShowLocationMap(false);
    try { locationSelectionMap?.off?.(); } catch {}
    try { locationSelectionMap?.remove?.(); } catch {}
    try { tempMarker?.remove?.(); } catch {}
    setLocationSelectionMap(null);
  };
  // クリックで置くマーカーを常に1個に保つためのLayerGroup参照
  const selectionLayerRef = useRef<any>(null);

  // 不適切なuseEffect（空の依存配列）
  useEffect(() => {
    // ユーザーセッションチェック
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
    }

    const savedRecords = localStorage.getItem('mushroomRecords');
    if (savedRecords) {
      const parsedRecords = JSON.parse(savedRecords);
      setRecords(parsedRecords);
    }
    // formDataの初期化も同じuseEffect内で行う（悪いパターン）
    setFormData({
      name: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      count: 1,
      toxicityLevel: 0,
      memo: ''
    });
  }, []); // 依存配列が不適切

  // Googleマップの初期化
  useEffect(() => {
    const initLeaflet = async () => {
      if (typeof window === 'undefined') return;
      try {
        await import('leaflet');
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Leaflet loading failed:', error);
        setIsMapLoaded(false);
      }
    };
    if (activeTab === 'map') {
      initLeaflet();
    }
  }, [activeTab]);

  // 位置選択用マップの初期化
  useEffect(() => {
    const initLocationSelectionMap = async () => {
      if (!showLocationMap || !isMapLoaded) return;

      const mapElement = document.getElementById('location-selection-map');
      if (!mapElement) return;

      // 位置選択用マップの初期化
      const L = (await import('leaflet')).default;
      // 既に同じコンテナに初期化済みなら何もしない
      if (locationSelectionMap) return;

      const newMap = L.map(mapElement).setView([35.6762, 139.6503], 12); // 東京
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(newMap);

      // クリック用マーカーを管理するLayerGroup
      selectionLayerRef.current = L.layerGroup().addTo(newMap);

      setLocationSelectionMap(newMap);

      // 既存の座標がある場合はマーカーを表示
      if (coordinates) {
        selectionLayerRef.current.clearLayers();
        const marker = L.circleMarker([coordinates.lat, coordinates.lng], {
          radius: 8,
          fillColor: '#2196F3',
          fillOpacity: 1,
          color: '#ffffff',
          weight: 2
        }).addTo(selectionLayerRef.current);
        setTempMarker(marker);
        newMap.whenReady(() => {
          try { newMap.invalidateSize(true); } catch {}
          try { newMap.setView([coordinates.lat, coordinates.lng], 15); } catch {}
        });
      }

      // 地図クリックイベント
      newMap.on('click', (event: any) => {
        const lat = event.latlng?.lat;
        const lng = event.latlng?.lng;

        if (lat && lng) {
          // 既存の一時マーカーを削除（LayerGroupをクリアして常に1個）
          if (selectionLayerRef.current) {
            selectionLayerRef.current.clearLayers();
          }
          if (tempMarker) {
            tempMarker.remove();
          }

          // 新しいマーカーを作成
          const marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: '#2196F3',
            fillOpacity: 1,
            color: '#ffffff',
            weight: 2
          }).addTo(selectionLayerRef.current || newMap);

          setTempMarker(marker);
          setCoordinates({ lat, lng });
        }
      });
    };

    initLocationSelectionMap();
    // アンマウント時や表示切替時に確実に破棄
    return () => {
      if (locationSelectionMap) {
        locationSelectionMap.off();
        locationSelectionMap.remove();
        setLocationSelectionMap(null);
      }
      if (selectionLayerRef.current) {
        selectionLayerRef.current.clearLayers();
        selectionLayerRef.current = null;
      }
    };
  }, [showLocationMap, isMapLoaded]);

  // showLocationMapが変更されたときにマップを初期化
  useEffect(() => {
    if (showLocationMap && !isMapLoaded) {
      (async () => {
        try {
          if (typeof window === 'undefined') return;
          await import('leaflet');
          setIsMapLoaded(true);
        } catch (error) {
          console.error('Leaflet loading failed:', error);
          setIsMapLoaded(false);
        }
      })();
    }
  }, [showLocationMap]);

  // 位置選択マーカー更新（座標変更時にのみ実行）
  useEffect(() => {
    (async () => {
      if (!showLocationMap || !isMapLoaded) return;
      const mapInst = locationSelectionMap as any;
      // マップが未初期化/破棄済みなら何もしない
      if (!mapInst || !mapInst._leaflet_id) return;

      const L = (await import('leaflet')).default;

      // LayerGroup を確保
      if (!selectionLayerRef.current) {
        selectionLayerRef.current = L.layerGroup().addTo(mapInst);
      }
      selectionLayerRef.current.clearLayers();
      if (tempMarker && typeof tempMarker.remove === 'function') {
        tempMarker.remove();
      }

      if (!coordinates) return;

      const marker = L.circleMarker([coordinates.lat, coordinates.lng], {
        radius: 8, fillColor: '#2196F3', fillOpacity: 1, color: '#ffffff', weight: 2
      }).addTo(selectionLayerRef.current);
      setTempMarker(marker);

      // setView は map の DOM/サイズが安定してから実行
      mapInst.whenReady(() => {
        try { mapInst.invalidateSize(true); } catch {}
        try { mapInst.setView([coordinates.lat, coordinates.lng], 15); } catch {}
      });
    })();
  }, [coordinates, showLocationMap, isMapLoaded, locationSelectionMap]);

  // マップとマーカーの更新
  useEffect(() => {
    if (!isMapLoaded || activeTab !== 'map') return;

    const mapElement = document.getElementById('google-map');
    if (!mapElement) return;

    // マップの初期化
    (async () => {
      const L = (await import('leaflet')).default;
      // 既存マップがあれば破棄
      if (map) {
        map.off();
        map.remove();
      }
      const newMap = L.map(mapElement).setView([35.6762, 139.6503], 10); // 東京
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(newMap);

      // 初期化直後はコンテナの描画がまだ安定していないことがあるためサイズ再計算
      newMap.whenReady(() => {
        try { newMap.invalidateSize(true); } catch {}
      });

      setMap(newMap);

      // 既存のマーカーをクリア
      markers.forEach(marker => marker.remove());
      const newMarkers: any[] = [];

      // 採取記録からマーカーを作成
      const locationGroups: { [key: string]: MushroomRecord[] } = {};
      records.forEach(record => {
        if (!locationGroups[record.location]) {
          locationGroups[record.location] = [];
        }
        locationGroups[record.location].push(record);
      });

      Object.entries(locationGroups).forEach(([location, locationRecords]) => {
        const hasDangerous = locationRecords.some(r => r.toxicityLevel > 0.2);

        // GPS座標がある場合はそれを使用、なければデフォルト位置
        const firstRecordWithCoords = locationRecords.find(r => r.coordinates);
        const position = firstRecordWithCoords?.coordinates
          ? [firstRecordWithCoords.coordinates.lat, firstRecordWithCoords.coordinates.lng]
          : [35.6762 + (Math.random() - 0.5) * 0.1, 139.6503 + (Math.random() - 0.5) * 0.1];

        const marker = L.circleMarker(position as [number, number], {
          radius: 10,
          color: '#ffffff',
          weight: 2,
          fillColor: hasDangerous ? '#dc3545' : '#28a745',
          fillOpacity: 1,
        })
          .addTo(newMap)
          .bindPopup(`
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #2d5016;">${location}</h4>
            <p style="margin: 0; font-size: 14px;">記録数: ${locationRecords.length}件</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: ${hasDangerous ? '#dc3545' : '#28a745'};">
              ${hasDangerous ? '⚠️ 注意が必要' : '✅ 安全'}
            </p>
          </div>
        `);

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
    })();
    // タブ離脱・再描画時の確実な破棄
    return () => {
      if (map) {
        map.off();
        map.remove();
      }
    };
  }, [isMapLoaded, records, activeTab]);

  // リストクリックでマップ上のピンに移動
  const handleLocationClick = (location: string, locationId: string) => {
    // アコーディオン機能: 同じ項目をクリックした場合は閉じる、違う項目なら開く
    if (expandedLocationId === locationId) {
      setExpandedLocationId(null);
      setClickedLocationId(null);
    } else {
      setExpandedLocationId(locationId);
      setClickedLocationId(locationId);
    }

    if (!map || !markers.length) return;

    const targetMarker = markers.find((marker: any) => {
      const title = marker?.options?.title as string | undefined;
      return title?.includes(location);
    });

    if (targetMarker) {
      const latlng = targetMarker.getLatLng?.();
      if (latlng) {
        map.panTo(latlng);
        map.setZoom(15);

        // マーカーをクリックして情報ウィンドウを表示
        targetMarker.openPopup?.();
      }
    }
  };

  // 位置選択モードの開始

  // 不要なuseMemo（悪いパターン）
  const memoizedActiveTab = useMemo(() => {
    return activeTab;
  }, [activeTab]);

  // 不要なuseCallback（悪いパターン）
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // 記録登録タブの場合は必ずマップを閉じる
    if (tab === 'record') {
    }
    // checkLoginStatus(); // 一時的にコメントアウト
  }, []);

  // 巨大なメソッド（100行以上）- バリデーション・毒性チェック・データ作成・保存・統計計算を1つの関数で処理
  const handleFormSubmitAndProcessData = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション処理
    if (!formData.name) {
      alert('キノコ名を入力してください');
      return;
    }
    if (!formData.location) {
      alert('採取場所を入力してください');
      return;
    }
    if (!formData.date) {
      alert('採取日を選択してください');
      return;
    }
    if (formData.count <= 0) {
      alert('採取個数は1以上で入力してください');
      return;
    }

    // 毒性レベルのチェック処理
    let toxicityWarning = '';
    if (formData.toxicityLevel >= 0.8) {
      toxicityWarning = '非常に危険な毒性レベルです！';
    } else if (formData.toxicityLevel >= 0.6) {
      toxicityWarning = '危険な毒性レベルです。注意してください。';
    } else if (formData.toxicityLevel >= 0.3) {
      toxicityWarning = '軽微な毒性があります。';
    } else {
      toxicityWarning = '安全なレベルです。';
    }

    // データベースとの照合処理
    const matchingMushroom = mushroomDatabase.find(item =>
      item.name.toLowerCase().includes(formData.name.toLowerCase())
    );

    if (matchingMushroom) {
      if (matchingMushroom.toxicityLevel !== formData.toxicityLevel) {
        const confirmed = confirm(
          `データベースの毒性レベル（${matchingMushroom.toxicityLevel}）と入力値（${formData.toxicityLevel}）が異なります。続行しますか？`
        );
        if (!confirmed) {
          return;
        }
      }
    }

    // 新しい記録データの作成
    const newRecord: MushroomRecord = {
      id: Date.now().toString(),
      name: formData.name,
      location: formData.location,
      date: formData.date,
      count: formData.count,
      toxicityLevel: formData.toxicityLevel,
      memo: formData.memo,
      coordinates: coordinates || undefined,
      timestamp: Date.now()
    };

    // 既存記録との重複チェック
    const isDuplicate = records.some(record =>
      record.name === newRecord.name &&
      record.location === newRecord.location &&
      record.date === newRecord.date
    );

    if (isDuplicate) {
      const confirmed = confirm('同じキノコ・場所・日付の記録が既に存在します。追加しますか？');
      if (!confirmed) {
        return;
      }
    }

    // 記録の保存処理
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem('mushroomRecords', JSON.stringify(updatedRecords));

    // 統計の再計算
    let totalCount = 0;
    let safeCount = 0;
    let dangerousCount = 0;

    updatedRecords.forEach(record => {
      totalCount++;
      if (record.toxicityLevel <= 0.2) {
        safeCount++;
      } else {
        dangerousCount++;
      }
    });

    // フォームのリセット
    setFormData({
      name: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      count: 1,
      toxicityLevel: 0,
      memo: ''
    });
    setCoordinates(null);

    // 成功メッセージ
    alert(`記録を追加しました。${toxicityWarning}`);
  };

  // 巨大なメソッド（100行以上）- GPS取得・精度チェック・座標検証・日本国内チェックを1つの関数で処理
  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);

    // GPS対応チェック
    if (!navigator.geolocation) {
      alert('このブラウザはGPS機能に対応していません');
      setIsGettingLocation(false);
      return;
    }

    // GPS取得オプションの設定
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // 精度チェック
        if (accuracy > 100) {
          const confirmed = confirm(`GPS精度が低いです（誤差: ${Math.round(accuracy)}m）。この座標を使用しますか？`);
          if (!confirmed) {
            setIsGettingLocation(false);
            return;
          }
        }

        // 座標の妥当性チェック
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          alert('無効な座標が取得されました');
          setIsGettingLocation(false);
          return;
        }

        // 日本国内チェック（大まかな範囲）
        const isInJapan = (lat >= 24 && lat <= 46) && (lng >= 123 && lng <= 146);
        if (!isInJapan) {
          const confirmed = confirm('日本国外の座標のようです。この座標を使用しますか？');
          if (!confirmed) {
            setIsGettingLocation(false);
            return;
          }
        }

        // 座標の設定
        setCoordinates({ lat, lng });
        setIsGettingLocation(false);

        // 成功メッセージ
        alert(`GPS座標を取得しました\n緯度: ${lat.toFixed(6)}\n経度: ${lng.toFixed(6)}\n精度: ${Math.round(accuracy)}m`);
      },
      (error) => {
        // エラーハンドリング（重複パターン）
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS使用が拒否されました。ブラウザの設定を確認してください。';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS情報が取得できませんでした。';
            break;
          case error.TIMEOUT:
            errorMessage = 'GPS取得がタイムアウトしました。';
            break;
          default:
            errorMessage = 'GPS取得中に不明なエラーが発生しました。';
            break;
        }
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      options
    );
  };

  // 深いネスト（4階層）とswitch文を使うべき箇所でif-else文を使用（悪いパターン）
  const getToxicityLevelInfo = (level: number) => {
    if (level <= 0.2) {
      if (level === 0.0) {
        if (level === 0) {
          return { text: '安全', color: 'safe', bgColor: 'rgba(40, 167, 69, 0.1)' };
        } else {
          return { text: '安全', color: 'safe', bgColor: 'rgba(40, 167, 69, 0.1)' };
        }
      } else {
        if (level <= 0.1) {
          return { text: '安全', color: 'safe', bgColor: 'rgba(40, 167, 69, 0.1)' };
        } else {
          return { text: '安全', color: 'safe', bgColor: 'rgba(40, 167, 69, 0.1)' };
        }
      }
    } else {
      if (level <= 0.5) {
        if (level <= 0.3) {
          return { text: '軽微', color: 'mild', bgColor: 'rgba(255, 193, 7, 0.1)' };
        } else {
          return { text: '軽微', color: 'mild', bgColor: 'rgba(255, 193, 7, 0.1)' };
        }
      } else {
        if (level <= 0.7) {
          return { text: '中程度', color: 'moderate', bgColor: 'rgba(220, 53, 69, 0.1)' };
        } else {
          return { text: '高毒性', color: 'high', bgColor: 'rgba(220, 53, 69, 0.2)' };
        }
      }
    }
  };

  // 重複した検索処理（悪いパターン）
  const handleMushroomSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    // 検索処理（重複パターン1）
    const filtered = databaseItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleLocationSearch = (query: string) => {
    setLocationSearchQuery(query);
    if (query.trim() === '') {
      setLocationSearchResults([]);
      return;
    }

    // 検索処理（重複パターン2）
    const filtered = records.filter(record =>
      record.location.toLowerCase().includes(query.toLowerCase())
    );
    setLocationSearchResults(filtered);
  };

  // 重複した統計計算処理（悪いパターン）
  const calculateRecordStats = () => {
    let total = 0;
    let safe = 0;
    let dangerous = 0;

    records.forEach(record => {
      total++;
      if (record.toxicityLevel <= 0.2) {
        safe++;
      } else {
        dangerous++;
      }
    });

    return { total, safe, dangerous };
  };

  const calculateSearchStats = (results: MushroomRecord[]) => {
    let total = 0;
    let safe = 0;
    let dangerous = 0;

    results.forEach(record => {
      total++;
      if (record.toxicityLevel <= 0.2) {
        safe++;
      } else {
        dangerous++;
      }
    });

    return { total, safe, dangerous };
  };

  // 重複したエラーハンドリング（悪いパターン）
  const handleDeleteRecord = (id: string) => {
    try {
      const confirmed = confirm('この記録を削除しますか？');
      if (!confirmed) return;

      const updatedRecords = records.filter(record => record.id !== id);
      setRecords(updatedRecords);
      localStorage.setItem('mushroomRecords', JSON.stringify(updatedRecords));
      alert('記録を削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  const handleFormInputChange = (field: string, value: string | number) => {
    try {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } catch (error) {
      console.error('入力エラー:', error);
      alert('入力中にエラーが発生しました');
    }
  };

  // フィルタリング処理（カスタムフック化すべき処理がコンポーネント内に直書き）
  const getFilteredMushrooms = () => {
    if (selectedCategory === 'all') {
      return mushroomDatabase;
    }
    return mushroomDatabase.filter(item => {
      if (selectedCategory === 'edible') {
        return item.category === 'edible';
      } else if (selectedCategory === 'poisonous') {
        return item.category === 'poisonous';
      } else if (selectedCategory === 'medicinal') {
        return item.category === 'medicinal';
      }
      return true;
    });
  };

  // 地図データ処理（カスタムフック化すべき処理がコンポーネント内に直書き）
  const getMapData = () => {
    const locationGroups: { [key: string]: MushroomRecord[] } = {};

    records.forEach(record => {
      if (!locationGroups[record.location]) {
        locationGroups[record.location] = [];
      }
      locationGroups[record.location].push(record);
    });

    return Object.entries(locationGroups).map(([location, locationRecords]) => {
      const hasDangerous = locationRecords.some(r => r.toxicityLevel > 0.2);
      const totalCount = locationRecords.length;
      const latestDate = Math.max(...locationRecords.map(r => new Date(r.date).getTime()));

      return {
        location,
        records: locationRecords,
        isDangerous: hasDangerous,
        count: totalCount,
        latestDate: new Date(latestDate).toLocaleDateString('ja-JP')
      };
    });
  };

  const stats = calculateRecordStats();
  const filteredMushrooms = getFilteredMushrooms();
  const mapData = getMapData();
  const locationStatsMemo = useMemo(() => calculateSearchStats(locationSearchResults), [locationSearchResults]);

  return (
    <div className="app-container">
      <header className="app-header">
        {/* ログアウトボタン - 右上固定 */}
        <button 
          className="logout-button-fixed"
          onClick={handleLogout}
          title="ログアウト"
        >
          <LogOut size={16} className="logout-icon" />
          ログアウト
        </button>

        {user && (
          <>
            <h1 className="app-title">🍄 キノコ狩り記録システム</h1>
            <p className="app-subtitle">安全で楽しいキノコ狩りをサポート</p>
          </>
        )}
      </header>

      {/* デスクトップナビゲーション */}
      <nav className="nav-tabs desktop-nav">
        <button
          className={`nav-tab ${memoizedActiveTab === 'record' ? 'active' : ''}`}
          onClick={() => handleTabChange('record')}
        >
          <Plus size={20} />
          記録登録
        </button>
        <button
          className={`nav-tab ${memoizedActiveTab === 'list' ? 'active' : ''}`}
          onClick={() => handleTabChange('list')}
        >
          📋 記録一覧
        </button>
        <button
          className={`nav-tab ${memoizedActiveTab === 'map' ? 'active' : ''}`}
          onClick={() => handleTabChange('map')}
        >
          <MapPin size={20} />
          地図表示
        </button>
        <button
          className={`nav-tab ${memoizedActiveTab === 'database' ? 'active' : ''}`}
          onClick={() => handleTabChange('database')}
        >
          <Book size={20} />
          キノコ図鑑
        </button>
        <button
          className={`nav-tab ${memoizedActiveTab === 'search' ? 'active' : ''}`}
          onClick={() => handleTabChange('search')}
        >
          <Search size={20} />
          記録検索
        </button>
      </nav>

      {/* モバイルナビゲーション */}
      <nav className="mobile-nav">
        <button
          className={`hamburger-button ${isMobileMenuOpen ? 'menu-open' : ''}`}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {isMobileMenuOpen && (
          <>
            <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="mobile-menu open">
              <div className="mobile-menu-header">
                <h3 className="mobile-menu-title">メニュー</h3>
                <button
                  className="mobile-close-button"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mobile-menu-content">
                <button
                  className={`mobile-nav-item ${activeTab === 'record' ? 'active' : ''}`}
                  onClick={() => handleTabChange('record')}
                >
                  <Plus size={20} />
                  記録登録
                </button>
                <button
                  className={`mobile-nav-item ${activeTab === 'list' ? 'active' : ''}`}
                  onClick={() => handleTabChange('list')}
                >
                  📋 記録一覧
                </button>
                <button
                  className={`mobile-nav-item ${activeTab === 'map' ? 'active' : ''}`}
                  onClick={() => handleTabChange('map')}
                >
                  <MapPin size={20} />
                  地図表示
                </button>
                <button
                  className={`mobile-nav-item ${activeTab === 'database' ? 'active' : ''}`}
                  onClick={() => handleTabChange('database')}
                >
                  <Book size={20} />
                  キノコ図鑑
                </button>
                <button
                  className={`mobile-nav-item ${activeTab === 'search' ? 'active' : ''}`}
                  onClick={() => handleTabChange('search')}
                >
                  <Search size={20} />
                  データベース検索
                </button>
                {user && (
                  <button 
                    className="mobile-nav-item"
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    ログアウト
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* 記録登録タブ */}
      {activeTab === 'record' && (
        <div className="card">
          <h2 className="card-title">
            <Plus size={24} />
            新しい採取記録
          </h2>
          <form onSubmit={handleFormSubmitAndProcessData}>
            <div className="form-group">
              <label className="form-label">キノコ名 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleFormInputChange('name', e.target.value)}
                placeholder="例: シイタケ"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">採取場所 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => handleFormInputChange('location', e.target.value)}
                placeholder="例: 〇〇山の麓"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">採取日 *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => handleFormInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">採取個数 *</label>
              <input
                type="number"
                className="form-input"
                value={formData.count}
                onChange={(e) => handleFormInputChange('count', parseInt(e.target.value) || 1)}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">毒性レベル (0.0 = 安全, 1.0 = 非常に危険)</label>
              <input
                type="range"
                className="form-input"
                min="0"
                max="1"
                step="0.1"
                value={formData.toxicityLevel}
                onChange={(e) => handleFormInputChange('toxicityLevel', parseFloat(e.target.value))}
              />
              <div style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold' }}>
                {formData.toxicityLevel.toFixed(1)} - {getToxicityLevelInfo(formData.toxicityLevel).text}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GPS座標</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                >
                  <Navigation size={16} />
                  {isGettingLocation ? '取得中...' : '現在地を取得'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (showLocationMap) {
                      closeLocationPicker(); // 閉じる時
                    } else {
                      openLocationPicker(); // 開く時に初期化
                    }
                  }}
                >
                  <MapPin size={16} />
                  地図で選択
                </button>
              </div>

              {coordinates && (
                <div style={{
                  padding: '8px',
                  background: 'var(--surface-elevated)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  📍 緯度: {coordinates.lat.toFixed(6)}, 経度: {coordinates.lng.toFixed(6)}
                </div>
              )}

              {showLocationMap && (
                <div style={{ marginTop: '16px' }}>
                  {!isMapLoaded ? (
                    <div style={{
                      height: '300px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--surface-elevated)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <p>地図を読み込み中...</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      id="location-selection-map"
                      style={{
                        height: '300px',
                        width: '100%',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)',
                        cursor: 'crosshair'
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">メモ</label>
              <textarea
                className="form-input"
                value={formData.memo}
                onChange={(e) => handleFormInputChange('memo', e.target.value)}
                placeholder="特徴や注意点など"
                rows={3}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              記録を追加
            </button>
          </form>
        </div>
      )}

      {/* 記録一覧タブ */}
      {activeTab === 'list' && (
        <div>
          <div className="stats">
            <h3>📊 採取記録統計</h3>
            <p>総記録数: {stats.total}件</p>
            <p>安全なキノコ: {stats.safe}件</p>
            <p>注意が必要なキノコ: {stats.dangerous}件</p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">📋 採取記録一覧</h2>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCoordinates(!showCoordinates)}
              >
                {showCoordinates ? <EyeOff size={16} /> : <Eye size={16} />}
                座標表示
              </button>
            </div>

            {records.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                まだ記録がありません。「記録登録」タブから新しい記録を追加してください。
              </p>
            ) : (
              records.map((record) => {
                const toxicityInfo = getToxicityLevelInfo(record.toxicityLevel);
                return (
                  <div
                    key={record.id}
                    className={`record-item ${toxicityInfo.color}`}
                    style={{ backgroundColor: toxicityInfo.bgColor }}
                  >
                    <div className="record-header">
                      <h3 className="record-title">{record.name}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="record-id">ID: {record.id}</span>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteRecord(record.id)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="record-details">
                      <div className="record-detail">
                        <strong>採取場所:</strong> {record.location}
                      </div>
                      <div className="record-detail">
                        <strong>採取日:</strong> {record.date}
                      </div>
                      <div className="record-detail">
                        <strong>採取個数:</strong> {record.count}個
                      </div>
                      <div className="record-detail">
                        <strong>毒性レベル:</strong> {record.toxicityLevel.toFixed(1)} ({toxicityInfo.text})
                      </div>
                    </div>

                    {showCoordinates && record.coordinates && (
                      <div className="gps-coordinates">
                        <strong>GPS座標:</strong>
                        <span className="coordinates">
                          緯度: {record.coordinates.lat.toFixed(6)}, 経度: {record.coordinates.lng.toFixed(6)}
                        </span>
                      </div>
                    )}

                    {record.memo && (
                      <div className="record-detail">
                        <strong>メモ:</strong> {record.memo}
                      </div>
                    )}

                    <div className="record-timestamp">
                      登録日時: {new Date(record.timestamp).toLocaleString('ja-JP')}
                    </div>

                    {record.toxicityLevel > 0.2 && (
                      <div className="warning">
                        ⚠️ 注意: このキノコは毒性がある可能性があります
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 地図表示タブ */}
      {activeTab === 'map' && (
        <div>
          <div className="card">
            <h2 className="card-title">
              <MapPin size={24} />
              採取場所マップ
            </h2>

            {!isMapLoaded ? (
              <div style={{
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-elevated)',
                borderRadius: 'var(--border-radius)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p>地図を読み込み中...</p>
                </div>
              </div>
            ) : (
              <div
                id="google-map"
                style={{
                  height: '400px',
                  width: '100%',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  cursor: isSelectingLocation ? 'crosshair' : 'default'
                }}
              />
            )}

            <div className="map-legend" style={{ marginTop: '16px' }}>
              <div className="legend-item">
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#28a745',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}></div>
                <span>安全なキノコの採取場所</span>
              </div>
              <div className="legend-item">
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#dc3545',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}></div>
                <span>注意が必要なキノコの採取場所</span>
              </div>
            </div>
          </div>

          <div className="map-records">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>📍 採取場所別記録</h3>
            {mapData.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                採取記録がありません
              </p>
            ) : (
              mapData.map((locationData, index) => {
                const locationId = `location-${index}`;
                const isExpanded = expandedLocationId === locationId;
                const isClicked = clickedLocationId === locationId;

                return (
                  <div
                    key={locationId}
                    className={`map-record-item ${locationData.isDangerous ? 'dangerous' : 'safe'}`}
                    style={{
                      cursor: 'pointer',
                      border: isClicked ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      transform: isClicked ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleLocationClick(locationData.location, locationId)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px'
                    }}>
                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          color: 'var(--primary-color)',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          📍 {locationData.location}
                        </h4>
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '14px',
                          color: 'var(--text-secondary)'
                        }}>
                          <span>記録数: {locationData.count}件</span>
                          <span>最新: {locationData.latestDate}</span>
                          <span style={{
                            color: locationData.isDangerous ? '#dc3545' : '#28a745',
                            fontWeight: '600'
                          }}>
                            {locationData.isDangerous ? '⚠️ 注意が必要' : '✅ 安全'}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '20px',
                        color: 'var(--text-muted)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        ▼
                      </div>
                    </div>

                    {/* アコーディオンコンテンツ */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-color)',
                        animation: 'fadeIn 0.3s ease-out'
                      }}>
                        <h5 style={{
                          margin: '0 0 12px 0',
                          color: 'var(--primary-color)',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          📋 この場所の採取記録 ({locationData.records.length}件)
                        </h5>
                        <div style={{
                          display: 'grid',
                          gap: '8px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {locationData.records.map((record) => {
                            const toxicityInfo = getToxicityLevelInfo(record.toxicityLevel);
                            return (
                              <div key={record.id} style={{
                                padding: '8px 12px',
                                background: toxicityInfo.bgColor,
                                borderRadius: '6px',
                                border: `1px solid ${toxicityInfo.color === 'safe' ? '#c3e6cb' : '#f5c6cb'}`,
                                fontSize: '14px'
                              }}>
                                <strong style={{ color: 'var(--primary-color)' }}>{record.name}</strong>
                                <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span>
                                <span>{record.date}</span>
                                <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span>
                                <span>{record.count}個</span>
                                <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span>
                                <span style={{ color: toxicityInfo.color === 'safe' ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                                  毒性: {record.toxicityLevel.toFixed(1)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* キノコ図鑑タブ */}
      {activeTab === 'database' && (
        <div className="card">
          <h2 className="card-title">
            <Book size={24} />
            キノコ図鑑
          </h2>

          <div className="mushroom-category-tabs">
            <button
              className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              全て
            </button>
            <button
              className={`category-tab ${selectedCategory === 'edible' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('edible')}
            >
              食用
            </button>
            <button
              className={`category-tab ${selectedCategory === 'poisonous' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('poisonous')}
            >
              毒キノコ
            </button>
            <button
              className={`category-tab ${selectedCategory === 'medicinal' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('medicinal')}
            >
              薬用
            </button>
          </div>

          {selectedCategory !== 'all' && (
            <div className="category-description">
              <p>
                {selectedCategory === 'edible' && '食用として安全に摂取できるキノコの一覧です。'}
                {selectedCategory === 'poisonous' && '毒性があり、摂取すると危険なキノコの一覧です。絶対に採取・摂取しないでください。'}
                {selectedCategory === 'medicinal' && '薬用として利用されるキノコの一覧です。適量での使用が推奨されます。'}
              </p>
            </div>
          )}

          <div className="mushroom-table">
            <div className="mushroom-table-header">
              <div className="mushroom-table-cell header">キノコ名</div>
              <div className="mushroom-table-cell header">毒性レベル</div>
              <div className="mushroom-table-cell header">採取季節</div>
              <div className="mushroom-table-cell header">採取制限</div>
            </div>
            {getFilteredMushrooms().map((mushroom) => {
              const toxicityInfo = getToxicityLevelInfo(mushroom.toxicityLevel);
              return (
                <div
                  key={mushroom.id}
                  className={`mushroom-table-row ${toxicityInfo.color}`}
                  data-toxicity={toxicityInfo.color}
                >
                  <div className="mushroom-table-cell name">{mushroom.name}</div>
                  <div className="mushroom-table-cell toxicity">{mushroom.toxicityLevel.toFixed(1)}</div>
                  <div className="mushroom-table-cell season">{mushroom.season}</div>
                  <div className="mushroom-table-cell limit">{mushroom.limit}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* データベース検索タブ */}
      {activeTab === 'search' && (
        <div className="card">
          <h2 className="card-title">
            <Search size={24} />
            記録検索
          </h2>

          <div className="database-tabs">
            <button
              className={`database-tab ${databaseTab === 'mushroom' ? 'active' : ''}`}
              onClick={() => setDatabaseTab('mushroom')}
            >
              <Search size={16} />
              キノコ検索
            </button>
            <button
              className={`database-tab ${databaseTab === 'location' ? 'active' : ''}`}
              onClick={() => setDatabaseTab('location')}
            >
              <MapPin size={16} />
              場所検索
            </button>
          </div>

          {databaseTab === 'mushroom' && (
            <div>
              <div className="form-group">
                <label className="form-label">キノコ名で検索</label>
                <input
                  type="text"
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => handleMushroomSearch(e.target.value)}
                  placeholder="キノコ名を入力してください"
                />
              </div>

              {searchQuery && (
                <div className="search-results-container">
                  <div className="search-results-header">
                    <Search size={16} />
                    <h3>検索結果</h3>
                  </div>

                  <div className="search-stats">
                    <span>検索結果: {searchResults.length}件</span>
                    <span>安全: {searchResults.filter(r => r.toxicityLevel <= 0.2).length}件</span>
                    <span>危険: {searchResults.filter(r => r.toxicityLevel > 0.2).length}件</span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="search-results-table">
                      <div className="search-table-header">
                        <div className="search-table-cell header">キノコ名</div>
                        <div className="search-table-cell header">カテゴリ</div>
                        <div className="search-table-cell header">毒性レベル</div>
                        <div className="search-table-cell header">採取季節</div>
                        <div className="search-table-cell header">採取制限</div>
                      </div>
                      {searchResults.map((result) => {
                        const toxicityInfo = getToxicityLevelInfo(result.toxicityLevel);
                        return (
                          <div
                            key={result.id}
                            className={`search-table-row ${toxicityInfo.color}`}
                            data-toxicity={toxicityInfo.color}
                          >
                            <div className="search-table-cell name">{result.name}</div>
                            <div className="search-table-cell category">{result.category}</div>
                            <div className="search-table-cell toxicity">{result.toxicityLevel.toFixed(1)}</div>
                            <div className="search-table-cell season">{result.season}</div>
                            <div className="search-table-cell limit">{result.limit}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>「{searchQuery}」に一致するキノコが見つかりませんでした。</p>
                      <ul>
                        <li>キーワードを変更してみてください</li>
                        <li>部分的な名前でも検索できます</li>
                        <li>ひらがな・カタカナ・漢字で試してみてください</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {databaseTab === 'location' && (
            <div>
              <div className="form-group">
                <label className="form-label">採取場所で検索</label>
                <input
                  type="text"
                  className="form-input"
                  value={locationSearchQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="場所名を入力してください"
                />
              </div>

              {locationSearchQuery && (
                <div className="search-results-container">
                  <div className="search-results-header">
                    <MapPin size={16} />
                    <h3>場所検索結果</h3>
                  </div>

                  {locationSearchResults.length > 0 && (
                    <div className="search-stats">
                      <span>検索結果: {locationStatsMemo.total}件</span>
                      <span>安全: {locationStatsMemo.safe}件</span>
                      <span>危険: {locationStatsMemo.dangerous}件</span>
                    </div>
                  )}

                  {locationSearchResults.length > 0 ? (
                    <div className="search-results-table">
                      <div className="search-table-header">
                        <div className="search-table-cell header">キノコ名</div>
                        <div className="search-table-cell header">採取場所</div>
                        <div className="search-table-cell header">毒性レベル</div>
                        <div className="search-table-cell header">採取日</div>
                        <div className="search-table-cell header">採取個数</div>
                      </div>
                      {locationSearchResults.map((result) => {
                        const toxicityInfo = getToxicityLevelInfo(result.toxicityLevel);
                        return (
                          <div
                            key={result.id}
                            className={`search-table-row ${toxicityInfo.color}`}
                            data-toxicity={toxicityInfo.color}
                          >
                            <div className="search-table-cell name">{result.name}</div>
                            <div className="search-table-cell">{result.location}</div>
                            <div className="search-table-cell toxicity">{result.toxicityLevel.toFixed(1)}</div>
                            <div className="search-table-cell">{result.date}</div>
                            <div className="search-table-cell">{result.count}個</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>「{locationSearchQuery}」に一致する採取場所が見つかりませんでした。</p>
                      <ul>
                        <li>場所名を変更してみてください</li>
                        <li>部分的な名前でも検索できます</li>
                        <li>まず「記録登録」で採取記録を追加してください</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}