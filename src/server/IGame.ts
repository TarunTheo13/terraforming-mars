import {MarsBoard} from './boards/MarsBoard';
import {CardName} from '../common/cards/CardName';
import {ClaimedMilestone} from './milestones/ClaimedMilestone';
import {IColony} from './colonies/IColony';
import {Color} from '../common/Color';
import {FundedAward} from './awards/FundedAward';
import {IAward} from './awards/IAward';
import {IMilestone} from './milestones/IMilestone';
import {Space} from './boards/Space';
import {LogMessageBuilder} from './logs/LogMessageBuilder';
import {LogMessage} from '../common/logs/LogMessage';
import {Phase} from '../common/Phase';
import {IPlayer} from './IPlayer';
import {PlayerId, GameId, SpectatorId, SpaceId, isGameId} from '../common/Types';
import {AndThen, DeferredAction} from './deferredActions/DeferredAction';
import {Priority} from './deferredActions/Priority';
import {DeferredActionsQueue} from './deferredActions/DeferredActionsQueue';
import {SerializedGame} from './SerializedGame';
import {SpaceBonus} from '../common/boards/SpaceBonus';
import {TileType} from '../common/TileType';
import {Turmoil} from './turmoil/Turmoil';
import {AresData} from '../common/ares/AresData';
import {MoonData} from './moon/MoonData';
import {SeededRandom} from '../common/utils/Random';
import {PathfindersData} from './pathfinders/PathfindersData';
import {GameOptions} from './game/GameOptions';
import {CorporationDeck, PreludeDeck, ProjectDeck, CeoDeck} from './cards/Deck';
import {Tag} from '../common/cards/Tag';
import {Tile} from './Tile';
import {Logger} from './logs/Logger';
import {GlobalParameter} from '../common/GlobalParameter';
import {UnderworldData} from './underworld/UnderworldData';
import {OrOptions} from './inputs/OrOptions';
import {IStandardProjectCard} from './cards/IStandardProjectCard';

export interface Score {
  corporation: String;
  playerScore: number;
}

export interface IGame extends Logger {
  readonly id: GameId;
  readonly gameOptions: Readonly<GameOptions>;
  // Game-level data
  lastSaveId: number;
  rng: SeededRandom;
  spectatorId: SpectatorId | undefined;
  deferredActions: DeferredActionsQueue;
  createdTime: Date;
  gameAge: number; // Each log event increases it
  gameLog: Array<LogMessage>;
  undoCount: number; // Each undo increases it
  inputsThisRound: number;
  resettable: boolean;
  generation: number;
  readonly players: ReadonlyArray<IPlayer>;
  readonly playersInGenerationOrder: ReadonlyArray<IPlayer>;

  /**
   * Stores the state of each global parameter at the end of each generation.
   *
   * Used for rendering game-end statistics.
   */
  globalsPerGeneration: Array<Partial<Record<GlobalParameter, number>>>;
  phase: Phase;
  projectDeck: ProjectDeck;
  preludeDeck: PreludeDeck;
  ceoDeck: CeoDeck;
  corporationDeck: CorporationDeck;
  board: MarsBoard;
  activePlayer: IPlayer;
  claimedMilestones: Array<ClaimedMilestone>;
  milestones: Array<IMilestone>;
  fundedAwards: Array<FundedAward>;
  awards: Array<IAward>;
  // Expansion-specific data
  colonies: Array<IColony>;
  discardedColonies: Array<IColony>; // Not serialized
  turmoil: Turmoil | undefined;
  // True when resolving Turmoil phase. Does not need to be serialized since the turmoil phase isn't saved in between.
  inTurmoil: boolean;
  aresData: AresData | undefined;
  moonData: MoonData | undefined;
  pathfindersData: PathfindersData | undefined;
  underworldData: UnderworldData;

  // Card-specific data

  /* An optimization to see if anyone owns Mons Insurance */
  monsInsuranceOwner: IPlayer | undefined; // Not serialized
  /* For the promo Crash Site. */
  someoneHasRemovedOtherPlayersPlants: boolean;
  // Syndicate Pirate Raids
  syndicatePirateRaider?: PlayerId;
  /**
   * The spaces Gagarin Mobile Base has visited. The zeroeth element contains
   * its current location, and as it moves the new location is added to the front.
   */
  gagarinBase: Array<SpaceId>;
  /**
   * The spaces where a St. Joseph of Cupertino Mission's cathedrals are.
   */
  stJosephCathedrals: Array<SpaceId>;
  // Mars Nomads
  nomadSpace: SpaceId | undefined;
  /** When true, players may not trade for the rest of this generation. */
  tradeEmbargo: boolean;
  /** True when Behold The Emperor is in effect this coming Turmoil phase */
  beholdTheEmperor: boolean;
  /** Double Down: tracking when an action is due to double down. Does not need to be serialized. */
  inDoubleDown: boolean;
  /** If Vermin is in play and it has 10 or more animals */
  verminInEffect: boolean;
  /** If Exploitation of Venus is in effect */
  exploitationOfVenusInEffect: boolean;

  /** The set of tags available in this game. */
  readonly tags: ReadonlyArray<Tag>;
  /** Initiates the first research phase, which is when a player chooses their starting hand, corps and preludes. */
  gotoInitialResearchPhase(): void;
  gotoResearchPhase(): void;
  save(): void;
  serialize(): SerializedGame;
  isSoloMode() :boolean;
  // Retrieve a player by its id
  getPlayerById(id: PlayerId): IPlayer;
  defer<T>(action: DeferredAction<T>, priority?: Priority): AndThen<T>;
  milestoneClaimed(milestone: IMilestone): boolean;
  marsIsTerraformed(): boolean;
  lastSoloGeneration(): number;
  isSoloModeWin(): boolean;
  getAwardFundingCost(): number;
  fundAward(player: IPlayer, award: IAward): void;
  hasBeenFunded(award: IAward): boolean;
  allAwardsFunded(): boolean;
  allMilestonesClaimed(): boolean;
  hasPassedThisActionPhase(player: IPlayer): boolean;
  // Public for testing.
  incrementFirstPlayer(): void;
  // Only used in the prelude The New Space Race
  overrideFirstPlayer(newFirstPlayer: IPlayer): void;
  // The first player this generation
  readonly first: IPlayer;
  gameIsOver(): boolean;
  isDoneWithFinalProduction(): boolean;
  playerHasPassed(player: IPlayer): void;
  hasResearched(player: IPlayer): boolean;
  playerIsFinishedWithResearchPhase(player: IPlayer): void;
  /**
   * Called when a player has finished taking actions. It sets up
   * the next player, or moves to the production phase.
   */
  playerIsFinishedTakingActions(): void;
  /**
   * Returns true if the player may place a greenery tile.
   * Applicable only during final greenery placement.
   */
  canPlaceGreenery(player: IPlayer): boolean;
  /**
   * Called during final greenery placement when a player cannot or chooses not to place any more greeneries.
   */
  playerIsDoneWithGame(player: IPlayer): void;
  /**
   * Find the next player who might be able to place a final greenery and ask them.
   *
   * If nobody can add a greenery, end the game.
   */
  /* for testing */ takeNextFinalGreeneryAction(): void;
  /* for testing */ worldGovernmentTerraforming(): void;
  /* for World Government Advisor */
  worldGovernmentTerraformingInput(player: IPlayer): OrOptions;
  increaseOxygenLevel(player: IPlayer, increments: -2 | -1 | 1 | 2): void;
  getOxygenLevel(): number;
  increaseVenusScaleLevel(player: IPlayer, increments: -1 | 1 | 2 | 3): number;
  getVenusScaleLevel(): number;
  increaseTemperature(player: IPlayer, increments: -2 | -1 | 1 | 2 | 3): undefined;
  getTemperature(): number;
  getGeneration(): number;
  getPassedPlayers():ReadonlyArray<Color>;
  /**
   * Add `tile` to `space` for `player`. Triggers all effects that come with placing a tile.
   *
   * This only applies to the Mars board. See MoonExpansion.addTile for placing
   * a tile on The Moon.
   */
  addTile(player: IPlayer, space: Space, tile: Tile): void;
  /**
   * Add `tile` to `space` for `player` without triggering any effects.
   *
   * This only applies to the Mars board.
   */
  simpleAddTile(player: IPlayer, space: Space, tile: Tile): void;
  /**
   * Gives all the bonuses a player may gain when placing a tile on a space.
   *
   * This includes bonuses on the map, from oceans, Ares tiles, Turmoil, Colonies, etc.
   */
  grantPlacementBonuses(player: IPlayer, space: Space, coveringExistingTile?: boolean): void

  /**
   * Gives all the bonuses from a space on the map.
   */
  grantSpaceBonuses(player: IPlayer, space: Space): void;
  grantSpaceBonus(player: IPlayer, spaceBonus: SpaceBonus, count?: number): void;
  addGreenery(player: IPlayer, space: Space, shouldRaiseOxygen?: boolean): void;
  addCity(player: IPlayer, space: Space, cardName?: CardName | undefined): void;
  canAddOcean(): boolean;
  canRemoveOcean(): boolean;
  addOcean(player: IPlayer, space: Space): void;
  removeTile(spaceId: string): void;

  /**
   * Returns the Player holding this card, or throws.
   */
  getCardPlayerOrThrow(name: CardName): IPlayer;
  /**
   * Returns the Player holding this card, or returns undefined.
   */
  getCardPlayerOrUndefined(name: CardName): IPlayer | undefined;
  /**
   * Returns the list of standard project cards used in this game, sorted by cost.
   */
  getStandardProjects(): Array<IStandardProjectCard>;

  log(message: string, f?: (builder: LogMessageBuilder) => void, options?: {reservedFor?: IPlayer}): void;
  discardForCost(cardCount: 1 | 2, toPlace: TileType): number;
  expectedPurgeTimeMs(): number;
  logIllegalState(description: string, metadata: {}): void;

  /**
   * Drafting before the first generation goes through up to 4 iterations:
   * 1. first 5 project cards,
   * 2. second 5 project cards
   * 3. [optional] preludes
   * 4. [optional] CEOs
   */
  initialDraftIteration: number;
  /**
   * When drafting n cards, this counts the each step in the draft.
   * When players get all the cards, this is 1. After everybody drafts a card,
   * this is round 2.
   */
  draftRound: number;
  getPlayerAfter(player: IPlayer): IPlayer;
  getPlayerBefore(player: IPlayer): IPlayer;

  underworldDraftEnabled: boolean;
  getActionCount(): number;
}

export function isIGame(object: any): object is IGame {
  return object !== undefined && object.hasOwnProperty('id') && isGameId(object.id);
}
