import { useState, useEffect, useRef } from "react";

const RED = "#B31B1B";
const GOLD = "#C9A84C";
const CREAM = "#FAF7F2";
const DARK = "#1A1A1A";
const GRAY = "#6B6B6B";
const DIMS = ["S","T","D","R","A","C"];
const BASE = {S:50,T:50,D:50,R:50,A:50,C:50};

const QS = [
  {zh:"期末周，三个DDL撞在一起，你的第一反应是？",
   en:"Finals week — three deadlines collide. First move?",
   opts:[
    {zh:"打开计划表，精确排到小时",en:"Open the planner, schedule it down to the hour",d:{S:0,T:12,D:8,R:0,A:0,C:5}},
    {zh:"拉朋友去Olin camp out，互相监督顺便吐槽",en:"Drag friends to Olin — study together, vent together",d:{S:12,T:-5,D:8,R:0,A:0,C:0}},
    {zh:"先睡一觉，醒来再说",en:"Sleep first, deal with it later",d:{S:0,T:-10,D:-12,R:5,A:0,C:-5}},
    {zh:"突然开始思考：我到底为什么要选这个专业",en:"Suddenly wonder why you even picked this major",d:{S:-5,T:-5,D:-8,R:15,A:5,C:-5}},
  ]},
  {zh:"被朋友拉去参加一个活动，你的状态是？",
   en:"A friend drags you to a campus event. You:",
   opts:[
    {zh:"主动帮忙组织，甚至接管了流程",en:"Start organizing things — basically take over",d:{S:5,T:8,D:10,R:0,A:0,C:8}},
    {zh:"到场社交，多好的认识新朋友的机会",en:"Work the room — perfect chance to meet people",d:{S:15,T:0,D:0,R:-5,A:0,C:5}},
    {zh:"犹豫了一下去了，但全程想早点走",en:"Went, but mentally leaving the whole time",d:{S:-8,T:0,D:-5,R:8,A:0,C:-5}},
    {zh:"一边参与一边观察人类行为",en:"Participate while quietly observing human behavior",d:{S:-5,T:0,D:0,R:15,A:0,C:0}},
  ]},
  {zh:"你对coffee chat的真实想法是？",
   en:"Your honest take on coffee chats?",
   opts:[
    {zh:"明确目标，提前准备好问题，效率第一",en:"Clear goal, prep questions in advance — efficiency first",d:{S:0,T:8,D:8,R:-5,A:0,C:15}},
    {zh:"跟不同的人聊天本身就很开心",en:"Just love talking to all kinds of people",d:{S:12,T:0,D:0,R:-5,A:0,C:5}},
    {zh:"能不去就不去",en:"Would avoid it if I could",d:{S:-8,T:-5,D:-5,R:5,A:0,C:-12}},
    {zh:"聊着聊着开始想人与人关系的本质",en:"End up pondering the nature of human connection",d:{S:0,T:0,D:-8,R:15,A:0,C:-8}},
  ]},
  {zh:"Ctown有个party，但你本来打算今晚学习，你会？",
   en:"Ctown party tonight, but you planned to study. You:",
   opts:[
    {zh:"拒绝，打乱节奏不值得",en:"Decline — breaking the rhythm isn't worth it",d:{S:-8,T:12,D:10,R:0,A:0,C:0}},
    {zh:"去，但给自己设了回来的时间",en:"Go, but set a hard return time",d:{S:8,T:8,D:5,R:0,A:0,C:5}},
    {zh:"直接去，学习可以明天再说",en:"Just go — studying can wait",d:{S:10,T:-10,D:-8,R:0,A:0,C:-5}},
    {zh:"去了但一直想着自己本来该干嘛",en:"Go but spend the night thinking about what you should be doing",d:{S:-5,T:-5,D:0,R:12,A:0,C:0}},
  ]},
  {zh:"Pre-enrollment前，你把课表改到第三版了，这时候你：",
   en:"You're on your third draft of next semester's schedule. You:",
   opts:[
    {zh:"时间块全部规划好，还留了buffer",en:"Time blocks fully mapped, buffer built in",d:{S:0,T:15,D:8,R:0,A:0,C:5}},
    {zh:"课和社交都安排得很满，这学期会很精彩",en:"Packed with classes and events — going to be a great semester",d:{S:10,T:8,D:5,R:-5,A:0,C:8}},
    {zh:"先这样吧，开学再看情况",en:"Good enough — figure it out when school starts",d:{S:0,T:-12,D:-5,R:5,A:0,C:-5}},
    {zh:"看着课表突然想：这真的是我想学的吗",en:"Stare at it and wonder: is this actually what I want to study",d:{S:-5,T:-5,D:-5,R:12,A:8,C:-5}},
  ]},
  {zh:"春暖花开，你从宿舍走去上课，你的状态是？",
   en:"Spring has arrived. Walking to class from your dorm:",
   opts:[
    {zh:"感慨今天光线很好，樱花开了，校园终于美丽了起来",en:"Notice the light, the cherry blossoms — campus is finally beautiful again",d:{S:0,T:-5,D:0,R:5,A:15,C:-5}},
    {zh:"戴耳机听podcast，充实通勤时间",en:"Earbuds in, podcast on — making the commute count",d:{S:-8,T:5,D:8,R:0,A:-5,C:10}},
    {zh:"上课？早课翘了，在宿舍睡觉",en:"Class? Skipped the early one. Still in bed.",d:{S:0,T:-12,D:-10,R:5,A:0,C:-8}},
    {zh:"在脑子里过今天的几个ddl",en:"Running today's deadlines through your head",d:{S:0,T:10,D:12,R:0,A:0,C:8}},
  ]},
  {zh:"你手机里关注最多的内容是？",
   en:"What do you consume most on your phone?",
   opts:[
    {zh:"朋友动态和campus的各种活动",en:"Friends' updates and campus events",d:{S:12,T:0,D:0,R:-5,A:8,C:-5}},
    {zh:"行业资讯、LinkedIn、大佬的newsletter",en:"Industry news, LinkedIn, newsletters from people you admire",d:{S:0,T:5,D:10,R:0,A:-5,C:15}},
    {zh:"哲学、文学、小众播客",en:"Philosophy, literature, obscure podcasts",d:{S:-8,T:0,D:-5,R:12,A:5,C:-10}},
    {zh:"健身、跑步、自律类博主",en:"Fitness, running, productivity creators",d:{S:-5,T:8,D:10,R:0,A:0,C:5}},
  ]},
  {zh:"大四最后一学期，你最想做的一件事是？",
   en:"Last semester of senior year. The one thing you most want to do?",
   opts:[
    {zh:"把没去过的地方都走一遍，把故事都留住",en:"Walk every corner you haven't been — hold onto every story",d:{S:0,T:0,D:0,R:8,A:15,C:-8}},
    {zh:"把简历和portfolio打磨到最好",en:"Polish your resume and portfolio to perfection",d:{S:0,T:8,D:12,R:-5,A:-5,C:15}},
    {zh:"认识更多人，维护好要带走的关系网",en:"Meet more people and keep the network you're taking with you",d:{S:12,T:0,D:5,R:-5,A:0,C:10}},
    {zh:"把一直想写但没写的东西写出来",en:"Finally write the thing you've been meaning to write",d:{S:-8,T:-5,D:0,R:15,A:8,C:-8}},
  ]},
  {zh:"早上七点半，你的状态是？",
   en:"7:30am on a Tuesday. Where are you at?",
   opts:[
    {zh:"已经跑完步回来，在吃早饭",en:"Back from a run, eating breakfast",d:{S:-8,T:15,D:10,R:0,A:0,C:5}},
    {zh:"刚睁眼，先看昨晚有没有消息没回",en:"Just woke up, checking missed messages first",d:{S:12,T:-5,D:0,R:0,A:0,C:0}},
    {zh:"还在睡，七点半根本不存在",en:"Still asleep. 7:30am doesn't exist.",d:{S:-5,T:-12,D:-8,R:5,A:0,C:-5}},
    {zh:"起来了，发呆，慢慢看窗外",en:"Up, but just staring out the window",d:{S:-8,T:-8,D:-5,R:12,A:8,C:-5}},
  ]},
  {zh:"毕业两年后，你和Cornell重新产生联结，你会怎么做？",
   en:"Two years after graduation, you reconnect with Cornell. How?",
   opts:[
    {zh:"回到Ithaca，重走一遍当年每天走的路",en:"Return to Ithaca and retrace your old routes",d:{S:-5,T:0,D:0,R:8,A:15,C:-8}},
    {zh:"参加校友活动，认识现在的在校生和其他校友",en:"Attend alumni events, meet current students and fellow grads",d:{S:8,T:5,D:8,R:-5,A:0,C:15}},
    {zh:"找老朋友，约在熟悉的地方坐一下午",en:"Meet up with old friends somewhere familiar",d:{S:12,T:-5,D:0,R:0,A:8,C:-5}},
    {zh:"不会特地回Ithaca，但会约Cornell人在NYC/SF聚",en:"Skip Ithaca — but organize a Cornell meetup in NYC or SF",d:{S:10,T:5,D:8,R:-8,A:-12,C:10}},
  ]},
];

const AS = [
  {id:"mcgraw",emoji:"🔔",
   zn:"McGraw钟楼守望者",en:"McGraw Bell Tower Keeper",
   zt:"情怀派",et:"Heritage Type",
   coords:{S:40,T:40,D:50,R:65,A:95,C:20},
   ztl:"Ithaca的每一个角落都欠你一个故事",
   etl:"Every corner of Ithaca owes you a story",
   zd:"你和Cornell之间有一种别人理解不了的双向奔赴。四年后离开的时候，你会是最后一个回头看的人。",
   ed:"You and Cornell share a bond others simply can't understand. When it's time to leave, you'll be the last one to look back.",
   zpw:"随时说出校园任意角落的历史",epw:"Can recall campus history on demand",
   zbl:"有时爱这个地方多过爱自己的计划",ebl:"Sometimes loves the place more than the plan",
   zco:"Ithaca Fall沉思者",eco:"Ithaca Fall Daydreamer",
   zsp:"Arts Quad，下雪的早上",esp:"Arts Quad on a snowy morning"},
  {id:"olin",emoji:"📚",
   zn:"Olin凌晨三点常客",en:"Olin 3AM Regular",
   zt:"卷王型",et:"Crunch Mode",
   coords:{S:15,T:30,D:95,R:50,A:40,C:55},
   ztl:"DDL是最好的deadline，因为它真的是最后一条线",
   etl:"The deadline is the best deadline — because it really is the last one",
   zd:"你不是拖延，你是在等状态。问题是状态总在凌晨两点才来，但来了之后锐不可当。",
   ed:"You're not procrastinating — you're waiting for flow state. It always arrives at 2am. But when it does, nothing can stop you.",
   zpw:"8小时内完成别人需要两周的事",epw:"Does in 8 hrs what others need two weeks for",
   zbl:"总觉得下次会提前开始",ebl:"Always thinks next time will be different",
   zco:"Libe Café社交达人",eco:"Libe Café Social Butterfly",
   zsp:"Olin三楼，窗边那个位置",esp:"Olin 3rd floor, the window seat"},
  {id:"libe",emoji:"☕",
   zn:"Libe Café社交达人",en:"Libe Café Social Butterfly",
   zt:"社牛型",et:"Social Architect",
   coords:{S:95,T:35,D:50,R:15,A:65,C:55},
   ztl:"你不是在社交，你是在运营一张活地图",
   etl:"You're not socializing — you're running a living map",
   zd:"走进任何一个房间，你都能在三分钟内找到认识的人。你的人脉不是积累出来的，是自然生长的。",
   ed:"Walk into any room and you'll find someone you know within three minutes. Your network doesn't get built — it just grows.",
   zpw:"永远知道谁认识谁",epw:"Always knows who knows who",
   zbl:"独处时不太知道自己要干嘛",ebl:"Not quite sure what to do when alone",
   zco:"Willard Straight活动家",eco:"Willard Straight Activist",
   zsp:"Libe Café，正午的那张长桌",esp:"Libe Café, the long table at noon"},
  {id:"slope",emoji:"🌿",
   zn:"Libe Slope哲学家",en:"Libe Slope Philosopher",
   zt:"佛系型",et:"Equilibrium Type",
   coords:{S:30,T:10,D:10,R:80,A:60,C:15},
   ztl:"GPA只是一个数字，日落才是硬通货",
   etl:"GPA is just a number. Sunsets are the real currency.",
   zd:"你不是不在乎，你只是看得更远。当别人在算绩点的时候，你已经在想毕业后的事了——或者什么都没在想，就是觉得现在挺好的。",
   ed:"You're not indifferent — you just see further. While others count GPAs, you're already thinking past graduation. Or thinking nothing at all, which is also fine.",
   zpw:"任何压力下都能保持真实的平静",epw:"Stays genuinely calm under any pressure",
   zbl:"有时候"看开了"其实是还没开始",ebl:"Sometimes 'acceptance' is just avoidance",
   zco:"Ithaca Fall沉思者",eco:"Ithaca Fall Daydreamer",
   zsp:"Slope顶端，下午四点的光",esp:"Top of the Slope at 4pm"},
  {id:"beebe",emoji:"🏃",
   zn:"Beebe Lake晨跑者",en:"Beebe Lake Morning Runner",
   zt:"自律型",et:"6AM Protocol",
   coords:{S:20,T:95,D:85,R:30,A:45,C:50},
   ztl:"你6点的闹钟是别人的人生警告",
   etl:"Your 6am alarm is everyone else's existential crisis",
   zd:"你的自律不是表演给别人看的，它就是你运转的方式。让周围人又羡慕又有点害怕，这件事你已经习惯了。",
   ed:"Your discipline isn't a performance — it's just how you operate. The fact that people are both envious and slightly afraid of you? You're used to it.",
   zpw:"把'我要改变'变成明天早上六点",epw:"Turns 'I should change' into 6am tomorrow",
   zbl:"偶尔忘了给自己留一点弹性",ebl:"Occasionally forgets to leave room for spontaneity",
   zco:"Willard Straight活动家",eco:"Willard Straight Activist",
   zsp:"Beebe Lake，太阳刚出来的时候",esp:"Beebe Lake just after sunrise"},
  {id:"willard",emoji:"🎭",
   zn:"Willard Straight活动家",en:"Willard Straight Activist",
   zt:"参与型",et:"Full Stack Human",
   coords:{S:80,T:85,D:80,R:20,A:60,C:70},
   ztl:"你的Google Calendar是一件艺术品",
   etl:"Your Google Calendar is a work of art",
   zd:"五个club、三个项目、两个你忘了退出的群聊。你不是闲不住，你只是真的相信每件事都值得去做。",
   ed:"Five clubs, three projects, two group chats you forgot to leave. You're not restless — you genuinely believe every single thing is worth doing.",
   zpw:"让任何活动都感觉有人在掌控全局",epw:"Makes every event feel like someone's in charge",
   zbl:"答应太多，但你每次都会做到",ebl:"Overcommits — but somehow always delivers",
   zco:"Sage Hall Coffee Chat达人",eco:"Sage Hall Networker",
   zsp:"Willard Straight大厅，布置活动现场时",esp:"Willard Straight lobby, mid-setup"},
  {id:"ithaca",emoji:"🍂",
   zn:"Ithaca Fall沉思者",en:"Ithaca Fall Daydreamer",
   zt:"文艺型",et:"Inner Monologue Type",
   coords:{S:10,T:20,D:30,R:90,A:65,C:25},
   ztl:"你脑子里住着一部还没写完的小说",
   etl:"There's an unfinished novel living in your head",
   zd:"你的想法比说出口的多十倍。不是不想分享，只是有些东西说出来就变味了，放在心里反而更完整。",
   ed:"You have ten times more thoughts than you ever say out loud. Not because you won't share — some things just work better unspoken.",
   zpw:"在别人看不见的地方发现意义",epw:"Finds meaning where others don't look",
   zbl:"有时候想太多反而没有行动",ebl:"Sometimes overthinks instead of acts",
   zco:"McGraw钟楼守望者",eco:"McGraw Bell Tower Keeper",
   zsp:"Gorge边，秋天落叶最厚的那段路",esp:"The gorge path buried in autumn leaves"},
  {id:"sage",emoji:"💼",
   zn:"Sage Hall Coffee Chat达人",en:"Sage Hall Networker",
   zt:"布局型",et:"Network Architect",
   coords:{S:75,T:70,D:80,R:25,A:35,C:95},
   ztl:"每一次对话都是一次有效投资",
   etl:"Every conversation is a worthwhile investment",
   zd:"你把networking这件事做得不像networking。你真的对人感兴趣——只是你也很清楚，好的关系和好的机会从来不是分开的。",
   ed:"You make networking not feel like networking. You're genuinely curious about people — and you know that good relationships and good opportunities were never really separate.",
   zpw:"把陌生人变成五年后的重要联系人",epw:"Turns strangers into key contacts five years later",
   zbl:"偶尔忘了有些对话可以没有目的",ebl:"Occasionally forgets some conversations need no agenda",
   zco:"Libe Café社交达人",eco:"Libe Café Social Butterfly",
   zsp:"Sage Hall一楼，随便哪张咖啡桌",esp:"Any coffee table in Sage Hall"},
];

function calcScores(answers) {
  const s = {...BASE};
  answers.forEach(({qi,oi}) => {
    const d = QS[qi].opts[oi].d;
    DIMS.forEach(k => { s[k] = Math.max(0, Math.min(100, s[k]+(d[k]||0))); });
  });
  return s;
}

function matchArchetype(scores) {
  const ranked = [...AS]
    .map(a => ({...a, dist: Math.sqrt(DIMS.reduce((sum,k) => sum+Math.pow(scores[k]-a.coords[k],2),0))}))
    .sort((a,b) => a.dist-b.dist);
  const maxD = Math.sqrt(DIMS.length*10000);
  return {primary:ranked[0], secondary:ranked[1], sim:Math.round((1-ranked[1].dist/maxD)*100)};
}

function Barcode({seed}) {
  const bars = [];
  let x = 0;
  const c = (seed||"abc").split("").map(ch => ch.charCodeAt(0));
  for(let i=0;i<42;i++) {
    const w = (c[i%c.length]*3+i*7)%3+1;
    const black = (c[i%c.length]+i*13)%4 !== 0;
    if(black) bars.push(<rect key={i} x={x} y={0} width={w} height={22} fill={DARK}/>);
    x += w+1;
  }
  return <svg width={x} height={22} style={{display:"block"}}>{bars}</svg>;
}

const LOADING_MSGS = {
  zh:["分析你的Cornell灵魂中…","检索Olin签到记录…","测量你和Slope的距离…","比对Arts Quad情感指数…"],
  en:["Analyzing your Cornell soul…","Checking Olin sign-in logs…","Measuring your Slope energy…","Cross-referencing Arts Quad vibes…"],
};

export default function CornellQuiz() {
  const [lang, setLang] = useState("zh");
  const [step, setStep] = useState("cover");
  const [name, setName] = useState("");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sel, setSel] = useState(null);
  const [result, setResult] = useState(null);
  const [lmsg, setLmsg] = useState(0);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef(null);
  const L = lang;
  const T = (zh,en) => L==="zh"?zh:en;

  useEffect(()=>{
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    document.head.appendChild(s);
  },[]);

  useEffect(()=>{
    if(step!=="loading") return;
    let i=0;
    const iv=setInterval(()=>{ i=(i+1)%4; setLmsg(i); },750);
    const to=setTimeout(()=>{
      clearInterval(iv);
      setResult(matchArchetype(calcScores(answers)));
      setStep("result");
    },3000);
    return ()=>{ clearInterval(iv); clearTimeout(to); };
  },[step,answers]);

  const handleNext = () => {
    if(sel===null) return;
    const na=[...answers,{qi,oi:sel}];
    setAnswers(na);
    if(qi<QS.length-1){ setQi(qi+1); setSel(null); }
    else setStep("loading");
  };

  const restart=()=>{ setStep("cover"); setQi(0); setAnswers([]); setSel(null); setResult(null); setName(""); };

  const saveCard=async()=>{
    if(!cardRef.current||!window.html2canvas||saving) return;
    setSaving(true);
    try {
      const canvas=await window.html2canvas(cardRef.current,{scale:3,backgroundColor:CREAM,useCORS:true,logging:false});
      const a=document.createElement("a");
      a.download="cornell-quiz-card.png";
      a.href=canvas.toDataURL("image/png");
      a.click();
    } catch(e){console.error(e);}
    setSaving(false);
  };

  const mono = {fontFamily:"'Courier New',monospace"};
  const serif = {fontFamily:"Georgia,serif"};
  const sans = {fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif"};

  const LangBtn = () => (
    <button onClick={()=>setLang(l=>l==="zh"?"en":"zh")} style={{
      position:"absolute",top:14,right:16,
      background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",
      color:"#fff",borderRadius:4,padding:"3px 9px",
      fontSize:11,...mono,cursor:"pointer",letterSpacing:"0.06em",zIndex:10,
      WebkitTapHighlightColor:"transparent",
    }}>{L==="zh"?"EN":"中文"}</button>
  );

  const Footer = () => (
    <div style={{textAlign:"center",padding:"18px 0 max(18px,env(safe-area-inset-bottom))",fontSize:10,color:GRAY,...mono,letterSpacing:"0.1em"}}>
      MADE BY CORNELL CSSA
    </div>
  );

  // ── COVER ──────────────────────────────────────────────────────
  if(step==="cover") return (
    <div style={{minHeight:"100dvh",background:CREAM,display:"flex",flexDirection:"column",WebkitFontSmoothing:"antialiased"}}>
      <style>{`*{-webkit-tap-highlight-color:transparent;touch-action:manipulation;box-sizing:border-box}`}</style>
      <div style={{background:RED,padding:"52px 24px 28px",position:"relative"}}>
        <LangBtn/>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:9,letterSpacing:"0.22em",...mono,margin:"0 0 12px"}}>CORNELL UNIVERSITY</p>
        <h1 style={{color:"#fff",fontSize:27,...serif,fontWeight:400,margin:"0 0 10px",lineHeight:1.25}}>
          {T("你是哪种Cornell人？","Which Cornell\nType Are You?")}
        </h1>
        <p style={{color:"rgba(255,255,255,0.65)",fontSize:12,margin:0,...sans,lineHeight:1.5}}>
          {T("10题 · 8种人格 · 一张属于你的Cornell卡","10 questions · 8 archetypes · your card")}
        </p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"20px 20px 0"}}>
        {AS.map(a=>(
          <div key={a.id} style={{background:"#fff",border:"0.5px solid rgba(0,0,0,0.07)",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:22}}>{a.emoji}</div>
            <div style={{fontSize:9,color:GRAY,marginTop:4,lineHeight:1.3,...sans}}>{L==="zh"?a.zt:a.et}</div>
          </div>
        ))}
      </div>

      <div style={{flex:1,padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{display:"block",fontSize:10,color:GRAY,...mono,letterSpacing:"0.12em",marginBottom:8}}>
            {T("你叫什么名字？","YOUR NAME")}
          </label>
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&name.trim()&&setStep("quiz")}
            placeholder={T("输入你的名字…","First name…")}
            autoComplete="off"
            style={{
              width:"100%",padding:"13px 14px",fontSize:16,
              border:`1.5px solid ${name.trim()?RED:"rgba(0,0,0,0.12)"}`,
              borderRadius:8,background:"#fff",...serif,
              outline:"none",color:DARK,transition:"border-color 0.2s",
            }}
          />
        </div>
        <button
          onClick={()=>name.trim()&&setStep("quiz")}
          style={{
            padding:"14px",background:name.trim()?RED:"#ccc",color:"#fff",
            border:"none",borderRadius:8,fontSize:15,...sans,fontWeight:500,
            cursor:name.trim()?"pointer":"default",
            letterSpacing:"0.04em",transition:"background 0.2s",
          }}
        >{T("开始测试 →","Start the Quiz →")}</button>
      </div>
      <Footer/>
    </div>
  );

  // ── QUIZ ───────────────────────────────────────────────────────
  if(step==="quiz") {
    const q = QS[qi];
    const pct = (qi/QS.length)*100;
    return (
      <div style={{minHeight:"100dvh",background:CREAM,display:"flex",flexDirection:"column",WebkitFontSmoothing:"antialiased"}}>
        <style>{`*{-webkit-tap-highlight-color:transparent;touch-action:manipulation;box-sizing:border-box}`}</style>
        <div style={{background:RED,padding:"16px 20px 14px",position:"relative"}}>
          <LangBtn/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{color:"rgba(255,255,255,0.6)",fontSize:10,...mono,letterSpacing:"0.12em"}}>
              {T("题目","Q")} {qi+1} / {QS.length}
            </span>
            <span style={{color:"rgba(255,255,255,0.4)",fontSize:9,...mono,letterSpacing:"0.08em"}}>
              {name.toUpperCase()}
            </span>
          </div>
          <div style={{height:2,background:"rgba(255,255,255,0.18)",borderRadius:1,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"#fff",transition:"width 0.4s ease"}}/>
          </div>
        </div>

        <div style={{padding:"24px 20px 14px"}}>
          <p style={{fontSize:18,...serif,color:DARK,lineHeight:1.5,margin:0}}>
            {L==="zh"?q.zh:q.en}
          </p>
        </div>

        <div style={{padding:"0 20px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
          {q.opts.map((o,i)=>(
            <button key={i} onClick={()=>setSel(i)} style={{
              textAlign:"left",padding:"13px 15px",
              background:sel===i?"#fff":"transparent",
              border:`${sel===i?1.5:1}px solid ${sel===i?RED:"rgba(0,0,0,0.1)"}`,
              borderRadius:10,fontSize:14,...sans,
              color:sel===i?DARK:"#4a4a4a",cursor:"pointer",lineHeight:1.5,
              transition:"all 0.15s",
            }}>
              <span style={{color:RED,...mono,fontSize:10,marginRight:8,fontWeight:"bold"}}>
                {String.fromCharCode(65+i)}.
              </span>
              {L==="zh"?o.zh:o.en}
            </button>
          ))}
        </div>

        <div style={{padding:"16px 20px",paddingBottom:"max(16px,env(safe-area-inset-bottom))"}}>
          <button onClick={handleNext} disabled={sel===null} style={{
            width:"100%",padding:"14px",
            background:sel!==null?RED:"#ccc",color:"#fff",
            border:"none",borderRadius:8,fontSize:15,...sans,
            fontWeight:500,cursor:sel!==null?"pointer":"default",
            letterSpacing:"0.04em",transition:"background 0.2s",
          }}>
            {qi===QS.length-1?T("查看结果 →","See My Result →"):T("下一题 →","Next →")}
          </button>
        </div>
      </div>
    );
  }

  // ── LOADING ────────────────────────────────────────────────────
  if(step==="loading") return (
    <div style={{minHeight:"100dvh",background:RED,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:34,height:34,border:"2px solid rgba(255,255,255,0.2)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.85s linear infinite"}}/>
      <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,...mono,letterSpacing:"0.1em",textAlign:"center",margin:0,padding:"0 48px"}}>
        {LOADING_MSGS[L][lmsg]}
      </p>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────────
  if(step==="result"&&result) {
    const {primary:p, secondary:sec, sim} = result;
    return (
      <div style={{minHeight:"100dvh",background:"#EDEBE6",display:"flex",flexDirection:"column",WebkitFontSmoothing:"antialiased"}}>
        <style>{`*{-webkit-tap-highlight-color:transparent;touch-action:manipulation;box-sizing:border-box}`}</style>

        <div style={{background:RED,padding:"14px 20px",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <LangBtn/>
          <span style={{color:"rgba(255,255,255,0.65)",fontSize:9,...mono,letterSpacing:"0.2em"}}>
            {T("你的Cornell人格卡","YOUR CORNELL CARD")}
          </span>
        </div>

        {/* Card */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 16px 0"}}>
          <div ref={cardRef} style={{
            background:CREAM,
            borderRadius:16,overflow:"hidden",
            border:"1px solid rgba(0,0,0,0.07)",
            boxShadow:"0 4px 28px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
          }}>
            {/* Card header */}
            <div style={{background:RED,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <p style={{color:"rgba(255,255,255,0.5)",fontSize:8,letterSpacing:"0.22em",...mono,margin:"0 0 2px"}}>CORNELL UNIVERSITY</p>
                <p style={{color:"rgba(255,255,255,0.7)",fontSize:8,letterSpacing:"0.12em",...mono,margin:0}}>PERSONALITY CARD · CORNELL QUIZ</p>
              </div>
              <div style={{
                width:28,height:28,borderRadius:4,
                background:"rgba(255,255,255,0.12)",
                border:"0.5px solid rgba(255,255,255,0.2)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:16,
              }}>{p.emoji}</div>
            </div>

            {/* Hero */}
            <div style={{padding:"22px 18px 0",textAlign:"center"}}>
              <div style={{fontSize:52,lineHeight:1,marginBottom:14}}>{p.emoji}</div>
              <h2 style={{fontSize:21,...serif,fontWeight:400,color:DARK,margin:"0 0 7px",lineHeight:1.2}}>
                {L==="zh"?p.zn:p.en}
              </h2>
              <p style={{fontSize:12,color:GRAY,fontStyle:"italic",...serif,margin:0,padding:"0 8px",lineHeight:1.55}}>
                "{L==="zh"?p.ztl:p.etl}"
              </p>
            </div>

            {/* Divider */}
            <div style={{margin:"16px 18px 0",borderTop:`1px dashed ${GOLD}`}}/>

            {/* ID fields */}
            <div style={{padding:"12px 18px"}}>
              {[
                [T("NAME","NAME"), name||"—"],
                [T("TYPE","TYPE"), L==="zh"?p.zt:p.et],
                [T("SOUL","SOUL"), L==="zh"?p.zsp:p.esp],
                [T("MATCH","MATCH"), L==="zh"?p.zco:p.eco],
              ].map(([label,val])=>(
                <div key={label} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
                  <span style={{fontSize:9,color:GOLD,...mono,letterSpacing:"0.12em",minWidth:42,paddingTop:1}}>{label}</span>
                  <span style={{fontSize:9,color:"rgba(0,0,0,0.18)",...mono,paddingTop:1}}>/</span>
                  <span style={{fontSize:12,color:DARK,...mono,lineHeight:1.4,flex:1}}>{val}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{margin:"0 18px",borderTop:`1px dashed ${GOLD}`}}/>

            {/* Description */}
            <div style={{padding:"12px 18px"}}>
              <p style={{fontSize:13,color:DARK,lineHeight:1.75,...serif,margin:0}}>
                {L==="zh"?p.zd:p.ed}
              </p>
            </div>

            {/* Divider */}
            <div style={{margin:"0 18px",borderTop:`1px dashed ${GOLD}`}}/>

            {/* Power + Blind spot */}
            <div style={{padding:"10px 18px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                [T("超能力","POWER"), L==="zh"?p.zpw:p.epw],
                [T("盲区","BLIND SPOT"), L==="zh"?p.zbl:p.ebl],
              ].map(([label,val])=>(
                <div key={label} style={{background:"#fff",border:"0.5px solid rgba(0,0,0,0.07)",borderRadius:7,padding:"8px 9px"}}>
                  <p style={{fontSize:8,color:GOLD,...mono,letterSpacing:"0.1em",margin:"0 0 4px"}}>{label}</p>
                  <p style={{fontSize:11,color:DARK,...mono,margin:0,lineHeight:1.45}}>{val}</p>
                </div>
              ))}
            </div>

            {/* Secondary */}
            <div style={{margin:"0 18px 12px",background:"#fff",border:"0.5px solid rgba(0,0,0,0.07)",borderRadius:7,padding:"8px 9px"}}>
              <p style={{fontSize:8,color:GRAY,...mono,letterSpacing:"0.1em",margin:"0 0 4px"}}>
                {T("副人格倾向","SECONDARY TYPE")}
              </p>
              <p style={{fontSize:11,color:DARK,...mono,margin:0}}>
                {sec.emoji} {L==="zh"?sec.zn:sec.en} · {sim}%
              </p>
            </div>

            {/* Barcode */}
            <div style={{margin:"0 18px",borderTop:"0.5px solid rgba(0,0,0,0.06)",padding:"10px 0 6px"}}>
              <Barcode seed={p.id}/>
              <p style={{fontSize:8,color:"rgba(0,0,0,0.22)",...mono,letterSpacing:"0.06em",margin:"5px 0 0"}}>
                {p.id.toUpperCase()} · CORNELL QUIZ · CLASS OF 2028
              </p>
            </div>

            {/* Card footer */}
            <div style={{background:RED,padding:"8px 18px",textAlign:"center"}}>
              <p style={{color:"rgba(255,255,255,0.55)",fontSize:8,...mono,letterSpacing:"0.16em",margin:0}}>
                MADE BY CORNELL CSSA
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{padding:"14px 16px",paddingBottom:"max(14px,env(safe-area-inset-bottom))",display:"flex",gap:10}}>
          <button onClick={restart} style={{
            flex:1,padding:"13px",background:"transparent",
            border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,
            fontSize:14,...sans,color:GRAY,cursor:"pointer",
          }}>{T("再测一次","Retake")}</button>
          <button onClick={saveCard} style={{
            flex:2,padding:"13px",
            background:saving?"#8a1010":RED,
            border:"none",borderRadius:8,fontSize:14,...sans,
            color:"#fff",fontWeight:500,cursor:"pointer",
            letterSpacing:"0.04em",transition:"background 0.2s",
          }}>
            {saving?T("保存中…","Saving…"):T("保存卡片","Save Card")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
