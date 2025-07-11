import * as responses from '../server/responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Phase} from '../../common/Phase';
import {IPlayer} from '../IPlayer';
import {WaitingForModel} from '../../common/models/WaitingForModel';
import {IGame} from '../IGame';
import {isPlayerId, isSpectatorId} from '../../common/Types';
import {Request} from '../Request';
import {Response} from '../Response';

export class ApiWaitingFor extends Handler {
  public static readonly INSTANCE = new ApiWaitingFor();
  private constructor() {
    super();
  }

  private timeToGo(player: IPlayer): boolean {
    return player.getWaitingFor() !== undefined || player.game.phase === Phase.END;
  }

  private playersWithInputs(game: IGame) {
    return game.playersInGenerationOrder.filter((player) => player.getWaitingFor() !== undefined).map((player) => player.color);
  }

  private getPlayerWaitingForModel(player: IPlayer, game: IGame, gameAge: number, undoCount: number): WaitingForModel {
    const inputs = this.playersWithInputs(game);
    if (this.timeToGo(player)) {
      return {result: 'GO', waitingFor: inputs};
    } else if (game.gameAge > gameAge || game.undoCount > undoCount) {
      return {result: 'REFRESH', waitingFor: inputs};
    }
    return {result: 'WAIT', waitingFor: inputs};
  }

  private getSpectatorWaitingForModel(game: IGame, gameAge: number, undoCount: number): WaitingForModel {
    const inputs = this.playersWithInputs(game);

    if (game.gameAge > gameAge || game.undoCount > undoCount) {
      return {result: 'REFRESH', waitingFor: inputs};
    }
    return {result: 'WAIT', waitingFor: inputs};
  }

  public override async get(req: Request, res: Response, ctx: Context): Promise<void> {
    const id = String(ctx.url.searchParams.get('id'));
    const gameAge = Number(ctx.url.searchParams.get('gameAge'));
    const undoCount = Number(ctx.url.searchParams.get('undoCount'));

    let game: IGame | undefined;
    if (isSpectatorId(id) || isPlayerId(id)) {
      game = await ctx.gameLoader.getGame(id);
    }
    if (game === undefined) {
      responses.notFound(req, res, 'cannot find game for that player');
      return;
    }
    try {
      if (isPlayerId(id)) {
        const player = game.getPlayerById(id);
        if (!this.isUser(player.user, ctx)) {
          responses.notAuthorized(req, res);
          return;
        }
        ctx.ipTracker.addParticipant(id, ctx.ip);
        responses.writeJson(res, ctx, this.getPlayerWaitingForModel(player, game, gameAge, undoCount));
      } else if (isSpectatorId(id)) {
        responses.writeJson(res, ctx, this.getSpectatorWaitingForModel(game, gameAge, undoCount));
      } else {
        responses.internalServerError(req, res, 'id not found');
      }
    } catch (err) {
      // This is basically impossible since getPlayerById ensures that the player is on that game.
      console.warn(`unable to find player ${id}`, err);
      responses.notFound(req, res, 'player not found');
    }
  }
}
