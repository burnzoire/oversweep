const basePath = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function sitePath(path = ""): string {
  const relativePath = path.replace(/^\/+|\/+$/g, "");
  return relativePath ? `${basePath}/${relativePath}/` : `${basePath}/`;
}

// A file in public/, without the trailing slash sitePath adds for pages.
export function assetPath(file: string): string {
  return `${basePath}/${file.replace(/^\/+/, "")}`;
}
