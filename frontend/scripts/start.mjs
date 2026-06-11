import { existsSync } from "node:fs"
import { execSync } from "node:child_process"

const port = process.env.PORT || "8080"

if (!existsSync("dist/index.html")) {
  console.log("dist/ not found, running production build...")
  execSync("npm run build", { stdio: "inherit" })
}

console.log(`Starting frontend on 0.0.0.0:${port}`)
execSync(`npx serve -s dist -l tcp://0.0.0.0:${port}`, { stdio: "inherit" })
