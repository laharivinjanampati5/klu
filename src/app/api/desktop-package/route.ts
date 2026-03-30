import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPORT_NAME = "GST-GraphRecon-AI.zip";
const EXPORT_PATHS = [
  "src",
  "public",
  "sample-data",
  "README.md",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "next-env.d.ts",
  "tsconfig.json",
  "eslint.config.mjs",
  "postcss.config.mjs",
  ".gitignore",
];

function toPowerShellLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function resolveDesktopPath() {
  const candidates = [
    process.env.OneDrive ? path.join(process.env.OneDrive, "Desktop") : null,
    path.join(os.homedir(), "Desktop"),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return candidates[0] ?? path.join(os.homedir(), "Desktop");
}

async function getExistingExportPaths(root: string) {
  const resolved = await Promise.all(
    EXPORT_PATHS.map(async (entry) => {
      const absolutePath = path.join(root, entry);

      try {
        await access(absolutePath);
        return absolutePath;
      } catch {
        return null;
      }
    }),
  );

  return resolved.filter((value): value is string => Boolean(value));
}

export async function POST(request: Request) {
  const host = request.headers.get("host") ?? "";
  if (!host.startsWith("localhost:") && !host.startsWith("127.0.0.1:")) {
    return NextResponse.json(
      { error: "Desktop export is available only when this app is running on localhost." },
      { status: 403 },
    );
  }

  if (process.platform !== "win32") {
    return NextResponse.json(
      { error: "Desktop export is currently configured for Windows only." },
      { status: 501 },
    );
  }

  try {
    const appRoot = process.cwd();
    const desktopPath = await resolveDesktopPath();
    const destinationPath = path.join(desktopPath, EXPORT_NAME);
    const exportPaths = await getExistingExportPaths(appRoot);

    if (exportPaths.length === 0) {
      return NextResponse.json(
        { error: "No exportable project files were found." },
        { status: 500 },
      );
    }

    await mkdir(desktopPath, { recursive: true });

    const archivePaths = exportPaths.map(toPowerShellLiteral).join(",");
    const command = `Compress-Archive -LiteralPath @(${archivePaths}) -DestinationPath ${toPowerShellLiteral(destinationPath)} -Force`;

    await execFileAsync("powershell.exe", ["-NoProfile", "-Command", command], {
      windowsHide: true,
      timeout: 120000,
    });

    return NextResponse.json({
      success: true,
      path: destinationPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Desktop export failed.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
