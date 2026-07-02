/**
 * Upload de assets do Top8 para o S3 via POST /imagem/upload-url.
 *
 * Uso:
 *   $env:UPLOAD_EMAIL="seu@email.com"
 *   $env:UPLOAD_PASS="sua-senha"
 *   node scripts/upload-top8-to-s3.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.API_URL || "https://ol5gj7iduc.execute-api.us-east-1.amazonaws.com/dev";
const email = process.env.UPLOAD_EMAIL;
const senha = process.env.UPLOAD_PASS;

if (!email || !senha) {
  console.error("Defina UPLOAD_EMAIL e UPLOAD_PASS antes de executar.");
  process.exit(1);
}

const assetsDir = path.join(__dirname, "../public/images/top8");
const files = fs.readdirSync(assetsDir).filter((name) => /\.(jpe?g|png|gif|webp)$/i.test(name));

if (files.length === 0) {
  console.error(`Nenhuma imagem encontrada em ${assetsDir}`);
  process.exit(1);
}

const loginRes = await fetch(`${API_URL}/usuario/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, senha }),
});

const loginData = await loginRes.json();
if (!loginRes.ok) {
  console.error("Falha no login:", loginData);
  process.exit(1);
}

const token = loginData.token;
if (!token) {
  console.error("Resposta de login sem token:", loginData);
  process.exit(1);
}

const results = {};

for (const fileName of files) {
  const filePath = path.join(assetsDir, fileName);
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(fileName).toLowerCase();
  const contentType = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  }[ext];

  if (!contentType) {
    console.warn(`Ignorando ${fileName}: extensão não suportada`);
    continue;
  }

  const presignRes = await fetch(`${API_URL}/imagem/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contentType, tamanhoBytes: buffer.length }),
  });

  const presignData = await presignRes.json();
  if (!presignRes.ok) {
    console.error(`Falha ao gerar URL para ${fileName}:`, presignData);
    process.exit(1);
  }

  const uploadRes = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: buffer,
  });

  if (!uploadRes.ok) {
    console.error(`Falha no PUT S3 para ${fileName}: HTTP ${uploadRes.status}`);
    process.exit(1);
  }

  results[fileName] = presignData.urlPublica;
  console.log(`${fileName} -> ${presignData.urlPublica}`);
}

console.log("\nURLs públicas:");
console.log(JSON.stringify(results, null, 2));
