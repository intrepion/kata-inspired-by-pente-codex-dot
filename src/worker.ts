import { chooseMove } from "./ai";
import type { Game } from "./game";
self.onmessage = (event: MessageEvent<Game>) => {
  self.postMessage(chooseMove(event.data));
};
