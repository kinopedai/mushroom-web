import React, { useState, useEffect } from "react";
import {
  Chrome as Mushroom,
  Search,
  BarChart3,
  MapPin,
  Calendar,
  Hash,
  Plus,
  List,
  Map,
  BookOpen,
  Book,
  Menu,
  X,
} from "lucide-react";
import Head from "next/head";

// TypeScript型定義
interface MushroomData {
  name: string;
  toxicity: number;
  season: string;
  limit: number;
  category?: string;
}

interface RecordData {
  id: number;
  name: string;
  count: number;
  season: string;
  location: string;
  gps: { lat: number; lng: number };
  toxicity: number;
  status: string;
  timestamp: Date;
}

// グローバル変数でキノコデータを管理（悪い書き方）
let globalMushroomData: RecordData[] = [];
let a = 0; // カウンター
let temp = "";
let gpsData = { lat: 0, lng: 0 };
let mushroomDatabase: MushroomData[] = [
  // あいうえお順
  {
    name: "アカハツ",
    toxicity: 0.0,
    season: "秋",
    limit: 18,
    category: "主要",
  },
  {
    name: "アカヤマドリ",
    toxicity: 0.0,
    season: "夏",
    limit: 12,
    category: "主要",
  },
  {
    name: "アミガサタケ",
    toxicity: 0.1,
    season: "春",
    limit: 15,
    category: "主要",
  },
  {
    name: "アミハナイグチ",
    toxicity: 0.0,
    season: "秋",
    limit: 15,
    category: "主要",
  },
  {
    name: "アンズタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 25,
    category: "主要",
  },
  {
    name: "アラゲキクラゲ",
    toxicity: 0.0,
    season: "通年",
    limit: 100,
    category: "主要",
  },
  {
    name: "アワビタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 20,
    category: "主要",
  },
  {
    name: "イボテングタケ",
    toxicity: 0.75,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ウスヒラタケ",
    toxicity: 0.0,
    season: "冬",
    limit: 30,
    category: "主要",
  },
  {
    name: "ウラベニホテイシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 12,
    category: "主要",
  },
  {
    name: "エノキタケ",
    toxicity: 0.0,
    season: "冬",
    limit: 100,
    category: "主要",
  },
  {
    name: "エリンギ",
    toxicity: 0.0,
    season: "秋",
    limit: 30,
    category: "主要",
  },
  {
    name: "オオイチョウタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 8,
    category: "主要",
  },
  {
    name: "オオシロカラカサタケ",
    toxicity: 0.7,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "カエンタケ",
    toxicity: 0.98,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "カワラタケ",
    toxicity: 0.1,
    season: "通年",
    limit: 0,
    category: "主要",
  },
  {
    name: "キクラゲ",
    toxicity: 0.0,
    season: "夏",
    limit: 100,
    category: "主要",
  },
  {
    name: "クリタケ",
    toxicity: 0.1,
    season: "秋",
    limit: 25,
    category: "主要",
  },
  { name: "コウタケ", toxicity: 0.0, season: "秋", limit: 8, category: "主要" },
  {
    name: "コレラタケ",
    toxicity: 0.85,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "サルノコシカケ",
    toxicity: 0.1,
    season: "通年",
    limit: 0,
    category: "主要",
  },
  {
    name: "しいたけ",
    toxicity: 0.0,
    season: "通年",
    limit: 100,
    category: "主要",
  },
  {
    name: "ジコボウ",
    toxicity: 0.0,
    season: "秋",
    limit: 25,
    category: "主要",
  },
  {
    name: "シロタマゴテングタケ",
    toxicity: 0.95,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ショウゲンジ",
    toxicity: 0.0,
    season: "秋",
    limit: 12,
    category: "主要",
  },
  { name: "スギタケ", toxicity: 0.3, season: "秋", limit: 5, category: "主要" },
  {
    name: "スギヒラタケ",
    toxicity: 0.9,
    season: "秋",
    limit: 0,
    category: "主要",
  },
  {
    name: "ススケヤマドリタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 10,
    category: "主要",
  },
  {
    name: "タマゴテングタケ",
    toxicity: 0.9,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "タモギタケ",
    toxicity: 0.0,
    season: "春",
    limit: 25,
    category: "主要",
  },
  {
    name: "チチタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 20,
    category: "主要",
  },
  {
    name: "チャーガ",
    toxicity: 0.1,
    season: "通年",
    limit: 2,
    category: "主要",
  },
  {
    name: "ツキヨタケ",
    toxicity: 0.75,
    season: "秋",
    limit: 0,
    category: "主要",
  },
  {
    name: "テングタケ",
    toxicity: 0.7,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ドクアジロガサ",
    toxicity: 0.8,
    season: "秋",
    limit: 0,
    category: "主要",
  },
  {
    name: "ドクササコ",
    toxicity: 0.8,
    season: "秋",
    limit: 0,
    category: "主要",
  },
  {
    name: "ドクツルタケ",
    toxicity: 0.95,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ドクベニタケ",
    toxicity: 0.85,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ドクヤマドリ",
    toxicity: 0.8,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "トランペットタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 15,
    category: "主要",
  },
  { name: "ナメコ", toxicity: 0.0, season: "秋", limit: 50, category: "主要" },
  {
    name: "ナラタケ",
    toxicity: 0.1,
    season: "秋",
    limit: 30,
    category: "主要",
  },
  {
    name: "ニガクリタケ",
    toxicity: 0.7,
    season: "秋",
    limit: 0,
    category: "主要",
  },
  {
    name: "ニセクロハツ",
    toxicity: 0.75,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ヌメリガサ",
    toxicity: 0.2,
    season: "秋",
    limit: 10,
    category: "主要",
  },
  {
    name: "ヌメリスギタケ",
    toxicity: 0.2,
    season: "秋",
    limit: 10,
    category: "主要",
  },
  {
    name: "ハタケシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 20,
    category: "主要",
  },
  {
    name: "ハツタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 20,
    category: "主要",
  },
  {
    name: "ハナイグチ",
    toxicity: 0.0,
    season: "秋",
    limit: 30,
    category: "主要",
  },
  {
    name: "バライロウラベニイロガワリ",
    toxicity: 0.7,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ヒトヨタケ",
    toxicity: 0.6,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ヒラタケ",
    toxicity: 0.0,
    season: "冬",
    limit: 40,
    category: "主要",
  },
  {
    name: "ブナシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 50,
    category: "主要",
  },
  {
    name: "フクロツルタケ",
    toxicity: 0.9,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ベニテングタケ",
    toxicity: 0.8,
    season: "夏",
    limit: 0,
    category: "主要",
  },
  {
    name: "ポルチーニ",
    toxicity: 0.0,
    season: "夏",
    limit: 8,
    category: "主要",
  },
  {
    name: "ホンシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 10,
    category: "主要",
  },
  {
    name: "マイタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 20,
    category: "主要",
  },
  { name: "まつたけ", toxicity: 0.0, season: "秋", limit: 5, category: "主要" },
  {
    name: "マンネンタケ",
    toxicity: 0.1,
    season: "通年",
    limit: 3,
    category: "主要",
  },
  {
    name: "ムキタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 30,
    category: "主要",
  },
  {
    name: "ムラサキアブラシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 10,
    category: "主要",
  },
  {
    name: "ムラサキシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 15,
    category: "主要",
  },
  {
    name: "ヤマイグチ",
    toxicity: 0.0,
    season: "夏",
    limit: 20,
    category: "主要",
  },
  {
    name: "ヤマシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 15,
    category: "主要",
  },
  {
    name: "ヤマドリタケモドキ",
    toxicity: 0.0,
    season: "夏",
    limit: 15,
    category: "主要",
  },
  {
    name: "ヤマブシタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 10,
    category: "主要",
  },
];

// カテゴリ別キノコデータ
let regionalMushrooms: MushroomData[] = [
  {
    name: "アイカワタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 5,
    category: "希少種",
  },
  {
    name: "イワタケ",
    toxicity: 0.0,
    season: "通年",
    limit: 3,
    category: "希少種",
  },
  {
    name: "ウチワタケ",
    toxicity: 0.1,
    season: "夏",
    limit: 0,
    category: "希少種",
  },
  {
    name: "エゾハリタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 8,
    category: "希少種",
  },
  {
    name: "オオツガタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 5,
    category: "希少種",
  },
  {
    name: "カラマツベニハナイグチ",
    toxicity: 0.0,
    season: "秋",
    limit: 15,
    category: "希少種",
  },
  {
    name: "キハダタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 10,
    category: "希少種",
  },
  {
    name: "クロカワ",
    toxicity: 0.0,
    season: "春",
    limit: 8,
    category: "希少種",
  },
  {
    name: "コガネタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 12,
    category: "希少種",
  },
  {
    name: "サクラシメジ",
    toxicity: 0.0,
    season: "春",
    limit: 15,
    category: "希少種",
  },
  {
    name: "シロヌメリイグチ",
    toxicity: 0.0,
    season: "夏",
    limit: 20,
    category: "希少種",
  },
  {
    name: "タカネオオシロタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 5,
    category: "希少種",
  },
  {
    name: "ツガタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 10,
    category: "希少種",
  },
  {
    name: "ナガエノスギタケ",
    toxicity: 0.2,
    season: "秋",
    limit: 3,
    category: "希少種",
  },
  {
    name: "ハナビラタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 8,
    category: "希少種",
  },
  {
    name: "ヒメマツタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 12,
    category: "希少種",
  },
  {
    name: "フサタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 15,
    category: "希少種",
  },
  {
    name: "ホウキタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 20,
    category: "希少種",
  },
  {
    name: "マスタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 10,
    category: "希少種",
  },
  {
    name: "ヤマトタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 8,
    category: "希少種",
  },
];

let microMushrooms: MushroomData[] = [
  {
    name: "アカビョウタケ",
    toxicity: 0.1,
    season: "夏",
    limit: 0,
    category: "微小",
  },
  {
    name: "イトヒキタケ",
    toxicity: 0.0,
    season: "通年",
    limit: 0,
    category: "微小",
  },
  {
    name: "ウスキモリノカサ",
    toxicity: 0.3,
    season: "夏",
    limit: 0,
    category: "微小",
  },
  {
    name: "エダウチホコリタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 0,
    category: "微小",
  },
  {
    name: "オオホコリタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 5,
    category: "微小",
  },
  {
    name: "カビタケ",
    toxicity: 0.2,
    season: "通年",
    limit: 0,
    category: "微小",
  },
  {
    name: "キイロスッポンタケ",
    toxicity: 0.1,
    season: "夏",
    limit: 0,
    category: "微小",
  },
  { name: "クモタケ", toxicity: 0.1, season: "夏", limit: 0, category: "微小" },
  {
    name: "コガネキヌカラカサタケ",
    toxicity: 0.4,
    season: "夏",
    limit: 0,
    category: "微小",
  },
  {
    name: "サビイロクビオレタケ",
    toxicity: 0.2,
    season: "秋",
    limit: 0,
    category: "微小",
  },
  {
    name: "シロオニタケ",
    toxicity: 0.0,
    season: "夏",
    limit: 3,
    category: "微小",
  },
  {
    name: "スジオチバタケ",
    toxicity: 0.1,
    season: "秋",
    limit: 0,
    category: "微小",
  },
  {
    name: "チャヒラタケ",
    toxicity: 0.0,
    season: "通年",
    limit: 0,
    category: "微小",
  },
  { name: "ツチグリ", toxicity: 0.1, season: "秋", limit: 0, category: "微小" },
  {
    name: "ニセショウロ",
    toxicity: 0.2,
    season: "夏",
    limit: 0,
    category: "微小",
  },
  {
    name: "ハイイロシメジ",
    toxicity: 0.0,
    season: "秋",
    limit: 5,
    category: "微小",
  },
  {
    name: "ヒメカバイロタケ",
    toxicity: 0.1,
    season: "夏",
    limit: 0,
    category: "微小",
  },
  {
    name: "フクロシトネタケ",
    toxicity: 0.0,
    season: "秋",
    limit: 0,
    category: "微小",
  },
  {
    name: "ホソツクシタケ",
    toxicity: 0.1,
    season: "春",
    limit: 0,
    category: "微小",
  },
  {
    name: "ミドリスギタケ",
    toxicity: 0.2,
    season: "夏",
    limit: 0,
    category: "微小",
  },
];

let specializedMushrooms: MushroomData[] = [
  {
    name: "アナモルフ菌",
    toxicity: 0.1,
    season: "通年",
    limit: 0,
    category: "専門",
  },
  {
    name: "イグチ科未同定種",
    toxicity: 0.3,
    season: "夏",
    limit: 0,
    category: "専門",
  },
  {
    name: "ウラベニガサ属",
    toxicity: 0.2,
    season: "秋",
    limit: 0,
    category: "専門",
  },
  {
    name: "エントロマ属",
    toxicity: 0.4,
    season: "夏",
    limit: 0,
    category: "専門",
  },
  {
    name: "オキナタケ属",
    toxicity: 0.1,
    season: "秋",
    limit: 0,
    category: "専門",
  },
  {
    name: "カラカサタケ属",
    toxicity: 0.3,
    season: "夏",
    limit: 0,
    category: "専門",
  },
  {
    name: "キシメジ科未分類",
    toxicity: 0.2,
    season: "秋",
    limit: 0,
    category: "専門",
  },
  {
    name: "クヌギタケ属",
    toxicity: 0.1,
    season: "通年",
    limit: 0,
    category: "専門",
  },
  {
    name: "コウヤクタケ属",
    toxicity: 0.1,
    season: "通年",
    limit: 0,
    category: "専門",
  },
  {
    name: "サルノコシカケ科",
    toxicity: 0.1,
    season: "通年",
    limit: 0,
    category: "専門",
  },
  {
    name: "シロキクラゲ科",
    toxicity: 0.0,
    season: "通年",
    limit: 0,
    category: "専門",
  },
  {
    name: "スッポンタケ科",
    toxicity: 0.2,
    season: "夏",
    limit: 0,
    category: "専門",
  },
  {
    name: "テングタケ属未同定",
    toxicity: 0.8,
    season: "夏",
    limit: 0,
    category: "専門",
  },
  {
    name: "ナヨタケ属",
    toxicity: 0.3,
    season: "秋",
    limit: 0,
    category: "専門",
  },
  {
    name: "ハラタケ科未分類",
    toxicity: 0.2,
    season: "夏",
    limit: 0,
    category: "専門",
  },
  {
    name: "ヒダナシタケ目",
    toxicity: 0.1,
    season: "通年",
    limit: 0,
    category: "専門",
  },
  {
    name: "フウセンタケ属",
    toxicity: 0.5,
    season: "秋",
    limit: 0,
    category: "専門",
  },
  {
    name: "ベニタケ属未同定",
    toxicity: 0.4,
    season: "夏",
    limit: 0,
    category: "専門",
  },
  {
    name: "モエギタケ属",
    toxicity: 0.3,
    season: "秋",
    limit: 0,
    category: "専門",
  },
  {
    name: "ヤマドリタケ属",
    toxicity: 0.0,
    season: "夏",
    limit: 0,
    category: "専門",
  },
];

let introducedMushrooms: MushroomData[] = [
  {
    name: "アガリクス",
    toxicity: 0.0,
    season: "通年",
    limit: 20,
    category: "帰化",
  },
  {
    name: "イタリアンオイスター",
    toxicity: 0.0,
    season: "秋",
    limit: 30,
    category: "帰化",
  },
  {
    name: "ウッドイヤー",
    toxicity: 0.0,
    season: "通年",
    limit: 50,
    category: "帰化",
  },
  {
    name: "エルムオイスター",
    toxicity: 0.0,
    season: "冬",
    limit: 25,
    category: "帰化",
  },
  {
    name: "オレンジオイスター",
    toxicity: 0.0,
    season: "秋",
    limit: 20,
    category: "帰化",
  },
  {
    name: "キングオイスター",
    toxicity: 0.0,
    season: "通年",
    limit: 30,
    category: "帰化",
  },
  {
    name: "クリミニ",
    toxicity: 0.0,
    season: "通年",
    limit: 50,
    category: "帰化",
  },
  {
    name: "シメジ（ブナシメジ）",
    toxicity: 0.0,
    season: "通年",
    limit: 40,
    category: "帰化",
  },
  {
    name: "ポートベロ",
    toxicity: 0.0,
    season: "通年",
    limit: 15,
    category: "帰化",
  },
  {
    name: "マッシュルーム",
    toxicity: 0.0,
    season: "通年",
    limit: 100,
    category: "帰化",
  },
];

function HomePage() {
  const [currentPage, setCurrentPage] = useState("home");
  const [mushroomCategory, setMushroomCategory] = useState("main");
  const [databaseTab, setDatabaseTab] = useState("encyclopedia"); // 'encyclopedia' or 'search'
  const [b, setB] = useState("");
  const [c, setC] = useState(0);
  const [d, setD] = useState("");
  const [e, setE] = useState("");
  const [f, setF] = useState(false);
  const [g, setG] = useState("");
  const [h, setH] = useState<MushroomData[]>([]); // 検索結果用
  const [i, setI] = useState(""); // 検索キーワード用
  const [currentGPS, setCurrentGPS] = useState({
    lat: 35.681236,
    lng: 139.767125,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 現在選択されているカテゴリのキノコデータを取得する関数
  const getCurrentMushroomData = () => {
    switch (mushroomCategory) {
      case "main":
        return mushroomDatabase;
      case "regional":
        return regionalMushrooms;
      case "micro":
        return microMushrooms;
      case "specialized":
        return specializedMushrooms;
      case "introduced":
        return introducedMushrooms;
      default:
        return mushroomDatabase;
    }
  };

  // コンポーネント読み込み時にGPS座標を取得
  useEffect(() => {
    console.log("GPS取得を開始します...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("GPS取得成功:", position.coords);
          const newGPS = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentGPS(newGPS);
          gpsData = { lat: 35.681236, lng: 139.767125 };
          console.log("GPS座標を設定:", newGPS);
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        },
      );
    } else {
      console.error("このブラウザはGeolocation APIをサポートしていません");
      // GPS取得できない場合も東京駅の座標を使用
      gpsData = { lat: 35.681236, lng: 139.767125 };
    }
  }, []);

  // 巨大な関数で全ての処理を行う（悪い書き方）
  const doEverything = () => {
    // 毒性チェック + 採取制限 + 図鑑検索 + 統計計算を全て一つの関数で
    if (b && b.length > 0 && c > 0 && d && e) {
      // マジックナンバーで毒性判定（悪い書き方）
      let toxicityLevel = 0;
      let isFound = false;

      // 同じような条件分岐をコピペ（悪い書き方）
      if (b === "しいたけ") {
        toxicityLevel = 0.1;
        isFound = true;
        if (toxicityLevel < 0.7) {
          if (c <= 50) {
            if (d === "秋" || d === "通年") {
              temp = "安全";
            } else {
              temp = "季節外";
            }
          } else {
            temp = "採取制限超過";
          }
        } else {
          temp = "危険";
        }
      }

      if (b === "まつたけ") {
        toxicityLevel = 0.0;
        isFound = true;
        if (toxicityLevel < 0.7) {
          if (c <= 5) {
            if (d === "秋" || d === "通年") {
              temp = "安全";
            } else {
              temp = "季節外";
            }
          } else {
            temp = "採取制限超過";
          }
        } else {
          temp = "危険";
        }
      }

      if (b === "ベニテングタケ") {
        toxicityLevel = 0.9;
        isFound = true;
        if (toxicityLevel < 0.7) {
          if (c <= 0) {
            if (d === "夏" || d === "通年") {
              temp = "安全";
            } else {
              temp = "季節外";
            }
          } else {
            temp = "採取制限超過";
          }
        } else {
          temp = "危険！毒性高い！";
        }
      }

      if (b === "エノキタケ") {
        toxicityLevel = 0.0;
        isFound = true;
        if (toxicityLevel < 0.7) {
          if (c <= 100) {
            if (d === "冬" || d === "通年") {
              temp = "安全";
            } else {
              temp = "季節外";
            }
          } else {
            temp = "採取制限超過";
          }
        } else {
          temp = "危険";
        }
      }

      if (b === "ドクツルタケ") {
        toxicityLevel = 0.95;
        isFound = true;
        if (toxicityLevel < 0.7) {
          if (c <= 0) {
            if (d === "夏" || d === "通年") {
              temp = "安全";
            } else {
              temp = "季節外";
            }
          } else {
            temp = "採取制限超過";
          }
        } else {
          temp = "非常に危険！絶対に採取禁止！";
        }
      }

      if (b === "ナメコ") {
        toxicityLevel = 0.05;
        isFound = true;
        if (toxicityLevel < 0.7) {
          if (c <= 30) {
            if (d === "秋" || d === "通年") {
              temp = "安全";
            } else {
              temp = "季節外";
            }
          } else {
            temp = "採取制限超過";
          }
        } else {
          temp = "危険";
        }
      }

      if (!isFound) {
        temp = "不明なキノコ";
        toxicityLevel = 3.14; // マジックナンバー
      }

      // データをグローバル変数に追加
      a++;
      let newRecord: RecordData = {
        id: a,
        name: b,
        count: c,
        season: d,
        location: e,
        gps: { lat: currentGPS.lat, lng: currentGPS.lng },
        toxicity: toxicityLevel,
        status: temp,
        timestamp: new Date(),
      };

      globalMushroomData.push(newRecord);

      // 統計計算も同じ関数内で
      let totalCount = 0;
      let safeCount = 0;
      let dangerousCount = 0;

      // 同じような処理をコピペ（悪い書き方）
      for (let i = 0; i < globalMushroomData.length; i++) {
        totalCount += globalMushroomData[i].count;
        if (globalMushroomData[i].toxicity < 0.7) {
          safeCount++;
        } else {
          dangerousCount++;
        }
      }

      let statsText = `総採取数: ${totalCount}, 安全: ${safeCount}, 危険: ${dangerousCount}`;
      setG(statsText);

      // フォームリセット
      setB("");
      setC(0);
      setD("");
      setE("");
      setF(!f); // 強制再レンダリング
    } else {
      alert("すべての項目を入力してください");
    }
  };

  // 削除機能も同じようなネストした条件分岐
  const deleteRecord = (id: number) => {
    for (let i = 0; i < globalMushroomData.length; i++) {
      if (globalMushroomData[i].id === id) {
        if (i >= 0) {
          if (globalMushroomData.length > 0) {
            globalMushroomData.splice(i, 1);
            setF(!f);

            // 統計再計算
            let totalCount = 0;
            let safeCount = 0;
            let dangerousCount = 0;

            for (let j = 0; j < globalMushroomData.length; j++) {
              totalCount += globalMushroomData[j].count;
              if (globalMushroomData[j].toxicity < 0.7) {
                safeCount++;
              } else {
                dangerousCount++;
              }
            }

            let statsText = `総採取数: ${totalCount}, 安全: ${safeCount}, 危険: ${dangerousCount}`;
            setG(statsText);
            break;
          }
        }
      }
    }
  };

  // 図鑑検索も巨大な関数で処理（悪い書き方）
  const searchEverything = () => {
    if (i !== "") {
      if (i.length > 0) {
        // 全カテゴリのキノコデータを統合
        const allMushrooms = [
          ...mushroomDatabase,
          ...regionalMushrooms,
          ...microMushrooms,
          ...specializedMushrooms,
          ...introducedMushrooms,
        ];

        // 検索キーワードを小文字に変換（大文字小文字を区別しない）
        const searchKeyword = i.toLowerCase();

        // LIKE検索（部分一致）でフィルタリング
        const matchedMushrooms = allMushrooms.filter((mushroom) => {
          const name = mushroom.name.toLowerCase();
          const season = mushroom.season.toLowerCase();

          // キノコ名、季節、毒性レベルで部分一致検索
          return (
            name.includes(searchKeyword) ||
            season.includes(searchKeyword) ||
            (searchKeyword.includes("毒") && mushroom.toxicity >= 0.7) ||
            (searchKeyword.includes("安全") && mushroom.toxicity < 0.3) ||
            (searchKeyword.includes("食用") && mushroom.toxicity < 0.3) ||
            (searchKeyword.includes("危険") && mushroom.toxicity >= 0.7) ||
            (searchKeyword.includes("春") && season.includes("春")) ||
            (searchKeyword.includes("夏") && season.includes("夏")) ||
            (searchKeyword.includes("秋") && season.includes("秋")) ||
            (searchKeyword.includes("冬") && season.includes("冬")) ||
            (searchKeyword.includes("通年") && season.includes("通年"))
          );
        });

        // 重複を除去（同じ名前のキノコが複数カテゴリにある場合）
        const uniqueMushrooms = matchedMushrooms.filter(
          (mushroom, index, self) =>
            index === self.findIndex((m) => m.name === mushroom.name),
        );

        setH(uniqueMushrooms);
      }
    } else {
      setH([]);
    }
  };

  return (
    <>
      <Head>
        <title>キノコ狩り記録システム（悪い書き方バージョン）</title>
        <meta name="description" content="安全で楽しいキノコ採取をサポート" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">🍄 キノコ狩り記録システム</h1>
          <p className="app-subtitle">安全で楽しいキノコ採取をサポート</p>
        </header>

        {/* デスクトップナビゲーション */}
        <nav className="nav-tabs desktop-nav">
          <button
            className={`nav-tab ${currentPage === "home" ? "active" : ""}`}
            onClick={() => setCurrentPage("home")}
          >
            <Plus size={18} style={{ marginRight: "8px" }} />
            記録登録
          </button>
          <button
            className={`nav-tab ${currentPage === "records" ? "active" : ""}`}
            onClick={() => setCurrentPage("records")}
          >
            <List size={18} style={{ marginRight: "8px" }} />
            採取記録
          </button>
          <button
            className={`nav-tab ${currentPage === "map" ? "active" : ""}`}
            onClick={() => setCurrentPage("map")}
          >
            <Map size={18} style={{ marginRight: "8px" }} />
            地図表示
          </button>
          <button
            className={`nav-tab ${currentPage === "database" ? "active" : ""}`}
            onClick={() => setCurrentPage("database")}
          >
            <Book size={18} style={{ marginRight: "8px" }} />
            キノコ図鑑
          </button>
        </nav>

        {/* モバイルナビゲーション */}
        <div className="mobile-nav">
          <button
            className={`hamburger-button ${isMobileMenuOpen ? "menu-open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="メニューを開く"
          >
            <Menu size={20} />
          </button>

          <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
            <button
              className="mobile-nav-item close-button"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
              <span>閉じる</span>
            </button>
            <button
              className={`mobile-nav-item ${currentPage === "home" ? "active" : ""}`}
              onClick={() => {
                setCurrentPage("home");
                setIsMobileMenuOpen(false);
              }}
            >
              <Plus size={20} />
              <span>記録登録</span>
            </button>
            <button
              className={`mobile-nav-item ${currentPage === "records" ? "active" : ""}`}
              onClick={() => {
                setCurrentPage("records");
                setIsMobileMenuOpen(false);
              }}
            >
              <List size={20} />
              <span>採取記録</span>
            </button>
            <button
              className={`mobile-nav-item ${currentPage === "map" ? "active" : ""}`}
              onClick={() => {
                setCurrentPage("map");
                setIsMobileMenuOpen(false);
              }}
            >
              <Map size={20} />
              <span>地図表示</span>
            </button>
            <button
              className={`mobile-nav-item ${currentPage === "database" ? "active" : ""}`}
              onClick={() => {
                setCurrentPage("database");
                setIsMobileMenuOpen(false);
              }}
            >
              <Book size={20} />
              <span>キノコ図鑑</span>
            </button>
          </div>

          {isMobileMenuOpen && (
            <div
              className="mobile-menu-overlay"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
        {currentPage === "home" && (
          <>
            <div className="card">
              <h2 className="card-title">新しい採取記録</h2>

              <div className="form-group">
                <label className="form-label">キノコの名前</label>
                <input
                  className="form-input"
                  type="text"
                  value={b}
                  onChange={(event) => setB(event.target.value)}
                  placeholder="例: しいたけ"
                />
              </div>

              <div className="form-group">
                <label className="form-label">採取数</label>
                <input
                  className="form-input"
                  type="number"
                  value={c}
                  onChange={(event) => setC(parseInt(event.target.value) || 0)}
                  placeholder="採取した個数"
                />
              </div>

              <div className="form-group">
                <label className="form-label">季節</label>
                <select
                  className="form-select"
                  value={d}
                  onChange={(event) => setD(event.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="春">春</option>
                  <option value="夏">夏</option>
                  <option value="秋">秋</option>
                  <option value="冬">冬</option>
                  <option value="通年">通年</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">採取場所</label>
                <input
                  className="form-input"
                  type="text"
                  value={e}
                  onChange={(event) => setE(event.target.value)}
                  placeholder="例: 〇〇山"
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  ✅ 現在のGPS座標: {currentGPS.lat.toFixed(6)},{" "}
                  {currentGPS.lng.toFixed(6)}
                </div>
              </div>

              <button className="btn btn-primary" onClick={doEverything}>
                記録を追加
              </button>
            </div>

            {g && (
              <div className="stats">
                <h3>📊 統計情報</h3>
                <p>{g}</p>
              </div>
            )}
          </>
        )}

        {currentPage === "records" && (
          <>
            <div className="card">
              <h2 className="card-title">採取記録一覧</h2>

              {globalMushroomData.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    padding: "40px 0",
                  }}
                >
                  まだ採取記録がありません。
                  <br />
                  「記録登録」タブから新しい記録を追加してください。
                </p>
              ) : (
                globalMushroomData.map((record: RecordData) => (
                  <div
                    key={record.id}
                    className={`record-item ${record.toxicity < 0.7 ? "safe" : "dangerous"}`}
                  >
                    <div className="record-header">
                      <h3 className="record-title">{record.name}</h3>
                      <span className="record-id">ID: {record.id}</span>
                    </div>
                    <div className="record-details">
                      <div className="record-info">
                        <div className="info-item">
                          <Hash size={16} />
                          <span>採取数: {record.count}個</span>
                        </div>
                        <div className="info-item">
                          <Calendar size={16} />
                          <span>季節: {record.season}</span>
                        </div>
                        <div className="info-item">
                          <MapPin size={16} />
                          <span>場所: {record.location}</span>
                        </div>
                      </div>
                      <div className="record-status">
                        <span
                          className={`status-badge ${record.toxicity < 0.7 ? "safe" : "dangerous"}`}
                        >
                          {record.status}
                        </span>
                        <span className="toxicity-level">
                          毒性: {record.toxicity}
                        </span>
                      </div>
                    </div>
                    <div className="record-actions">
                      <span className="record-timestamp">
                        {record.timestamp.toLocaleString()}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteRecord(record.id)}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {currentPage === "map" && (
          <div className="card">
            <h2 className="card-title">採取記録マップ</h2>

            {globalMushroomData.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "40px 0",
                }}
              >
                まだ採取記録がありません。
                <br />
                「記録登録」タブから新しい記録を追加してください。
              </p>
            ) : (
              <>
                <div className="map-container">
                  {/* OpenStreetMapを使った実際の地図表示 */}
                  {/* Google Maps API対応版 - 環境変数でAPIキーが設定されている場合 */}
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                    <div
                      style={{
                        width: "100%",
                        height: "400px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--border-radius)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${currentGPS.lat},${currentGPS.lng}&zoom=15`}
                        title="Google Maps - 採取地点マップ"
                      />
                    </div>
                  ) : (
                    /* OpenStreetMap代替表示 */
                    <div
                      style={{
                        width: "100%",
                        height: "400px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--border-radius)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentGPS.lng - 0.01},${currentGPS.lat - 0.01},${currentGPS.lng + 0.01},${currentGPS.lat + 0.01}&layer=mapnik&marker=${currentGPS.lat},${currentGPS.lng}`}
                        title="採取地点マップ"
                      />
                    </div>
                  )}

                  {/* 採取地点のオーバーレイ表示 */}
                  {globalMushroomData.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(255, 255, 255, 0.95)",
                        padding: "12px",
                        borderRadius: "var(--border-radius)",
                        boxShadow: "var(--shadow-medium)",
                        maxWidth: "200px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "14px",
                          color: "var(--primary-color)",
                        }}
                      >
                        採取地点 ({globalMushroomData.length}件)
                      </h4>
                      {globalMushroomData.map((record: RecordData) => (
                        <div
                          key={record.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px 0",
                            borderBottom: "1px solid var(--border-color)",
                            fontSize: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              background:
                                record.toxicity < 0.7 ? "#28a745" : "#dc3545",
                              borderRadius: "50%",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: "bold",
                              flexShrink: 0,
                            }}
                          >
                            {record.id}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "var(--text-primary)",
                              }}
                            >
                              {record.name}
                            </div>
                            <div style={{ color: "var(--text-secondary)" }}>
                              {record.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "var(--spacing)",
                    padding: "var(--spacing)",
                    background: "var(--surface-elevated)",
                    borderRadius: "var(--border-radius)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    📍 基準地点: 東京駅 ({currentGPS.lat.toFixed(6)},{" "}
                    {currentGPS.lng.toFixed(6)})
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${currentGPS.lat},${currentGPS.lng}&z=15`;
                      window.open(url, "_blank");
                    }}
                    style={{ fontSize: "14px" }}
                  >
                    <MapPin size={16} />
                    Google Mapsで開く
                  </button>
                </div>

                <div
                  className="map-legend"
                  style={{ marginTop: "var(--spacing)" }}
                >
                  <div className="legend-item">
                    <div className="legend-marker safe"></div>
                    <span>安全なキノコ</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-marker dangerous"></div>
                    <span>危険なキノコ</span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginLeft: "auto",
                    }}
                  >
                    📍 {globalMushroomData.length}件の採取記録
                  </div>
                </div>

                <div className="map-records">
                  <h3
                    style={{
                      marginBottom: "var(--spacing)",
                      color: "var(--primary-color)",
                    }}
                  >
                    採取地点一覧
                  </h3>

                  {globalMushroomData.map((record: RecordData) => (
                    <div
                      key={record.id}
                      className={`map-record-item ${record.toxicity < 0.7 ? "safe" : "dangerous"}`}
                    >
                      <div className="map-record-header">
                        <div
                          className={`map-marker ${record.toxicity < 0.7 ? "safe" : "dangerous"}`}
                        >
                          {record.id}
                        </div>
                        <div className="map-record-info">
                          <h4>{record.name}</h4>
                          <p className="location-info">
                            <MapPin
                              size={14}
                              style={{ display: "inline", marginRight: "4px" }}
                            />
                            {record.location}
                          </p>
                        </div>
                        <div className="map-record-details">
                          <span className="count-badge">{record.count}個</span>
                          <span
                            className={`status-badge ${record.toxicity < 0.7 ? "safe" : "dangerous"}`}
                          >
                            {record.status}
                          </span>
                        </div>
                      </div>

                      <div className="gps-coordinates">
                        <strong>GPS座標:</strong>
                        <span className="coordinates">
                          {record.gps && record.gps.lat
                            ? record.gps.lat.toFixed(6)
                            : "0.000000"}
                          ,{" "}
                          {record.gps && record.gps.lng
                            ? record.gps.lng.toFixed(6)
                            : "0.000000"}
                        </span>
                        <button
                          className="btn-link"
                          onClick={() => {
                            const lat =
                              record.gps && record.gps.lat ? record.gps.lat : 0;
                            const lng =
                              record.gps && record.gps.lng ? record.gps.lng : 0;
                            const url = `https://www.google.com/maps?q=${lat},${lng}`;
                            window.open(url, "_blank");
                          }}
                        >
                          Google Mapsで開く
                        </button>
                      </div>

                      <div className="record-timestamp">
                        記録日時: {record.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {currentPage === "database" && (
          <div className="card">
            <h2 className="card-title">キノコ図鑑</h2>

            {/* 図鑑内タブ切り替え */}
            <div className="database-tabs">
              <button
                className={`database-tab ${databaseTab === "encyclopedia" ? "active" : ""}`}
                onClick={() => setDatabaseTab("encyclopedia")}
              >
                <Book size={18} />
                図鑑
              </button>
              <button
                className={`database-tab ${databaseTab === "search" ? "active" : ""}`}
                onClick={() => setDatabaseTab("search")}
              >
                <Search size={18} />
                検索
              </button>
            </div>

            {/* 検索タブの内容 */}
            {databaseTab === "search" && (
              <>
                <div className="form-group">
                  <label className="form-label">キノコ名で検索</label>
                  <input
                    className="form-input"
                    type="text"
                    value={i}
                    onChange={(event) => setI(event.target.value)}
                    placeholder="例: しいたけ、毒、食用"
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={searchEverything}
                    style={{ marginTop: "12px" }}
                  >
                    <Search size={18} />
                    検索実行
                  </button>
                </div>

                {h.length > 0 && (
                  <div className="search-results-container">
                    <div className="search-results-header">
                      <Search size={20} />
                      <h3>検索結果</h3>
                    </div>

                    <div className="search-stats">
                      <span>検索結果: {h.length}件</span>
                      <span>
                        安全: {h.filter((m) => m.toxicity < 0.3).length}件
                      </span>
                      <span>
                        危険: {h.filter((m) => m.toxicity >= 0.7).length}件
                      </span>
                      <span>
                        採取禁止: {h.filter((m) => m.limit === 0).length}件
                      </span>
                    </div>

                    <div className="search-results-table">
                      <div className="search-table-header">
                        <div className="search-table-cell header">キノコ名</div>
                        <div className="search-table-cell header">カテゴリ</div>
                        <div className="search-table-cell header">毒性</div>
                        <div className="search-table-cell header">季節</div>
                        <div className="search-table-cell header">採取制限</div>
                      </div>

                      {h.map((mushroom, index) => (
                        <div
                          key={index}
                          className={`search-table-row ${mushroom.toxicity >= 0.7 ? "dangerous" : "safe"}`}
                          data-toxicity={
                            mushroom.toxicity <= 0.2
                              ? "safe"
                              : mushroom.toxicity <= 0.5
                                ? "mild"
                                : mushroom.toxicity <= 0.7
                                  ? "moderate"
                                  : "high"
                          }
                        >
                          <div className="search-table-cell name">
                            {mushroom.name}
                          </div>
                          <div className="search-table-cell category">
                            {mushroom.category}
                          </div>
                          <div className="search-table-cell toxicity">
                            {mushroom.toxicity}
                          </div>
                          <div className="search-table-cell season">
                            {mushroom.season}
                          </div>
                          <div className="search-table-cell limit">
                            {mushroom.limit === 0
                              ? "採取禁止"
                              : `${mushroom.limit}個`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {i && h.length === 0 && (
                  <div className="no-results">
                    <p>「{i}」に該当するキノコが見つかりませんでした。</p>
                    <p>検索のヒント:</p>
                    <ul>
                      <li>
                        キノコ名の一部を入力してみてください（例:
                        "しい"で"しいたけ"を検索）
                      </li>
                      <li>季節で検索できます（春、夏、秋、冬、通年）</li>
                      <li>毒性で検索できます（毒、危険、安全、食用）</li>
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* 図鑑タブの内容 */}
            {databaseTab === "encyclopedia" && (
              <>
                {/* カテゴリ切り替えタブ */}
                <div className="mushroom-category-tabs">
                  <button
                    className={`category-tab ${mushroomCategory === "main" ? "active" : ""}`}
                    onClick={() => setMushroomCategory("main")}
                  >
                    主要 ({mushroomDatabase.length})
                  </button>
                  <button
                    className={`category-tab ${mushroomCategory === "regional" ? "active" : ""}`}
                    onClick={() => setMushroomCategory("regional")}
                  >
                    希少種 ({regionalMushrooms.length})
                  </button>
                  <button
                    className={`category-tab ${mushroomCategory === "micro" ? "active" : ""}`}
                    onClick={() => setMushroomCategory("micro")}
                  >
                    微小 ({microMushrooms.length})
                  </button>
                  <button
                    className={`category-tab ${mushroomCategory === "specialized" ? "active" : ""}`}
                    onClick={() => setMushroomCategory("specialized")}
                  >
                    専門 ({specializedMushrooms.length})
                  </button>
                  <button
                    className={`category-tab ${mushroomCategory === "introduced" ? "active" : ""}`}
                    onClick={() => setMushroomCategory("introduced")}
                  >
                    帰化 ({introducedMushrooms.length})
                  </button>
                </div>

                {/* カテゴリ説明 */}
                <div className="category-description">
                  {mushroomCategory === "main" && (
                    <p>
                      一般的によく知られているキノコです。食用として親しまれているものが多く含まれています。
                    </p>
                  )}
                  {mushroomCategory === "regional" && (
                    <p>
                      特定の地域や環境でのみ見つかる希少なキノコです。分布が限定的で貴重な種類です。
                    </p>
                  )}
                  {mushroomCategory === "micro" && (
                    <p>
                      小さくて見つけにくいキノコや、専門的な知識が必要な微小種です。
                    </p>
                  )}
                  {mushroomCategory === "specialized" && (
                    <p>
                      学術的分類や未同定種など、専門的な研究対象となるキノコです。
                    </p>
                  )}
                  {mushroomCategory === "introduced" && (
                    <p>海外から持ち込まれた外来種や栽培品種のキノコです。</p>
                  )}
                </div>

                <div
                  style={{
                    marginBottom: "var(--spacing)",
                    padding: "var(--spacing)",
                    background: "var(--surface-elevated)",
                    borderRadius: "var(--border-radius)",
                    fontSize: "14px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      color: "var(--primary-color)",
                    }}
                  >
                    毒性レベル分類
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "#d4edda",
                        borderRadius: "4px",
                        color: "#155724",
                        fontSize: "13px",
                        width: "50%",
                      }}
                    >
                      <strong>0.0-0.2:</strong> 安全（食用可能）
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "#fff3cd",
                        borderRadius: "4px",
                        color: "#856404",
                        fontSize: "13px",
                        width: "50%",
                      }}
                    >
                      <strong>0.3-0.5:</strong> 軽微な毒性（注意が必要）
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "#f8d7da",
                        borderRadius: "4px",
                        color: "#721c24",
                        fontSize: "13px",
                        width: "50%",
                      }}
                    >
                      <strong>0.6-0.7:</strong> 中程度の毒性（摂取注意）
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "#f5c6cb",
                        borderRadius: "4px",
                        color: "#721c24",
                        fontSize: "13px",
                        width: "50%",
                      }}
                    >
                      <strong>0.8-1.0:</strong> 高毒性・致命的（絶対に採取禁止）
                    </div>
                  </div>
                  <p
                    style={{
                      margin: "12px 0 0 0",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                    }}
                  >
                    ⚠️ 毒性レベル0.7以上のキノコは採取を避けてください
                  </p>
                </div>

                <div className="mushroom-table">
                  <div className="mushroom-table-header">
                    <div className="mushroom-table-cell header">キノコ名</div>
                    <div className="mushroom-table-cell header">毒性</div>
                    <div className="mushroom-table-cell header">季節</div>
                    <div className="mushroom-table-cell header">採取制限</div>
                  </div>

                  {getCurrentMushroomData().map(
                    (mushroom: MushroomData, index: number) => (
                      <div
                        key={index}
                        className="mushroom-table-row"
                        data-toxicity={
                          mushroom.toxicity <= 0.2
                            ? "safe"
                            : mushroom.toxicity <= 0.5
                              ? "mild"
                              : mushroom.toxicity <= 0.7
                                ? "moderate"
                                : "high"
                        }
                      >
                        <div className="mushroom-table-cell name">
                          {mushroom.name}
                        </div>
                        <div className="mushroom-table-cell toxicity">
                          {mushroom.toxicity}
                        </div>
                        <div className="mushroom-table-cell season">
                          {mushroom.season}
                        </div>
                        <div className="mushroom-table-cell limit">
                          {mushroom.limit}個
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
