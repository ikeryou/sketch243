import { Func } from "../core/func";
import { MyDisplay } from "../core/myDisplay";
import { Point } from "../libs/point";
import { Item } from "./item";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  private _item:Array<Item> = [];
  private _num:number = 6;
  private _b:number = -1;

  constructor(opt:any) {
    super(opt)

    for(let i = 0; i < this._num; i++) {
      const el = document.createElement('div');
      el.classList.add('item');
      this.getEl().append(el);
      const item = new Item({
        el:el,
      })
      this._item.push(item);
    }
  }


  private _checkWalls(ball:Item): void {
    const sw = Func.instance.sw();
    const sh = Func.instance.sh();
    if(ball.x + ball.radius > sw) {
      ball.x = sw - ball.radius;
      ball.vx *= this._b;
    } else if(ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx *= this._b;
    }

    if(ball.y + ball.radius > sh) {
      ball.y = sh - ball.radius;
      ball.vy *= this._b;
    } else if(ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy *= this._b;
    }
  }


  private _checkCollision(ball0:Item, ball1:Item): void {
    const dx = ball1.x - ball0.x;
    const dy = ball1.y - ball0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if(dist < ball0.radius + ball1.radius) {
      const angle = Math.atan2(dy, dx);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      const pos0:Point = new Point(0, 0);
      const pos1:Point = this._rotate(dx, dy, sin, cos, true);

      const vel0:Point = this._rotate(ball0.vx, ball0.vy, sin, cos, true);
      const vel1:Point = this._rotate(ball1.vx, ball1.vy, sin, cos, true);

      const vxTotal = vel0.x - vel1.x;
      vel0.x = ((ball0.mass - ball1.mass) * vel0.x + 2 * ball1.mass * vel1.x) / (ball0.mass + ball1.mass);
      vel1.x = vxTotal + vel0.x;

      const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
      const overlap = (ball0.radius + ball1.radius) - Math.abs(pos0.x - pos1.x);
      // pos0.x += vel0.x;
      // pos1.x += vel1.x;
      pos0.x += vel0.x / absV * overlap;
      pos1.x += vel1.x / absV * overlap;

      const pos0F:Point = this._rotate(pos0.x, pos0.y, sin, cos, false);
      const pos1F:Point = this._rotate(pos1.x, pos1.y, sin, cos, false);

      ball1.x = ball0.x + pos1F.x;
      ball1.y = ball0.y + pos1F.y;
      ball0.x = ball0.x + pos0F.x;
      ball0.y = ball0.y + pos0F.y;

      const vel0F:Point = this._rotate(vel0.x, vel0.y, sin, cos, false);
      const vel1F:Point = this._rotate(vel1.x, vel1.y, sin, cos, false);

      ball0.vx = vel0F.x;
      ball0.vy = vel0F.y;
      ball1.vx = vel1F.x;
      ball1.vy = vel1F.y;
    }
  }


  private _rotate(x:number, y:number, sin:number, cos:number, reverse:boolean): Point {
    const res:Point = new Point();

    if(reverse) {
      res.x = x * cos + y * sin;
      res.y = y * cos - x * sin;
    } else {
      res.x = x * cos - y * sin;
      res.y = y * cos + x * sin;
    }

    return res;
  }


  protected _update(): void {
    super._update();

    let i;
    const num = this._item.length;
    for(i = 0; i < num; i++) {
      const ball:Item = this._item[i];
      ball.x += ball.vx;
      ball.y += ball.vy;
      this._checkWalls(ball);
    }

    for(i = 0; i < num; i++) {
      const ballA:Item = this._item[i];
      for(let j = i + 1; j < num; j++) {
        const ballB:Item = this._item[j];
        this._checkCollision(ballA, ballB);
      }
    }
  }
}