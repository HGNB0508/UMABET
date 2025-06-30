// public/script.js

let currentUser = null;

window.onload = () => {
  const savedUser = localStorage.getItem("umabet_user");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainUI();
    loadRound();
    setInterval(loadRound, 1000);
  }
};

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then(res => {
      if (!res.ok) throw new Error("로그인 실패");
      return res.json();
    })
    .then(data => {
      alert(data.message);
      currentUser = data.user;
      localStorage.setItem("umabet_user", JSON.stringify(currentUser));
      showMainUI();
      loadRound();
      setInterval(loadRound, 1000);
    })
    .catch(err => alert(err.message));
}

function showMainUI() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("main").style.display = "block";
  document.getElementById("user-name").innerText = currentUser.username;
  document.getElementById("user-points").innerText = currentUser.points;
}

function loadRound() {
  fetch("/api/round")
    .then(res => res.json())
    .then(round => {
      document.getElementById("current-round").innerText = round.round || "없음";
      document.getElementById("betting-status").innerText = round.bettingOpen ? "가능" : "불가능";
    });
}

function placeBet() {
  const team = document.getElementById("team-select").value;
  const points = parseInt(document.getElementById("bet-amount").value, 10);

  if (isNaN(points) || points <= 0) return alert("올바른 포인트를 입력하세요.");

  fetch("/api/bet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: currentUser.username, team, points }),
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      currentUser.points -= points;
      document.getElementById("user-points").innerText = currentUser.points;
      localStorage.setItem("umabet_user", JSON.stringify(currentUser)); // 포인트 업데이트 반영
    })
    .catch(err => alert("베팅 실패: " + err.message));
}

function logout() {
  localStorage.removeItem("umabet_user");
  location.reload();
}

function loadRound() {
  fetch("/api/round")
    .then(res => res.json())
    .then(round => {
      document.getElementById("current-round").innerText = round.round || "없음";
      document.getElementById("betting-status").innerText = round.bettingOpen ? "가능" : "불가능";
    });

  fetch("/api/user/total-bets")
    .then(res => res.json())
    .then(data => {
      document.getElementById("total-bets").innerText = data.total;
    });
}


app.get("/api/user/total-bets", (req, res) => {
  const bets = readJSON(path.join(DATA_DIR, "bets.json"));
  const rounds = readJSON(path.join(DATA_DIR, "rounds.json"));
  const currentRound = rounds[rounds.length - 1];
  if (!currentRound) return res.json({ total: 0 });

  const total = bets
    .filter(b => b.round === currentRound.round)
    .reduce((sum, b) => sum + b.points, 0);

  res.json({ total });
});


///  @@@@@@@@@@@@@@@@-#@@@@@@@@@@@@#!;;@$=$@@@*@@@@@@@@@@@@@@@@@@
///  @@@@@@@@@@@@@@@@..$@@@@@@@@@@#!!*#,!:;!!$;*@@$@@@@@@@@@@@@@@
///  @@@@@@@@@@@@@@@@...:@@@@@@@@#!::@ !.:;!-=$!!;*#@@@@@@@@@@-@@
///  @@@@@@@@@@@@@@@@....,@$@@@@@@*!!@,-!-~! *$!!!!!:=@@@@#@!.-#@
///  @@@@@@@@@@@@@@:=*.....##@@@@@*!!*@=!;  ;#=:~-;!!!:#$@$...*@@
///  @@@@@@@@@@@@$=::$#,....!@@@@#######@@@@@*!!!!!:-!!@@.....@@@
///  @@@@@@@@@@@@@:::::#@.:*,...............-@@$!!!!!!@-.....*@@@
///  @@@@@@@@@@@@#@##=*@;,......................,!#!*,.....-$@@@@
///  @@@@@@@@@@@@;@$*@-............................~:--,:$@@#@@@@
///  @@@@@@@@@@@#$:#;   ....  ....  ...................!@@@@@@@@@
///  @@@@@@@@@@@@@@,....,.........   .   ..........~...#*:@@@@@@@
///  @@@@@@@@@@@@@.....:~...,-........   ..... ..  .~...@$#@@@@@@
///  @@@@@@@@@@@@-....::~...*;...................   @.. $*#@@@@@@
///  @@@@@@@@@@=@.....@::..#*--..........-:....#....~~. ;$@$@@@@@
///  @@@@@@@@@@@!@@,.@.,=..@*,.;$........=##-..#:...-#...#=:@@@@@
///  @@@@@@@@@@@@@~!~-  ,,@~ -..........@.$...~!@...,@...@*@!@@@@
///  @@@@@@@@@@@@!-@            ~!*~...,;~:...! @...-@...@!@.@@@@
///  @@@@@@@@@@@@-$-~!#@@;: :~        ~; ~-;..= @,..~;:..@!@.@@@@
///  @@@@@@@@@@##-#     .!@@@:               :    *=@$~$=@!@.=;@@
///  @@@@@@@@@@@~$,   *#;...$@@*        .:=:  ,,,-,  @#--:@@.*$@@
///  @@@@@@@@@@@@#   @:.......:-        ;@@@@@@@.    @----@@.!#@@
///  @@@@@@@@@@     .@.........#       ~#*......,@  :-----@#.*$@@
///  @@@=@# @@@      @,.......=;       .=.........# #-!---@-.=@@@
///  @@!.  -@=@-      *$*--!=#-         @........;: #-*---@,.@@@@
///  @@      @@@;                       .#;~,~!=#,  ;-*---@$~@@@@
///  #*   ~  @@@#@~             $. ,       -~.      .!-~-#*!@@@@@
///  @@@@@~  ;$@$::##-          .$=*@@*             -@:*#;;!$@@@@
///  @@@@@    :@@=@@@,#@#,.                      .#@**@#---#!@@@@
///  @@@@@       # .@     $@@@@#-          -$@@@=!!@@~---..@@@@@@
///  @@@@#@      # ,~.   ,$.  $ ..:***=*=*=$$#@@@*:------,.@@@@@@
///  @@@@@$@,    = ,,$=*~.#.  # =@* :,@*-        $;-------.,#@@@@
///  @@@@@@@@@!. =-,@   .;@,  ,$  !#!             @--------.#@@@@
///  @@@@@@@@##:*=;@.      $!  # ~$!!,            @:-------,.!@@@
///  @@@@@@@@@,..-#~$       ~$@@@=;. @            @@------:-,..-*
///  @@@@@@@@@...-;=#@,           @ .@           .$!!------:=~...
///  @@@@@@@@@...-----~@,         @ ,;,          @,,@--------@@@@
///  @@@@@@@@@..,------@-@-       !-. #         @-,,,@----:---~@@
///  @@@@@@@@@..=------:@-~@=     .* .@       -@,,,,,,@:--~#!----
///  @@@@@@@@@!.$-:------!@******@#@#@=@*-  -$=,,,,,,,,@----=@$=@