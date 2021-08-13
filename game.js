var locale = {
  getLocale: navigator.mozL10n.get
};

Phaser.Plugin.Navigator = function (parent, game) {
  Phaser.Plugin.call(this, parent, game);
};
Phaser.Plugin.Navigator.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Navigator.prototype.constructor = Phaser.Plugin.SamplePlugin;

Phaser.Plugin.Navigator.prototype.stack = [];

Phaser.Plugin.Navigator.prototype.init = function () {
  game.softkey = game.plugins.add(Phaser.Plugin.Softkey);
};

Phaser.Plugin.Navigator.prototype.register = function (arg) {
  this.stack.push(Object.assign({}, game.softkey.getLastConfig()));

  this.group = game.softkey.config({ style: arg.style, label: arg.label });
  game.softkey.listener(arg.action);
};

Phaser.Plugin.Navigator.prototype.setLastConfig = function () {
  var temp = this.stack.pop();
  this.group = game.softkey.config({ style: temp.style, label: temp.label });
  game.softkey.listener(temp.action);
};

Phaser.Plugin.Navigator.prototype.stackPopAll = function () {
  this.stack = [];
};

Phaser.Plugin.Navigator.prototype.destroy = function () {
  this.group.kill();
};

Phaser.Plugin.Softkey = function (parent, game) {
  Phaser.Plugin.call(this, parent, game);
};
Phaser.Plugin.Softkey.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Softkey.prototype.constructor = Phaser.Plugin.SamplePlugin;

Phaser.Plugin.Softkey.prototype.skGroup = null;
Phaser.Plugin.Softkey.prototype.lastConfig = {};
Phaser.Plugin.Softkey.prototype.defaultHandler = {};

Phaser.Plugin.Softkey.prototype.listener = function (arg) {
  self = this;

  this.lastConfig.action = arg;

  window.onkeydown = function (e) {
    self._keyPress(e, arg);
  };
};

Phaser.Plugin.Softkey.prototype.config = function (arg) {
  if (!arg.label) {
    return;
  }

  if (!arg.style) {
    arg.style = { font: '16px Arial', fill: '#ffffff' };
  }

  if(this.skGroup){
    this.skGroup.removeAll();
  }

  this.skGroup = game.add.group();
  this.skGroup.fixedToCamera = true;
  this.skGroup.cameraOffset.setTo(-game.camera.x, -game.camera.y);

  this.lastConfig.label = arg.label;
  this.lastConfig.style = arg.style;

  this.centerX = game.camera.x + game.camera.width / 2;
  this.portionLenght = Math.round( (game.camera.width * 0.90)/3 );

  if (undefined !== arg.label.lsk) {
    this.lsk = game.add.text(game.camera.x + 10, game.camera.y + (game.camera.height - 12), arg.label.lsk, arg.style);
    this.lsk.x = game.camera.x + 10 + this.lsk.width / 2;
    this.lsk.anchor.setTo(0.5);
    this.skGroup.add(this.lsk);
    // if (this.portionLenght < this.lsk.width) {
    //   ellipsizeText(this.lsk, this.portionLenght, 1);
    // }
  }
  if (undefined !== arg.label.csk) {
    this.csk = game.add.text(this.centerX, game.camera.y + (game.camera.height - 12), arg.label.csk, arg.style);
    this.csk.anchor.setTo(0.5);
    this.skGroup.add(this.csk);
    if (this.portionLenght < this.csk.width) {
      ellipsizeText(this.csk, this.portionLenght);
    }
  }

  if (undefined !== arg.label.rsk) {
    this.rsk = game.add.text(190, game.camera.y + (game.camera.height - 12), arg.label.rsk, arg.style);
    this.rsk.x = game.camera.x + (game.camera.width - 10) - this.rsk.width / 2;
    this.rsk.anchor.setTo(0.5);
    this.skGroup.add(this.rsk);
    if (this.portionLenght < this.rsk.width) {
      ellipsizeText(this.rsk, this.portionLenght, 3);
    }
  }

  return this.skGroup;
};

Phaser.Plugin.Softkey.prototype.getLastConfig = function () {
  return this.lastConfig;
};

function ellipsizeText(softkey, portionLenght, number) {
  var labelLenght = softkey.text.length;

  this.fixLenght = Math.floor((portionLenght * labelLenght) / softkey.width) -2;

  this.newText = softkey.text.substr(0, this.fixLenght) + '...';

  softkey.text = this.newText;

  if(1 === number) {
    softkey.x = game.camera.x + 10 + softkey.width / 2;
  }

  if(3 === number) {
    softkey.x = game.camera.x + (game.camera.width - 10) - softkey.width / 2;
  }
}

Phaser.Plugin.Softkey.prototype._keyPress = function (e, arg) {
  var keyHandler = null;
  var key = this._debug(e);
  switch (key) {
    case 'SoftLeft':
      if(arg.softLeft){
        keyHandler = arg.softLeft;
        e.preventDefault();
      }
      break;
    case 'Enter':
      if(arg.enter){
        keyHandler = arg.enter;
        e.preventDefault();
      }
      break;
    case 'MicrophoneToggle':
      e.preventDefault();
      break;
    case 'SoftRight':
      if(arg.softRight){
        keyHandler = arg.softRight;
        e.preventDefault();
      }
      break;
    case 'Backspace':
      if(arg.backspace){
        keyHandler = function () {
          e.preventDefault();
          e.stopImmediatePropagation();
          arg.backspace();
        }
      }
      break;
    case 'EndCall':
      if(arg.endCall){
        keyHandler = function () {
          e.preventDefault();
          e.stopImmediatePropagation();
          arg.endCall();
        }
      }
      break;
    default:
      if(arg[key]) {
        keyHandler = arg[key];
      }
      break;
  }

  if(!keyHandler)
    keyHandler = this.defaultHandler[key];

  keyHandler && keyHandler();
};

Phaser.Plugin.Softkey.prototype._debug = function (evt) {
  if (game.custom && game.custom.debug) {
    console.warn("[Phaser.Plugin.Softkey] in debug mode!", evt.key);
    if (evt.shiftKey) {
      switch (evt.key) {
        case "ArrowLeft":
          return "SoftLeft";
        case "ArrowRight":
          return "SoftRight";
        /* istanbul ignore next */
        default:
          break;
      }
    }
  }
  return evt.key;
};

var score = {
  score: 0,
  softkey: null,
  locale: null,
  preload: function () {
    game.load.image('bg', 'assets/bg-home.png');
  },
  create: function () {
    game.add.tileSprite(0, 0, 240, 320, 'bg');

    this.renderText();
    this.bind();
  },
  bind: function () {
    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('home')
      },
      action: {
        softLeft: function () {
          game.state.start('menu');
        }
      }
    });
    game.navigator.group.children.forEach(function (item) {
      item.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    });
  },
  renderText: function () {
    var style = Object.assign({}, game.custom.fontStyle);
    style.fontSize = "24px";
    var title = game.add.text(game.world.centerX, 100, locale.getLocale('bestscore'), style);
    title.anchor.set(0.5);
    title.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    style.fontSize = "50px";
    var score = game.add.text(game.world.centerX, 170, this.loadScore(),style);
    score.anchor.set(0.5);


  },
  loadScore: function () {
    var score = localStorage.getItem('highscore');
    if (null !== score) {
      return this.formatScore(score, 4);
    } else {
      return this.formatScore(0, 4);
    }
  },
  formatScore: function (num, size) {
    var s = num + "";
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  }
};

var options = {
  listenerUp: null,
  listenerDown: null,
  focus: null,
  focus2: null,
  soundOn: null,
  soundOff: null,
  vibrationOn: null,
  vibrationOff: null,
  index: 0,
  softkey: null,
  locale: null,
  preload: function () {
    game.load.image('bg', 'assets/bg-home.png');
    game.load.image('focus', 'assets/focus-1.png');
    game.load.image('on', 'assets/select-on.png');
    game.load.image('off', 'assets/select-off.png');
  },
  create: function () {
    this.index = 0;
    game.add.tileSprite(0, 0, 240, 320, 'bg');
    this.focus = game.add.sprite(game.world.centerX, 190, 'focus');
    this.focus.anchor.setTo(0.5);
    this.focus.visible = true;
    this.focus2 = game.add.sprite(game.world.centerX, 228, 'focus');
    this.focus2.anchor.setTo(0.5);
    this.focus2.visible = false;

    this.soundOn = game.add.tileSprite(180, 180, 28, 15, 'on');
    this.soundOn.visible = false;
    this.soundOff = game.add.tileSprite(180, 180, 28, 15, 'off');
    this.soundOff.visible = false;

    this.vibrationOn = game.add.tileSprite(180, 220, 28, 15, 'on');
    this.vibrationOn.visible = false;
    this.vibrationOff = game.add.tileSprite(180, 220, 28, 15, 'off');
    this.vibrationOff.visible = false;

    this.renderText();
    this.bind();
    this.loadSound()
    this.loadVibration();
  },
  bind: function () {
    var self = this;
    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('home'),
        rsk: locale.getLocale('about')
      },
      action: {
        softLeft: function () {
          game.state.start('menu');
        },
        enter: function () {
          self.select();
        },
        softRight: function () {
          game.state.start('about');
        }
      }
    });
    var skb = game.navigator.group;
    skb.children.forEach(function (item) {
      item.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    });

    this.listenerUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.listenerUp.onDown.add(this.up, this);

    this.listenerDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.listenerDown.onDown.add(this.down, this);
  },
  renderText: function () {
    var style = Object.assign({}, game.custom.fontStyle);
    style.fontSize = "24px";
    var title = game.add.text(game.world.centerX, 100, locale.getLocale('options'), style);
    title.anchor.set(0.5);
    title.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    var sound = game.add.text(43, 180, locale.getLocale('sound'), game.custom.fontStyle);
    sound.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    var vibration = game.add.text(43, 220, locale.getLocale('vibration'), game.custom.fontStyle);
    vibration.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
  },
  select: function () {
    switch (this.index) {
      case 0:
        this.saveData('sound', (!this.soundOn.visible).toString());
        this.loadSound();
        break;
      case 1:
        this.saveData('vibration', (!this.vibrationOn.visible).toString());
        this.loadVibration();
        break;
    }
  },
  up: function () {
    if (this.index === 1) {
      --this.index;
      this.focus.visible = true;
      this.focus2.visible = false;
    }
  },
  down: function () {
    if (this.index < 1) {
      ++this.index;
      this.focus.visible = false;
      this.focus2.visible = true;
    }
  },
  saveData: function (key, value) {
    localStorage.setItem(key, value);
  },
  loadData: function (key) {
    var value = localStorage.getItem(key);

    if (null === value || undefined === value) {
      this.saveData(key, 'true');
      return 'true';
    }
    if (value) {
      return value;
    }
  },
  loadSound: function () {
    var sound = this.loadData('sound');
    this.soundOn.visible = ('true' === sound);
    this.soundOff.visible = ('false' === sound);
    return sound;
  },
  loadVibration: function () {
    var vibration = this.loadData('vibration');
    this.vibrationOn.visible = ('true' === vibration);
    this.vibrationOff.visible = ('false' === vibration);
    return vibration;
  }
};

var about = {
  softkey: null,
  locale: null,
  preload: function () {
    game.load.image('bg', 'assets/bg-home.png');
    game.load.image('logo', 'assets/kaios-logo.png');
  },
  create: function () {
    game.add.tileSprite(0, 0, 240, 320, 'bg');

    this.renderText();
    this.bind();
  },
  bind: function () {
    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('home')
      },
      action: {
        softLeft: function () {
          game.state.start('menu');
        }
      }
    });
    game.navigator.group.children.forEach(function (item) {
      item.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    });
  },
  renderText: function () {
    var style = Object.assign({}, game.custom.fontStyle);
    style.fontSize = 24;
    var titulo = game.add.text(game.world.centerX, 70, locale.getLocale('about'), style);
    titulo.anchor.set(0.5);
    style.align = "center";
    style.fontSize = 16;

    var texto = game.add.text(titulo.x, titulo.y + 60, locale.getLocale('aboutText'), style);
    texto.anchor.set(0.5);
    texto.wordWrap = true;
    texto.wordWrapWidth = 200;

    var logo = game.add.sprite(texto.x, texto.y + 70, 'logo');
    logo.anchor.setTo(0.5);
  }
};

var Render = {};//Need to use renderFiles
var MainGame = {
  tileSize: 49,
  // colors to tint tiles according to their value
  colors: {
    2: 'tile-2.png',
    4: 'tile-4.png',
    8: 'tile-8.png',
    16: 'tile-16.png',
    32: 'tile-32.png',
    64: 'tile-64.png',
    128: 'tile-128.png',
    256: 'tile-256.png',
    512: 'tile-512.png',
    1024: 'tile-1024.png',
    2048: 'tile-2048.png',
    4096: 'tile-4096.png',
    8192: 'tile-8192.png',
    16384: 'tile-16384.png',
    32768: 'tile-32768.png',
    65536: 'tile-65536.png'
  },
  // at the beginning of the game, the player cannot move
  canMove: false,
  didWin: false,
  playHitSound: false,
  isPaused: false,
  isWin: false,
  isLose: false,
  locale: null,
  preload: function () {
    game.load.audio('hitSound', 'assets/sfx/hit.wav');
    //game
    game.load.image('logo', 'assets/logo-2048.png');
    game.load.image('bg', 'assets/bg-1.png');
    game.load.image('bg-options', 'assets/bg-3.png');
    game.load.image('bg-youlose', 'assets/bg-5.png');
    game.load.image('bg-youwin', 'assets/bg-4.png');
    game.load.image('bggame', 'assets/bg-game.png');

    game.load.image('youlose', 'assets/game-over_msg-2.png');
    game.load.image('youwin', 'assets/game-over_msg-1.png');
    //dialog confirm
    game.load.image('bg-dialog', 'assets/dialog.png');

    //Options
    game.load.image('focus', 'assets/focus-1.png');
    game.load.image('on', 'assets/select-on.png');
    game.load.image('off', 'assets/select-off.png');

    for (var item in this.colors) {
      game.load.image('tile-' + item, 'assets/tiles/tile-' + item + '.png');
    };
  },
  create: function () {
    this.isPaused = false;
    this.didWin = false;
    this.hitSound = game.add.audio('hitSound');
    this.hitSound.volume = 5;

    // game array, starts with all cells to zero
    this.fieldArray = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    this.currentScore = 0;
    this.movimentScore = 0;
    this.brickScore = 0;
    this.scoreText = 0;
    this.highScore = localStorage.getItem("highscore") || 0;
    game.add.tileSprite(0, 0, 240, 320, 'bg');
    game.add.image(19, 77, 'bggame');

    Render.Score(this);
    this.bind();

    // sprite group declaration
    this.tileSprites = game.add.group();
    // at the beginning of the game we add two "2"
    this.addTile();
    this.addTile();
    this.tileSprites.position.x = 22;
    this.tileSprites.position.y = 80;

    // document.getElementById("adscontainer").style.display = 'block';

  },
  update: function () {

  },

  optionPause: function () {
    Render.Options.show(this);
  },

  bind: function () {
    var self = this;
    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('restart'),
        rsk: locale.getLocale('options')
      },
      action: {
        softLeft: function () {
          game.ads.nextState = 'MainGame';
          Render.Restart.show();
        },
        softRight: function () {
          self.optionPause();
        },
        ArrowUp: function () {
          self.moveUp();
        },
        ArrowDown: function () {
          self.moveDown();
        },
        ArrowLeft: function () {
          self.moveLeft();
        },
        ArrowRight: function () {
          self.moveRight();
        },
        2: function () {
          self.moveUp();
        },
        8: function () {
          self.moveDown();
        },
        4: function () {
          self.moveLeft();
        },
        6: function () {
          self.moveRight();
        },
        0: function () {
          self.optionPause();
        }
      }
    });
    game.navigator.group.children.forEach(function (item) {
      item.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    });
  },

  addTile: function () {
    //Get the value of the tile to be added either 2 or 4
    var value = Math.random() < 0.9 ? 2 : 4;
    // choosing an empty tile in the field
    do {
      var randomValue = Math.floor(Math.random() * 16);
    } while (this.fieldArray[randomValue] != 0)

    this.fieldArray[randomValue] = value;

    var tile = game.add.sprite(this.toCol(randomValue) * this.tileSize, this.toRow(randomValue) * this.tileSize, 'tile-' + value);
    // tile.tint = this.colors[value];
    tile.scale.setTo(0.99);
    tile.pos = randomValue;
    tile.alpha = 0;
    var style = Object.assign({}, game.custom.fontStyle);
    style.fontColor = "#FFFFFF";
    style.fontSize = 14;

    var text = game.add.text(this.tileSize / 2, this.tileSize / 2, value, style);
    text.anchor.set(0.5);
    tile.addChild(text);
    this.tileSprites.add(tile);
    var fadeIn = game.add.tween(tile);
    fadeIn.to({ alpha: 1 }, 250);
    fadeIn.onComplete.add(function () {
      this.updateNumbers();
      this.canMove = true;
      this.checkYouLose();
      this.checkYouWin();
    }.bind(this));
    fadeIn.start();
  },
  toRow: function (n) {
    // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE ROW
    return Math.floor(n / 4);
  },
  toCol: function (n) {
    // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE COLUMN
    return n % 4;
  },
  // THIS FUNCTION UPDATES THE NUMBER AND COLOR IN EACH TILE
  updateNumbers: function () {
    this.tileSprites.forEach(function (item) {
      var value = this.fieldArray[item.pos];
      item.getChildAt(0).text = value;
      item.loadTexture('tile-' + value, 0);
    }.bind(this));
    this.brickScore = Math.max.apply(Math, this.fieldArray);
  },
  endMove: function (m) {
    if (m) {
      this.addTile();
    }
    else {
      this.canMove = true;
    }
    this.playHitSound = false;
    this.currentScore += this.movimentScore;
    this.scoreText.text = this.currentScore;
  },

  moveTile: function (tile, from, to, remove) {
    // FUNCTION TO MOVE A TILE
    // first, we update the array with new values
    this.fieldArray[to] = this.fieldArray[from];
    this.fieldArray[from] = 0;
    tile.pos = to;
    // then we create a tween
    var movement = game.add.tween(tile);
    movement.to({ x: this.tileSize * (this.toCol(to)), y: this.tileSize * (this.toRow(to)) }, 150);
    // let the tween begin!
    movement.start();
    if (remove) {
      var mr = game.add.tween(tile);
      mr.to({ x: this.tileSize * (this.toCol(to)), y: this.tileSize * (this.toRow(to)) }, 150);
      // let the tween begin!
      // if the tile has to be removed, it means the destination tile must be multiplied by 2
      this.fieldArray[to] *= 2;
      // at the end of the tween we must destroy the tile
      if (!this.playHitSound) {
        this.playHitSound = true;
        mr.onComplete.add(function () {
          tile.destroy();
          if (Render.Options.loadData("sound")) {
            this.hitSound.play();
          }
          if (Render.Options.loadData("vibration") && navigator.vibrate) {
            navigator.vibrate(50);
          }
        }.bind(this));
      } else {
        mr.onComplete.add(function () {
          tile.destroy();
        }.bind(this));
      }
      mr.start();
    }

  },
  moveUp: function () {
    // MOVING TILES UP - SAME PRINCIPLES AS BEFORE
    if (this.canMove) {
      this.canMove = false;
      var moved = false;
      this.tileSprites.sort("y", Phaser.Group.SORT_ASCENDING);
      this.tileSprites.forEach(function (item) {
        var row = this.toRow(item.pos);
        var col = this.toCol(item.pos);
        if (row > 0) {
          var remove = false;
          for (i = row - 1; i >= 0; i--) {
            if (this.fieldArray[i * 4 + col] != 0) {
              if (this.fieldArray[i * 4 + col] == this.fieldArray[row * 4 + col]) {
                this.movimentScore += (this.fieldArray[i * 4 + col] + this.fieldArray[row * 4 + col]);
                remove = true;
                i--;
              }
              break
            }
          }
          if (row != i + 1) {
            moved = true;
            this.moveTile(item, row * 4 + col, (i + 1) * 4 + col, remove);
          }
        }
      }.bind(this));
      this.endMove(moved);
    }
  },
  moveRight: function () {
    // MOVING TILES RIGHT - SAME PRINCIPLES AS BEFORE
    if (this.canMove) {
      this.canMove = false;
      var moved = false;
      this.tileSprites.sort("x", Phaser.Group.SORT_DESCENDING);
      this.tileSprites.forEach(function (item) {
        var row = this.toRow(item.pos);
        var col = this.toCol(item.pos);
        if (col < 3) {
          var remove = false;
          for (i = col + 1; i <= 3; i++) {
            if (this.fieldArray[row * 4 + i] != 0) {
              if (this.fieldArray[row * 4 + i] == this.fieldArray[row * 4 + col]) {
                this.movimentScore += (this.fieldArray[row * 4 + i] + this.fieldArray[row * 4 + col]);
                remove = true;
                i++;
              }
              break
            }
          }
          if (col != i - 1) {
            moved = true;
            this.moveTile(item, row * 4 + col, row * 4 + i - 1, remove);
          }
        }
      }.bind(this));
      this.endMove(moved);
    }
  },
  // MOVING TILES DOWN - SAME PRINCIPLES AS BEFORE
  moveDown: function () {
    if (this.canMove) {
      this.canMove = false;
      var moved = false;
      this.tileSprites.sort("y", Phaser.Group.SORT_DESCENDING);
      this.tileSprites.forEach(function (item) {
        var row = this.toRow(item.pos);
        var col = this.toCol(item.pos);
        if (row < 3) {
          var remove = false;
          for (i = row + 1; i <= 3; i++) {
            if (this.fieldArray[i * 4 + col] != 0) {
              if (this.fieldArray[i * 4 + col] == this.fieldArray[row * 4 + col]) {
                this.movimentScore += (this.fieldArray[i * 4 + col] + this.fieldArray[row * 4 + col]);
                remove = true;
                i++;
              }
              break
            }
          }
          if (row != i - 1) {
            moved = true;
            this.moveTile(item, row * 4 + col, (i - 1) * 4 + col, remove);
          }
        }
      }.bind(this));
      this.endMove(moved);
    }
  },
  moveLeft: function () {
    // MOVING TILES LEFT
    // Is the player allowed to move?
    if (this.canMove) {
      // the player can move, let's set "canMove" to false to prevent moving again until the move process is done
      this.canMove = false;
      // keeping track if the player moved, i.e. if it's a legal move
      var moved = false;
      // look how I can sort a group ordering it by a property
      this.tileSprites.sort("x", Phaser.Group.SORT_ASCENDING);
      // looping through each element in the group
      this.tileSprites.forEach(function (item) {
        // getting row and column starting from a one-dimensional array
        var row = this.toRow(item.pos);
        var col = this.toCol(item.pos);
        // checking if we aren't already on the leftmost column (the tile can't move)
        if (col > 0) {
          // setting a "remove" flag to false. Sometimes you have to remove tiles, when two merge into one
          var remove = false;
          // looping from column position back to the leftmost column
          for (i = col - 1; i >= 0; i--) {
            // if we find a tile which is not empty, our search is about to end...
            if (this.fieldArray[row * 4 + i] != 0) {
              // ...we just have to see if the tile we are landing on has the same value of the tile we are moving
              if (this.fieldArray[row * 4 + i] == this.fieldArray[row * 4 + col]) {
                // in this case the current tile will be removed
                this.movimentScore += (this.fieldArray[row * 4 + i] + this.fieldArray[row * 4 + col]);
                remove = true;
                i--;
              }
              break;
            }
          }
          // if we can actually move...
          if (col != i + 1) {
            // set moved to true
            moved = true;
            // moving the tile "item" from row*4+col to row*4+i+1 and (if allowed) remove it
            this.moveTile(item, row * 4 + col, row * 4 + i + 1, remove);
          }
        }
      }.bind(this));
      // completing the move
      this.endMove(moved);
    }
  },
  isGameOver: function () {
    var arr = this.fieldArray;
    for (var i = 0, len = arr.length; i < len; i++) {
      var prev = next = 1;
      var up = down = 4;
      if (i % 4 == 3) {
        next = 999;
      }
      if (i % 4 == 0) {
        prev = 999;
      }
      if (
        arr[i] == (arr[i - up] || 0) ||
        arr[i] == (arr[i - prev] || 0) ||
        arr[i] == (arr[i + next] || 0) ||
        arr[i] == (arr[i + down] || 0)
      ) {
        return false;
      }
    }
    return true;
  },

  saveScore: function () {
    if (this.currentScore >= this.highScore) {
      localStorage.setItem("highscore", this.currentScore);
    }
  },

  checkYouLose: function () {
    var full = 1;
    this.fieldArray.forEach(function (item) {
      if (item != 0) {
        full++;
      }
    });
    if (full >= 16) {
      if (this.isGameOver()) {
        this.saveScore();
        Render.YouLose.show(this.currentScore);
      }
    }
  },

  checkYouWin: function () {
    if (this.brickScore === 2048 && !this.didWin) {
      this.saveScore();
      Render.YouWin.show(this.currentScore);
    } else {
      this.movimentScore = 0;
      this.brickScore = 0;
    }
  }
};

document.addEventListener('visibilitychange', function (e) {
  if (document.hidden) {
    if (game.state.current === 'MainGame') {
      if(!Render.Confirm.isOpen && !Render.Options.isPaused && !Render.YouWin.isWin && !Render.YouLose.isLose) {
        Render.Restart.hide();
        MainGame.optionPause();
      }
    }
  }
});

var menu = {
  softkey: null,
  locale: null,
  preload: function () {
    game.load.image('bg', 'assets/bg-home.png');
    game.load.image('logo', 'assets/logo-2048.png');
    game.load.image('focus-start', 'assets/focus-3.png');
    game.navigator = game.plugins.add(Phaser.Plugin.Navigator);
  },
  create: function () {
    game.init = true;
    game.add.sprite(0, 0, 'bg');
    this.renderText();
    this.bind();
  },
  bind: function () {
    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('score'),
        rsk: locale.getLocale('options')
      },
      action: {
        softLeft: function () {
          game.state.start('score');
        },
        enter: function () {
          game.state.start('MainGame');
        },
        softRight: function () {
          game.state.start('options');
        }
      }
    });

    game.navigator.group.children.forEach(function (item) {
      item.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    });
  },
  renderText: function () {
    var logo = game.add.sprite(game.world.centerX, game.world.centerY - 50, 'logo');
    logo.anchor.setTo(0.5);
    var focusStart = game.add.sprite(game.world.centerX, game.world.centerY + 70, 'focus-start');
    focusStart.anchor.setTo(0.5);
    var style = Object.assign({}, game.custom.fontStyle);
    style.fontWeight = 'bold';
    style.fontSize = 20;

    var start = game.add.text(focusStart.x, focusStart.y + 3, locale.getLocale('start'), style);
    start.anchor.set(0.5);
    start.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
  }
};

var ads = {
  init: function(adname) {
    this.adname = adname;
  },
  create: function () {
    game.sound.mute = true;
    var onAdFinished = function() {
      game.sound.mute = false;
      window.focus();
      game.state.start(game.ads.nextState);
    };

    game.ads.showAds({
      adname: this.adname,
      onAdFinished: onAdFinished,
    });
    this.bind();
  },
  bind: function () {
    if (game.navigator) {
      game.navigator.register({
        style: game.custom.fontStyle,
        label: {},
        action: {
          softLeft: function () {
          },
          enter: function () {
          },
          softRight: function () {
          },
          backspace: function () {
          },
          endCall: function () {
          }
        }
      });
    }
  }

}

function JioKaiAds(adsWrapperId) {
  this.adsWrapperId = adsWrapperId;
}

JioKaiAds.prototype.showAds = function(containerCfg) {
  if (
    true
  ) {
    const ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'iframe-ads');
    ifrm.setAttribute('style', 'border: none;');
    document.getElementById(this.adsWrapperId).appendChild(ifrm);
    const kaiJioAds = KaiDisplayAdsSdk('iframe-ads');
    kaiJioAds.init({
      banner: {
        w: window.screen.width,
        h: (window.screen.height - 26), // top bar 26px deducted
        topmargin: 26,
        adspotkey: '434ca6a0',
        pkgname: 'com.kaiostech.2048',
        adrefresh: 0,
        customData: '', // '{"key1": "Some key value to be sent", "key2": "Some key2 value to be sent"}'
        advid: window.advid,
        uid: window.uid
      },
      listeners: {
        adclose: function() {
          console.log('ad close 1');
          containerCfg.onAdFinished();
        }
      }
    });
  } else {
    // we directory enter the game
    navigator.spatialNavigationEnabled = false;
    containerCfg.onAdFinished();
  }
}

var game = new Phaser.Game(
  240,
  320,
  Phaser.CANVAS,
  'phaser-game'
);

game.custom = {
  debug: true,
  fontStyle: {
    font: "DINPro-Bold",
    fontSize: '16px',
    fill: '#FFFFFF'
  }
};


// Conditional add for scroll Advertisement
document.addEventListener("keydown", function (e) {
  e.key === "ArrowDown" && e.preventDefault();
});
document.addEventListener("keydown", function (e) {
  e.key === "ArrowUp" && e.preventDefault();
});

// var adsConfig = {
//     kai: {
//         app: "2048",
//         publisher: "e6dfb88f-ca58-4816-85ad-27eb07964d34",
//         loadingTheme: "dark",
//         ads: {
//             splash: {
//                 slotName: "splash",
//                 type: "Interstitial"
//             },
//             restart: {
//                 slotName: "restart",
//                 type: "Interstitial"
//             },
//             playAgain: {
//                 slotName: "playAgain",
//                 type: "Interstitial"
//             },
//             goHome: {
//                 slotName: "goHome",
//                 type: "Interstitial"
//             },
//             banner: {
//                 slotName: 'banner',
//                 type: 'Banner'
//             }
//         }
//     },
//     jio: {
//         loadingTheme: 'dark',
//         ads: {
//             restart: {
//                 source: 'com.kaiostech.2048',
//                 adspot: '434ca6a0',
//                 type: 'Interstitial'
//             },
//             playAgain: {
//                 source: 'com.kaiostech.2048',
//                 adspot: '434ca6a0',
//                 type: 'Interstitial'
//             },
//             goHome: {
//                 source: 'com.kaiostech.2048',
//                 adspot: '434ca6a0',
//                 type: 'Interstitial'
//             }
//         }
//     }
// };

game.ads = new JioKaiAds('adsWrapper');
// game.ads.setConfig(adsConfig);

game.state.add('ads', ads);
game.state.add('menu', menu);
game.state.add('MainGame', MainGame);
game.state.add('about', about);
game.state.add('options', options);
game.state.add('score', score);

game.init = false;
navigator.mozL10n.ready(function () {
  if (Render.Options.isPaused) {
    Render.Options.hide();
  }
  if (Render.Confirm.isOpen) {
    Render.Confirm.hide();
  }
  if (Render.YouLose.isLose) {
    Render.YouLose.hide();
  }
  game.paused = false;
  if (!game.init) {
    game.ads.nextState = 'menu';
    game.state.start('ads', true, false, 'splash');
  } else {
    game.state.start('menu');
  }
});

// document.addEventListener('DOMContentLoaded', function ()  {
//   game.ads.showAds({
//     adname: "banner",
//     containerId: "overlayads",
//     maxDimension: { width: window.screen.width, height: 200 },
//     onAdSuccess: function(ad) {
//       window.ads = ad;
//     }
//   });
// });



Render.Confirm = {
  isOpen: false,
  show: function () {
    game.paused = true;
    MainGame.canMove = false;
    this.isOpen = true;
    this.confirmGroup = game.add.group();
    var confirmBack = game.add.graphics();
    confirmBack.beginFill(0x000000, 0.9);
    confirmBack.drawRect(0, 0, 240, 320);
    if(window.ads && (typeof window.ads.call === 'function')) {
      game.navigator.register({
        style: game.custom.fontStyle,
        label: {
          lsk: locale.getLocale('viewAds'),
          rsk: locale.getLocale('quit')
        },
        action: {
          softLeft: function() {
            window.ads.call('click');
          },
          enter: function() {
            window.ads.call('click');
          },
          softRight: function() {
            // window.close();
          },
          backspace: function() {
            Render.Confirm.hide();
          },
          endCall: function() {
            // window.close();
          }
        }
      });
    } else {
      game.navigator.register({
        style: game.custom.fontStyle,
        label: {
          lsk: locale.getLocale('cancel'),
          rsk: locale.getLocale('quit')
        },
        action: {
          softLeft: function() {
            Render.Confirm.hide();
          },
          softRight: function() {
            // window.close();
          },
          backspace: function() {
            Render.Confirm.hide();
          },
          endCall: function() {
            // window.close();
          }
        }
      });
    }


    var logo = game.add.image(game.world.centerX, game.world.centerY - 50, 'logo');
    logo.anchor.setTo(0.5)

    var dialog = game.add.image(game.world.centerX, game.height - 80, 'bg-dialog');
    dialog.anchor.setTo(0.5)

    var txt = game.add.text(dialog.x, dialog.y, locale.getLocale('confirmText'), { fontSize: 16, align: "center", fill: "#0a0a0a" });
    txt.anchor.setTo(0.5);
    txt.wordWrap = true;
    txt.wordWrapWidth = 200;

    this.confirmGroup.addMultiple([confirmBack, logo, dialog, txt]);
  },
  hide: function () {
    MainGame.canMove = true;
    game.paused = false;
    this.isOpen = false;
    this.confirmGroup.removeAll();
    game.navigator.setLastConfig();
  }
};


Render.Restart = {
  isOpen: false,
  show: function () {
    game.paused = true;
    MainGame.canMove = false;
    this.isOpen = true;
    this.confirmGroup = game.add.group();
    var confirmBack = game.add.graphics();
    confirmBack.beginFill(0x000000, 0.9);
    confirmBack.drawRect(0, 0, 240, 320);

    if(window.ads && (typeof window.ads.call === 'function')) {
      this.confirmGroup.addMultiple([confirmBack]);

      // ads container
      // document.getElementById("myElement").style.cssText = "display: block; position: absolute";
      document.getElementById("restartTitle").style.display = "block";
      document.getElementById("confirmTitle").style.display = "block";
      document.getElementById("adscontainer").style.cssText = "position: absolute; bottom: 35px; z-index: 1000; width: 100%; height: 250px; display: block";
      document.getElementById("restartTitle").innerHTML = locale.getLocale('restart');
      document.getElementById("confirmTitle").innerHTML = locale.getLocale('RestartText');

      game.navigator.register({
        style: game.custom.fontStyle,
        label: {
          lsk: locale.getLocale('viewAds'),
          rsk: locale.getLocale('yes')
        },
        action: {
          softLeft: function() {
            window.ads.call('click');
          },
          enter: function() {
            window.ads.call('click');
          },
          softRight: function() {
            Render.Restart.hide();
            game.ads.nextState = 'MainGame';
            game.state.start('ads', true, false, 'playAgain');
          },
          backspace: function() {
            Render.Restart.hide();
          },
          endCall: function() {
            // window.close();
          }
        }
      });
    } else {
      var dialog = game.add.image(game.world.centerX, game.height - 90, 'bg-dialog');
      dialog.anchor.setTo(0.5);

      var txt = game.add.text(dialog.x, dialog.y, locale.getLocale('RestartText'), { fontSize: 16, align: "center", fill: "#0a0a0a" });
      txt.anchor.setTo(0.5);
      txt.wordWrap = true;
      txt.wordWrapWidth = 240;

      this.confirmGroup.addMultiple([confirmBack, dialog, txt]);
      game.navigator.register({
        style: game.custom.fontStyle,
        label: {
          lsk: locale.getLocale('yes')
        },
        action: {
          softLeft: function() {
            Render.Restart.hide();
            game.ads.nextState = 'MainGame';
            game.state.start('ads', true, false, 'playAgain');
          },
          backspace: function() {
            Render.Restart.hide();
          },
          endCall: function() {
            // window.close();
          }
        }
      });
    }
  },
  hide: function () {
    MainGame.canMove = true;
    game.paused = false;
    this.isOpen = false;
    this.confirmGroup.removeAll();
    game.navigator.setLastConfig();

    // ads container
    document.getElementById("restartTitle").style.display = "none";
    document.getElementById("adscontainer").style.cssText = "position: absolute; top: 0px; z-index: 1000; width: 100%; height: 54px; display: none";
  }
};

Render.Options = {
  show: function () {
    this.isPaused = true;
    MainGame.canMove = false;
    this.optionsGroup = game.add.group();

    var bgOptions = game.add.image(0, 0, 'bg-options');
    bgOptions.alpha = 0.9;


    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('home'),
        rsk: locale.getLocale('resume')
      },
      action: {
        softLeft: function () {
          Render.Options.hide();
          game.state.start('menu');
        },
        enter: function () {
          Render.Options.selectOpValue();
        },
        softRight: function () {
          Render.Options.hide();
        },
        0: function () {
          Render.Options.hide();
        }
      }
    });

    this.focus = game.add.sprite(game.world.centerX, 190, 'focus');
    this.focus.anchor.setTo(0.5);
    this.focus.visible = true;
    this.focus2 = game.add.sprite(game.world.centerX, 228, 'focus');
    this.focus2.anchor.setTo(0.5);
    this.focus2.visible = false;
    this.soundOn = game.add.tileSprite(180, 180, 28, 15, 'on');
    this.soundOn.visible = false;
    this.soundOff = game.add.tileSprite(180, 180, 28, 15, 'off');
    this.soundOff.visible = false;

    this.vibrationOn = game.add.tileSprite(180, 220, 28, 15, 'on');
    this.vibrationOn.visible = false;
    this.vibrationOff = game.add.tileSprite(180, 220, 28, 15, 'off');
    this.vibrationOff.visible = false;

    this.index = 0;
    this.listenerUp = game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(function () {

      if (this.index === 1) {
        --this.index;
        this.focus.visible = true;
        this.focus2.visible = false;
      }
    }, this);

    this.listenerDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(function () {
      if (this.index < 1) {
        ++this.index;
        this.focus.visible = false;
        this.focus2.visible = true;
      }
    }, this);
    this.loadSound()
    this.loadVibration();

    var style = Object.assign({}, game.custom.fontStyle);
    style.fontSize = "24px";
    var title = game.add.text(game.world.centerX, 100, locale.getLocale('pause'), style);
    title.anchor.set(0.5);
    title.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    var sound = game.add.text(43, 180, locale.getLocale('sound'), game.custom.fontStyle);
    sound.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);
    var vibration = game.add.text(43, 220, locale.getLocale('vibration'), game.custom.fontStyle);
    vibration.setShadow(3, 3, 'rgba(0,0,0,0.3)', 5);

    this.optionsGroup.addMultiple([bgOptions, this.focus, this.focus2, title, sound, vibration,
      this.vibrationOn, this.vibrationOff, this.soundOff, this.soundOn]);

  },
  hide: function () {
    MainGame.canMove = true;
    game.paused = false;
    this.optionsGroup.removeAll();
    game.navigator.setLastConfig();
    this.isPaused = false;
  },
  selectOpValue: function () {
    switch (this.index) {
      case 0:
        this.saveData('sound', (!this.soundOn.visible).toString());
        this.loadSound();
        break;
      case 1:
        this.saveData('vibration', (!this.vibrationOn.visible).toString());
        this.loadVibration();
        break;
    }
  },
  saveData: function (key, value) {
    localStorage.setItem(key, value);
  },
  loadData: function (key) {
    var value = JSON.parse(localStorage.getItem(key));
    if (null === value || undefined === value) {
      this.saveData(key, true);
      return true;
    }
    return value;

  },
  loadSound: function () {
    var sound = this.loadData('sound');
    this.soundOn.visible = sound;
    this.soundOff.visible = !sound;
  },
  loadVibration: function () {
    var vibration = this.loadData('vibration');
    this.vibrationOn.visible = vibration;
    this.vibrationOff.visible = !vibration;
  }
};

Render.Score = function (self) {
  var style1 = Object.assign({}, game.custom.fontStyle);
  var stylehScorePoints = Object.assign({}, game.custom.fontStyle);
  var style2 = Object.assign({}, game.custom.fontStyle);
  style1.fontSize = 14;
  stylehScorePoints.fontSize = 18;
  style1.align = "center";
  self.hscoreTxt = game.add.text(game.world.centerX, 47, locale.getLocale('bestscore'), style1);
  self.hscoreTxt.anchor.setTo(0.5);
  self.hscoreTxt.lineSpacing = -6;
  self.hscorePoints = game.add.text(game.world.centerX, 67, self.highScore, stylehScorePoints);
  self.hscorePoints.anchor.setTo(0.5);

  style2.fontSize = 24;
  self.scoreText = game.add.text(game.world.centerX + 10, game.height - 15, '', style2);
  self.scoreText.anchor.setTo(0.5);
  self.scoreText.lineSpacing = -10;
};

Render.YouLose = {
  isLose: false,
  show: function (currentScore) {
    this.isLose = true;
    MainGame.canMove = false;
    this.youLoseGroup = game.add.group();
    var bgYouLose = game.add.image(0, 0, 'bg-youlose');

    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('home'),
        rsk: locale.getLocale('otherRestart')
      },
      action: {
        softLeft: function() {
          Render.YouLose.hide();
          game.ads.nextState = 'menu';
          game.state.start('ads', true, false, 'goHome');
        },
        softRight: function() {
          Render.YouLose.hide();
          game.ads.nextState = 'MainGame';
          game.state.start('ads', true, false, 'playAgain');
        }
      }
    });

    var style = Object.assign({}, game.custom.fontStyle);

    var title = game.add.image(game.world.centerX, 90, "youlose");
    title.anchor.setTo(0.5);

    style.fontSize = 20;
    var ohNo = game.add.text(title.x, 80, locale.getLocale('ohNo'), style);
    ohNo.anchor.setTo(0.5, 0.5);

    var youlose = game.add.text(title.x, 105, locale.getLocale('youlose'), style);
    youlose.anchor.setTo(0.5, 0.5);

    style.fontSize = 16;
    var score = game.add.text(game.world.centerX, game.world.centerY, locale.getLocale('score'), style);
    score.anchor.setTo(0.5);

    style.fontSize = 50;
    var scoreNumber = game.add.text(score.x, score.y + 35, currentScore, style);
    scoreNumber.anchor.setTo(0.5);
    this.youLoseGroup.addMultiple([bgYouLose, title, ohNo, youlose, score, scoreNumber]);
  },
  hide:function(){
    MainGame.canMove = true;
    this.isLose = false;
    this.youLoseGroup.removeAll();
    game.navigator.setLastConfig();
  }
};

Render.YouWin = {
  isWin: false,
  show: function (currentScore) {
    this.isWin = true;
    MainGame.didWin = true;
    MainGame.canMove = false;
    this.youWinGroup = game.add.group();
    var bgYouLose = game.add.image(0, 0, 'bg-youwin');

    game.navigator.register({
      style: game.custom.fontStyle,
      label: {
        lsk: locale.getLocale('home'),
        csk: locale.getLocale('continue'),
        rsk: locale.getLocale('otherRestart')
      },
      action: {
        softLeft: function() {
          Render.YouWin.hide();
          game.ads.nextState = 'menu';
          game.state.start('ads', true, false, 'goHome');
        },
        enter: function() {
          Render.YouWin.hide();
        },
        softRight: function() {
          this.isWin = false;
          game.ads.nextState = 'MainGame';
          game.state.start('ads', true, false, 'playAgain');
          Render.YouWin.hide();

        }
      }
    });

    var style = Object.assign({}, game.custom.fontStyle);

    var title = game.add.image(game.world.centerX, 90, "youwin");
    title.anchor.setTo(0.5);

    style.fontSize = 18;
    var congratulations = game.add.text(title.x, 80, locale.getLocale('congratulations'), style);
    congratulations.anchor.setTo(0.5, 0.5);

    var youGot = game.add.text(title.x, 105, locale.getLocale('youGot'), style);
    youGot.anchor.setTo(0.5, 0.5);

    style.fontSize = 16;
    var score = game.add.text(game.world.centerX, game.world.centerY, locale.getLocale('score'), style);
    score.anchor.setTo(0.5);

    style.fontSize = 50;
    var scoreNumber = game.add.text(score.x, score.y + 35, currentScore, style);
    scoreNumber.anchor.setTo(0.5);

    this.youWinGroup.addMultiple([bgYouLose, title, congratulations, youGot, score, scoreNumber]);
  },
  hide: function () {
    MainGame.canMove = true;
    this.isWin = false;
    this.youWinGroup.removeAll();
    game.navigator.setLastConfig();
  }
};
