#!/usr/bin/env python3
"""Generate the airfield table for each DCS map from data dumped from the game.

The main source is dcs-world-schema (https://github.com/YoloWingPixie/dcs-world-schema,
MIT licence), whose dcs-world-reference/latest/ holds airbases, beacons and
ILS navaids extracted from a DCS World install by running the game. For a
terrain it does not cover, the script falls back to pydcs
(https://github.com/pydcs/dcs), whose airports.py files list radios and
runways but no beacon details. Both are read at pinned commits.

It writes src/data/map-airfields/<map>.json, one file per map record.

Usage: python3 -I scripts/import_map_airfields.py [--schema DIR] [--pydcs DIR]

--schema and --pydcs read local checkouts, which must be at the pinned
commits; without them the script fetches what it needs into a temporary
directory with git.
"""
from __future__ import annotations

import argparse
import ast
import json
import pathlib
import subprocess
import tempfile

SCHEMA_REPO = "https://github.com/YoloWingPixie/dcs-world-schema"
SCHEMA_COMMIT = "c3091e6c08fb8167e26145d0e33c10e4140c6fe7"
PYDCS_REPO = "https://github.com/pydcs/dcs"
PYDCS_COMMIT = "5ddcc63a2dcd661e16b14f7aa43219b93044855d"
# Map record slug -> (source, terrain directory in that source, pydcs terrain).
# The pydcs terrain fills in tower radios that dcs-world-schema leaves out.
MAPS = {
    "dcs-syria": ("schema", "Syria", "syria"),
    "dcs-persian-gulf": ("schema", "PersianGulf", "persiangulf"),
    "dcs-nevada": ("schema", "Nevada", "nevada"),
    "dcs-marianas": ("schema", "MarianaIslands", "marianaislands"),
    "dcs-marianas-1944": ("schema", "MarianaIslandsWWII", None),
    # Not in dcs-world-schema at the pinned commit.
    "dcs-the-channel": ("pydcs", "thechannel", "thechannel"),
}
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "map-airfields"
FT = 3.28084
# Beacon types shown, with the label the table uses. ILS and PRMG parts
# come through the navaids records instead.
BEACON_LABELS = {
    "BEACON_TYPE_TACAN": "TACAN",
    "BEACON_TYPE_VORTAC": "VORTAC",
    "BEACON_TYPE_VOR_DME": "VOR-DME",
    "BEACON_TYPE_VOR": "VOR",
    "BEACON_TYPE_DME": "DME",
    "BEACON_TYPE_RSBN": "RSBN",
    "BEACON_TYPE_AIRPORT_HOMER": "NDB",
    "BEACON_TYPE_AIRPORT_HOMER_WITH_MARKER": "NDB with marker",
    "BEACON_TYPE_HOMER": "NDB",
}


DME_TYPES = {"BEACON_TYPE_TACAN", "BEACON_TYPE_VORTAC", "BEACON_TYPE_VOR_DME", "BEACON_TYPE_DME"}


def tacan_band(channel: int, hz: int | None) -> str | None:
    """The X or Y band a TACAN/DME channel's listed frequency shows, or None.

    DCS gives no band, but a beacon's frequency is either the channel's
    reply frequency or its paired VHF frequency, which differ between the
    bands (ICAO Annex 10 Volume I, Chapter 3, Table A, as dcs-world-schema's
    tools/datamine/overlays.yaml sets out): interrogation is 1025 MHz plus
    (channel - 1); X replies 63 MHz below it on channels 1-63 and above it
    on 64-126, Y the other way round; channels 17-59 pair with 108.00 MHz
    and 70-126 with 112.30 MHz in 0.1 MHz steps, Y 0.05 MHz above X.
    """
    if not hz:
        return None
    f = hz / 1e6
    if f > 900:
        interrogation = 1025 + channel - 1
        below, above = interrogation - 63, interrogation + 63
        x, y = (below, above) if channel <= 63 else (above, below)
        return "X" if abs(f - x) < 0.01 else "Y" if abs(f - y) < 0.01 else None
    first, base = (17, 108.0) if 17 <= channel <= 59 else (70, 112.3) if 70 <= channel <= 126 else (None, None)
    if first is None:
        return None
    paired = base + (channel - first) * 0.1
    return "X" if abs(f - paired) < 0.001 else "Y" if abs(f - paired - 0.05) < 0.001 else None


def checkout(repo: str, commit: str, paths: list[str]) -> pathlib.Path:
    """Fetch only `paths` of `repo` at `commit` into a temporary directory."""
    target = pathlib.Path(tempfile.mkdtemp(prefix="map-airfields-"))
    run = lambda *args: subprocess.run(["git", "-C", str(target), *args], check=True, capture_output=True)
    run("init", "-q")
    run("remote", "add", "origin", repo)
    run("sparse-checkout", "set", "--no-cone", *paths)
    run("fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", commit)
    run("checkout", "-q", "FETCH_HEAD")
    return target


def at_commit(path: pathlib.Path, commit: str) -> pathlib.Path:
    head = subprocess.run(["git", "-C", str(path), "rev-parse", "HEAD"], check=True, capture_output=True, text=True).stdout.strip()
    if head != commit:
        raise SystemExit(f"{path} is at {head}, not the pinned {commit}")
    return path


def mhz(hz: int | None) -> float | None:
    return round(hz / 1e6, 3) if hz else None


def schema_airfields(root: pathlib.Path, terrain: str) -> list[dict]:
    ref = root / "dcs-world-reference" / "latest"
    beacons = {}
    for f in (ref / "beacons" / terrain).glob("*/*.json"):
        b = json.loads(f.read_text())
        beacons[b["id"]] = b
    navaids = {}
    for f in (ref / "navaids").glob(f"{terrain}.*.json"):
        n = json.loads(f.read_text())
        navaids[n["id"]] = n
    airfields = []
    for f in (ref / "airbases" / terrain).glob("*.json"):
        a = json.loads(f.read_text())
        point = a["referencePoint"]
        radio = {}
        for service in a.get("services", []):
            for ch in service.get("channels", []):
                radio.setdefault({"VHF_HI": "vhf", "UHF": "uhf", "VHF_LOW": "vhfLow", "HF": "hf"}[ch["bandName"]], mhz(ch["frequencyHz"]))
        aids = []
        for bid in a.get("beacons", []):
            b = beacons.get(bid)
            if not b or b["typeName"] not in BEACON_LABELS:
                continue
            aid = {"type": BEACON_LABELS[b["typeName"]], "callsign": b.get("callsign")}
            if "channel" in b:
                aid["channel"] = b["channel"]
                band = tacan_band(b["channel"], b.get("frequencyHz"))
                if band and b["typeName"] in DME_TYPES:
                    aid["band"] = band
            if b.get("frequencyHz"):
                hz = b["frequencyHz"]
                aid["frequency"] = round(hz / 1e3) if hz < 3e6 else mhz(hz)
                aid["unit"] = "kHz" if hz < 3e6 else "MHz"
            aids.append(aid)
        # The runway end each navaid serves, from the navaid or the runway that lists it.
        ends = {nid: d["designator"] for r in a.get("runways", []) for d in r["directions"] for nid in d.get("navaids", [])}
        approaches = []
        for nid in a.get("navaids", []):
            n = navaids.get(nid)
            if n:
                aid = {"type": n["type"], "runway": n.get("runwayDirection") or ends.get(nid, ""), "callsign": n.get("callsign")}
                # An ILS has a frequency; a PRMG, the Soviet equivalent, a channel.
                if n.get("frequencyHz"):
                    aid["frequency"] = mhz(n["frequencyHz"])
                if "channel" in n:
                    aid["channel"] = n["channel"]
                approaches.append(aid)
        airfields.append({
            "name": a["name"],
            "elevationFt": round(point["elevationM"] * FT),
            "lat": round(point["latitude"], 4),
            "lon": round(point["longitude"], 4),
            "runways": [{
                "name": r["designator"],
                "lengthFt": round(r["lengthM"] * FT),
                "ends": [{"name": d["designator"], "heading": round(d["magneticBearingDeg"])} for d in r["directions"]],
            } for r in a.get("runways", [])],
            "radio": radio,
            "navaids": sorted(aids, key=lambda x: (x["type"], x.get("callsign") or "")),
            "approaches": sorted(approaches, key=lambda x: (x["runway"], x["type"])),
        })
    return sorted(airfields, key=lambda x: x["name"].lower())


def pydcs_airfields(root: pathlib.Path, terrain: str) -> list[dict]:
    text = (root / "dcs" / "terrain" / terrain / "airports.py").read_text()
    kw = lambda call: {k.arg: k.value for k in call.keywords}
    airfields = []
    for cls in ast.parse(text).body:
        if not (isinstance(cls, ast.ClassDef) and any(getattr(b, "id", None) == "Airport" for b in cls.bases)):
            continue
        a: dict = {"runways": [], "radio": {}, "navaids": [], "approaches": []}
        for stmt in cls.body:
            if isinstance(stmt, ast.Assign) and getattr(stmt.targets[0], "id", None) == "name":
                a["name"] = ast.literal_eval(stmt.value)
            elif isinstance(stmt, ast.Assign) and getattr(stmt.targets[0], "id", None) == "atc_radio" and isinstance(stmt.value, ast.Call):
                r = {k: ast.literal_eval(v) for k, v in kw(stmt.value).items()}
                a["radio"] = {k: v for k, v in {"vhf": mhz(r["vhf_high_hz"]), "uhf": mhz(r["uhf_hz"]), "vhfLow": mhz(r["vhf_low_hz"]), "hf": mhz(r["hf_hz"])}.items() if v}
            elif isinstance(stmt, ast.FunctionDef) and stmt.name == "__init__":
                for node in ast.walk(stmt):
                    if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "append" \
                            and getattr(node.func.value, "attr", None) == "runways":
                        r = kw(node.args[0])
                        ends = [kw(r[k]) for k in ("main", "opposite")]
                        a["runways"].append({
                            "name": ast.literal_eval(r["name"]).replace("-", "/"),
                            "ends": [{"name": ast.literal_eval(e["name"]), "heading": ast.literal_eval(e["heading"])} for e in ends],
                        })
        airfields.append(a)
    return sorted(airfields, key=lambda x: x["name"].lower())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--schema", type=pathlib.Path, help="dcs-world-schema checkout at the pinned commit")
    parser.add_argument("--pydcs", type=pathlib.Path, help="pydcs checkout at the pinned commit")
    args = parser.parse_args()
    schema_terrains = [t for s, t, _ in MAPS.values() if s == "schema"]
    pydcs_terrains = [p for _, _, p in MAPS.values() if p]
    schema = at_commit(args.schema, SCHEMA_COMMIT) if args.schema else checkout(SCHEMA_REPO, SCHEMA_COMMIT, [
        "dcs-world-reference/latest/manifest.json",
        *(f"dcs-world-reference/latest/{d}/{t}/" for t in schema_terrains for d in ("airbases", "beacons")),
        *(f"dcs-world-reference/latest/navaids/{t}.*" for t in schema_terrains),
    ])
    pydcs = at_commit(args.pydcs, PYDCS_COMMIT) if args.pydcs else checkout(PYDCS_REPO, PYDCS_COMMIT, [f"dcs/terrain/{t}/airports.py" for t in pydcs_terrains])
    manifest = json.loads((schema / "dcs-world-reference" / "latest" / "manifest.json").read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, (source, terrain, pydcs_terrain) in MAPS.items():
        if source == "schema":
            airfields = schema_airfields(schema, terrain)
            # Where the game dump gives an airfield no tower radio, take the one
            # pydcs lists for the same airfield, and say so.
            fallback = {a["name"]: a["radio"] for a in pydcs_airfields(pydcs, pydcs_terrain)} if pydcs_terrain else {}
            for a in airfields:
                if not a["radio"] and fallback.get(a["name"]):
                    a["radio"], a["radioSource"] = fallback[a["name"]], "pydcs"
            meta = {
                "title": f"dcs-world-schema reference data: {terrain} airbases, beacons and navaids",
                "publisher": f"dcs-world-schema, open-source data extracted by running DCS World {manifest['dcsVersion']} (extracted {manifest['extractedAt'][:10]})",
                "url": f"{SCHEMA_REPO}/tree/{SCHEMA_COMMIT}/dcs-world-reference/latest/airbases/{terrain}",
                "commit": SCHEMA_COMMIT,
                "dcsVersion": manifest["dcsVersion"],
                "beacons": True,
                "radioFallback": {
                    "title": f"pydcs terrain data: {pydcs_terrain} airports (airports.py)",
                    "url": f"{PYDCS_REPO}/blob/{PYDCS_COMMIT}/dcs/terrain/{pydcs_terrain}/airports.py",
                } if pydcs_terrain else None,
            }
        else:
            airfields = pydcs_airfields(pydcs, terrain)
            meta = {
                "title": f"pydcs terrain data: {terrain} airports (airports.py)",
                "publisher": "pydcs, an open-source Python library for building DCS World missions, whose terrain data mirrors the game's",
                "url": f"{PYDCS_REPO}/blob/{PYDCS_COMMIT}/dcs/terrain/{terrain}/airports.py",
                "commit": PYDCS_COMMIT,
                "beacons": False,
            }
        (OUT / f"{slug}.json").write_text(json.dumps({"map": slug, "source": meta, "airfields": airfields}, indent=1, ensure_ascii=False) + "\n")
        print(f"{slug}: {sum(1 for a in airfields if a['runways'])} airfields with runways, {sum(1 for a in airfields if not a['runways'])} without")


if __name__ == "__main__":
    main()
