import {expect} from 'chai';
import {cast} from '../../TestingUtils';
import {TitanAirScrapping} from '../../../src/server/cards/colonies/TitanAirScrapping';
import {testGame} from '../../TestGame';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {TestPlayer} from '../../TestPlayer';

describe('TitanAirScrapping', () => {
  let card: TitanAirScrapping;
  let player: TestPlayer;

  beforeEach(() => {
    card = new TitanAirScrapping();
    [/* game */, player] = testGame(2);
  });

  it('Can not act', () => {
    player.playedCards.push(card);
    expect(card.canAct(player)).is.not.true;
  });

  it('Should act - both actions possible', () => {
    player.playedCards.push(card);
    player.titanium = 3;
    player.addResourceTo(card, 7);
    expect(card.canAct(player)).is.true;

    const orOptions = cast(card.action(player), OrOptions);
    orOptions.options[0].cb();

    expect(player.terraformRating).to.eq(21);
    expect(card.resourceCount).to.eq(5);
    expect(card.getVictoryPoints(player)).to.eq(2);
  });

  it('Should act automatically when only one action possible', () => {
    player.playedCards.push(card);
    player.addResourceTo(card, 2);
    expect(card.canAct(player)).is.true;

    card.action(player);
    expect(player.terraformRating).to.eq(21);
    expect(card.resourceCount).to.eq(0);
  });
});
