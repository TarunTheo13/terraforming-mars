import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast, runAllActions} from '../../TestingUtils';
import {JunkVentures} from '../../../src/server/cards/community/JunkVentures';
import {IProjectCard} from '../../../src/server/cards/IProjectCard';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {TestPlayer} from '../../TestPlayer';
import {Ants} from '../../../src/server/cards/base/Ants';
import {Birds} from '../../../src/server/cards/base/Birds';
import {Capital} from '../../../src/server/cards/base/Capital';

describe('JunkVentures', () => {
  let card: JunkVentures;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new JunkVentures();
    [game, player] = testGame(2);
    player.playCorporationCard(card);
  });

  it('Cannot act', () => {
    expect(game.projectDeck.discardPile).is.empty;
    expect(card.canAct(player)).is.false;

    game.projectDeck.discard(game.projectDeck.drawOrThrow(game));
    expect(card.canAct(player)).is.false;

    game.projectDeck.discard(game.projectDeck.drawOrThrow(game));
    expect(card.canAct(player)).is.false;

    game.projectDeck.discard(game.projectDeck.drawOrThrow(game));
    expect(card.canAct(player)).is.true;
  });

  it('Can act', () => {
    const ants = new Ants();
    const birds = new Birds();
    const capital = new Capital();

    game.projectDeck.discardPile = [ants, birds, capital];

    cast(card.action(player), undefined);
    runAllActions(game);
    const selectCard = cast(player.popWaitingFor(), SelectCard<IProjectCard>);

    expect(selectCard.cards).to.have.members([ants, birds, capital]);
    selectCard.cb([birds]);
    expect(player.cardsInHand).deep.eq([birds]);

    expect(game.projectDeck.discardPile).to.have.members([ants, capital]);
  });
});
