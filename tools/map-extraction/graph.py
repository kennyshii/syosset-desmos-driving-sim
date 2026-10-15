import numpy as np, json
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, remove_small_objects, closing, disk

X0,Y0,RES = -2600,-2600,2.0
seen=np.load('maps/seen.npy'); loc=np.load('maps/loc.npy'); maj=np.load('maps/maj.npy')
maj = remove_small_objects(maj, 400)
loc = closing(loc, disk(1))
road = loc|maj
road = closing(road, disk(1))
road = remove_small_objects(road, 120)
# fill small holes (labels)
holes = ndi.binary_fill_holes(road) & ~road
lab,n = ndi.label(holes); sizes = ndi.sum(holes,lab,range(1,n+1))
small = np.isin(lab, np.where(sizes<40)[0]+1)
road = road|small
sk = skeletonize(road)

def w2(i,j): return (X0+(i+0.5)*RES, Y0+(j+0.5)*RES)
H,W = sk.shape
nb = ndi.convolve(sk.astype(int), np.ones((3,3),int), mode='constant')-1
nb[~sk]=0
pts = set(zip(*np.nonzero(sk)))
def neigh(p):
    j,i=p; out=[]
    for dj in (-1,0,1):
        for di in (-1,0,1):
            if dj==0 and di==0: continue
            q=(j+dj,i+di)
            if q in pts: out.append(q)
    return out
nodes = {p for p in pts if nb[p]!=2}
visited=set(); edges=[]
def ekey(a,b): return (a,b) if a<b else (b,a)
for s in nodes:
    for q in neigh(s):
        if ekey(s,q) in visited: continue
        path=[s,q]; visited.add(ekey(s,q)); prev=s; cur=q
        while cur not in nodes:
            nx=[r for r in neigh(cur) if r!=prev and ekey(cur,r) not in visited]
            if not nx: break
            r=nx[0]; visited.add(ekey(cur,r)); path.append(r); prev,cur=cur,r
        edges.append(path)
# loops without nodes
rem = pts - {p for e in edges for p in e}
while rem:
    s=rem.pop(); path=[s]; prev=None; cur=s
    while True:
        nx=[r for r in neigh(cur) if r!=prev and r in rem]
        if not nx: break
        r=nx[0]; rem.discard(r); path.append(r); prev,cur=cur,r
    if len(path)>5: edges.append(path+[s])

def rdp(P,eps):
    P=np.asarray(P,float)
    if len(P)<3: return P
    a,b=P[0],P[-1]; ab=b-a; L=np.hypot(*ab)
    if L<1e-9: d=np.hypot(*(P-a).T)
    else: d=np.abs(ab[0]*(P[:,1]-a[1])-ab[1]*(P[:,0]-a[0]))/L
    k=int(np.argmax(d))
    if d[k]>eps:
        return np.vstack([rdp(P[:k+1],eps)[:-1], rdp(P[k:],eps)])
    return np.vstack([a,b])
polys=[]
for e in edges:
    P=[w2(i,j) for (j,i) in e]
    polys.append(rdp(P,2.5))
def plen(P): return float(np.sum(np.hypot(*np.diff(P,axis=0).T))) if len(P)>1 else 0.0
# prune spurs iteratively
def key(pt): return (round(pt[0],1),round(pt[1],1))
for it in range(4):
    deg={}
    for P in polys:
        for pt in (P[0],P[-1]): deg[key(pt)]=deg.get(key(pt),0)+1
    keep=[]
    for P in polys:
        L=plen(P); d0=deg[key(P[0])]; d1=deg[key(P[-1])]
        if (d0==1 or d1==1) and L<18: continue
        if d0==1 and d1==1 and L<60: continue
        keep.append(P)
    polys=keep
print('edges',len(polys),'total km',sum(plen(P) for P in polys)/1000)
json.dump([P.round(1).tolist() for P in polys], open('maps/ext_polys.json','w'))
# debug render
im=Image.new('RGB',(1300,1300),(30,30,30)); d=ImageDraw.Draw(im)
s=1300/(W*RES)
def tp(x,y): return ((x-X0)*s, 1300-(y-Y0)*s)
old=json.load(open('maps/old_world.json'))
for L in old['lines']:
    d.line([tp(*p) for p in L['pts']], fill=(255,80,80), width=3)
for P in polys:
    d.line([tp(*p) for p in P], fill=(255,255,255), width=1)
im.save('maps/dbg_graph.png')
