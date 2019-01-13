'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    return new Vector(vector.x + this.x, vector.y + this.y);
  }

  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier)
  }
}

const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));


console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw new Error("Не принадлежит классу Vector");
    }

    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.id = Math.random();
    Object.defineProperty(this, 'type', {
      configurable: true,
      writable: false,
      value: 'actor'
    })
  }

  act() { }

  get left() {
    return this.pos.x
  }

  get top() {
    return this.pos.y
  }

  get right() {
    return this.pos.x + this.size.x
  }

  get bottom() {
    return this.pos.y + this.size.y
  }

  isIntersect(actor) {

    if (!(actor instanceof Actor)) {
      throw new Error('Не принадлежит классу Actor')
    }

    if (actor.id === this.id) {
      return false;
    }

    let equal = this.left === actor.left && this.top === actor.top && this.right === actor.right && this.bottom === actor.bottom;
    let fullInObject = this.left < actor.left && this.bottom > actor.bottom && this.right > actor.right;
    let inObject = this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top

    return equal || fullInObject || inObject
  }
}



const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);

class Level {
  constructor(grid = [], actors) {
    this.grid = grid;
    this.actors = actors;
    //this.player
    this.height = this.grid.length;

    Object.defineProperty(this, "width", {
      get: () => {
        let max = 0;
        for (let i = 0; i < this.grid.length; i++) {
          if (this.grid[i].length > max) {
            max = this.grid[i].length
          }
        } return max;
      }
    })

    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0 ? true : false;
  }

  actorAt(actor) {
    if (!actor instanceof Actor) {
      throw new Error('Не принадлежит классу Actor')
    }

    if (this.actors === undefined) {
      return undefined
    }

    for (let item of this.actors) {
      if (actor.id === item.id) {
      } else if (actor.isIntersect(item)) {
        return item
      }
    }

    return undefined
  }

  obstacleAt(vectorPos, vectorSize) {
    if (!vectorPos instanceof Vector || !vectorSize instanceof Vector) {
      throw new Error('Не принадлежит классу Vector')
    }

    const left = Math.floor(vectorPos.x);
    const top = Math.floor(vectorPos.y);
    const right = Math.floor(vectorPos.x + vectorSize.x);
    const bottom = Math.floor(vectorPos.y + vectorSize.y);

    if (left < 0 || right > this.width || top < 0) {
      return 'wall'
    } else if (bottom > this.height) {
      return 'lava'
    }

    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        if (this.grid[x][y] === 'wall') {
          return 'wall'
        } else if (this.grid[x][y] === 'lava') {
          return 'lava'
        } else {
          return undefined
        }
      }
    }
  }

  removeActor(actor) {
    for (let item of this.actors) {
      if (actor.id === item.id) {
        this.actors.splice(this.actors.indexOf(actor), 1)
      }
    }
  }

  noMoreActors(type) {

    if (this.actors === undefined || type === undefined) {
      return true
    }

    for (let item of this.actors) {
      if (item.type === type) {
        return false
      }
    } return true
  }

  playerTouched(type, actor) {

    if (this.status !== null) return;

    switch (type) {
      case 'lava':
      case 'fireball':
        this.status = 'lost';
        break;
      case 'coin': {
        if (actor) {
          this.removeActor(actor);
          if (this.noMoreActors('coin')) {
            this.status = 'won';
          }
        }
      }
    }
  }
}


const grid = [
  [undefined, undefined],
  ['wall', 'wall'],
  ['wall', 'wall', 'wall'],
  [undefined, undefined]
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
//const player = new Actor();
const fireball = new Actor();
const level = new Level(grid, [goldCoin, bronzeCoin, player, fireball]);



level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}


level.obstacleAt(new Vector(1, 1), player.size)
const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}


class Fireball extends Actor {
  constructor(pos = new Vector(), speed = new Vector()) {
    super(pos, new Vector(0, 0), speed)
    this.size = new Vector(1, 1);
    Object.defineProperty(this, 'type', {
      configurable: true,
      writable: false,
      value: 'fireball'
    })
  }

  getNextPosition(time = 1) {
    return new Vector(this.pos.x + (this.speed.x * time), this.pos.y + (this.speed.y * time))
  }

  handleObstacle() {
    this.speed.x = this.speed.x * -1
    this.speed.y = this.speed.y * -1
  }

  act(time, level) {
    let nextPosition = this.getNextPosition(time);
    //console.log(level.grid[nextPosition.x][nextPosition.y])
    // if (level.grid[nextPosition.x][nextPosition.y] === undefined) {
    //   this.pos = nextPosition;
    // }
    if (level.obstacleAt(nextPosition, this.size) === undefined) {
      this.pos = nextPosition;
    } else if (level.obstacleAt(nextPosition, this.size) === 'wall' || level.obstacleAt(nextPosition, this.size) === 'lava') {
      this.handleObstacle()
    }
  }
}

const time = 5;
const speed = new Vector(1, 0);
const position1 = new Vector(5, 5);

const ball = new Fireball(position1, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector()) {
    super();
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.speed = new Vector(2, 0);

    Object.defineProperty(this, 'type', {
      configurable: true,
      writable: false,
      value: 'fireball'
    })
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector()) {
    super();
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 2);

    Object.defineProperty(this, 'type', {
      configurable: true,
      writable: false,
      value: 'fireball'
    })
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector()) {
    super();
    this.pos = pos;
    this.startX = this.pos.x;
    this.startY = this.pos.y;
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 3);

    Object.defineProperty(this, 'type', {
      configurable: true,
      writable: false,
      value: 'fireball'
    })
  }

  handleObstacle() {
    this.pos = new Vector(this.startX, this.startY)
  }
}

class Coin extends Actor {
  constructor(pos = new Vector()) {
    super(pos);
    this.pos = new Vector(pos.x + 0.2, pos.y + 0.1)
    this.size = new Vector(0.6, 0.6);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * (2 - 1) + 1 * Math.PI;
    this.startX = this.pos.x;
    this.startY = this.pos.y;
    Object.defineProperty(this, 'type', {
      configurable: true,
      writable: false,
      value: 'coin'
    })
  }

  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist)
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    let SpringVector = this.getSpringVector()
    return new Vector(this.startX + SpringVector.x, this.startY + SpringVector.y)
  }

  act(time = 1) {
    this.pos = this.getNextPosition(time);
  }

}

class Player extends Actor {
  constructor(pos = new Vector(), speed = new Vector()) {
    super(pos, speed);
    this.pos = new Vector(pos.x, pos.y - 0.5);
    this.speed = speed;
    this.size = new Vector(0.8, 1.5);
    Object.defineProperty(this, 'type', {
      configurable: true,
      writable: false,
      value: 'player'
    })
  }
}


let lexicon = {
  // 'x': new Actor(),
  // '!': new Actor(),
  '@': Player,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain
}

let lexDescription = {
  'x': 'wall',
  '!': 'lava'
  // '@': 'player',
  // 'o': 'coin',
  // '=': 'HorizontalFireball',
  // '|': 'VerticalFireball',
  // 'v': 'FireRain'
}

class LevelParser {
  constructor(lexicon) {
    this.lexicon = lexicon;
  }

  actorFromSymbol(symbol) {
    if (!symbol) return undefined;

    return this.lexicon[symbol];
  }

  obstacleFromSymbol(symbol) {
    return lexDescription[symbol]
  }

  createGrid(grid) {
    let mass = [];

    grid.forEach(function (el, i) {
      mass.push(el.split(''))
    })

    for (let i = 0; i < mass.length; i++) {
      for (let y = 0; y < mass[i].length; y++) {
        if (mass[i][y] === 'x') {
          mass[i][y] = 'wall';
        } else if (mass[i][y] === '!') {
          mass[i][y] = 'lava';
        } else {
          mass[i][y] = undefined;
        }
      }
    }

    return mass
  }

  createActors(massOfActors) {
    let mass = [];

    if (!this.lexicon) return mass;

    for (let y = 0; y < massOfActors.length; y++) {
      for (let x = 0; x < massOfActors[y].length; x++) {
        let LexiconClass = this.lexicon[massOfActors[y][x]]
        if (LexiconClass && typeof LexiconClass === 'function') {
          const currentObj = new LexiconClass(new Vector(x, y));
          if (currentObj instanceof Actor) mass.push(currentObj);
        }
      }
    }
    return mass
  }

  parse(plan) {
    let t = new Level(this.createGrid(plan), this.createActors(plan))
    return t
  }
}

// const plan = [
//   ' @ ',
//   'x!x'
// ];


// const parser = new LevelParser(lexicon);
// const actors = parser.createActors([
//   "                       ",
//   "                       ",
//   "                       ",
//   "                       ",
//   "  |xxx       w         ",
//   "  o                 o  ",
//   "  x               = x  ",
//   "  x          o o    x  ",
//   "  x  @   @*  xxxxx  x  ",
//   "  xxxxx             x  ",
//   "      x!!!!!!!!!!!!!x  ",
//   "      xxxxxxxxxxxxxxx  ",
//   "                       "
// ]);

// console.log(actors)
// console.log(parser.parse(plan))

const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level1 = parser.parse(plan);

level1.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level1.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));