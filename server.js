// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;


const USER_FILE = "C:/Users/W11/Desktop/UMABET/user_db/users.json";


const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);


["bets.json", "rounds.json"].forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf8");
});


if (!fs.existsSync(USER_FILE)) {
    fs.mkdirSync(path.dirname(USER_FILE), { recursive: true });
    fs.writeFileSync(USER_FILE, "[]", "utf8");
}

app.use(express.json());
app.use(express.static("public"));


function readJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath));
}
function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


function readUsers() {
    return readJSON(USER_FILE);
}
function writeUsers(users) {
    writeJSON(USER_FILE, users);
}


app.post("/api/signup", (req, res) => {
    const users = readUsers();
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }
    users.push({ username, password, points: 1000 });
    writeUsers(users);
    res.json({ message: "회원가입 완료!" });
});


app.post("/api/login", (req, res) => {
    const users = readUsers();
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: "로그인 실패" });
    res.json({ message: "로그인 성공", user });
});


app.get("/api/round", (req, res) => {
    const rounds = readJSON(path.join(DATA_DIR, "rounds.json"));
    res.json(rounds[rounds.length - 1] || {});
});


app.post("/api/bet", (req, res) => {
    const { username, team, points } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user || user.points < points) return res.status(400).json({ message: "포인트 부족" });

    user.points -= points;
    writeUsers(users);

    const bets = readJSON(path.join(DATA_DIR, "bets.json"));
    const rounds = readJSON(path.join(DATA_DIR, "rounds.json"));
    const currentRound = rounds[rounds.length - 1];
    bets.push({ username, round: currentRound.round, team, points });
    writeJSON(path.join(DATA_DIR, "bets.json"), bets);

    res.json({ message: "베팅 완료!" });
});


app.post("/api/admin/round", (req, res) => {
    const { round } = req.body;
    const rounds = readJSON(path.join(DATA_DIR, "rounds.json"));
    rounds.push({ round, bettingOpen: false, winner: null });
    writeJSON(path.join(DATA_DIR, "rounds.json"), rounds);
    res.json({ message: "라운드 시작됨" });
});


app.post("/api/admin/betting", (req, res) => {
    const { open } = req.body;
    const rounds = readJSON(path.join(DATA_DIR, "rounds.json"));
    if (rounds.length === 0) return res.status(400).json({ message: "라운드 없음" });
    rounds[rounds.length - 1].bettingOpen = open;
    writeJSON(path.join(DATA_DIR, "rounds.json"), rounds);
    res.json({ message: "베팅 상태 변경됨" });
});


app.post("/api/admin/winner", (req, res) => {
    const { winner } = req.body;
    const rounds = readJSON(path.join(DATA_DIR, "rounds.json"));
    const currentRound = rounds[rounds.length - 1];
    if (!currentRound || !winner) return res.status(400).json({ message: "라운드 없음" });

    currentRound.winner = winner;
    writeJSON(path.join(DATA_DIR, "rounds.json"), rounds);

    const bets = readJSON(path.join(DATA_DIR, "bets.json")).filter(b => b.round === currentRound.round);
    const users = readUsers();

    const totalPoints = bets.reduce((sum, b) => sum + b.points, 0);
    const winnerPoints = bets.filter(b => b.team === winner).reduce((sum, b) => sum + b.points, 0);

    if (winnerPoints > 0) {
        bets.forEach(bet => {
            if (bet.team === winner) {
                const payout = Math.floor((bet.points * totalPoints) / winnerPoints);
                const user = users.find(u => u.username === bet.username);
                if (user) user.points += payout;
            }
        });
        writeUsers(users);
    }

    res.json({ message: "승리팀 처리 완료" });
});


app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
