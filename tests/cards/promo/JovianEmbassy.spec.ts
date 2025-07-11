import {expect} from 'chai';
import {JovianEmbassy} from '../../../src/server/cards/promo/JovianEmbassy';
import {testGame} from '../../TestGame';

describe('JovianEmbassy', () => {
  it('Should play', () => {
    const card = new JovianEmbassy();
    const [/* game */, player] = testGame(2);

    card.play(player);
    expect(player.terraformRating).to.eq(21);
    expect(card.getVictoryPoints(player)).to.eq(1);
  });
});
