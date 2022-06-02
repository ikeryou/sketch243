
import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";
import { Util } from "../libs/util";
import { Func } from "../core/func";
import { Update } from "../libs/update";
import { Color } from 'three/src/math/Color';

// -----------------------------------------
//
// -----------------------------------------
export class Item extends MyDisplay {


  public noise:number = 1;
  public radius:number = 1;
  public vx:number = 0;
  public vy:number = 0;
  public mass:number = 0;

  public x:number = 0;
  public y:number = 0;

  private _el:Array<Array<{wrapper:HTMLElement, el:HTMLInputElement, type:string}>> = [];

  constructor(opt:any) {
    super(opt)

    this.noise = Util.instance.random(0, 1);
    this.mass = 1;

    this.vx = Util.instance.range(5);
    this.vy = Util.instance.range(5);

    for(let i = 0; i < 2; i++) {
      this._el[i] = [];
      const num = [10, 8, 6, 4][i];
      for(let l = 0; l < num; l++) {
        const wrapper = document.createElement('div');
        this.getEl().append(wrapper);

        const e = document.createElement('input');
        const type = Util.instance.randomArr(['range','range','checkbox', 'radio', 'text', 'password', 'color'])
        e.setAttribute('type', type);

        wrapper.append(e);
        this._el[i] .push({
          wrapper:wrapper,
          el:e,
          type:type
        });

        if(type == 'color') {
          const col = new Color(Util.instance.random(0,1), Util.instance.random(0,1), Util.instance.random(0,1))
          e.value = '#' + col.getHexString();
        }

        if(type == 'text' || type == 'password') {
          const num = 10;
          e.value = ''
          for(let i = 0; i < num; i++) {
            e.value += Util.instance.randomArr('ABCDEFGHIKLMNOPRSTUVWXYZ0123456789'.split(''));
          }
        }
      }

    }



    this._update()

    this.x = Util.instance.random(0, Func.instance.sw() - this.radius);
    this.y = Util.instance.random(0, Func.instance.sh() - this.radius);

    this._update();
  }


  protected _update(): void {
    super._update();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();
    this.radius = Math.min(sw, sh) * Util.instance.mix(0.1, 0.15, this.noise)

    Tween.instance.set(this.getEl(), {
      width: this.radius * 2,
      height: this.radius * 2,
      x:this.x - this.radius,
      y:this.y - this.radius,
      rotationZ:this._c
    })

    if(Update.instance.cnt % 1 == 0) {
      this._el.forEach((val,i) => {

        // 円形に配置
        const radius = Util.instance.map(i, this.radius, this.radius * 0.5, 0, this._el.length - 1)
        const dist = radius * 2 * Math.PI;
        const elSize = (dist / val.length);

        const centerX = 0;
        const centerY = 0;

        val.forEach((val2,i2) => {
          const rad = Util.instance.radian(this._c * 0 + i * 50 + (360 / val.length) * i2)
          const x = centerX + Math.sin(rad) * radius
          const y = centerY + Math.cos(rad) * radius
          const ang = Util.instance.degree(Math.atan2(y, x)) + 90

          if(val2.type == 'color') {
            const col = new Color(Util.instance.random(0,1), Util.instance.random(0,1), Util.instance.random(0,1))
            val2.el.value = '#' + col.getHexString();
          }

          if(val2.type == 'range') {
            val2.el.value = String(Util.instance.map(Math.sin(i2 * 0.5 + this._c * 0.1), 0, 100, -1, 1));
          }

          if(val2.type == 'text' || val2.type == 'password') {
            const num = 10;
            val2.el.value = ''
            for(let j = 0; j < num; j++) {
              val2.el.value += Util.instance.randomArr('ABCDEFGHIKLMNOPRSTUVWXYZ0123456789'.split(''));
            }
          }

          if(Update.instance.cnt % 10 == 0) {
            Tween.instance.set(val2.el, {
              x:-elSize * 0.5,
              y:this.getHeight(val2.el) * -0.5,
              width:elSize,
            })

            Tween.instance.set(val2.wrapper, {
              x:x,
              y:y,
              rotationZ:ang
            })
          }

        })
      })
    }
  }

}