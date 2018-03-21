class GoFish {
  constructor() {
    this.turn = null;
    this.loby = {};
    this.leader = null;
    this.me = {};
    this.gameStarted = false;
    console.log('SETUP');
  }
  get numberPlayers() {
    return Object.keys(this.loby).length;
  }
  updateGameState(state) {
    for (let i in state) {
      let player = state[i];
      if (player['uid'] == this.me['uid']) {
        this.me = player;
        console.log('NEW CARDS');
        console.log(this.me);
      } 
      else {
        this.loby[player['uid']] = player;
      }
    }
  }
  updateMe(data) {
    this.me = data;
  }
  addUser(user) {
    this.loby[user['uid']] = user;
  }
  userLeft(user) {
    delete this.loby[user];
  }
  setLeader(leader) {
    this.leader = leader;
  }
  amLeader() {
    return this.leader == this.me['uid'];
  }
  startGame() {
    this.gameStarted = true;
  }
}
