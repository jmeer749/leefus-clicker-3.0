// 🔥 Replace with your Supabase info
const SUPABASE_URL = "https://wnvbrglsubeewltmsigy.supabase.co";
const SUPABASE_KEY = "sb_publishable_rHx_KDosdzr-uf4zXJGiDg_dhMEfKg0";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let points = 0;
let perSecond = 0;

const upgrades = [
  { name: "Liam", cost: 10, power: 1, owned: 0 },
  { name: "OD", cost: 50, power: 5, owned: 0 },
  { name: "Dan", cost: 200, power: 20, owned: 0 },
  { name: "Chud", cost: 1000, power: 100, owned: 0 },
  { name: "Beefus", cost: 5000, power: 500, owned: 0 },
  { name: "Oddizy", cost: 20000, power: 2000, owned: 0 },
  { name: "Chud Beefus", cost: 100000, power: 10000, owned: 0 },
  { name: "Personal Butler", cost: 500000, power: 50000, owned: 0 },
  { name: "Max Chud Beefus", cost: 2000000, power: 200000, owned: 0 }
];

// Elements
const loginDiv = document.getElementById("loginDiv");
const gameDiv = document.getElementById("gameDiv");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const pointsEl = document.getElementById("points");
const btn = document.getElementById("leefusBtn");
const container = document.getElementById("upgradeContainer");
const leaderboardList = document.getElementById("leaderboardList");

// LOGIN / SIGNUP
signupBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if(error) alert(error.message);
};
loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });
  if(error) alert(error.message);
};
logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
};

// AUTH STATE CHANGE
supabase.auth.onAuthStateChange((event, session) => {
  const user = session?.user;
  if(user){
    loginDiv.style.display = "none";
    gameDiv.style.display = "block";
    userInfo.textContent = user.email;
    loadData();
    loadLeaderboard();
  } else {
    loginDiv.style.display = "block";
    gameDiv.style.display = "none";
  }
});

// CLICKER
btn.onclick = () => {
  points++;
  updateUI();
  saveData();
};

// POINTS PER SECOND
setInterval(() => {
  points += perSecond;
  updateUI();
  saveData();
}, 1000);

// UPGRADES
function renderUpgrades(){
  container.innerHTML = "";
  upgrades.forEach((u,i)=>{
    const b = document.createElement("button");
    b.textContent = `${u.name} - ${u.cost} (Owned: ${u.owned})`;
    b.onclick = () => buyUpgrade(i);
    container.appendChild(b);
  });
}
function buyUpgrade(i){
  const u = upgrades[i];
  if(points >= u.cost){
    points -= u.cost;
    u.owned++;
    perSecond += u.power;
    u.cost = Math.floor(u.cost*1.5);
    updateUI();
    renderUpgrades();
    saveData();
  }
}

// SAVE / LOAD
async function saveData(){
  const user = supabase.auth.getUser().data?.user;
  if(!user) return;
  await supabase.from('players').upsert({
    id: user.id,
    email: user.email,
    points: points,
    upgrades: upgrades
  });
}

async function loadData(){
  const user = supabase.auth.getUser().data?.user;
  if(!user) return;
  const { data, error } = await supabase.from('players').select('*').eq('id', user.id).single();
  if(data){
    points = data.points;
    if(data.upgrades) upgrades.forEach((u,i)=>u.owned=data.upgrades[i].owned);
  }
  renderUpgrades();
  updateUI();
}

// LEADERBOARD
async function loadLeaderboard(){
  const { data } = await supabase.from('players').select('*').order('points',{ascending:false}).limit(10);
  leaderboardList.innerHTML = "";
  if(data){
    data.forEach(d=>{
      const li = document.createElement("li");
      li.textContent = `${d.points} - ${d.email}`;
      leaderboardList.appendChild(li);
    });
  }
}

// UI
function updateUI(){
  pointsEl.textContent = points;
}
renderUpgrades();
updateUI();
