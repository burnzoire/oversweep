import type { APIRoute } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
// @ts-ignore tsc has no declaration for .astro files; astro check and the build resolve it.
import MenuBranch from "../../components/MenuBranch.astro";
import { categoryHasContent } from "../../data/availability";
import { encyclopediaCategories } from "../../data/catalogue";
import { encyclopediaBranch, encyclopediaCategoryId } from "../../data/encyclopedia-menu";

export function getStaticPaths() {
  return encyclopediaCategories.filter(({ slug }) => categoryHasContent(slug)).map(({ slug }) => ({
    params: { category: slug },
    props: { slug },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { slug } = props;
  const container = await AstroContainer.create();
  const html = await container.renderToString(MenuBranch, {
    props: { nodes: encyclopediaBranch(slug), route: "", parent: encyclopediaCategoryId(slug), depth: 1 },
  });
  return Response.json({ html });
};
