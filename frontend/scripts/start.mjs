import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { existsSync, statSync } from "node:fs"
import { execSync } from "node:child_process"
import { dirname, extname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const port = Number(process.env.PORT) || 8080

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".ico": "image/x-icon",
}

function ensureBuild() {
  const indexPath = join(dist, "index.html")
  if (existsSync(indexPath)) {
    console.log("Found dist/index.html")
    return
  }

  console.log("dist/ missing, running npm run build...")
  execSync("npm run build", { stdio: "inherit", cwd: root })

  if (!existsSync(indexPath)) {
    throw new Error("Build finished but dist/index.html is still missing")
  }
}

function resolveFilePath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split("?")[0])
  let filePath = join(dist, safePath)

  if (safePath.endsWith("/")) {
    filePath = join(filePath, "index.html")
  }

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath
  }

  return join(dist, "index.html")
}

ensureBuild()

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost")

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ status: "ok" }))
      return
    }

    const filePath = resolveFilePath(url.pathname)
    const body = await readFile(filePath)
    const contentType = MIME_TYPES[extname(filePath)] || "application/octet-stream"

    res.writeHead(200, { "Content-Type": contentType })
    res.end(body)
  } catch (error) {
    console.error("Request failed:", error)
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Internal Server Error")
  }
})

server.listen(port, "0.0.0.0", () => {
  console.log(`Frontend ready on http://0.0.0.0:${port}`)
})

process.on("SIGTERM", () => {
  server.close(() => process.exit(0))
})
