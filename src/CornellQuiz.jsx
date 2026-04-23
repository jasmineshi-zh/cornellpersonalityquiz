import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

const RED    = "#B31B1B";
const WARM   = "#FFF8E7";
const DARK   = "#1A1A1A";
const GRAY   = "#6B6B6B";
const YELLOW = "#FFD93D";
const GREEN  = "#6BCB77";
const PINK   = "#FF6B9D";
const BLUE   = "#A8DAFF";

const DIMS = ["S","T","D","R","A","C"];
const BASE = {S:50,T:50,D:50,R:50,A:50,C:50};

const SHADOW    = "6px 6px 0 0 #000";
const SHADOW_LG = "12px 12px 0 0 #000";
const SHADOW_SM = "3px 3px 0 0 #000";
const BORDER    = "4px solid #000";
const BORDER_SM = "3px solid #000";
const BORDER_LG = "6px solid #000";

const OPT_STYLE = [
  {bg: YELLOW, fg: DARK,  dark: "#B8860B"},
  {bg: GREEN,  fg: "#fff", dark: "#2E7D44"},
  {bg: PINK,   fg: "#fff", dark: "#B5154D"},
  {bg: BLUE,   fg: DARK,  dark: "#1565A0"},
];

const ARCHETYPE_BG = {
  mcgraw: YELLOW, olin: BLUE, libe: GREEN,
  slope: GREEN, beebe: BLUE, willard: PINK,
  ithaca: YELLOW, sage: PINK,
};

const STYLES = `
  *{-webkit-tap-highlight-color:transparent;touch-action:manipulation;box-sizing:border-box}
  @keyframes pageRight{from{transform:translateX(28px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes pageLeft{from{transform:translateX(-28px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes pageFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes qRight{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes qLeft{from{transform:translateX(-40px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes nbounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  @keyframes npulse{0%,100%{opacity:0.45}50%{opacity:0.85}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .nbtn:active{transform:translate(6px,6px)!important;box-shadow:none!important;transition:none!important}
`;

const QS = [
  {zh:"期末周，三个DDL撞在一起，你的第一反应是？",
   en:"It's finals weeks and you have three upcoming deadlines. What's your first reaction?",
   opts:[
    {zh:"打开计划表，精确排到小时",en:"Make an hourly-study plan",d:{S:0,T:12,D:8,R:0,A:0,C:5}},
    {zh:"拉朋友去Olin camp out，互相监督顺便吐槽",en:"Camp out with friends in Olin",d:{S:12,T:-5,D:8,R:0,A:0,C:0}},
    {zh:"先睡一觉，醒来再说",en:"I'll sleep first, and deal with it later",d:{S:0,T:-10,D:-12,R:5,A:0,C:-5}},
    {zh:"突然开始思考：我到底为什么要选这个专业",en:"Starting thinking about why I picked this major",d:{S:-5,T:-5,D:-8,R:15,A:5,C:-5}},
  ]},
  {zh:"Cornell这周末有个活动，你觉得你更可能是：",
   en:"There's a Cornell event this weekend. Which sounds most like you?",
   opts:[
    {zh:"活动组织/发起人",en:"I'm the organizer",d:{S:8,T:8,D:10,R:0,A:0,C:8}},
    {zh:"一定到场社交，多好的认识新朋友的场合啊！",en:"Definitely going, it's the perfect chance to meet new people!",d:{S:15,T:0,D:0,R:-5,A:0,C:5}},
    {zh:"犹豫一下去了，但全程想早点走",en:"Went after deliberation, but thinking about leaving the whole time",d:{S:-8,T:0,D:-5,R:8,A:0,C:-5}},
    {zh:"一边参与，一边观察人类行为",en:"I'll be there quietly watching how humans behave in the corner",d:{S:-5,T:0,D:0,R:15,A:0,C:0}},
  ]},
  {zh:"你对coffee chat的真实想法是？",
   en:"Your honest take on coffee chats?",
   opts:[
    {zh:"明确目标，提前准备好问题，效率第一",en:"Goal-directed, prep questions in advance, efficiency first",d:{S:0,T:8,D:8,R:-5,A:0,C:15}},
    {zh:"跟不同的人聊天本身就很开心",en:"I just love talking to all kinds of people",d:{S:12,T:0,D:0,R:-5,A:0,C:5}},
    {zh:"能不去就不去",en:"Would avoid it if I could",d:{S:-8,T:-5,D:-5,R:5,A:0,C:-12}},
    {zh:"聊着聊着开始想人与人关系的本质",en:"End up pondering the nature of human connection mid-chat",d:{S:0,T:0,D:-8,R:15,A:0,C:-8}},
  ]},
  {zh:"某天晚上，你本来打算写作业，但朋友说ctown有个party叫你出门，你会：",
   en:"You had planned to study one night, but your friend tells you there's a party in ctown. You:",
   opts:[
    {zh:"拒绝，打乱节奏不值得",en:"Decline the invitation, disrupting my study schedule isn't worth it",d:{S:-8,T:12,D:10,R:0,A:0,C:0}},
    {zh:"去，但给自己设了回来的时间",en:"I'll go, but I'll set a hard return time",d:{S:8,T:8,D:5,R:0,A:0,C:5}},
    {zh:"直接去，学习可以明天再说",en:"I'll go! Studying can wait until tomorrow",d:{S:10,T:-10,D:-8,R:0,A:0,C:-5}},
    {zh:"去了但一直想着自己本来该干嘛",en:"I'll go, but probably will spend the night thinking about what I should've been doing",d:{S:-5,T:-5,D:0,R:12,A:0,C:0}},
  ]},
  {zh:"Pre-Enrollment前后，你把课表加加减减，这时候你：",
   en:"It's Pre-Enrollment and you've been editing your schedule. You:",
   opts:[
    {zh:"已经把每周时间块分好，甚至留了buffer",en:"Have mapped out your entire schedule, even built in some buffer times",d:{S:0,T:15,D:8,R:0,A:0,C:5}},
    {zh:"一边看课一边想：这门有朋友、那门听说有意思，不知不觉排得挺满",en:"Browsing courses thinking: friends in this one, that one sounds fun",d:{S:10,T:8,D:5,R:-5,A:0,C:8}},
    {zh:"先这样吧，开学再看情况",en:"Eh my schedule is good enough — I'll figure it out when school starts",d:{S:0,T:-12,D:-5,R:5,A:0,C:-5}},
    {zh:"看着课表突然在想：这真的是我想学的吗",en:"Staring at your schedule wondering: is this actually what I want to study?",d:{S:-5,T:-5,D:-5,R:12,A:8,C:-5}},
  ]},
  {zh:"春暖花开，你从宿舍走去上早课，你的状态是？",
   en:"Spring has arrived. Walking to a morning class, you:",
   opts:[
    {zh:"感慨今天光线很好，樱花开了，校园终于美丽了起来",en:"I walk noticing the light, the cherry blossoms — campus is finally beautiful again",d:{S:0,T:-5,D:0,R:5,A:15,C:-5}},
    {zh:"戴耳机听podcast，充实通勤时间",en:"Earbuds in, podcast on — making the commute count",d:{S:-8,T:5,D:8,R:0,A:-5,C:10}},
    {zh:"上课？早课翘了，在宿舍睡觉。或者可能走在路上也在睡。",en:"Class? Skipped my morning class and am still in bed. Or maybe daydreaming as I walk",d:{S:0,T:-12,D:-10,R:5,A:0,C:-8}},
    {zh:"在脑子里过今天的几个ddl",en:"Thinking through today's tasks",d:{S:0,T:10,D:12,R:0,A:0,C:8}},
  ]},
  {zh:"你刷社交媒体的时候，更容易点击哪个内容？",
   en:"You're scrolling through social media. Which of the following content are you most likely to click on?",
   opts:[
    {zh:"朋友在干嘛、谁又去了哪个活动、最近大家都在聊什么",en:"What friends are up to, who went to what event, what everyone's talking about",d:{S:12,T:0,D:0,R:-5,A:5,C:-5}},
    {zh:"实习/行业信息、经验分享，甚至不小心点开一篇很长的分析",en:"Internship tips, industry news, and industry deep dives you didn't mean to read all the way through",d:{S:0,T:5,D:10,R:0,A:-5,C:15}},
    {zh:"杂七杂八的、有意思的帖子",en:"Anything that seems interesting - to me",d:{S:-8,T:0,D:-5,R:12,A:5,C:-10}},
    {zh:"「我要开始认真生活了」那种内容：健身、作息、自律vlog，看完很想重启人生",en:"'Time to get my life together' content — fitness routines, vlogs, things that make you want to restart",d:{S:-5,T:8,D:10,R:0,A:0,C:5}},
  ]},
  {zh:"这是你在康奈尔的最后一学期，你最想做的一件事是？",
   en:"It's the last semester of your time at Cornell. What's the one thing you want to do the most?",
   opts:[
    {zh:"把没去过的地方都走一遍，把故事都留住",en:"Walk every corner I haven't been, hold onto every story",d:{S:0,T:0,D:0,R:8,A:15,C:-8}},
    {zh:"把简历和portfolio打磨到最好",en:"Polish my resume and portfolio to perfection",d:{S:0,T:8,D:12,R:-5,A:-5,C:15}},
    {zh:"认识更多人，维护好要带走的关系网",en:"Meet more people and keep the network I'm taking with me beyond Cornell",d:{S:12,T:0,D:5,R:-5,A:0,C:10}},
    {zh:"做一些一直想做但是没做的事",en:"I'll finally start doing the thing I've been meaning to do",d:{S:-8,T:-5,D:0,R:15,A:8,C:-8}},
  ]},
  {zh:"早上七点半，你的状态是？",
   en:"7:30am. Where are you at?",
   opts:[
    {zh:"已经跑完步回来，在吃早饭",en:"Back from a run or a workout, eating breakfast",d:{S:-8,T:15,D:10,R:0,A:0,C:5}},
    {zh:"刚睁眼，先看昨晚有没有消息没回",en:"Just woke up, checking missed messages first",d:{S:12,T:-5,D:0,R:0,A:0,C:0}},
    {zh:"还在睡，七点半根本不存在",en:"Still asleep. 7:30am doesn't exist.",d:{S:-5,T:-12,D:-8,R:5,A:0,C:-5}},
    {zh:"起来了，发呆，慢慢看窗外",en:"Up, but just staring out the window",d:{S:-8,T:-8,D:-5,R:12,A:8,C:-5}},
  ]},
  {zh:"毕业几年后，你有机会回到Cornell一天，你会？",
   en:"It's been a couple years since graduation and you have the chance to revisit Cornell for a day. You will:",
   opts:[
    {zh:"回到Ithaca，重走一遍当年每天走的路",en:"Return to Ithaca and revisit all the familiar places",d:{S:-5,T:0,D:0,R:8,A:15,C:-8}},
    {zh:"参加校友活动，认识现在的在校生和其他校友",en:"Attend alumni events, meet current students and fellow grads",d:{S:8,T:5,D:8,R:-5,A:0,C:15}},
    {zh:"找老朋友，约在熟悉的地方坐一下午",en:"Meet up with old friends in the 'old' spot on campus",d:{S:12,T:-5,D:0,R:0,A:8,C:-5}},
    {zh:"不会特地回Cornell，但会约当年的朋友们在不同地方小聚",en:"I don't think I'll return to Ithaca, but I might meet up with Cornell friends somewhere else",d:{S:10,T:5,D:8,R:-8,A:-12,C:10}},
  ]},
];

const AS = [
  {id:"mcgraw",emoji:"🔔",
   zn:"McGraw钟楼守望者",en:"McGraw Bell Tower Keeper",
   zt:"情怀派",et:"Heritage Type",
   coords:{S:20,T:25,D:30,R:75,A:95,C:15},
   ztl:"Ithaca的每一个角落都欠你一个故事",
   etl:"Every corner of Ithaca owes you a story",
   zd:"你和Cornell之间有一种别人理解不了的双向奔赴。四年后离开的时候，你会是最后一个回头看的人。",
   ed:"You and Cornell share a bond others simply can't understand. When it's time to leave, you'll be the last one to look back.",
   zpw:"随时说出校园任意角落的历史",epw:"Know the history of every hidden corner on campus",
   zbl:"有时爱这个地方多过爱自己的计划",ebl:"Sometimes loves the peaceful campus more than your plan",
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
   zbl:"总觉得下次会提前开始",ebl:"'I'll start earlier next time'",
   zco:"Libe Café社交达人",eco:"Libe Café Social Butterfly",
   zsp:"Olin三楼，窗边那个位置",esp:"The window seat at the stacks"},
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
   zsp:"Libe Café，正午的那张长桌",esp:"Sipping coffee in Libe Café"},
  {id:"slope",emoji:"🌿",
   zn:"Libe Slope哲学家",en:"Libe Slope Philosopher",
   zt:"佛系型",et:"Equilibrium Type",
   coords:{S:30,T:10,D:10,R:80,A:60,C:15},
   ztl:"GPA只是一个数字，日落才是硬通货",
   etl:"GPA is just a number. Sunsets are the real currency.",
   zd:"你不是不在乎，你只是看得更远。当别人在算绩点的时候，你已经在想毕业后的事了——或者什么都没在想，就是觉得现在挺好的。",
   ed:"You're not indifferent — you just see further. While others count GPAs, you're already thinking past graduation. Or thinking nothing at all, which is also fine.",
   zpw:"任何压力下都能保持真实的平静",epw:"Stays calm under any pressure",
   zbl:"有时候「看开了」其实是还没开始",ebl:"Sometimes 'acceptance' is just avoidance",
   zco:"Ithaca Fall沉思者",eco:"Ithaca Fall Daydreamer",
   zsp:"Slope顶端，下午四点的光",esp:"Lying on the Slope at 4pm"},
  {id:"beebe",emoji:"🏃",
   zn:"Beebe Lake晨跑者",en:"Beebe Lake Morning Runner",
   zt:"自律型",et:"6AM Protocol",
   coords:{S:20,T:95,D:85,R:30,A:45,C:50},
   ztl:"你6点的闹钟是别人的人生警告",
   etl:"Your 6am alarm is everyone else's existential crisis",
   zd:"你的自律不是表演给别人看的，它就是你运转的方式。让周围人又羡慕又有点害怕，这件事你已经习惯了。",
   ed:"Your discipline isn't a performance — it's just how you operate. The fact that people are both envious and slightly afraid of you? You're used to it.",
   zpw:"把'我要改变'变成明天早上六点",epw:"Turns 'I should change' into a 6am-wakeup tomorrow",
   zbl:"偶尔忘了给自己留一点弹性",ebl:"Occasionally forgets to leave room for spontaneity",
   zco:"Willard Straight活动家",eco:"Willard Straight Activist",
   zsp:"Beebe Lake，太阳刚出来的时候",esp:"Beebe Lake just after sunrise"},
  {id:"willard",emoji:"🎭",
   zn:"Willard Straight活动家",en:"Willard Straight Activist",
   zt:"参与型",et:"Full Stack Human",
   coords:{S:80,T:85,D:80,R:20,A:60,C:70},
   ztl:"你的Google Calendar是一件艺术品",
   etl:"Your Google Calendar is a piece of art",
   zd:"五个club、三个项目、几十个slack channel。你不是闲不住，你只是真的相信每件事都值得去做。",
   ed:"Five clubs, three projects, and two-dozen slack channels. You're not restless — you genuinely believe every single thing is worth doing.",
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
   zsp:"Gorge边，秋天落叶最厚的那段路",esp:"The path next to the gorges buried in autumn leaves"},
  {id:"sage",emoji:"💼",
   zn:"Sage Hall Coffee Chat达人",en:"Sage Hall Networker",
   zt:"布局型",et:"Network Architect",
   coords:{S:75,T:70,D:80,R:25,A:35,C:95},
   ztl:"每一次对话都是一次有效投资",
   etl:"Every conversation is a worthwhile investment",
   zd:"你把networking这件事做得不像networking。你真的对人感兴趣——只是你也很清楚，好的关系和好的机会从来不是分开的。",
   ed:"You make networking not feel like networking. You're genuinely curious about people — and you know that good relationships and good opportunities were never really separate.",
   zpw:"把陌生人变成五年后的重要联系人",epw:"Turns strangers into important contacts five years later",
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
    if(black) bars.push(<rect key={i} x={x} y={0} width={w} height={20} fill="#000"/>);
    x += w+1;
  }
  return <svg width={x} height={20} style={{display:"block"}}>{bars}</svg>;
}

const LOADING_MSGS = {
  zh:["分析你的Cornell灵魂中…","检索Olin签到记录…","测量你和Slope的距离…","比对Arts Quad情感指数…"],
  en:["Analyzing your Cornell spirit","Checking Olin sign-in logs…","Measuring your Slope energy…","Cross-referencing Arts Quad vibes…"],
};

export default function CornellQuiz() {
  const [lang, setLang]       = useState("zh");
  const [step, setStep]       = useState("cover");
  const [name, setName]       = useState("");
  const [qi, setQi]           = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sel, setSel]         = useState(null);
  const [result, setResult]   = useState(null);
  const [lmsg, setLmsg]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [sharing, setSharing] = useState(false);
  const [navDir, setNavDir]   = useState("forward");
  const [qKey, setQKey]       = useState(0);
  const [qDir, setQDir]       = useState("forward");

  const cardRef    = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const L = lang;
  const T = (zh, en) => L === "zh" ? zh : en;
  const mono  = {fontFamily:"'Courier New',monospace"};
  const serif = {fontFamily:"Georgia,serif"};
  const sans  = {fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif"};

  const pageAnim = `${navDir==="forward"?"pageRight":"pageLeft"} 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both`;
  const qAnim   = `${qDir==="forward"?"qRight":"qLeft"} 0.25s cubic-bezier(0.25,0.46,0.45,0.94) both`;

  useEffect(() => {
    if (step !== "loading") return;
    let i = 0;
    const iv = setInterval(() => { i=(i+1)%4; setLmsg(i); }, 750);
    const to = setTimeout(() => {
      clearInterval(iv);
      setResult(matchArchetype(calcScores(answers)));
      setNavDir("forward");
      setStep("result");
    }, 3000);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, [step, answers]);

  const startQuiz = () => {
    if (!name.trim()) return;
    setNavDir("forward"); setStep("quiz");
  };

  const handleNext = () => {
    if (sel === null) return;
    const na = [...answers, {qi, oi:sel}];
    setAnswers(na);
    if (qi < QS.length-1) {
      setQDir("forward"); setQKey(k=>k+1); setQi(qi+1); setSel(null);
    } else {
      setNavDir("forward"); setStep("loading");
    }
  };

  const handleBack = () => {
    if (qi === 0) return;
    const prev = answers[answers.length-1];
    setAnswers(a => a.slice(0,-1));
    setQi(q => q-1); setSel(prev.oi);
    setQDir("back"); setQKey(k=>k+1);
  };

  const restart = () => {
    setQi(0); setAnswers([]); setSel(null); setResult(null); setName("");
    setNavDir("back"); setStep("cover");
  };

  const captureCard = () => html2canvas(cardRef.current, {
    scale:3, backgroundColor:"#fff", useCORS:true, logging:false,
  });

  const saveCard = async () => {
    if (saving || !cardRef.current) return;
    setSaving(true);
    try {
      const canvas = await captureCard();
      const a = document.createElement("a");
      a.download = "cornell-quiz-card.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const shareToInstagram = async () => {
    if (sharing || !cardRef.current) return;
    setSharing(true);
    try {
      const canvas = await captureCard();
      const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
      const file = new File([blob], "cornell-card.png", {type:"image/png"});
      // Web Share API with image file — iOS share sheet surfaces Instagram Stories directly
      if (navigator.share && navigator.canShare?.({files:[file]})) {
        await navigator.share({
          files:[file],
          title:"Cornell Quiz",
          text:T(
            `我的Cornell人格是「${result.primary.zn}」！快来测测你是哪种Cornell人～`,
            `My Cornell type is "${result.primary.en}"! Come find yours~`
          ),
        });
      } else {
        // Fallback: save image + guide user into Instagram Stories manually
        const a = document.createElement("a");
        a.download = "cornell-card.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
        setTimeout(() => alert(T(
          "图片已保存！打开 Instagram → 点击相机图标发起Story → 从相册选择此图片。",
          "Image saved! Open Instagram → tap the camera to create a Story → pick this image from your gallery."
        )), 600);
      }
    } catch(e) { if (e.name !== "AbortError") console.error(e); }
    setSharing(false);
  };

  const onTouchStart = e => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (dx > 60 && dx > dy*1.5 && qi > 0) handleBack();
    touchStartX.current = null; touchStartY.current = null;
  };

  const LangBtn = ({onDark=true}) => (
    <button className="nbtn" onClick={() => setLang(l=>l==="zh"?"en":"zh")} style={{
      position:"absolute", top:14, right:16,
      background: onDark ? "rgba(255,255,255,0.2)" : "#fff",
      border: onDark ? "2px solid rgba(255,255,255,0.5)" : BORDER_SM,
      color: onDark ? "#fff" : DARK,
      borderRadius:9999, padding:"4px 12px",
      fontSize:11, ...mono, cursor:"pointer",
      letterSpacing:"0.06em", zIndex:10, fontWeight:700,
      boxShadow: onDark ? "none" : SHADOW_SM,
    }}>{L==="zh"?"EN":"中文"}</button>
  );

  // ── COVER ──────────────────────────────────────────────────────────────
  if (step === "cover") return (
    <div style={{
      minHeight:"100dvh", background:RED,
      display:"flex", flexDirection:"column",
      alignItems:"center", padding:"24px 20px 28px",
      position:"relative", overflow:"hidden",
      animation:pageAnim, WebkitFontSmoothing:"antialiased",
    }}>
      <style>{STYLES}</style>
      {/* Decorative blobs */}
      <div style={{position:"absolute",top:40,left:40,width:64,height:64,background:YELLOW,borderRadius:"50%",opacity:0.55,animation:"npulse 2s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:130,right:28,width:96,height:96,background:GREEN,borderRadius:"50%",opacity:0.35,animation:"npulse 2.4s ease-in-out infinite 0.4s",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:150,left:20,width:80,height:80,background:PINK,borderRadius:"50%",opacity:0.45,animation:"npulse 1.8s ease-in-out infinite 0.8s",pointerEvents:"none"}}/>

      <div style={{width:"100%",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1,gap:0}}>
        {/* Bear */}
        <div style={{position:"relative",marginBottom:16}}>
          <div style={{width:100,height:100,background:YELLOW,borderRadius:"50%",border:BORDER,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:48}}>🐻</span>
          </div>
          <div style={{position:"absolute",top:-8,right:-14,background:"#fff",padding:"3px 10px",borderRadius:9999,border:BORDER,transform:"rotate(12deg)",fontSize:12,fontWeight:900,...sans}}>Hey!</div>
        </div>

        {/* Language toggle */}
        <div style={{display:"flex",border:BORDER,borderRadius:9999,overflow:"hidden",marginBottom:18,boxShadow:SHADOW,flexShrink:0,background:"rgba(0,0,0,0.3)"}}>
          <button onClick={()=>setLang("zh")} style={{padding:"9px 24px",background:lang==="zh"?"#fff":"transparent",color:lang==="zh"?DARK:"rgba(255,255,255,0.85)",border:"none",fontWeight:900,fontSize:14,...sans,cursor:"pointer",transition:"background 0.15s"}}>中文</button>
          <div style={{width:4,background:"transparent"}}/>
          <button onClick={()=>setLang("en")} style={{padding:"9px 24px",background:lang==="en"?"#fff":"transparent",color:lang==="en"?DARK:"rgba(255,255,255,0.85)",border:"none",fontWeight:900,fontSize:14,...sans,cursor:"pointer",transition:"background 0.15s"}}>English</button>
        </div>

        {/* Title */}
        <p style={{color:"rgba(255,255,255,0.45)",fontSize:9,letterSpacing:"0.22em",...mono,margin:"0 0 8px"}}>CORNELL UNIVERSITY</p>
        <h1 style={{color:YELLOW,fontSize:30,fontWeight:900,margin:"0 0 10px",lineHeight:1.15,...sans,textAlign:"center"}}>
          {T("测测你的Cornell人格","The Cornell Personality Test")}
        </h1>
        <p style={{color:"rgba(255,255,255,0.75)",fontSize:13,...sans,margin:"0 0 20px",textAlign:"center",lineHeight:1.55,padding:"0 4px"}}>
          {T("仅需5分钟——测完即可获得你的专属Cornell人格卡","Only takes 5 minutes — you will receive your unique Cornell ID Card")}
        </p>

        {/* Name input */}
        <div style={{width:"100%",background:"#fff",borderRadius:28,padding:"22px 18px",border:BORDER,boxShadow:SHADOW,position:"relative",marginBottom:4}}>
          <div style={{position:"absolute",top:-14,left:18,background:GREEN,padding:"3px 12px",borderRadius:9999,border:BORDER,fontSize:11,fontWeight:700,...sans}}>
            {T("你的名字 Your name","Your name 你的名字")}
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key==="Enter" && startQuiz()}
            placeholder={T("输入你的名字…","Type here...")}
            autoComplete="off"
            style={{width:"100%",padding:"12px 14px",fontSize:16,border:BORDER_SM,borderRadius:16,outline:"none",color:DARK,...sans,marginTop:8}}
          />
        </div>
      </div>

      {/* CTA */}
      <button
        className={name.trim()?"nbtn":""}
        onClick={startQuiz}
        disabled={!name.trim()}
        style={{
          width:"100%",padding:"17px",
          background:name.trim()?YELLOW:"rgba(255,255,255,0.18)",
          color:name.trim()?"#000":"rgba(255,255,255,0.35)",
          border:BORDER,borderRadius:9999,
          boxShadow:name.trim()?SHADOW:"none",
          fontSize:18,fontWeight:900,...sans,
          cursor:name.trim()?"pointer":"default",
          transition:"all 0.15s",position:"relative",zIndex:1,marginTop:16,
        }}
      >{T("Let's go! 开始 →","Let's go! 开始 →")}</button>

      <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",...mono,letterSpacing:"0.1em",marginTop:14,zIndex:1}}>MADE BY CORNELL CSSA</div>
    </div>
  );

  // ── QUIZ ───────────────────────────────────────────────────────────────
  if (step === "quiz") {
    const q = QS[qi];
    const pct = (qi/QS.length)*100;
    return (
      <div
        style={{minHeight:"100dvh",background:WARM,display:"flex",flexDirection:"column",WebkitFontSmoothing:"antialiased",animation:pageAnim,position:"relative",overflow:"hidden"}}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      >
        <style>{STYLES}</style>
        <div style={{position:"absolute",top:80,right:36,width:64,height:64,background:PINK,borderRadius:"50%",opacity:0.28,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:120,left:28,width:80,height:80,background:GREEN,borderRadius:"50%",opacity:0.22,pointerEvents:"none"}}/>

        {/* Header */}
        <div style={{background:"#fff",padding:"14px 20px 12px",borderBottom:BORDER,position:"relative",flexShrink:0}}>
          <LangBtn onDark={false}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingRight:52}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13,fontWeight:700,...sans,color:DARK}}>
                {T("题目","Q")} {qi+1} / {QS.length}
              </span>
            </div>
            <div style={{background:YELLOW,padding:"3px 10px",borderRadius:9999,border:BORDER_SM,fontSize:11,fontWeight:700,...sans}}>
              {Math.round(pct)}%
            </div>
          </div>
          <div style={{height:14,background:"#e5e5e5",borderRadius:9999,border:BORDER_SM,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:RED,transition:"width 0.4s ease"}}/>
          </div>
        </div>

        {/* Animated content */}
        <div key={qKey} style={{flex:1,display:"flex",flexDirection:"column",animation:qAnim}}>
          <div style={{padding:"18px 20px 10px",flexShrink:0}}>
            <div style={{background:"#fff",borderRadius:24,padding:"18px",border:BORDER,boxShadow:SHADOW}}>
              <p style={{fontSize:18,fontWeight:700,color:DARK,margin:0,...sans,textAlign:"center",lineHeight:1.45}}>
                {L==="zh"?q.zh:q.en}
              </p>
            </div>
          </div>

          <div style={{padding:"0 20px",flex:1,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
            {q.opts.map((o,i) => {
              const os = OPT_STYLE[i];
              const isSel = sel === i;
              return (
                <button key={i} onClick={() => setSel(i)} style={{
                  textAlign:"left",padding:"12px 14px",
                  background:os.bg,border:BORDER,borderRadius:24,
                  boxShadow:isSel?"none":SHADOW,
                  transform:isSel?"translate(6px,6px)":"none",
                  display:"flex",alignItems:"center",gap:12,
                  cursor:"pointer",transition:"all 0.12s",flexShrink:0,
                }}>
                  <div style={{width:44,height:44,minWidth:44,background:isSel?os.dark:"#fff",borderRadius:12,border:BORDER_SM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isSel?24:15,fontWeight:900,color:isSel?"#fff":DARK,...mono,lineHeight:1}}>
                    {isSel?"✔":String.fromCharCode(65+i)}
                  </div>
                  <div style={{flex:1,fontSize:14,fontWeight:700,color:os.fg,lineHeight:1.45,...sans}}>
                    {L==="zh"?o.zh:o.en}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{padding:"12px 20px",paddingBottom:"max(12px,env(safe-area-inset-bottom))",flexShrink:0,display:"flex",gap:10}}>
            {qi > 0 && (
              <button
                className="nbtn"
                onClick={handleBack}
                style={{
                  padding:"15px 16px",flexShrink:0,
                  background:"#fff",border:BORDER,borderRadius:9999,
                  boxShadow:SHADOW,fontSize:14,fontWeight:900,...sans,
                  color:DARK,cursor:"pointer",whiteSpace:"nowrap",
                }}
              >{T("上一题 ←","← Prev")}</button>
            )}
            <button
              className={sel!==null?"nbtn":""}
              onClick={handleNext} disabled={sel===null}
              style={{
                flex:1,padding:"15px",
                background:sel!==null?RED:"rgba(0,0,0,0.12)",
                color:sel!==null?"#fff":"rgba(0,0,0,0.3)",
                border:BORDER,borderRadius:9999,
                boxShadow:sel!==null?SHADOW:"none",
                fontSize:16,fontWeight:900,...sans,
                cursor:sel!==null?"pointer":"default",
                letterSpacing:"0.02em",transition:"all 0.15s",
              }}
            >{qi===QS.length-1?T("查看结果 →","See My Result →"):T("下一题 →","Next →")}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ─────────────────────────────────────────────────────────────
  if (step === "loading") return (
    <div style={{minHeight:"100dvh",background:RED,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden",animation:"pageFade 0.35s ease both"}}>
      <style>{STYLES}</style>
      <div style={{position:"absolute",top:80,left:40,width:96,height:96,background:YELLOW,borderRadius:"50%",opacity:0.5,animation:"npulse 1.6s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:160,right:48,width:128,height:128,background:GREEN,borderRadius:"50%",opacity:0.35,animation:"npulse 2s ease-in-out infinite 0.5s",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"45%",left:28,width:64,height:64,background:PINK,borderRadius:"50%",opacity:0.55,animation:"npulse 1.3s ease-in-out infinite 0.3s",pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{position:"relative",marginBottom:28}}>
          <div style={{width:136,height:136,background:YELLOW,borderRadius:"50%",border:BORDER,display:"flex",alignItems:"center",justifyContent:"center",animation:"nbounce 0.9s ease-in-out infinite"}}>
            <span style={{fontSize:68}}>🐻</span>
          </div>
          <div style={{position:"absolute",top:-14,right:-14,background:"#fff",width:38,height:38,borderRadius:"50%",border:BORDER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,animation:"npulse 1s ease-in-out infinite"}}>✨</div>
        </div>

        <div style={{background:"#fff",padding:"12px 28px",borderRadius:9999,border:BORDER,boxShadow:SHADOW,marginBottom:10}}>
          <p style={{fontSize:18,fontWeight:700,color:DARK,margin:0,...sans}}>{LOADING_MSGS.en[lmsg]}</p>
        </div>
        <div style={{background:YELLOW,padding:"9px 22px",borderRadius:9999,border:BORDER}}>
          <p style={{fontSize:15,fontWeight:700,color:DARK,margin:0,...sans}}>{LOADING_MSGS.zh[lmsg]}</p>
        </div>
      </div>
    </div>
  );

  // ── RESULT ──────────────────────────────────────────────────────────────
  if (step === "result" && result) {
    const {primary:p, secondary:sec, sim} = result;
    const cardBg = ARCHETYPE_BG[p.id] || YELLOW;
    return (
      <div style={{minHeight:"100dvh",background:WARM,display:"flex",flexDirection:"column",WebkitFontSmoothing:"antialiased",animation:pageAnim,position:"relative",overflow:"hidden"}}>
        <style>{STYLES}</style>
        <div style={{position:"absolute",top:40,right:36,width:80,height:80,background:YELLOW,borderRadius:"50%",opacity:0.22,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:120,left:28,width:96,height:96,background:GREEN,borderRadius:"50%",opacity:0.2,pointerEvents:"none"}}/>

        {/* LangBtn floated */}
        <div style={{position:"absolute",top:14,right:16,zIndex:20}}>
          <button className="nbtn" onClick={() => setLang(l=>l==="zh"?"en":"zh")} style={{background:"#fff",border:BORDER_SM,color:DARK,borderRadius:9999,padding:"4px 12px",fontSize:11,...mono,cursor:"pointer",letterSpacing:"0.06em",fontWeight:700,boxShadow:SHADOW_SM}}>
            {L==="zh"?"EN":"中文"}
          </button>
        </div>

        {/* Scrollable area */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px 0",display:"flex",flexDirection:"column",alignItems:"center"}}>

          {/* Lanyard */}
          <div style={{width:44,height:80,background:"linear-gradient(to bottom,#B31B1B,#7a1010)",border:BORDER,borderRadius:"0 0 10px 10px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"4px 4px 0 0 #000",flexShrink:0}}>
            <span style={{color:"rgba(255,255,255,0.6)",fontSize:7,fontWeight:700,...mono,letterSpacing:"0.08em",writingMode:"vertical-rl"}}>CORNELL</span>
          </div>
          <div style={{width:28,height:14,background:"#fff",border:BORDER,borderTop:"none",borderRadius:"0 0 9999px 9999px",flexShrink:0}}/>

          {/* ID Card — cardRef wraps only the card for clean screenshot */}
          <div ref={cardRef} style={{width:"100%",maxWidth:360,background:"#fff",borderRadius:28,border:BORDER_LG,boxShadow:SHADOW_LG,overflow:"hidden",position:"relative",flexShrink:0,marginBottom:8}}>

            {/* Hole punch at top */}
            <div style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",width:22,height:22,background:WARM,border:BORDER,borderRadius:"50%",zIndex:10}}/>

            {/* Card header */}
            <div style={{background:RED,padding:"14px 18px 12px",paddingTop:22,borderBottom:BORDER,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:13,...sans}}>Cornell 🐻</div>
              <div style={{background:"#fff",padding:"2px 10px",borderRadius:9999,border:BORDER_SM,fontSize:11,fontWeight:900,...mono}}>CLASS OF 2028</div>
            </div>

            {/* Name + Type */}
            <div style={{padding:"14px 18px 10px"}}>
              <div style={{fontSize:8,fontWeight:900,color:GRAY,letterSpacing:"0.12em",...mono,marginBottom:2}}>NAME:</div>
              <h1 style={{fontSize:26,fontWeight:900,color:DARK,margin:"0 0 10px",lineHeight:1.1,...sans}}>{name||"—"}</h1>
              <div style={{fontSize:8,fontWeight:900,color:GRAY,letterSpacing:"0.12em",...mono,marginBottom:2}}>TYPE:</div>
              <div style={{fontSize:15,fontWeight:900,...sans,color:DARK}}>{p.emoji} {L==="zh"?p.zn:p.en}</div>
            </div>

            {/* Emoji hero */}
            <div style={{padding:"0 18px 12px"}}>
              <div style={{background:cardBg,borderRadius:18,border:BORDER,display:"flex",alignItems:"center",justifyContent:"center",height:150}}>
                <span style={{fontSize:76}}>{p.emoji}</span>
              </div>
            </div>

            {/* Tagline */}
            <div style={{padding:"0 18px 12px",textAlign:"center"}}>
              <p style={{fontSize:12,fontStyle:"italic",color:GRAY,...sans,margin:0,lineHeight:1.5}}>
                "{L==="zh"?p.ztl:p.etl}"
              </p>
            </div>

            {/* Section cards */}
            <div style={{padding:"0 14px",display:"flex",flexDirection:"column",gap:8}}>
              <div style={{background:"#f5f5f5",borderRadius:14,border:BORDER_SM,padding:"10px 12px"}}>
                <div style={{fontSize:8,fontWeight:900,color:GRAY,letterSpacing:"0.1em",...mono,marginBottom:4}}>DESCRIPTION:</div>
                <p style={{fontSize:12,color:DARK,lineHeight:1.6,margin:0,...sans}}>{L==="zh"?p.zd:p.ed}</p>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background:YELLOW,borderRadius:14,border:BORDER_SM,padding:"10px 12px"}}>
                  <div style={{fontSize:8,fontWeight:900,letterSpacing:"0.1em",...mono,marginBottom:4}}>SUPERPOWER:</div>
                  <p style={{fontSize:11,lineHeight:1.4,margin:0,fontWeight:700,...sans}}>{L==="zh"?p.zpw:p.epw}</p>
                </div>
                <div style={{background:PINK,borderRadius:14,border:BORDER_SM,padding:"10px 12px"}}>
                  <div style={{fontSize:8,fontWeight:900,color:"#fff",letterSpacing:"0.1em",...mono,marginBottom:4}}>BLIND SPOT:</div>
                  <p style={{fontSize:11,lineHeight:1.4,margin:0,color:"#fff",fontWeight:700,...sans}}>{L==="zh"?p.zbl:p.ebl}</p>
                </div>
              </div>

              <div style={{background:GREEN,borderRadius:14,border:BORDER_SM,padding:"10px 12px"}}>
                <div style={{fontSize:8,fontWeight:900,color:"#fff",letterSpacing:"0.1em",...mono,marginBottom:4}}>{T("副人格倾向","SECONDARY TYPE")}:</div>
                <p style={{fontSize:12,color:"#fff",margin:0,fontWeight:700,...sans}}>{sec.emoji} {L==="zh"?sec.zn:sec.en} · {sim}%</p>
              </div>

              <div style={{background:BLUE,borderRadius:14,border:BORDER_SM,padding:"10px 12px"}}>
                <div style={{fontSize:8,fontWeight:900,letterSpacing:"0.1em",...mono,marginBottom:4}}>{T("灵魂地标","SPIRIT PLACE")}:</div>
                <p style={{fontSize:12,color:DARK,margin:0,fontWeight:700,...sans}}>{L==="zh"?p.zsp:p.esp}</p>
              </div>
            </div>

            {/* Barcode */}
            <div style={{margin:"12px 14px 0",borderTop:BORDER_SM,padding:"10px 0 0"}}>
              <Barcode seed={p.id}/>
              <p style={{fontSize:8,color:"rgba(0,0,0,0.3)",...mono,letterSpacing:"0.06em",margin:"4px 0 0"}}>
                {p.id.toUpperCase()} · CORNELL QUIZ
              </p>
            </div>

            {/* Card footer */}
            <div style={{background:"#111",padding:"10px 18px",borderTop:BORDER,marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:8,fontWeight:700,...mono}}>MADE BY CORNELL CSSA</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:8,fontWeight:900,...mono}}>CORNELL UNIVERSITY</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{borderTop:BORDER,background:"#fff",padding:"12px 20px",paddingBottom:"max(12px,env(safe-area-inset-bottom))"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.3fr 1fr",gap:8}}>
            <button className="nbtn" onClick={restart} style={{padding:"13px 0",background:"#fff",border:BORDER,borderRadius:9999,fontSize:13,...sans,fontWeight:700,color:DARK,cursor:"pointer",boxShadow:SHADOW}}>
              {T("再测一次","Retake")}
            </button>
            <button className="nbtn" onClick={saveCard} disabled={saving} style={{padding:"13px 0",background:saving?"#8a1010":RED,border:BORDER,borderRadius:9999,fontSize:13,...sans,fontWeight:700,color:"#fff",cursor:"pointer",boxShadow:SHADOW,transition:"background 0.2s"}}>
              {saving?T("保存中…","Saving…"):T("保存卡片","Save Card")}
            </button>
            <button className="nbtn" onClick={shareToInstagram} disabled={sharing} style={{padding:"13px 0",background:sharing?"#f0f0f0":YELLOW,border:BORDER,borderRadius:9999,fontSize:13,...sans,fontWeight:700,color:DARK,cursor:"pointer",boxShadow:SHADOW,transition:"background 0.2s"}}>
              {sharing?T("分享中…","Sharing…"):T("分享","Share")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
