var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('ship', 'assets/hero_origin.png');
  this.load.image('otherPlayer', 'assets/hero_origin.png');
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();
}


function update() {
  if (this.ship) {
    if (this.cursors.left.isDown) {
      this.ship.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.ship.setVelocityX(160);
    } else {
      this.ship.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.ship.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.ship.setVelocityY(160);
    } else {
      this.ship.setVelocityY(0);
    }

    // if (this.cursors.up.isDown && this.ship.body.touching.down){
    //   this.ship.setVelocityY(-330);
    // }

      // this.physics.world.wrap(this.ship, 5);

  }
}

// Add me
function addPlayer(self, playerInfo) {
  console.log('adding player');
  self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.8).setDisplaySize(40, 60);
  if (playerInfo.team === 'blue') {
    self.ship.setTint(0x0000ff);
  } else {
    self.ship.setTint(0xff0000);
  }
  self.ship.setDrag(100);
  self.ship.setAngularDrag(100);
  self.ship.setMaxVelocity(200);
}

// Distinct others from me
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(40, 60);
  if (playerInfo.team === 'blue') {
    otherPlayer.setTint(0x0000ff);
  } else {
    otherPlayer.setTint(0xff0000);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
