
import tk from 'terminal-kit';

export const TERM_FILL_ATTR: tk.ScreenBuffer.Attributes = {
  color: 'black',
  bgColor: 'black',
};

export type ScreenBufferOpts = Pick<tk.ScreenBuffer.Options,
'width'
| 'height'
| 'x'
| 'y'
| 'noFill'
>;

export type TkElementOpts = {
  dst: tk.ScreenBuffer | tk.Terminal;
  children?: TkElement[];
} & ScreenBufferOpts;

export abstract class TkElement {
  dst: tk.ScreenBuffer | tk.Terminal;
  children: TkElement[];

  screenBuffer: tk.ScreenBuffer;

  constructor(opts: TkElementOpts) {
    this.dst = opts.dst;
    this.children = opts.children ?? [];
    this.screenBuffer = this.initScreenBuffer(opts);
  }

  abstract initScreenBuffer(opts?: TkElementOpts): tk.ScreenBuffer;
  abstract draw(): void;
  abstract fill(): void;
  render() {
    this.fill();
    for(let i = 0; i < this.children?.length; ++i) {
      this.children[i].render();
    }
    this.draw();
  }
}
