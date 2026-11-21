import type { APIRoute } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import MenuBranch from "../../components/MenuBranch.astro";
import { aircraftMenus } from "../../data/manual-menu";

// One file per aircraft with its menu branch as HTML. Pages carry only a row for
// each aircraft; opening it fetches this file, so a dozen aircraft never put a
// dozen trees in every page.
export function getStaticPaths() {
  return aircraftMenus.map((aircraft) => ({ params: { aircraft: aircraft.id }, props: { id: aircraft.id } }));
}

export const GET: APIRoute = async ({ props }) => {
  const aircraft = aircraftMenus.find((a) => a.id === props.id)!;
  const node = aircraft.build();
  const container = await AstroContainer.create();
  const html = await container.renderToString(MenuBranch, {
    props: { nodes: node.children ?? [], route: "", parent: node.id, depth: 2 },
  });
  return new Response(JSON.stringify({ html }), { headers: { "Content-Type": "application/json" } });
};
