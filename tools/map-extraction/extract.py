import numpy as np, json, sys
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, remove_small_objects, binary_closing, disk

FR = {1:(40.829795,-73.513586),2:(40.829795,-73.489861),3:(40.820353,-73.513586),4:(40.820353,-73.489861),
      5:(40.810910,-73.513586),6:(40.810910,-73.489861),7:(40.801468,-73.513586),8:(40.801468,-73.489861)}
M = 156543.03392*np.cos(np.radians(40.816))/2**16   # m per css px at z16
def ll(lat,lon): return ((lon+73.5010)*84300, (lat-40.8160)*111200)

def ui_mask(h,w):
    ok = np.ones((h,w),bool)
    ok[:, :78] = False                     # left rail
    ok[:66, 85:472] = False                # search box
    ok[:62, 492:1280] = False              # chips
    ok[:62, 1400:] = False                 # apps/avatar
    ok[664:760, 88:176] = False            # layers
    ok[628:, 1262:] = False                # bottom-right controls/tooltip
    ok[724:756, 728:852] = False           # logo
    ok[752:, :] = False                    # footer
    return ok

def masks(im):
    r,g,b = [im[...,i].astype(int) for i in range(3)]
    mean = (r+g+b)/3; br = b-r
    local = (br>=0)&(br<=30)&(mean>=185)&(mean<=236)&(g>=r-3)&(b>=g-3)&(np.abs(g-r)<=14)
    major = (br>=22)&(br<=75)&(mean>=110)&(mean<192)&(g>r)
    return local, major

X0,Y0,RES,N = -2600,-2600,2.0,2600
W_local = np.zeros((N,N),np.uint16); W_major = np.zeros((N,N),np.uint16); W_seen = np.zeros((N,N),np.uint16)
for k,(lat,lon) in FR.items():
    im = np.array(Image.open(f'F{k}.jpg').convert('RGB'))
    h,w,_ = im.shape
    loc, maj = masks(im)
    ok = ui_mask(h,w)
    # fill label gaps inside roads
    loc = binary_closing(loc, disk(2)); maj = binary_closing(maj, disk(2))
    cx,cy = ll(lat,lon)
    yy,xx = np.mgrid[0:h,0:w]
    wx = cx + (xx-w/2)*M; wy = cy - (yy-h/2)*M
    ci = ((wx-X0)/RES).astype(int); cj = ((wy-Y0)/RES).astype(int)
    v = ok&(ci>=0)&(ci<N)&(cj>=0)&(cj<N)
    np.add.at(W_seen,(cj[v],ci[v]),1)
    vl = v&loc; np.add.at(W_local,(cj[vl],ci[vl]),1)
    vm = v&maj; np.add.at(W_major,(cj[vm],ci[vm]),1)
seen = W_seen>0
loc = (W_local>0); maj = (W_major>0)
np.save('seen.npy',seen); np.save('loc.npy',loc); np.save('maj.npy',maj)
# debug image
dbg = np.zeros((N,N,3),np.uint8); dbg[seen]=(40,40,40); dbg[loc]=(255,255,255); dbg[maj]=(80,140,255)
Image.fromarray(dbg[::-1]).resize((1300,1300)).save('dbg_world.png')
print('seen cells',seen.sum(),'local',loc.sum(),'major',maj.sum())
