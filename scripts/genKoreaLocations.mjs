import fs from "node:fs";

const CSV_PATH = "d:/church_project/src/data/korea_legal_dong.csv";
const OUT_PATH = "d:/church_project/src/data/koreaLocations.ts";

const DO_SHORT_NAME = {
  "서울특별시": "서울",
  "부산광역시": "부산",
  "대구광역시": "대구",
  "인천광역시": "인천",
  "광주광역시": "광주",
  "대전광역시": "대전",
  "울산광역시": "울산",
  "세종특별자치시": "세종",
  "경기도": "경기",
  "강원도": "강원",
  "강원특별자치도": "강원",
  "충청북도": "충북",
  "충청남도": "충남",
  "전라북도": "전북",
  "전북특별자치도": "전북",
  "전라남도": "전남",
  "경상북도": "경북",
  "경상남도": "경남",
  "제주특별자치도": "제주",
};

const raw = fs.readFileSync(CSV_PATH, "utf-8");
const lines = raw.split(/\r?\n/);

const doMap = new Map(); // si2 -> fullName
const sigunguMap = new Map(); // si2 -> [{gugun3, fullName}]
const dongMap = new Map(); // si2+gugun3 -> [fullName]

for (const line of lines) {
  if (!line.trim()) continue;
  const cols = line.split(",");
  // cols[0] = "" (leading empty), cols[1] = code, cols[2] = name, cols[3] = status
  const code = cols[1];
  const name = cols[2];
  const status = cols[3];
  if (!code || !/^\d{10}$/.test(code)) continue;
  if (status !== "존재") continue;

  const si2 = code.slice(0, 2);
  const gugun3 = code.slice(2, 5);
  const dong3 = code.slice(5, 8);
  const ri2 = code.slice(8, 10);

  if (gugun3 === "000" && dong3 === "000" && ri2 === "00") {
    doMap.set(si2, name);
  } else if (dong3 === "000" && ri2 === "00") {
    if (!sigunguMap.has(si2)) sigunguMap.set(si2, []);
    sigunguMap.get(si2).push({ gugun3, fullName: name });
  } else if (ri2 === "00") {
    const key = si2 + gugun3;
    if (!dongMap.has(key)) dongMap.set(key, []);
    dongMap.get(key).push(name);
  }
  // ri2 !== "00" -> 리 단위, 스킵
}

// 세종처럼 도 레벨(000) 행 없이 시군구 코드 하나가 자기 자신을 표현하는 경우 보정
for (const si2 of sigunguMap.keys()) {
  if (doMap.has(si2)) continue;
  const rows = sigunguMap.get(si2);
  if (rows.length === 1) {
    doMap.set(si2, rows[0].fullName);
    sigunguMap.set(si2, []);
  }
}

const result = [];

const sortedSi2 = [...doMap.keys()].sort();

for (const si2 of sortedSi2) {
  const doFullName = doMap.get(si2);
  const shortSi = DO_SHORT_NAME[doFullName] ?? doFullName;
  const sigunguRows = sigunguMap.get(si2) ?? [];

  // 컨테이너 행(상위 시가 구로 재편되어 더 이상 직속 동이 없는 경우) 드롭
  const dropped = new Set();
  for (const a of sigunguRows) {
    for (const b of sigunguRows) {
      if (a === b) continue;
      if (b.fullName.startsWith(a.fullName + " ")) {
        dropped.add(a);
        break;
      }
    }
  }
  const surviving = sigunguRows.filter((r) => !dropped.has(r));

  const gus = [];

  if (surviving.length === 0) {
    // 세종처럼 구 단위 없이 동이 바로 딸린 경우
    const allDongs = new Set();
    for (const [key, names] of dongMap) {
      if (key.startsWith(si2)) names.forEach((n) => allDongs.add(n.slice(doFullName.length + 1)));
    }
    gus.push({ gu: doFullName, dongs: [...allDongs].sort((a, b) => a.localeCompare(b, "ko")) });
  } else {
    for (const row of surviving) {
      const guLabel = row.fullName.slice(doFullName.length + 1);
      const dongRows = dongMap.get(si2 + row.gugun3) ?? [];
      const dongs = [...new Set(dongRows.map((n) => n.slice(row.fullName.length + 1)))]
        .sort((a, b) => a.localeCompare(b, "ko"));
      gus.push({ gu: guLabel, dongs });
    }
  }

  gus.sort((a, b) => a.gu.localeCompare(b.gu, "ko"));
  result.push({ si: shortSi, gus });
}

result.sort((a, b) => a.si.localeCompare(b.si, "ko"));

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

let out = `export interface GuData { gu: string; dongs?: string[] }\n`;
out += `export interface SiData { si: string; gus: GuData[] }\n\n`;
out += `export const KOREA_LOCATIONS: SiData[] = [\n`;
for (const si of result) {
  out += `  {\n    si: "${esc(si.si)}",\n    gus: [\n`;
  for (const gu of si.gus) {
    const dongsStr = gu.dongs.length ? gu.dongs.map((d) => `"${esc(d)}"`).join(", ") : "";
    out += `      { gu: "${esc(gu.gu)}"${gu.dongs.length ? `, dongs: [${dongsStr}]` : ""} },\n`;
  }
  out += `    ],\n  },\n`;
}
out += `];\n`;

fs.writeFileSync(OUT_PATH, out, "utf-8");

let totalGu = 0, totalDong = 0;
for (const si of result) {
  totalGu += si.gus.length;
  for (const gu of si.gus) totalDong += gu.dongs.length;
}
console.log(`si: ${result.length}, gu/시군구: ${totalGu}, dong/읍면동: ${totalDong}`);
console.log(`출력 크기: ${(out.length / 1024).toFixed(1)} KB`);
