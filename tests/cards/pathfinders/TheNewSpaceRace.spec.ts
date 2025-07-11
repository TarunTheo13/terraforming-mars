import {expect} from 'chai';
import {TheNewSpaceRace} from '../../../src/server/cards/pathfinders/TheNewSpaceRace';
import {IGame} from '../../../src/server/IGame';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {cast, doWait, runAllActions, setRulingParty} from '../../TestingUtils';
import {toName} from '../../../src/common/utils/utils';
import {testGame} from '../../TestGame';
import {AlliedBanks} from '../../../src/server/cards/prelude/AlliedBanks';
import {BiosphereSupport} from '../../../src/server/cards/prelude/BiosphereSupport';
import {AquiferTurbines} from '../../../src/server/cards/prelude/AquiferTurbines';
import {GalileanMining} from '../../../src/server/cards/prelude/GalileanMining';
import {HugeAsteroid} from '../../../src/server/cards/prelude/HugeAsteroid';
import {SelectInitialCards} from '../../../src/server/inputs/SelectInitialCards';
import {TestPlayer} from '../../TestPlayer';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {CardName} from '../../../src/common/cards/CardName';

describe('TheNewSpaceRace', () => {
  let card: TheNewSpaceRace;
  let player1: TestPlayer;
  let player2: TestPlayer;
  let player3: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new TheNewSpaceRace();
    [game, player1, player2, player3] = testGame(
      3, {
        turmoilExtension: true,
        preludeExtension: true,
        draftVariant: false,
        initialDraftVariant: false,
        skipInitialCardSelection: false,
      });
  });

  /*
   * For this test to work, you need a player with the prelude card in hand. That must be not the first player.
   * Set the game to have no draft.
   *
   * While moving through to the game phase, the first player will change, and there will be a change of ruling party.
   * Finally, that player will get a second action.
  */
  it('Should play', () => {
    player1.dealtPreludeCards = [new AlliedBanks(), new BiosphereSupport()];
    player2.dealtPreludeCards = [new AquiferTurbines(), card];
    player3.dealtPreludeCards = [new GalileanMining(), new HugeAsteroid()];

    const selectInitialCards1 = cast(player1.getWaitingFor(), SelectInitialCards);
    selectInitialCards1.options[0].cb([player1.dealtCorporationCards[0]]);
    selectInitialCards1.options[1].cb(player1.dealtPreludeCards);
    selectInitialCards1.options[2].cb([]);
    selectInitialCards1.cb(undefined);

    const selectInitialCards2 = cast(player2.getWaitingFor(), SelectInitialCards);
    selectInitialCards2.options[0].cb([player2.dealtCorporationCards[0]]);
    selectInitialCards2.options[1].cb(player2.dealtPreludeCards);
    selectInitialCards2.options[2].cb([]);
    selectInitialCards2.cb(undefined);

    const selectInitialCards3 = cast(player3.getWaitingFor(), SelectInitialCards);
    selectInitialCards3.options[0].cb([player3.dealtCorporationCards[0]]);
    selectInitialCards3.options[1].cb(player3.dealtPreludeCards);
    selectInitialCards3.options[2].cb([]);

    // Some assertions before the last cb.
    expect(game.playersInGenerationOrder).deep.eq([player1, player2, player3]);

    // Some cleanup before the last cb. These would be normally popped if the callbacks were done via inbound HTTP Request.
    // The cast() just confirms these are the expected SelectInitialCards
    cast(player1.popWaitingFor(), SelectInitialCards);
    cast(player2.popWaitingFor(), SelectInitialCards);
    cast(player3.popWaitingFor(), SelectInitialCards);

    // This will trigger everything.
    selectInitialCards3.cb(undefined);

    expect(game.playersInGenerationOrder).deep.eq([player2, player3, player1]);

    cast(player1.getWaitingFor(), undefined);
    cast(player3.getWaitingFor(), undefined);
    doWait(player2, OrOptions, (selectParty) => {
      expect(game.turmoil!.rulingParty.name).eq(PartyName.GREENS);
      selectParty.options[2].cb(); // 2 is Unity.
      expect(game.turmoil!.rulingParty.name).eq(PartyName.UNITY);
    });

    cast(player1.getWaitingFor(), undefined);
    cast(player3.getWaitingFor(), undefined);

    // Player2 is up, and will play its other prelude first.
    const next = cast(player2.getWaitingFor(), SelectCard);
    expect(player2.actionsTakenThisRound).eq(0);
    expect(next.cards.map(toName)).deep.eq([CardName.AQUIFER_TURBINES]);
  });

  it('Play during late game (e.g. Karen CEO)', () => {
    expect(player1.getTitaniumValue()).eq(3);
    setRulingParty(game, PartyName.UNITY);
    expect(player1.getTitaniumValue()).eq(4);

    // Some assertions before the last cb.
    expect(game.playersInGenerationOrder).deep.eq([player1, player2, player3]);

    cast(card.play(player2), undefined);
    runAllActions(game);

    expect(game.turmoil!.rulingParty.name).eq(PartyName.UNITY);
    const selectParty = cast(player2.popWaitingFor(), OrOptions);
    selectParty.options[3].cb(); // 3 is Greens
    expect(game.turmoil!.rulingParty.name).eq(PartyName.GREENS);

    expect(player1.getTitaniumValue()).eq(3);
  });
});
