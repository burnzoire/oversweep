#!/usr/bin/env python3
"""Generate the airfield table for each DCS map from pydcs terrain data.

pydcs (https://github.com/pydcs/dcs) is an open-source library for building
DCS World missions. Its dcs/terrain/<terrain>/airports.py files are dumped
from the game and list every airfield on a map with its ATC radios, runways
and runway beacons. This script reads those files at one pinned commit,
without importing pydcs, and writes src/data/map-airfields/<map>.json.

Usage: python3 -I scripts/import_pydcs_airfields.py [--source DIR]

--source reads a local pydcs checkout instead of fetching from GitHub; it
must be at the pinned commit.
"""
from __future__ import annotations

import argparse
import ast
import json
import pathlib
import urllib.request

COMMIT = "5ddcc63a2dcd661e16b14f7aa43219b93044855d"
# Map record slug -> pydcs terrain module. Maps not listed here have no
# pydcs terrain (DCS: Marianas WWII, Iraq, Cold War Germany at this commit).
MAPS = {
    "dcs-syria": "syria",
    "dcs-persian-gulf": "persiangulf",
    "dcs-nevada": "nevada",
    "dcs-marianas": "marianaislands",
    "dcs-the-channel": "thechannel",
}
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "map-airfields"


def source_url(terrain: str) -> str:
    return f"https://github.com/pydcs/dcs/blob/{COMMIT}/dcs/terrain/{terrain}/airports.py"


def read(terrain: str, local: pathlib.Path | None) -> str:
    if local:
        return (local / "dcs" / "terrain" / terrain / "airports.py").read_text()
    raw = f"https://raw.githubusercontent.com/pydcs/dcs/{COMMIT}/dcs/terrain/{terrain}/airports.py"
    with urllib.request.urlopen(raw, timeout=60) as response:
        return response.read().decode()


def kwargs(call: ast.Call) -> dict:
    return {k.arg: k.value for k in call.keywords}


def approach(node: ast.Call) -> dict:
    a = kwargs(node)
    return {
        "name": ast.literal_eval(a["name"]),
        "heading": ast.literal_eval(a["heading"]),
        "beacons": len(a["beacons"].elts),
    }


def mhz(hz: int) -> float | None:
    return round(hz / 1e6, 3) if hz else None


def parse(text: str) -> list[dict]:
    airfields = []
    for cls in ast.parse(text).body:
        if not (isinstance(cls, ast.ClassDef) and any(getattr(b, "id", None) == "Airport" for b in cls.bases)):
            continue
        fields: dict = {"runways": [], "airfieldBeacons": 0}
        for stmt in cls.body:
            if isinstance(stmt, (ast.Assign, ast.AnnAssign)):
                target = stmt.targets[0] if isinstance(stmt, ast.Assign) else stmt.target
                name = getattr(target, "id", None)
                if name in ("id", "name", "civilian"):
                    fields[name] = ast.literal_eval(stmt.value)
                elif name == "tacan" and not (isinstance(stmt.value, ast.Constant) and stmt.value.value is None):
                    fields["tacan"] = ast.literal_eval(stmt.value)
                elif name == "atc_radio" and isinstance(stmt.value, ast.Call):
                    r = {k: ast.literal_eval(v) for k, v in kwargs(stmt.value).items()}
                    fields["atc"] = {
                        "uhf": mhz(r["uhf_hz"]),
                        "vhf": mhz(r["vhf_high_hz"]),
                        "fm": mhz(r["vhf_low_hz"]),
                        "hf": mhz(r["hf_hz"]),
                    }
            elif isinstance(stmt, ast.FunctionDef) and stmt.name == "__init__":
                for node in ast.walk(stmt):
                    if not (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "append"):
                        continue
                    owner = node.func.value
                    kind = owner.attr if isinstance(owner, ast.Attribute) else None
                    item = node.args[0]
                    if kind == "runways":
                        r = kwargs(item)
                        fields["runways"].append({
                            "name": ast.literal_eval(r["name"]),
                            "ends": [approach(r["main"]), approach(r["opposite"])],
                        })
                    elif kind == "beacons":
                        fields["airfieldBeacons"] += 1
        airfields.append(fields)
    return sorted(airfields, key=lambda a: a["name"].lower())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", type=pathlib.Path, help="local pydcs checkout at the pinned commit")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, terrain in MAPS.items():
        airfields = parse(read(terrain, args.source))
        data = {
            "map": slug,
            "source": {
                "title": f"pydcs terrain data: {terrain} airports (airports.py)",
                "publisher": "pydcs, an open-source Python library for building DCS World missions, whose terrain data mirrors the game's",
                "url": source_url(terrain),
                "commit": COMMIT,
            },
            "airfields": airfields,
        }
        (OUT / f"{slug}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
        print(f"{slug}: {len(airfields)} airfields")


if __name__ == "__main__":
    main()
