import {expect} from 'chai';
import {PoliticalAlliance} from '../../../src/server/cards/turmoil/PoliticalAlliance';
import {IGame} from '../../../src/server/IGame';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestingUtils';

describe('PoliticalAlliance', () => {
  let card: PoliticalAlliance;
  let player: TestPlayer;
  let game: IGame;
  let turmoil: Turmoil;

  beforeEach(() => {
    card = new PoliticalAlliance();
    [game, player/* , player2 */] = testGame(2, {turmoilExtension: true});
    turmoil = game.turmoil!;
  });

  it('Can not play', () => {
    const greens = turmoil.getPartyByName(PartyName.GREENS);
    greens.partyLeader = player;
    expect(card.canPlay(player)).is.not.true;
  });

  it('Should play', () => {
    const greens = turmoil.getPartyByName(PartyName.GREENS);
    const reds = turmoil.getPartyByName(PartyName.REDS);
    greens.partyLeader = player;
    reds.partyLeader = player;
    expect(card.canPlay(player)).is.true;

    card.play(player);
    expect(player.terraformRating).to.eq(21);
  });
});
