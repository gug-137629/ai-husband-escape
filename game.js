const KEY="cloud-home-v4";
const petOrder=["hadou","wang","mimi","bobo"];
const petsBase={
 hadou:{name:"哈豆",kind:"暹罗猫",personality:"活泼",type:"siamese",h:82,m:88,e:86,c:82,bond:12,place:"home",outfit:"none"},
 wang:{name:"汪汪",kind:"三花猫",personality:"聪明、慢热、有点小心机",type:"calico",h:78,m:72,e:76,c:84,bond:10,place:"home",outfit:"none"},
 mimi:{name:"咪咪",kind:"萨摩耶",personality:"热情、黏人、乐天派",type:"samoyed",h:84,m:90,e:92,c:80,bond:14,place:"yard",outfit:"none"},
 bobo:{name:"啵啵",kind:"小太阳鹦鹉",personality:"话多、好奇、爱凑热闹",type:"conure",h:75,m:86,e:88,c:82,bond:11,place:"home",outfit:"none"}
};
const furniture=[
 {id:"sofa",name:"奶油小沙发",cost:40,kind:"sofa"},
 {id:"plant",name:"窗边绿植",cost:25,kind:"plant"},
 {id:"rug",name:"云朵地毯",cost:30,kind:"rug"},
 {id:"lamp",name:"暖黄落地灯",cost:35,kind:"lamp"},
 {id:"catTree",name:"猫猫爬架",cost:55,kind:"catTree"},
 {id:"bed",name:"四人小窝",cost:60,kind:"bed"}
];
const outfits=[
 {id:"hat",name:"小草莓帽",cost:18},
 {id:"bow",name:"蝴蝶结",cost:14},
 {id:"raincoat",name:"黄色雨衣",cost:28},
 {id:"scarf",name:"软软围巾",cost:22}
];
let state=load();
let selectedPet="hadou";
let storyIndex=0;\nlet editingZone=null;

function fresh(){return{day:1,coins:120,level:1,last:Date.now(),pets:structuredClone(petsBase),ownedFurniture:[],placements:{},ownedOutfits:[],storySeen:[],storyChoiceCount:0}}
function clamp(n){return Math.max(0,Math.min(100,Math.round(n)))}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(!s)return fresh();const hours=Math.min(72,Math.max(0,(Date.now()-s.last)/36e5));Object.values(s.pets).forEach(p=>{p.h=clamp(p.h-hours*1.1);p.m=clamp(p.m-hours*.45);p.e=clamp(p.e-hours*.35);p.c=clamp(p.c-hours*.7)});s.last=Date.now();return s}catch{return fresh()}}
function save(){state.last=Date.now();localStorage.setItem(KEY,JSON.stringify(state))}
const $=s=>document.querySelector(s);

function petActionClass(p){
 if(p.h<28)return "action-hungry";
 if(p.c<28)return "action-dirty";
 if(p.e<22)return "action-sleepy";
 if(p.m>78)return "action-happy";
 return "action-idle";
}
function outfitMarkup(id){
 if(id==="hat")return '<i class="clothing hat">★</i>';
 if(id==="bow")return '<i class="clothing bow"><b></b></i>';
 if(id==="raincoat")return '<i class="clothing raincoat"></i>';
 if(id==="scarf")return '<i class="clothing scarf"></i>';
 return "";
}
function petMarkup(id,extra=""){
 const p=state.pets[id];
 return '<div class="pet '+id+' '+p.type+' outfit-'+p.outfit+' '+petActionClass(p)+' '+extra+'" data-pet="'+id+'"><div class="pet-sprite"></div>'+outfitMarkup(p.outfit)+'<span class="action-bubble"></span><span class="pet-name">'+p.name+'</span></div>';
}
function status(id){
 const p=state.pets[id];
 if(p.h<28)return"肚子咕咕叫";
 if(p.c<28)return"身上有点脏，想洗澡";
 if(p.e<22)return"困得想钻进窝里";
 if(p.m<35)return"有一点无聊";
 return id==="hadou"?"正在找最舒服的晒太阳位置":id==="wang"?"装作路过，其实在观察你":id==="mimi"?"叼着玩具在院子里跑":"正在偷听你们讲话";
}
function renderPlacedRoom(){
 const target=$("#homeFurniture"); if(!target)return;
 target.innerHTML=state.ownedFurniture.map(id=>{const f=furniture.find(x=>x.id===id),pos=state.placements[id]||{x:50,y:55};return `<div class="furniture-ghost ${f.kind}" data-room-furniture="${id}" style="left:${pos.x}%;top:${pos.y}%"></div>`}).join("");
 renderEditorOverlay();
}
function renderEditorOverlay(){
 const zone=editingZone;
 ["homeEditor","yardEditor"].forEach(id=>$("#"+id)?.classList.add("hidden"));
 if(!zone)return;
 const target=$("#"+zone+"Editor"); if(!target)return;
 target.classList.remove("hidden");
 target.innerHTML='<div class="editor-head"><b>布置模式</b><span>拖动家具，点“完成”保存</span><button id="finishEditor">完成</button></div>';
 state.ownedFurniture.forEach(id=>{
   const f=furniture.find(x=>x.id===id),pos=state.placements[id]||{x:50,y:55};
   target.insertAdjacentHTML("beforeend",`<div class="editor-piece ${f.kind}" data-editor-furniture="${id}" style="left:${pos.x}%;top:${pos.y}%"><span>${f.name}</span></div>`);
 });
 document.querySelector("#finishEditor").onclick=()=>{editingZone=null;renderEditorOverlay();};
 enableSceneFurnitureDrag();
}
function enableSceneFurnitureDrag(){
 document.querySelectorAll("[data-editor-furniture]").forEach(el=>{
   let dragging=false;
   const move=e=>{
     if(!dragging)return;
     const box=el.parentElement.getBoundingClientRect();
     const x=Math.max(4,Math.min(94,(e.clientX-box.left)/box.width*100));
     const y=Math.max(8,Math.min(88,(e.clientY-box.top)/box.height*100));
     el.style.left=x+"%";el.style.top=y+"%";
     state.placements[el.dataset.editorFurniture]={x,y};
     renderPlacedRoom();
   };
   el.onpointerdown=e=>{dragging=true;el.setPointerCapture(e.pointerId)};
   el.onpointermove=move;
   el.onpointerup=()=>{dragging=false;save()};
 });
}
function renderPets(){
 $("#homePets").innerHTML=petOrder.filter(id=>state.pets[id].place==="home").map(id=>petMarkup(id)).join("");
 $("#yardPets").innerHTML=petOrder.filter(id=>state.pets[id].place==="yard").map(id=>petMarkup(id)).join("");
 document.querySelectorAll(".pet").forEach(el=>el.onclick=()=>inspect(el.dataset.pet));
 $("#petMiniList").innerHTML=petOrder.map(id=>{const p=state.pets[id];return '<div class="pet-mini" data-pet-mini="'+id+'"><strong>'+p.name+'</strong><small>'+p.kind+'</small><span class="place">'+(p.place==="home"?"在家里":"在院子里")+'</span></div>'}).join("");
 document.querySelectorAll("[data-pet-mini]").forEach(el=>el.onclick=()=>{selectedPet=el.dataset.petMini;showCare()});
}
function inspect(id){selectedPet=id;const p=state.pets[id];$("#storyText").textContent=p.name+"： "+status(id)+"。它现在"+(p.place==="home"?"待在家里。":"在院子里撒欢。");$("#storyHint").textContent=p.kind+" · "+p.personality;showCare()}
function needs(p){return '<div class="needs"><span>🍗 饥饿 '+p.h+'</span><span>🫧 清洁 '+p.c+'</span><span>💗 心情 '+p.m+'</span><span>⚡ 精力 '+p.e+'</span></div>'}

function showCare(){
 $("#carePanel").classList.remove("hidden");$("#designPanel").classList.add("hidden");$("#wardrobePanel").classList.add("hidden");
 const p=state.pets[selectedPet];
 $("#carePanel").innerHTML='<div class="panel-title">'+p.name+' 的小护理</div>'+needs(p)+'<div class="care-grid">'+
 '<div class="care-card"><b>🍗 喂饭</b><small>它会自己吃得很开心</small><button data-care="feed">喂它</button></div>'+
 '<div class="care-card"><b>🫧 洗澡</b><small>泡泡、冲水、擦干</small><button data-care="bath">洗香香</button></div>'+
 '<div class="care-card"><b>🧸 玩一会</b><small>消耗一点精力</small><button data-care="play">陪它玩</button></div>'+
 '<div class="care-card"><b>🤍 摸摸</b><small>增加亲密度</small><button data-care="pet">摸摸</button></div><div class="care-card"><b>💬 说句话</b><small>它会回应你</small><button data-care="talk">聊天</button></div>'+
 '<div class="care-card"><b>↔ 换地方</b><small>让它去另一个区域</small><button data-care="move">'+(p.place==="home"?"去院子":"回家")+'</button></div>'+
 '<div class="care-card"><b>🍪 小零食</b><small>偶尔的额外奖励</small><button data-care="treat">给零食</button></div></div>';
 document.querySelectorAll("[data-care]").forEach(b=>b.onclick=()=>care(b.dataset.care));
}
function care(type){
 const p=state.pets[selectedPet];
 if(type==="feed"){p.h=clamp(p.h+22);p.m=clamp(p.m+2);state.coins+=3}
 if(type==="bath"){p.c=100;p.m=clamp(p.m+7);p.bond+=1;state.coins+=2}
 if(type==="play"){p.m=clamp(p.m+12);p.e=clamp(p.e-7);p.bond+=1;state.coins+=3}
 if(type==="pet"){p.m=clamp(p.m+6);p.bond+=2}
 if(type==="talk"){const words=prompt("想对 "+p.name+" 说什么？");if(words){p.m=clamp(p.m+7);p.bond+=2;$("#storyText").textContent=p.name+"：\""+words+"\"…… "+(selectedPet==="bobo"?"啵啵立刻学着重复了一遍。":"它认真看着你，像是真的听懂了。");}}
 if(type==="treat"){p.h=clamp(p.h+8);p.m=clamp(p.m+5);p.bond+=1}
 if(type==="move"){p.place=p.place==="home"?"yard":"home";p.m=clamp(p.m+3)}
 state.storyChoiceCount++;
 save();render();showCare();$("#storyText").textContent=p.name+"： "+(type==="bath"?"洗完澡舒服得打了个滚。":type==="move"?"换了个地方，开始探索新角落。":"对你的照顾做出了回应。");
}

function renderFurniture(){
 const owned=state.ownedFurniture;
 $("#designPanel").innerHTML='<div class="panel-title">家具仓库</div><div class="design-tip">先买家具，再点“编辑布置”直接在房间里拖动它。手游式布置会记住位置。</div><div class="furniture-items">'+
 furniture.map(f=>'<div class="furniture-item '+(owned.includes(f.id)?"":"locked")+'"><b>'+f.name+'</b><small>'+f.cost+' 金币</small><button data-furniture="'+f.id+'">'+(owned.includes(f.id)?"选择摆放":"购买")+'</button></div>').join("")+
 '</div><div class="furniture-canvas" id="furnitureCanvas">'+renderGhosts()+'</div>';
 document.querySelectorAll("[data-furniture]").forEach(b=>b.onclick=()=>buyOrSelectFurniture(b.dataset.furniture));
 enableFurnitureDrag();
}
function renderGhosts(){
 return state.ownedFurniture.map(id=>{const f=furniture.find(x=>x.id===id),pos=state.placements[id]||{x:50,y:55};return '<div class="furniture-ghost '+f.kind+'" data-placed="'+id+'" style="left:'+pos.x+'%;top:'+pos.y+'%" title="'+f.name+'"></div>'}).join("");
}
function buyOrSelectFurniture(id){
 const f=furniture.find(x=>x.id===id);if(!f)return;
 if(!state.ownedFurniture.includes(id)){if(state.coins<f.cost){$("#storyText").textContent="爸爸：先别急着买，这件还差 "+(f.cost-state.coins)+" 金币。";return}state.coins-=f.cost;state.ownedFurniture.push(id)}
 const pos=state.placements[id]||{x:50,y:55};state.placements[id]=pos;save();render();$("#designPanel").classList.remove("hidden");renderFurniture();
}
function enableFurnitureDrag(){
 document.querySelectorAll("[data-placed]").forEach(el=>{
  let dragging=false;
  const move=e=>{if(!dragging)return;const box=$("#furnitureCanvas").getBoundingClientRect();const x=clamp((e.clientX-box.left)/box.width*100);const y=clamp((e.clientY-box.top)/box.height*100);el.style.left=x+"%";el.style.top=y+"%";state.placements[el.dataset.placed]={x,y}};
  el.onpointerdown=e=>{dragging=true;el.setPointerCapture(e.pointerId)};
  el.onpointermove=move;
  el.onpointerup=()=>{dragging=false;save()};
 });
}

function renderWardrobe(){
 const p=state.pets[selectedPet];
 $("#wardrobePanel").innerHTML='<div class="wardrobe-head"><div class="panel-title">小衣橱</div><div class="dial"><button id="prevPet">‹</button><span class="selected-pet">'+p.name+'</span><button id="nextPet">›</button></div></div>'+
 '<div class="wardrobe-preview">'+petMarkup(selectedPet)+'</div><div class="design-tip">点两边旋钮切换动物。下面挑衣服，穿上后会留在它身上。</div>'+
 '<div class="wardrobe-items"><div class="wardrobe-item"><b>原本的样子</b><small>清爽小家伙</small><button data-outfit="none" class="'+(p.outfit==="none"?"on":"")+'">脱掉</button></div>'+
 outfits.map(o=>'<div class="wardrobe-item"><b>'+o.name+'</b><small>'+o.cost+' 金币</small><button data-outfit="'+o.id+'" class="'+(p.outfit===o.id?"on":"")+'">'+(state.ownedOutfits.includes(o.id)?"穿上":"购买")+'</button></div>').join("")+'</div>';
 $("#prevPet").onclick=()=>changeSelected(-1);$("#nextPet").onclick=()=>changeSelected(1);
 document.querySelectorAll("[data-outfit]").forEach(b=>b.onclick=()=>dress(b.dataset.outfit));
}
function changeSelected(delta){let i=petOrder.indexOf(selectedPet);selectedPet=petOrder[(i+delta+petOrder.length)%petOrder.length];renderWardrobe()}
function dress(id){
 const p=state.pets[selectedPet];
 if(id!=="none"&&!state.ownedOutfits.includes(id)){const o=outfits.find(x=>x.id===id);if(state.coins<o.cost){$("#storyText").textContent="爸爸：衣橱先记账，金币还不够。";return}state.coins-=o.cost;state.ownedOutfits.push(id)}
 p.outfit=id;save();render();$("#wardrobePanel").classList.remove("hidden");renderWardrobe();
}

const stories=[
 {id:"door",text:"你刚坐下，汪汪叼着一颗不知道哪里来的小球放到你脚边。它抬头看你。",choices:[
  ["陪它找主人",p=>{p.m+=8;p.bond+=3;return"你陪汪汪翻遍了客厅。最后发现球原来藏在沙发底下。汪汪一脸得意。"}],
  ["把球藏起来逗它",p=>{p.m+=5;p.bond+=1;return"你把球藏到身后。汪汪盯了你三秒，转身把你的拖鞋叼走了。"}],
  ["问它从哪捡来的",p=>{p.bond+=2;return"汪汪没有回答，只把脑袋歪了一下。这个秘密，它暂时不想告诉你。"}]
 ]},
 {id:"bobo",text:"啵啵突然学会了一个新词。它飞到你肩膀上，神秘兮兮地说：‘……开饭！’",choices:[
  ["马上给它一点吃的",p=>{p.h=clamp(p.h+12);p.m+=5;return"啵啵开心得扑棱了两下翅膀，然后又喊了一遍‘开饭！’。"}],
  ["教它一句新的",p=>{p.bond+=3;return"你教它说‘晚安’。啵啵认真练了半天，最后变成了‘晚……饭！’。"}],
  ["假装没听见",p=>{p.m-=2;return"啵啵沉默五秒，然后开始在你耳边重复‘开饭’。你败了。"}]
 ]}
];
function maybeStory(){
 const eligible=stories.filter(s=>!state.storySeen.includes(s.id));
 if(!eligible.length)return;
 const s=eligible[Math.floor(state.storyChoiceCount/3)%eligible.length];
 $("#storyText").textContent=s.text;$("#storyHint").textContent="你来决定接下来发生什么。";
 $("#storyChoices").innerHTML=s.choices.map((c,i)=>'<button data-story="'+s.id+'" data-choice="'+i+'">'+c[0]+'</button>').join("");
 document.querySelectorAll("[data-story]").forEach(b=>b.onclick=()=>chooseStory(b.dataset.story,+b.dataset.choice));
}
function chooseStory(id,i){
 const s=stories.find(x=>x.id===id),c=s.choices[i],p=state.pets[id==="bobo"?"bobo":"wang"];const msg=c[1](p);
 state.storySeen.push(id);state.storyChoiceCount++;save();render();$("#storyText").textContent=msg;$("#storyHint").textContent="这一次，你的选择被记住了。";
}

function render(){
 renderPlacedRoom();
 $("#day").textContent=state.day;$("#coins").textContent=state.coins;$("#level").textContent="Lv."+state.level;
 const now=new Date();$("#clockText").textContent=now.getHours()+":"+String(now.getMinutes()).padStart(2,"0");
 renderPets();renderFurniture();renderWardrobe();
 if(!$("#carePanel").classList.contains("hidden"))showCare();
 maybeStory();
}
function openPanel(id){["carePanel","designPanel","wardrobePanel"].forEach(x=>$("#"+x).classList.add("hidden"));$(id).classList.remove("hidden")}
$("#careBtn").onclick=()=>{openPanel("carePanel");showCare()};
$("#designBtn").onclick=()=>{openPanel("designPanel");editingZone=editingZone==="home"?null:"home";renderEditorOverlay();$("#designBtn").textContent=editingZone?"✓ 完成布置":"✦ 编辑布置"};
$("#wardrobeBtn").onclick=()=>openPanel("wardrobePanel");
$("#yardCareBtn").onclick=()=>{openPanel("carePanel");showCare()};
$("#yardDesignBtn").onclick=()=>{openPanel("designPanel");editingZone=editingZone==="yard"?null:"yard";renderEditorOverlay();$("#yardDesignBtn").textContent=editingZone?"✓ 完成布置":"✦ 编辑院子"};
document.querySelectorAll(".zone-btn").forEach(b=>b.onclick=()=>{document.querySelectorAll(".zone-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#homeZone").classList.toggle("hidden",b.dataset.zone!=="home");$("#yardZone").classList.toggle("hidden",b.dataset.zone!=="yard")});
$("#reset").onclick=()=>{if(confirm("真的要重新开始吗？")){state=fresh();save();render()}};

setInterval(()=>{const h=(Date.now()-state.last)/36e5;if(h>=1){Object.values(state.pets).forEach(p=>{p.h=clamp(p.h-h*.8);p.m=clamp(p.m-h*.25);p.e=clamp(p.e-h*.2);p.c=clamp(p.c-h*.45)});state.day+=1;state.level=Math.min(9,1+Math.floor(state.day/7));save();render()}},60000);
render();