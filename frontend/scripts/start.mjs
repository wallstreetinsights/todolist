import { existsSync } from "node:fs"
import { spawn } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const port = process.env.PORT || "8080"

process.chdir(root)

if (!existsSync(join(root, "dist", "index.html"))) {
  console.log("dist/ missing, running npm run build...")
  await new Promise((resolve, reject) => {
    const build = spawn("npm", ["run", "build"], { stdio: "inherit", cwd: root })
    build.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`build failed: ${code}`))))
  })
}

console.log(`Starting frontend on 0.0.0.0:${port}`)

const vite = join(root, "node_modules", "vite", "bin", "vite.js")
const child = spawn(
  process.execPath,
  [vite, "preview", "--host", "0.0.0.0", "--port", port, "--strictPort"],
  { stdio: "inherit", cwd: root, env: process.env },
)

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Frontend stopped by signal: ${signal}`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})
