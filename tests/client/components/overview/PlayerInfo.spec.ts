import {shallowMount} from '@vue/test-utils';
import {getLocalVue} from '../getLocalVue';
import {expect} from 'chai';
import {CardName} from '@/common/cards/CardName';
import PlayerInfo from '@/client/components/overview/PlayerInfo.vue';
import {PlayerViewModel, PublicPlayerModel} from '@/common/models/PlayerModel';
import {RecursivePartial} from '@/common/utils/utils';

describe('PlayerInfo', () => {
  it('Played card count test', () => {
    const thisPlayer: RecursivePartial<PublicPlayerModel> = {
      color: 'blue',
      tableau: [
        {name: CardName.HELION},
        {name: CardName.ACQUIRED_COMPANY},
        {name: CardName.BACTOVIRAL_RESEARCH},
      ],
      victoryPointsBreakdown: {
        total: 1,
      },
      tags: {},
    };
    const playerView: RecursivePartial<PlayerViewModel> = {
      thisPlayer: thisPlayer,
      id: 'playerid-foo',
      game: {
        gameOptions: {
          showTimers: false,
        },
      },
      players: [thisPlayer],
    };
    const playerInfo = shallowMount(PlayerInfo, {
      localVue: getLocalVue(),
      parentComponent: {
        methods: {
          getVisibilityState: () => {},
        },
      },
      propsData: {
        player: thisPlayer,
        playerView: playerView,
        playerIndex: 0,
      },
    });
    const test = playerInfo.find('div[class*="played-cards-count"]');
    expect(test.text()).to.eq('3');
  });
});
