# Crops of the client's blueprint artwork only. Source: /workspace/work/scu-bp/media (blueprint docx).
from PIL import Image, ImageOps
import os, sys
M=sys.argv[1] if len(sys.argv)>1 else '/workspace/work/scu-bp/media'
O=sys.argv[2] if len(sys.argv)>2 else '../assets/img'
C={
# home (image33)
'home-hero':('image33.png',(651,70,1536,508)),
'home-card-roads':('image33.png',(45,608,398,753)),
'home-card-water':('image33.png',(415,608,763,753)),
'home-card-growth':('image33.png',(779,608,1112,753)),
'home-card-plan':('image33.png',(1129,608,1495,753)),
'home-trees':('image28.png',(522,10,661,150)),
'home-icon-trees':('image19.png',(20,935,118,1025)),
'home-icon-homes':('image19.png',(338,945,428,1012)),
'home-forest':('image17.png',(0,580,170,772)),
# issues
'iss-roads':('image37.png',(90,529,909,775)),
'iss-water-map':('image47.png',(23,354,858,890)),
'iss-w1':('image47.png',(884,592,1063,660)),'iss-w2':('image47.png',(1078,592,1258,660)),'iss-w3':('image47.png',(1272,592,1452,660)),
'iss-w4':('image47.png',(884,704,1063,772)),'iss-w5':('image47.png',(1078,704,1258,772)),'iss-w6':('image47.png',(1272,704,1452,772)),
'iss-growth-map':('image40.png',(26,414,570,937)),
'iss-plan-map':('image44.png',(30,292,770,830)),
'iss-t2001':('image44.png',(803,458,1043,576)),'iss-ttoday':('image44.png',(1090,486,1345,576)),'iss-t2026':('image44.png',(1387,512,1640,576)),
'iss-a1':('image44.png',(800,745,998,820)),'iss-a2':('image44.png',(1015,745,1205,820)),'iss-a3':('image44.png',(1222,745,1425,820)),'iss-a4':('image44.png',(1440,745,1642,820)),
'iss-c1':('image52.png',(70,434,466,488)),'iss-c2':('image52.png',(492,434,864,488)),'iss-c3':('image52.png',(890,434,1288,488)),
# roads
'rd-lighting':('image46.png',(634,86,1449,507)),
'rd-gunn':('image58.jpg',(32,362,831,642)),'rd-gunn-map':('image58.jpg',(851,124,1449,642)),
'rd-walk':('image50.png',(658,94,1445,484)),
'rd-emerg':('image60.jpg',(622,98,1449,478)),
'rd-r1':('image21.png',(36,417,307,640)),'rd-r2':('image21.png',(336,417,608,642)),'rd-r3':('image21.png',(635,411,909,657)),'rd-r4':('image21.png',(935,413,1205,640)),'rd-r5':('image21.png',(1238,403,1502,660)),
'rd-cmp-l':('image26.png',(24,318,313,898)),'rd-cmp-r':('image26.png',(1161,318,1452,898)),
# water
'wt-hero':('image29.png',(700,62,1336,505)),
'wt-i1':('image29.png',(100,512,230,640)),'wt-i2':('image29.png',(527,512,657,640)),'wt-i3':('image29.png',(940,512,1073,640)),
'wt-septic-map':('image45.jpg',(605,108,1340,572)),
'wt-repair-chart':('image36.jpg',(68,490,715,648)),'wt-repair-map':('image36.jpg',(735,112,1415,646)),
'wt-3d':('image13.png',(500,100,1341,400)),'wt-cutaway':('image13.png',(0,470,1341,730)),
'wt-lake':('image10.png',(0,540,615,830)),
'wt-o1':('image10.png',(698,145,832,277)),'wt-o2':('image10.png',(947,145,1080,277)),'wt-o3':('image10.png',(1197,145,1330,277)),
'wt-lakestrip':('image6.png',(0,190,1536,300)),
'wt-cmp-l':('image3.png',(500,337,731,441)),'wt-cmp-r':('image3.png',(1180,337,1431,441)),
'wt-e1':('image15.jpg',(40,266,305,370)),'wt-e2':('image15.jpg',(322,266,589,370)),'wt-e3':('image15.jpg',(603,266,873,370)),'wt-e4':('image15.jpg',(887,266,1156,370)),'wt-e5':('image15.jpg',(1171,266,1436,370)),
'wt-next':('image15.jpg',(820,715,1476,984)),
# growth
'gr-then':('image18.jpg',(0,272,700,683)),'gr-today':('image18.jpg',(776,272,1476,683)),  # inset past the baked centre arrow
'gr-services-map':('image20.jpg',(320,306,1140,806)),
'gr-s1':('image20.jpg',(1354,389,1453,440)),'gr-s2':('image20.jpg',(1354,444,1453,494)),'gr-s3':('image20.jpg',(1354,499,1453,549)),'gr-s4':('image20.jpg',(1354,554,1453,604)),'gr-s5':('image20.jpg',(1354,609,1453,659)),
'gr-cmp-l':('image12.jpg',(0,286,270,738)),'gr-cmp-r':('image12.jpg',(1206,286,1476,738)),
'gr-e1':('image38.jpg',(310,270,498,425)),'gr-e2':('image38.jpg',(768,270,958,425)),'gr-e3':('image38.jpg',(1237,270,1444,425)),
'gr-e4':('image38.jpg',(304,445,498,600)),'gr-e5':('image38.jpg',(768,445,958,600)),'gr-e6':('image38.jpg',(1243,445,1444,600)),
'gr-density':('density_natural_20261016.jpg',(42,363,1497,702)),
'gr-next':('image38.jpg',(720,622,1476,832)),
# proposal
'pr-roads-hero':('roads_comparison_approved_20261016.png',(800,40,1070,248)),
'pr-roads-l':('roads_comparison_approved_20261016.png',(40,362,515,553)),'pr-roads-r':('roads_comparison_approved_20261016.png',(557,362,1031,553)),
'pr-roads-illus':('roads_comparison_approved_20261016.png',(40,1185,280,1262)),
'pr-water-hero':('image1.png',(790,68,1536,290)),'pr-water-illus':('image1.png',(48,812,282,898)),
'pr-growth-hero':('image4.png',(770,68,1536,294)),'pr-growth-illus':('image4.png',(40,805,270,875)),
'pr-gl1':('image4.png',(80,368,256,452)),'pr-gl2':('image4.png',(80,462,256,553)),'pr-gl3':('image4.png',(80,563,256,653)),'pr-gl4':('image4.png',(80,663,256,753)),
'pr-gr1':('image4.png',(803,368,993,452)),'pr-gr2':('image4.png',(803,462,993,554)),'pr-gr3':('image4.png',(803,565,993,653)),'pr-gr4':('image4.png',(803,663,993,753)),
'pr-remain-hero':('image2.png',(860,68,1536,330)),'pr-remove-doc':('image2.png',(120,415,380,735)),'pr-remain-illus':('image2.png',(40,780,275,855)),
# evidence
'ev-c1':('image42.png',(40,316,396,488)),'ev-c2':('image42.png',(412,316,760,488)),'ev-c3':('image42.png',(776,316,1128,488)),'ev-c4':('image42.png',(1145,316,1500,488)),
'ev-l1':('image56.png',(60,277,259,377)),'ev-l2':('image56.png',(60,404,259,495)),'ev-l3':('image56.png',(60,520,259,604)),'ev-l4':('image56.png',(60,630,259,711)),'ev-l5':('image56.png',(60,735,259,816)),
# action
'ac-hero':('action_hero_paragraph_removed_20261016.png',(545,430,1672,826)),
'ac-c1':('image51.png',(66,371,517,607)),'ac-c2':('image51.png',(544,371,992,609)),'ac-c3':('image51.png',(1019,371,1477,607)),
'ac-story-bg':('image48.png',(760,300,1012,903)),
'ac-share':('image57.png',(745,100,1536,880)),
'ac-st1':('image55.png',(58,310,523,500)),'ac-st2':('image55.png',(545,310,992,500)),'ac-st3':('image55.png',(1013,310,1480,500)),
'ac-hand':('image55.png',(1230,110,1510,290)),
# petition
'pt-side-l':('image43.png',(0,180,105,640)),'pt-side-r':('image43.png',(783,180,887,640)),
}
os.makedirs(O,exist_ok=True)
for k,(f,b) in C.items():
    im=Image.open(os.path.join(M,f)).convert('RGB').crop(b)
    im.save(os.path.join(O,k+'.jpg'),quality=86,optimize=True,progressive=True)
# full maps / approved artwork (kept whole, original pixels)
FULL={'map-official-fig3':'image34.png','map-area':'image27.png','map-roads':'image25.png',
 'preview-map-1':'image28.png','preview-map-2':'image19.png','preview-map-3':'image17.png'}
for k,f in FULL.items():
    im=Image.open(os.path.join(M,f)).convert('RGB'); im.save(os.path.join(O,k+'.jpg'),quality=90,optimize=True,progressive=True)
print(len(C)+len(FULL))
