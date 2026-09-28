import AppKit
import Foundation

func savePNG(_ image: NSImage, path: String) {
  image.size = NSSize(width: 1024, height: 1024)
  guard let tiff = image.tiffRepresentation,
        let rep = NSBitmapImageRep(data: tiff),
        let png = rep.representation(using: .png, properties: [:]) else { return }
  try? png.write(to: URL(fileURLWithPath: path))
}

func workspaceIcon(for url: URL) -> NSImage {
  let icon = NSWorkspace.shared.icon(forFile: url.path)
  icon.size = NSSize(width: 1024, height: 1024)
  return icon
}

let outDir = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : FileManager.default.currentDirectoryPath
let fm = FileManager.default
let home = fm.homeDirectoryForCurrentUser

func export(_ name: String, _ url: URL) {
  savePNG(workspaceIcon(for: url), path: "\(outDir)/\(name).png")
  print("  \(name)")
}

print("Exporting workspace icons…")

if let desktop = fm.urls(for: .desktopDirectory, in: .userDomainMask).first {
  export("desktop-folder", desktop)
}

let dirs: [(String, FileManager.SearchPathDirectory)] = [
  ("documents-folder", .documentDirectory),
  ("downloads-folder", .downloadsDirectory),
  ("movie-folder", .moviesDirectory),
  ("music-folder", .musicDirectory),
  ("pictures-folder", .picturesDirectory),
  ("applications-folder", .applicationDirectory),
]

for (name, dir) in dirs {
  if let url = fm.urls(for: dir, in: .userDomainMask).first {
    export(name, url)
  }
}

export("public-folder", home.appendingPathComponent("Public"))
export("home-folder", home)

let genericDir = fm.temporaryDirectory.appendingPathComponent("portfolio-finder-generic", isDirectory: true)
try? fm.createDirectory(at: genericDir, withIntermediateDirectories: true)
savePNG(NSWorkspace.shared.icon(for: .folder), path: "\(outDir)/generic-folder.png")
print("  generic-folder")

let dev = home.appendingPathComponent("Developer")
if fm.fileExists(atPath: dev.path) {
  export("developer-folder", dev)
} else {
  savePNG(NSWorkspace.shared.icon(for: .folder), path: "\(outDir)/developer-folder.png")
  print("  developer-folder (generic)")
}

let resumePDF = URL(fileURLWithPath: outDir).deletingLastPathComponent().appendingPathComponent("desktop/Eshaan_Walia_resume.pdf")
if fm.fileExists(atPath: resumePDF.path) {
  export("resume-document", resumePDF)
}

let sampleMp3 = fm.temporaryDirectory.appendingPathComponent("portfolio-finder-sample.mp3")
if !fm.fileExists(atPath: sampleMp3.path) {
  try? Data().write(to: sampleMp3)
}
export("music-audio", sampleMp3)

for (name, path) in [
  ("app-mail", "/System/Applications/Mail.app"),
  ("app-terminal", "/System/Applications/Utilities/Terminal.app"),
  ("app-settings", "/System/Applications/System Settings.app"),
  ("app-pdf-viewer", "/System/Applications/Preview.app"),
  ("app-games", "/System/Applications/Games.app"),
  ("app-clock", "/System/Applications/Clock.app"),
] {
  export(name, URL(fileURLWithPath: path))
}

// Remove stale exports from the old ICNS pipeline
let stale = ["ws-desktop", "ws-documents", "desktop-folder-test"]
for base in stale {
  try? fm.removeItem(atPath: "\(outDir)/\(base).png")
}
