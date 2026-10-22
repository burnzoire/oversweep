const basePath = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function sitePath(path = ""): string {
  const relativePath = path.replace(/^\/+|\/+$/g, "");
  return relativePath ? `${basePath}/${relativePath}/` : `${basePath}/`;
}
