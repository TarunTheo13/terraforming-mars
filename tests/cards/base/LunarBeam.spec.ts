import {expect} from 'chai';
import {LunarBeam} from '../../../src/server/cards/base/LunarBeam';
import {Resource} from '../../../src/common/Resource';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('LunarBeam', () => {
  let card: LunarBeam;
  let player: TestPlayer;

  beforeEach(() => {
    card = new LunarBeam();
    [/* game */, player] = testGame(1);
  });

  it('Can play', () => {
    player.production.add(Resource.MEGACREDITS, -4);
    expect(card.canPlay(player)).is.not.true;

    player.production.add(Resource.MEGACREDITS, 1);
    expect(card.canPlay(player)).is.true;
  });

  it('Should play', () => {
    card.play(player);
    expect(player.production.megacredits).to.eq(-2);
    expect(player.production.heat).to.eq(2);
    expect(player.production.energy).to.eq(2);
  });
});
