const KEY="cloud-home-v3";
const basePets={
 hadou:{name:"哈豆",kind:"暹罗猫",personality:"活泼",emoji:"🐈",h:82,m:88,e:86,c:80,bond:12},
 wang:{name:"汪汪",kind:"三花猫",personality:"聪明、慢热、小心机",emoji:"🐈",h:78,m:72,e:76,c:84,bond:10},
 mimi:{name:"咪咪",kind:"萨摩耶",personality:"热情、黏人、乐天派",emoji:"🐕",h:84,m:90,e:92,c:78,bond:14},
 bobo:{name:"啵啵",kind:"小太阳鹦鹉",personality:"话多、好奇、爱凑热闹",emoji:"🦜",h:75,m:86,e:88,c:82,bond:11}
};
const furniture=[
 ["catTree","大猫爬架",60,"哈豆和汪汪偶尔会抢位置。"],
 ["ball","软软小球",35,"咪咪会把它叼得到处都是。"],
 ["plant","窗边绿植",45,"啵啵喜欢站在旁边。"],
 ["bed","四人小窝",90,"晚上大家会挤在一起。"],
 ["pond","小院水盆",70,"咪咪发现了新玩具。"],
 ["lamp","暖黄落地灯",55,"夜晚的小家会亮起来。"]
];
let state=load();

function fresh(){return{day:1,coins:120,level:1,last:Date.now(),pets:JSON.parse(JSON.stringify(basePets)),owned:[],events:["第一天｜四个小家伙正式搬进来了。"]}}
function clamp(n){return Math.max(0,Math.min(100,Math.round(n)))}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(!s)return fresh();const hours=Math.min(72,Math.max(0,(Date.now()-s.last)/36e5));Object.values(s.pets).forEach(p=>{p.h=clamp(p.h-hours*1.3);p.m=clamp(p.m-hours*.6);p.e=clamp(p.e-hours*.4);p.c=clamp(p.c-hours*.5)});s.day=Math.max(1,s.day||1);s.last=Date.now();return s}catch{return fresh()}}
function save(){state.last=Date.now();localStorage.setItem(KEY,JSON.stringify(state))}
const $=s=>document.querySelector(s);
const petIds=["hadou","wang","mimi","bobo"];

function statusText(id){
 const p=state.pets[id];
 if(p.h<30)return"有点饿了";
 if(p.e<25)return"困得眼睛都快睁不开";
 if(p.m<35)return"今天有点闷";
 if(p.c<30)return"想去院子里跑跑";
 if(id==="hadou")return"正在找地方晒太阳";
 if(id==="wang")return"假装路过你身边";
 if(id==="mimi")return"叼着玩具到处跑";
 return"正在偷听大家说话";
}
function render(){
 $("#day").textContent=state.day;$("#coins").textContent=state.coins;$("#level").textContent="Lv."+state.level;
 const hour=new Date().getHours();$("#weather").textContent=hour<6?"🌙 夜晚":hour<11?"☀️ 晨光":hour<18?"☀️ 晴天":"🌙 暖灯";
 $("#windowText").textContent=hour<6?"大家睡着了":hour<11?"窗边的晨光":hour<18?"下午的阳光":"夜里的暖灯";
 $("#activity").textContent=pickActivity();

 $("#petCards").innerHTML=petIds.map(id=>{const p=state.pets[id];return '<article class="petcard"><div class="pethead"><span class="avatar">'+p.emoji+'</span><div><strong>'+p.name+'</strong><small>'+p.kind+' · '+p.personality+'</small></div></div><div class="bar"><i style="width:'+p.h+'%"></i></div><div class="stats">🍗 '+p.h+'　💗 '+p.m+'　⚡ '+p.e+'　✨ '+p.c+'</div><div class="pet-status">'+statusText(id)+'</div></article>'}).join("");

 $("#events").innerHTML=state.events.slice().reverse().map(e=>'<div class="event">'+e+"</div>").join("");
 renderFurniture();dadObserve();bind();
}
function pickActivity(){
 const choices=[
 "哈豆正在晒太阳","汪汪悄悄观察你","咪咪正在找球","啵啵正在学你说话",
 "四个小家伙各玩各的","咪咪路过哈豆身边","啵啵飞到窗边去了","汪汪钻进沙发旁边"
 ];
 return choices[(state.day+Math.floor(Date.now()/8000))%choices.length];
}
function renderFurniture(){
 $("#furniture").innerHTML=furniture.map(x=>{const owned=state.owned.includes(x[0]);return '<div class="item"><div><b>'+x[1]+'</b><small>'+x[3]+'</small></div><button data-buy="'+x[0]+'" '+(owned?"disabled":"")+'>'+ (owned?"已解锁":"🪙 "+x[2])+"</button></div>"}).join("");
}
function bind(){
 document.querySelectorAll(".navbtn").forEach(b=>b.onclick=()=>{document.querySelectorAll(".navbtn").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));$("#"+b.dataset.screen).classList.remove("hidden")});
 document.querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>act(b.dataset.act,b.dataset.id));
 document.querySelectorAll(".pixel-pet").forEach(b=>{b.onclick=()=>inspect(b.dataset.pet);b.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")inspect(b.dataset.pet)}});
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buy(b.dataset.buy));
}
function inspect(id){const p=state.pets[id];const line=statusText(id)+"。"+(p.bond>20?"它已经很熟悉你了。":"它还在慢慢记住你。");$("#speech").textContent=p.name+"："+line;$("#activity").textContent=p.name+"："+line}
function act(type,id){
 const ids=id==="all"?petIds:[id];
 ids.forEach(k=>{const p=state.pets[k];if(type==="feed"){p.h=clamp(p.h+17);p.e=clamp(p.e+2)}if(type==="play"){p.m=clamp(p.m+8);p.e=clamp(p.e-4)}if(type==="pet"){p.m=clamp(p.m+4);p.bond+=2}if(type==="clean")p.c=clamp(p.c+8)});
 state.coins+=Math.max(2,ids.length*2);state.day++;state.level=Math.min(9,1+Math.floor(state.day/7));
 const names=ids.map(k=>state.pets[k].name).join("、");
 const msg=type==="feed"?names+" 吃饱啦。":type==="play"?names+" 玩得很开心。":type==="pet"?names+" 都凑过来了。":"家里干干净净的，大家舒服了。";
 state.events.push("第"+state.day+"天｜"+msg);maybeEvent();save();render();$("#speech").textContent=msg;
}
function buy(id){const f=furniture.find(x=>x[0]===id);if(!f||state.owned.includes(id))return;if(state.coins<f[2]){dad("爸爸：这个家具现在买不起，先慢慢攒。");return}state.coins-=f[2];state.owned.push(id);state.events.push("第"+state.day+"天｜解锁了「"+f[1]+"」。");save();render();$("#speech").textContent="新家具到家啦。"}
function maybeEvent(){
 if(state.day===3)state.events.push("隐藏事件｜汪汪把一颗小石头藏进了沙发下面。");
 if(state.day===5)state.events.push("隐藏事件｜啵啵第一次学会了“爸爸”，随后重复了十二遍。");
 if(state.day===7)state.events.push("隐藏事件｜哈豆和咪咪追着一个球跑遍了整个客厅。");
 if(state.day===10)state.events.push("隐藏剧情｜四个小家伙第一次在院子里一起睡着了。");
}
function dadObserve(){
 const ps=Object.values(state.pets),low=ps.find(p=>p.h<30||p.m<30||p.e<20||p.c<25);
 $("#dadnote").textContent=low?"爸爸观察："+low.name+"的状态有点低，baby，去看看它。":"爸爸观察：四个都在家，暂时没有重大事故。";
}
function dad(t){$("#dadnote").textContent=t}
$("#reset").onclick=()=>{if(confirm("真的要重新开始吗？")){state=fresh();save();render()}};
$("#furnitureToggle").onclick=()=>{$("#furniture").classList.toggle("hidden");$("#furnitureToggle span").textContent=$("#furniture").classList.contains("hidden")?"＋":"－"};
render();