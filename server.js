const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url === '/student' ? '/student.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const contentType = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : 'text/plain';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

const ALL_QUESTIONS = [
  { q: "Birdən çox subyektin müqayisəli tədqiqinin həyata keçirildiyi strategiya necə adlanır?", o: ["Keyfiyyət tədqiqatı","Müqayisə xarakterli tədqiqat","Pilot layihə","Eksperimental tədqiqat"], c: 1 },
  { q: "Aşağıdakılardan hansı müqayisə subyekti ola bilər?", o: ["Yalnız ölkələr","Yalnız fərdlər","Ölkələr, fərdlər, yaşayış məntəqələri və əməkhaqqı","Yalnız dövlət qurumları"], c: 2 },
  { q: "Müqayisə xarakterli tədqiqat hansı məqsədlə aparılır?", o: ["Yalnız xərcləri azaltmaq","Fərqli kontekstlərin müqayisəsi və xarici təcrübənin öyrənilməsi","Yalnız statistik rəqəmləri toplamaq","Şirkət loqosu hazırlamaq"], c: 1 },
  { q: "Boşanma hallarının artması hansı kontekstlərin müqayisəsinə nümunə çəkilmişdir?", o: ["Şəhər və kənd","Qərb cəmiyyətləri və Azərbaycan","Azərbaycan və Türkiyə","Keçmiş və indiki dövr"], c: 1 },
  { q: "Xarici təcrübənin öyrənilməsinə dair hansı konkret nümunə verilmişdir?", o: ["Almaniyanın təhsil sistemi","Türkiyənin sosial müdafiə sistemi","ABŞ-ın kriminogen durumu","Fransanın seçki sistemi"], c: 2 },
  { q: "Müqayisəli tədqiqatdan öncə statistik məcmuları öyrənməyin əsas səbəbi nədir?", o: ["Ölkələrin sayını müəyyən etmək","Hər ölkənin özünəməxsus məlumat toplama üsulunun olması","Dil baryerini aradan qaldırmaq","Büdcəni hesablamaq"], c: 1 },
  { q: "Kriminoloji araşdırmalarda statistikaya nə təsir edə bilər?", o: ["Ölkənin əhalisinin sayı","Coğrafi mövqe","Cinayət məcəllələri arasındakı fərqlər","İnternet sürəti"], c: 2 },
  { q: "Uzun illər sosioloji tədqiqatlarda hansı metodologiyadan geniş istifadə edilirdi?", o: ["Keyfiyyət","Kəmiyyət","Qarışıq","Tarixi"], c: 1 },
  { q: "Kəmiyyət metodologiyasının çatışmazlıqları nə vaxtdan artmağa başladı?", o: ["XIX əsrin sonu","XX əsrin ortaları","XXI əsrin əvvəli","1990-cı illər"], c: 1 },
  { q: "Keyfiyyət və kəmiyyət metodologiyalarından paralel istifadə necə adlanır?", o: ["Multi-disiplinar yanaşma","Metodiki qarışıq yanaşma","Pilot yanaşma","Fokus-qrup yanaşması"], c: 1 },
  { q: "Metodiki qarışıq yanaşmanın neçə növü var?", o: ["2","3","4","5"], c: 0 },
  { q: "Tədqiqatçı birdən çox məlumat toplama üsulundan istifadə edirsə, bu hansı yanaşmadır?", o: ["Metoddaxili","Metodlararası","Nəzəri","Kəmiyyət mərkəzli"], c: 1 },
  { q: "Eyni metoddan fərqli formalarda istifadə hansı yanaşmaya aiddir?", o: ["Metodlararası","Metoddaxili","Eksperimental","Pilot"], c: 1 },
  { q: "Metodlararası qarışıq yanaşmanın başlıca üstünlüyü nədir?", o: ["Daha ucuz olması","Bir metodun çatışmazlığını digər metodla kompensasiya etmək","Vaxta qənaət","Respondentlərin sayını azaltmaq"], c: 1 },
  { q: "Metodiki qarışıq yanaşma neçə kombinasiya ilə həyata keçirilə bilər?", o: ["1","2","3","4"], c: 2 },
  { q: "Uilyams və Peynə görə fərqli metoddan nə üçün istifadə edilə bilər?", o: ["Tədqiqatı bitirmək","Əsas araşdırmaya hazırlıq kimi","Hesabat yazmaq","Xərcləri azaltmaq"], c: 1 },
  { q: "Şirkət rəhbərliyi anket hazırlamaqda çətinlik çəkirsə nə etməlidir?", o: ["Tədqiqatdan imtina etməli","Hazırlıq məqsədilə fərqli metoddan istifadə etməli","Köhnə anketləri götürməli","Yalnız statistikaya baxmalı"], c: 1 },
  { q: "Aşağıdakılardan hansı metodiki qarışıq yanaşmadan istifadə səbəbidir?", o: ["Daha dolğun nəzəriyyə irəli sürmək","Respondentlərin adlarını gizlətmək","Ofis xərclərini hesablamaq","Kompüterlərin sayını artırmaq"], c: 0 },
  { q: "Böyük seçmə toplusunda kəmiyyət tədqiqatının 'səbəblərini' öyrənmək üçün nə lazımdır?", o: ["Yenidən anket keçirmək","Keyfiyyət metodologiyası ilə müfəssəl öyrənmək","Statistik xətanı hesablamaq","Tədqiqatı dayandırmaq"], c: 1 },
  { q: "Kiçik seçmə toplusunda keyfiyyət tədqiqatının səciyyəviliyini artırmaq üçün nə edilməlidir?", o: ["Respondentləri dəyişmək","Kəmiyyət metodologiyası ilə təmsilçiliyi artırmaq","Sənəd sayını artırmaq","Metodu tamamilə dəyişmək"], c: 1 },
  { q: "İntiharın səbəblərinə dair nəzəriyyələrin Azərbaycanda sınanması hansı strategiyadır?", o: ["Metodiki qarışıq yanaşma","Başqa kontekstdə hazırlanmış nəzəriyyənin fərqli kontekstdə sınanması","Metoddaxili müqayisə","Pilot layihə"], c: 1 },
  { q: "Müqayisə xarakterli tədqiqatın xülasəsində subyekt kimi nə qeyd olunub?", o: ["Yalnız dövlət qərarları","Ölkə, fərd, əməkhaqqı, proses, hadisə və ictimai rəy","Yalnız kitablar","Yalnız laboratoriya nəticələri"], c: 1 },
  { q: "Paytaxt ərazisindəki ortalama əməkhaqqının zaman üzrə müqayisəsi hansı növdür?", o: ["Məkan üzrə müqayisə","Zaman kəsimləri üzrə müqayisə","Nəzəri müqayisə","Keyfiyyət müqayisəsi"], c: 1 },
  { q: "Polis fəaliyyətinə dair anket sorğusunda verilən sual nümunəsi hansıdır?", o: ["Polis olmaq istərdinizmi?","Polis əməkdaşları sizin zənginizə operativ reaksiya verirmi?","Polis maaşları nə qədərdir?","Polisin geyim forması necədir?"], c: 1 },
  { q: "'Kəmiyyət + Keyfiyyət' kombinasiyası hansı yanaşmanın tərkib hissəsidir?", o: ["Yalnız kəmiyyət yanaşmasının","Metodiki qarışıq yanaşmanın","Pilot tədqiqatın","Tarixi tədqiqatın"], c: 1 },
  { q: "'Kəmiyyət + Kəmiyyət' kombinasiyası nəyə imkan verir?", o: ["Metodu ləğv etməyə","Metodiki qarışıq yanaşmanı həyata keçirməyə","Keyfiyyət analizi aparmağa","Respondent sayını azaltmağa"], c: 1 },
  { q: "'Keyfiyyət + Keyfiyyət' kombinasiyası hansı strategiyanın bir növüdür?", o: ["Metodiki qarışıq yanaşma","Tək metod yanaşması","Eksperiment yanaşması","Statistik yanaşma"], c: 0 },
  { q: "Müqayisə xarakterli tədqiqatda 'fərdlər' subyekt ola bilərmi?", o: ["Xeyr, yalnız dövlətlər","Bəli, fərdlər müqayisə subyekti ola bilər","Yalnız fərdlərin gəlirləri","Yalnız kollektiv qruplar"], c: 1 },
  { q: "Qaranlıq qalan məqamlara aydınlıq gətirmək üçün hansı yanaşma istifadə edilir?", o: ["Yalnız kəmiyyət","Metodiki qarışıq yanaşma","Heç bir metod","Yalnız arxiv sənədləri"], c: 1 },
  { q: "Uilyams və Peyn yanaşması nəyi inkar edir?", o: ["Metodların vacibliyini","Söhbətin pilot layihəsindən getməsini","Statistik rəqəmləri","Keyfiyyət tədqiqatını"], c: 1 },
  { q: "Eyni məsələnin fərqli kontekstlərindəki müqayisəsinə nə nümunə ola bilər?", o: ["Maşın markalarının müqayisəsi","Qərb cəmiyyəti və Azərbaycanda boşanma səbəbləri","Hava proqnozlarının müqayisəsi","Futbol klublarının büdcəsi"], c: 1 },
  { q: "Müqayisədən öncə nə ilə tanış olmaq gərəkdir?", o: ["Ölkələrin mətbəxi","Statistik məcmular və onların hazırlanma üsulları","Ölkələrin tarixi","Valyuta məzənnələri"], c: 1 },
  { q: "Kriminoloji araşdırmada Türkiyə və Azərbaycan nümunəsi nəyi izah edir?", o: ["Turizm potensialını","Cinayət məcəllələrindəki fərqlərin statistikaya təsirini","İqtisadi artımı","Əhalinin sıxlığını"], c: 1 },
  { q: "Keyfiyyət metodologiyasından istifadənin labüd olduğunu kimlər diqqətə çatdırdı?", o: ["İqtisadçılar","Sosioloq və metodoloqlar","Siyasətçilər","Jurnalistlər"], c: 1 },
  { q: "Metodlararası yanaşmada tədqiqatçı nə edir?", o: ["Yalnız bir kitab oxuyur","Birdən çox məlumat toplama üsulundan istifadə edir","Heç bir üsuldan istifadə etmir","Yalnız anket hazırlayır"], c: 1 },
  { q: "Metoddaxili yanaşmada eyni metodun fərqli formalarda istifadəsi nə deməkdir?", o: ["Metodu hər gün dəyişmək","Eyni metodun fərqli variantlarını tətbiq etmək","Metodu silsilədən çıxarmaq","Başqa elm sahəsinə keçmək"], c: 1 },
  { q: "Toplana bilməyən məlumatları necə əldə etmək olar?", o: ["Digər metodla kompensasiya etməklə","Tədqiqatı yarımçıq saxlamaqla","Məlumatları uydurmaqla","Yalnız müşahidə aparmaqla"], c: 0 },
  { q: "Böyük seçmə toplumu üzərində hansı tədqiqat aparılır?", o: ["Keyfiyyət","Kəmiyyət","Pilot","Fərdi müsahibə"], c: 1 },
  { q: "Kiçik seçmə toplumu üzərində hansı tədqiqat aparılır?", o: ["Kəmiyyət","Keyfiyyət","Siyahıyaalma","Ümumi sorğu"], c: 1 },
  { q: "Təmsilçilik dərəcəsini artırmaq üçün hansı metod əlavə olunur?", o: ["Tarixi metod","Keyfiyyət metoduna kəmiyyət metodologiyası","Riyazi metod","Heç bir metod əlavə olunmur"], c: 1 },
  { q: "Motivləri və hissləri müfəssəl öyrənmək üçün hansı metodologiya uyğundur?", o: ["Keyfiyyət","Kəmiyyət","Statistik","Mexaniki"], c: 0 },
  { q: "Anket sorğusu hansı metodologiya çərçivəsində aparılır?", o: ["Keyfiyyət","Kəmiyyət","Nəzəri","Arxiv"], c: 1 },
  { q: "Respondentlərə öncədən müəyyənləşdirilmiş suallar harada verilir?", o: ["Sərbəst müsahibədə","Fokus qrupda","Anket sorğusunda","Küçə söhbətində"], c: 2 },
  { q: "Müqayisə xarakterli tədqiqat praktikada daha çox nə üçün istifadə edilir?", o: ["Kitab satmaq","Xarici təcrübənin öyrənilməsi","İşçi sayını azaltmaq","Ofis tikmək"], c: 1 },
  { q: "Əhalinin müəyyən məsələyə dair rəyləri müqayisə subyekti ola bilərmi?", o: ["Bəli","Xeyr","Yalnız rəsmi rəylər","Yalnız yazılı rəylər"], c: 0 },
  { q: "XX əsrin ortalarında harada sosioloqlar kəmiyyət metodologiyasının çatışmazlığını bildirdi?", o: ["Asiya və Afrikada","ABŞ və Qərbi Avropada","Avstraliyada","Cənubi Amerikada"], c: 1 },
  { q: "Metodiki qarışıq yanaşmada neçə kombinasiya qeyd olunub?", o: ["1","2","3","5"], c: 2 },
  { q: "'Hazırlıq məqsədi ilə' hansı yanaşmadan istifadə edilir?", o: ["Tək metod","Statistik analiz","Metodiki qarışıq yanaşma","Arxiv araşdırması"], c: 2 },
  { q: "Təqdimat müəllifi kimdir?", o: ["Məmmədli Səbuhi","Əliyev Vüsal","Həsənov Ramil","Vəliyev Murad"], c: 0 },
  { q: "Mövzu 7-nin tam adı nədir?", o: ["Statistik analiz metodları","Müqayisə xarakterli tədqiqat. Çoxsaylı metod yanaşması.","Keyfiyyət tədqiqatının əsasları","Azərbaycanın sosial siyasəti"], c: 1 }
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function pickQuestions() {
  return shuffle(ALL_QUESTIONS).slice(0,10).map(q=>({question:q.q,options:q.o,correct:q.c,time:15}));
}

let gameState = { phase:'lobby', currentQuestion:-1, players:{}, answers:{}, scores:{}, questionTimer:null, timeLeft:15, questions:[] };
let hostWs = null;

function broadcast(data) { const m=JSON.stringify(data); wss.clients.forEach(c=>{if(c.readyState===1)c.send(m);}); }
function sendToHost(data) { if(hostWs&&hostWs.readyState===1)hostWs.send(JSON.stringify(data)); }
function getScoreboard() {
  return Object.entries(gameState.scores).map(([name,s])=>({name,score:s.total,avatar:s.avatar})).sort((a,b)=>b.score-a.score);
}

function startQuestion(index) {
  if(index>=gameState.questions.length){endGame();return;}
  gameState.currentQuestion=index; gameState.phase='question'; gameState.answers={}; gameState.timeLeft=15;
  const q=gameState.questions[index];
  broadcast({type:'question',index,total:gameState.questions.length,question:q.question,options:q.options,time:q.time,timeLeft:15});
  gameState.questionTimer=setInterval(()=>{
    gameState.timeLeft--;
    broadcast({type:'timer',timeLeft:gameState.timeLeft});
    if(gameState.timeLeft<=0){clearInterval(gameState.questionTimer);showAnswerResults();}
  },1000);
}

function showAnswerResults() {
  const q=gameState.questions[gameState.currentQuestion];
  gameState.phase='results';
  Object.entries(gameState.answers).forEach(([name,ans])=>{
    const correct=ans.option===q.correct;
    const pts=correct?100+Math.round((ans.timeLeft/15)*150):-50;
    gameState.scores[name].total=Math.max(0,(gameState.scores[name].total||0)+pts);
    gameState.scores[name].lastPts=pts;
    gameState.scores[name].lastCorrect=correct;
  });
  Object.keys(gameState.players).forEach(name=>{
    if(!gameState.answers[name]){gameState.scores[name].lastPts=0;gameState.scores[name].lastCorrect=null;}
  });
  const answerCounts=[0,0,0,0];
  Object.values(gameState.answers).forEach(a=>answerCounts[a.option]++);
  broadcast({type:'answer_reveal',correct:q.correct,options:q.options,answerCounts,scoreboard:getScoreboard(),
    playerResults:Object.fromEntries(Object.entries(gameState.scores).map(([n,s])=>[n,{lastPts:s.lastPts,lastCorrect:s.lastCorrect,total:s.total}]))
  });
}

function endGame() {
  gameState.phase='final';
  broadcast({type:'game_over',scoreboard:getScoreboard()});
}

wss.on('connection',(ws,req)=>{
  ws.on('message',(raw)=>{
    let msg; try{msg=JSON.parse(raw);}catch{return;}
    if(msg.type==='host_connect'){hostWs=ws;ws.role='host';ws.send(JSON.stringify({type:'host_ok',players:Object.values(gameState.players),phase:gameState.phase}));}
    else if(msg.type==='join'){
      const name=msg.name?.trim().slice(0,20); const avatar=msg.avatar||0;
      if(!name||gameState.phase!=='lobby'){ws.send(JSON.stringify({type:'join_error',reason:gameState.phase!=='lobby'?'Oyun artıq başlayıb!':'Ad lazımdır!'}));return;}
      ws.role='student';ws.playerName=name;
      gameState.players[name]={name,avatar};
      gameState.scores[name]={total:0,avatar,lastPts:0,lastCorrect:null};
      ws.send(JSON.stringify({type:'joined',name,avatar}));
      sendToHost({type:'player_joined',player:{name,avatar},count:Object.keys(gameState.players).length});
    }
    else if(msg.type==='start_game'){if(ws.role!=='host')return;gameState.questions=pickQuestions();startQuestion(0);}
    else if(msg.type==='next_question'){if(ws.role!=='host')return;startQuestion(gameState.currentQuestion+1);}
    else if(msg.type==='answer'){
      const name=ws.playerName;
      if(!name||gameState.phase!=='question'||gameState.answers[name])return;
      gameState.answers[name]={option:msg.option,timeLeft:gameState.timeLeft};
      ws.send(JSON.stringify({type:'answer_received',option:msg.option}));
      sendToHost({type:'answer_count',count:Object.keys(gameState.answers).length,total:Object.keys(gameState.players).length});
      if(Object.keys(gameState.answers).length>=Object.keys(gameState.players).length){clearInterval(gameState.questionTimer);showAnswerResults();}
    }
    else if(msg.type==='reset'){
      if(ws.role!=='host')return;
      clearInterval(gameState.questionTimer);
      gameState={phase:'lobby',currentQuestion:-1,players:{},answers:{},scores:{},questionTimer:null,timeLeft:15,questions:[]};
      broadcast({type:'reset'});
    }
  });
  ws.on('close',()=>{
    // If host disconnects, reset everything so students can rejoin
    if(ws.role==='host'){
      clearInterval(gameState.questionTimer);
      gameState={phase:'lobby',currentQuestion:-1,players:{},answers:{},scores:{},questionTimer:null,timeLeft:15,questions:[]};
      hostWs=null;
      broadcast({type:'reset'});
    }
    // If student disconnects
    if(ws.playerName){
      delete gameState.players[ws.playerName];
      sendToHost({type:'player_left',name:ws.playerName,count:Object.keys(gameState.players).length});
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>console.log(`Server: http://localhost:${PORT}`));
