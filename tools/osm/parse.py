import sys, json, glob, xml.etree.ElementTree as ET
src, out = sys.argv[1], sys.argv[2]
nodes, ways, rels = {}, {}, {}
for f in sorted(glob.glob(src + '/t*.xml')):
    for el in ET.parse(f).getroot():
        tags = {t.get('k'): t.get('v') for t in el.findall('tag')}
        if el.tag == 'node':
            nodes[el.get('id')] = (float(el.get('lat')), float(el.get('lon')), tags)
        elif el.tag == 'way':
            ways[el.get('id')] = ([n.get('ref') for n in el.findall('nd')], tags)
        elif el.tag == 'relation':
            rels[el.get('id')] = ([(m.get('type'), m.get('ref'), m.get('role')) for m in el.findall('member')], tags)
def ll(lat, lon): return [round((lon + 73.5010) * 84300, 1), round((lat - 40.8160) * 111200, 1)]
hw, rail, pois, bld = [], [], [], []
for wid, (nds, t) in ways.items():
    pts = [ll(nodes[n][0], nodes[n][1]) for n in nds if n in nodes]
    if len(pts) < 2: continue
    if 'highway' in t:
        hw.append({'id': wid, 'hw': t['highway'], 'name': t.get('name', ''), 'ref': t.get('ref', ''), 'lanes': t.get('lanes', ''), 'oneway': t.get('oneway', ''), 'service': t.get('service', ''), 'area': t.get('area', ''), 'access': t.get('access', ''), 'pts': pts})
    elif t.get('railway') == 'rail':
        rail.append({'id': wid, 'name': t.get('name', ''), 'service': t.get('service', ''), 'pts': pts})
    if 'building' in t or 'amenity' in t or 'shop' in t or 'brand' in t or 'leisure' in t or 'landuse' in t:
        bld.append({'id': wid, 'tags': t, 'pts': pts})
for nid, (lat, lon, t) in nodes.items():
    if any(k in t for k in ('amenity', 'shop', 'brand', 'leisure', 'tourism', 'railway', 'office', 'healthcare', 'craft')) and ('name' in t or 'brand' in t):
        pois.append({'id': nid, 'tags': t, 'xy': ll(lat, lon)})
json.dump({'hw': hw, 'rail': rail, 'pois': pois, 'areas': bld}, open(out, 'w'))
from collections import Counter
print('nodes', len(nodes), 'ways', len(ways), 'rels', len(rels))
print('highways', len(hw), Counter(h['hw'] for h in hw).most_common())
print('rail', len(rail), 'pois', len(pois), 'areas', len(bld))
