#!/usr/bin/env node
/**
 * 独立识图脚本 — 调用千问 VL 模型，按量付费。
 *
 * 用法:
 *   node vision.js <图片路径> [问题]
 *   node vision.js --url <图片链接> [问题]
 *
 * 依赖:
 *   npm install dotenv (可选，如果有 .env 文件)
 *   DASHSCOPE_API_KEY 环境变量 或 同目录 .env 文件
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// 尝试加载 .env（先找当前目录，再找脚本所在目录）
try { require("dotenv").config(); } catch {}
try { require("dotenv").config({ path: path.resolve(__dirname, ".env") }); } catch {}

const BASE_URL = process.env.VISION_BASE_URL || "https://api-inference.modelscope.cn/v1";
const API_KEY = process.env.VISION_API_KEY || "";
const MODEL = process.env.VISION_MODEL || "Qwen/Qwen3-VL-235B-A22B-Instruct";

function parseArgs() {
  const argv = process.argv.slice(2);
  let imageSource = "", prompt = "", isUrl = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url" && argv[i + 1]) {
      isUrl = true;
      imageSource = argv[++i];
    } else if (!imageSource && !argv[i].startsWith("--")) {
      imageSource = argv[i];
    } else if (imageSource && !argv[i].startsWith("--")) {
      prompt = prompt ? prompt + " " + argv[i] : argv[i];
    }
  }
  if (!prompt) prompt = "请详细描述这张图片的内容。";
  return { imageSource, prompt, isUrl };
}

const child_process = require("child_process");
const os = require("os");

const MAX_DIM = 2048;

function resizeIfNeeded(imagePath) {
  // Use Python Pillow to check size and resize if needed
  const script = `
import sys, json
from PIL import Image
img = Image.open(sys.argv[1])
w, h = img.size
limit = int(sys.argv[2])
if w <= limit and h <= limit:
    print(json.dumps({"path": sys.argv[1], "resized": False}))
else:
    ratio = min(limit/w, limit/h)
    new_size = (int(w*ratio), int(h*ratio))
    img = img.resize(new_size, Image.LANCZOS)
    out = sys.argv[1] + ".resized.jpg"
    img.convert("RGB").save(out, "JPEG", quality=85)
    print(json.dumps({"path": out, "resized": True, "orig": [w,h], "new": list(new_size)}))
`;
  const result = child_process.spawnSync(
    "python", ["-c", script, imagePath, String(MAX_DIM)],
    { encoding: "utf-8", timeout: 30000 }
  );
  if (result.error || result.status !== 0) {
    // If Python/Pillow fails, fall through to original path
    return { path: imagePath, resized: false };
  }
  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    return { path: imagePath, resized: false };
  }
}

function resolveImageUrl(source, isUrl) {
  if (isUrl) return source;
  const resolved = path.resolve(source);
  if (!fs.existsSync(resolved)) throw new Error(`文件不存在: ${resolved}`);

  // Auto-resize if exceeds limit
  const info = resizeIfNeeded(resolved);
  const filePath = info.path;
  if (info.resized) {
    console.error(`[vision] 图片过大 ${info.orig.join("x")}，已缩放到 ${info.new.join("x")}`);
  }

  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const mimeMap = { jpg: "jpeg", jpeg: "jpeg", png: "png", gif: "gif", webp: "webp", bmp: "bmp" };
  const data = fs.readFileSync(filePath);
  return `data:image/${mimeMap[ext] || "jpeg"};base64,${data.toString("base64")}`;
}

function request(payload) {
  const url = new URL(BASE_URL.replace(/\/?$/, "/") + "chat/completions");
  const body = JSON.stringify(payload);
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`API ${res.statusCode}: ${data.slice(0, 300)}`));
        try {
          resolve(JSON.parse(data)?.choices?.[0]?.message?.content || data);
        } catch { resolve(data); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!API_KEY) {
    console.error("请设置 DASHSCOPE_API_KEY 环境变量或在 .env 文件中配置。");
    console.error("获取 Key: https://bailian.console.aliyun.com/");
    process.exit(1);
  }
  const { imageSource, prompt, isUrl } = parseArgs();
  if (!imageSource) {
    console.error("用法: node vision.js <图片路径> [问题]");
    console.error("      node vision.js --url <图片链接> [问题]");
    process.exit(1);
  }
  try {
    const imageUrl = resolveImageUrl(imageSource, isUrl);
    const result = await request({
      model: MODEL,
      messages: [{ role: "user", content: [
        { type: "image_url", image_url: { url: imageUrl } },
        { type: "text", text: prompt },
      ]}],
      stream: false,
      max_tokens: 1024,
    });
    console.log(result);
  } catch (err) {
    console.error("识图失败:", err.message);
    process.exit(1);
  }
}

main();
