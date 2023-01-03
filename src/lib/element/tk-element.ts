
import tk from 'terminal-kit';

export class TkElement {
  constructor(
    public dst: tk.ScreenBuffer | tk.Terminal,
    public parent?: TkElement,
    public children?: TkElement[],
  ) {}
}
