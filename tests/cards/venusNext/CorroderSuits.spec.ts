import {expect} from 'chai';
import {AerialMappers} from '../../../src/server/cards/venusNext/AerialMappers';
import {CorroderSuits} from '../../../src/server/cards/venusNext/CorroderSuits';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {FloaterUrbanism} from '../../../src/server/cards/pathfinders/FloaterUrbanism';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {TestPlayer} from '../../TestPlayer';
import {cast, runAllActions} from '../../TestingUtils';
import {NitriteReducingBacteria} from '../../../src/server/cards/base/NitriteReducingBacteria';
import {testGame} from '../../TestGame';

describe('CorroderSuits', function() {
  let card: CorroderSuits;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(function() {
    card = new CorroderSuits();
    [game, player] = testGame(2);
  });

  it('Should play - no targets', function() {
    card.play(player);
    expect(player.production.megacredits).to.eq(2);
  });

  it('Should play - single target', function() {
    const aerialMappers = new AerialMappers(); // Venus tag with Floaters
    player.playedCards.push(aerialMappers);

    card.play(player);
    runAllActions(game);

    expect(aerialMappers.resourceCount).to.eq(1);
    expect(player.production.megacredits).to.eq(2);
  });

  it('Should play - multiple targets', function() {
    const aerialMappers = new AerialMappers(); // Venus tag with Floaters
    const dirigibles = new Dirigibles(); // Venus tag with Floaters
    player.playedCards.push(aerialMappers, dirigibles);

    cast(card.play(player), undefined);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).includes(aerialMappers);
    expect(selectCard.cards).includes(dirigibles);

    selectCard.cb([aerialMappers]);
    expect(aerialMappers.resourceCount).to.eq(1);
    expect(player.production.megacredits).to.eq(2);
  });

  it('Should play - specialized resource type', function() {
    const floaterUrbanism = new FloaterUrbanism(); // Card from a fan expansion with a Venus tag and special resource type.
    player.playedCards.push(floaterUrbanism);

    card.play(player);
    runAllActions(game);

    expect(floaterUrbanism.resourceCount).to.eq(1);
    expect(player.production.megacredits).to.eq(2);
  });

  it('Ignore cards that do not have a Venus tag', () => {
    const aerialMappers = new AerialMappers(); // Venus tag with Floaters
    const dirigibles = new Dirigibles(); // Venus tag with Floaters
    const nitriteReducingBacteria = new NitriteReducingBacteria(); // Microbe tag with microbes
    player.playedCards.push(aerialMappers, dirigibles, nitriteReducingBacteria);

    cast(card.play(player), undefined);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).does.not.include(nitriteReducingBacteria);
    expect(selectCard.cards).includes(aerialMappers);
    expect(selectCard.cards).includes(dirigibles);
  });
});
